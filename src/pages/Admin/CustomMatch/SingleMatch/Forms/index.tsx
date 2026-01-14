import Button from "@/components/Base/Button";
import { FormHelp, FormInput, FormLabel, FormSelect, FormSwitch, FormTextarea, InputGroup } from "@/components/Base/Form";
import { useState } from "react";
import { Controller, FormProvider, SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { queryClient } from "@/utils/react-query";
import { useToast } from "@/components/Toast/ToastContext";
import clsx from "clsx";
import {
  DatePicker,
  Divider, TimePicker
} from "antd";
import { adminApiHooks } from "@/pages/Login/api";
import { RcFile, UploadChangeParam } from "antd/es/upload";
import { useLocation, useNavigate } from "react-router-dom";
import { useRouteParams } from "typesafe-routes/react-router";
import { paths } from "@/router/paths";
import UploadDropzone from "@/components/UploadDropzone";
import Lucide from "@/components/Base/Lucide";
import Confirmation, { AlertProps } from "@/components/Modal/Confirmation";
import Litepicker from "@/components/Base/Litepicker";
import moment from "moment";
import dayjs from "dayjs";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { imageResizer, isHtmlEmpty } from "@/utils/helper";
import { LevelsApiHooks } from "@/pages/Admin/MasterData/Levels/api";
import { CourtsApiHooks } from "@/pages/Admin/Courts/api";
import { TournamentsApiHooks } from "@/pages/Admin/Tournaments/api";
import { TournamentsPayload, tournamentsSchema } from "@/pages/Admin/Tournaments/api/schema";
import { MatchDetailApiHooks } from "@/pages/Admin/MatchDetail/api";
import { CustomMatchesPayload, customMatchesPayloadSchema, CustomMatchPayload, customMatchPayloadSchema } from "../../api/schema";
import { CustomMatchApiHooks } from "../../api";
import { CourtField } from "@/pages/Admin/Courts/api/schema";
import { faker } from "@faker-js/faker";
import Image from "@/components/Image";
import { PlayerPicker, PlayerPickerProps } from "@/pages/Admin/Players/Components/PlayerPicker";
import { IconVS } from "@/assets/images/icons";
import { PointConfigurationsApiHooks } from "@/pages/Admin/PointConfig/api";
import { PointConfig } from "@/pages/Admin/PointConfig/api/schema";


interface Props {
  tournament?: string;
}

export const CustomMatchForm = (props: Props) => {
  const navigate = useNavigate();
  const queryParams = useRouteParams(paths.administrator.customMatch.edit);
  const { customMatchUuid } = queryParams;
  const { showNotification } = useToast();
  const [modalAlert, setModalAlert] = useState<AlertProps | undefined>(undefined);
  const [playerPicker, setPlayerPicker] = useState<PlayerPickerProps | undefined>(undefined);
  const { data: levelData } = LevelsApiHooks.useGetLevelsList();
  const { data: courtData } = CourtsApiHooks.useGetCourtsList();
  const { data: pointConfigData } = PointConfigurationsApiHooks.useGetPointConfigurationsDropdown();
  const { data: detailMatch } = MatchDetailApiHooks.useGetMatchDetail({
    params: {
      uuid: customMatchUuid || 0
    },
  }, {
    onSuccess: (data) => {
      if (data) {
        methods.reset({
          matches: [{
            id: data.data.id || 0,
            uuid: data.data.uuid || "",
            shortcode: data.data.shortcode || "G" + faker.string.alphanumeric({ length: 6, casing: "upper" }),
            home_team_uuid: data.data.home_team_uuid || "",
            away_team_uuid: data.data.away_team_uuid || "",
            home_team_score: data.data.home_team_score || 0,
            away_team_score: data.data.away_team_score || 0,
            home_team: {
              name: data.data.home_team?.name || "",
              uuid: data.data.home_team?.uuid || "",
              alias: data.data.home_team?.alias || "",
              players: data.data.home_team?.players.map((player) => ({
                name: player.name || "",
                uuid: player.uuid || "",
                media_url: player.media_url || "",
              })) || [],
            },
            away_team: {
              name: data.data.away_team?.name || "",
              uuid: data.data.away_team?.uuid || "",
              alias: data.data.away_team?.alias || "",
              players: data.data.away_team?.players.map((player) => ({
                name: player.name || "",
                uuid: player.uuid || "",
                media_url: player.media_url || "",
              })) || [],
            },
            with_ad: data.data.with_ad || false,
            status: data.data.status || "UPCOMING",
            youtube_url: data.data.youtube_url || "",
            court_field_uuid: data.data.court_field_uuid || "",
            court_uuid: data.data.court_field?.court?.uuid || "",
            date: data.data.date || new Date().toISOString(),
            point_config_uuid: data.data.point_config_uuid || "",
            point_lose: data.data.point_config?.points?.[0]?.lose_point || 0,
            point_win: data.data.point_config?.points?.[0]?.win_point || 0,
          }],
        });
      }
    },
    enabled: !!customMatchUuid
  });
  const { mutate: actionUpdateCustomMatch } = CustomMatchApiHooks.useUpdateCustomMatch({
    params: {
      uuid: customMatchUuid || 0
    }
  }, {
    retry: false,
    onSuccess: () => {
      showNotification({
        duration: 3000,
        text: "Challenge updated successfully",
        icon: "CheckSquare",
        variant: "success",
      });
      navigate(paths.administrator.customMatch.index, {
        viewTransition: true
      });
    },
    onError: (e: any) => {
      showNotification({
        duration: 3000,
        text: e?.message || "Failed to update challenge",
        icon: "WashingMachine",
        variant: "danger",
      });
    },
  });
  const { mutate: actionCreateCustomMatch } = CustomMatchApiHooks.useCreateCustomMatch({}, {
    onSuccess: () => {
      showNotification({
        duration: 3000,
        text: "Challenge created successfully",
        icon: "CheckSquare",
        variant: "success",
      });
      navigate(paths.administrator.customMatch.index, {
        viewTransition: true
      });
    },
    onError: (e: any) => {
      showNotification({
        duration: 3000,
        text: e?.message || "Failed to create challenge",
        icon: "WashingMachine",
        variant: "danger",
      });
    },
    retry: false
  });
  const methods = useForm({
    mode: "onChange",
    defaultValues: {
      matches: [{
        id: detailMatch?.data?.id || 0,
        uuid: customMatchUuid || "",
        shortcode: detailMatch?.data?.shortcode || "G" + faker.string.alphanumeric({ length: 6, casing: "upper" }),
        home_team_uuid: detailMatch?.data?.home_team_uuid || "",
        home_team: detailMatch?.data?.home_team || {
          name: "Team A",
          alias: faker.lorem.word({ length: { max: 9, min: 4 } }),
          players: [{
            uuid: "",
            name: "Choose Player 1",
            media_url: "",
          }, {
            uuid: "",
            name: "Choose Player 2",
            media_url: "",
          }]
        },
        away_team_uuid: detailMatch?.data?.away_team_uuid || "",
        away_team: detailMatch?.data?.away_team || {
          name: "Team B",
          alias: faker.lorem.word({ length: { max: 9, min: 4 } }),
          players: [{
            uuid: "",
            name: "Choose Player 1",
            media_url: "",
          }, {
            uuid: "",
            name: "Choose Player 2",
            media_url: "",
          }]
        },
        home_team_score: detailMatch?.data?.home_team_score || 0,
        away_team_score: detailMatch?.data?.away_team_score || 0,
        with_ad: detailMatch?.data?.with_ad || false,
        status: detailMatch?.data?.status || "UPCOMING",
        youtube_url: detailMatch?.data?.youtube_url || "",
        court_field_uuid: detailMatch?.data?.court_field_uuid || "",
        point_config_uuid: detailMatch?.data?.point_config_uuid || "",
        point_lose: detailMatch?.data?.point_config?.points?.[0]?.lose_point || 0,
        point_win: detailMatch?.data?.point_config?.points?.[0]?.win_point || 0,
        court_uuid: detailMatch?.data?.court_field?.court?.uuid || detailMatch?.data?.court_uuid || "",
        date: detailMatch?.data?.date || new Date().toISOString(),
      }],
    },
    resolver: zodResolver(customMatchesPayloadSchema),
  });
  const { control, formState, handleSubmit, setValue, watch, getValues } = methods;

  const onSubmit: SubmitHandler<any> = (values: CustomMatchesPayload) => {
    if (customMatchUuid) {
      console.log(getValues("matches")[0]);
      console.log(values.matches[0]);

      actionUpdateCustomMatch(values.matches[0] as CustomMatchPayload, {
        onSuccess: () => {
          methods.reset();
          queryClient.invalidateQueries({
            queryKey: CustomMatchApiHooks.getKeyByAlias("getCustomMatchList"),
          });
          queryClient.invalidateQueries({
            queryKey: MatchDetailApiHooks.getKeyByAlias("getMatchDetail"),
          });
        },
        onError: (e: any) => {
          showNotification({
            duration: 3000,
            text: e?.message || "Failed to update tournament",
            icon: "WashingMachine",
            variant: "danger",
          });
        },
      });
    } else {
      actionCreateCustomMatch(values, {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: CustomMatchApiHooks.getKeyByAlias("getCustomMatchList"),
          });
          methods.reset();
        },
        onError: (e: any) => {
          showNotification({
            duration: 3000,
            text: e?.message || "Failed to create tournament",
            icon: "WashingMachine",
            variant: "danger",
          });
        },
      });
    }
  }

  const addMoreMatch = () => {
    const matches = getValues("matches");
    const prevMatch = matches[matches.length - 1];
    matches.push({
      id: 0,
      uuid: "",
      shortcode: "G" + faker.string.alphanumeric({ length: 6, casing: "upper" }),
      home_team_uuid: "",
      home_team: {
        name: "Team A",
        alias: faker.lorem.word({ length: { max: 9, min: 4 } }),
        players: [{
          uuid: "",
          name: "Choose Player 1",
          media_url: "",
        }, {
          uuid: "",
          name: "Choose Player 2",
          media_url: "",
        }]
      },
      away_team_uuid: "",
      away_team: {
        name: "Team B",
        alias: faker.lorem.word({ length: { max: 9, min: 4 } }),
        players: [{
          uuid: "",
          name: "Choose Player 1",
          media_url: "",
        }, {
          uuid: "",
          name: "Choose Player 2",
          media_url: "",
        }]
      },
      home_team_score: 0,
      away_team_score: 0,
      with_ad: false,
      status: "UPCOMING",
      youtube_url: "",
      court_field_uuid: prevMatch.court_field_uuid || "",
      point_config_uuid: prevMatch.point_config_uuid || "",
      point_win: prevMatch.point_win || 0,
      point_lose: prevMatch.point_lose || 0,
      court_uuid: prevMatch.court_uuid || "",
      date: new Date().toISOString(),
    });
    setValue("matches", matches, { shouldValidate: true });
  }
  const applyForAll = (index: number) => {
    const matches = getValues("matches");
    const match = matches[index];
    matches.forEach((item, i) => {
      item.point_config_uuid = match.point_config_uuid;
      item.point_win = match.point_win;
      item.point_lose = match.point_lose;
    });
    setValue("matches", matches, { shouldValidate: true });
  }
  const removeMatch = (index: number) => {
    const matches = getValues("matches");
    matches.splice(index, 1);
    setValue("matches", matches, { shouldValidate: true });
  }
  return (
    <>
      <div className="flex flex-row items-center mt-8 intro-y justify-between">
        <h2 className="mr-auto text-lg font-medium">{customMatchUuid ? "Edit" : "Add New"} Challenger</h2>
      </div>
      <Divider />
      <FormProvider {...methods} key={location.pathname + "_form"}>
        <form onSubmit={handleSubmit(onSubmit)} className="relative">
          <div className="grid grid-cols-12 gap-4 ">
            <div className="col-span-12 2xl:col-span-12 grid-cols-12 gap-4">
              {watch("matches")?.map((match, index) => (
                <div key={index} className="col-span-12 box p-4 mt-4">
                  <div className="grid grid-cols-12 gap-2">
                    <div className="col-span-12 flex justify-between items-center">
                      <div className="flex flex-row items-center">
                        <h2 className="font-medium mr-2">Challenger #{index + 1}</h2>
                        {watch("matches").length > 1 && <Button size="sm" variant="outline-danger" onClick={() => removeMatch(index)}><Lucide icon="Trash" className="h-4 w-4" /></Button>}
                      </div>
                      <div className="bg-lime-50 border border-lime-400 rounded-md text-xs font-medium px-2 py-1">{watch("matches")[index].shortcode}</div>
                    </div>
                    <Divider className="mb-0 col-span-12 mt-0" />
                    <div className="col-span-12 sm:col-span-6 mb-2">
                      <FormLabel >Date</FormLabel>
                      <Controller
                        name={`matches.${index}.date`}
                        control={control}
                        render={({ field, fieldState }) =>
                          <>
                            <DatePicker
                              defaultValue={dayjs(field.value)}
                              showTime={{
                                format: 'HH:mm',
                                minuteStep: 5,
                                disabledHours: () => [1, 2, 3, 4]
                              }}
                              showSecond={false}
                              className="flex"
                              onChange={(datetime) => {
                                field.onChange(dayjs(datetime).toISOString());
                              }}
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
                    <div className="col-span-12 sm:col-span-6 grid grid-cols-12">
                      <div className="col-span-12 sm:col-span-12" >
                        <FormLabel>Point Configuration </FormLabel>
                        <div className="flex flex-col sm:flex-row items-center">
                          <Controller
                            name={`matches.${index}.point_config_uuid`}
                            control={control}
                            render={({ field, fieldState }) =>
                              <>
                                <FormSelect
                                  id="validation-form-6"
                                  name={`matches.${index}.point_config_uuid`}
                                  value={field.value}
                                  className={clsx({
                                    "border-danger": !!fieldState.error,
                                    "sm:w-1/2 w-full": true
                                  })}
                                  onChange={(e) => {
                                    field.onChange(e);
                                    const pointConfig = pointConfigData?.data?.find((item) => item.uuid === e.target.value)?.points?.[0];
                                    console.log(pointConfig);

                                    setValue(`matches.${index}.point_win`, pointConfig?.win_point || 0, { shouldValidate: true });
                                    setValue(`matches.${index}.point_lose`, pointConfig?.lose_point || 0, { shouldValidate: true });
                                  }}
                                >
                                  <option key={"choosePoint"} value="">Select Point</option>
                                  {pointConfigData?.data?.map((item) => (
                                    <option key={item.uuid} value={item.uuid}>
                                      {item.name}
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
                          <div className="sm:w-1/2 w-full h-full flex flex-row justify-around items-center text-sm font-medium mt-2 sm:mt-0">
                            <span className="flex flex-row items-center">Win: {watch(`matches.${index}.point_win`)}&nbsp;<span className="text-xs font-light hidden sm:flex">Points</span></span>
                            <span className="flex flex-row items-center">Lose: {watch(`matches.${index}.point_lose`)}&nbsp;<span className="text-xs font-light hidden sm:flex">Points</span></span>
                            {watch(`matches`).length > 1 && watch(`matches.${index}.point_config_uuid`) && <Button type="button" variant="outline-success" size="sm" className="text-xs" onClick={() => applyForAll(index)} >Apply for All</Button>}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-span-12 sm:col-span-6 mb-2">
                      <FormLabel >Court</FormLabel>
                      <Controller
                        name={`matches.${index}.court_uuid`}
                        control={control}
                        render={({ field, fieldState }) =>
                          <>
                            <FormSelect
                              name={`matches.${index}.court_uuid`}
                              onChange={(e) => {
                                field.onChange(e.target.value);
                                setValue(`matches.${index}.court_uuid`, e.target.value, {
                                  shouldValidate: true,
                                });
                                setValue(`matches.${index}.court_field_uuid`, '', {
                                  shouldValidate: true,
                                });
                              }}
                              value={field.value}
                            >
                              <option key={"chooseCourt"} value="">Select Court</option>
                              {courtData?.data?.map((item) => (
                                <option key={item.uuid} value={item.uuid}>
                                  {item.name}
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
                    {courtData?.data?.find((item) => item.uuid === watch(`matches.${index}.court_uuid`)) && <div className="col-span-12 sm:col-span-6 mb-2">
                      <FormLabel >Field</FormLabel>
                      <Controller
                        name={`matches.${index}.court_field_uuid`}
                        control={control}
                        render={({ field, fieldState }) =>
                          <>
                            <FormSelect

                              name={`matches.${index}.court_field_uuid`}
                              onChange={(e) => {
                                field.onChange(e.target.value);
                                setValue(`matches.${index}.court_field_uuid`, e.target.value, {
                                  shouldValidate: true,
                                });
                              }}
                              value={field.value}
                            >
                              <option key={"chooseCourt"} value="">Select Court</option>
                              {courtData?.data?.find((item) => item.uuid === watch(`matches.${index}.court_uuid`))?.fields?.map((item) => (
                                <option key={item.uuid} value={item.uuid}>
                                  {item.name}
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
                    </div>}
                    <div className="col-span-12 grid grid-cols-12 gap-2">
                      <div className="col-span-12 sm:col-span-5 mb-2 flex flex-col">
                        <FormLabel >{watch(`matches.${index}.home_team.name`)}</FormLabel>
                        {watch(`matches.${index}.home_team.players`)?.map((player, playerIndex) => (
                          <Controller
                            key={playerIndex}
                            name={`matches.${index}.home_team.players.${playerIndex}.name`}
                            control={control}
                            disabled
                            render={({ field, fieldState }) =>
                              <>
                                <InputGroup className="mt-2 cursor-pointer">
                                  <InputGroup.Text className="p-0 w-12 h-12 flex items-center justify-center overflow-hidden">
                                    {player?.media_url ? <Image src={imageResizer(player.media_url, 100)} alt={player.name} className="w-full h-full object-cover" /> : <Lucide icon="CircleUser" className="w-8 h-8" />}
                                  </InputGroup.Text>
                                  <FormInput
                                    onChange={field.onChange}
                                    value={field.value}
                                    readOnly={true}
                                    type="text"
                                    name="tag"
                                    placeholder="Choose Player"
                                    prefix="#"
                                    className="!cursor-pointer"
                                    onClick={() => {
                                      setPlayerPicker({
                                        // choosenPlayer: field.value,
                                        open: true,
                                        onClose: () => setPlayerPicker(undefined),
                                        onSelect: (player) => {
                                          setValue(`matches.${index}.home_team.players.${playerIndex}`, {
                                            name: player.name || "",
                                            uuid: player.uuid || "",
                                            media_url: player.media_url || "",
                                          }, { shouldValidate: true });
                                          setPlayerPicker(undefined);
                                        },
                                      });
                                    }}
                                  />
                                  {player?.uuid &&
                                    <InputGroup.Text className="p-0 w-12 h-12 flex items-center justify-center overflow-hidden">
                                      <Lucide icon="Repeat" className="w-4 h-4" />
                                    </InputGroup.Text>
                                  }
                                </InputGroup>
                                {!!fieldState.error && (
                                  <FormHelp className={"text-danger"}>
                                    {fieldState.error.message || "Form is not valid"}
                                  </FormHelp>
                                )}
                              </>
                            }
                          />
                        ))}
                      </div>
                      <div className="col-span-12 sm:col-span-2 mb-2 flex flex-col items-center justify-center relative">
                        <FormLabel className="sm:flex hidden">&nbsp; </FormLabel>
                        <Divider className="sm:hidden absolute bottom-4 left-0 m-0 border-solid border-slate-600 z-0" />
                        <IconVS className="max-w-24 max-h-16 sm:h-16 h-8 w-max bg-white z-10" />
                      </div>
                      <div className="col-span-12 sm:col-span-5 mb-2 flex flex-col">
                        <FormLabel >{watch(`matches.${index}.away_team.name`)}</FormLabel>
                        {watch(`matches.${index}.away_team.players`)?.map((player, playerIndex) => (
                          <Controller
                            key={playerIndex}
                            name={`matches.${index}.away_team.players.${playerIndex}.name`}
                            control={control}
                            disabled
                            render={({ field, fieldState }) =>
                              <>
                                <InputGroup
                                  className="mt-2 cursor-pointer"
                                  onClick={() => {
                                    const disabledPlayers = ((getValues(`matches.${index}.home_team.players`).map((player) => player.uuid || "")).concat(getValues(`matches.${index}.away_team.players`).map((player) => player.uuid || ""))).filter(str => str != "");
                                    console.log("disabledPlayers", disabledPlayers);

                                    setPlayerPicker({
                                      open: true,
                                      onClose: () => setPlayerPicker(undefined),
                                      onSelect: (player) => {
                                        setValue(`matches.${index}.away_team.players.${playerIndex}`, {
                                          name: player.name || "",
                                          uuid: player.uuid || "",
                                          media_url: player.media_url || "",
                                        }, { shouldValidate: true });
                                        setPlayerPicker(undefined);
                                      },
                                      disabledPlayers: disabledPlayers
                                    });
                                  }}
                                >
                                  {player?.uuid &&
                                    <InputGroup.Text className="p-0 w-12 h-12 flex items-center justify-center overflow-hidden">
                                      <Lucide icon="Repeat" className="w-4 h-4" />
                                    </InputGroup.Text>
                                  }
                                  <FormInput
                                    onChange={field.onChange}
                                    value={field.value}
                                    readOnly={true}
                                    type="text"
                                    name="tag"
                                    placeholder="Choose Player"
                                    prefix="#"
                                    className="!cursor-pointer"
                                  />
                                  <InputGroup.Text className="p-0 w-12 h-12 flex items-center justify-center overflow-hidden">
                                    {player?.media_url ? <Image src={imageResizer(player.media_url, 100)} alt={player.name} className="w-full h-full object-cover" /> : <Lucide icon="CircleUser" className="w-8 h-8" />}
                                  </InputGroup.Text>
                                </InputGroup>
                                {!!fieldState.error && (
                                  <FormHelp className={"text-danger"}>
                                    {fieldState.error.message || "Form is not valid"}
                                  </FormHelp>
                                )}
                              </>
                            }
                          />
                        ))}
                      </div>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-12 col-span-12 mt-6">
            <div className="col-span-12 box p-4 flex sm:justify-between sm:flex-row flex-col space-y-2 sm:space-y-0" >
              <Button
                type="button"
                variant="outline-secondary"
                onClick={() => {
                  // console.log(formState.isValid);
                  // const tes = customMatchesPayloadSchema.parse(getValues());
                  // console.log(tes);
                  methods.reset();
                  navigate(-1);

                }}
                className="sm:w-auto"
              >
                Cancel
              </Button>
              <div className="flex sm:flex-row flex-col space-y-2 sm:space-y-0">
                <Button
                  variant="outline-primary"
                  type="button"
                  className={`sm:w-auto sm:mr-2 ${customMatchUuid ? "hidden" : ""}`}
                  onClick={() => {
                    addMoreMatch();
                  }}
                >
                  <Lucide icon="PlusCircle" className="w-4 h-4 mr-2" />
                  Add More Match
                </Button>
                <Button
                  variant="primary"
                  type="submit"
                  className=" sm:w-auto"
                  disabled={formState.isSubmitting || !formState.isValid}
                >
                  <Lucide icon="Save" className="w-4 h-4 mr-2" />
                  Save & Continue
                </Button>
              </div>
            </div>
          </div>
        </form>
      </FormProvider>
      <Confirmation
        open={!!modalAlert?.open}
        onClose={() => setModalAlert(undefined)}
        icon={modalAlert?.icon || "Info"}
        title={modalAlert?.title || ""}
        description={modalAlert?.description || ""}
        refId={modalAlert?.refId}
        buttons={modalAlert?.buttons}
      />
      <PlayerPicker
        open={!!playerPicker?.open}
        onClose={() => setPlayerPicker(undefined)}
        onSelect={playerPicker?.onSelect || (() => null)}
        {...playerPicker}
      />
    </>
  )
}
