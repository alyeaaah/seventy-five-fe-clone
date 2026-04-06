import { Bracket, ISeedProps } from 'react-brackets';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { IRound, ITeam } from '../interfaces';
import { CustomMatch } from './CustomMatch';

export const DraggableBracket = ({
  rounds,
  readOnly,
  setRounds,
  onSeedClick,
  className
}: {
  rounds: IRound[];
  readOnly?: boolean,
  setRounds: (r: IRound[]) => void;
  onSeedClick?: (seed: ISeedProps['seed'], seedIndex: number, roundIndex: number) => void;
  className?: string;
}) => {

  const handleTeamDrop = (
    roundIndex: number,
    matchIndex: number,
    movedTeam: ITeam,
    position: 'home' | 'away'
  ) => {
    if (readOnly) {
      return;
    }
    let updatedRounds = [...rounds];
    const teamIdx = position === 'home' ? 0 : 1
    let sourceTeam: { roundIndex: number, matchIndex: number, teamIdx: number, team?: ITeam } | undefined;
    updatedRounds.map((round, roundIdx) => {
      round.seeds.map((match, matchIdx) => {
        match.teams.map((team, teamIdx) => {
          if (team.uuid == movedTeam.uuid && team.teamKey === movedTeam.teamKey) {
            sourceTeam = {
              roundIndex: roundIdx,
              matchIndex: matchIdx,
              teamIdx: teamIdx,
              team: movedTeam
            }
          }
        })
      })
    })

    let targetedTeam: { roundIndex: number, matchIndex: number, teamIdx: number, team?: ITeam } | undefined;
    updatedRounds.map((round, roundIdx) => {
      if (roundIdx == roundIndex) {
        round.seeds.map((match, matchIdx) => {
          if (matchIdx == matchIndex) {
            targetedTeam = {
              roundIndex: roundIdx,
              matchIndex: matchIdx,
              teamIdx: teamIdx,
              team: match.teams[teamIdx]
            }
          }
        })
      }
    })

    if (!!sourceTeam && !!targetedTeam && targetedTeam.team && sourceTeam.team) {
      const nextToTeamIdx = targetedTeam.teamIdx % 2 == 0 ? targetedTeam.teamIdx + 1 : targetedTeam.teamIdx - 1;
      const neighborTeam = updatedRounds[sourceTeam.roundIndex].seeds[sourceTeam.matchIndex].teams[nextToTeamIdx];
      if (neighborTeam.name == "BYE" && sourceTeam.team.name == "BYE") {
        return;
      }
      updatedRounds[sourceTeam.roundIndex].seeds[sourceTeam.matchIndex].teams[sourceTeam.teamIdx] = targetedTeam.team;

      updatedRounds[targetedTeam.roundIndex].seeds[targetedTeam.matchIndex].teams[targetedTeam.teamIdx] = sourceTeam.team;
    }
    const finalizedRounds = finalizeRound(JSON.parse(JSON.stringify(updatedRounds)));
    setRounds(finalizedRounds);
  };

  const finalizeRound = (rounds: IRound[]): IRound[] => {
    const tempRounds = JSON.parse(JSON.stringify(rounds)) as IRound[];
    // Loop all matches in round 0
    tempRounds[0].seeds.forEach((match, matchIndex) => {
      // If match contains BYE teams
      const hasByeTeam = match.teams.some(team => team.name === "BYE");
      const byeTeamIndex = match.teams.findIndex(team => team.name === "BYE");
      const nonByeTeamIndex = byeTeamIndex === 1 ? 0 : 1;
      if (hasByeTeam) {
        const roundIndex = 1;
        const seedIndex = Math.floor(matchIndex / 2);
        const isHomeTeam = matchIndex % 2 === 0;
        const targetPosition = isHomeTeam ? 0 : 1;
        tempRounds[roundIndex].seeds[seedIndex].teams[targetPosition] = tempRounds[0].seeds[matchIndex].teams[nonByeTeamIndex] as ITeam;
      } else {
        // No BYE team, keep match & teams as is
        // No changes needed
      }
    });

    return JSON.parse(JSON.stringify(tempRounds));
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <Bracket
        rounds={rounds}
        bracketClassName={`bracket-container ${className}`}
        key={"bracket"}
        roundTitleComponent={(e) => {
          return <div className='text-lg font-bold' key={e.toString()}>{e.toString()}</div>
        }}
        roundClassName='bracket-round text-emerald-800'
        renderSeedComponent={(props) => {
          let round: 'final' | 'semi final' | undefined;
          if (props.roundIndex == (rounds.length - 1)) {
            round = "final";
          } else if (props.roundIndex == (rounds.length - 2)) {
            round = "semi final";
          }
          // Create a stable unique key using roundIndex, seedIndex, and match data
          const seedKey = `round-${props.roundIndex}-seed-${props.seedIndex}-match-${props.seed?.id || props.seedIndex}`;
          return (
            <CustomMatch {...props} onDrop={handleTeamDrop} round={round} key={seedKey} onSeedClick={onSeedClick} readOnly={readOnly} />
          )
        }}
      />
    </DndProvider>
  );
};
