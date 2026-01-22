import { useAtomValue } from "jotai";
import { userAtom } from "@/utils/store";
import { Alert, Divider, Modal } from "antd";
import Lucide from "@/components/Base/Lucide";
import { IconLogoAlt } from "@/assets/images/icons";
import moment from "moment";
import Button from "@/components/Base/Button";
import { useState } from "react";
import { PublicPlayer } from "@/pages/Public/Player";
import { PlayerHomeApiHooks } from "../Home/api";
import { RefereeApiHooks } from "./api";
import { matchCodePayloadSchema } from "./api/schema";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormHelp, FormInput, FormLabel } from "@/components/Base/Form";
import { useToast } from "@/components/Toast/ToastContext";
import { useNavigate } from "react-router-dom";
import { paths } from "@/router/paths";
import { useRouteParams } from "typesafe-routes/react-router";
import { decodeBase64 } from "@/utils/helper";
import { PublicMatchApiHooks } from "@/pages/Public/Match/api";

export const PlayerReferee = () => {
  const userData = useAtomValue(userAtom);
  const navigate = useNavigate();
  const { showNotification } = useToast();
  const [matchUUID, setMatchUUID] = useState<string>("");
  const { data } = PlayerHomeApiHooks.useGetPlayersDetail({
    params: {
      uuid: userData?.uuid as string
    }
  });
  const { data: matchDetail } = PublicMatchApiHooks.useGetMatchDetail({
    params: {
      uuid: matchUUID
    }
  }, {
    enabled: !!matchUUID,
    onSuccess: () => {
      navigate(paths.player.referee.match({ matchUuid: matchUUID }).$);
      setMatchUUID("");
    }
  });
  const { codes } = useRouteParams(paths.player.referee.index);
  const methods = useForm({
    mode: "onChange",
    defaultValues: {
      matchCode: codes || "",
    },
    resolver: zodResolver(matchCodePayloadSchema),
  });
  const { control, formState, handleSubmit } = methods;

  const { mutate: validateMatchCode } = RefereeApiHooks.useValidateMatchCode({}, { retry: false });

  const onSubmit = (values: any) => {
    const decoded: {
      mUU?: string;
      d?: string
    } = decodeBase64(values.matchCode);
    setMatchUUID(decoded?.mUU || "");
    //   onSuccess: (response: any) => {
    //     if (response.success) {
    //       showNotification({
    //         duration: 3000,
    //         text: "Match code validated successfully",
    //         icon: "CheckSquare",
    //         variant: "success",
    //       });
    //       if (response.matchUuid) {
    //         navigate(paths.player.referee.match({ matchUuid: response.matchUuid }).$);
    //       }
    //     } else {
    //       showNotification({
    //         duration: 3000,
    //         text: response.message || "Invalid match code",
    //         icon: "WashingMachine",
    //         variant: "danger",
    //       });
    //     }
    //     methods.reset();
    //   },
    //   onError: (e: any) => {
    //     showNotification({
    //       duration: 3000,
    //       text: e?.message || "Failed to validate match code",
    //       icon: "WashingMachine",
    //       variant: "danger",
    //     });
    //   },
    // });
  };

  return (
    <div className="w-full py-0 grid grid-cols-12 gap-4">
      <div className="col-span-12">
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <IconLogoAlt className="w-16 h-16 text-emerald-800" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Referee Portal</h1>
              <p className="text-gray-600">Enter match code to access referee dashboard</p>
            </div>

            <FormProvider {...methods}>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <FormLabel>Match Code</FormLabel>
                  <Controller
                    name="matchCode"
                    control={control}
                    render={({ field, fieldState }) => (
                      <>
                        <FormInput
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Enter match code"
                          className="text-center text-lg font-mono"
                        />
                        {!!fieldState.error && (
                          <FormHelp className={"text-danger"}>{fieldState.error.message || "Form is not valid"}</FormHelp>
                        )}
                      </>
                    )}
                  />

                </div>

                <Button
                  variant="primary"
                  type="submit"
                  className="w-full"
                  disabled={formState.isSubmitting || !formState.isValid}
                >
                  {formState.isSubmitting ? (
                    <>
                      <Lucide icon="Loader2" className="w-4 h-4 mr-2 animate-spin" />
                      Validating...
                    </>
                  ) : (
                    <>
                      <Lucide icon="ShieldCheck" className="w-4 h-4 mr-2" />
                      Access Match
                    </>
                  )}
                </Button>
              </form>
            </FormProvider>

            <div className="mt-8 text-center">
              <p className="text-sm text-gray-500">
                Welcome, {data?.data?.name || "Referee"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
