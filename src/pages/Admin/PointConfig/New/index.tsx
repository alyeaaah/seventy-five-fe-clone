import Button from "@/components/Base/Button";
import { FormHelp, FormInput, FormLabel, InputGroup } from "@/components/Base/Form";
import { useEffect, useState } from "react";
import { Controller, FormProvider, SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { pointConfigurationDetailSchema, pointConfigurationFormSchema, PointConfigurationsFormData, PointConfigurationsPayload } from "../api/schema";
import { PointConfigurationsApiHooks } from "../api";
import { queryClient } from "@/utils/react-query";
import { useToast } from "@/components/Toast/ToastContext";
import clsx from "clsx";
import {
  Divider
} from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import { useRouteParams } from "typesafe-routes/react-router";
import { paths } from "@/router/paths";
import Lucide from "@/components/Base/Lucide";
import Confirmation, { AlertProps } from "@/components/Modal/Confirmation";

export const PointConfigurationsForm = () => {
  const navigate = useNavigate();
  
  const { showNotification } = useToast();
  const queryParams = useRouteParams(paths.administrator.masterData.pointConfigForm);
  const { uuid:pointConfigUuid } = queryParams;
  const [modalAlert, setModalAlert] = useState<AlertProps | undefined>(undefined);
  const { mutate: actionCreatePointConfiguration } = PointConfigurationsApiHooks.useCreatePointConfiguration();
  const location = useLocation();
  const { data } = PointConfigurationsApiHooks.useGetPointConfigurationsDetail({
    params: {
      uuid: pointConfigUuid != "new" ? (pointConfigUuid || 0) : 0
    }
  }, {
    onSuccess: (data) => {
      if (data) {
        methods.reset({
          name: data.data.name,
          points: data.data.points.map(point => ({
            uuid: point.uuid || "",
            round: point.round || 0,
            win_point: point.win_point || 0,
            lose_point: point.lose_point || 0,
            win_coin: point.win_coin || 0,
            lose_coin: point.lose_coin || 0,
            is_delete: point.is_delete || false
          })) || [
            {
              uuid: "",
              round: 0,
              win_point: 0,
              lose_point: 0,
              win_coin: 0,
              lose_coin: 0,
              is_delete: false
            }
          ]
        });
      }
    },
    enabled: !!pointConfigUuid && pointConfigUuid != "new"
  });
  const { mutate: actionUpdatePointConfiguration } = PointConfigurationsApiHooks.useUpdatePointConfiguration(
    {
      params: {
        uuid: pointConfigUuid != "new" ? (pointConfigUuid || 0) : 0
      }
    },
  );
  const methods = useForm({
    mode: "onChange",
    defaultValues: {
      uuid: pointConfigUuid != "new" ? (pointConfigUuid || "") : "",
      name: data?.data?.name || "",
      points: data ? data?.data?.points?.map(point => ({
        uuid: point.uuid || "",
        round: point.round || 0,
        win_point: point.win_point || 0,
        lose_point: point.lose_point || 0,
        win_coin: point.win_coin || 0,
        lose_coin: point.lose_coin || 0,
        is_delete: point.is_delete || false
      })) : [{
        uuid: "",
        round: 1,
        win_point: 0,
        lose_point: 0,
        win_coin: 0,
        lose_coin: 0,
        is_delete: false
      }]
    },
    resolver: zodResolver(pointConfigurationFormSchema),
  });
  const { control, formState, handleSubmit, setValue, watch, getValues } = methods;

  const onSubmit: SubmitHandler<any> = (values: PointConfigurationsFormData) => {
    if (pointConfigUuid && pointConfigUuid != "new") {
      values.points = values.points.map((point, idx) => ({
        ...point,
        round: idx + 1
      }));
      const existingFields = data?.data?.points || [];
      const removedFields = existingFields.filter(field => !values.points.find(f => f.uuid === field.uuid)).map(field => ({
        ...field,
        is_delete: true
      }));
      values.points = [...values.points, ...removedFields];
      actionUpdatePointConfiguration(values, {
        onSuccess: () => {
          methods.reset();
          queryClient.invalidateQueries({
            queryKey: PointConfigurationsApiHooks.getKeyByAlias("getPointConfigurationsList"),
          });
          queryClient.invalidateQueries({
            queryKey: PointConfigurationsApiHooks.getKeyByAlias("getPointConfigurationsDetail"),
          });
          showNotification({
            duration: 3000,
            text: "PointConfiguration updated successfully",
            icon: "CheckSquare2",
            variant: "success",
          });
          navigate(-1);
        },
        onError: (e: any) => {
          showNotification({
            duration: 3000,
            text: e?.message || "Failed to update pointConfiguration",
            icon: "WashingMachine",
            variant: "danger",
          });
        },
      });
    } else {
      actionCreatePointConfiguration(values, {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: PointConfigurationsApiHooks.getKeyByAlias("getPointConfigurationsList"),
          });
          methods.reset();
          showNotification({
            duration: 3000,
            text: "PointConfiguration created successfully",
            icon: "CheckSquare",
            variant: "success",
          });
          navigate(-1);
        },
        onError: (e: any) => {
          showNotification({
            duration: 3000,
            text: e?.message || "Failed to create pointConfiguration",
            icon: "WashingMachine",
            variant: "danger",
          });
        },
      });
    }
  }
  // Prevent mousewheel scroll on number inputs
  useEffect(() => {
    // Define the prevent scroll function
    const preventWheel: EventListener = (e: Event) => {
      const wheelEvent = e as WheelEvent; // Type assertion to WheelEvent
      const target = wheelEvent.target as HTMLInputElement; // Ensure the target is an HTMLInputElement
      if (target && target.type === "number") {
        e.preventDefault(); // Prevent the default scroll behavior
      }
    };

    // Attach the wheel event listener to all number input fields
    const numberInputs = document.querySelectorAll('input[type="number"]');
    numberInputs.forEach(input => {
      input.addEventListener("wheel", preventWheel);
    });

    // Cleanup event listener on component unmount
    return () => {
      numberInputs.forEach(input => {
        input.removeEventListener("wheel", preventWheel);
      });
    };
  }, []);
  return (
    <>
      <div className="flex flex-row items-center mt-8 intro-y justify-between">
        <h2 className="mr-auto text-lg font-medium">{pointConfigUuid && pointConfigUuid != "new" ? "Edit" : "Add New"} PointConfiguration</h2>
      </div>
      <Divider />
      <FormProvider {...methods} key={location.pathname+"_form"}>
        <form onSubmit={handleSubmit(onSubmit)} key={location.pathname+"_form2"}>
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 sm:col-span-8 grid grid-cols-12 gap-2 intro-y box p-4">
              <div className="col-span-12 sm:col-span-12">
                <FormLabel htmlFor="modal-form-1"> Name</FormLabel>
                <Controller
                  name="name"
                  key={location.pathname+"_name"}
                  control={control}
                  render={({ field, fieldState }) =>
                    <>
                      <FormInput
                        id="validation-form-6"
                        name="name"
                        value={field.value}
                        className={clsx({
                          "border-danger": !!fieldState.error,
                        })}
                        onChange={field.onChange}
                        placeholder="Configuration Label"
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
              <Divider className="col-span-12 sm:my-4 my-2"/>
              {
                watch("points").map((field, idx) => (
                  <div className="col-span-12 grid grid-cols-11 gap-4 pb-4 bg-gray-200 rounded-lg p-4 sm:bg-none" key={location.pathname + `fields.${idx}`}>
                    <div className="col-span-11 sm:col-span-2 flex flex-col items-center sm:items-end sm:justify-center">
                      <FormLabel htmlFor="modal-form-1" className="mt-2 hidden sm:flex">&nbsp;</FormLabel>
                      <FormLabel className="w-fit bg-emerald-800 text-white px-3 py-1 rounded-md text-sm font-medium">Round {idx + 1}</FormLabel>
                    </div>
                    <div className="col-span-11 sm:col-span-4">
                      <div className="grid grid-cols-12 gap-1">
                        <FormLabel htmlFor="modal-form-1" className="col-span-12">Win</FormLabel>
                        <Controller
                          name={`points.${idx}.win_point`}
                          control={control}
                          defaultValue={0}
                          key={location.pathname + `points.${idx}.win_point`}
                          render={({ field, fieldState }) =>
                            <div className="col-span-12 lg:col-span-6">
                              <InputGroup className="h-fit">
                                <FormInput
                                  id="validation-form-6"
                                  name={`points.${idx}.win_point`}
                                  value={field.value}
                                  className={clsx({
                                    "border-danger": !!fieldState.error,
                                  })}
                                  type="number"
                                  onChange={(e) => {
                                    field.onChange(parseInt(Number(e.target.value).toString(), 10))
                                    // check if next index is exist, update the lose point
                                    if (idx + 1 < getValues("points").length) {
                                      setValue(`points.${idx + 1}.lose_point`, parseInt(e.target.value))
                                    }
                                  }}
                                  placeholder="Win Point"
                                >
                                </FormInput>
                                <InputGroup.Text className="px-2">Point</InputGroup.Text>
                              </InputGroup>
                              {!!fieldState.error && (
                                <FormHelp className={"text-danger col-span-12"}>
                                  {fieldState.error.message || "Form is not valid"}
                                </FormHelp>
                              )}
                            </div>
                          }
                        />
                        <Controller
                          name={`points.${idx}.win_coin`}
                          control={control}
                          defaultValue={0}
                          key={location.pathname + `points.${idx}.win_coin`}
                          render={({ field, fieldState }) =>
                            <div className="col-span-12 lg:col-span-6">
                              <InputGroup className="h-fit">
                                <FormInput
                                  id="validation-form-6"
                                  name={`points.${idx}.win_coin`}
                                  value={field.value}
                                  className={clsx({
                                    "border-danger": !!fieldState.error,
                                  })}
                                  type="number"
                                  onChange={(e) => {
                                    field.onChange(parseInt(Number(e.target.value).toString(), 10))
                                    // check if next index is exist, update the lose coin
                                    if (idx + 1 < getValues("points").length) {
                                      setValue(`points.${idx + 1}.lose_coin`, parseInt(e.target.value))
                                    }
                                  }}
                                  placeholder="Win Coin"
                                >
                                </FormInput>
                                <InputGroup.Text className="px-2">Coin</InputGroup.Text>
                              </InputGroup>
                              {!!fieldState.error && (
                                <FormHelp className={"text-danger col-span-12"}>
                                  {fieldState.error.message || "Form is not valid"}
                                </FormHelp>
                              )}
                            </div>
                          }
                        />
                      </div>
                      
                    </div>
                    <div className="col-span-11 sm:col-span-4">
                      <div className="grid grid-cols-12 gap-1">
                        <FormLabel htmlFor="modal-form-1" className="col-span-12">Lose</FormLabel>
                        <Controller
                          name={`points.${idx}.lose_point`}
                          control={control}
                          defaultValue={0}
                          key={location.pathname + `points.${idx}.lose_point`}
                          render={({ field, fieldState }) =>
                            <div className="col-span-12 lg:col-span-6">
                              <InputGroup className="h-fit">
                                <FormInput
                                  id="validation-form-6"
                                  name={`points.${idx}.lose_point`}
                                  value={field.value}
                                  readOnly={idx > 0}
                                  className={clsx({
                                    "border-danger": !!fieldState.error,
                                  })}
                                  type="number"
                                  onChange={(e) => field.onChange(parseInt(Number(e.target.value).toString(), 10))}
                                  placeholder="Lose Point"
                                >
                                </FormInput>
                                <InputGroup.Text className="px-2">Point</InputGroup.Text>
                              </InputGroup>
                              {!!fieldState.error && (
                                <FormHelp className={"text-danger"}>
                                  {fieldState.error.message || "Form is not valid"}
                                </FormHelp>
                              )}
                            </div>
                          }
                        /> <Controller
                          name={`points.${idx}.lose_coin`}
                          control={control}
                          defaultValue={0}
                          key={location.pathname + `points.${idx}.lose_coin`}
                          render={({ field, fieldState }) =>
                            <div className="col-span-12 lg:col-span-6">
                              <InputGroup className="h-fit">
                                <FormInput
                                  id="validation-form-6"
                                  name={`points.${idx}.lose_coin`}
                                  value={field.value}
                                  readOnly={idx > 0}
                                  className={clsx({
                                    "border-danger": !!fieldState.error,
                                  })}
                                  type="number"
                                  onChange={(e) => field.onChange(parseInt(Number(e.target.value).toString(), 10))}
                                  placeholder="Lose Coin"
                                >
                                </FormInput>
                                <InputGroup.Text className="px-2">Coin</InputGroup.Text>
                              </InputGroup>
                              {!!fieldState.error && (
                                <FormHelp className={"text-danger"}>
                                  {fieldState.error.message || "Form is not valid"}
                                </FormHelp>
                              )}
                            </div>
                          }
                        />
                      </div>
                      
                    </div>
                    {idx > 0 &&
                      <div className="col-span-11 sm:col-span-1 flex items-center">
                        <Button
                          variant="danger"
                          className="w-full sm:mt-3"
                          disabled={formState.isSubmitting || idx == 0}
                          type="button"
                          onClick={() => {
                            setModalAlert({
                              open: true,
                              onClose: () => setModalAlert(undefined),
                              icon: "XCircle",
                              title: "Are you sure?",
                              description: "Do you really want to delete these field? This process cannot be undone.",
                              refId: idx.toString(),
                              buttons: [
                                {
                                  label: "Cancel",
                                  onClick: () => setModalAlert(undefined),
                                  variant: "secondary"
                                },
                                {
                                  label: "Delete",
                                  onClick: () => {
                                    // Handle delete logic here
                                    setValue("points", getValues("points").filter((_, i) => i !== idx), {
                                      shouldValidate: true
                                    });
                                    setModalAlert(undefined);
                                  },
                                  variant: "danger"
                                }
                              ]
                            });
                          }}
                        >
                          <Lucide icon="Trash" className="w-4 h-4" />
                        </Button>
                      </div>
                    }
                    {/* <Divider className="col-span-12" /> */}
                  </div>
                ))
              }
              <div className="col-span-12 hidden sm:flex justify-between">
                <Button
                  variant="primary"
                  className=""
                  type="button"
                  disabled={formState.isSubmitting}
                  onClick={() => {
                    const currentVal = getValues("points");
                    setValue("points",
                      [...currentVal, { round: currentVal.length + 1, win_point: getValues("points")[currentVal.length - 1].win_point, lose_point: getValues("points")[currentVal.length - 1].win_point, win_coin: getValues("points")[currentVal.length - 1].win_coin, lose_coin: getValues("points")[currentVal.length - 1].win_coin, is_delete: false, uuid: "" }],
                      { shouldValidate: true }
                    );
                  }}
                >
                  Add More Round
                </Button>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline-secondary"
                    onClick={() => {
                      methods.reset();
                      navigate(-1);
                    }}
                    className="mr-2"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={formState.isSubmitting || !formState.isValid}
                  >
                    <Lucide icon="Save" className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-12 col-span-12">
              <div className="col-span-12 sm:hidden mb-4">
                <Button
                  variant="primary"
                  className="w-full"
                  type="button"
                  disabled={formState.isSubmitting}
                  onClick={() => {
                    const currentVal = getValues("points");
                    setValue("points",
                      [...currentVal, { round: currentVal.length + 1, win_point: getValues("points")[currentVal.length - 1].win_point, lose_point: getValues("points")[currentVal.length - 1].win_point, win_coin: getValues("points")[currentVal.length - 1].win_coin, lose_coin: getValues("points")[currentVal.length - 1].win_coin, is_delete: false, uuid: "" }],
                      { shouldValidate: true }
                    );
                  }}
                >
                  Add More Round
                </Button>
              </div>
              <div className="col-span-12 box sm:hidden p-4 flex justify-between" >
                <Button
                  type="button"
                  variant="outline-secondary"
                  onClick={() => {
                    methods.reset();
                    navigate(-1);
                  }}
                  className="w-[46%]"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  type="submit"
                  className="w-[46%]"
                  disabled={formState.isSubmitting || !formState.isValid}
                >
                  Save
                </Button>
              </div>
            </div>
          </div>
        </form>
      </FormProvider>
      <Confirmation
        open={!!modalAlert?.open}
        onClose={() => setModalAlert(undefined)}
        icon={modalAlert?.icon || "Info"}
        title={modalAlert?.title || ""}
        description={modalAlert?.description || ""}
        refId={modalAlert?.refId}
        buttons={modalAlert?.buttons}
      />
    </>
  )
}