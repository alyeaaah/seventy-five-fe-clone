import Tippy from "@/components/Base/Tippy";
import Image from "@/components/Image";
import { imageResizer } from "@/utils/helper";
import { HTMLProps } from "react";
import { Link, useNavigate } from "react-router-dom";
import { paths } from "@/router/paths";
interface NestedImageProps extends HTMLProps<HTMLDivElement> {
  players: {
    media_url: string | null | undefined;
    name: string;
    uuid?: string | null;
  }[];
}
export const NestedImage = ({ players, className }: NestedImageProps) => {
  const navigate = useNavigate();

  // Filter out players with null UUIDs for navigation
  const validPlayers = players?.filter(player => player.uuid !== null) || [];

  return (
    <div className={`flex flex-row h-full aspect-video justify-center relative ${className}`}>
      <Link to={validPlayers?.[0]?.uuid ? paths.players.info({ uuid: validPlayers?.[0]?.uuid || "" }).$ : "#"}>
        <Tippy
          as="div"
          className="h-full aspect-square image-fit zoom-in left-0 absolute rounded-full"
          content={`${players?.[0]?.name}` || ""}
        >
          <Image
            src={players?.[0]?.media_url ? imageResizer(players?.[0]?.media_url, 50) : ''}
            className='h-full aspect-square rounded-full object-cover border-2 border-white'
          />
        </Tippy>
      </Link>
      <Link to={validPlayers?.[1]?.uuid ? paths.players.info({ uuid: validPlayers?.[1]?.uuid || "" }).$ : "#"}>
        <Tippy
          as="div"
          className="flex h-full aspect-square image-fit zoom-in absolute right-0 mt-0 rounded-full"
          content={`${players?.[1]?.name}` || ""}
        >
          <Image
            src={players?.[1]?.media_url ? imageResizer(players?.[1]?.media_url, 50) : ''}
            className='h-full aspect-square rounded-full object-cover border-2 border-white'
          />
        </Tippy>
      </Link>
    </div>
  );
};