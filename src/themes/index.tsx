import {
  selectTheme,
  getTheme,
  setTheme,
  themes,
  Themes,
  setLayout,
} from "@/stores/themeSlice";
import { useAppDispatch, useAppSelector } from "@/stores/hooks";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";

function Main(props: {
  type: "admin" | "player" | "public";
}) {

  const dispatch = useAppDispatch();
  const theme = useAppSelector(selectTheme);
  const Component = getTheme(theme).component;

  const { search } = useLocation();
  const queryParams = new URLSearchParams(search);

  const switchTheme = (theme: Themes["name"]) => {
    dispatch(setTheme(theme));
  };

  const switchLayout = (theme: Themes["layout"]) => {
    dispatch(setLayout(theme));
  };

  useEffect(() => {
    switch (props.type) {
      case "admin":
        switchTheme("rubick")
        switchLayout("side-menu")
        break;
      case "player":
        switchTheme("enigma")
        switchLayout("top-menu")
        break;
      default:
        switchTheme("enigma")
        switchLayout("top-menu")
        break;
    }
  }, []);

  return (
    <div>
      <ThemeSwitcher />
      <Component />
    </div>
  );
}

export default Main;
