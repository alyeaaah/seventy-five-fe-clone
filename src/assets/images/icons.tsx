import { ComponentProps, ComponentType, SVGProps } from 'react'

export type IconProps = Omit<
  ComponentProps<"svg">,
  "height" | "width" | "widths"
> & {
  size?: "small" | "regular";
};

type Icon = ComponentType<IconProps>;
import IconPoint_ from '@/assets/images/icons/point.svg';
import IconBracket_ from '@/assets/images/icons/bracket.svg';
import IconLogo_ from '@/assets/images/logo.svg';
import IconLogoAlt_ from '@/assets/images/logo-alt.svg';
import IconPlayer_ from '@/assets/images/icons/player.svg';
import IconXTwitter_ from '@/assets/images/icons/x-twitter.svg';
import IconTiktok_ from '@/assets/images/icons/tiktok.svg';
import IconRacket_ from '@/assets/images/icons/racket-alt.svg';
import IconMedal_ from '@/assets/images/icons/medal.svg';
import IconVS_ from "@/assets/images/icons/vs.svg";
import IconDouble_ from "@/assets/images/icons/double.svg";
import IconPlayerWin_ from "@/assets/images/icons/player-win.svg";
import IconPlayerLoseAlt_ from "@/assets/images/icons/player-lose-alt.svg";
import IconTournament_ from "@/assets/images/icons/tournament.svg";
import IconTrophy_ from "@/assets/images/icons/trophy.svg";
import IconMan_ from "@/assets/images/icons/man.svg";
import IconWoman_ from "@/assets/images/icons/woman.svg";
import IconMale_ from "@/assets/images/icons/male.svg";
import IconFemale_ from "@/assets/images/icons/female.svg";
import IconHeight_ from "@/assets/images/icons/height.svg";
import IconBackhand_ from "@/assets/images/icons/backhand.svg";
import IconNet_ from "@/assets/images/icons/net.svg";
import IconForehandAlt_ from "@/assets/images/icons/forehand-alt.svg";
import IconCashOnCourt_ from "@/assets/images/icons/cash-on-court.svg";
import IconCashOnDelivery_ from "@/assets/images/icons/cash-on-delivery.svg";
import IconTransfer_ from "@/assets/images/icons/transfer.svg";
import IconQris_ from "@/assets/images/icons/qris.svg";
import IconBca_ from "@/assets/images/icons/bca.svg";


export const IconPoints = IconPoint_ as unknown as Icon;
export const IconBracket = IconBracket_ as unknown as Icon;
export const IconLogo = IconLogo_ as unknown as Icon;
export const IconLogoAlt = IconLogoAlt_ as unknown as Icon;
export const IconPlayer = IconPlayer_ as unknown as Icon;
export const IconXTwitter = IconXTwitter_ as unknown as Icon;
export const IconTiktok = IconTiktok_ as unknown as Icon;
export const IconRacket = IconRacket_ as unknown as Icon;
export const IconMedal = IconMedal_ as unknown as Icon;
export const IconVS = IconVS_ as unknown as Icon;
export const IconDouble = IconDouble_ as unknown as Icon;
export const IconPlayerWin = IconPlayerWin_ as unknown as Icon;
export const IconPlayerLoseAlt = IconPlayerLoseAlt_ as unknown as Icon;
export const IconTournament = IconTournament_ as unknown as Icon;
export const IconTrophy = IconTrophy_ as unknown as Icon;
export const IconMan = IconMan_ as unknown as Icon;
export const IconWoman = IconWoman_ as unknown as Icon;
export const IconMale = IconMale_ as unknown as Icon;
export const IconFemale = IconFemale_ as unknown as Icon;
export const IconHeight = IconHeight_ as unknown as Icon;
export const IconBackhand = IconBackhand_ as unknown as Icon;
export const IconNet = IconNet_ as unknown as Icon;
export const IconForehandAlt = IconForehandAlt_ as unknown as Icon;
export const IconCashOnCourt = IconCashOnCourt_ as unknown as Icon;
export const IconCashOnDelivery = IconCashOnDelivery_ as unknown as Icon;
export const IconTransfer = IconTransfer_ as unknown as Icon;
export const IconQris = IconQris_ as unknown as Icon;
export const IconBca = IconBca_ as unknown as Icon;

