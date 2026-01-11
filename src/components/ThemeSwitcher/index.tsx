import { useAppDispatch, useAppSelector } from "@/stores/hooks";
import { selectDarkMode, setDarkMode } from "@/stores/darkModeSlice";
import { Slideover } from "@/components/Base/Headless";
import Lucide from "@/components/Base/Lucide";
import { useState, useEffect, useCallback } from "react";
import clsx from "clsx";

function Main() {
  const dispatch = useAppDispatch();
  const [themeSwitcherSlideover, setThemeSwitcherSlideover] = useState(false);
  const activeDarkMode = useAppSelector(selectDarkMode);

  // Sync dark mode class ke HTML element
  useEffect(() => {
    const htmlEl = document.documentElement;
    if (activeDarkMode) {
      htmlEl.classList.add("dark");
    } else {
      htmlEl.classList.remove("dark");
    }
  }, [activeDarkMode]);

  const switchDarkMode = useCallback((darkMode: boolean) => {
    dispatch(setDarkMode(darkMode));
  }, [dispatch]);

  return (
    <div>
      <Slideover
        open={themeSwitcherSlideover}
        onClose={() => {
          setThemeSwitcherSlideover(false);
        }}
      >
        <Slideover.Panel className="w-72 rounded-[0.75rem_0_0_0.75rem/1.1rem_0_0_1.1rem]">
          <button
            type="button"
            className="focus:outline-none hover:bg-white/10 bg-white/5 transition-all hover:rotate-180 absolute inset-y-0 left-0 right-auto flex items-center justify-center my-auto -ml-[60px] sm:-ml-[105px] border rounded-full text-white/90 w-8 h-8 sm:w-14 sm:h-14 border-white/90 hover:scale-105"
            onClick={() => setThemeSwitcherSlideover(false)}
            aria-label="Close theme switcher"
          >
            <Lucide className="w-3 h-3 sm:w-8 sm:h-8 stroke-[1]" icon="X" />
          </button>
          <Slideover.Description className="p-0">
            <div className="flex flex-col">
              <div className="px-8 pt-6 pb-8">
                <div className="text-base font-medium">Appearance</div>
                <div className="mt-0.5 text-slate-500">
                  Choose your appearance
                </div>
                <div className="mt-5 grid grid-cols-2 gap-3.5">
                  <div>
                    <button
                      type="button"
                      onClick={() => switchDarkMode(false)}
                      className={clsx([
                        "h-12 cursor-pointer bg-slate-50 box p-1 border-slate-300/80 block w-full",
                        "[&.active]:border-2 [&.active]:border-theme-1/60",
                        !activeDarkMode ? "active" : "",
                      ])}
                    >
                      <div className="h-full overflow-hidden rounded-md bg-slate-200"></div>
                    </button>
                    <div className="mt-2.5 text-center text-xs capitalize">
                      Light
                    </div>
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={() => switchDarkMode(true)}
                      className={clsx([
                        "h-12 cursor-pointer bg-slate-50 box p-1 border-slate-300/80 block w-full",
                        "[&.active]:border-2 [&.active]:border-theme-1/60",
                        activeDarkMode ? "active" : "",
                      ])}
                    >
                      <div className="h-full overflow-hidden rounded-md bg-slate-900"></div>
                    </button>
                    <div className="mt-2.5 text-center text-xs capitalize">
                      Dark
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Slideover.Description>
        </Slideover.Panel>
      </Slideover>
      <button
        type="button"
        onClick={() => setThemeSwitcherSlideover(true)}
        className="fixed bottom-0 right-0 z-50 flex items-center justify-center mb-5 mr-5 text-white rounded-full shadow-lg cursor-pointer w-14 h-14 bg-theme-1 hover:bg-theme-1/90 transition-colors"
        aria-label="Open theme switcher"
      >
        <Lucide className="w-5 h-5 animate-spin" icon="Settings" />
      </button>
    </div>
  );
}

export default Main;
