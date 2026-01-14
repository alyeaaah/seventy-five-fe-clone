import React from 'react';
import Lottie, { Options } from 'react-lottie';

export const LottieAnimation = ({ animationData, autoplay, loop, isClickToPauseDisabled, isStopped, eventListeners }: { animationData: any, autoplay?: boolean, loop?: boolean, isClickToPauseDisabled?: boolean, isStopped?: boolean, eventListeners?: any }) => {
  const LottieComponent = Lottie as unknown as React.ComponentType<any>;
  const defaultOptions: Options = {
    loop: loop ?? false,
    autoplay: autoplay ?? false,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice',
      hideOnTransparent: false
    }

  };

  return <LottieComponent options={defaultOptions} isClickToPauseDisabled={isClickToPauseDisabled} isStopped={isStopped} eventListeners={eventListeners} />
};
