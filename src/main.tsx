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
import 'react-quill/dist/quill.snow.css';
import { ConfigProvider } from "antd";
import { antdThemeProvider } from "./utils/store/config";
import { clientEnv } from "@/env";
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <QueryClientProvider client={queryClient}>
    <BrowserRouter basename={clientEnv.BASENAME}>
      <Provider store={store}>
        <JotaiProvider store={jotaiStore}>
          <ToastProvider>
            <ConfigProvider theme={antdThemeProvider}>
              <Router />
            </ConfigProvider>
          </ToastProvider>
          <LoadingOverlay />
        </JotaiProvider>
      </Provider>
      <ScrollToTop />
    </BrowserRouter>
  </QueryClientProvider>
);
