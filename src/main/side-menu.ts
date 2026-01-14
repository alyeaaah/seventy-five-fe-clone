import { paths } from "@/router/paths";
import { type Menu } from "@/stores/menuSlice";

const menu: Array<Menu | "divider"> = [
  {
    icon: "Home",
    title: "Dashboard",
    pathname: "/admin",
  },
  {
    icon: "Layers",
    title: "Master Data",
    subMenu: [
      {
        icon: "GitPullRequest",
        pathname: paths.administrator.masterData.levels,
        title: "Levels",
      },
      {
        icon: "Indent",
        pathname: paths.administrator.masterData.leagues,
        title: "Leagues",
      },
      // {
      //   icon: "BarChartBig",
      //   pathname: paths.administrator.masterData.categories,
      //   title: "Categories",
      // },
      {
        icon: "Hash",
        pathname: paths.administrator.masterData.tags,
        title: "Tags",
      },
      {
        icon: "HeartHandshake",
        pathname: paths.administrator.masterData.kudos,
        title: "Kudos",
      },
      {
        icon: "HelpingHand",
        pathname: paths.administrator.masterData.sponsors,
        title: "Sponsors",
      },
      {
        icon: "Gift",
        pathname: paths.administrator.masterData.pointConfig,
        title: "Point Configuration",
      },
    ],
  },
  {
    icon: "Columns4",
    pathname: paths.administrator.courts.index,
    title: "Courts",
  },
  {
    icon: "PersonStanding",
    pathname: paths.administrator.players.index,
    title: "Players",
  },
  {
    icon: "Network",
    pathname: paths.administrator.tournaments.index,
    title: "Tournament",
  },
  {
    icon: "SignpostBig",
    pathname: paths.administrator.customMatch.index,
    title: "Challenger",
  },
  "divider",
  {
    icon: "Image",
    pathname: paths.administrator.galleries.index,
    title: "Galleries",
  },
  {
    icon: "Rss",
    pathname: paths.administrator.blog.index,
    title: "Blog",
  },
  // "divider",
  // {
  //   icon: "School",
  //   pathname: "/class",
  //   title: "Class",
  // },
  "divider",
  {
    icon: "Store",
    pathname: paths.administrator.merchandise.index,
    title: "Merchandise",
  },
  {
    icon: "ShoppingCart",
    pathname: paths.administrator.orders.index.template,
    title: "Orders",
  },
];

export default menu;
