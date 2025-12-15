import Button from "@/components/Base/Button";
import { FormHelp, FormInput, FormLabel, FormSelect, FormTextarea } from "@/components/Base/Form";
import { useRef, useState } from "react";
import { Controller, FormProvider, SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CourtsPayload, courtsPayloadSchema } from "../api/schema";
import { CourtsApiHooks } from "../api";
import { queryClient } from "@/utils/react-query";
import { useToast } from "@/components/Toast/ToastContext";
import clsx from "clsx";
import {
  Divider,
  UploadProps
} from "antd";
import { adminApiHooks } from "@/pages/Login/api";
import { RcFile, UploadChangeParam } from "antd/es/upload";
import { courtTypeValue, mapCenter } from "@/utils/faker";
import { useLocation, useNavigate } from "react-router-dom";
import { useRouteParams } from "typesafe-routes/react-router";
import { paths } from "@/router/paths";
import CustomMap from "@/components/CustomMap";
import { LatLngLiteral } from "leaflet";
import UploadDropzone from "@/components/UploadDropzone";
import Lucide from "@/components/Base/Lucide";
import Confirmation, { AlertProps } from "@/components/Modal/Confirmation";
interface Props {
  court?: string;
}

export const CourtsNew = (props: Props) => {
  const navigate = useNavigate();
  const queryParams = useRouteParams(paths.administrator.courts.edit);
  const { court: courtUuid } = queryParams;
  const { showNotification } = useToast();
  const [uploading, setUploading] = useState<boolean>(false);
  const [modalAlert, setModalAlert] = useState<AlertProps | undefined>(undefined);
  const { mutate: actionCreateCourt } = CourtsApiHooks.useCreateCourt();
  const location = useLocation();
  const { data } = CourtsApiHooks.useGetCourtsDetail({
    params: {
      uuid: courtUuid || 0
    }
  }, {
    onSuccess: (data) => {
      if (data) {
        methods.reset({
          name: data.data.name,
          city: data.data.city,
          address: data.data.address,
          lat: data.data.lat,
          long: data.data.long,
          fields: data.data.fields
        });
      }
    },
    enabled: !!courtUuid
  });
  const { mutate: actionUpdateCourt } = CourtsApiHooks.useUpdateCourt(
    {
      params: {
        uuid: courtUuid || 0
      }
    },
  );
  const methods = useForm({
    mode: "onChange",
    defaultValues: {
      uuid: courtUuid || "",
      name: data?.data?.name || "",
      city: data?.data?.city || "",
      address: data?.data?.address || "",
      lat: data?.data?.lat || "",
      long: data?.data?.long || "",
      fields: data ? data?.data?.fields?.map(field => ({
        uuid: field.uuid || "",
        name: field.name || "",
        type: field.type || "",
        media_url: field.media_url || "",
        media_uuid: field.media_uuid || ""
      })) : [{
        uuid: "",
        name: "",
        type: "",
        media_url: "",
        media_uuid: ""
      }]
    },
    resolver: zodResolver(courtsPayloadSchema),
  });
  const { control, formState, handleSubmit, setValue, watch, getValues } = methods;

  const { mutateAsync: actionUploadImage } = adminApiHooks.useMediaUpload({});

  const uploadHandler = async (info: UploadChangeParam, index: number) => {
    setUploading(true);
    await actionUploadImage({ image: info.file as RcFile }, {
      onError: (error) => {
        setUploading(false);
        showNotification({
          duration: 3000,
          text: `Failed to upload image ${error?.message}`,
          icon: "XCircle",
          variant: "danger",
        });
      },
      onSuccess: (res) => {
        setValue(`fields.${index}.media_url`, res.imageUrl, {
          shouldValidate: true,
        });
      }
    });
    setUploading(false);
  }
  const onSubmit: SubmitHandler<any> = (values: CourtsPayload) => {
    if (courtUuid) {
      const existingFields = data?.data?.fields || [];
      const removedFields = existingFields.filter(field => !values.fields.find(f => f.uuid === field.uuid)).map(field => ({
        ...field,
        is_delete: 1
      }));
      values.fields = [...values.fields, ...removedFields];
      actionUpdateCourt(values, {
        onSuccess: () => {
          methods.reset();
          queryClient.invalidateQueries({
            queryKey: CourtsApiHooks.getKeyByAlias("getCourtsList"),
          });
          queryClient.invalidateQueries({
            queryKey: CourtsApiHooks.getKeyByAlias("getCourtsDetail"),
          });
          showNotification({
            duration: 3000,
            text: "Court updated successfully",
            icon: "CheckSquare2",
            variant: "success",
          });
          navigate(-1);
        },
        onError: (e: any) => {
          showNotification({
            duration: 3000,
            text: e?.message || "Failed to update court",
            icon: "WashingMachine",
            variant: "danger",
          });
        },
      });
    } else {
      actionCreateCourt(values, {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: CourtsApiHooks.getKeyByAlias("getCourtsList"),
          });
          methods.reset();
          showNotification({
            duration: 3000,
            text: "Court created successfully",
            icon: "CheckSquare",
            variant: "success",
          });
          navigate(-1);
        },
        onError: (e: any) => {
          showNotification({
            duration: 3000,
            text: e?.message || "Failed to create court",
            icon: "WashingMachine",
            variant: "danger",
          });
        },
      });
    }
  }

  return (
    <>
      <div className="flex flex-row items-center mt-8 intro-y justify-between">
        <h2 className="mr-auto text-lg font-medium">{courtUuid ? "Edit" : "Add New"} Court</h2>
      </div>
      <Divider />
      <FormProvider {...methods} key={location.pathname+"_form"}>
        <form onSubmit={handleSubmit(onSubmit)} key={location.pathname+"_form2"}>
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 sm:col-span-6 intro-y box p-4">
              <div className="col-span-6 sm:col-span-">
                <FormLabel htmlFor="modal-form-1">Venue Name</FormLabel>
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
                        placeholder="Venue Name"
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
              <br />
              <div className="col-span-12 sm:col-span-12">
                <FormLabel htmlFor="modal-form-2">Address</FormLabel>
                <Controller
                  name="address"
                  key={location.pathname+"_address"}
                  control={control}
                  render={({ field, fieldState }) =>
                    <>
                      <FormTextarea
                        rows={4}
                        id="validation-form-6"
                        value={field.value}
                        name="address"
                        className={clsx({
                          "border-danger": !!fieldState.error,
                        })}
                        onChange={field.onChange}
                        placeholder="Address"
                      ></FormTextarea>
                      {!!fieldState.error && (
                        <FormHelp className={"text-danger"}>
                          {fieldState.error.message || "Form is not valid"}
                        </FormHelp>
                      )}
                    </>
                  }
                />
              </div>
              <br />
              <div className="col-span-12 sm:col-span-12">
                <FormLabel htmlFor="modal-form-1">City</FormLabel>
                <Controller
                  name="city"
                  key={location.pathname+"_city"}
                  control={control}
                  render={({ field, fieldState }) =>
                    <>
                      <FormInput
                        id="validation-form-6"
                        name="city"
                        value={field.value}
                        className={clsx({
                          "border-danger": !!fieldState.error,
                        })}
                        onChange={field.onChange}
                        placeholder="City"
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
              <br />
              <div className="col-span-12 sm:col-span-12">
                <FormLabel htmlFor="modal-form-2">Pilih lokasi</FormLabel>
                <div className="h-72">
                  {((data?.data?.uuid && courtUuid) || !courtUuid) &&
                    <CustomMap
                      key={location.pathname + "_map"} // Reset on route change
                      mapProps={data?.data ? {
                        center: [Number(data?.data?.lat || mapCenter.lat), Number(data?.data?.long || mapCenter.lng)],
                      } : {
                        center: [mapCenter.lat, mapCenter.lng],
                      }}
                      onChange={(e, address) => {
                        setValue("lat", e.lat.toString());
                        setValue("long", e.lng.toString());
                      }}
                    />
                  }
                </div>
              </div>
              <br />
              <div className="col-span-12 hidden sm:flex">
                <Divider />
              </div>
              <div className="col-span-12 hidden sm:flex justify-end">
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
            <div className="col-span-12 sm:col-span-6 intro-y box p-4">
              {
                watch("fields").map((field, idx) => (
                  <div className="grid grid-cols-12 gap-4" key={location.pathname + `fields.${idx}`}>
                    <div className="col-span-12 sm:col-span-1 sm:flex hidden items-center">
                      <Button
                        variant="danger"
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
                                  const fields = getValues("fields").filter((_, i) => i !== idx)
                                  setValue("fields", fields || [], {
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
                    <div className="col-span-12 sm:col-span-7">
                      <div className="">
                        <FormLabel htmlFor="modal-form-1">Court 1</FormLabel>
                        <Controller
                          name={`fields.${idx}.name`}
                          control={control}
                          defaultValue=""
                          key={location.pathname + `fields.${idx}.name`}
                          render={({ field, fieldState }) =>
                            <>
                              <FormInput
                                id="validation-form-6"
                                name={`fields.${idx}.name`}
                                value={field.value}
                                className={clsx({
                                  "border-danger": !!fieldState.error,
                                })}
                                onChange={field.onChange}
                                placeholder="Venue Name"
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
                      <br />
                      <div className="">
                        <FormLabel htmlFor="modal-form-2">Type</FormLabel>
                        <Controller
                          name={`fields.${idx}.type`}
                          control={control}
                          defaultValue=""
                          key={location.pathname + `fields.${idx}.type`}
                          render={({ field, fieldState }) =>
                            <>
                              <FormSelect
                                id="modal-form-2"
                                name={`fields.${idx}.type`}
                                onChange={field.onChange}
                                value={field.value}
                              >
                                {courtTypeValue.map((item) => (
                                  <option key={item.value} value={item.value}>
                                    {item.value !== "" ? item.label : "Choose Type"}
                                  </option>
                                ))}
                              </FormSelect>
                              {!!fieldState.error && (
                                <FormHelp className={"text-danger"}>
                                  {fieldState.error.message || "Form is not valid"}
                                </FormHelp>
                              )}
                            </>
                          }
                        />
                      </div></div>
                    <div className="col-span-12 sm:col-span-4">
                      <div className="col-span-12 sm:col-span-12 w-full">
                      <FormLabel htmlFor="modal-form-1">Image</FormLabel>
                      <Controller
                        name={`fields.${idx}.media_url`}
                        control={control}
                        defaultValue=""
                        key={location.pathname + `fields.${idx}.media_url`}
                        render={({ field, fieldState }) =>
                          <>
                            <UploadDropzone
                              uploadType="image"
                              name={`fields.${idx}.media_url`}
                              index={idx}
                              onChange={uploadHandler}
                              fileList={field.value ? [field.value] : []}
                              onRemove={() => {
                                setValue(`fields.${idx}.media_url`, "", {
                                  shouldValidate: true,
                                });
                              }}
                              loading={uploading}
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
                    </div> 
                    {idx > 0 &&
                    <div className="col-span-12 sm:col-span-1 sm:hidden flex items-center">
                      <Button
                        variant="danger"
                        className="w-full"
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
                                  setValue("fields", getValues("fields").filter((_, i) => i !== idx), {
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
                    </div>}
                    <Divider className="col-span-12" />
                  </div>
                ))
              }
              <div className="col-span-12 flex justify-end">
                <Button
                  variant="primary"
                  className=""
                  type="button"
                  disabled={formState.isSubmitting}
                  onClick={() => {
                    setValue("fields",
                      [...getValues("fields"), { name: "", type: "", media_url: "", media_uuid: "", uuid: "" }],
                      { shouldValidate: true }
                    );
                  }}
                >
                  Add More Court
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-12 col-span-12">
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