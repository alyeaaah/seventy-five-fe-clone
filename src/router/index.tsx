import { Outlet, useLocation, useRoutes } from "react-router-dom";
import DashboardAdministrator from "@/pages/Admin/DashboardAdministrator";
import { LandingPage } from "../pages/Public/LandingPage";
import Login from "../pages/Login";
import { Register } from "../pages/Register";
import ErrorPage from "../pages/ErrorPage";

import Layout from "../themes";
import { ProtectedRoute } from "./protectedRoute";
import { paths } from "./paths";
import Tags from "@/pages/Admin/MasterData/Tags";
import Levels from "@/pages/Admin/MasterData/Levels";
import Kudos from "@/pages/Admin/MasterData/Kudos";
import Categories from "@/pages/Admin/MasterData/Categories";
import Sponsors from "@/pages/Admin/MasterData/Sponsors";
import Courts from "@/pages/Admin/Courts";
import { CourtsNew } from "@/pages/Admin/Courts/New";
import { Transition } from "react-transition-group";
import Players from "@/pages/Admin/Players";
import { PlayerForm } from "@/pages/Admin/Players/Forms";
import Tournaments from "@/pages/Admin/Tournaments";
import { TournamentForm } from "@/pages/Admin/Tournaments/Forms";
import { TournamentFormPlayers } from "@/pages/Admin/Tournaments/Forms/FormPlayers";
import { TournamentFormPoints } from "@/pages/Admin/Tournaments/Forms/FormPoints";
import PointConfigurations from "@/pages/Admin/PointConfig";
import { PointConfigurationsForm } from "@/pages/Admin/PointConfig/New";
import { TournamentFormBrackets } from "@/pages/Admin/Tournaments/Forms/FormBrackets";
import { TournamentDetail } from "@/pages/Admin/Tournaments/detail";
import Galleries from "@/pages/Admin/Galleries";
import { GalleriesNew } from "@/pages/Admin/Galleries/New";
import { GalleriesDetail } from "@/pages/Admin/Galleries/Detail";
import { BlogPostsDetail } from "@/pages/Admin/Blog/Detail";
import { BlogPostsNew } from "@/pages/Admin/Blog/New";
import BlogPosts from "@/pages/Admin/Blog";
import { Merchandise } from "@/pages/Admin/Merchandise";
import { MerchandiseNew } from "@/pages/Admin/Merchandise/New";
import { MerchandiseDetail } from "@/pages/Admin/Merchandise/Detail";
import { PlayerHome } from "@/pages/Players/Home";
import { PlayerMatches } from "@/pages/Players/Matches";
import { PlayerProfile } from "@/pages/Players/Profile";
import { MatchDetail } from "@/pages/Admin/MatchDetail";
import { CustomMatchPage } from "@/pages/Admin/CustomMatch";
import { FriendlyMatchForm } from "@/pages/Admin/CustomMatch/FriandlyMatch/Forms";
import { FriendlyMatchFormPlayers } from "@/pages/Admin/CustomMatch/FriandlyMatch/Forms/FormPlayers";
import { FriendlyMatchFormPoints } from "@/pages/Admin/CustomMatch/FriandlyMatch/Forms/FormPoints";
import { FriendlyMatchFormSchedule } from "@/pages/Admin/CustomMatch/FriandlyMatch/Forms/FormSchedule";
import { FriendlyMatchDetail } from "@/pages/Admin/CustomMatch/FriandlyMatch/detail";
import { CustomMatchForm } from "@/pages/Admin/CustomMatch/SingleMatch/Forms";
import { PublicGalleries } from "@/pages/Public/Galleries";
import { PublicHeader } from "@/pages/Public/LandingPage/components/HeaderLandingPage";
import { Layout as LayoutAntd } from "antd";
import { PublicLayout } from "./PublicLayout";
import { PublicNews } from "@/pages/Public/Blog";
import { PublicTournament } from "@/pages/Public/Tournament";
import { TournamentFormDone } from "@/pages/Admin/Tournaments/Forms/FormDone";
import { PublicChallenger } from "@/pages/Public/Challenger";
import { PublicMatchDetail } from "@/pages/Public/Match";
import { PublicPlayer } from "@/pages/Public/Player";
import { PublicNewsDetail } from "@/pages/Public/Blog/detail";
import { PublicGalleriesDetail } from "@/pages/Public/Galleries/detail";
import { PublicShopCart } from "@/pages/Public/Shop/Cart";
import { PublicShopCheckout } from "@/pages/Public/Shop/Cart/checkout";
import { PublicShop } from "@/pages/Public/Shop";
import { PublicShopDetail } from "@/pages/Public/Shop/detail";
import { PlayerOrderHistory } from "@/pages/Players/OrderHistory";
import { PlayerOrderDetail } from "@/pages/Players/OrderHistory/detail";
import { Orders } from "@/pages/Admin/Orders";
import Leagues from "@/pages/Admin/MasterData/League";
import { PublicStandingPage } from "@/pages/Public/Tournament/StandingPage";

// Add this component
function GeneralLayout() {
  return (
    <>
      <Outlet /> {/* This renders either Courts, CourtsNew or CourtsEdit */}
    </>
  );
}
function Router() {
  const location = useLocation();
  const routes = [
    {
      path: paths.landingPage,
      element: <PublicLayout key={location.pathname} />,
      children: [{
        path: "",
        index: true,
        element: <LandingPage />,
      },
      {
        children: [
          {
            path: paths.tournament.match.template,
            element: <PublicMatchDetail />
          },
          {
            index: true,
            path: paths.tournament.index.template,
            element: <PublicTournament />,
          },
          {
            index: true,
            path: paths.tournament.standings.template,
            element: <PublicStandingPage />,
          },
        ],
      },
      {
        children: [
          {
            index: true,
            path: paths.challenger.index.template,
            element: <PublicChallenger />,
          },
          {
            path: paths.challenger.match.template,
            element: <PublicMatchDetail />
          }
        ],
      },
      {
        children: [
          {
            index: true,
            path: paths.challenger.index.template,
            element: <PublicChallenger />,
          },
          {
            path: paths.challenger.match.template,
            element: <PublicMatchDetail />
          }
        ],
      },
      {
        children: [
          {
            path: paths.players.info.template,
            element: <PublicPlayer />
          },
        ],
      },
      {
        children: [
          {
            path: paths.galleries.detail.template,
            element: <PublicGalleriesDetail />,
          },
          {
            path: paths.galleries.tags.template,
            element: <PublicGalleries />,
          },
          {
            path: paths.galleries.index,
            element: <PublicGalleries />,
          },
        ]
      },
      {
        children: [
          {
            path: paths.news.index,
            element: <PublicNews />,
          },
          {
            path: paths.news.detail.template,
            element: <PublicNewsDetail />,
          },
          {
            path: paths.news.tags.template,
            element: <PublicNews />,
          },
        ],
      },
      {
        children: [
          {
            path: paths.shop.index,
            element: <PublicShop />,
          },
          {
            path: paths.shop.detail.template,
            element: <PublicShopDetail />,
          },
          {
            path: paths.shop.cart,
            element: <PublicShopCart />,
          },
          {
            path: paths.shop.checkout,
            element: <PublicShopCheckout />,
          },

        ]
      },
      ]
    },
    {
      path: paths.administrator.dashboard,
      element: (
        <ProtectedRoute>
          <Layout type="admin" />
        </ProtectedRoute>
      ),
      children: [
        {
          // index: true,
          path: paths.administrator.dashboard,
          element: <DashboardAdministrator />,
        },
        {
          path: paths.administrator.masterData.tags,
          element: <Tags />,
        },
        {
          path: paths.administrator.masterData.categories,
          element: <Categories />,
        },
        {
          path: paths.administrator.masterData.sponsors,
          element: <Sponsors />,
        },
        {
          path: paths.administrator.masterData.levels,
          element: <Levels />,
        },
        {
          path: paths.administrator.masterData.leagues,
          element: <Leagues />,
        },
        {
          path: paths.administrator.masterData.pointConfig,
          element: <PointConfigurations />,
        },
        {
          path: paths.administrator.masterData.pointConfigForm.template,
          element: <PointConfigurationsForm />,
        },
        {
          path: paths.administrator.masterData.kudos,
          element: <Kudos />,
        },
        {
          path: paths.administrator.courts.index,
          element: <GeneralLayout key={location.pathname} />,
          children: [
            {
              index: true,  // This will match /admin/courts
              element: <Courts />,
            },
            {
              path: paths.administrator.courts.new,
              element: <CourtsNew />,
            },
            {
              path: paths.administrator.courts.edit.template,
              element: <CourtsNew />,
            },
          ]
        },
        {
          path: paths.administrator.players.index,
          element: <GeneralLayout key={location.pathname} />,
          children: [
            {
              index: true,  // This will match /admin/courts
              element: <Players />,
            },
            {
              path: paths.administrator.players.new,
              element: <PlayerForm />,
            },
            {
              path: paths.administrator.players.edit.template,
              element: <PlayerForm />,
            },
          ]
        },
        {
          path: paths.administrator.tournaments.index,
          element: <GeneralLayout key={location.pathname} />,
          children: [
            {
              index: true,  // This will match /admin/courts
              element: <Tournaments />,
            },
            {
              path: paths.administrator.tournaments.detail.template,
              element: <TournamentDetail />,
            },
            {
              path: paths.administrator.tournaments.match.template,
              element: <MatchDetail />,
            },
            {
              path: paths.administrator.tournaments.new.players.template,
              element: <TournamentFormPlayers />,
            },
            {
              path: paths.administrator.tournaments.new.brackets.template,
              element: <TournamentFormBrackets />,
            },
            {
              path: paths.administrator.tournaments.new.done.template,
              element: <TournamentFormDone />,
            },
            {
              path: paths.administrator.tournaments.new.points.template,
              element: <TournamentFormPoints />,
            },
            {
              path: paths.administrator.tournaments.edit.template,
              element: <TournamentForm />,
            },
            {
              path: paths.administrator.tournaments.new.index,
              element: <TournamentForm />,
            },
          ]
        },
        {
          path: paths.administrator.customMatch.index,
          element: <GeneralLayout key={location.pathname} />,
          children: [
            {
              index: true,
              element: <CustomMatchPage />,
            },
            {
              path: paths.administrator.customMatch.detail.template,
              element: <MatchDetail />,
            },
            {
              path: paths.administrator.customMatch.new,
              element: <CustomMatchForm />,
            },
            {
              path: paths.administrator.customMatch.edit.template,
              element: <CustomMatchForm />,
            },
            {
              path: paths.administrator.customMatch.friendlyMatch.index,
              element: <GeneralLayout key={location.pathname} />,
              children: [
                {
                  path: paths.administrator.customMatch.friendlyMatch.detail.template,
                  element: <FriendlyMatchDetail />,
                },
                {
                  path: paths.administrator.customMatch.friendlyMatch.new,
                  element: <FriendlyMatchForm />,
                },
                {
                  path: paths.administrator.customMatch.friendlyMatch.edit.index.template,
                  element: <FriendlyMatchForm />,
                },
                {
                  path: paths.administrator.customMatch.friendlyMatch.edit.players.template,
                  element: <FriendlyMatchFormPlayers />,
                },
                {
                  path: paths.administrator.customMatch.friendlyMatch.edit.points.template,
                  element: <FriendlyMatchFormPoints />,
                },
                {
                  path: paths.administrator.customMatch.friendlyMatch.edit.schedule.template,
                  element: <FriendlyMatchFormSchedule />,
                },
              ]
            },
          ]
        },
        {
          path: paths.administrator.galleries.index,
          element: <GeneralLayout key={location.pathname} />,
          children: [
            {
              index: true,  // This will match /admin/courts
              element: <Galleries />,
            },
            {
              path: paths.administrator.galleries.detail.template,
              element: <GalleriesDetail />,
            },
            {
              path: paths.administrator.galleries.edit.template,
              element: <GalleriesNew />,
            },
            {
              path: paths.administrator.galleries.new.index,
              element: <GalleriesNew />,
            },
          ]
        },
        {
          path: paths.administrator.blog.index,
          element: <GeneralLayout key={location.pathname} />,
          children: [
            {
              index: true,  // This will match /admin/courts
              element: <BlogPosts />,
            },
            {
              path: paths.administrator.blog.detail.template,
              element: <BlogPostsDetail />,
            },
            {
              path: paths.administrator.blog.edit.template,
              element: <BlogPostsNew />,
            },
            {
              path: paths.administrator.blog.new.index,
              element: <BlogPostsNew />,
            },
          ]
        },
        {
          path: paths.administrator.blog.index,
          element: <GeneralLayout key={location.pathname} />,
          children: [
            {
              index: true,  // This will match /admin/courts
              element: <BlogPosts />,
            },
            {
              path: paths.administrator.blog.detail.template,
              element: <BlogPostsDetail />,
            },
            {
              path: paths.administrator.blog.edit.template,
              element: <BlogPostsNew />,
            },
            {
              path: paths.administrator.blog.new.index,
              element: <BlogPostsNew />,
            },
          ]
        },
        {
          path: paths.administrator.merchandise.index,
          element: <GeneralLayout key={location.pathname} />,
          children: [
            {
              index: true,  // This will match /admin/courts
              element: <Merchandise />,
            },
            {
              path: paths.administrator.merchandise.detail.template,
              element: <MerchandiseDetail />,
            },
            {
              path: paths.administrator.merchandise.edit.template,
              element: <MerchandiseNew />,
            },
            {
              path: paths.administrator.merchandise.new,
              element: <MerchandiseNew />,
            },
          ]
        },
        {
          path: paths.administrator.orders.index.template,
          element: <GeneralLayout key={location.pathname} />,
          children: [
            {
              index: true,  // This will match /admin/courts
              element: <Orders />,
            },
          ]
        },
      ],
    },
    {
      path: paths.player.home,
      element: (<ProtectedRoute>
        <Layout type="player" />
      </ProtectedRoute>
      ),
      children: [
        {
          index: true,
          path: paths.player.home,
          element: <PlayerHome />,
        },
        {
          path: paths.player.matches.index,
          element: <PlayerMatches />,
        },
        {
          path: paths.player.orders.index,
          element: <PlayerOrderHistory />,
        },
        {
          path: paths.player.orders.detail.template,
          element: <PlayerOrderDetail />,
        },
        {
          path: paths.player.profile.index,
          element: <PlayerProfile />,
        },
      ],
    },
    {
      path: paths.login,
      element: <Login />,
    },
    {
      path: "/register",
      element: <Register />,
    },
    {
      path: "/error-page",
      element: <ErrorPage />,
    },
    {
      path: "*",
      element: <ErrorPage />,
    },
  ];

  return useRoutes(routes);
}

export default Router;
