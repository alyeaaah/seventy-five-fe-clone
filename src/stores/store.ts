import { configureStore, ThunkAction, Action, Middleware } from "@reduxjs/toolkit";
import darkModeReducer from "./darkModeSlice";
import colorSchemeReducer from "./colorSchemeSlice";
import menuReducer from "./menuSlice";
import themeReducer from "./themeSlice";

// Define the store state type inline to avoid circular reference
type StoreState = {
  darkMode: ReturnType<typeof darkModeReducer>;
  colorScheme: ReturnType<typeof colorSchemeReducer>;
  menu: ReturnType<typeof menuReducer>;
  theme: ReturnType<typeof themeReducer>;
};

// Middleware untuk sync localStorage (optimasi: pindahkan side effects dari selectors)
const localStorageSyncMiddleware: Middleware<{}, StoreState> = (store) => (next) => (action) => {
  const result = next(action);
  
  // Sync ke localStorage setelah action (hanya untuk actions yang mengubah state)
  const state = store.getState();
  if (state.darkMode) {
    localStorage.setItem("darkMode", state.darkMode.value.toString());
  }
  if (state.colorScheme) {
    localStorage.setItem("colorScheme", state.colorScheme.value);
  }
  if (state.theme) {
    localStorage.setItem("theme", state.theme.value.name);
    localStorage.setItem("layout", state.theme.value.layout);
  }
  
  return result;
};

export const store = configureStore({
  reducer: {
    darkMode: darkModeReducer,
    colorScheme: colorSchemeReducer,
    menu: menuReducer,
    theme: themeReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(localStorageSyncMiddleware),
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
