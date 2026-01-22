import Button from "@/components/Base/Button";
import { FormCheck, FormHelp, FormInput, FormLabel } from "@/components/Base/Form";
import { Dialog } from "@/components/Base/Headless";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlayersApiHooks } from "../api";
import { updateAccessPayloadSchema } from "../api/schema";
import { queryClient } from "@/utils/react-query";
import { useToast } from "@/components/Toast/ToastContext";
import { useEffect, useRef } from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  playerUuid: string;
}

export const UpdateAccessModal = ({ isOpen, onClose, playerUuid }: Props) => {
  const submitButtonRef = useRef(null);
  const { showNotification } = useToast();

  const methods = useForm({
    mode: "onChange",
    defaultValues: {
      username: "",
      email: "",
      password: "",
      isReferee: false,
    },
    resolver: zodResolver(updateAccessPayloadSchema),
  });
  const { control, formState, handleSubmit, setValue } = methods;
  const { data } = PlayersApiHooks.useGetPlayersDetail({ params: { uuid: playerUuid } }, {
    enabled: !!playerUuid,
  });
  useEffect(() => {
    if (!!data?.data) {
      setValue("username", data?.data?.username);
      setValue("email", data?.data?.email || "");
      setValue("isReferee", data?.data?.isReferee || false);
    }
  }, [data])
  const { mutate: actionUpdateAccess } = PlayersApiHooks.useUpdatePlayerAccess({ params: { uuid: playerUuid } }, {
    retry: false,
    onSuccess: (res) => {
      queryClient.invalidateQueries({
        queryKey: PlayersApiHooks.getKeyByAlias("getPlayersDetail"),
      });
      return res;
    }
  });

  const onSubmit = (values: any) => {
    actionUpdateAccess(
      values
      ,
      {
        onSuccess: () => {
          showNotification({
            duration: 3000,
            text: "Player access updated successfully",
            icon: "CheckSquare",
            variant: "success",
          });
          onClose();
          methods.reset();
          queryClient.invalidateQueries({
            queryKey: PlayersApiHooks.getKeyByAlias("getPlayersList"),
          });
        },
        onError: (e: any) => {
          showNotification({
            duration: 3000,
            text: e?.message || "Failed to update player access",
            icon: "WashingMachine",
            variant: "danger",
          });
        },
      }
    );
  };

  return (
    <Dialog
      open={isOpen}
      onClose={() => {
        onClose();
        methods.reset();
      }}
      initialFocus={submitButtonRef}
    >
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Dialog.Panel>
            <Dialog.Title>
              <h2 className="mr-auto text-base font-medium">Update Player Access</h2>
            </Dialog.Title>
            <Dialog.Description className="grid grid-cols-24 gap-4 gap-y-3">
              <div className="col-span-24 sm:col-span-12">
                <FormLabel>Username</FormLabel>
                <Controller
                  name="username"
                  control={control}
                  render={({ field, fieldState }) => (
                    <>
                      <FormInput value={field.value} onChange={field.onChange} placeholder="Username" />
                      {!!fieldState.error && (
                        <FormHelp className={"text-danger"}>{fieldState.error.message || "Form is not valid"}</FormHelp>
                      )}
                    </>
                  )}
                />
              </div>

              <div className="col-span-24 sm:col-span-12">
                <FormLabel>Email</FormLabel>
                <Controller
                  name="email"
                  control={control}
                  render={({ field, fieldState }) => (
                    <>
                      <FormInput type="email" value={field.value} onChange={field.onChange} placeholder="Email" />
                      {!!fieldState.error && (
                        <FormHelp className={"text-danger"}>{fieldState.error.message || "Form is not valid"}</FormHelp>
                      )}
                    </>
                  )}
                />
              </div>

              <div className="col-span-24 sm:col-span-12">
                <FormLabel>Password</FormLabel>
                <Controller
                  name="password"
                  control={control}
                  render={({ field, fieldState }) => (
                    <>
                      <FormInput
                        type="password"
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Password (leave empty to keep current)"
                      />
                      {!!fieldState.error && (
                        <FormHelp className={"text-danger"}>{fieldState.error.message || "Form is not valid"}</FormHelp>
                      )}
                    </>
                  )}
                />
              </div>

              <div className="col-span-24 sm:col-span-12">
                <FormLabel>Referee Access</FormLabel>
                <Controller
                  name="isReferee"
                  control={control}
                  render={({ field, fieldState }) => (
                    <div className="flex-row flex mt-2">
                      <FormCheck className="mr-6">
                        <FormCheck.Input
                          id="update-access-referee-yes"
                          type="radio"
                          name="isReferee"
                          value={1}
                          onChange={() => field.onChange(true)}
                          checked={field.value === true}
                        />
                        <FormCheck.Label htmlFor="update-access-referee-yes" className="flex-row flex">
                          Yes
                        </FormCheck.Label>
                      </FormCheck>
                      <FormCheck>
                        <FormCheck.Input
                          id="update-access-referee-no"
                          type="radio"
                          name="isReferee"
                          value={1}
                          onChange={() => field.onChange(false)}
                          checked={field.value === false}
                        />
                        <FormCheck.Label htmlFor="update-access-referee-no" className="flex-row flex">
                          No
                        </FormCheck.Label>
                      </FormCheck>
                      {!!fieldState.error && (
                        <FormHelp className={"text-danger"}>{fieldState.error.message || "Form is not valid"}</FormHelp>
                      )}
                    </div>
                  )}
                />
              </div>
            </Dialog.Description>
            <Dialog.Footer>
              <Button
                type="button"
                variant="outline-secondary"
                onClick={() => {
                  onClose();
                  methods.reset();
                }}
                className="w-20 mr-1"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                type="submit"
                className="w-32"
                disabled={formState.isSubmitting || !formState.isValid}
                ref={submitButtonRef}
              >
                Update
              </Button>
            </Dialog.Footer>
          </Dialog.Panel>
        </form>
      </FormProvider>
    </Dialog>
  );
};