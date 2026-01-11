import Button from "@/components/Base/Button";
import { FormHelp, FormInput, FormLabel, FormSelect, InputGroup } from "@/components/Base/Form";
import { useState } from "react";
import { Controller, FormProvider, SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { queryClient } from "@/utils/react-query";
import { useToast } from "@/components/Toast/ToastContext";
import clsx from "clsx";
import {
  AutoComplete,
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
import { MerchProductPayload, merchProductPayloadSchema } from "../api/schema";
import { TagsApiHooks } from "../../MasterData/Tags/api";
import { useDebounce } from "ahooks";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { isHtmlEmpty } from "@/utils/helper";
import { productSizeValue, productUnitValue } from "@/utils/faker";
import { MerchProductsApiHooks } from "../../Merchandise/api";
interface Props {
  merchProduct?: string;
}

export const MerchandiseNew = (props: Props) => {
  const navigate = useNavigate();
  const queryParams = useRouteParams(paths.administrator.blog.edit);
  const { id: merchProductUuid } = queryParams;
  const { showNotification } = useToast();
  const [uploading, setUploading] = useState<boolean>(false);
  const [tagKeyword, setTagKeyword] = useState<string>("");

  const [modalAlert, setModalAlert] = useState<AlertProps | undefined>(undefined);
  const { mutate: actionCreateMerchProduct } = MerchProductsApiHooks.useCreateMerchProducts({}, {
    retry: false
  });
  const location = useLocation();
  const { data } = MerchProductsApiHooks.useGetMerchProductsDetail({
    params: {
      uuid: merchProductUuid || 0
    }
  }, {
    onSuccess: (data) => {
      if (data) {
        methods.reset({
          uuid: data.data.uuid,
          name: data.data.name,
          description: decodeURIComponent(data.data.description),
          unit: data.data.unit,
          status: data.data.status,
          media_url: data.data.media_url || "",
          image_cover: data.data.image_cover,
          details: data.data.details.map((detail) => ({
            ...detail,
            uuid: detail.uuid || undefined
          })) || [],
          galleries: data.data.galleries.map((gallery) => ({
            ...gallery,
            pinned: gallery.link == data?.data?.image_cover,
            uuid: gallery.uuid || undefined
          })) || [],
        });
      }
    },
    enabled: !!merchProductUuid
  });
  const { data: tagData } = TagsApiHooks.useGetTagsList(
    {
      queries: {
        search: useDebounce( tagKeyword, {wait:400}),
        limit:30
      }
    }
  );
  const { mutate: actionUpdateMerchProduct } = MerchProductsApiHooks.useUpdateMerchProducts(
    {
      params: {
        uuid: merchProductUuid || 0
      }
    }, {
      retry: false
    }
  );
  const methods = useForm({
    mode: "onChange",
    defaultValues: {
      uuid: merchProductUuid || "",
      name: data?.data?.name || "",
      description: decodeURIComponent(data?.data?.description || ""),
      unit: data?.data?.unit || "",
      status: data?.data?.status || "ACTIVE",
      image_cover: data?.data?.image_cover || "",
      media_url: data?.data?.media_url || "",
      details: data?.data?.details.map((detail) => ({
        size: detail.size || "",
        price: detail.price || 0,
        quantity: detail.quantity || 0,
        is_delete: false,
        uuid: detail.uuid || undefined
      })) || [{
        uuid: undefined,
        product_uuid: undefined,
        size: "",
        price: 0,
        quantity: 0,
        is_delete: false
      }],
      galleries: data?.data?.galleries.map((gallery) => ({
        name: gallery.name || "",
        link: gallery.link || "",
        pinned: gallery.link == data?.data?.image_cover || false,
        is_delete: false,
        uuid: gallery.uuid || undefined
      })) || [{
        uuid: undefined,
        pinned: true,
        link: "",
        name: "",
        is_delete: false
      }],
    },
    resolver: zodResolver(merchProductPayloadSchema),
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
  const onSubmit: SubmitHandler<any> = (values: MerchProductPayload) => {
    values.description = encodeURIComponent(
      values.description
        .replace(/class="ql-size-small"/g, 'class="text-xs"')
        .replace(/class="ql-size-large"/g, 'class="text-xl"')
        .replace(/class="ql-size-huge"/g, 'class="text-3xl"')
        // For other classes you might want to replace
        .replace(/class="ql-align-center"/g, 'class="text-center"')
        .replace(/class="ql-align-right"/g, 'class="text-right"')
    );
    if (merchProductUuid) {
      const existingGalleries  = data?.data?.galleries || [];
      const removedGalleries = existingGalleries.filter(gallery => !values?.galleries?.find(f => f.link === gallery.link)).map(gallery => ({
        ...gallery,
        is_delete: true,
        name: gallery.name || "",
        link: gallery.link || "",
        uuid: gallery.uuid || ""
      }));
      values.galleries = [...(values?.galleries || []), ...(removedGalleries || [])];
      const existingDetails = data?.data?.details || [];
      const removedDetails = existingDetails.filter(detail => !values?.details?.find(f => f.size === detail.size)).map(detail => ({
        ...detail,
        is_delete: true,
        size: detail.size || "",
        price: detail.price || 0,
        quantity: detail.quantity || 0,
        uuid: detail.uuid || ""
      }));
      values.details = [...(values?.details || []), ...(removedDetails || [])];
      
      actionUpdateMerchProduct(values, {
        onSuccess: () => {
          methods.reset();
          queryClient.invalidateQueries({
            queryKey: MerchProductsApiHooks.getKeyByAlias("getMerchProducts"),
          });
          queryClient.invalidateQueries({
            queryKey: MerchProductsApiHooks.getKeyByAlias("getMerchProductsDetail"),
          });
          showNotification({
            duration: 3000,
            text: "MerchProduct updated successfully",
            icon: "CheckSquare2",
            variant: "success",
          });
          navigate(-1);
        },
        onError: (e: any) => {
          showNotification({
            duration: 3000,
            text: e?.message || "Failed to update merchProduct",
            icon: "WashingMachine",
            variant: "danger",
          });
        },
      });
    } else {
      actionCreateMerchProduct(values, {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: MerchProductsApiHooks.getKeyByAlias("getMerchProducts"),
          });
          queryClient.invalidateQueries({
            queryKey: MerchProductsApiHooks.getKeyByAlias("getMerchProductsDetail"),
          });
          methods.reset();
          showNotification({
            duration: 3000,
            text: "MerchProduct created successfully",
            icon: "CheckSquare",
            variant: "success",
          });
          navigate(-1);
        },
        onError: (e: any) => {
          showNotification({
            duration: 3000,
            text: e?.message || "Failed to create merchProduct",
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
        <h2 className="mr-auto text-lg font-medium">{merchProductUuid ? "Edit" : "Add New"} Product</h2>
      </div>
      <Divider />
      <FormProvider {...methods} key={location.pathname+"_form"}>
        <form onSubmit={handleSubmit(onSubmit)} key={location.pathname+"_form2"}>
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 grid grid-cols-12 gap-4 intro-y box p-4">
              {watch('galleries').map((gallery, idx) => <div className="col-span-12 sm:col-span-4 lg:col-span-2 w-full relative" key={idx}>

                <div className="absolute top-2 left-2 z-20">
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
                <div className="col-span-12 sm:col-span-1 absolute top-2 right-2 sm:grid hidden">
                  {!gallery.link && <Button
                    variant="danger"
                    disabled={formState.isSubmitting || idx == 0}
                    type="button"
                    className="rounded-full h-7 w-7 p-0"
                    onClick={() => {
                      const galleries = getValues("galleries").filter((_, i) => i !== idx)
                      if (gallery.pinned && galleries.length > 0) {
                        galleries[0].pinned = true;
                      }
                      setValue("galleries", galleries || [], {
                        shouldValidate: true
                      });
                    }}
                  >
                    <Lucide icon="Cross" className="w-4 h-4 rotate-45" />
                  </Button>
                  }
                </div>
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
                          const galleries = getValues("galleries").filter((_, i) => i !== idx)
                          if (getValues(`galleries.${idx}.pinned`) && galleries.length > 0) {
                            galleries[0].pinned = true;
                          }
                          setValue("galleries", galleries || [], {
                            shouldValidate: true
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
              </div>)}
              <div className="col-span-12 sm:col-span-4 lg:col-span-2 w-full relative">
                <Button
                  type="button"
                  onClick={() => {
                    setValue('galleries', [...(watch('galleries') || []), { link: "", name: "", pinned: false, is_delete: false, uuid: "" }]);
                  }}
                  className="w-full h-36"
                  variant="outline-primary"
                >
                  <Lucide icon="Cross"/>
                </Button>
              </div>
              <div className="col-span-12 sm:col-span-12">
                <FormLabel htmlFor="modal-form-1">Title</FormLabel>
                <Controller
                  name="name"
                  key={location.pathname+"_title"}
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
              <div className="col-span-12 sm:col-span-12">
                <FormLabel htmlFor="modal-form-2">Content</FormLabel>
                <Controller
                  name="description"
                  key={location.pathname+"_content"}
                  control={control}
                  render={({ field, fieldState }) =>
                    <>
                      <ReactQuill
                        value={field.value}
                        onChange={field.onChange}
                        theme="snow"
                        className="w-full min-h-36"
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

              <div className="col-span-12 sm:col-span-6">
                <FormLabel htmlFor={`unit`}>Unit</FormLabel>
                <Controller
                  name={`unit`}
                  key={location.pathname + `unit`}
                  control={control}
                  render={({ field, fieldState }) =>
                    <>
                      <FormSelect
                        id="validation-form-6"
                        name={`unit`}
                        value={field.value}
                        className={clsx({
                          "border-danger": !!fieldState.error,
                        })}
                        onChange={field.onChange}
                      >
                        {productUnitValue.map((unit) => (
                          <option key={unit.value} value={unit.value}>
                            {unit.label}
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
              </div>
              <div className="col-span-12 sm:col-span-6">
                <FormLabel htmlFor={`media_url`}>External Media URL</FormLabel>
                <Controller
                  name={`media_url`}
                  key={location.pathname + `media_url`}
                  control={control}
                  render={({ field, fieldState }) =>
                    <>
                      <FormInput
                        id="validation-form-6"
                        name={`media_url`}
                        value={field.value}
                        className={clsx({
                          "border-danger": !!fieldState.error,
                        })}
                        onChange={field.onChange}
                        placeholder="https://www.youtube.com/watch?v=hbcpQLvL3M8"
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
              <Divider className="col-span-12"/>
              <div className="col-span-12 grid grid-cols-12 gap-4">
                {
                  watch('details').map((d,i) =>
                  (
                    <div
                      key={i}
                      className="col-span-12 grid grid-cols-12 gap-4"
                    >
                      <div className="col-span-3">
                        <FormLabel htmlFor={`details.${i}.size`}>Size</FormLabel>
                        <Controller
                          name={`details.${i}.size`}
                          key={location.pathname + `details.${i}.size`}
                          control={control}
                          render={({ field, fieldState }) =>
                            <>
                              <FormSelect
                                id="validation-form-6"
                                name={`details.${i}.size`}
                                value={field.value}
                                className={clsx({
                                  "border-danger": !!fieldState.error,
                                })}
                                onChange={field.onChange}
                              >
                                {productSizeValue.map((size) => (
                                  <option key={size.value} value={size.value}>
                                    {size.label}
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
                      </div>
                      <div className="col-span-3">
                        <FormLabel htmlFor={`details.${i}.size`}>Price</FormLabel>
                        <Controller
                          name={`details.${i}.price`}
                          key={location.pathname + `details.${i}.price`}
                          control={control}
                          render={({ field, fieldState }) =>
                            <>
                              <InputGroup>
                                <InputGroup.Text>
                                  Rp.
                                </InputGroup.Text>
                                <FormInput
                                  id="validation-form-6"
                                  name={`details.${i}.price`}
                                  type="number"
                                  value={field.value}
                                  className={clsx({
                                    "border-danger": !!fieldState.error,
                                  })}
                                  onChange={e => field.onChange(Number(e.target.value))}
                                >
                                </FormInput>

                                <InputGroup.Text className="capitalize">
                                  /{watch("unit") || productUnitValue[0].label}
                                </InputGroup.Text>
                              </InputGroup>
                              {!!fieldState.error && (
                                <FormHelp className={"text-danger"}>
                                  {fieldState.error.message || "Form is not valid"}
                                </FormHelp>
                              )}
                            </>
                          }
                        />
                      </div>
                      <div className="col-span-3">
                        <FormLabel htmlFor={`details.${i}.size`}>Stock</FormLabel>
                        <Controller
                          name={`details.${i}.quantity`}
                          key={location.pathname + `details.${i}.quantity`}
                          control={control}
                          render={({ field, fieldState }) =>
                            <>
                              <InputGroup>
                                <FormInput
                                  id="validation-form-6"
                                  name={`details.${i}.quantity`}
                                  type="number"
                                  value={field.value}
                                  className={clsx({
                                    "border-danger": !!fieldState.error,
                                  })}
                                  onChange={e => field.onChange(Number(e.target.value))}
                                >
                                </FormInput>

                                <InputGroup.Text className="capitalize">
                                  {watch("unit") || productUnitValue[0].label}
                                </InputGroup.Text>
                              </InputGroup>
                              {!!fieldState.error && (
                                <FormHelp className={"text-danger"}>
                                  {fieldState.error.message || "Form is not valid"}
                                </FormHelp>
                              )}
                            </>
                          }
                        />
                      </div>
                      <div className="col-span-3 flex flex-col">
                        <FormLabel>&nbsp;</FormLabel>
                        <div>
                          {i > 0 && <Button
                            type="button"
                            variant="outline-danger"
                            onClick={() => {
                              const currectVal = getValues('details') || [];
                              setValue('details', currectVal.filter((_, idx) => idx !== i));
                            }}
                            className="mr-2 w-12"
                            >
                            <Lucide icon="Trash" className="w-4 h-4" />
                          </Button>}
                          {i === getValues('details').length - 1 && <Button
                            type="button"
                            variant="outline-primary"
                            onClick={() => {
                              setValue('details', [...getValues('details'), { size: '', price: 0, quantity: 0, is_delete: false, uuid: "" }]);
                            }}
                            className="w-12"
                            >
                            <Lucide icon="Plus" className="w-4 h-4" />
                        </Button>}
                        </div>
                      </div>
                    </div>
                  ))}
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

                    // console.log(getValues());
                    // const tes = merchProductPayloadSchema.parse(getValues());
                    // console.log(tes);
                    return
                  }}
                  className="mr-2"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  type="submit"
                  disabled={formState.isSubmitting || !formState.isValid || isHtmlEmpty(getValues('description'))}
                >
                  <Lucide icon="Save" className="w-4 h-4 mr-2" />
                  Save
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
                  // disabled={formState.isSubmitting || !formState.isValid}
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