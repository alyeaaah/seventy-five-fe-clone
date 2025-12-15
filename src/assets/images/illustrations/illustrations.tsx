import { ComponentProps, ComponentType, SVGProps } from 'react'

export type IconProps = Omit<
  ComponentProps<"svg">,
  "height" | "width" | "widths"
> & {
  size?: "small" | "regular";
};

type Icon = ComponentType<IconProps>;
import Illustration_ from '@/assets/images/illustrations/illustration.svg'
import TennisPlay_ from '@/assets/images/illustrations/svg/tennis-play.svg'
import Upcoming_ from '@/assets/images/illustrations/svg/upcoming.svg'
import LatestGame_ from '@/assets/images/illustrations/svg/latest-game.svg'
import SeventyFive_ from '@/assets/images/illustrations/svg/seventy-five.svg'
import ErrorIllustration_ from '@/assets/images/error-illustration.svg'

export const Illustration = Illustration_ as unknown as Icon;
export const TennisPlay = TennisPlay_ as unknown as Icon;
export const Upcoming = Upcoming_ as unknown as Icon;
export const LatestGame = LatestGame_ as unknown as Icon;
export const SeventyFive = SeventyFive_ as unknown as Icon;
export const ErrorIllustration = ErrorIllustration_ as unknown as Icon;




