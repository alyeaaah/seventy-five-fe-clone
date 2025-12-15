import Button from "@/components/Base/Button";
import { FormHelp, FormInput, FormLabel, FormSelect, InputGroup } from "@/components/Base/Form";
import { Dialog } from "@/components/Base/Headless";
import { useRef } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CategoriesData, categoriesPayloadSchema } from "./api/schema";
import { CategoriesApiHooks } from "./api";
import { queryClient } from "@/utils/react-query";
import { useToast } from "@/components/Toast/ToastContext";
interface Props {
  isModalOpen: boolean;
  setIsModalOpen: (value: boolean) => void;
  selectedCategory?: Partial<CategoriesData>;
  onDismiss: () => void;
}
export const ModalForm = (props: Props) => {
  const { isModalOpen, setIsModalOpen, selectedCategory, onDismiss } = props;
  const submitButtonRef = useRef(null);
  const { showNotification } = useToast();
  const { mutate: actionCreateCategory } = CategoriesApiHooks.useCreateCategory();
  const { mutate: actionUpdateCategory } = CategoriesApiHooks.useUpdateCategory(
    {
      params: {
        uuid: selectedCategory?.uuid || 0
      }
    },
  );
  
  const methods = useForm({
    mode: "onChange",
    defaultValues: {
      name: selectedCategory?.name || "",
    },
    resolver: zodResolver(categoriesPayloadSchema),
  });
  const onSubmit = (values: any) => {
    if (selectedCategory) {
      actionUpdateCategory(values, {
        onSuccess: () => {
          setIsModalOpen(false);
          methods.reset();
          queryClient.invalidateQueries({
            queryKey: CategoriesApiHooks.getKeyByAlias("getCategoriesList"),
          });

          showNotification({
            duration: 3000,
            text: "Category updated successfully",
            icon: "CheckSquare2",
            variant: "success",
          });
        },
        onError: (e: any) => {
          showNotification({
            duration: 3000,
            text: e?.message || "Failed to update category",
            icon: "WashingMachine",
            variant: "danger",
          });
        },
      });
    } else {
      actionCreateCategory(values, {
        onSuccess: () => {
          setIsModalOpen(false);
          queryClient.invalidateQueries({
            queryKey: CategoriesApiHooks.getKeyByAlias("getCategoriesList"),
          });
          showNotification({
            duration: 3000,
            text: "Category created successfully",
            icon: "CheckSquare",
            variant: "success",
          });
        },
        onError: (e: any) => {
          showNotification({
            duration: 3000,
            text: e?.message || "Failed to create category",
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
                New Category
              </h2>
            </Dialog.Title>
            <Dialog.Description className="grid grid-cols-24 gap-4 gap-y-3">
              <div className="col-span-12 sm:col-span-12">
                <FormLabel htmlFor="modal-form-1">Category</FormLabel>
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
                          name="category"
                          placeholder="Beginner"
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