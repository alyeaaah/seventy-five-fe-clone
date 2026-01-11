import ScrollToTop from "@/components/Base/ScrollToTop";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./stores/store";
import Router from "./router";
import "./assets/css/app.css";
import { store as jotaiStore } from "./utils/store";
import { Provider as JotaiProvider } from "jotai";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./utils/react-query";
import LoadingOverlay from "@/components/LoadingOverlay";
import { ToastProvider } from "./components/Toast/ToastProvider";
// react-quill CSS dipindah ke component level untuk lazy loading
import { ConfigProvider } from "antd";
import { getAntdThemeProvider } from "./utils/store/config";
import { clientEnv } from "@/env";
import { useAppSelector } from "./stores/hooks";
import { selectDarkMode } from "./stores/darkModeSlice";

// Wrapper component untuk ConfigProvider yang reactive terhadap dark mode
function AntdConfigProvider({ children }: { children: React.ReactNode }) {
  const isDarkMode = useAppSelector(selectDarkMode);
  const theme = getAntdThemeProvider(isDarkMode);

  return (
    <ConfigProvider theme={theme}>
      {children}
    </ConfigProvider>
  );
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <QueryClientProvider client={queryClient}>
    <BrowserRouter basename={clientEnv.BASENAME}>
      <Provider store={store}>
        <JotaiProvider store={jotaiStore}>
          <ToastProvider>
            <AntdConfigProvider>
              <Router />
            </AntdConfigProvider>
          </ToastProvider>
          <LoadingOverlay />
        </JotaiProvider>
      </Provider>
      <ScrollToTop />
    </BrowserRouter>
  </QueryClientProvider>
);
