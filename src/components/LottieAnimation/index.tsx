import React from 'react';
import Lottie, { Options } from 'react-lottie';

export const LottieAnimation = ({
  animationData,
  autoplay,
  loop,
  isClickToPauseDisabled,
  isStopped,
  eventListeners,
  color,
  className
}: {
  animationData: any;
  autoplay?: boolean;
  loop?: boolean;
  isClickToPauseDisabled?: boolean;
  isStopped?: boolean;
  eventListeners?: any;
  color?: string;
  className?: string;
}) => {
  const LottieComponent = Lottie as unknown as React.ComponentType<any>;
  const defaultOptions: Options = {
    loop: loop ?? false,
    autoplay: autoplay ?? false,
    animationData: animationData,
    rendererSettings: {
      className: className,
      preserveAspectRatio: 'xMidYMid slice',
      hideOnTransparent: false,
      ...(color && {
        filters: [
          {
            type: 'color',
            color: color, // Apply the new color
          }
        ]
      })
    }
  };

  return <LottieComponent
    options={defaultOptions}
    isClickToPauseDisabled={isClickToPauseDisabled}
    isStopped={isStopped}
    eventListeners={eventListeners} />
};
