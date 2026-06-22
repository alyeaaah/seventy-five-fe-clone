import LayoutWrapper from "@/components/LayoutWrapper";
import { PublicTournamentApiHooks } from "./api";
import { useNavigate } from "react-router-dom";
import { PublicBlogApiHooks } from "../Blog/api";
import { useRouteParams } from "typesafe-routes/react-router";
import { paths } from "@/router/paths";
import { accessTokenAtom, userAtom } from "@/utils/store";
import { useAtomValue } from "jotai";
import { useState } from "react";
import { TournamentEvents } from "./TournamentEvents";
import { Tournaments } from "./Tournaments";
export const PublicTournament = () => {
  const navigate = useNavigate();
  const queryParams = useRouteParams(paths.tournament.index);
  const { uuid, event } = queryParams;
  const accessToken = useAtomValue(accessTokenAtom);
  const user = useAtomValue(userAtom);
  const userIsLogin = !!(accessToken && user);

  const { data: featuredTourney, isLoading: tournamentsLoading } = PublicTournamentApiHooks.useGetFeaturedTournament(
    {
      queries: {
        limit: 99
      }
    }, {}
  );

  const { data: tournamentEvents, isLoading: tournamentEventsLoading } = PublicTournamentApiHooks.useGetPublicTournamentEventList(
    {
      queries: {
      }
    },
    {
      enabled: !uuid
    }
  );

  // const { data: recentData, isLoading: recentTournamentsLoading } = PublicTournamentApiHooks.useGetRecentTournament(
  //   {
  //     queries: {
  //       limit: 99
  //     }
  //   },
  //   {
  //     enabled: !tournamentsLoading && (!data?.data || data?.data?.length === 0) && !tournamentEvents?.data?.length
  //   }
  // );


  // Use featured data if available, otherwise use recent data
  const tournamentData = featuredTourney?.data && featuredTourney.data.length > 0 ? featuredTourney : null;
  const tournamentEvent = !!tournamentEvents?.data?.length ? tournamentEvents?.data?.[0] : null;
  const currentTournament = (!!tournamentEvents?.data?.length || event) ? "EVENT" : 'TOURNEY';

  const { data: detailTournament } = !userIsLogin ? PublicTournamentApiHooks.useGetTournamentDetail(
    {
      params: {
        uuid: uuid || tournamentData?.data?.[0]?.uuid || ''
      }
    },
    {
      enabled: !!tournamentData?.data?.[0]?.uuid,
      retry: false
    }
  ) : PublicTournamentApiHooks.useGetTournamentDetailAuth(
    {
      params: {
        uuid: uuid || tournamentData?.data?.[0]?.uuid || ''
      }
    },
    {
      enabled: !!tournamentData?.data?.[0]?.uuid,
      retry: false
    }
  );

  // const { data: tournamentSponsors } = PublicTournamentApiHooks.useGetTournamentDetailSponsors(
  //   {
  //     params: {
  //       tournament_uuid: uuid || tournamentData?.data?.[0]?.uuid || tournamentEvent?.tournaments?.[0]?.uuid || ''
  //     }
  //   },
  //   {
  //     enabled: !!(uuid || tournamentData?.data?.[0]?.uuid || tournamentEvent?.tournaments?.[0]?.uuid || ''),
  //     retry: false
  //   }
  // );

  // const { data: tournamentTeamParticipants } = PublicTournamentApiHooks.useGetTournamentTeamParticipants({
  //   params: {
  //     uuid: uuid || ''
  //   },
  //   queries: {
  //     status: "approved,confirmed"
  //   }
  // }, {
  //   enabled: !!uuid,
  // });

  // const { data: tournamentDraftParticipantsData } = PublicTournamentApiHooks.useGetPublicTournamentDraftParticipants({
  //   params: {
  //     tournamentUuid: tournamentData?.data?.[0]?.uuid || tournamentEvent?.tournaments?.[0]?.uuid || ''
  //   },
  //   queries: {
  //     status: ["APPROVED", "AVAILABLE", "PICKED", "PICKING"],
  //     tournamentEventUuid: tournamentEvent?.uuid || ''
  //   }
  // }, {
  //   enabled: !!(tournamentData?.data?.[0]?.uuid || tournamentEvent?.tournaments?.[0]?.uuid || ''),
  // });
  // const draftParticipants = tournamentDraftParticipantsData?.data?.participants || [];

  const { data: blogData } = PublicBlogApiHooks.useGetBlogFeatured(
    {
      queries: {
        limit: 6
      }
    }, {
    enabled: true
  });
  return (
    <>
      <LayoutWrapper className="grid grid-cols-12 gap-4 sm:gap-8 mt-4 sm:mt-8 min-h-[calc(100vh-300px)]">
        {currentTournament == "EVENT" ? <TournamentEvents /> : <Tournaments />}
      </LayoutWrapper >
    </>
  )
}