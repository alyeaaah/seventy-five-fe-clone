import { useState } from "react";
import { ITeam } from "../TournamentDrawing/interfaces";
import { DrawingTeamsProps, Match } from "./interface";
import { DraggableTeam } from "./DraggableTeam";
import { HTML5Backend } from "react-dnd-html5-backend";
import { DndProvider } from "react-dnd";
import { IconVS } from "@/assets/images/icons";
import moment from "moment";

export const DrawingTeams: React.FC<DrawingTeamsProps> = ({
  data: matches,
  onMatchClicked,
  onTeamsChanged,
  draggable,
  scores
}) => {
  // Handle team drop
  const handleTeamDrop = (draggedTeam: ITeam, targetTeam: ITeam) => {
    // Find which matches contain these teams
    let draggedMatchIndex = -1;
    let draggedTeamPosition: 'home_team' | 'away_team' = 'home_team';
    let targetMatchIndex = -1;
    let targetTeamPosition: 'home_team' | 'away_team' = 'home_team';

    matches.forEach((match, index) => {
      if (match.home_team?.uuid === draggedTeam.uuid) {
        draggedMatchIndex = index;
        draggedTeamPosition = 'home_team';
      } else if (match.away_team?.uuid === draggedTeam.uuid) {
        draggedMatchIndex = index;
        draggedTeamPosition = 'away_team';
      }

      if (match.home_team?.uuid === targetTeam.uuid) {
        targetMatchIndex = index;
        targetTeamPosition = 'home_team';
      } else if (match.away_team?.uuid === targetTeam.uuid) {
        targetMatchIndex = index;
        targetTeamPosition = 'away_team';
      }
    });

    if (draggedMatchIndex === -1 || targetMatchIndex === -1) return;

    // Create new matches array with swapped teams
    const newMatches = [...matches];

    // Swap the teams
    const temp = newMatches[draggedMatchIndex][draggedTeamPosition];
    newMatches[draggedMatchIndex][draggedTeamPosition] = newMatches[targetMatchIndex][targetTeamPosition];
    newMatches[targetMatchIndex][targetTeamPosition] = temp;

    // Also swap the team UUIDs to keep consistency
    newMatches[draggedMatchIndex][`${draggedTeamPosition}_uuid`] = newMatches[draggedMatchIndex][draggedTeamPosition].uuid;
    newMatches[targetMatchIndex][`${targetTeamPosition}_uuid`] = newMatches[targetMatchIndex][targetTeamPosition].uuid;

    // Notify parent of changes
    if (onTeamsChanged) {
      onTeamsChanged(newMatches);
    }
  };

  // Handle match click
  const handleMatchClick = (match: Match) => {
    if (onMatchClicked) {
      onMatchClicked(match);
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="space-y-4">
        {matches.map((match, index) => {
          const matchScores = scores?.filter((score) => score.match_uuid === match.uuid)?.sort((a, b) => b.set - a.set);
          const currentSetScores = !!matchScores?.length ? matchScores[0] : undefined;
          const currentGameScores = !!matchScores?.length && matchScores.length > 1 ? matchScores[1] : undefined;
          return (<div
            key={match.uuid || index}
            className="p-3 border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => handleMatchClick(match)}
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm">
                <strong className="text-emerald-800">Match {index + 1}</strong> 🎾 <span className="text-xs ">{match.court ? match.court + "" : ''}</span>
                {!match.uuid && <span className="text-xs font-medium px-2 py-1 bg-warning ml-1 rounded">
                  Unsaved
                </span>}
              </span>
              <div>
                <span className="text-xs mr-2">{moment(match.date).format('ddd, DD MMM YYYY HH:mm')}</span>
                <span className="text-xs font-medium px-2 py-1 bg-gray-100 rounded">
                  {match.status}
                </span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between items-center border rounded-lg">
              <DraggableTeam
                key={match.home_team.uuid}
                team={match.home_team}
                onDrop={handleTeamDrop}
                draggable={draggable}
                isAway={false}
              />
              <div className="flex items-center justify-center space-x-2">
                {
                  currentSetScores && currentGameScores &&
                  <div className={`flex flex-col items-center justify-between text-xs mr-1 space-y-2`}>
                    {<div className='border border-emerald-800 rounded-md w-[24px] text-center text-emerald-800'>{currentGameScores?.game_score_home || 0}</div>}
                    {<div className='border border-emerald-800 rounded-md bg-emerald-800 text-white w-[24px] text-center'>{currentSetScores?.prev?.set_score_home || 0}</div>}
                  </div>
                }
                <IconVS className="w-12 h-8" />
                {
                  currentSetScores && currentGameScores &&
                  <div className={`flex flex-col items-center justify-between text-xs mr-1 space-y-2`}>
                    {<div className='border border-emerald-800 rounded-md w-[24px] text-center text-emerald-800'>{currentGameScores?.game_score_away || 0}</div>}
                    {<div className='border border-emerald-800 rounded-md bg-emerald-800 text-white w-[24px] text-center'>{currentSetScores?.prev?.set_score_away || 0}</div>}
                  </div>
                }
              </div>
              {match.away_team && (
                <DraggableTeam
                  key={match.away_team.uuid}
                  isAway={true}
                  team={match.away_team}
                  onDrop={handleTeamDrop}
                  draggable={draggable}
                />
              )}
            </div>
          </div>);
        }
        )}
      </div>
    </DndProvider>
  );
};
