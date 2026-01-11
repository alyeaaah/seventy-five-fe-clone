import { Outlet, useLocation, useRoutes } from "react-router-dom";
import { lazy, Suspense } from "react";
import Layout from "../themes";
import { ProtectedRoute } from "./protectedRoute";
import { paths } from "./paths";
import LoadingOverlay from "@/components/LoadingOverlay";

// Lazy load semua pages untuk code splitting
const DashboardAdministrator = lazy(() => import("@/pages/Admin/DashboardAdministrator"));
const LandingPage = lazy(() => import("../pages/Public/LandingPage").then(m => ({ default: m.LandingPage })));
const Login = lazy(() => import("../pages/Login"));
const Register = lazy(() => import("../pages/Register").then(m => ({ default: m.Register })));
const ErrorPage = lazy(() => import("../pages/ErrorPage"));

// Admin Master Data
const Tags = lazy(() => import("@/pages/Admin/MasterData/Tags"));
const Levels = lazy(() => import("@/pages/Admin/MasterData/Levels"));
const Kudos = lazy(() => import("@/pages/Admin/MasterData/Kudos"));
const Categories = lazy(() => import("@/pages/Admin/MasterData/Categories"));
const Sponsors = lazy(() => import("@/pages/Admin/MasterData/Sponsors"));
const Leagues = lazy(() => import("@/pages/Admin/MasterData/League"));

// Admin Courts
const Courts = lazy(() => import("@/pages/Admin/Courts"));
const CourtsNew = lazy(() => import("@/pages/Admin/Courts/New").then(m => ({ default: m.CourtsNew })));

// Admin Players
const Players = lazy(() => import("@/pages/Admin/Players"));
const PlayerForm = lazy(() => import("@/pages/Admin/Players/Forms").then(m => ({ default: m.PlayerForm })));

// Admin Tournaments
const Tournaments = lazy(() => import("@/pages/Admin/Tournaments"));
const TournamentForm = lazy(() => import("@/pages/Admin/Tournaments/Forms").then(m => ({ default: m.TournamentForm })));
const TournamentFormPlayers = lazy(() => import("@/pages/Admin/Tournaments/Forms/FormPlayers").then(m => ({ default: m.TournamentFormPlayers })));
const TournamentFormPoints = lazy(() => import("@/pages/Admin/Tournaments/Forms/FormPoints").then(m => ({ default: m.TournamentFormPoints })));
const TournamentFormBrackets = lazy(() => import("@/pages/Admin/Tournaments/Forms/FormBrackets").then(m => ({ default: m.TournamentFormBrackets })));
const TournamentFormGroup = lazy(() => import("@/pages/Admin/Tournaments/Forms/FormGroup").then(m => ({ default: m.TournamentFormGroup })));
const TournamentFormDone = lazy(() => import("@/pages/Admin/Tournaments/Forms/FormDone").then(m => ({ default: m.TournamentFormDone })));
const TournamentDetail = lazy(() => import("@/pages/Admin/Tournaments/detail").then(m => ({ default: m.TournamentDetail })));

// Admin Point Config
const PointConfigurations = lazy(() => import("@/pages/Admin/PointConfig"));
const PointConfigurationsForm = lazy(() => import("@/pages/Admin/PointConfig/New").then(m => ({ default: m.PointConfigurationsForm })));

// Admin Galleries
const Galleries = lazy(() => import("@/pages/Admin/Galleries"));
const GalleriesNew = lazy(() => import("@/pages/Admin/Galleries/New").then(m => ({ default: m.GalleriesNew })));
const GalleriesDetail = lazy(() => import("@/pages/Admin/Galleries/Detail").then(m => ({ default: m.GalleriesDetail })));

// Admin Blog
const BlogPosts = lazy(() => import("@/pages/Admin/Blog"));
const BlogPostsNew = lazy(() => import("@/pages/Admin/Blog/New").then(m => ({ default: m.BlogPostsNew })));
const BlogPostsDetail = lazy(() => import("@/pages/Admin/Blog/Detail").then(m => ({ default: m.BlogPostsDetail })));

// Admin Merchandise
const Merchandise = lazy(() => import("@/pages/Admin/Merchandise").then(m => ({ default: m.Merchandise })));
const MerchandiseNew = lazy(() => import("@/pages/Admin/Merchandise/New").then(m => ({ default: m.MerchandiseNew })));
const MerchandiseDetail = lazy(() => import("@/pages/Admin/Merchandise/Detail").then(m => ({ default: m.MerchandiseDetail })));

// Admin Match
const MatchDetail = lazy(() => import("@/pages/Admin/MatchDetail").then(m => ({ default: m.MatchDetail })));
const CustomMatchPage = lazy(() => import("@/pages/Admin/CustomMatch").then(m => ({ default: m.CustomMatchPage })));
const CustomMatchForm = lazy(() => import("@/pages/Admin/CustomMatch/SingleMatch/Forms").then(m => ({ default: m.CustomMatchForm })));
const FriendlyMatchForm = lazy(() => import("@/pages/Admin/CustomMatch/FriandlyMatch/Forms").then(m => ({ default: m.FriendlyMatchForm })));
const FriendlyMatchFormPlayers = lazy(() => import("@/pages/Admin/CustomMatch/FriandlyMatch/Forms/FormPlayers").then(m => ({ default: m.FriendlyMatchFormPlayers })));
const FriendlyMatchFormPoints = lazy(() => import("@/pages/Admin/CustomMatch/FriandlyMatch/Forms/FormPoints").then(m => ({ default: m.FriendlyMatchFormPoints })));
const FriendlyMatchFormSchedule = lazy(() => import("@/pages/Admin/CustomMatch/FriandlyMatch/Forms/FormSchedule").then(m => ({ default: m.FriendlyMatchFormSchedule })));
const FriendlyMatchDetail = lazy(() => import("@/pages/Admin/CustomMatch/FriandlyMatch/detail").then(m => ({ default: m.FriendlyMatchDetail })));

// Admin Orders
const Orders = lazy(() => import("@/pages/Admin/Orders").then(m => ({ default: m.Orders })));

// Player Pages
const PlayerHome = lazy(() => import("@/pages/Players/Home").then(m => ({ default: m.PlayerHome })));
const PlayerMatches = lazy(() => import("@/pages/Players/Matches").then(m => ({ default: m.PlayerMatches })));
const PlayerProfile = lazy(() => import("@/pages/Players/Profile").then(m => ({ default: m.PlayerProfile })));
const PlayerOrderHistory = lazy(() => import("@/pages/Players/OrderHistory").then(m => ({ default: m.PlayerOrderHistory })));
const PlayerOrderDetail = lazy(() => import("@/pages/Players/OrderHistory/detail").then(m => ({ default: m.PlayerOrderDetail })));

// Public Pages
const PublicGalleries = lazy(() => import("@/pages/Public/Galleries").then(m => ({ default: m.PublicGalleries })));
const PublicGalleriesDetail = lazy(() => import("@/pages/Public/Galleries/detail").then(m => ({ default: m.PublicGalleriesDetail })));
const PublicNews = lazy(() => import("@/pages/Public/Blog").then(m => ({ default: m.PublicNews })));
const PublicNewsDetail = lazy(() => import("@/pages/Public/Blog/detail").then(m => ({ default: m.PublicNewsDetail })));
const PublicTournament = lazy(() => import("@/pages/Public/Tournament").then(m => ({ default: m.PublicTournament })));
const PublicStandingPage = lazy(() => import("@/pages/Public/Tournament/StandingPage").then(m => ({ default: m.PublicStandingPage })));
const PublicChallenger = lazy(() => import("@/pages/Public/Challenger").then(m => ({ default: m.PublicChallenger })));
const PublicMatchDetail = lazy(() => import("@/pages/Public/Match").then(m => ({ default: m.PublicMatchDetail })));
const PublicPlayer = lazy(() => import("@/pages/Public/Player").then(m => ({ default: m.PublicPlayer })));
const PublicShop = lazy(() => import("@/pages/Public/Shop").then(m => ({ default: m.PublicShop })));
const PublicShopDetail = lazy(() => import("@/pages/Public/Shop/detail").then(m => ({ default: m.PublicShopDetail })));
const PublicShopCart = lazy(() => import("@/pages/Public/Shop/Cart").then(m => ({ default: m.PublicShopCart })));
const PublicShopCheckout = lazy(() => import("@/pages/Public/Shop/Cart/checkout").then(m => ({ default: m.PublicShopCheckout })));

const PublicLayout = lazy(() => import("./PublicLayout").then(m => ({ default: m.PublicLayout })));

// Loading component untuk Suspense
const PageLoader = () => <LoadingOverlay />;

// Add this component
function GeneralLayout() {
  return (
    <>
      <Outlet /> {/* This renders either Courts, CourtsNew or CourtsEdit */}
    </>
  );
}

// Wrapper untuk lazy loaded components dengan Suspense
const LazyWrapper = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<PageLoader />}>{children}</Suspense>
);


function Router() {
  const location = useLocation();
  const routes = [
    {
      path: paths.landingPage,
      element: (
        <LazyWrapper>
          <PublicLayout key={location.pathname} />
        </LazyWrapper>
      ),
      children: [{
        path: "",
        index: true,
        element: (
          <LazyWrapper>
            <LandingPage />
          </LazyWrapper>
        ),
      },
      {
        children: [
          {
            path: paths.tournament.match.template,
            element: (
              <LazyWrapper>
                <PublicMatchDetail />
              </LazyWrapper>
            )
          },
          {
            index: true,
            path: paths.tournament.index.template,
            element: (
              <LazyWrapper>
                <PublicTournament />
              </LazyWrapper>
            ),
          },
          {
            index: true,
            path: paths.tournament.standings.template,
            element: (
              <LazyWrapper>
                <PublicStandingPage />
              </LazyWrapper>
            ),
          },
        ],
      },
      {
        children: [
          {
            index: true,
            path: paths.challenger.index.template,
            element: (
              <LazyWrapper>
                <PublicChallenger />
              </LazyWrapper>
            ),
          },
          {
            path: paths.challenger.match.template,
            element: (
              <LazyWrapper>
                <PublicMatchDetail />
              </LazyWrapper>
            )
          }
        ],
      },
      {
        children: [
          {
            index: true,
            path: paths.challenger.index.template,
            element: (
              <LazyWrapper>
                <PublicChallenger />
              </LazyWrapper>
            ),
          },
          {
            path: paths.challenger.match.template,
            element: (
              <LazyWrapper>
                <PublicMatchDetail />
              </LazyWrapper>
            )
          }
        ],
      },
      {
        children: [
          {
            path: paths.players.info.template,
            element: (
              <LazyWrapper>
                <PublicPlayer />
              </LazyWrapper>
            )
          },
        ],
      },
      {
        children: [
          {
            path: paths.galleries.detail.template,
            element: (
              <LazyWrapper>
                <PublicGalleriesDetail />
              </LazyWrapper>
            ),
          },
          {
            path: paths.galleries.tags.template,
            element: (
              <LazyWrapper>
                <PublicGalleries />
              </LazyWrapper>
            ),
          },
          {
            path: paths.galleries.index,
            element: (
              <LazyWrapper>
                <PublicGalleries />
              </LazyWrapper>
            ),
          },
        ]
      },
      {
        children: [
          {
            path: paths.news.index,
            element: (
              <LazyWrapper>
                <PublicNews />
              </LazyWrapper>
            ),
          },
          {
            path: paths.news.detail.template,
            element: (
              <LazyWrapper>
                <PublicNewsDetail />
              </LazyWrapper>
            ),
          },
          {
            path: paths.news.tags.template,
            element: (
              <LazyWrapper>
                <PublicNews />
              </LazyWrapper>
            ),
          },
        ],
      },
      {
        children: [
          {
            path: paths.shop.index,
            element: (
              <LazyWrapper>
                <PublicShop />
              </LazyWrapper>
            ),
          },
          {
            path: paths.shop.detail.template,
            element: (
              <LazyWrapper>
                <PublicShopDetail />
              </LazyWrapper>
            ),
          },
          {
            path: paths.shop.cart,
            element: (
              <LazyWrapper>
                <PublicShopCart />
              </LazyWrapper>
            ),
          },
          {
            path: paths.shop.checkout,
            element: (
              <LazyWrapper>
                <PublicShopCheckout />
              </LazyWrapper>
            ),
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
          element: (
            <LazyWrapper>
              <DashboardAdministrator />
            </LazyWrapper>
          ),
        },
        {
          path: paths.administrator.masterData.tags,
          element: (
            <LazyWrapper>
              <Tags />
            </LazyWrapper>
          ),
        },
        {
          path: paths.administrator.masterData.categories,
          element: (
            <LazyWrapper>
              <Categories />
            </LazyWrapper>
          ),
        },
        {
          path: paths.administrator.masterData.sponsors,
          element: (
            <LazyWrapper>
              <Sponsors />
            </LazyWrapper>
          ),
        },
        {
          path: paths.administrator.masterData.levels,
          element: (
            <LazyWrapper>
              <Levels />
            </LazyWrapper>
          ),
        },
        {
          path: paths.administrator.masterData.leagues,
          element: (
            <LazyWrapper>
              <Leagues />
            </LazyWrapper>
          ),
        },
        {
          path: paths.administrator.masterData.pointConfig,
          element: (
            <LazyWrapper>
              <PointConfigurations />
            </LazyWrapper>
          ),
        },
        {
          path: paths.administrator.masterData.pointConfigForm.template,
          element: (
            <LazyWrapper>
              <PointConfigurationsForm />
            </LazyWrapper>
          ),
        },
        {
          path: paths.administrator.masterData.kudos,
          element: (
            <LazyWrapper>
              <Kudos />
            </LazyWrapper>
          ),
        },
        {
          path: paths.administrator.courts.index,
          element: <GeneralLayout key={location.pathname} />,
          children: [
            {
              index: true,  // This will match /admin/courts
              element: (
                <LazyWrapper>
                  <Courts />
                </LazyWrapper>
              ),
            },
            {
              path: paths.administrator.courts.new,
              element: (
                <LazyWrapper>
                  <CourtsNew />
                </LazyWrapper>
              ),
            },
            {
              path: paths.administrator.courts.edit.template,
              element: (
                <LazyWrapper>
                  <CourtsNew />
                </LazyWrapper>
              ),
            },
          ]
        },
        {
          path: paths.administrator.players.index,
          element: <GeneralLayout key={location.pathname} />,
          children: [
            {
              index: true,  // This will match /admin/courts
              element: (
                <LazyWrapper>
                  <Players />
                </LazyWrapper>
              ),
            },
            {
              path: paths.administrator.players.new,
              element: (
                <LazyWrapper>
                  <PlayerForm />
                </LazyWrapper>
              ),
            },
            {
              path: paths.administrator.players.edit.template,
              element: (
                <LazyWrapper>
                  <PlayerForm />
                </LazyWrapper>
              ),
            },
          ]
        },
        {
          path: paths.administrator.tournaments.index,
          element: <GeneralLayout key={location.pathname} />,
          children: [
            {
              index: true,  // This will match /admin/courts
              element: (
                <LazyWrapper>
                  <Tournaments />
                </LazyWrapper>
              ),
            },
            {
              path: paths.administrator.tournaments.detail.template,
              element: (
                <LazyWrapper>
                  <TournamentDetail />
                </LazyWrapper>
              ),
            },
            {
              path: paths.administrator.tournaments.match.template,
              element: (
                <LazyWrapper>
                  <MatchDetail />
                </LazyWrapper>
              ),
            },
            {
              path: paths.administrator.tournaments.new.players.template,
              element: (
                <LazyWrapper>
                  <TournamentFormPlayers />
                </LazyWrapper>
              ),
            },
            {
              path: paths.administrator.tournaments.new.group.template,
              element: (
                <LazyWrapper>
                  <TournamentFormGroup />
                </LazyWrapper>
              ),
            },
            {
              path: paths.administrator.tournaments.new.brackets.template,
              element: (
                <LazyWrapper>
                  <TournamentFormBrackets />
                </LazyWrapper>
              ),
            },
            {
              path: paths.administrator.tournaments.new.done.template,
              element: (
                <LazyWrapper>
                  <TournamentFormDone />
                </LazyWrapper>
              ),
            },
            {
              path: paths.administrator.tournaments.new.points.template,
              element: (
                <LazyWrapper>
                  <TournamentFormPoints />
                </LazyWrapper>
              ),
            },
            {
              path: paths.administrator.tournaments.edit.template,
              element: (
                <LazyWrapper>
                  <TournamentForm />
                </LazyWrapper>
              ),
            },
            {
              path: paths.administrator.tournaments.new.index,
              element: (
                <LazyWrapper>
                  <TournamentForm />
                </LazyWrapper>
              ),
            },
          ]
        },
        {
          path: paths.administrator.customMatch.index,
          element: <GeneralLayout key={location.pathname} />,
          children: [
            {
              index: true,
              element: (
                <LazyWrapper>
                  <CustomMatchPage />
                </LazyWrapper>
              ),
            },
            {
              path: paths.administrator.customMatch.detail.template,
              element: (
                <LazyWrapper>
                  <MatchDetail />
                </LazyWrapper>
              ),
            },
            {
              path: paths.administrator.customMatch.new,
              element: (
                <LazyWrapper>
                  <CustomMatchForm />
                </LazyWrapper>
              ),
            },
            {
              path: paths.administrator.customMatch.edit.template,
              element: (
                <LazyWrapper>
                  <CustomMatchForm />
                </LazyWrapper>
              ),
            },
            {
              path: paths.administrator.customMatch.friendlyMatch.index,
              element: <GeneralLayout key={location.pathname} />,
              children: [
                {
                  path: paths.administrator.customMatch.friendlyMatch.detail.template,
                  element: (
                    <LazyWrapper>
                      <FriendlyMatchDetail />
                    </LazyWrapper>
                  ),
                },
                {
                  path: paths.administrator.customMatch.friendlyMatch.new,
                  element: (
                    <LazyWrapper>
                      <FriendlyMatchForm />
                    </LazyWrapper>
                  ),
                },
                {
                  path: paths.administrator.customMatch.friendlyMatch.edit.index.template,
                  element: (
                    <LazyWrapper>
                      <FriendlyMatchForm />
                    </LazyWrapper>
                  ),
                },
                {
                  path: paths.administrator.customMatch.friendlyMatch.edit.players.template,
                  element: (
                    <LazyWrapper>
                      <FriendlyMatchFormPlayers />
                    </LazyWrapper>
                  ),
                },
                {
                  path: paths.administrator.customMatch.friendlyMatch.edit.points.template,
                  element: (
                    <LazyWrapper>
                      <FriendlyMatchFormPoints />
                    </LazyWrapper>
                  ),
                },
                {
                  path: paths.administrator.customMatch.friendlyMatch.edit.schedule.template,
                  element: (
                    <LazyWrapper>
                      <FriendlyMatchFormSchedule />
                    </LazyWrapper>
                  ),
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
              element: (
                <LazyWrapper>
                  <Galleries />
                </LazyWrapper>
              ),
            },
            {
              path: paths.administrator.galleries.detail.template,
              element: (
                <LazyWrapper>
                  <GalleriesDetail />
                </LazyWrapper>
              ),
            },
            {
              path: paths.administrator.galleries.edit.template,
              element: (
                <LazyWrapper>
                  <GalleriesNew />
                </LazyWrapper>
              ),
            },
            {
              path: paths.administrator.galleries.new.index,
              element: (
                <LazyWrapper>
                  <GalleriesNew />
                </LazyWrapper>
              ),
            },
          ]
        },
        {
          path: paths.administrator.blog.index,
          element: <GeneralLayout key={location.pathname} />,
          children: [
            {
              index: true,  // This will match /admin/courts
              element: (
                <LazyWrapper>
                  <BlogPosts />
                </LazyWrapper>
              ),
            },
            {
              path: paths.administrator.blog.detail.template,
              element: (
                <LazyWrapper>
                  <BlogPostsDetail />
                </LazyWrapper>
              ),
            },
            {
              path: paths.administrator.blog.edit.template,
              element: (
                <LazyWrapper>
                  <BlogPostsNew />
                </LazyWrapper>
              ),
            },
            {
              path: paths.administrator.blog.new.index,
              element: (
                <LazyWrapper>
                  <BlogPostsNew />
                </LazyWrapper>
              ),
            },
          ]
        },
        {
          path: paths.administrator.blog.index,
          element: <GeneralLayout key={location.pathname} />,
          children: [
            {
              index: true,  // This will match /admin/courts
              element: (
                <LazyWrapper>
                  <BlogPosts />
                </LazyWrapper>
              ),
            },
            {
              path: paths.administrator.blog.detail.template,
              element: (
                <LazyWrapper>
                  <BlogPostsDetail />
                </LazyWrapper>
              ),
            },
            {
              path: paths.administrator.blog.edit.template,
              element: (
                <LazyWrapper>
                  <BlogPostsNew />
                </LazyWrapper>
              ),
            },
            {
              path: paths.administrator.blog.new.index,
              element: (
                <LazyWrapper>
                  <BlogPostsNew />
                </LazyWrapper>
              ),
            },
          ]
        },
        {
          path: paths.administrator.merchandise.index,
          element: <GeneralLayout key={location.pathname} />,
          children: [
            {
              index: true,  // This will match /admin/courts
              element: (
                <LazyWrapper>
                  <Merchandise />
                </LazyWrapper>
              ),
            },
            {
              path: paths.administrator.merchandise.detail.template,
              element: (
                <LazyWrapper>
                  <MerchandiseDetail />
                </LazyWrapper>
              ),
            },
            {
              path: paths.administrator.merchandise.edit.template,
              element: (
                <LazyWrapper>
                  <MerchandiseNew />
                </LazyWrapper>
              ),
            },
            {
              path: paths.administrator.merchandise.new,
              element: (
                <LazyWrapper>
                  <MerchandiseNew />
                </LazyWrapper>
              ),
            },
          ]
        },
        {
          path: paths.administrator.orders.index.template,
          element: <GeneralLayout key={location.pathname} />,
          children: [
            {
              index: true,  // This will match /admin/courts
              element: (
                <LazyWrapper>
                  <Orders />
                </LazyWrapper>
              ),
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
          element: (
            <LazyWrapper>
              <PlayerHome />
            </LazyWrapper>
          ),
        },
        {
          path: paths.player.matches.index,
          element: (
            <LazyWrapper>
              <PlayerMatches />
            </LazyWrapper>
          ),
        },
        {
          path: paths.player.orders.index,
          element: (
            <LazyWrapper>
              <PlayerOrderHistory />
            </LazyWrapper>
          ),
        },
        {
          path: paths.player.orders.detail.template,
          element: (
            <LazyWrapper>
              <PlayerOrderDetail />
            </LazyWrapper>
          ),
        },
        {
          path: paths.player.profile.index,
          element: (
            <LazyWrapper>
              <PlayerProfile />
            </LazyWrapper>
          ),
        },
      ],
    },
    {
      path: paths.login,
      element: (
        <LazyWrapper>
          <Login />
        </LazyWrapper>
      ),
    },
    {
      path: "/register",
      element: (
        <LazyWrapper>
          <Register />
        </LazyWrapper>
      ),
    },
    {
      path: "/error-page",
      element: (
        <LazyWrapper>
          <ErrorPage />
        </LazyWrapper>
      ),
    },
    {
      path: "*",
      element: (
        <LazyWrapper>
          <ErrorPage />
        </LazyWrapper>
      ),
    },
  ];

  return useRoutes(routes);
}

export default Router;
