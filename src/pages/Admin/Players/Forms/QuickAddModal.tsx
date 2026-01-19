import Button from "@/components/Base/Button";
import { FormCheck, FormHelp, FormInput, FormLabel, FormSelect } from "@/components/Base/Form";
import { Dialog } from "@/components/Base/Headless";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { GenderTypeValue } from "@/utils/faker";
import { LevelsApiHooks } from "../../MasterData/Levels/api";
import { LeagueApiHooks } from "../../MasterData/League/api";
import { PlayersApiHooks } from "../api";
import { quickAddPlayerPayloadSchema } from "../api/schema";
import { queryClient } from "@/utils/react-query";
import { useToast } from "@/components/Toast/ToastContext";
import { useRef } from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const QuickAddModal = ({ isOpen, onClose }: Props) => {
  const submitButtonRef = useRef(null);
  const { showNotification } = useToast();

  const { data: levelData } = LevelsApiHooks.useGetLevelsList();
  const { data: leagueData } = LeagueApiHooks.useGetLeagueList();

  const methods = useForm({
    mode: "onChange",
    defaultValues: {
      name: "",
      nickname: "",
      gender: GenderTypeValue.MALE,
      password: "",
      level_uuid: "",
      league_id: 0,
    },
    resolver: zodResolver(quickAddPlayerPayloadSchema),
  });
  const { control, formState, handleSubmit } = methods;

  const { mutate: actionQuickAddPlayer } = PlayersApiHooks.useQuickAddPlayer({}, { retry: false });

  const onSubmit = (values: any) => {
    actionQuickAddPlayer(values, {
      onSuccess: () => {
        showNotification({
          duration: 3000,
          text: "Player created successfully",
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
          text: e?.message || "Failed to create player",
          icon: "WashingMachine",
          variant: "danger",
        });
      },
    });
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
              <h2 className="mr-auto text-base font-medium">Quick Add Player</h2>
            </Dialog.Title>
            <Dialog.Description className="grid grid-cols-24 gap-4 gap-y-3">
              <div className="col-span-24 sm:col-span-12">
                <FormLabel>Player Name</FormLabel>
                <Controller
                  name="name"
                  control={control}
                  render={({ field, fieldState }) => (
                    <>
                      <FormInput value={field.value} onChange={field.onChange} placeholder="Player Name" />
                      {!!fieldState.error && (
                        <FormHelp className={"text-danger"}>{fieldState.error.message || "Form is not valid"}</FormHelp>
                      )}
                    </>
                  )}
                />
              </div>

              <div className="col-span-24 sm:col-span-12">
                <FormLabel>Nickname</FormLabel>
                <Controller
                  name="nickname"
                  control={control}
                  render={({ field, fieldState }) => (
                    <>
                      <FormInput value={field.value} onChange={field.onChange} placeholder="Nickname" />
                      {!!fieldState.error && (
                        <FormHelp className={"text-danger"}>{fieldState.error.message || "Form is not valid"}</FormHelp>
                      )}
                    </>
                  )}
                />
              </div>

              <div className="col-span-24 sm:col-span-12">
                <FormLabel>Gender</FormLabel>
                <Controller
                  name="gender"
                  control={control}
                  render={({ field, fieldState }) => (
                    <div className="flex-row flex mt-2">
                      <FormCheck className="mr-6" defaultValue={field.value}>
                        <FormCheck.Input
                          id="quick-add-gender-m"
                          type="radio"
                          name="gender"
                          value={GenderTypeValue.MALE}
                          onChange={field.onChange}
                          checked={field.value === GenderTypeValue.MALE}
                        />
                        <FormCheck.Label htmlFor="quick-add-gender-m" className="flex-row flex">
                          Male
                        </FormCheck.Label>
                      </FormCheck>
                      <FormCheck>
                        <FormCheck.Input
                          id="quick-add-gender-f"
                          type="radio"
                          name="gender"
                          value={GenderTypeValue.FEMALE}
                          onChange={field.onChange}
                          checked={field.value === GenderTypeValue.FEMALE}
                        />
                        <FormCheck.Label htmlFor="quick-add-gender-f" className="flex-row flex">
                          Female
                        </FormCheck.Label>
                      </FormCheck>
                      {!!fieldState.error && (
                        <FormHelp className={"text-danger"}>{fieldState.error.message || "Form is not valid"}</FormHelp>
                      )}
                    </div>
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
                      <FormInput type="password" value={field.value} onChange={field.onChange} placeholder="Password" />
                      {!!fieldState.error && (
                        <FormHelp className={"text-danger"}>{fieldState.error.message || "Form is not valid"}</FormHelp>
                      )}
                    </>
                  )}
                />
              </div>

              <div className="col-span-24 sm:col-span-12">
                <FormLabel>Level (Optional)</FormLabel>
                <Controller
                  name="level_uuid"
                  control={control}
                  render={({ field, fieldState }) => (
                    <>
                      <FormSelect name="level_uuid" value={field.value || ""} onChange={(e) => field.onChange(e.target.value)}>
                        <option key={"chooseLevel"} value="">Select Level</option>
                        {levelData?.data?.map((item) => (
                          <option key={item.uuid} value={item.uuid}>
                            {item.name}
                          </option>
                        ))}
                      </FormSelect>
                      {!!fieldState.error && (
                        <FormHelp className={"text-danger"}>{fieldState.error.message || "Form is not valid"}</FormHelp>
                      )}
                    </>
                  )}
                />
              </div>

              <div className="col-span-24 sm:col-span-12">
                <FormLabel>League</FormLabel>
                <Controller
                  name="league_id"
                  control={control}
                  render={({ field, fieldState }) => (
                    <>
                      <FormSelect
                        name="league_id"
                        value={field.value}
                        onChange={(e) => {
                          field.onChange(Number(e.target.value));
                        }}
                      >
                        <option key={"chooseLeague"} value="">Select League</option>
                        {leagueData?.data?.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name}
                          </option>
                        ))}
                      </FormSelect>
                      {!!fieldState.error && (
                        <FormHelp className={"text-danger"}>{fieldState.error.message || "Form is not valid"}</FormHelp>
                      )}
                    </>
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
                Save
              </Button>
            </Dialog.Footer>
          </Dialog.Panel>
        </form>
      </FormProvider>
    </Dialog>
  );
};
