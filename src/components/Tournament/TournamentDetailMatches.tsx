import { useState } from 'react';
import { Segmented } from 'antd';
import Lucide from '../Base/Lucide';
import { IconLogoAlt } from '../../assets/images/icons';
import { DraggableBracket, TournamentDrawingUtils } from '../TournamentDrawing';
import { convertTournamentMatchToMatch } from '../../utils/drawing.util';
import { useNavigate } from 'react-router-dom';
import { paths } from '../../router/paths';
import { PublicTournamentApiHooks } from '../../pages/Public/Tournament/api';
import { useAtomValue } from 'jotai';
import { accessTokenAtom, userAtom } from '../../utils/store';
import { GroupsTab } from './GroupsTab';
import { StandingTab } from './StandingTab';
import { BracketTab } from './BracketTab';

interface TournamentDetailMatchesProps {
  tournamentUuid?: string;
}

const TournamentDetailMatches: React.FC<TournamentDetailMatchesProps> = ({
  tournamentUuid
}) => {
  const navigate = useNavigate();
  const accessToken = useAtomValue(accessTokenAtom);
  const user = useAtomValue(userAtom);
  const userIsLogin = !!accessToken && !!user;
  const { convertMatchToRound } = TournamentDrawingUtils;

  // Handle tournament detail data
  const { data: detailTournament } = !userIsLogin ? PublicTournamentApiHooks.useGetTournamentDetail(
    {
      params: {
        uuid: tournamentUuid || ''
      }
    },
    {
      enabled: !!tournamentUuid
    }
  ) : PublicTournamentApiHooks.useGetTournamentDetailAuth(
    {
      params: {
        uuid: tournamentUuid || ''
      }
    },
    {
      enabled: !!tournamentUuid
    }
  );

  // Handle tournament matches data
  const { data: tournamentMatches } = PublicTournamentApiHooks.useGetTournamentDetailMatches(
    {
      params: {
        tournament_uuid: tournamentUuid || ''
      }
    },
    {
      enabled: !!tournamentUuid,
      retry: false
    }
  );

  const matches = {
    group: tournamentMatches?.data?.filter(md => md.round === -1),
    knockout: tournamentMatches?.data?.filter(md => md.round !== -1)
  };

  // Handle tournament groups data
  const { data: tournamentGroups, isLoading: isLoadingGroup } = PublicTournamentApiHooks.useGetGroupsByTournament({
    params: {
      tournament_uuid: tournamentUuid || ""
    }
  }, {
    enabled: !!tournamentUuid
  });

  // Handle knockout rounds with proper conversion
  const [knockoutRound, setKnockoutRound] = useState<any[]>([]);

  // State for round robin tabs
  const [activeTab, setActiveTab] = useState<'groups' | 'standing' | 'bracket'>('groups');

  // Tab styling constants
  const tabInactiveClassName = '!bg-transparent !text-emerald-800 hover:!border-emerald-800 border !border-transparent';
  const tabActiveClassName = '!bg-emerald-800 !text-white !border-transparent';
  const tabBaseClassName = 'px-2 mx-1 flex items-center justify-center';

  return (
    <>
      <div className="col-span-12 text-emerald-800 flex flex-row my-4">
        <IconLogoAlt className="h-10 w-20" />
        <div className="h-10 w-fit text-xl uppercase font-semibold rounded-full border-[3px] border-emerald-800 items-center px-3 flex relative">
          <div className="h-10 absolute -right-12 aspect-square border-[3px] border-emerald-800 rounded-full"></div>
          <span className="hidden sm:flex">TOURNAMENT&nbsp;</span>MATCHES
        </div>
      </div>

      {detailTournament?.data?.type === "ROUND ROBIN" ? (
        <div className="col-span-12">
          <div className="w-full overflow-x-auto mb-6">
            <Segmented
              options={[
                {
                  label: (
                    <div className="flex items-center justify-center space-x-2">
                      <Lucide icon="Users" className="h-4 w-4" />
                      <span>Groups</span>
                    </div>
                  ),
                  value: 'groups',
                  className: `${tabBaseClassName} ${activeTab === 'groups' ? tabActiveClassName : tabInactiveClassName}`
                },
                {
                  label: (
                    <div className="flex items-center justify-center space-x-2">
                      <Lucide icon="BarChart4" className="h-4 w-4" />
                      <span>Standing</span>
                    </div>
                  ),
                  value: 'standing',
                  className: `${tabBaseClassName} ${activeTab === 'standing' ? tabActiveClassName : tabInactiveClassName}`
                },
                {
                  label: (
                    <div className="flex items-center justify-center space-x-2">
                      <Lucide icon="Trophy" className="h-4 w-4" />
                      <span>Bracket</span>
                    </div>
                  ),
                  value: 'bracket',
                  className: `${tabBaseClassName} ${activeTab === 'bracket' ? tabActiveClassName : tabInactiveClassName}`
                }
              ]}
              value={activeTab}
              defaultValue="groups"
              className="w-full rounded-lg border-emerald-800 font-semibold border-2 bg-[#EBCE56] shadow-none px-1 py-2 min-w-max sm:w-full [&_.ant-segmented-item]:transition-all [&_.ant-segmented-item]:duration-200 [&_.ant-segmented-item]:ease-in-out [&_.ant-segmented-item]:border-emerald-800 [&_.ant-segmented-item]:bg-transparent [&_.ant-segmented-item:not(.ant-segmented-item-selected)]:text-emerald-800 [&_.ant-segmented-item-selected]:bg-emerald-800 [&_.ant-segmented-item-selected]:text-white [&_.ant-segmented-thumb]:bg-emerald-800 [&_.ant-segmented-thumb]:border-emerald-800 [&_.ant-segmented-item-disabled]:opacity-70"
              onChange={(val) => setActiveTab(val as 'groups' | 'standing' | 'bracket')}
            />
          </div>

          <div className="bg-slate-200 rounded-lg p-4">
            {activeTab === 'groups' && <GroupsTab tournamentGroups={tournamentGroups} isLoading={isLoadingGroup} matches={matches.group} />}
            {activeTab === 'standing' && <StandingTab tournamentUuid={tournamentUuid} isLoading={isLoadingGroup} />}
            {activeTab === 'bracket' && <BracketTab matchesData={matches.knockout || []} />}
          </div>
        </div>
      ) : detailTournament?.data?.type === "KNOCKOUT" ? (
        <div className="col-span-12 h-fit overflow-x-scroll" key={JSON.stringify(knockoutRound)}>
          <DraggableBracket
            rounds={convertMatchToRound(convertTournamentMatchToMatch(matches.knockout || []))}
            readOnly
            className="text-emerald-800"
            setRounds={() => null}
            onSeedClick={(seed: any) => {
              navigate(paths.tournament.match({ matchUuid: seed.uuid }).$)
            }}
          />
        </div>
      ) : null}
    </>
  )
};

export default TournamentDetailMatches;
