import Button from "@/components/Base/Button";
import { FormHelp, FormInput, FormLabel, FormSelect, InputGroup } from "@/components/Base/Form";
import { Dialog } from "@/components/Base/Headless";
import { useRef } from "react";
import { tagsTypeValue } from "@/utils/faker";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TagsData, tagsPayloadSchema } from "./api/schema";
import { TagsApiHooks } from "./api";
import { queryClient } from "@/utils/react-query";
import { useToast } from "@/components/Toast/ToastContext";
interface Props {
  isModalOpen: boolean;
  setIsModalOpen: (value: boolean) => void;
  selectedTag?: Partial<TagsData>;
  onDismiss: () => void;
}
export const ModalForm = (props: Props) => {
  const { isModalOpen, setIsModalOpen, selectedTag, onDismiss } = props;
  const submitButtonRef = useRef(null);
  const { showNotification } = useToast();
  const { mutate: actionCreateTag } = TagsApiHooks.useCreateTag();
  const { mutate: actionUpdateTag } = TagsApiHooks.useUpdateTag(
    {
      params: {
        uuid: selectedTag?.uuid || 0
      }
    },
  );
  
  const methods = useForm({
    mode: "onChange",
    defaultValues: {
      name: selectedTag?.name || "",
      type: selectedTag?.type || "",
      parent_uuid: selectedTag?.parent_uuid || null,
    },
    resolver: zodResolver(tagsPayloadSchema),
  });
  const onSubmit = (values: any) => {
    if (selectedTag) {
      actionUpdateTag(values, {
        onSuccess: () => {
          setIsModalOpen(false);
          methods.reset();
          queryClient.invalidateQueries({
            queryKey: TagsApiHooks.getKeyByAlias("getTagsList"),
          });

          showNotification({
            duration: 3000,
            text: "Tag updated successfully",
            icon: "CheckSquare2",
            variant: "success",
          });
        },
        onError: (e: any) => {
          showNotification({
            duration: 3000,
            text: e?.message || "Failed to update tag",
            icon: "WashingMachine",
            variant: "danger",
          });
        },
      });
    } else {
      actionCreateTag(values, {
        onSuccess: () => {
          setIsModalOpen(false);
          queryClient.invalidateQueries({
            queryKey: TagsApiHooks.getKeyByAlias("getTagsList"),
          });
          methods.reset()
          showNotification({
            duration: 3000,
            text: "Tag created successfully",
            icon: "CheckSquare",
            variant: "success",
          });
        },
        onError: (e: any) => {
          showNotification({
            duration: 3000,
            text: e?.message || "Failed to create tag",
            icon: "WashingMachine",
            variant: "danger",
          });
        },
      });
    }
  }
  
  const { control, formState, handleSubmit } = methods;
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
                New Tag #
              </h2>
            </Dialog.Title>
            <Dialog.Description className="grid grid-cols-24 gap-4 gap-y-3">
              <div className="col-span-12 sm:col-span-12">
                <FormLabel htmlFor="modal-form-1">Tag</FormLabel>
                <Controller
                  name="name"
                  control={control}
                  render={({ field, fieldState }) => 
                    <>
                      <InputGroup className="mt-2">
                        <InputGroup.Text>#</InputGroup.Text>
                        <FormInput
                          onChange={field.onChange}
                          value={field.value}
                          id="modal-form-1"
                          type="text"
                          name="tag"
                          placeholder="SpinWith75"
                          prefix="#"
                        />
                      </InputGroup>
                      {!fieldState.error && (
                        <FormHelp>
                          Don't use any space, use camelCase or snake_case with underscore instead of using space.
                        </FormHelp>
                      )}
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
                        {tagsTypeValue.map((item) => (
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
              {/* <div className="col-span-12 sm:col-span-6">
                <FormLabel htmlFor="modal-form-6">Parent</FormLabel>
                <FormSelect id="modal-form-6" name="parent">
                  <option>10</option>
                  <option>25</option>
                  <option>35</option>
                  <option>50</option>
                </FormSelect>
              </div> */}
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