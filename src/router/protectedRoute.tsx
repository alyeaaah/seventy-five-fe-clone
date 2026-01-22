import { useToast } from "@/components/Toast/ToastContext";
import { accessTokenAtom, unauthorizedErrorMessageAtom, userAtom } from "@/utils/store";
import { useAtomValue, useSetAtom } from "jotai";
import { PropsWithChildren } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { paths } from "./paths";

export function ProtectedRoute(props: Readonly<PropsWithChildren>) {
  const location = useLocation();

  const accessToken = useAtomValue(accessTokenAtom);
  const user = useAtomValue(userAtom);
  const errorMessage = useAtomValue(unauthorizedErrorMessageAtom);
  const toast = useToast();
  const setUser = useSetAtom(userAtom);
  const setToken = useSetAtom(accessTokenAtom);

  // const { data: menus } = authApiHooks.useGetMenus();
  if (!accessToken || !user) {
    /// encode uri component for redirect after login
    /// exclude url redirect if from /dashboard
    const urlRedirect = encodeURIComponent(location.pathname + location.search);

    toast.showNotification({
      text: errorMessage ? "Your session expired" : "Unauthorized",
      duration: 5000,
      icon: "ShieldAlert",
      variant: "danger"
    })
    setUser(null);
    setToken(null);
    return (
      <Navigate
        to={{
          pathname: '/login',
          search:
            location.pathname === "/dashboard"
              ? ""
              : `?redirect=${urlRedirect}`,
        }}
      />
    );
  }
  if (user.role) {
    //get first index
    const firstPath = location.pathname.split("/").filter(d => !!d).shift();

    // if (user.role === "admin" && firstPath == "player") { 
    //   return <Navigate to={paths.administrator.dashboard} />;
    // }
    if (user.role === "player" && firstPath == "admin") {
      return <Navigate to={paths.player.home} />;
    }
    if (!["admin", "player"].includes(user.role)) {
      return <Navigate to={paths.landingPage} />;
    }
  }

  const redirectParam = new URLSearchParams(location.search).get("redirect");
  if (redirectParam) {
    return <Navigate to={redirectParam} />;
  }
  return props.children;
}
