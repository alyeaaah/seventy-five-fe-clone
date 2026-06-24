import LayoutWrapper from "@/components/LayoutWrapper";
import { PublicTournamentApiHooks } from "./api";
import { useNavigate, useLocation } from "react-router-dom";
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
  const { pathname } = useLocation()

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
      enabled: true
    }
  );

  // Use featured data if available, otherwise use recent data
  const tournamentData = featuredTourney?.data && featuredTourney.data.length > 0 ? featuredTourney : null;
  const currentTournament = (!!tournamentEvents?.data?.length || event) ? "EVENT" : 'TOURNEY';
  const { data: detailTournament } = !userIsLogin ? PublicTournamentApiHooks.useGetTournamentDetail(
    {
      params: {
        uuid: uuid || tournamentData?.data?.[0]?.uuid || ''
      }
    },
    {
      enabled: !!uuid || !!tournamentData?.data?.[0]?.uuid,
      retry: false
    }
  ) : PublicTournamentApiHooks.useGetTournamentDetailAuth(
    {
      params: {
        uuid: uuid || tournamentData?.data?.[0]?.uuid || ''
      }
    },
    {
      enabled: !!uuid || !!tournamentData?.data?.[0]?.uuid,
      retry: false
    }
  );

  return (
    <>
      <LayoutWrapper className="grid grid-cols-12 gap-4 sm:gap-8 mt-4 sm:mt-8 min-h-[calc(100vh-300px)] text-emerald-950" key={pathname}>
        {currentTournament === "EVENT" ? <TournamentEvents key={pathname} /> : <Tournaments />}
      </LayoutWrapper >
    </>
  )
}