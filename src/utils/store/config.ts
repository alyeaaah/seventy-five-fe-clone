import { ThemeConfig, theme } from "antd";

export const getAntdThemeProvider = (isDarkMode: boolean): ThemeConfig => ({
  token: {
    colorPrimary: "rgb(19,95,70)",
  },
  algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
  components: {
    DatePicker: {
      controlHeight: 38,
    },
    Menu: {
      itemColor: "rgb(19,95,70)",
      itemSelectedColor: "rgb(19,95,70)",
      itemHoverColor: "rgb(19,95,70)",
      itemSelectedBg: "rgb(19,95,70)",
      colorPrimaryBorder: "rgb(19,95,70)",
      colorText: "rgb(19,95,70)",
      horizontalItemSelectedColor: "rgb(19,95,70)",
      horizontalItemHoverColor: "rgb(19,95,70)",
      horizontalLineHeight: 20,
      motionEaseInOut: "none",
    },
    Layout: {
      bodyBg: "rgb(19,95,70)",
    },
    Table: {
      colorBgContainer: isDarkMode ? "rgb(41, 53, 82)" : "#ffffff",
      colorText: isDarkMode ? "rgb(226, 232, 240)" : "rgba(0, 0, 0, 0.88)",
      colorTextHeading: isDarkMode ? "rgb(226, 232, 240)" : "rgba(0, 0, 0, 0.88)",
      colorBorderSecondary: isDarkMode ? "rgb(53, 69, 103)" : "#f0f0f0",
      colorFillAlter: isDarkMode ? "rgb(48, 61, 93)" : "#fafafa",
      colorFillSecondary: isDarkMode ? "rgb(48, 61, 93)" : "#fafafa",
      rowHoverBg: isDarkMode ? "rgb(53, 69, 103)" : "#fafafa",
      headerBg: isDarkMode ? "rgb(35, 45, 69)" : "#fafafa",
      headerColor: isDarkMode ? "rgb(226, 232, 240)" : "rgba(0, 0, 0, 0.88)",
      borderColor: isDarkMode ? "rgb(53, 69, 103)" : "#f0f0f0",
      // Ensure all cells have proper background in dark mode
      cellPaddingBlock: 12,
      cellPaddingInline: 16,
    },
  },
});

// Default theme (will be overridden by dynamic provider)
export const antdThemeProvider = getAntdThemeProvider(
  typeof window !== "undefined" && localStorage.getItem("darkMode") === "true"
);