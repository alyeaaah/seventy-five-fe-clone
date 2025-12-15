import Button from "@/components/Base/Button";
import { FormHelp, FormInput, FormLabel, FormSelect, InputGroup } from "@/components/Base/Form";
import { Dialog } from "@/components/Base/Headless";
import { useRef } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LevelsData, levelsPayloadSchema } from "./api/schema";
import { LevelsApiHooks } from "./api";
import { queryClient } from "@/utils/react-query";
import { useToast } from "@/components/Toast/ToastContext";
interface Props {
  isModalOpen: boolean;
  setIsModalOpen: (value: boolean) => void;
  selectedLevel?: Partial<LevelsData>;
  onDismiss: () => void;
}
export const ModalForm = (props: Props) => {
  const { isModalOpen, setIsModalOpen, selectedLevel, onDismiss } = props;
  const submitButtonRef = useRef(null);
  const { showNotification } = useToast();
  const { mutate: actionCreateLevel } = LevelsApiHooks.useCreateLevel();
  const { mutate: actionUpdateLevel } = LevelsApiHooks.useUpdateLevel(
    {
      params: {
        uuid: selectedLevel?.uuid || 0
      }
    },
  );
  
  const methods = useForm({
    mode: "onChange",
    defaultValues: {
      name: selectedLevel?.name || "",
      level_tier: selectedLevel?.level_tier || 0,
    },
    resolver: zodResolver(levelsPayloadSchema),
  });
  const onSubmit = (values: any) => {
    if (selectedLevel) {
      actionUpdateLevel(values, {
        onSuccess: () => {
          setIsModalOpen(false);
          methods.reset();
          queryClient.invalidateQueries({
            queryKey: LevelsApiHooks.getKeyByAlias("getLevelsList"),
          });

          showNotification({
            duration: 3000,
            text: "Level updated successfully",
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
      actionCreateLevel(values, {
        onSuccess: () => {
          setIsModalOpen(false);
          queryClient.invalidateQueries({
            queryKey: LevelsApiHooks.getKeyByAlias("getLevelsList"),
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
                New Level #
              </h2>
            </Dialog.Title>
            <Dialog.Description className="grid grid-cols-24 gap-4 gap-y-3">
              <div className="col-span-12 sm:col-span-12">
                <FormLabel htmlFor="modal-form-1">Level</FormLabel>
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
              <div className="col-span-12 sm:col-span-12">
                <FormLabel htmlFor="modal-form-2">Tier</FormLabel>
                <Controller
                  name="level_tier"
                  control={control}
                  render={({ field, fieldState }) =>
                    <>
                      <FormSelect id="modal-form-2" name="type" onChange={(e)=>field.onChange(
                        +e.target.value)} value={field.value}>
                        {[0, 1, 2, 3, 4, 5].map((tier) => (
                          <option key={tier} value={tier}>
                            {!!tier ? tier : "Choose Type"}
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