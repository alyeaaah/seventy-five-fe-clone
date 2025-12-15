import Button from "@/components/Base/Button";
import { FormHelp, FormInput, FormLabel, FormSelect, FormTextarea } from "@/components/Base/Form";
import { Dialog } from "@/components/Base/Headless";
import { useRef, useState } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SponsorsData, sponsorsPayloadSchema } from "./api/schema";
import { SponsorsApiHooks } from "./api";
import { queryClient } from "@/utils/react-query";
import { useToast } from "@/components/Toast/ToastContext";
import clsx from "clsx";
import {
  Select,
  UploadProps
} from "antd";
import { adminApiHooks } from "@/pages/Login/api";
import UploadDropzone from "@/components/UploadDropzone";
import { RcFile } from "antd/es/upload";
import { sponsorTypeValue } from "@/utils/faker";
import { useDebounce } from "ahooks";
interface Props {
  isModalOpen: boolean;
  setIsModalOpen: (value: boolean) => void;
  selectedSponsor?: Partial<SponsorsData>;
  onDismiss: () => void;
}
export const ModalForm = (props: Props) => {
  const { isModalOpen, setIsModalOpen, selectedSponsor, onDismiss } = props;
  const submitButtonRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [slotSearch, setSlotSearch] = useState("");

  const { showNotification } = useToast();
  const { mutate: actionCreateSponsor } = SponsorsApiHooks.useCreateSponsor();
  const { mutate: actionUpdateSponsor } = SponsorsApiHooks.useUpdateSponsor(
    {
      params: {
        uuid: selectedSponsor?.uuid || 0
      }
    },
  );
  
  const methods = useForm({
    mode: "onChange",
    defaultValues: {
      name: selectedSponsor?.name || "",
      description: selectedSponsor?.description || "",
      media_url: selectedSponsor?.media_url || "",
      type: selectedSponsor?.type || "",
      slot: selectedSponsor?.slot || ""
    },
    resolver: zodResolver(sponsorsPayloadSchema),
  });
  const { control, formState, handleSubmit, setValue, watch } = methods;

  const { data: slotData, isLoading: slotLoading, refetch: slotRefetch } = SponsorsApiHooks.useGetSponsorsSlot(
    {
      queries: {
        limit: 20,
        search: useDebounce(slotSearch, { wait: 500 }),
      },
      cacheTime: 0,
    },
  );
  const { mutateAsync: actionUploadImage } = adminApiHooks.useMediaUpload({}, {
    onSuccess: (res) => {
      setValue("media_url", res.imageUrl, {
        shouldValidate: true,
      });
    }
  });

  const uploadHandler: UploadProps["onChange"] = async (info) => {
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
    });
    setUploading(false);
  }
  const onSubmit = (values: any) => {
    if (selectedSponsor) {
      actionUpdateSponsor(values, {
        onSuccess: () => {
          setIsModalOpen(false);
          methods.reset();
          queryClient.invalidateQueries({
            queryKey: SponsorsApiHooks.getKeyByAlias("getSponsorsList"),
          });
          queryClient.invalidateQueries({
            queryKey: SponsorsApiHooks.getKeyByAlias("getSponsorsSlot"),
          });
          showNotification({
            duration: 3000,
            text: "Sponsor updated successfully",
            icon: "CheckSquare2",
            variant: "success",
          });
        },
        onError: (e: any) => {
          showNotification({
            duration: 3000,
            text: e?.message || "Failed to update sponsor",
            icon: "WashingMachine",
            variant: "danger",
          });
        },
      });
    } else {
      actionCreateSponsor(values, {
        onSuccess: () => {
          setIsModalOpen(false);
          queryClient.invalidateQueries({
            queryKey: SponsorsApiHooks.getKeyByAlias("getSponsorsList"),
          });
          queryClient.invalidateQueries({
            queryKey: SponsorsApiHooks.getKeyByAlias("getSponsorsSlot"),
          });
          methods.reset();
          showNotification({
            duration: 3000,
            text: "Sponsor created successfully",
            icon: "CheckSquare",
            variant: "success",
          });
        },
        onError: (e: any) => {
          showNotification({
            duration: 3000,
            text: e?.message || "Failed to create sponsor",
            icon: "WashingMachine",
            variant: "danger",
          });
        },
      });
    }
  }
  
  return (
    <Dialog
      open={isModalOpen}
      onClose={() => {
        onDismiss();
        methods.reset();
      }}
      initialFocus={submitButtonRef}
    >
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Dialog.Panel>
            <Dialog.Title>
              <h2 className="mr-auto text-base font-medium">
                New Sponsor #
              </h2>
            </Dialog.Title>
            <Dialog.Description className="grid grid-cols-24 gap-4 gap-y-3">
              <div className="col-span-12 sm:col-span-12 w-full sm:w-64">
                <FormLabel htmlFor="modal-form-1">Image</FormLabel>
                <Controller
                  name="media_url"
                  control={control}
                  render={({ field, fieldState }) =>
                    <>
                      <UploadDropzone
                        index={1}
                        uploadType="image"
                        onChange={uploadHandler}
                        fileList={field.value ? [field.value] : []}
                        onRemove={() => {
                          setValue("media_url", "", {
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
              <div className="col-span-12 sm:col-span-12">
                <FormLabel htmlFor="modal-form-1">Sponsor</FormLabel>
                <Controller
                  name="name"
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
                        placeholder="Sponsor Name"
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
                        placeholder="Sponsor Description"
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
              <div className="col-span-12 sm:col-span-12">
                <FormLabel htmlFor="modal-form-2">Slot</FormLabel>
                <Controller
                  name="slot"
                  control={control}
                  render={({ field, fieldState }) =>
                    <>
                      <Select
                        mode="tags"
                        className="w-full"
                        value={field.value ? [field.value] : null}
                        placeholder="Choose Slot"
                        onSearch={(e) => {
                          setSlotSearch(e)
                        }}
                        onChange={(e) => {
                          field.onChange(e[e.length - 1])
                        }}
                        options={slotData?.data?.map(slot => ({
                          value: slot.name,
                          label: slot.name
                        })) || []}
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
                <FormLabel htmlFor="modal-form-2">Type</FormLabel>
                <Controller
                  name="type"
                  control={control}
                  render={({ field, fieldState }) =>
                    <>
                      <FormSelect id="modal-form-2" name="type" onChange={field.onChange} value={field.value}>
                        {sponsorTypeValue.map((item) => (
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
              </div>
            </Dialog.Description>
            <Dialog.Footer>
              <Button
                type="button"
                variant="outline-secondary"
                onClick={() => {
                  setIsModalOpen(false);
                }}
                className="w-20 mr-1"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                type="submit"
                className="w-20"
                disabled={formState.isSubmitting || !formState.isValid}
                ref={submitButtonRef}
              >
                Save
              </Button>
            </Dialog.Footer>

          </Dialog.Panel>
        </form>
      </FormProvider>
    </Dialog>
  )
}