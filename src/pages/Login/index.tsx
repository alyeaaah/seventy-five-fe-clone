import ThemeSwitcher from "@/components/ThemeSwitcher";
import { FormInput, FormCheck } from "@/components/Base/Form";
import Button from "@/components/Base/Button";
import clsx from "clsx";
import { useSetAtom } from "jotai";
import { paths } from "@/router/paths";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginPayload, loginPayloadSchema } from "./api/schema";
import { adminApiClient, adminApiHooks } from "./api";
import { accessTokenAtom, userAtom } from "@/utils/store";
import { IconLogo } from "@/assets/images/icons";
import { Illustration } from "@/assets/images/illustrations/illustrations";
import { useNavigate } from "react-router-dom";

function Main() {
  const setUser = useSetAtom(userAtom);
  const setToken = useSetAtom(accessTokenAtom);
  const navigate = useNavigate();
  const { mutate: actionLoginApi } = adminApiHooks.useLogin();

  const methods = useForm({
    defaultValues: {
      username: "",
      password: "",
    },
    resolver: zodResolver(loginPayloadSchema),
    mode: "onChange",
  });

  const goLogin = (values: loginPayload) => {
    actionLoginApi(values, {
      onSuccess: async (e) => {
        setToken(e.token);
        adminApiClient.get("/user/get").then((res) => {  
          setUser(res.data);
          if (res.data.role == "admin") {
            navigate(paths.administrator.dashboard);
          }
          if (res.data.role == "player") {
            navigate(paths.player.home);
          }
        }).catch((e) => {
          console.error("Failed to fetch user data:", e);
        });
      },
      onError: (e: any) => {
        alert("Failed to login");
      },
    });
  }
  return (
    <>
      <div
        className={clsx([
          "p-3 sm:px-8 relative h-screen lg:overflow-hidden bg-primary xl:bg-white dark:bg-darkmode-800 xl:dark:bg-darkmode-600",
          "before:hidden before:xl:block before:content-[''] before:w-[57%] before:-mt-[28%] before:-mb-[16%] before:-ml-[13%] before:absolute before:inset-y-0 before:left-0 before:transform before:rotate-[-4.5deg] before:bg-primary/20 before:rounded-[100%] before:dark:bg-darkmode-400",
          "after:hidden after:xl:block after:content-[''] after:w-[57%] after:-mt-[20%] after:-mb-[13%] after:-ml-[13%] after:absolute after:inset-y-0 after:left-0 after:transform after:rotate-[-4.5deg] after:bg-primary after:rounded-[100%] after:dark:bg-darkmode-700",
        ])}
      >
        <ThemeSwitcher />
        <div className="container relative z-10 sm:px-10">
          <div className="block grid-cols-2 gap-4 xl:grid">
            {/* BEGIN: Login Info */}
            <div className="flex-col hidden min-h-screen xl:flex">
              <a href={paths.landingPage} className="flex items-center pt-5 -intro-x">
                <IconLogo className="w-16 h-12 text-white"/>
                <span className="ml-3 text-lg text-white"> Seventy Five </span>
              </a>
              <div className="my-auto">
                <div
                  className="w-1/2 -intro-x"
                >
                  <Illustration className="w-full h-full" />
                </div>
                <div className="mt-10 text-4xl font-medium leading-tight text-white -intro-x">
                  A few more clicks to <br />
                  sign in to your account.
                </div>
                <div className="mt-5 text-lg text-white -intro-x text-opacity-70 dark:text-slate-400">
                  Manage all your tennis club in one place
                </div>
              </div>
            </div>
            {/* END: Login Info */}
            {/* BEGIN: Login Form */}
            <div className="flex h-screen py-5 my-10 xl:h-auto xl:py-0 xl:my-0">
              <div className="w-full px-5 py-8 mx-auto my-auto bg-white rounded-md shadow-md xl:ml-20 dark:bg-darkmode-600 xl:bg-transparent sm:px-8 xl:p-0 xl:shadow-none sm:w-3/4 lg:w-2/4 xl:w-auto">
                <h2 className="text-2xl font-bold text-center intro-x xl:text-3xl xl:text-left">
                  Sign In
                </h2>
                <div className="mt-2 text-center intro-x text-slate-400 xl:hidden">
                  A few more clicks to sign in to your account. Manage all your
                  tennis club in one place
                </div>
                <FormProvider {...methods}>
                <form onSubmit={methods.handleSubmit(goLogin)}>
                <div className="mt-8 intro-x">
                  <Controller
                    name="username"
                    control={methods.control}
                    render={({ field, fieldState }) => {
                      return (
                          <FormInput
                            type="email"
                            onChange={field.onChange}
                            autoComplete="email"
                            className="block px-4 py-3 intro-x min-w-full xl:min-w-[350px]"
                            placeholder="Email"
                            name="username"
                          />
                      );
                    }}
                  />
                  <Controller
                    name="password"
                    control={methods.control}
                    render={({ field, fieldState }) => {
                      return (
                        <FormInput
                          type="password"
                          onChange={field.onChange}
                          className="block px-4 py-3 mt-4 intro-x min-w-full xl:min-w-[350px]"
                          placeholder="Password"
                          autoComplete="current-password"
                          name="password"
                        />
                      );
                    }}
                  />
                </div>
                <div className="flex mt-4 text-xs intro-x text-slate-600 dark:text-slate-500 sm:text-sm">
                  <div className="flex items-center mr-auto">
                    <FormCheck.Input
                      id="remember-me"
                      type="checkbox"
                      className="mr-2 border"
                    />
                    <label
                      className="cursor-pointer select-none"
                      htmlFor="remember-me"
                    >
                      Remember me
                    </label>
                  </div>
                  <a href="">Forgot Password?</a>
                </div>
                <div className="mt-5 text-center intro-x xl:mt-8 xl:text-left">
                  <Button
                    variant="primary"
                    className="w-full px-4 py-3 align-top xl:w-32 xl:mr-3"
                    onClick={methods.handleSubmit(goLogin)}
                    type="submit"
                  >
                    Login
                  </Button>
                  <Button
                    variant="outline-secondary"
                  className="w-full px-4 py-3 mt-3 align-top xl:w-32 xl:mt-0"
                  onClick={() => navigate(paths.register)}
                  >
                    Register
                  </Button>
                    </div>
                </form>
                </FormProvider>
                <div className="mt-10 text-center intro-x xl:mt-24 text-slate-600 dark:text-slate-500 xl:text-left">
                  By signin up, you agree to our{" "}
                  <a className="text-primary dark:text-slate-200" href="">
                    Terms and Conditions
                  </a>{" "}
                  &{" "}
                  <a className="text-primary dark:text-slate-200" href="">
                    Privacy Policy
                  </a>
                </div>
              </div>
            </div>
            {/* END: Login Form */}
          </div>
        </div>
      </div>
    </>
  );
}

export default Main;
