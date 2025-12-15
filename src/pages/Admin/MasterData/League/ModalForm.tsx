import Button from "@/components/Base/Button";
import { FormHelp, FormInput, FormLabel, FormSelect, FormTextarea, InputGroup } from "@/components/Base/Form";
import { Dialog } from "@/components/Base/Headless";
import { useRef, useState } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LeagueData, leaguePayloadSchema } from "./api/schema";
import { LeagueApiHooks } from "./api";
import { queryClient } from "@/utils/react-query";
import { useToast } from "@/components/Toast/ToastContext";
import UploadDropzone from "@/components/UploadDropzone";
import { RcFile, UploadChangeParam } from "antd/es/upload";
import { adminApiHooks } from "@/pages/Login/api";
import { ColorPicker } from "antd";
interface Props {
  isModalOpen: boolean;
  setIsModalOpen: (value: boolean) => void;
  selectedLeague?: Partial<LeagueData>;
  onDismiss: () => void;
}
export const ModalForm = (props: Props) => {
  const { isModalOpen, setIsModalOpen, selectedLeague, onDismiss } = props;
  const submitButtonRef = useRef(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const { showNotification } = useToast();
  const { mutate: actionCreateLeague } = LeagueApiHooks.useCreateLeague();
  const { mutate: actionUpdateLeague } = LeagueApiHooks.useUpdateLeague(
    {
      params: {
        uuid: selectedLeague?.id || 0
      }
    },
  );
  
  const methods = useForm({
    mode: "onChange",
    defaultValues: {
      name: selectedLeague?.name || "",
      description: selectedLeague?.description || "",
      color_scheme: selectedLeague?.color_scheme || "",
      media_url: selectedLeague?.media_url || "",
      status: selectedLeague?.status || "ENDED",
      year: selectedLeague?.year || new Date().getFullYear(),
    },
    resolver: zodResolver(leaguePayloadSchema),
  });
  const onSubmit = (values: any) => {
    if (selectedLeague) {
      actionUpdateLeague(values, {
        onSuccess: () => {
          setIsModalOpen(false);
          methods.reset();
          queryClient.invalidateQueries({
            queryKey: LeagueApiHooks.getKeyByAlias("getLeagueList"),
          });

          showNotification({
            duration: 3000,
            text: "League updated successfully",
            icon: "CheckSquare2",
            variant: "success",
          });
        },
        onError: (e: any) => {
          showNotification({
            duration: 3000,
            text: e?.message || "Failed to update level",
            icon: "WashingMachine",
            variant: "danger",
          });
        },
      });
    } else {
      actionCreateLeague(values, {
        onSuccess: () => {
          setIsModalOpen(false);
          queryClient.invalidateQueries({
            queryKey: LeagueApiHooks.getKeyByAlias("getLeagueList"),
          });
          methods.reset();
          showNotification({
            duration: 3000,
            text: "Level created successfully",
            icon: "CheckSquare",
            variant: "success",
          });
        },
        onError: (e: any) => {
          showNotification({
            duration: 3000,
            text: e?.message || "Failed to create level",
            icon: "WashingMachine",
            variant: "danger",
          });
        },
      });
    }
  }
  
  const { control, formState, handleSubmit, setValue } = methods;

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
        setValue(`media_url`, res.imageUrl, {
          shouldValidate: true,
        });
      }
    });
    setUploading(false);
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
                {selectedLeague ? "Update" : "New"} League #
              </h2>
            </Dialog.Title>
            <Dialog.Description className="grid grid-cols-24 gap-4 gap-y-3">
              <div className="col-span-12 sm:col-span-12">
                <FormLabel>Photo Profile</FormLabel>
                <Controller
                  name={`media_url`}
                  control={control}
                  defaultValue=""
                  key={location.pathname + `media_url`}
                  render={({ field, fieldState }) =>
                    <>
                      <UploadDropzone
                        uploadType="image"
                        name={`media_url`}
                        index={0}
                        onChange={uploadHandler}
                        fileList={field.value ? [field.value] : []}
                        onRemove={() => {
                          setValue(`media_url`, "", {
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
              <div className="col-span-12 sm:col-span-12 flex flex-col">
                <FormLabel>Color Scheme</FormLabel>
                <Controller
                  name={`color_scheme`}
                  control={control}
                  defaultValue=""
                  key={location.pathname + `color_scheme`}
                  render={({ field, fieldState }) =>
                    <>
                      <ColorPicker
                        defaultValue={field.value || "#065F46"}
                        size="small"
                        onChange={(e) => {
                          field.onChange(e.toHex().toUpperCase());
                        }}
                        className="h-8 flex items-center"
                        showText
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
                <FormLabel htmlFor="modal-form-1">League Name</FormLabel>
                <Controller
                  name="name"
                  control={control}
                  render={({ field, fieldState }) =>
                    <>
                      <InputGroup className="mt-2">
                        <FormInput
                          onChange={field.onChange}
                          value={field.value}
                          id="modal-form-1"
                          type="text"
                          name="level"
                          placeholder="League 2"
                          prefix="#"
                        />
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
              <div className="col-span-12 sm:col-span-12">
                <FormLabel htmlFor="modal-desc">Description</FormLabel>
                <Controller
                  name="description"
                  control={control}
                  render={({ field, fieldState }) =>
                    <>
                      <InputGroup className="mt-2">
                        <FormTextarea
                          onChange={field.onChange}
                          value={field.value}
                          id="modal-desc"
                          name="description"
                          placeholder="This league is presented by SeventyFive annually"
                          prefix="#"
                        />
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
              <div className="col-span-12 sm:col-span-12">
                <FormLabel htmlFor="modal-year">Year</FormLabel>
                <Controller
                  name="year"
                  control={control}
                  render={({ field, fieldState }) =>
                    <>
                      <InputGroup className="mt-2">
                        <FormInput
                          onChange={field.onChange}
                          value={field.value}
                          id="modal-year"
                          type="number"
                          name="year"
                          placeholder={new Date().getFullYear().toString()}
                          prefix="#"
                        />
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
            </Dialog.Description>
            <Dialog.Footer>
              <Button
                type="button"
                variant="outline-secondary"
                onClick={() => {
                  methods.reset();
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