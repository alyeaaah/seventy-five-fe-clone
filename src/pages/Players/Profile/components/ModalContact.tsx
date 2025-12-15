import { queryClient } from "@/utils/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, FormProvider, SubmitHandler, useForm } from "react-hook-form";
import { PlayerProfileApiHooks } from "../api";
import { PlayersPayload } from "../api/schema";
import { useToast } from "@/components/Toast/ToastContext";
import { useAtomValue } from "jotai";
import { userAtom } from "@/utils/store";
import { PlayersPartialSchema, playersSchema } from "../../Home/api/schema";
import { PlayerHomeApiHooks } from "../../Home/api";
import { FormHelp, FormInput, FormLabel } from "@/components/Base/Form";
import clsx from "clsx";
import Litepicker from "@/components/Base/Litepicker";
import moment from "moment";
import Button from "@/components/Base/Button";
import { Divider } from "antd";
import { PublicPlayerApiHooks } from "@/pages/Public/Player/api";
interface ModalContactProps {
  onClose: () => void;
  data?: PlayersPartialSchema;
}
export const ModalContact = ({onClose, data}: ModalContactProps) => {

  const userData = useAtomValue(userAtom);
  const { showNotification } = useToast();
  console.log("opennn");
  const methods = useForm({
      mode: "onChange",
      defaultValues: {
        uuid: userData?.uuid || "",
        name: data?.name || "",
        email: data?.email || "",
        city: data?.city || "",
        address: data?.address || "",
        username: data?.username || "",
        nickname: data?.nickname || "",
        phone: data?.phone || "",
        media_url: data?.media_url || "",
        dateOfBirth: data?.dateOfBirth || "",
        placeOfBirth: data?.placeOfBirth || "",
        isVerified: data?.isVerified || true,
        gender: data?.gender || "",
        height: data?.height || "",
        skills: data?.skills || {
          forehand: 50,
          backhand: 50,
          serve: 50,
          volley: 50,
          overhead: 50
        },
        turnDate: data?.turnDate || "",
        playstyleForehand: data?.playstyleForehand || "",
        playstyleBackhand: data?.playstyleBackhand || "",
        socialMediaIg: data?.socialMediaIg || "",
        socialMediaX: data?.socialMediaX || "",
        level: data?.level || "",
        level_uuid: data?.level_uuid || "",
      },
    resolver: zodResolver(playersSchema),
    });
  const { control, formState, handleSubmit, setValue, watch, getValues } = methods;
  const { mutate: actionUpdatePlayer } = PlayerProfileApiHooks.useUpdatePlayer({
    params: {
      uuid: userData?.uuid as string
    }
  });
  const onSubmit: SubmitHandler<any> = (values: PlayersPayload) => {
    console.log(values);
    actionUpdatePlayer(values, {
      onSuccess: () => {
        methods.reset();
        queryClient.invalidateQueries({
          queryKey: PlayerHomeApiHooks.getKeyByAlias("getPlayersDetail"),
        });
        queryClient.invalidateQueries({
          queryKey: PublicPlayerApiHooks.getKeyByAlias("getPlayerDetail"),
        });
        showNotification({
          duration: 3000,
          text: "Player updated successfully",
          icon: "CheckSquare2",
          variant: "success",
        });
        onClose();
      },
      onError: (e: any) => {
        showNotification({
          duration: 3000,
          text: e?.message || "Failed to update player",
          icon: "WashingMachine",
          variant: "danger",
        });
      },
    });
  };

  return <>
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="w-full grid grid-cols-12 gap-4">
          <Divider className="col-span-12 my-0" />

          <div className="col-span-12 sm:col-span-12">
            <FormLabel>Phone</FormLabel>
            <Controller
              name="phone"
              control={control}
              render={({ field, fieldState }) =>
                <>
                  <FormInput
                    
                    name="phone"
                    value={field.value}
                    className={clsx({
                      "border-danger": !!fieldState.error,
                    })}
                    onChange={field.onChange}
                    placeholder="Phone"
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
            <FormLabel>Email</FormLabel>
            <Controller
              name="email"
              control={control}
              render={({ field, fieldState }) =>
                <>
                  <FormInput
                    name="email"
                    value={field.value}
                    className={clsx({
                      "border-danger": !!fieldState.error,
                    })}
                    onChange={field.onChange}
                    placeholder="Email"
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
          <Divider className="col-span-12 my-0"/>
          <div className="col-span-12 flex gap-2 justify-end">
            <Button
              type="button"
              onClick={() => {
                methods.reset();
                onClose();
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={formState.isSubmitting || !formState.isValid}
              variant="primary"
            >
              {formState.isSubmitting ? "Updating..." : "Update"}
            </Button>
          </div>
        </div>
      </form>
    </FormProvider>
  </>
}