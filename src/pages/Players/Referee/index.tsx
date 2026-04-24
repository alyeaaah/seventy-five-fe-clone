import { useAtomValue } from "jotai";
import { userAtom } from "@/utils/store";
import Lucide from "@/components/Base/Lucide";
import { IconLogoAlt } from "@/assets/images/icons";
import Button from "@/components/Base/Button";
import { useState } from "react";
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
import { PlayerMatchApiHooks } from "../Matches/api";

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

  const { data: assignedRefereesData } = PlayerMatchApiHooks.useGetPlayerRefereeMatches({
    queries: {
      player_uuid: userData?.uuid as string, // This endpoint expects player_uuid, but we want all referees for this match
      match_uuid: ""
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
        <div className="flex flex-col items-center justify-center min-h-[400px] p-2 sm:p-8">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <IconLogoAlt className="w-16 h-16 text-emerald-800" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Referee Portal</h1>
            </div>

            {/* Assigned Matches Section */}
            {assignedRefereesData?.data && assignedRefereesData.data.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg text-center font-semibold text-gray-900 mb-4">Assigned Matches</h2>
                <div className="space-y-3">
                  {assignedRefereesData.data.map((referee) => (
                    <div
                      key={referee.id}
                      className="bg-gray-50 border border-gray-200 rounded-lg p-2 hover:bg-gray-100 transition-colors cursor-pointer"
                      onClick={() => {
                        navigate(paths.player.referee.match({ matchUuid: referee.match?.uuid || "" }).$);
                      }}
                    >
                      <div className="flex flex-col">
                        {/* <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                            <Lucide icon="ShieldCheck" className="w-5 h-5 text-emerald-600" />
                          </div> */}
                        <div className="font-medium text-gray-900 flex flex-row justify-between">
                          <div>
                            {referee.match?.home_team?.name} vs {referee.match?.away_team?.name}
                          </div>

                          <div className="text-xs text-emerald-600 font-medium">
                            Click to enter
                          </div>
                        </div>
                        <div className="text-sm text-gray-500 line-clamp-1">
                          {referee.match?.home_team?.players?.map(p => p.player.nickname || p.player?.name).join("/")}
                        </div>
                        <div className="text-sm text-gray-500 line-clamp-1">
                          {referee.match?.away_team?.players?.map(p => p.player.nickname || p.player?.name).join("/")}
                        </div>
                      </div>
                      {/* <div className="text-right">
                          <div className="text-sm text-gray-500">
                            {new Date(referee.createdAt).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-emerald-600 font-medium">
                            Click to enter
                          </div>
                        </div> */}
                    </div>
                  ))}
                </div>
              </div>
            )}

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
                <Button
                  variant="outline-primary"
                  type="button"
                  className="w-full"
                  disabled={!assignedRefereesData?.data?.length}
                >
                  {(
                    <>
                      <Lucide icon="UserCheck" className="w-4 h-4 mr-2" />
                      Assigned Match
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
