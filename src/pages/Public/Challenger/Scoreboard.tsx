import { useRouteParams } from "typesafe-routes/react-router";
import { paths } from "@/router/paths";
import { PublicMatchApiHooks } from "../Match/api";
import { ScoreWebSocketListener } from "@/components/ScoreWebSocketListener";
import { useScore } from "@/utils/score.util";
import Lucide from "@/components/Base/Lucide";
import { IconLogo, IconMascott } from "@/assets/images/icons";
import { matchStatusEnum } from "@/pages/Admin/MatchDetail/api/schema";
import { PublicChallangerApiHooks } from "./api";

type ScoreboardVariant = 'stacked-simple' | 'stacked-full' | 'horizontal';

// Stacked Simple Variant - Minimal stacked layout
const StackedSimpleScoreboard = ({ match, currentScore }: { match: any, currentScore: any }) => (
  <div className="max-w-2xl mx-auto bg-gradient-to-br from-emerald-700 to-emerald-900 rounded-xl p-8 relative overflow-hidden">
    <div className="absolute z-[1] -top-16 -left-8 opacity-5 grid grid-cols-12 -right-8 -rotate-12">
      <div className="col-span-3 aspect-video">
        <IconLogo className="text-white w-full h-full" />
      </div>
      <div className="col-span-3 aspect-video">
        <IconMascott className="text-white w-full h-full" />
      </div>
      <div className="col-span-3 aspect-video">
        <IconLogo className="text-white w-full h-full" />
      </div>
      <div className="col-span-3 aspect-video">
        <IconMascott className="text-white w-full h-full transform -rotate-45" />
      </div>
      <div className="col-span-4 aspect-video">
        <IconLogo className="text-white w-full h-full" />
      </div>
      <div className="col-span-4 aspect-video">
        <IconMascott className="text-white w-full h-full rotate-90" />
      </div>
      <div className="col-span-4 aspect-video">
        <IconLogo className="text-white w-full h-full" />
      </div>
      <div className="col-span-3 aspect-video">
        <IconMascott className="text-white w-full h-full rotate-45" />
      </div>
      <div className="col-span-3 aspect-video">
        <IconLogo className="text-white w-full h-full" />
      </div>
      <div className="col-span-3 aspect-video">
        <IconMascott className="text-white w-full h-full rotate-12" />
      </div>
      <div className="col-span-3 aspect-video">
        <IconLogo className="text-white w-full h-full" />
      </div>
      <div className="col-span-4 aspect-video">
        <IconLogo className="text-white w-full h-full" />
      </div>
      <div className="col-span-4 aspect-video">
        <IconLogo className="text-white w-full h-full" />
      </div>
      <div className="col-span-4 aspect-video">
        <IconLogo className="text-white w-full h-full" />
      </div>
      <div className="col-span-3 aspect-video">
        <IconLogo className="text-white w-full h-full" />
      </div>
      <div className="col-span-3 aspect-video">
        <IconLogo className="text-white w-full h-full" />
      </div>
      <div className="col-span-3 aspect-video">
        <IconLogo className="text-white w-full h-full" />
      </div>
      <div className="col-span-3 aspect-video">
        <IconLogo className="text-white w-full h-full" />
      </div>
    </div>

    <h3 className="text-xl font-bold text-center mb-6 text-white">GAME SCORE</h3>

    {/* Home Team Score */}
    <div className="flex items-center justify-between bg-black bg-opacity-20 rounded-t-2xl pt-2 px-3  relative z-[2]">
      <div className="flex items-center">
        <div className="min-w-12 h-12 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold mr-4 ">
          {match.home_team?.name?.slice(0, 3).toUpperCase()}
        </div>
        <div>
          <div className="text-xl font-semibold text-white uppercase">{match.home_team?.players?.map((player: any) => player.nickname || player.name).join('/') || "Home Team"}</div>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <div className="w-12 h-14 bg-white border-2 border-white rounded-t-lg flex items-center justify-center">
          <span className="text-2xl font-bold text-emerald-800">
            {currentScore.home_team_score || 0}
          </span>
        </div>
        <div className="w-12 h-14 border-2 border-white rounded-t-lg flex items-center justify-center border-b-0">
          <span className="text-2xl font-bold text-white">
            {currentScore.game_scores && currentScore.game_scores.length > 0
              ? (currentScore.game_scores[currentScore.game_scores.length - 1]?.game_score_home || '0')
              : '0'
            }
          </span>
        </div>
      </div>
    </div>

    {/* Away Team Score */}
    <div className="flex items-center justify-between bg-black bg-opacity-20 rounded-b-2xl px-3 pb-2 relative z-[2]">
      <div className="flex items-center">
        <div className="min-w-12 h-12 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold mr-4 ">
          {match.away_team?.name?.slice(0, 3).toUpperCase()}
        </div>
        <div>
          <div className="text-xl font-semibold text-white uppercase line-clamp-1">{match.away_team?.players?.map((player: any) => player.nickname || player.name).join('/') || "Away Team"}</div>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <div className="w-12 h-14 bg-white border-2 border-white rounded-b-lg flex items-center justify-center ">
          <span className="text-2xl font-bold text-emerald-800">
            {currentScore.away_team_score || 0}
          </span>
        </div>
        <div className="w-12 h-14 border-2 border-white rounded-b-lg flex items-center justify-center border-t-0">
          <span className="text-2xl font-bold text-white">
            {currentScore.game_scores && currentScore.game_scores.length > 0
              ? (currentScore.game_scores[currentScore.game_scores.length - 1]?.game_score_away || '0')
              : '0'
            }
          </span>
        </div>
      </div>
    </div>

    {/* Match Status */}
    <div className="text-center mt-8">
      <div className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${match.status === 'ONGOING'
        ? 'bg-green-100 text-green-800 animate-pulse'
        : 'bg-gray-100 text-gray-600'
        }`}>
        {match.status === 'ONGOING' ? 'LIVE' : match.status || 'UPCOMING'}
      </div>
    </div>
  </div>
);

// Stacked Full Variant - More detailed stacked layout
const StackedFullScoreboard = ({ match, currentScore }: { match: any, currentScore: any }) => (
  <div className="max-w-3xl mx-auto bg-gradient-to-br from-emerald-700 to-emerald-900 rounded-xl p-8 relative overflow-hidden">
    <div className="absolute z-[1] -top-16 -left-8 opacity-5 grid grid-cols-12 -right-8 -rotate-12">
      <div className="col-span-3 aspect-video">
        <IconLogo className="text-white w-full h-full" />
      </div>
      <div className="col-span-3 aspect-video">
        <IconMascott className="text-white w-full h-full" />
      </div>
      <div className="col-span-3 aspect-video">
        <IconLogo className="text-white w-full h-full" />
      </div>
      <div className="col-span-3 aspect-video">
        <IconMascott className="text-white w-full h-full transform -rotate-45" />
      </div>
      <div className="col-span-4 aspect-video">
        <IconLogo className="text-white w-full h-full" />
      </div>
      <div className="col-span-4 aspect-video">
        <IconMascott className="text-white w-full h-full rotate-90" />
      </div>
      <div className="col-span-4 aspect-video">
        <IconLogo className="text-white w-full h-full" />
      </div>
      <div className="col-span-3 aspect-video">
        <IconMascott className="text-white w-full h-full rotate-45" />
      </div>
      <div className="col-span-3 aspect-video">
        <IconLogo className="text-white w-full h-full" />
      </div>
      <div className="col-span-3 aspect-video">
        <IconMascott className="text-white w-full h-full rotate-12" />
      </div>
      <div className="col-span-3 aspect-video">
        <IconLogo className="text-white w-full h-full" />
      </div>
      <div className="col-span-4 aspect-video">
        <IconLogo className="text-white w-full h-full" />
      </div>
      <div className="col-span-4 aspect-video">
        <IconLogo className="text-white w-full h-full" />
      </div>
      <div className="col-span-4 aspect-video">
        <IconLogo className="text-white w-full h-full" />
      </div>
      <div className="col-span-3 aspect-video">
        <IconLogo className="text-white w-full h-full" />
      </div>
      <div className="col-span-3 aspect-video">
        <IconLogo className="text-white w-full h-full" />
      </div>
      <div className="col-span-3 aspect-video">
        <IconLogo className="text-white w-full h-full" />
      </div>
      <div className="col-span-3 aspect-video">
        <IconLogo className="text-white w-full h-full" />
      </div>
    </div>

    <h3 className="text-2xl font-bold text-center mb-6 text-white">GAME SCORE</h3>

    {/* Match Info */}
    <div className="text-center text-white mb-6 relative z-[2]">
      <div className="px-4 py-2 rounded-full text-lg font-semibold flex justify-center items-center">
        <Lucide icon="MapPin" className="mr-1" />
        {match.court_field?.name}
        {match.court_field?.court?.name ? ` - ${match.court_field.court.name}` : ''}
      </div>
    </div>

    {/* Home Team Score */}
    <div className="flex items-center justify-between bg-black bg-opacity-20 rounded-xl py-3 px-4 mb-3 relative z-[2]">
      <div className="flex items-center flex-1">
        <div className="min-w-14 h-14 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold mr-4">
          {match.home_team?.name?.slice(0, 3).toUpperCase()}
        </div>
        <div className="flex-1">
          <div className="text-2xl font-semibold text-white uppercase">{match.home_team?.players?.map((player: any) => player.nickname || player.name).join('/') || "Home Team"}</div>
          <div className="text-sm text-emerald-200">{match.home_team?.name || 'Home Team'}</div>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <div className="text-center">
          <div className="text-xs text-emerald-200 mb-1">TOTAL</div>
          <div className="w-20 h-20 bg-white border-2 border-white rounded-lg flex items-center justify-center">
            <span className="text-3xl font-bold text-emerald-800">
              {currentScore.home_team_score || 0}
            </span>
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs text-emerald-200 mb-1">GAME</div>
          <div className="w-20 h-20 border-2 border-white rounded-lg flex items-center justify-center">
            <span className="text-3xl font-bold text-white">
              {currentScore.game_scores && currentScore.game_scores.length > 0
                ? (currentScore.game_scores[currentScore.game_scores.length - 1]?.game_score_home || '0')
                : '0'
              }
            </span>
          </div>
        </div>
      </div>
    </div>

    {/* Away Team Score */}
    <div className="flex items-center justify-between bg-black bg-opacity-20 rounded-lg px-4 py-3 mb-1 relative z-[2]">
      <div className="flex items-center flex-1">
        <div className="min-w-14 h-14 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold mr-4">
          {match.away_team?.name?.slice(0, 3).toUpperCase()}
        </div>
        <div className="flex-1">
          <div className="text-2xl font-semibold text-white uppercase line-clamp-1">{match.away_team?.players?.map((player: any) => player.nickname || player.name).join('/') || "Away Team"}</div>
          <div className="text-sm text-emerald-200">{match.away_team?.name || 'Away Team'}</div>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <div className="text-center">
          <div className="text-xs text-emerald-200 mb-1">TOTAL</div>
          <div className="w-20 h-20 bg-white border-2 border-white rounded-lg flex items-center justify-center">
            <span className="text-3xl font-bold text-emerald-800">
              {currentScore.away_team_score || 0}
            </span>
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs text-emerald-200 mb-1">GAME</div>
          <div className="w-20 h-20 border-2 border-white rounded-lg flex items-center justify-center">
            <span className="text-3xl font-bold text-white">
              {currentScore.game_scores && currentScore.game_scores.length > 0
                ? (currentScore.game_scores[currentScore.game_scores.length - 1]?.game_score_away || '0')
                : '0'
              }
            </span>
          </div>
        </div>
      </div>
    </div>

    {/* Match Status */}
    <div className="text-center mt-8">
      <div className={`inline-block px-6 py-3 rounded-full text-lg font-semibold ${match.status === 'ONGOING'
        ? 'bg-green-100 text-green-800 animate-pulse'
        : 'bg-gray-100 text-gray-600'
        }`}>
        {match.status === 'ONGOING' ? '🔴 LIVE' : match.status || 'UPCOMING'}
      </div>
    </div>
  </div>
);

// Horizontal Variant - Side by side layout
const HorizontalScoreboard = ({ match, currentScore }: { match: any, currentScore: any }) => (
  <div className="max-w-6xl mx-auto bg-gradient-to-br from-emerald-700 to-emerald-900 rounded-xl p-8 relative overflow-hidden">
    <div className="absolute z-[1] -top-16 -left-8 opacity-5 grid grid-cols-12 -right-8 -rotate-12">
      <div className="col-span-3 aspect-video">
        <IconLogo className="text-white w-full h-full" />
      </div>
      <div className="col-span-3 aspect-video">
        <IconMascott className="text-white w-full h-full" />
      </div>
      <div className="col-span-3 aspect-video">
        <IconLogo className="text-white w-full h-full" />
      </div>
      <div className="col-span-3 aspect-video">
        <IconMascott className="text-white w-full h-full transform -rotate-45" />
      </div>
      <div className="col-span-4 aspect-video">
        <IconLogo className="text-white w-full h-full" />
      </div>
      <div className="col-span-4 aspect-video">
        <IconMascott className="text-white w-full h-full rotate-90" />
      </div>
      <div className="col-span-4 aspect-video">
        <IconLogo className="text-white w-full h-full" />
      </div>
      <div className="col-span-3 aspect-video">
        <IconMascott className="text-white w-full h-full rotate-45" />
      </div>
      <div className="col-span-3 aspect-video">
        <IconLogo className="text-white w-full h-full" />
      </div>
      <div className="col-span-3 aspect-video">
        <IconMascott className="text-white w-full h-full rotate-12" />
      </div>
      <div className="col-span-3 aspect-video">
        <IconLogo className="text-white w-full h-full" />
      </div>
      <div className="col-span-4 aspect-video">
        <IconLogo className="text-white w-full h-full" />
      </div>
      <div className="col-span-4 aspect-video">
        <IconLogo className="text-white w-full h-full" />
      </div>
      <div className="col-span-4 aspect-video">
        <IconLogo className="text-white w-full h-full" />
      </div>
      <div className="col-span-3 aspect-video">
        <IconLogo className="text-white w-full h-full" />
      </div>
      <div className="col-span-3 aspect-video">
        <IconLogo className="text-white w-full h-full" />
      </div>
      <div className="col-span-3 aspect-video">
        <IconLogo className="text-white w-full h-full" />
      </div>
      <div className="col-span-3 aspect-video">
        <IconLogo className="text-white w-full h-full" />
      </div>
    </div>

    <h3 className="text-2xl font-bold text-center mb-6 text-white">GAME SCORE</h3>

    {/* Match Info */}
    <div className="text-center text-white mb-6 relative z-[2]">
      <div className="px-4 py-2 rounded-full text-lg font-semibold flex justify-center items-center">
        <Lucide icon="MapPin" className="mr-1" />
        {match.court_field?.name}
        {match.court_field?.court?.name ? ` - ${match.court_field.court.name}` : ''}
      </div>
    </div>

    {/* Horizontal Layout */}
    <div className="flex items-center justify-between gap-4 relative z-[2]">
      {/* Home Team */}
      <div className="flex-1 bg-black bg-opacity-20 rounded-xl p-6">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold mb-3">
            {match.home_team?.name?.slice(0, 3).toUpperCase()}
          </div>
          <div className="text-xl font-semibold text-white uppercase text-center mb-2">{match.home_team?.players?.map((player: any) => player.nickname || player.name).join('/') || "Home Team"}</div>
          <div className="text-sm text-emerald-200 mb-4">{match.home_team?.name || 'Home Team'}</div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-xs text-emerald-200 mb-1">TOTAL</div>
              <div className="w-20 h-20 bg-white border-2 border-white rounded-lg flex items-center justify-center">
                <span className="text-3xl font-bold text-emerald-800">
                  {currentScore.home_team_score || 0}
                </span>
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-emerald-200 mb-1">GAME</div>
              <div className="w-20 h-20 border-2 border-white rounded-lg flex items-center justify-center">
                <span className="text-3xl font-bold text-white">
                  {currentScore.game_scores && currentScore.game_scores.length > 0
                    ? (currentScore.game_scores[currentScore.game_scores.length - 1]?.game_score_home || '0')
                    : '0'
                  }
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* VS Divider */}
      <div className="flex flex-col items-center justify-center px-4">
        <div className="text-4xl font-bold text-white">VS</div>
      </div>

      {/* Away Team */}
      <div className="flex-1 bg-black bg-opacity-20 rounded-xl p-6">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold mb-3">
            {match.away_team?.name?.slice(0, 3).toUpperCase()}
          </div>
          <div className="text-xl font-semibold text-white uppercase text-center mb-2 line-clamp-1">{match.away_team?.players?.map((player: any) => player.nickname || player.name).join('/') || "Away Team"}</div>
          <div className="text-sm text-emerald-200 mb-4">{match.away_team?.name || 'Away Team'}</div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-xs text-emerald-200 mb-1">TOTAL</div>
              <div className="w-20 h-20 bg-white border-2 border-white rounded-lg flex items-center justify-center">
                <span className="text-3xl font-bold text-emerald-800">
                  {currentScore.away_team_score || 0}
                </span>
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-emerald-200 mb-1">GAME</div>
              <div className="w-20 h-20 border-2 border-white rounded-lg flex items-center justify-center">
                <span className="text-3xl font-bold text-white">
                  {currentScore.game_scores && currentScore.game_scores.length > 0
                    ? (currentScore.game_scores[currentScore.game_scores.length - 1]?.game_score_away || '0')
                    : '0'
                  }
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Match Status */}
    <div className="text-center mt-8">
      <div className={`inline-block px-6 py-3 rounded-full text-lg font-semibold ${match.status === 'ONGOING'
        ? 'bg-green-100 text-green-800 animate-pulse'
        : 'bg-gray-100 text-gray-600'
        }`}>
        {match.status === 'ONGOING' ? '🔴 LIVE' : match.status || 'UPCOMING'}
      </div>
    </div>
  </div>
);

export const ChallengerScoreboard = () => {
  const { matchUuid, variant, court } = useRouteParams(paths.challenger.scoreboard);

  // Fetch match details
  const { data: matchData, isLoading, error } = PublicMatchApiHooks.useGetMatchDetail({
    params: { uuid: matchUuid },
    queries: {}
  }, {
    enabled: !!matchUuid && !court
  });


  const { data: ongoingMatches, refetch: refetchOngoingMatches, isLoading: isLoadingOngoingMatches } = PublicChallangerApiHooks.useGetMatches({
    queries: {
      status: [
        matchStatusEnum.Values.ONGOING,
      ],
      limit: 2,
      courts: court ? [court] : []
    }
  }, {
    enabled: !!court
  });
  // Use existing ScoreWebSocketListener for live score updates
  ScoreWebSocketListener({ enabled: true });

  // Get current match scores from global state
  const { getCurrentMatchScores } = useScore();
  const liveScore = getCurrentMatchScores(matchUuid);

  if (!(!isLoading || !isLoadingOngoingMatches)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading scoreboard...</div>
      </div>
    );
  }

  if (error || !matchData?.data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-red-600">Failed to load match data</div>
      </div>
    );
  }

  const match = !!ongoingMatches?.data?.length ? ongoingMatches.data[0] : matchData.data;
  const currentScore = liveScore || match;

  // Render based on variant
  const renderScoreboard = () => {
    switch (variant) {
      case 'stacked-full':
        return <StackedFullScoreboard match={match} currentScore={currentScore} />;
      case 'horizontal':
        return <HorizontalScoreboard match={match} currentScore={currentScore} />;
      case 'stacked-simple':
      default:
        return <StackedSimpleScoreboard match={match} currentScore={currentScore} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 to-emerald-700 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Main Scoreboard */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-800 text-white p-6">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-2">SEVENTY FIVE</h1>
              <p className="text-xl opacity-90">Live Scoreboard</p>
            </div>
          </div>

          {/* Score Display */}
          <div className="p-8 bg-emerald-800">
            {renderScoreboard()}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-white opacity-75">
          <p className="text-sm">© 2026 Seventy Five</p>
        </div>
      </div>
    </div>
  );
};
