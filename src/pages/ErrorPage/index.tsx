import ThemeSwitcher from "@/components/ThemeSwitcher";
import Button from "@/components/Base/Button";
import { useNavigate } from "react-router-dom";
import { ErrorIllustration } from "@/assets/images/illustrations/illustrations";

function Main() {
  const navigate = useNavigate();
  return (
    <>
      <div className="py-2 bg-gradient-to-b from-theme-1 to-theme-2 dark:from-darkmode-800 dark:to-darkmode-800">
        <ThemeSwitcher />
        <div className="container">
          {/* BEGIN: Error Page */}
          <div className="flex flex-col items-center justify-center h-screen text-center error-page lg:flex-row lg:text-left">
            <div className="-intro-x lg:mr-20">
              <ErrorIllustration className="w-[450px] h-48 lg:h-auto" />
            </div>
            <div className="mt-10 text-white lg:mt-0">
              <div className="font-medium intro-x text-8xl">404</div>
              <div className="mt-5 text-xl font-medium intro-x lg:text-3xl">
                Oops. This page has gone missing.
              </div>
              <div className="mt-3 text-lg intro-x">
                You may have mistyped the address or the page may have moved.
              </div>
              <Button className="px-4 py-3 mt-10 text-white border-white intro-x dark:border-darkmode-400 dark:text-slate-200" onClick={() => navigate(-1)}>
                Back to Previous Page
              </Button>
            </div>
          </div>
          {/* END: Error Page */}
        </div>
      </div>
    </>
  );
}

export default Main;
