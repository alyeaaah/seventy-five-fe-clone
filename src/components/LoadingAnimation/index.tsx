import { HTMLAttributes } from "react";
import { LottieAnimation } from "@/components/LottieAnimation";
import loadingAnimationWhite from "@/assets/json/loading-white.json";
import loadingAnimation from "@/assets/json/loading.json";

interface LoadingAnimationProps extends HTMLAttributes<HTMLDivElement> {
  label?: string;
  textClassName?: string;
  animationClassName?: string;
  loop?: boolean
  autoplay?: boolean
  light?: boolean;
}

export const LoadingAnimation = ({
  label,
  className,
  loop = false,
  autoplay = false,
  textClassName = "text-white",
  animationClassName = "w-24",
  light = false,
  ...props
}: LoadingAnimationProps) => {
  return (
    <div
      className={[
        "w-full h-full flex flex-col items-center justify-center",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      <div className={animationClassName}>
        <LottieAnimation
          animationData={light ? loadingAnimationWhite : loadingAnimation}
          loop={loop}
          autoplay={autoplay}
        />
      </div>
      {label ? <span className={textClassName}>{label}</span> : ''}
    </div>
  );
};
