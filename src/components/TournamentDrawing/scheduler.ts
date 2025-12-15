import { IMatch, ITeam, ITournamentInfo } from "./interfaces";

interface TimeSlot {
  time: Date;
  courtUuid: string;
  courtName: string;
}

interface CourtOccupancy {
  courtUuid: string;
  occupiedUntil: Date;
}

interface ScheduleParams {
  matches: IMatch[];
  info: ITournamentInfo;
}

interface TeamSchedule {
  teamUuid: string;
  lastMatchEndTime: Date;
}

/**
 * Generates and assigns schedule times for tournament matches
 * Handles both group stage and knockout phase matches
 * Ensures teams don't play simultaneously or consecutively
 */
export const assignSchedule = (params: ScheduleParams): IMatch[] => {
  const { matches, info } = params;
  const { startDate, endDate, courts } = info;

  // Configuration - can be adjusted based on needs
  const matchDuration = 40; // 30 min game + 10 min spare time
  const minRestTime = 20; // Minimum 20 min rest between matches for same team

  // Separate group stage and knockout matches
  const groupMatches = matches.filter(m => m.groupKey !== undefined);
  const knockoutMatches = matches.filter(m => m.roundKey !== undefined);

  // Sort knockout matches by round (lowest round first)
  const sortedKnockoutMatches = [...knockoutMatches].sort((a, b) => {
    return (a.roundKey || 0) - (b.roundKey || 0);
  });

  // Generate available time slots for both days
  const day1Slots = generateTimeSlots(startDate, courts, true, matchDuration); // true = first day with ceremony
  const day2Slots = generateTimeSlots(endDate, courts, false, matchDuration);
  const allSlots = [...day1Slots, ...day2Slots];

  // Shuffle group matches for random assignment
  const shuffledGroupMatches = shuffleArray([...groupMatches]);

  // Track team schedules to avoid conflicts
  const teamSchedules: Map<string, TeamSchedule> = new Map();
  const scheduledMatches: IMatch[] = [];
  const courtOccupancy: Map<string, Date> = new Map(); // Track when each court becomes free

  // Assign slots to group matches first (randomly, with conflict checking)
  for (const match of shuffledGroupMatches) {
    const slot = findAvailableSlot(
      allSlots,
      0, // Always search from beginning to fill earliest slots
      match,
      teamSchedules,
      courtOccupancy,
      minRestTime
    );

    if (!slot) {
      console.warn('Could not find available slot for match:', match);
      continue;
    }

    const scheduledMatch = {
      ...match,
      time: slot.timeSlot.time.toISOString(),
      court: slot.timeSlot.courtName,
      court_uuid: slot.timeSlot.courtUuid,
    };

    scheduledMatches.push(scheduledMatch);
    
    // Update team schedules
    updateTeamSchedules(teamSchedules, match.teams, slot.timeSlot.time, matchDuration);
    
    // Update court occupancy - court is occupied until match ends
    const matchEndTime = new Date(slot.timeSlot.time.getTime() + matchDuration * 60000);
    courtOccupancy.set(slot.timeSlot.courtUuid, matchEndTime);
  }

  // Assign slots to knockout matches (in order, after group stage)
  for (const match of sortedKnockoutMatches) {
    const slot = findAvailableSlot(
      allSlots,
      0, // Always search from beginning to find earliest available slot
      match,
      teamSchedules,
      courtOccupancy,
      minRestTime
    );

    if (!slot) {
      console.warn('Could not find available slot for match:', match);
      continue;
    }

    const scheduledMatch = {
      ...match,
      time: slot.timeSlot.time.toISOString(),
      court: slot.timeSlot.courtName,
      court_uuid: slot.timeSlot.courtUuid,
    };

    scheduledMatches.push(scheduledMatch);
    
    // Update team schedules
    updateTeamSchedules(teamSchedules, match.teams, slot.timeSlot.time, matchDuration);
    
    // Update court occupancy - court is occupied until match ends
    const matchEndTime = new Date(slot.timeSlot.time.getTime() + matchDuration * 60000);
    courtOccupancy.set(slot.timeSlot.courtUuid, matchEndTime);
  }

  return scheduledMatches;
};

/**
 * Finds the next available slot that doesn't conflict with team schedules or court occupancy
 */
const findAvailableSlot = (
  allSlots: TimeSlot[],
  startIndex: number,
  match: IMatch,
  teamSchedules: Map<string, TeamSchedule>,
  courtOccupancy: Map<string, Date>,
  minRestTime: number = 20 // Minimum rest time in minutes between matches for same team
): { timeSlot: TimeSlot; index: number } | null => {
  for (let i = startIndex; i < allSlots.length; i++) {
    const slot = allSlots[i];
    
    // Check if court is available (not occupied by another match)
    const courtFreeTime = courtOccupancy.get(slot.courtUuid);
    if (courtFreeTime && slot.time < courtFreeTime) {
      continue; // Court is still occupied
    }
    
    // Check if both teams are available at this time
    const teamsAvailable = match.teams.every(team => {
      const schedule = teamSchedules.get(team.uuid);
      if (!schedule) return true;
      
      // Team needs minimum rest time after their previous match ends
      const minStartTime = new Date(schedule.lastMatchEndTime.getTime() + minRestTime * 60000);
      return slot.time >= minStartTime;
    });

    if (teamsAvailable) {
      return { timeSlot: slot, index: i };
    }
  }

  return null;
};

/**
 * Updates team schedules after assigning a match
 * @param matchDuration - Duration in minutes for the match (game time + spare time)
 */
const updateTeamSchedules = (
  teamSchedules: Map<string, TeamSchedule>,
  teams: ITeam[],
  matchStartTime: Date,
  matchDuration: number = 40 // Default: 30 min game + 10 min spare time
): void => {
  const matchEndTime = new Date(matchStartTime.getTime() + matchDuration * 60000);

  teams.forEach(team => {
    teamSchedules.set(team.uuid, {
      teamUuid: team.uuid,
      lastMatchEndTime: matchEndTime,
    });
  });
};

/**
 * Generates all available time slots for a given day
 * Now uses configurable intervals
 * @param matchDuration - Duration in minutes for validation purposes
 */
const generateTimeSlots = (
  date: Date,
  courts: { uuid: string; name: string }[],
  isFirstDay: boolean,
  matchDuration: number = 40 // 30 min game + 10 min spare time
): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);

  // Define session times
  const morningSessions = { start: 7, end: 11 }; // 07:00-11:00
  const eveningSessions = { start: 15, end: 23 }; // 15:00-23:00
  const lastStartTime = 22.5; // 22:30 (22.5 hours)
  const intervalMinutes = 10; // 10-minute intervals

  // Morning session slots
  let startHour = morningSessions.start;
  if (isFirstDay) {
    startHour += 1; // Add 1 hour for ceremonial on first day
  }

  // Generate morning slots
  for (let hour = startHour; hour < morningSessions.end; hour++) {
    for (let minute = 0; minute < 60; minute += intervalMinutes) {
      const timeInHours = hour + minute / 60;
      if (timeInHours + matchDuration / 60 <= morningSessions.end) {
        for (const court of courts) {
          const slotTime = new Date(dayStart);
          slotTime.setHours(hour, minute, 0, 0);
          slots.push({
            time: slotTime,
            courtUuid: court.uuid,
            courtName: court.name,
          });
        }
      }
    }
  }

  // Generate evening slots
  for (let hour = eveningSessions.start; hour < eveningSessions.end; hour++) {
    for (let minute = 0; minute < 60; minute += intervalMinutes) {
      const timeInHours = hour + minute / 60;
      // No game starts after 22:30
      if (timeInHours <= lastStartTime) {
        for (const court of courts) {
          const slotTime = new Date(dayStart);
          slotTime.setHours(hour, minute, 0, 0);
          slots.push({
            time: slotTime,
            courtUuid: court.uuid,
            courtName: court.name,
          });
        }
      }
    }
  }

  return slots;
};

/**
 * Fisher-Yates shuffle algorithm for random array shuffling
 */
const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};
