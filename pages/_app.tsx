import { ConfigProvider } from "antd";
import type { AppProps } from "next/app";

import React from "react";
import "../src/assets/css/app.css";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ConfigProvider
      theme={{
        components: {
          DatePicker: {
            controlHeight:38
          },
          Menu: {
            itemColor: 'rgb(19,95,70)', // gray-500
            itemSelectedColor: 'rgb(19,95,70)', // blue-500
            itemHoverColor: 'rgb(19,95,70)', // blue-500
            itemSelectedBg: 'rgb(19,95,70)', // blue-50
            colorPrimaryBorder: 'rgb(19,95,70)', // blue-50
            colorText: 'rgb(19,95,70)', // blue-50
            horizontalItemSelectedColor: 'rgb(19,95,70)', // blue-50
            horizontalItemHoverColor: 'rgb(19,95,70)', // blue-50
            horizontalLineHeight: 20,
            motionEaseInOut: "none",
          },
          Layout: {
            bodyBg: "rgb(19,95,70)",
          },
        },
      }}
    >
      <Component {...pageProps} />
    </ConfigProvider>
  );
}
