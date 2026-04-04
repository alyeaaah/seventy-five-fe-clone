import React, { useState, useRef, useEffect } from "react";
import Button from "@/components/Base/Button";
import { TournamentsApiHooks } from "../api";
import { useToast } from "@/components/Toast/ToastContext";
import {
  Divider,
  Segmented
} from "antd";
import { useNavigate } from "react-router-dom";
import { useRouteParams } from "typesafe-routes/react-router";
import { paths } from "@/router/paths";
import Confirmation, { AlertProps } from "@/components/Modal/Confirmation";
import 'react-quill/dist/quill.snow.css';
import Lucide from "@/components/Base/Lucide";
import { GroupMatches } from "./GroupMatches";
import { TournamentDetailGeneral } from "./General";
import { TournamentDetailParticipants } from "./Participants";
import { TournamentDetailBracket } from "./Bracket";
import { TournamentDetailGroups } from "./Groups";
import { TournamentDraftPick } from "./DraftPick";
import { TournamentDraftPickParticipants } from "./DraftPickParticipants";

enum TournamentTab {
  GENERAL = 'general',
  BRACKET = 'bracket',
  PARTICIPANTS = 'participants',
  DRAFT_PICK = 'draft_pick',
  GROUP = 'group',
  GROUP_MATCHES = 'group_matches'
}

const tabInactiveClassName = '!bg-transparent !text-emerald-800 hover:!border-emerald-800 border !border-transparent';
const tabActiveClassName = '!bg-emerald-800 !text-white !border-transparent';
const tabBaseClassName = 'px-2 mx-1 flex items-center justify-center';

interface Props {
  tournament?: string;
}

export const TournamentDetail = () => {
  const queryParams = useRouteParams(paths.administrator.tournaments.detail);
  const { id: tournamentUuid, tab: urlTab } = queryParams;
  const [activeTab, setActiveTab] = useState<TournamentTab>(urlTab as TournamentTab || TournamentTab.GENERAL);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  const { data } = TournamentsApiHooks.useGetTournamentsDetail({
    params: {
      uuid: tournamentUuid || 0
    }
  }, {
    enabled: !!tournamentUuid
  });

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;

    if (!isFullscreen) {
      try {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } catch (error) {
        console.error('Error attempting to enable fullscreen:', error);
      }
    } else {
      try {
        await document.exitFullscreen();
        setIsFullscreen(false);
      } catch (error) {
        console.error('Error attempting to exit fullscreen:', error);
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`${isFullscreen ? 'fixed inset-0 z-50 bg-white overflow-auto p-4' : ''}`}
    >

      <div className="flex flex-row items-center mt-8 intro-y justify-between">
        <h2 className="mr-auto text-lg font-medium">{data?.data?.name || "Tournament"}</h2>
        <div className="flex flex-row justify-end gap-2">

          <Button
            variant="outline-primary"
            size="sm"
            onClick={toggleFullscreen}
          >
            <Lucide icon={isFullscreen ? "Minimize2" : "Fullscreen"} />
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate(paths.administrator.tournaments.edit({ tournament: tournamentUuid || "" }).$)}
          >
            Edit Tournament
          </Button>
        </div>
      </div>
      <Divider className="my-4" />
      <div className="flex flex-col gap-4">
        <div className="w-full overflow-x-auto">
          <Segmented
            options={[
              {
                label: 'General Info',
                value: TournamentTab.GENERAL,
                className: `${tabBaseClassName} ${activeTab === TournamentTab.GENERAL ? tabActiveClassName : tabInactiveClassName}`
              },
              {
                label: 'Participants',
                value: TournamentTab.PARTICIPANTS,
                className: `${tabBaseClassName} ${activeTab === TournamentTab.PARTICIPANTS ? tabActiveClassName : tabInactiveClassName}`
              },
              ...(data?.data?.draft_pick ? [{
                label: 'Draft Pick',
                value: TournamentTab.DRAFT_PICK,
                className: `${tabBaseClassName} ${activeTab === TournamentTab.DRAFT_PICK ? tabActiveClassName : tabInactiveClassName}`
              }] : []),
              ...(data?.data?.type === "ROUND ROBIN" ? [{
                label: 'Group',
                value: TournamentTab.GROUP,
                className: `${tabBaseClassName} ${activeTab === TournamentTab.GROUP ? tabActiveClassName : tabInactiveClassName}`
              },
              {
                label: 'Group Matches',
                value: TournamentTab.GROUP_MATCHES,
                className: `${tabBaseClassName} ${activeTab === TournamentTab.GROUP_MATCHES ? tabActiveClassName : tabInactiveClassName}`
              }] : []),
              {
                label: 'Bracket Drawing',
                value: TournamentTab.BRACKET,
                disabled: !data?.data?.show_bracket,
                className: `${tabBaseClassName} ${activeTab === TournamentTab.BRACKET ? tabActiveClassName : tabInactiveClassName}`
              }
            ]}
            value={activeTab}
            defaultValue={TournamentTab.GENERAL}
            className="w-full rounded-lg border-emerald-800 font-semibold border-2 bg-[#EBCE56] shadow-none px-1 py-2 min-w-max sm:w-full [&_.ant-segmented-item]:transition-all [&_.ant-segmented-item]:duration-200 [&_.ant-segmented-item]:ease-in-out [&_.ant-segmented-item]:border-emerald-800 [&_.ant-segmented-item]:bg-transparent [&_.ant-segmented-item:not(.ant-segmented-item-selected)]:text-emerald-800 [&_.ant-segmented-item-selected]:bg-emerald-800 [&_.ant-segmented-item-selected]:text-white [&_.ant-segmented-thumb]:bg-emerald-800 [&_.ant-segmented-thumb]:border-emerald-800 [&_.ant-segmented-item-disabled]:opacity-70"
            onChange={(val) => {
              setActiveTab(val)
              // add query param without navigation
              const url = new URL(window.location.href);
              url.searchParams.set('tab', val);
              window.history.replaceState({}, '', url);
            }} />
        </div>

        <div className="bg-slate-200 rounded-lg p-4">
          {activeTab === TournamentTab.GENERAL && (
            <TournamentDetailGeneral data={data?.data} tournamentUuid={tournamentUuid || ""} />
          )}
          {(activeTab === TournamentTab.PARTICIPANTS && !data?.data?.draft_pick) && (
            <TournamentDetailParticipants data={data?.data} tournamentUuid={tournamentUuid || ""} />
          )}
          {(activeTab === TournamentTab.PARTICIPANTS && data?.data?.draft_pick) && (
            <TournamentDraftPickParticipants data={data?.data} tournamentUuid={tournamentUuid || ""} />
          )}
          {activeTab === TournamentTab.DRAFT_PICK && (
            <TournamentDraftPick data={data?.data} tournamentUuid={tournamentUuid || ""} />
          )}
          {activeTab === TournamentTab.BRACKET && (
            <TournamentDetailBracket data={data?.data} tournamentUuid={tournamentUuid || ""} />
          )}
          {activeTab === TournamentTab.GROUP && (
            <TournamentDetailGroups data={data?.data} tournamentUuid={tournamentUuid || ""} />
          )}
          {activeTab === TournamentTab.GROUP_MATCHES && (
            <GroupMatches data={data?.data} tournamentUuid={tournamentUuid || ""} />
          )}
        </div>
      </div>
    </div >
  )
}
