import { IRound, IMatch, ITournamentInfo, ITeam, TournamentRounds, IGroup } from "./interfaces";
import { faker } from "@faker-js/faker";

const calculateTournamentRounds = (totalPlayers: number): TournamentRounds => {
    const teams = Math.ceil(totalPlayers / 2);
    const nextPowerOf2 = Math.pow(2, Math.ceil(Math.log2(teams)));
    const byes = nextPowerOf2 - teams;
    const rounds = Math.log2(nextPowerOf2);
    return {
      teams,
      byes,
      rounds,
      nextPowerOf2,
    };
  }
const convertMatchToRound = (matches: any[]): IRound[] => {
  const round: IRound[] = [];
  let seedIndex = 0;
  matches.map(match => {
    if (match.roundKey === undefined) return [];
    if (round.length < match.roundKey + 1) {
      seedIndex = 0;
      round.push({
        title: `Round ${match.roundKey + 1}`,
        seeds: [],
        key: match.roundKey + 1,
        index: match.roundKey + 1
      })
    }
    // Transform the match to include teams property if it doesn't exist
    const transformedMatch: IMatch = {
      ...match,
      teams: match.teams || [
        {
          uuid: match.home_team?.uuid || '',
          name: match.home_team?.name || '',
          alias: match.home_team?.alias || '',
          players: match.home_team?.players || []
        },
        {
          uuid: match.away_team?.uuid || '',
          name: match.away_team?.name || '',
          alias: match.away_team?.alias || '',
          players: match.away_team?.players || []
        }
      ]
    };
    round[match.roundKey].seeds.push({
      ...transformedMatch,
      seed_index: seedIndex
    })
    seedIndex++;
  })
  if (round.length) {
    round[round.length - 1].title = `Final`
  }
  if (round.length >= 2) {
    round[round.length - 2].title = `Semifinal`
  }
  console.log(round, "ROUND");
  return round;
}
  

const generateFirstRound = (teams: ITeam[], info?: ITournamentInfo) =>{
    const { byes, teams: totalTeam } = calculateTournamentRounds(teams?.length * 2);
    const teamCompete = totalTeam - byes;
    let rounded: IRound[] = [];
    let seedIndex = 0;
    teams.map((team, i) => {
      // randomize court based on index 
      const courtIndex = i % (info?.courts.length || 1);
      const tempTeamUuid = faker.string.uuid();
      // start adding compete team
      if (i < teamCompete) {
        if (!rounded.length) {
          rounded.push({
            title: "Round 1", 
            key: i,
            seeds: [{
              id: faker.string.uuid(),
              court: info?.courts[courtIndex]?.name,
              court_uuid: info?.courts[courtIndex]?.uuid,
              seed_index: seedIndex,
              date: faker.date.between({from:info?.startDate || new Date(), to: info?.endDate || new Date()}).toISOString(),
              teams: [{
                ...team,
                name: team.name || "",
                alias: team.alias || "",
                teamKey: tempTeamUuid,
                uuid: tempTeamUuid,
                id: i,
                players: team.players?.map(p => ({
                  uuid: p.uuid || "",
                  id: p.uuid || "",
                  name: p.name || "",
                  media_url: p.media_url || "",
                })) || [],
              }]
            }]
          })
          seedIndex++;
        } else {
          const matchIdx = rounded[0].seeds.findIndex((sd: IMatch) => sd.teams.length < 2)
          if (matchIdx >= 0) { 
            rounded[0].seeds[matchIdx].teams.push({
              ...team,
              name: team.name || "",
              alias: team.alias || "",
              teamKey: tempTeamUuid,
              uuid: tempTeamUuid,
              id: i,
              players: team.players?.map(p => ({
                uuid: p.uuid || "",
                id: p.uuid || "",
                name: p.name || "",
                media_url: p.media_url || "",
              })) || [],
            })
          } else {
            rounded[0].seeds.push({
              id: faker.string.uuid(),
              court: info?.courts[courtIndex]?.name,
              seed_index: seedIndex,
              court_uuid: info?.courts[courtIndex]?.uuid,
              date: faker.date.between({from:info?.startDate || "", to: info?.endDate ||""}).toISOString(),
              teams: [{
                ...team,
                name: team.name || "",
                alias: team.alias || "",
                teamKey: tempTeamUuid,
                uuid: tempTeamUuid,
                id: i,
                players: team.players?.map(p => ({
                  uuid: p.uuid || "",
                  id: p.uuid || "",
                  name: p.name || "",
                  media_url: p.media_url || "",
                })) || [],
              }]
            })
            seedIndex++;
          }
        }
      }
      // end of adding more compete teams
      // start adding bye's team
      else {
        rounded[0].seeds.push({
          id: faker.string.uuid(),
          court: info?.courts[courtIndex]?.name,
          court_uuid: info?.courts[courtIndex]?.uuid,
          seed_index: seedIndex,
          date: faker.date.between({from:info?.startDate || "", to: info?.endDate ||""}).toISOString(),
          teams: [{
            ...team,
            name: team.name || "",
            alias: team.alias || "",
            teamKey: tempTeamUuid,
            uuid: tempTeamUuid,
            id: i,
            players: team.players?.map(p => ({
              uuid: p.uuid || "",
              id: p.uuid || "",
              name: p.name || "",
              media_url: p.media_url || "",
            })) || [],
          }]
        })
        rounded[0].seeds[rounded[0].seeds.length - 1].teams.push({ uuid: faker.string.uuid(), teamKey: faker.string.uuid(), name: "BYE", players: [{ uuid: faker.string.uuid(), name: "-" }, { uuid: faker.string.uuid(), name: "-" }] })
        seedIndex++;
      }
    })
  return rounded;
}
function generateAllRounds(firstRound: IRound, info?: ITournamentInfo): IRound[] {
  const rounds: IRound[] = [firstRound];
  let currentRound = firstRound;
  
  // Calculate total rounds needed based on first round seeds (power of 2)
  const totalRounds = Math.log2(currentRound.seeds.length * 2);
  
  for (let roundNum = 1; roundNum < totalRounds; roundNum++) {
    const nextRound = generateNextRound(currentRound, roundNum, info);
    rounds.push(nextRound);
    currentRound = nextRound;
  }
  
  return rounds;
}

function generateNextRound(currentRound: IRound, roundNum: number, info?: ITournamentInfo): IRound {
  const nextRoundKey = currentRound.key + 1;
  const seeds: IMatch[] = [];
  
  // Create half as many seeds as previous round
  const seedCount = currentRound.seeds.length / 2;
  
  for (let i = 0; i < seedCount; i++) {
    const prevSeeds1 = currentRound.seeds.slice(i * 2, (i + 1) * 2)[0]
    const prevSeeds2 = currentRound.seeds.slice(i * 2, (i + 1) * 2)[1]
    
    const team1 = prevSeeds1.teams.find( d => d.name === "BYE") ? prevSeeds1.teams.find( d => d.name !== "BYE") || createTBDTeam() : createTBDTeam();
    const team2 = prevSeeds2.teams.find(d => d.name === "BYE") ? prevSeeds2.teams.find(d => d.name !== "BYE") || createTBDTeam() : createTBDTeam();
    const courtIndex = faker.number.int({ min: 1, max: info?.courts.length || 1 }) - 1;
    seeds.push({
      id: faker.string.uuid(),
      date: faker.date.between({from:info?.startDate || "", to: info?.endDate ||""}).toISOString(),
      court: info?.courts[courtIndex]?.name,
      court_uuid: info?.courts[courtIndex]?.uuid,
      seed_index: i,
      teams: [{...team1, teamKey: faker.string.uuid()}, {...team2, teamKey: faker.string.uuid()}],
    });
  }
  
  return {
    title: `Round ${nextRoundKey + 1}`,
    key: nextRoundKey,
    seeds
  };
}

function createTBDTeam(): ITeam {
  return {
    uuid: faker.string.uuid(),
    teamKey: faker.string.uuid(),
    name: "TBD",
    alias: "TBD",
    players: [
      { uuid: faker.string.uuid(), name: "To Be Determined" ,alias: "TBD"},
      { uuid: faker.string.uuid(), name: "To Be Determined" ,alias: "TBD"}
    ]
  };
}
function validateNoDuplicateTeamsInRounds(rounds: IRound[]): {valid: boolean, message: string} {
  for (const round of rounds) {
    const teamIdsInRound = new Set<String>();
    
    for (const seed of round.seeds) {
      const multiBye = seed.teams.filter(t => t.name === "BYE").length
      if (multiBye >= 2) {
        return {
            valid: false,
            message: `Each seed can't have multiple BYE's teams`
          };
      }
      for (const team of seed.teams) {
        if (teamIdsInRound.has(team.uuid) && !["BYE", "TBD"].includes(team.uuid)) {
          return {
            valid: false,
            message: `Duplicate team ID ${team.id} found in ${round.title} (Round ${round.key + 1})`
          };
        }
        teamIdsInRound.add(team.uuid);
      }
    }
  }
  
  return {
    valid: true,
    message: "All rounds already have unique teams within each round"
  };
}
const isGeometric = (n: number) => n > 0 && (n & (n - 1)) === 0;
const restGeometric = (n: number) => n <= 0 ? 0 : n - 2 ** Math.floor(Math.log2(n));

const generateGroups = (teams: ITeam[], total: number): IGroup[] => {
  return Array.from({ length: total }, (_, i) => ({
    name: `Group ${String.fromCharCode(65 + i)}`,
    groupKey: i,
    
    teams: teams.slice(
      Math.floor((i * teams.length) / total),
      Math.floor(((i + 1) * teams.length) / total)
    ),
  }));;
}

const setupGroupKnockoutMatch = (totalGroup: number):ITeam[] => {
  const teamsKnockout: ITeam[] = Array.from({ length: totalGroup }, (_, i) => {
    const TBDteam: ITeam = createTBDTeam()
    const TBDPlayers: ITeam['players'] = TBDteam.players?.map((p, pidx) => ({
      id: pidx,
      uuid: p.uuid,
      name: p.name || "",
    })) || []

    return {
      ...TBDteam,
      id: i,
      name: `Group ${String.fromCharCode(65 + i)}`,
      alias: `TBD`,
      players: TBDPlayers,
      group_index: i,
      group_position: 1
    }
  });
  if (!isGeometric(totalGroup)) {
    const restGeometricTeams = restGeometric(totalGroup);
    for (let i = 0; i < restGeometricTeams; i++) {
      const TBDteam: ITeam = createTBDTeam()
      const TBDPlayers: ITeam['players'] = TBDteam.players?.map((p, pidx) => ({
        id: pidx,
        uuid: p.uuid,
        name: p.name || "",
      })) || []

      teamsKnockout.push({
        ...TBDteam,
        id: Number("2"+i),
        name: `Runner Up ${i + 1}`,
        alias: `TBD`,
        players: TBDPlayers,
        group_index: -1,
        group_position: i+1
      })
    }
  }
  // randomize teams
  teamsKnockout.sort(() => Math.random() - 0.5);
  return teamsKnockout;
}
const getAllKnockoutMatches = (rounds: IRound[]): IMatch[] => {
  const allKnockoutMatches: IMatch[] = rounds.map((r, rIdx) => r.seeds.map(m => ({
    ...m,
    roundKey: rIdx,
  }))).flat();
  return allKnockoutMatches;
}

const generateGroupMatches = (groups: IGroup[], info?: ITournamentInfo):IMatch[] => {
  const matches: IMatch[] = [];
  // create match for all teams, each team will face other teams in same group
  groups.forEach(group => {
    const teams = group.teams;
    for (let i = 0; i < teams.length; i++) {
      for (let j = i + 1; j < teams.length; j++) {
        const match: IMatch = {
          id: faker.string.uuid(),
          court: "",
          court_uuid: "",
          groupKey: group.groupKey,
          date: faker.date.between({from:info?.startDate || "", to: info?.endDate ||""}).toISOString(),
          teams: [teams[i], teams[j]]
        }
        matches.push(match)
      }
    }
  })
  return matches;
}

export default {
  calculateTournamentRounds,
  convertMatchToRound,
  createTBDTeam,
  generateAllRounds,
  generateFirstRound,
  validateNoDuplicateTeamsInRounds,
  setupGroupKnockoutMatch,
  generateGroups,
  generateGroupMatches,
  getAllKnockoutMatches
}