import LayoutWrapper from "@/components/LayoutWrapper";
import { PublicMatchApiHooks } from "./api";
import { getCurrentMatch } from "@/utils/helper";
import { useNavigate } from "react-router-dom";
import { FadeAnimation } from "@/components/Animations";
import { useRef, useState, type ComponentType } from "react";
import { useRouteParams } from "typesafe-routes/react-router";
import { paths } from "@/router/paths";
import { IconLogo, IconLogoAlt } from "@/assets/images/icons";
import { PartnersComponent } from "../LandingPage/components/PartnersComponent";
import { PublicTournamentApiHooks } from "../Tournament/api";
import { useMatchScore } from "@/pages/Admin/MatchDetail/api/firestore";
import { useAtomValue } from "jotai";
import { userAtom } from "@/utils/store";
import { matchStatusEnum } from "@/pages/Admin/MatchDetail/api/schema";
import { Helmet as HelmetBase } from "react-helmet";
import Modal from "antd/es/modal/Modal";
import { KudosModal } from "@/pages/Players/Components/KudosModal";
import { MatchMediaAndInfoSection } from "./components/MatchMediaAndInfoSection";

export const PublicMatchDetail = () => {
  const Helmet = HelmetBase as unknown as ComponentType<any>;
  const navigate = useNavigate();
  const queryParams = useRouteParams(paths.tournament.match);
  const { matchUuid } = queryParams;
  const userData = useAtomValue(userAtom);
  const [modalKudos, setModalKudos] = useState<{
    open: boolean;
    matchUuid: string;
    playerUuid: string;
    playerName: string;
  }>({
    open: false,
    matchUuid: "",
    playerUuid: "",
    playerName: ""
  });

  const { data } = PublicMatchApiHooks.useGetMatchDetail({
    params: {
      uuid: matchUuid
    },
  }, {
    onSuccess: () => {
    },
    retry: false
  });
  const { data: tournamentInfo } = PublicTournamentApiHooks.useGetTournamentDetail({
    params: {
      uuid: data?.data?.tournament_uuid || ""
    },
  }, {
    enabled: !!data?.data?.tournament_uuid
  });

  const { data: scores, unsubscribe: unsubscribeFirestore } = useMatchScore(
    matchUuid,
    () => {

    }
  );
  const handlePopState = useRef((event: PopStateEvent) => {
    if (unsubscribeFirestore) {
      unsubscribeFirestore();
    }
    event.preventDefault();
  });
  window.addEventListener("popstate", handlePopState.current);
  const currentScore = getCurrentMatch(scores || []);
  const getPlayerKudos = (playerUuid: string) => {
    return userData?.uuid ? (data?.data?.player_kudos?.filter((item) => item.player_uuid === playerUuid) || []) : [];
  }
  const showGiveKudosButton = (playerUuid: string) => {
    if (!userData?.uuid) return false;
    if (data?.data?.status !== matchStatusEnum.Values.ENDED) return false;
    if (playerUuid == userData.uuid) return false;
    const isPlayerPlaying = data?.data?.home_team?.players?.find((item) => item.uuid === userData.uuid) || data?.data?.away_team?.players?.find((item) => item.uuid === userData.uuid);
    if (!isPlayerPlaying) return false;
    // return false if userData.uuid is already sent kudos
    const isAlreadySentKudos = data?.data?.player_kudos?.find((item) => item.player_uuid === playerUuid && item.by_uuid === userData.uuid && item.player_uuid !== userData.uuid);
    return !isAlreadySentKudos;
  }

  return (
    <>
      <LayoutWrapper className="grid grid-cols-12 gap-4 sm:gap-8 mt-4 sm:mt-8 min-h-[calc(100vh-300px)]">
        <Helmet
          title={`75 Tennis Club | ${tournamentInfo?.data?.name} - Match ${data?.data?.tournament_uuid && data?.data?.seed_index}`}
        />
        <FadeAnimation className="col-span-12 md:col-span-12 grid grid-cols-12 gap-0 h-max" direction="up">
          <div className="col-span-12 grid grid-cols-12 gap-2 h-max">
            {JSON.stringify(scores)}ssss
            <MatchMediaAndInfoSection
              data={data}
              key={JSON.stringify(scores)}
              tournamentInfo={tournamentInfo}
              currentScore={currentScore}
              scores={scores || []}
              matchUuid={matchUuid || ""}
              userData={userData}
              showGiveKudosButton={showGiveKudosButton}
              getPlayerKudos={getPlayerKudos}
              onOpenKudos={(playerUuid, playerName) => {
                setModalKudos({
                  open: true,
                  matchUuid: matchUuid || "",
                  playerUuid: playerUuid || "",
                  playerName: playerName || "",
                });
              }}
            />
          </div>
        </FadeAnimation>
        <FadeAnimation className="col-span-12 ">
          <div className="col-span-12 text-emerald-800 flex flex-row my-4 justify-center md:justify-start">
            <IconLogoAlt className="h-10 w-20" />
            <div className="h-10 w-fit text-xl uppercase font-semibold rounded-full border-[3px] border-emerald-800 items-center px-3 flex relative">
              Supported By
            </div>
            <div className="h-10 ml-1.5 aspect-square border-[3px] border-emerald-800 rounded-full"></div>
          </div>
          <div className="col-span-12 grid grid-cols-12 gap-4 sm:gap-6 mt-2 rounded-xl">
            <PartnersComponent className="col-span-12 mb-8" hideTitle />
          </div>
        </FadeAnimation>
      </LayoutWrapper>
      <Modal
        open={modalKudos.open}
        onCancel={() => { setModalKudos({ open: false, matchUuid: "", playerUuid: "", playerName: "" }) }}
        footer={null}

        title={
          <div className="flex flex-row items-center w-full !text-gray-800 border-b pb-3">
            <IconLogo className="w-16 h-10 mr-3" />
            <div className="flex flex-col items-start justify-center">
              <div className=" text-lg">Kudos for playing!</div>
              <p className="text-xs font-normal text-gray-500">Give kudos to <span className="font-bold"> {modalKudos.playerName}</span>! </p>
            </div>
          </div>
        }
      >
        <KudosModal
          key={JSON.stringify(modalKudos)}
          matchUuid={modalKudos.matchUuid || ""}
          playerUuid={modalKudos.playerUuid || ""}
          onClose={() => setModalKudos({ open: false, matchUuid: "", playerUuid: "", playerName: "" })}
        />
      </Modal>
    </>
  )
}