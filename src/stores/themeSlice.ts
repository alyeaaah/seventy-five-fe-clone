import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "./store";
import RubickSideMenu from "@/themes/Rubick/SideMenu";
import EnigmaTopMenu from "@/themes/Enigma/TopMenu";

// Hanya include themes yang digunakan:
// - Rubick (side-menu) untuk admin
// - Enigma (top-menu) untuk player/public
export const themes = [
  {
    name: "rubick",
    layout: "side-menu",
    component: RubickSideMenu,
  },
  {
    name: "enigma",
    layout: "top-menu",
    component: EnigmaTopMenu,
  },
] as const;

export type Themes = (typeof themes)[number];

interface ThemeState {
  value: {
    name: Themes["name"];
    layout: Themes["layout"];
  };
}

export const getTheme = (search?: {
  name: Themes["name"];
  layout: Themes["layout"];
}) => {
  const searchValues =
    search === undefined
      ? {
          name: localStorage.getItem("theme"),
          layout: localStorage.getItem("layout"),
        }
      : search;
  return themes.filter((item, key) => {
    return (
      item.name === searchValues.name && item.layout === searchValues.layout
    );
  })[0];
};

const initialState: ThemeState = {
  value: {
    name:
      localStorage.getItem("theme") === null ? themes[0].name : getTheme().name,
    layout:
      localStorage.getItem("layout") === null
        ? themes[0].layout
        : getTheme().layout,
  },
};

export const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<Themes["name"]>) => {
      state.value = {
        name: action.payload,
        layout: state.value.layout,
      };

      localStorage.setItem("theme", action.payload);
    },
    setLayout: (state, action: PayloadAction<Themes["layout"]>) => {
      state.value = {
        name: state.value.name,
        layout: action.payload,
      };

      localStorage.setItem("layout", action.payload);
    },
  },
});

export const { setTheme, setLayout } = themeSlice.actions;

export const selectTheme = (state: RootState) => state.theme.value;

export default themeSlice.reducer;
