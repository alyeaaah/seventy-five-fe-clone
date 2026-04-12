import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PublicMatchApiHooks } from '../Public/Match/api';
import { useRouteParams } from 'typesafe-routes/react-router';
import { paths } from '@/router/paths';
import { ScoreWebSocketListener } from '@/components/ScoreWebSocketListener';
import YouTube from 'react-youtube';
import Lucide from '@/components/Base/Lucide';
import { useScore } from '@/utils/score.util';

const FullScreenMatchPage: React.FC = () => {
  const navigate = useNavigate();

  const { match: matchUuid } = useRouteParams(paths.matchFullscreen);

  const { data, isLoading } = PublicMatchApiHooks.useGetMatchDetail({
    params: {
      uuid: matchUuid
    },
  }, {
    onSuccess: () => {
    },
    retry: false
  });

  const { getCurrentMatchScores, getCurrentGameScore } = useScore();
  const currentMatchScore = getCurrentMatchScores(matchUuid);
  const currentGameScore = getCurrentGameScore(currentMatchScore?.game_scores || []);
  useEffect(() => {
    // Close fullscreen when escape key is pressed
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  const handleClose = () => {
    navigate(-1); // Go back to previous page
  };
  if (isLoading) {
    return <>
      Loading</>
  }

  return (
    <>
      {/* WebSocket listener for real-time score updates */}
      <ScoreWebSocketListener />

      <div className="relative w-full h-full">
        <YouTube
          videoId={data?.data?.youtube_url?.split("?v=").pop() || ""}
          iframeClassName="w-full h-full"
          className="w-full h-full"
          opts={{
            width: '100%',
            height: '100%',
            playerVars: {
              autoplay: 1,
              controls: 0,
              modestbranding: 1,
              rel: 0,
            },
          }}
        />
        {/* todo add env */}
        {/* <div className="absolute bottom-4 left-4 bg-emerald-800 text-white px-6 py-2 rounded-lg flex flex-row gap-1 bg-opacity-80"
          key={JSON.stringify(currentMatchScore)}>
          <div className='flex flex-col gap-1'>
            <div className='text-end'>&nbsp;</div>
            <div className='font-bold text-center border-white border w-8 rounded'>{currentMatchScore?.home_team_score}</div>
            <div className='font-bold text-center border-white border w-8  rounded'>{currentMatchScore?.away_team_score}</div>
          </div>
          <div className='flex flex-col gap-1'>
            <div className='text-end'>Game</div>
            <div className='font-bold text-end flex items-center justify-end border border-emerald-800'>{data?.data?.home_team?.players?.[0]?.name}/{data?.data?.home_team?.players?.[1]?.name}</div>
            <div className='font-bold text-end flex items-center justify-end'>{data?.data?.away_team?.players?.[0]?.name}/{data?.data?.away_team?.players?.[1]?.name}</div>
          </div>
          {(currentMatchScore?.game_scores || data?.data?.game_scores)?.map((game, i) => (
            <div key={i} className='flex flex-col gap-1 text-emerald-800 rounded px-1 text-center w-8'>
              <div className='bg-white rounded'>{game.game}</div>
              <div className={`border rounded ${game.game_score_home == "WIN" ? 'text-[#EBCE56] border-[#EBCE56]' : 'text-white border-white'}`}>{game.game_score_home == "WIN" ? (game.game_score_away == "40" ? "AD" : "40") : game.game_score_home}</div>
              <div className={`border rounded ${game.game_score_away == "WIN" ? 'text-[#EBCE56] border-[#EBCE56]' : 'text-white border-white'}`}>{game.game_score_away == "WIN" ? (game.game_score_home == "40" ? "AD" : "40") : game.game_score_away}</div>
            </div>
          ))}
        </div> */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 transition-all"
        >
          <Lucide icon="X" className="w-6 h-6" />
        </button>
      </div>
    </>
  );
};

export { FullScreenMatchPage as FullScreenMatch };
