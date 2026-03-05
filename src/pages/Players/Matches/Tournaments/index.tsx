import { useRouteParams } from "typesafe-routes/react-router";
import { paths } from "@/router/paths";
import TournamentDetailCard from "@/components/Tournament/TournamentDetailCard";

export const TournamentPlayerDetail = () => {
  const { tournamentId } = useRouteParams(paths.player.matches.tournament);
  return (
    <div className="py-6 px-4">
      <TournamentDetailCard
        tournamentUuid={tournamentId}
      />
    </div>
  )
}