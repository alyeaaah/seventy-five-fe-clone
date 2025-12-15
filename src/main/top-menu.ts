import { paths } from "@/router/paths";
import { type Menu } from "@/stores/menuSlice";

const menu: Array<Menu | "divider"> = [
  {
    icon: "Home",
    title: "Home",
    pathname: paths.player.home,
   
  },
  {
    icon: "Award",
    title: "Matches",
    pathname: paths.player.matches.index,
  },
  {
    icon: "ShoppingCart",
    title: "Orders",
    pathname: paths.player.orders.index,
  },
  {
    icon: "CircleUser",
    title: "Profile",
    pathname: paths.player.profile.index,
  },
];

export default menu;
