import { useRoutes } from "react-router-dom";
import { lazy } from "react";

const LandingPage = lazy(() => import("../pages/Public/LandingPage").then(m => ({ default: m.LandingPage })));

function TestRouter() {
  const routes = [
    {
      path: "/",
      element: <div>Loading test page...</div>
    },
    {
      path: "/test",
      element: <LandingPage />
    }
  ];

  return useRoutes(routes);
}

export default TestRouter;
