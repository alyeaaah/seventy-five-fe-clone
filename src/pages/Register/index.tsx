import ThemeSwitcher from "@/components/ThemeSwitcher";
import logoUrl from "@/assets/images/logo.svg";
import illustrationUrl from "@/assets/images/illustration.svg";
import { FormInput, FormCheck, FormLabel, InputGroup, FormHelp, FormTextarea } from "@/components/Base/Form";
import Button from "@/components/Base/Button";
import clsx from "clsx";
import { IconLogo } from "@/assets/images/icons";
import { Illustration } from "@/assets/images/illustrations/illustrations";
import { Controller, FormProvider, SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RegisterPayload, registerSchema } from "./api/schema";
import Litepicker from "@/components/Base/Litepicker";
import moment from "moment";
import { GenderTypeValue } from "@/utils/faker";
import { useRef, useState } from "react";
import { RegisterApiHooks } from "./api";
import { useToast } from "@/components/Toast/ToastContext";
import { useNavigate } from "react-router-dom";
import { paths } from "@/router/paths";
import Confirmation, { AlertProps } from "@/components/Modal/Confirmation";

export const Register = () => {
  const [agreement, setAgreement] = useState<boolean>(false);
  const { showNotification } = useToast();
  const navigate = useNavigate();
  const formRef = useRef<HTMLFormElement>(null);

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
  const methods = useForm({
    mode: "onChange",
    defaultValues: {
      name: "",
      email: "",
      username: "",
      phone: "",
      password: "",
      confirmPassword: "",
      dateOfBirth: "",
      placeOfBirth: "",
      gender: "",
    },
    resolver: zodResolver(registerSchema),
  });
  const { control, formState, handleSubmit, setValue, watch, getValues } = methods;
  const { mutate: actionRegisterPlayer } = RegisterApiHooks.useRegister({},
    {
      retry: 0,
      onSuccess: () => {
        showNotification({
          duration: 3000,
          text: "Player registered successfully, please login",
          icon: "WashingMachine",
          variant: "success",
        });
        setModalAlert({
          ...modalAlert,
          title: "Register Success",
          description: "You have successfully registered, please login",
          open: true,
          icon: "MailCheck",
          variant: "warning",
          onClose: () => {
            setModalAlert({ ...modalAlert, open: false })
            navigate(paths.login({}).$);
          },
          buttons: [
            {
              label: "Cancel",
              variant: "outline-secondary",
              onClick: () => {
                setModalAlert({ ...modalAlert, open: false })
                // window.location.reload();
              }
            },
            {
              label: "Go to Login",
              variant: "primary",
              onClick: () => {
                setModalAlert({ ...modalAlert, open: false })
                navigate(paths.login({}).$);
              }
            }
          ]
        })
      },
      onError: (err) => {
        showNotification({
          text: err.message,
          duration: 2000
        })
        setModalAlert({
          description: err.message,
          icon: "ShieldAlert",
          onClose: () => {
            setModalAlert({
              ...modalAlert,
              open: false,
              icon: "CheckCircle",
              buttons: [],
            })
          },
          dismissable: true,
          title: "Register Failed",
          buttons: [
            {
              type: "button",
              label: "Go to Login",
              variant: "primary",
              onClick: () => {
                setModalAlert({
                  ...modalAlert,
                  open: false,
                  icon: "CheckCircle",
                  buttons: [],
                })
                navigate(paths.login({}).$);
              },
            },
            {
              type: "button",
              label: "Cancel",
              variant: "outline-primary",
              onClick: () => {
                setModalAlert({
                  ...modalAlert,
                  open: false,
                  icon: "CheckCircle",
                  buttons: [],
                })
              },
            }
          ],
          open: true,

        })
      }
    }
  );
  const onSubmit: SubmitHandler<any> = (data: RegisterPayload) => {
    actionRegisterPlayer(data);
  };
  return (
    <>
      <div
        className={clsx([
          "sm:px-8 relative h-screen lg:overflow-hidden bg-primary xl:bg-white dark:bg-darkmode-800 xl:dark:bg-darkmode-600",
          "before:hidden before:xl:block before:content-[''] before:w-[57%] before:-mt-[28%] before:-mb-[16%] before:-ml-[13%] before:absolute before:inset-y-0 before:left-0 before:transform before:rotate-[-4.5deg] before:bg-primary/20 before:rounded-[100%] before:dark:bg-darkmode-400",
          "after:hidden after:xl:block after:content-[''] after:w-[57%] after:-mt-[20%] after:-mb-[13%] after:-ml-[13%] after:absolute after:inset-y-0 after:left-0 after:transform after:rotate-[-4.5deg] after:bg-primary after:rounded-[100%] after:dark:bg-darkmode-700",
        ])}
      >
        <ThemeSwitcher />
        <div className="container relative z-10 sm:px-10">
          <div className="block grid-cols-2 gap-4 xl:grid">
            {/* BEGIN: Register Info */}
            <div className="flex-col hidden min-h-screen xl:flex">
              <a href="/" className="flex items-center pt-5 -intro-x">
                <IconLogo className="h-8 w-16 text-white" />
                <span className="ml-3 text-lg text-white"> Seventy Five </span>
              </a>
              <div className="my-auto">
                <Illustration className="w-1/2 h-1/2 -mt-16 -intro-x" />
                <div className="mt-10 text-4xl font-medium leading-tight text-white -intro-x">
                  A few more clicks to become <br />
                  Seventy Five's member.
                </div>
                <div className="mt-5 text-lg text-white -intro-x text-opacity-70 dark:text-slate-400">
                  Recap your games in one place
                </div>
              </div>
            </div>
            {/* END: Register Info */}
            {/* BEGIN: Register Form */}

            <FormProvider {...methods} key={location.pathname + "_form"}>
              <form onSubmit={handleSubmit(onSubmit)} key={location.pathname + "_form2"} ref={formRef}>
                <div className="flex !h-[100vh] xl:py-0 xl:my-0">
                  <div className="flex flex-col overflow-y-scroll scrollbar-hidden w-full !h-[100vh] px-5 !py-8 mx-auto bg-white rounded-md shadow-md xl:ml-20 dark:bg-darkmode-600 xl:bg-transparent sm:px-8  xl:shadow-none sm:w-3/4 lg:w-2/4 xl:w-auto">
                    <h2 className="text-2xl font-bold text-center intro-x xl:text-3xl xl:text-left">
                      Sign Up
                    </h2>
                    <div className="mt-2 text-center intro-x text-slate-400 dark:text-slate-400 xl:hidden">
                      A few more clicks to sign in to become Seventy Five's member.
                    </div>

                    <div className="mt-8 intro-x grid grid-cols-12 gap-4">
                      <div className="col-span-12 sm:col-span-12">
                        <FormLabel>Player Name</FormLabel>
                        <Controller
                          name="name"
                          control={control}
                          render={({ field, fieldState }) =>
                            <>
                              <FormInput
                                name="name"
                                value={field.value}
                                className={clsx({
                                  "border-danger": !!fieldState.error,
                                })}
                                onChange={field.onChange}
                                placeholder="Player Name"
                              >
                              </FormInput>
                              {!!fieldState.error && (
                                <FormHelp className={"text-danger"}>
                                  {fieldState.error.message || "Form is not valid"}
                                </FormHelp>
                              )}
                            </>
                          }
                        />
                      </div>
                      <div className="col-span-12 sm:col-span-6">
                        <FormLabel>Email</FormLabel>
                        <Controller
                          name="email"
                          control={control}
                          render={({ field, fieldState }) =>
                            <>
                              <FormInput
                                name="email"
                                value={field.value}
                                className={clsx({
                                  "border-danger": !!fieldState.error,
                                })}
                                onChange={field.onChange}
                                placeholder="Email"
                              >
                              </FormInput>
                              {!!fieldState.error && (
                                <FormHelp className={"text-danger"}>
                                  {fieldState.error.message || "Form is not valid"}
                                </FormHelp>
                              )}
                            </>
                          }
                        />
                      </div>
                      <div className="col-span-12 sm:col-span-6">
                        <FormLabel>Phone</FormLabel>
                        <Controller
                          name="phone"
                          control={control}
                          render={({ field, fieldState }) =>
                            <>
                              <FormInput

                                name="phone"
                                value={field.value}
                                className={clsx({
                                  "border-danger": !!fieldState.error,
                                })}
                                onChange={field.onChange}
                                placeholder="Phone"
                              >
                              </FormInput>
                              {!!fieldState.error && (
                                <FormHelp className={"text-danger"}>
                                  {fieldState.error.message || "Form is not valid"}
                                </FormHelp>
                              )}
                            </>
                          }
                        />
                      </div>

                      <div className="col-span-12 sm:col-span-12">
                        <FormLabel>Username</FormLabel>
                        <Controller
                          name="username"
                          control={control}
                          render={({ field, fieldState }) =>
                            <>
                              <FormInput

                                name="username"
                                value={field.value}
                                className={clsx({
                                  "border-danger": !!fieldState.error,
                                })}
                                onChange={field.onChange}
                                placeholder="Username"
                              >
                              </FormInput>
                              {!!fieldState.error && (
                                <FormHelp className={"text-danger"}>
                                  {fieldState.error.message || "Form is not valid"}
                                </FormHelp>
                              )}
                            </>
                          }
                        />
                      </div>
                      <div className="col-span-12 sm:col-span-12">
                        <FormLabel>Password</FormLabel>
                        <Controller
                          name="password"
                          control={control}
                          render={({ field, fieldState }) =>
                            <>
                              <FormInput
                                name="password"
                                type="password"
                                value={field.value}
                                className={clsx({
                                  "border-danger": !!fieldState.error,
                                })}
                                onChange={field.onChange}
                                placeholder="Password"
                              >
                              </FormInput>
                              {!!fieldState.error && (
                                <FormHelp className={"text-danger"}>
                                  {fieldState.error.message || "Form is not valid"}
                                </FormHelp>
                              )}
                            </>
                          }
                        />
                      </div>
                      <div className="col-span-12 sm:col-span-12">
                        <FormLabel>Confirm Password</FormLabel>
                        <Controller
                          name="confirmPassword"
                          control={control}
                          render={({ field, fieldState }) =>
                            <>
                              <FormInput
                                name="confirmPassword"
                                type="password"
                                value={field.value}
                                className={clsx({
                                  "border-danger": !!fieldState.error,
                                })}
                                onChange={field.onChange}
                                placeholder="Password"
                              >
                              </FormInput>
                              {!!fieldState.error && (
                                <FormHelp className={"text-danger"}>
                                  {fieldState.error.message || "Form is not valid"}
                                </FormHelp>
                              )}
                            </>
                          }
                        />
                      </div>
                      <div className="col-span-12 sm:col-span-6">
                        <FormLabel>Place of Birth</FormLabel>
                        <Controller
                          name="placeOfBirth"
                          control={control}
                          render={({ field, fieldState }) =>
                            <>
                              <FormInput

                                name="placeOfBirth"
                                value={field.value}
                                className={clsx({
                                  "border-danger": !!fieldState.error,
                                })}
                                onChange={field.onChange}
                                placeholder="Place of Birth"
                              >
                              </FormInput>
                              {!!fieldState.error && (
                                <FormHelp className={"text-danger"}>
                                  {fieldState.error.message || "Form is not valid"}
                                </FormHelp>
                              )}
                            </>
                          }
                        />
                      </div>
                      <div className="col-span-12 sm:col-span-6">
                        <FormLabel>Date of Birth</FormLabel>
                        <Controller
                          name="dateOfBirth"
                          control={control}
                          render={({ field, fieldState }) =>
                            <>
                              <Litepicker
                                value={field.value}
                                onChange={(e) => {
                                  console.log('onChange', moment(e.target.value).toDate());
                                  field.onChange(moment(e.target.value).format('DD MMMM YYYY'));
                                }}
                                onEnded={(e) => {
                                  console.log('onEnded', e);

                                  // field.onChange(moment(e.target.value).format('DD-MM-YYYY'));
                                }}
                                defaultValue={moment().subtract(20, 'years').toISOString()}
                                options={{
                                  autoApply: false,
                                  // minDate: moment().subtract(90, 'years').toDate(),
                                  maxDate: moment().subtract(15, 'years').toDate(),
                                  mobileFriendly: true,
                                  showWeekNumbers: false,
                                  firstDay: 1,
                                  format: 'DD MMMM YYYY',
                                  dropdowns: {
                                    minYear: 1940,
                                    maxYear: null,
                                    months: true,
                                    years: true,
                                  },
                                }}
                                className=" mx-auto"
                              />
                              {!!fieldState.error && (
                                <FormHelp className={"text-danger"}>
                                  {fieldState.error.message || "Form is not valid"}
                                </FormHelp>
                              )}
                            </>
                          }
                        />
                      </div>
                      <div className="col-span-12 sm:col-span-12">
                        <FormLabel>I'm a</FormLabel>
                        <div className="flex items-center gap-2">
                          <div className={`border px-2 py-1 flex items-center justify-center rounded cursor-pointer w-24 h-24 hover:bg-primary hover:bg-opacity-10 ${watch("gender") === "m" ? "border-primary text-primary" : ""}`}
                            onClick={() => {
                              setValue("gender", "m", {
                                shouldValidate: true,
                              });
                            }}
                          >
                            Male
                          </div>
                          <div className={`border px-2 py-1 flex items-center justify-center rounded cursor-pointer w-24 h-24 hover:bg-primary hover:bg-opacity-10 ${watch("gender") === "f" ? "border-primary text-primary" : ""}`}
                            onClick={() => {
                              setValue("gender", "f", {
                                shouldValidate: true,
                              });
                            }}
                          >
                            Female
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center mt-4 text-xs intro-x text-slate-600 dark:text-slate-500 sm:text-sm">
                      <FormCheck.Input
                        id="remember-me"
                        type="checkbox"
                        className="mr-2 border"
                        checked={agreement}
                        onChange={(e) => {
                          setAgreement(e.target.checked);
                        }}
                      />
                      <label
                        className="cursor-pointer select-none"
                        htmlFor="remember-me"
                      >
                        I agree to the Seventy Five
                      </label>
                      <a className="ml-1 text-primary dark:text-slate-200" href="">
                        Privacy Policy.
                      </a>
                    </div>
                    <div className="mt-5 text-center intro-x xl:mt-8 xl:text-left flex gap-4">
                      <Button
                        variant="outline-secondary"
                        className="w-full px-4 py-3 mt-3 align-top xl:w-32 xl:mt-0"
                      >
                        Sign in
                      </Button>
                      {/* <Button
                        variant="primary"
                        type="button"
                        className="w-full px-4 py-3 mt-3 align-top xl:w-32 xl:mt-0"
                        onClick={() => {
                          console.log(registerSchema.parse(methods.getValues()));
                        }}
                      >
                        Test{agreement.toString()}
                      </Button> */}
                      <Button
                        variant="primary"
                        type="button"
                        key={`${agreement}_${formState.isSubmitting}_${formState.isValid}`}
                        className="w-full px-4 py-3 align-top xl:w-32 xl:mr-3"
                        // onClick={handleSubmit(onSubmit)}
                        onClick={() => {
                          setModalAlert({
                            ...modalAlert,
                            title: "Register",
                            description: "Are you sure you want to register?",
                            open: true,
                            icon: "MailQuestion",
                            variant: "warning",
                            onClose: () => setModalAlert({ ...modalAlert, open: false }),
                            buttons: [
                              {
                                label: "Cancel",
                                variant: "outline-secondary",
                                onClick: () => setModalAlert({ ...modalAlert, open: false })
                              },
                              {
                                label: "Continue to Register",
                                type: "button",
                                variant: "primary",
                                onClick: () => {
                                  setModalAlert({ ...modalAlert, open: false })
                                  // formRef.current?.submit();
                                  methods.handleSubmit(onSubmit)();
                                }
                              }
                            ]
                          })
                        }}
                        disabled={formState.isSubmitting || !formState.isValid || !agreement}
                      >
                        Register
                      </Button>
                    </div>
                  </div>
                </div>
              </form>
            </FormProvider>
            {/* END: Register Form */}
          </div>
        </div>
      </div>
      <Confirmation
        title={modalAlert.title || "Register"}
        description={modalAlert.description || "Are you sure you want to register?"}
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

