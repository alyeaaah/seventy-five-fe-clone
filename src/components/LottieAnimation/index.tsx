import React from 'react';
import Lottie, { Options } from 'react-lottie';

export const LottieAnimation = ({ animationData, autoplay, loop, isClickToPauseDisabled, isStopped, eventListeners }: { animationData: any, autoplay?: boolean, loop?: boolean, isClickToPauseDisabled?: boolean, isStopped?: boolean, eventListeners?: any }) => {
  const defaultOptions: Options = {
    loop: loop ?? false,
    autoplay: autoplay ?? false,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice',
      hideOnTransparent: false
    }

  };

  return <Lottie options={defaultOptions} isClickToPauseDisabled={isClickToPauseDisabled} isStopped={isStopped} eventListeners={eventListeners} />
};
