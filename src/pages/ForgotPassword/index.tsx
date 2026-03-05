import ThemeSwitcher from "@/components/ThemeSwitcher";
import { FormInput } from "@/components/Base/Form";
import Button from "@/components/Base/Button";
import clsx from "clsx";
import { paths } from "@/router/paths";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordPayloadSchema, forgotPasswordPayload } from "@/pages/Login/api/schema";
import { adminApiClient, adminApiHooks } from "@/pages/Login/api";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import Confirmation, { AlertProps } from "@/components/Modal/Confirmation";
import { IconLogo } from "@/assets/images/icons";
import { Illustration } from "@/assets/images/illustrations/illustrations";

function Main() {
  const navigate = useNavigate();
  const { mutate: actionForgotPasswordApi, isPending: isLoading } = adminApiHooks.useForgotPassword();
  const [modalAlert, setModalAlert] = useState<AlertProps>({
    open: false,
    onClose: () => { },
    icon: "CheckCircle",
    title: "",
    description: "",
    buttons: [],
    size: "md",
    dismissable: true,
  });

  const methods = useForm<forgotPasswordPayload>({
    defaultValues: {
      email: "",
    },
    resolver: zodResolver(forgotPasswordPayloadSchema),
    mode: "onChange",
  });

  const onSubmit = (values: forgotPasswordPayload) => {
    actionForgotPasswordApi(values, {
      onSuccess: (e) => {
        setModalAlert({
          ...modalAlert,
          title: "Email Sent",
          description: e.message,
          open: true,
          icon: "CheckCircle",
          variant: "success",
          onClose: () => {
            setModalAlert({ ...modalAlert, open: false });
            navigate("/login");
          },
          buttons: [
            {
              label: "Back to Login",
              variant: "primary",
              onClick: () => {
                setModalAlert({ ...modalAlert, open: false });
                navigate("/login");
              }
            }
          ]
        });
      },
      onError: (e) => {
        setModalAlert({
          ...modalAlert,
          title: "Error",
          description: e.message || "Something went wrong",
          open: true,
          icon: "MailWarning",
          variant: "warning",
          onClose: () => {
            setModalAlert({ ...modalAlert, open: false });
          },
          buttons: [
            {
              label: "OK",
              variant: "primary",
              onClick: () => {
                setModalAlert({ ...modalAlert, open: false });
              }
            }
          ]
        });
      },
    });
  };

  return (
    <>
      <div
        className={clsx([
          "p-3 sm:px-8 relative h-screen lg:overflow-hidden bg-primary xl:bg-white dark:bg-darkmode-800 xl:dark:bg-darkmode-600",
          "before:hidden before:xl:block before:content-[''] before:w-[57%] before:-mt-[28%] before:-mb-[16%] before:-ml-[13%] before:absolute before:inset-y-0 before:left-0 before:transform before:rotate-[-4.5deg] before:bg-primary/20 before:rounded-[100%] before:dark:bg-darkmode-400",
          "after:hidden after:xl:block after:content-[''] after:w-[57%] after:-mt-[20%] after:-mb-[13%] after:-ml-[13%] after:absolute after:inset-y-0 after:left-0 after:transform before:rotate-[-4.5deg] after:bg-primary after:rounded-[100%] after:dark:bg-darkmode-700",
        ])}
      >
        <ThemeSwitcher />
        <div className="container relative z-10 sm:px-10">
          <div className="block grid-cols-2 gap-4 xl:grid">
            {/* BEGIN: Forgot Password Info */}
            <div className="flex-col hidden min-h-screen xl:flex">
              <a href={paths.landingPage} className="flex items-center pt-5 -intro-x">
                <IconLogo className="w-16 h-12 text-white" />
                <span className="ml-3 text-lg text-white"> Seventy Five </span>
              </a>
              <div className="my-auto">
                <div
                  className="w-1/2 -intro-x"
                >
                  <Illustration className="w-full h-full" />
                </div>
                <div className="mt-10 text-4xl font-medium leading-tight text-white -intro-x">
                  Forgot your password? <br />
                  No worries, we'll help you reset it.
                </div>
                <div className="mt-5 text-lg text-white -intro-x text-opacity-70 dark:text-slate-400">
                  Enter your email address and we'll send you a link to reset your password.
                </div>
              </div>
            </div>
            {/* END: Forgot Password Info */}
            {/* BEGIN: Forgot Password Form */}
            <div className="flex h-screen py-5 my-10 xl:h-auto xl:py-0 xl:my-0">
              <div className="w-full px-5 py-8 mx-auto my-auto bg-white rounded-md shadow-md xl:ml-20 dark:bg-darkmode-600 xl:bg-transparent sm:px-8 xl:p-0 xl:shadow-none sm:w-3/4 lg:w-2/4 xl:w-auto">
                <h2 className="text-2xl font-bold text-center intro-x xl:text-3xl xl:text-left">
                  Forgot Password
                </h2>
                <div className="mt-2 text-center intro-x text-slate-400 xl:hidden">
                  No worries, we'll help you reset it. Enter your email address and we'll send you a link.
                </div>
                <FormProvider {...methods}>
                  <form onSubmit={methods.handleSubmit(onSubmit)}>
                    <div className="mt-8 intro-x">
                      <Controller
                        name="email"
                        control={methods.control}
                        render={({ field, fieldState }) => {
                          return (
                            <FormInput
                              type="email"
                              onChange={field.onChange}
                              autoComplete="email"
                              className="block px-4 py-3 intro-x min-w-full xl:min-w-[350px]"
                              placeholder="Email address"
                              name="email"
                            />
                          );
                        }}
                      />
                    </div>
                    <div className="mt-5 text-center intro-x xl:mt-8 xl:text-left">
                      <Button
                        variant="primary"
                        className="w-full px-4 py-3 align-top xl:w-32 xl:mr-3 text-nowrap"
                        type="submit"
                        disabled={isLoading}
                      >
                        {isLoading ? "Sending.." : "Send Reset Link"}
                      </Button>
                      <Button
                        variant="outline-secondary"
                        className="w-full px-4 py-3 mt-3 align-top xl:w-32 xl:mt-0"
                        onClick={() => navigate("/login")}
                      >
                        Back to Login
                      </Button>
                    </div>
                  </form>
                </FormProvider>
              </div>
            </div>
            {/* END: Forgot Password Form */}
          </div>
        </div>
      </div>
      <Confirmation
        title={modalAlert.title || "Forgot Password"}
        description={modalAlert.description || "Are you sure?"}
        open={modalAlert.open}
        onClose={modalAlert.onClose}
        onConfirm={modalAlert.onConfirm}
        icon={modalAlert.icon}
        variant={modalAlert.variant}
        buttons={modalAlert.buttons}
      />
    </>
  );
}

export default Main;
