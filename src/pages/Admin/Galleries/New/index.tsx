import Button from "@/components/Base/Button";
import { FormHelp, FormInput, FormLabel, FormTextarea } from "@/components/Base/Form";
import { useState } from "react";
import { Controller, FormProvider, SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { GalleriesApiHooks } from "../api";
import { queryClient } from "@/utils/react-query";
import { useToast } from "@/components/Toast/ToastContext";
import clsx from "clsx";
import {
  Divider
} from "antd";
import { adminApiHooks } from "@/pages/Login/api";
import { RcFile, UploadChangeParam } from "antd/es/upload";
import { useLocation, useNavigate } from "react-router-dom";
import { useRouteParams } from "typesafe-routes/react-router";
import { paths } from "@/router/paths";
import UploadDropzone from "@/components/UploadDropzone";
import Lucide from "@/components/Base/Lucide";
import Confirmation, { AlertProps } from "@/components/Modal/Confirmation";
import { galleryAlbumsPayloadSchema, GalleryPayload } from "../api/schema";
interface Props {
  gallery?: string;
}

export const GalleriesNew = (props: Props) => {
  const navigate = useNavigate();
  const queryParams = useRouteParams(paths.administrator.galleries.edit);
  const { id: galleryUuid } = queryParams;
  const { showNotification } = useToast();
  const [uploading, setUploading] = useState<boolean>(false);
  const [modalAlert, setModalAlert] = useState<AlertProps | undefined>(undefined);
  const { mutate: actionCreateGallery } = GalleriesApiHooks.useCreateGalleries();
  const location = useLocation();
  const { data } = GalleriesApiHooks.useGetGalleriesDetail({
    params: {
      uuid: galleryUuid || 0
    }
  }, {
    onSuccess: (data) => {
      if (data) {
        methods.reset({
          uuid: data.data.uuid,
          name: data.data.name,
          description: data.data.description || "",
          pinned_gallery_uuid: data.data.pinned_gallery_uuid || "",
          galleries: data.data.galleries?.map(d=> ({...d, pinned: d.uuid === data.data.pinned_gallery_uuid})) || [{
            uuid: "",
            name: "",
            description: "",
            link: "",
            pinned: true
          }]
        });
      }
    },
    enabled: !!galleryUuid
  });
  const { mutate: actionUpdateGallery } = GalleriesApiHooks.useUpdateGalleries(
    {
      params: {
        uuid: galleryUuid || 0
      }
    },
  );
  const methods = useForm({
    mode: "onChange",
    defaultValues: {
      uuid: galleryUuid || "",
      name: data?.data?.name || "",
      description: data?.data?.description || "",
      pinned_gallery_uuid: data?.data?.pinned_gallery_uuid || "",
      galleries: data?.data?.galleries?.map(gallery => ({
        ...gallery,
        pinned: gallery.uuid === data?.data?.pinned_gallery_uuid
      })) || [{
        uuid: "",
        name: "",
        description: "",
        link: "",
        pinned: true
      }]
    },
    resolver: zodResolver(galleryAlbumsPayloadSchema),
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
        setValue(`galleries.${index}.link`, res.imageUrl, {
          shouldValidate: true,
        });
      }
    });
    setUploading(false);
  }
  const onSubmit: SubmitHandler<any> = (values: GalleryPayload) => {
    values.pinned_gallery_uuid = values.galleries?.find(d => !!d.pinned)?.uuid || (values.galleries?.[0]?.uuid || undefined);
    if (galleryUuid) {
      const existingGalleries = data?.data?.galleries || [];
      const removedGalleries = existingGalleries.filter(gallery => !values?.galleries?.find(f => f.uuid === gallery.uuid)).map(gallery => ({
        ...gallery,
        is_delete: true,
        pinned: false,
        name: gallery.name || "",
        description: gallery.description || "",
        link: gallery.link || ""
      }));
      values.galleries = [...(values?.galleries || []), ...(removedGalleries || [])];
      actionUpdateGallery(values, {
        onSuccess: () => {
          methods.reset();
          queryClient.invalidateQueries({
            queryKey: GalleriesApiHooks.getKeyByAlias("getGalleries"),
          });
          queryClient.invalidateQueries({
            queryKey: GalleriesApiHooks.getKeyByAlias("getGalleriesDetail"),
          });
          showNotification({
            duration: 3000,
            text: "Gallery updated successfully",
            icon: "CheckSquare2",
            variant: "success",
          });
          navigate(-1);
        },
        onError: (e: any) => {
          showNotification({
            duration: 3000,
            text: e?.message || "Failed to update gallery",
            icon: "WashingMachine",
            variant: "danger",
          });
        },
      });
    } else {
      actionCreateGallery(values, {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: GalleriesApiHooks.getKeyByAlias("getGalleries"),
          });
          queryClient.invalidateQueries({
            queryKey: GalleriesApiHooks.getKeyByAlias("getGalleriesDetail"),
          });
          methods.reset();
          showNotification({
            duration: 3000,
            text: "Gallery created successfully",
            icon: "CheckSquare",
            variant: "success",
          });
          navigate(-1);
        },
        onError: (e: any) => {
          showNotification({
            duration: 3000,
            text: e?.message || "Failed to create gallery",
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
        <h2 className="mr-auto text-lg font-medium">{galleryUuid ? "Edit" : "Add New"} Album</h2>
      </div>
      <Divider />
      <FormProvider {...methods} key={location.pathname+"_form"}>
        <form onSubmit={handleSubmit(onSubmit)} key={location.pathname+"_form2"}>
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 grid grid-cols-12 gap-4 intro-y box p-4">
              <div className="col-span-12 sm:col-span-12">
                <FormLabel htmlFor="modal-form-1">Album's name</FormLabel>
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
              <div className="col-span-12 sm:col-span-12">
                <FormLabel htmlFor="modal-form-2">Description</FormLabel>
                <Controller
                  name="description"
                  key={location.pathname+"_address"}
                  control={control}
                  render={({ field, fieldState }) =>
                    <>
                      <FormTextarea
                        rows={4}
                        id="validation-form-6"
                        value={field.value}
                        name="description"
                        className={clsx({
                          "border-danger": !!fieldState.error,
                        })}
                        onChange={field.onChange}
                        placeholder="Description"
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
            <div className="col-span-12 grid grid-cols-12 gap-4 intro-y">
              {
                watch("galleries").map((field, idx) => (
                  <div className="col-span-12 sm:col-span-3 box p-4 relative grid grid-cols-12 gap-4" key={location.pathname + `galleries.${idx}`}>
                    <div className="col-span-12 sm:col-span-1 absolute top-[-16px] right-[-16px] sm:grid hidden">
                      <Button
                        variant="danger"
                        disabled={formState.isSubmitting || idx == 0}
                        type="button"
                        className="rounded-full h-7 w-7 p-0"
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

                                  const galleries = getValues("galleries").filter((_, i) => i !== idx)
                                  if (field.pinned && galleries.length > 0) {
                                    galleries[0].pinned = true;
                                  }
                                  setValue("galleries", galleries || [], {
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
                        <Lucide icon="Cross" className="w-4 h-4 rotate-45" />
                      </Button>
                    </div>
                    <div className="absolute top-6 left-6 z-20">
                      <Button
                        className="w-8 h-8 flex flex-col p-0 rounded-full"
                        type="button"
                        variant={watch(`galleries.${idx}.pinned`) ? "primary" : "outline-warning"}
                        disabled={formState.isSubmitting}
                        onClick={() => {
                          setValue("galleries",
                            getValues("galleries").map((gallery, i) => i === idx ? { ...gallery, pinned: true } : { ...gallery, pinned: false }),
                          );
                        }}
                      >
                        {watch(`galleries.${idx}.pinned`) ? <Lucide icon="BookImage" className="w-4 h-4" /> : <Lucide icon="ImageOff" className="w-4 h-4" />}
                      </Button>
                    </div>
                    <div className="col-span-12 h-fit">
                      <div className="col-span-12 sm:col-span-12 w-full relative">
                        <Controller
                          name={`galleries.${idx}.link`}
                          control={control}
                          defaultValue=""
                          key={location.pathname + `galleries.${idx}.link`}
                          render={({ field, fieldState }) =>
                            <>
                              <UploadDropzone
                                className="h-36"
                                uploadType="image"
                                name={`galleries.${idx}.link`}
                                index={idx}
                                onChange={uploadHandler}
                                fileList={field.value ? [field.value] : []}
                                onRemove={() => {
                                  setValue(`galleries.${idx}.link`, "", {
                                    shouldValidate: true,
                                  });
                                }}
                                loading={uploading}
                              />

                              {!!fieldState.error && (
                                <FormHelp className={"text-danger absolute bottom-2 left-2"}>
                                  {fieldState.error.message || "Form is not valid"}
                                </FormHelp>
                              )}
                            </>
                          }
                        />
                      </div>
                    </div> 
                    <div className="col-span-12 sm:col-span-12">
                      <div className="">
                        <Controller
                          name={`galleries.${idx}.name`}
                          control={control}
                          defaultValue=""
                          key={location.pathname + `galleries.${idx}.name`}
                          render={({ field, fieldState }) =>
                            <>
                              <FormInput
                                id="validation-form-6"
                                name={`galleries.${idx}.name`}
                                value={field.value || ""}
                                className={clsx({
                                  "border-danger": !!fieldState.error,
                                })}
                                onChange={field.onChange}
                                placeholder="Title"
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
                      <div className="mt-2">
                        <Controller
                          name={`galleries.${idx}.description`}
                          control={control}
                          defaultValue=""
                          key={location.pathname + `galleries.${idx}.description`}
                          render={({ field, fieldState }) =>
                            <>
                              <FormTextarea
                                rows={2}
                                id="validation-form-6"
                                value={field.value || ""}
                                name={`galleries.${idx}.description`}
                                className={clsx({
                                  "border-danger": !!fieldState.error,
                                })}
                                onChange={field.onChange}
                                placeholder="Description"
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
                                  setValue("galleries", getValues("galleries").filter((_, i) => i !== idx), {
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
                  </div>
                ))
              }
              <div className="col-span-12 sm:col-span-3 flex justify-end min-h-64">
                <Button
                  variant="outline-primary"
                  className="w-full flex flex-col"
                  type="button"
                  disabled={formState.isSubmitting}
                  onClick={() => {
                    setValue("galleries",
                      [...getValues("galleries"), {uuid:"", name: "", description: "", link: "", pinned: false }],
                      { shouldValidate: true }
                    );
                  }}
                >
                  <Lucide icon="Cross" className="w-[20%] h-[20%]" />
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