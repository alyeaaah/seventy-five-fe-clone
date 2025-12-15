import Button from "@/components/Base/Button";
import { FormHelp, FormInput, FormLabel, FormSelect, InputGroup } from "@/components/Base/Form";
import { Dialog } from "@/components/Base/Headless";
import { useRef } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { KudosData, kudosPayloadSchema } from "./api/schema";
import { KudosApiHooks } from "./api";
import { queryClient } from "@/utils/react-query";
import { useToast } from "@/components/Toast/ToastContext";
interface Props {
  isModalOpen: boolean;
  setIsModalOpen: (value: boolean) => void;
  selectedKudos?: Partial<KudosData>;
  onDismiss: () => void;
}
export const ModalForm = (props: Props) => {
  const { isModalOpen, setIsModalOpen, selectedKudos, onDismiss } = props;
  const submitButtonRef = useRef(null);
  const { showNotification } = useToast();
  const { mutate: actionCreateKudos } = KudosApiHooks.useCreateKudos();
  const { mutate: actionUpdateKudos } = KudosApiHooks.useUpdateKudos(
    {
      params: {
        uuid: selectedKudos?.uuid || 0
      }
    },
  );
  
  const methods = useForm({
    mode: "onChange",
    defaultValues: {
      name: selectedKudos?.name || "",
    },
    resolver: zodResolver(kudosPayloadSchema),
  });
  const onSubmit = (values: any) => {
    if (selectedKudos) {
      actionUpdateKudos(values, {
        onSuccess: () => {
          setIsModalOpen(false);
          methods.reset();
          queryClient.invalidateQueries({
            queryKey: KudosApiHooks.getKeyByAlias("getKudosList"),
          });
          showNotification({
            duration: 3000,
            text: "Kudos updated successfully",
            icon: "CheckSquare2",
            variant: "success",
          });
        },
        onError: (e: any) => {
          showNotification({
            duration: 3000,
            text: e?.message || "Failed to update kudos",
            icon: "WashingMachine",
            variant: "danger",
          });
        },
      });
    } else {
      actionCreateKudos(values, {
        onSuccess: () => {
          setIsModalOpen(false);
          queryClient.invalidateQueries({
            queryKey: KudosApiHooks.getKeyByAlias("getKudosList"),
          });
          methods.reset();
          showNotification({
            duration: 3000,
            text: "Kudos created successfully",
            icon: "CheckSquare",
            variant: "success",
          });
        },
        onError: (e: any) => {
          showNotification({
            duration: 3000,
            text: e?.message || "Failed to create kudos",
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
                New Kudos #
              </h2>
            </Dialog.Title>
            <Dialog.Description className="grid grid-cols-24 gap-4 gap-y-3">
              <div className="col-span-12 sm:col-span-12">
                <FormLabel htmlFor="modal-form-1">Kudos</FormLabel>
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
                          name="kudos"
                          placeholder="First Serve"
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