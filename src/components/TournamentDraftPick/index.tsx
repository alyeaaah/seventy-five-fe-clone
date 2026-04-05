import React, { useState } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Button from '../Base/Button';
import Lucide from '../Base/Lucide';

export enum PlayerDraftStatus {
  AVAILABLE = 'AVAILABLE',
  PICKING = 'PICKING',
  PICKED = 'PICKED'
}

export enum PlayerType {
  SEEDED = 'seeded',
  REGULAR = 'reguler'
}

export interface DragItem {
  player: IPlayerDraft;
  type: PlayerType;
  index: number;
}

export interface IPlayerDraft {
  id: number;
  uuid: string;
  name: string;
  nickname?: string;
  username?: string;
  email?: string;
  position: number;
  team_uuid?: string;
  seeded: boolean;
  status: PlayerDraftStatus;
}

interface TournamentDraftPickProps {
  tournamentUuid: string;
  players: { reguler: IPlayerDraft[], seeded: IPlayerDraft[] };
  onChange: (players: { reguler: IPlayerDraft[], seeded: IPlayerDraft[] }) => void;
}

export const TournamentDraftPickComponent = ({ tournamentUuid, players, onChange }: TournamentDraftPickProps) => {
  const seededPlayers = players.seeded.sort((a, b) => a.position - b.position);
  const regularPlayers = players.reguler.sort((a, b) => a.position - b.position);

  const movePlayer = (draggedPlayer: IPlayerDraft, draggedType: PlayerType, draggedIndex: number, targetPlayer: IPlayerDraft, targetType: PlayerType, targetIndex: number) => {
    const newPlayers = { ...players };

    // Remove player from original position
    if (draggedType === PlayerType.SEEDED) {
      newPlayers.seeded = [...newPlayers.seeded];
      newPlayers.seeded.splice(draggedIndex, 1);
    } else {
      newPlayers.reguler = [...newPlayers.reguler];
      newPlayers.reguler.splice(draggedIndex, 1);
    }

    // Update player's seeded field based on target type
    const updatedPlayer = {
      ...draggedPlayer,
      seeded: targetType === PlayerType.SEEDED
    };

    // Add player to new position
    if (targetType === PlayerType.SEEDED) {
      newPlayers.seeded = [...newPlayers.seeded];
      newPlayers.seeded.splice(targetIndex, 0, updatedPlayer);
    } else {
      newPlayers.reguler = [...newPlayers.reguler];
      newPlayers.reguler.splice(targetIndex, 0, updatedPlayer);
    }

    // Update positions for all affected players
    newPlayers.seeded = newPlayers.seeded.map((player, index) => ({
      ...player,
      position: index + 1
    }));

    newPlayers.reguler = newPlayers.reguler.map((player, index) => ({
      ...player,
      position: index + 1
    }));

    onChange(newPlayers);
  };

  const movePlayerUp = (player: IPlayerDraft, type: PlayerType, index: number) => {
    if (index === 0) return; // Already at top

    const currentPlayers = type === PlayerType.SEEDED ? seededPlayers : regularPlayers;
    const targetPlayer = currentPlayers[index - 1];
    movePlayer(player, type, index, targetPlayer, type, index - 1);
  };

  const movePlayerDown = (player: IPlayerDraft, type: PlayerType, index: number) => {
    const currentPlayers = type === PlayerType.SEEDED ? seededPlayers : regularPlayers;
    if (index === currentPlayers.length - 1) return; // Already at bottom

    const targetPlayer = currentPlayers[index + 1];
    movePlayer(player, type, index, targetPlayer, type, index + 1);
  };

  const DraggablePlayerCard = ({ player, type, index }: { player: IPlayerDraft; type: PlayerType; index: number }) => {
    const [{ isDragging }, drag] = useDrag(() => ({
      type: 'PLAYER',
      item: { player, type, index },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }));

    const [{ isOver }, drop] = useDrop(() => ({
      accept: 'PLAYER',
      drop: (item: DragItem) => {
        if (item.player.uuid !== player.uuid) {
          movePlayer(item.player, item.type, item.index, player, type, index);
        }
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
      }),
    }));

    const combinedRef = (node: HTMLDivElement | null) => {
      drag(drop(node));
    };

    return (
      <div
        ref={combinedRef}
        className={` p-2 sm:p-4 mb-2 bg-white  border rounded-lg hover:shadow-md transition-shadow ${isDragging ? 'opacity-50' : ''
          } ${isOver ? 'border-blue-500 shadow-lg' : ''}`}
        style={{ cursor: 'move' }}
      >
        <div className="flex items-center justify-between flex-row ">
          <div className="flex items-center space-x-1 sm:space-x-3 h-ful">
            <div className=' h-full w-9 p-0 gap-1 flex flex-col sm:hidden justify-between'>
              <Button
                variant='outline-primary'
                className={`p-1 rounded-full disabled:!opacity-0 ring-opacity-100`}
                onClick={() => movePlayerUp(player, type, index)}
                disabled={index === 0}
              >
                <Lucide icon="ChevronUp" />
              </Button>
              <Button
                variant='outline-danger'
                className='p-1 rounded-full disabled:!opacity-0 ring-opacity-100'
                onClick={() => movePlayerDown(player, type, index)}
                disabled={type === PlayerType.SEEDED ? index === seededPlayers.length - 1 : index === regularPlayers.length - 1}
              >
                <Lucide icon="ChevronDown" />
              </Button>
            </div>
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-600">
              {player.position}
            </div>
            <div>
              <p className="font-medium text-gray-900">{player.name}</p>
              {player.username ? (
                <p className="text-sm text-gray-500">{(player.username && player.username !== player.name) ? player.username : player.email}</p>
              ) : <p className="text-sm text-gray-500">-</p>}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 text-xs font-medium rounded ${player.status === PlayerDraftStatus.AVAILABLE ? 'bg-green-100 text-green-800' :
              player.status === PlayerDraftStatus.PICKING ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
              {player.status}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const DroppableBoard = ({ type, children, boardId, isEmpty }: { type: PlayerType; children: React.ReactNode; boardId: string; isEmpty: boolean }) => {
    const [{ isOver }, drop] = useDrop(() => ({
      accept: 'PLAYER',
      drop: (item: DragItem) => {
        // Only allow dropping on empty board
        if (!isEmpty) return;

        // If dropping on empty board, add to the end
        const targetIndex = type === PlayerType.SEEDED ? seededPlayers.length : regularPlayers.length;
        const dummyTargetPlayer = {
          uuid: 'dummy-target',
          position: targetIndex + 1,
          seeded: type === PlayerType.SEEDED,
          status: PlayerDraftStatus.AVAILABLE,
          id: 0,
          name: '',
          team_uuid: ''
        } as IPlayerDraft;

        movePlayer(item.player, item.type, item.index, dummyTargetPlayer, type, targetIndex);
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
      }),
    }));

    return (
      <div
        ref={isEmpty ? drop as unknown as React.Ref<HTMLDivElement> : undefined}
        id={boardId}
        className={`min-h-[200px] ${isEmpty && isOver ? 'bg-blue-50 border-blue-300' : ''}`}
      >
        {children}
      </div>
    );
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="grid grid-cols-12 gap-4">

        <div
          className="col-span-12 sm:col-span-6 p-2 sm:p-4 border-2 border-dashed rounded-lg border-gray-300"
        >
          <h2 className="text-base font-semibold text-gray-900">Regular Players</h2>
          <h3 className="text-sm text-gray-500 mb-2">List of players who will select their team</h3>
          {/* start of player card */}
          <DroppableBoard type={PlayerType.REGULAR} boardId="regular-board" isEmpty={regularPlayers.length === 0}>
            {regularPlayers.map((player, index) => (
              <DraggablePlayerCard
                key={player.uuid}
                player={player}
                type={PlayerType.REGULAR}
                index={index}
              />
            ))}
          </DroppableBoard>
          {/* end of player card */}
        </div>

        <div
          className="col-span-12 sm:col-span-6 p-2 sm:p-4 border-2 border-dashed rounded-lg border-gray-300"
        >
          <h2 className="text-base font-semibold text-gray-900">Seeded Players</h2>
          <h3 className="text-sm text-gray-500 mb-2">Players available for team selection </h3>
          {/* start of player card */}
          <DroppableBoard type={PlayerType.SEEDED} boardId="seeded-board" isEmpty={seededPlayers.length === 0}>
            {seededPlayers.map((player, index) => (
              <DraggablePlayerCard
                key={player.uuid}
                player={player}
                type={PlayerType.SEEDED}
                index={index}
              />
            ))}
          </DroppableBoard>
          {/* end of player card */}
        </div>
      </div>
    </DndProvider>
  );
};