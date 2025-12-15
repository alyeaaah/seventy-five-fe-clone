import Button from "@/components/Base/Button";
import { FormHelp, FormInput, FormLabel, FormSelect, FormSwitch, FormTextarea } from "@/components/Base/Form";
import { useState } from "react";
import { Controller, FormProvider, SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TournamentsPayload, tournamentsSchema } from "../api/schema";
import { TournamentsApiHooks } from "../api";
import { queryClient } from "@/utils/react-query";
import { useToast } from "@/components/Toast/ToastContext";
import clsx from "clsx";
import {
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
import { LevelsApiHooks } from "../../MasterData/Levels/api";
import dayjs from "dayjs";
import ReactQuill from "react-quill";
import { isHtmlEmpty } from "@/utils/helper";
import TournamentSteps from "../Components/TournamentSteps";
import { CourtsApiHooks } from "../../Courts/api";
import { LeagueApiHooks } from "../../MasterData/League/api";
import { ModalForm as ModalFormLeague } from "../../MasterData/League/ModalForm";
import { totalGroup } from "@/utils/faker";


interface Props {
  tournament?: string;
}

export const TournamentForm = (props: Props) => {
  const navigate = useNavigate();
  const queryParams = useRouteParams(paths.administrator.tournaments.edit);
  const { tournament: tournamentUuid } = queryParams;
  const { showNotification } = useToast();
  const [uploading, setUploading] = useState<boolean>(false);
  const [modalAlert, setModalAlert] = useState<AlertProps | undefined>(undefined);
  const [modalLeague, setModalLeague] = useState<boolean>(false);
  const isGeometric = (n: number) => n > 0 && (n & (n - 1)) === 0;

  const { mutate: actionCreateTournament } = TournamentsApiHooks.useCreateTournament({}, {
    onSuccess(data) {
      if (!data.data.uuid) {
        return;
      }
      showNotification({
        duration: 3000,
        text: "Tournament created successfully, continue adding players",
        icon: "CheckSquare",
        variant: "success",
      });
      navigate(paths.administrator.tournaments.new.players({ id: data.data.uuid || tournamentUuid }).$);
    },
    retry: false
  });
  const location = useLocation();
  const [ruleDescription, setRuleDescription] = useState<string>("");
  const { data: levelData } = LevelsApiHooks.useGetLevelsList();
  const { data: leagueData } = LeagueApiHooks.useGetLeagueList({
    queries: {
      page: 1,
      limit: 100,
      year: new Date().getFullYear(),
      future: true,
    }
  });
  const { data: courtData } = CourtsApiHooks.useGetCourtsList();
  const { data } = TournamentsApiHooks.useGetTournamentsDetail({
    params: {
      uuid: tournamentUuid || 0
    }
  }, {
    onSuccess: (data) => {
      if (data) {
        methods.reset({
          uuid: data.data.uuid || "",
          name: data.data.name,
          description: data.data.description,
          start_date: data.data.start_date,
          end_date: data.data.end_date,
          media_url: data.data.media_url,
          strict_level: data.data.strict_level,
          level: data.data.level || "",
          level_uuid: data.data.level_uuid,
          type: data.data.type || "KNOCKOUT",
          league_id: data.data.league_id || "",
          court_uuid: data.data.court_uuid,
          total_group: data.data.total_group || 0,
          rules: data?.data?.rules || [{
            uuid: "",
            description: "",
          }],
          // points: data.data.points,
        });
      }
    },
    enabled: !!tournamentUuid
  });
  const { mutate: actionUpdateTournament } = TournamentsApiHooks.useUpdateTournament(
    {
      params: {
        uuid: tournamentUuid || 0
      }
    },
    {
      onSuccess: (result) => {
        showNotification({
          duration: 3000,
          text: "Tournament updated successfully",
          icon: "CheckSquare",
          variant: "success",
        });
        navigate(paths.administrator.tournaments.new.players({ id: result.data.uuid || tournamentUuid }).$);
      },
      onError: (e: any) => {
        showNotification({
          duration: 3000,
          text: e?.message || "Failed to update tournament",
          icon: "WashingMachine",
          variant: "danger",
        });
      },
    }
  );
  const methods = useForm({
    mode: "onChange",
    defaultValues: {
      uuid: tournamentUuid || "",
      name: data?.data?.name || "",
      description: data?.data?.description || "",
      start_date: data?.data?.start_date || new Date(),
      end_date: data?.data?.end_date || new Date(),
      media_url: data?.data?.media_url || undefined,
      strict_level: data?.data?.strict_level || false,
      level: data?.data?.level || undefined,
      level_uuid: data?.data?.level_uuid || "",
      court_uuid: data?.data?.court_uuid || "",
      league_id: data?.data?.league_id || "",
      total_group: data?.data?.total_group || 0,
      type: data?.data?.type || "KNOCKOUT",
      rules: data?.data?.rules?.map((rule) => ({
        uuid: rule.uuid || undefined,
        description: rule.description || "",
      })) || [],
    },
    resolver: zodResolver(tournamentsSchema),
  });
  const { control, formState, handleSubmit, setValue, watch, getValues } = methods;

  const { mutateAsync: actionUploadImage } = adminApiHooks.useMediaUpload({});

  const uploadHandler = async (info: UploadChangeParam, index: number) => {
    setUploading(true);
    await actionUploadImage({ image: info.file as RcFile }, {
      onError: (error) => {
        setUploading(false);
        showNotification({
          duration: 3000,
          text: `Failed to upload image ${error?.message}`,
          icon: "XCircle",
          variant: "danger",
        });
      },
      onSuccess: (res) => {
        setValue(`media_url`, res.imageUrl, {
          shouldValidate: true,
        });
      }
    });
    setUploading(false);
  }
  const onSubmit: SubmitHandler<any> = (values: TournamentsPayload) => {
    if (tournamentUuid) {
      const existingFields = data?.data?.rules || [];
      const removedFields = existingFields.filter(field => !values?.rules?.find(f => f.uuid === field.uuid)).map(field => ({
        ...field,
        is_delete: true
      }));
      values.rules = [...values?.rules || [], ...removedFields];
      actionUpdateTournament(values, {
        onSuccess: () => {
          methods.reset();
          queryClient.invalidateQueries({
            queryKey: TournamentsApiHooks.getKeyByAlias("getTournamentsList"),
          });
          queryClient.invalidateQueries({
            queryKey: TournamentsApiHooks.getKeyByAlias("getTournamentsDetail"),
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
      actionCreateTournament(values, {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: TournamentsApiHooks.getKeyByAlias("getTournamentsList"),
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

  return (
    <>
      <div className="flex flex-row items-center mt-8 intro-y justify-between">
        <h2 className="mr-auto text-lg font-medium">{tournamentUuid ? "Edit" : "Add New"} Tournament</h2>
      </div>
      <Divider />
      <TournamentSteps step={1} />
      <FormProvider {...methods} key={location.pathname + "_form"}>
        <form onSubmit={handleSubmit(onSubmit)} className="relative">
          <div className="grid grid-cols-12 gap-4 ">
            <div className="col-span-12 lg:col-span-6 box p-4">
              <div className="grid grid-cols-12 gap-2">
                <div className="col-span-12">
                  <h2 className=" font-medium">Tournament Information</h2>
                  <Divider className="mb-0 " />
                </div>
                <div className="col-span-12 lg:col-span-4 w-full h-24">
                  <FormLabel htmlFor="modal-form-1">Logo</FormLabel>
                  <Controller
                    name={`media_url`}
                    control={control}
                    defaultValue=""
                    key={location.pathname + `media_url`}
                    render={({ field, fieldState }) =>
                      <>
                        <UploadDropzone
                          uploadType="image"
                          name={`media_url`}
                          index={0}
                          onChange={uploadHandler}
                          fileList={field.value ? [field.value] : []}
                          onRemove={() => {
                            setValue(`media_url`, "", {
                              shouldValidate: true,
                            });
                          }}
                          loading={uploading}
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
                <div className="col-span-12 lg:col-span-8 grid grid-cols-12 gap-2 pl-2">
                  <div className="col-span-12 lg:col-span-12">
                    <FormLabel htmlFor="modal-form-1">Tournament Name</FormLabel>
                    <Controller
                      name="name"
                      control={control}
                      render={({ field, fieldState }) =>
                        <>
                          <FormInput
                            id="validation-form-6"
                            name="name"
                            value={field.value}
                            className={clsx({
                              "border-danger": !!fieldState.error,
                            })}
                            onChange={field.onChange}
                            placeholder="Tournament Name"
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
                  <div className="col-span-12 lg:col-span-12">
                    <FormLabel htmlFor="modal-form-2">Description</FormLabel>
                    <Controller
                      name="description"
                      control={control}
                      render={({ field, fieldState }) =>
                        <>
                          <FormTextarea
                            rows={2}
                            id="validation-form-6"
                            value={field.value}
                            name="description"
                            className={clsx({
                              "border-danger": !!fieldState.error,
                            })}
                            onChange={field.onChange}
                            placeholder="Description"
                          ></FormTextarea>
                          {!!fieldState.error && (
                            <FormHelp className={"text-danger"}>
                              {fieldState.error.message || "Form is not valid"}
                            </FormHelp>
                          )}
                        </>
                      }
                    />
                  </div>
                </div>

                <div className="col-span-12 lg:col-span-4 mt-4">
                  <FormLabel htmlFor="modal-form-1">Start Date</FormLabel>
                  <Controller
                    name="start_date"
                    control={control}
                    render={({ field, fieldState }) =>
                      <>
                        <Litepicker
                          value={moment(field.value).format('ddd, D MMM YYYY')}
                          onChange={(e) => {
                            const startDate = moment(e.target.value.split(" - ")[0]).toISOString();
                            const endDate = moment(e.target.value.split(" - ")[1]).toISOString();
                            field.onChange(startDate);
                            setValue('end_date', endDate, {
                              shouldValidate: true,
                            });
                          }}
                          options={{
                            singleMode: false,
                            autoApply: false,
                            numberOfColumns: 2,
                            numberOfMonths: 2,
                            showWeekNumbers: false,
                            format: 'ddd, D MMM YYYY',
                            dropdowns: {
                              minYear: 2020,
                              maxYear: null,
                              months: true,
                              years: true,
                            },
                          }}
                          className=" mx-auto"
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
                <div className="col-span-12 lg:col-span-4 mt-4">
                  <FormLabel htmlFor="modal-form-1">End Date</FormLabel>
                  <Controller
                    name="end_date"
                    control={control}
                    render={({ field, fieldState }) =>
                      <>
                        <Litepicker
                          value={moment(field.value).format('ddd, D MMM YYYY')}
                          onChange={(e) => {
                            const startDate = moment(e.target.value.split(" - ")[0]).toISOString();
                            const endDate = moment(e.target.value.split(" - ")[1]).toISOString();
                            field.onChange(endDate);
                            setValue('start_date', startDate, {
                              shouldValidate: true,
                            });
                          }}
                          options={{
                            singleMode: false,
                            autoApply: false,
                            numberOfColumns: 2,
                            numberOfMonths: 2,
                            showWeekNumbers: false,
                            format: 'ddd, D MMM YYYY',
                            dropdowns: {
                              minYear: 2020,
                              maxYear: null,
                              months: true,
                              years: true,
                            },
                          }}
                          className=" mx-auto"
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
                <div className="col-span-12 lg:col-span-4 mt-4">
                  <FormLabel htmlFor="modal-form-1">Time</FormLabel>
                  <Controller
                    name="start_date"
                    control={control}
                    render={({ field, fieldState }) =>
                      <>
                        <TimePicker.RangePicker
                          value={[dayjs(field.value), dayjs(watch('end_date'))]}
                          onOk={(e) => {
                            if (e[0] && e[1]) {
                              const startDt = moment(getValues('start_date')).set('hour', e[0].hour()).set('minute', e[0].minute()).toISOString();
                              const endDt = moment(getValues('end_date')).set('hour', e[1].hour()).set('minute', e[1].minute()).toISOString();
                              field.onChange(startDt);
                              setValue('end_date', endDt);
                            }
                          }}
                          height={"38px"}
                          showNow={false}
                          format="HH:mm"
                          className="mx-auto"
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
                <div className="col-span-12 lg:col-span-6 mb-2">
                  <FormLabel htmlFor="modal-league">League (Optional)</FormLabel>
                  <Controller
                    name="league_id"
                    control={control}
                    render={({ field, fieldState }) =>
                      <>
                        <div className="flex flex-row items-center">
                          <FormSelect
                            id="modal-league"
                            name="league_id"
                            onChange={(e) => {
                              field.onChange(Number(e.target.value));
                              setValue("league_id", Number(e.target.value), {
                                shouldValidate: true,
                              });
                            }}
                            value={field.value}
                          >
                            <option key={"chooseLevel"} value="">Select League</option>
                            {leagueData?.data?.map((item) => (
                              <option key={item.id} value={item.id}>
                                {item.name} ({item.year})
                              </option>
                            ))}
                          </FormSelect>
                          <Button
                            type="button"
                            variant="outline-primary"
                            className="mx-2"
                            onClick={() => {
                              setModalLeague(true);
                            }}
                          >
                            <Lucide icon="Plus" />
                            New
                          </Button>
                        </div>
                        {!!fieldState.error && (
                          <FormHelp className={"text-danger"}>
                            {fieldState.error.message || "Form is not valid"}
                          </FormHelp>
                        )}
                      </>
                    }
                  />
                </div>
                <div className="col-span-12 lg:col-span-6 mb-2">
                  <FormLabel htmlFor="modal-form-1">Court</FormLabel>
                  <Controller
                    name="court_uuid"
                    control={control}
                    render={({ field, fieldState }) =>
                      <>
                        <FormSelect
                          id="modal-form-2"
                          name="court_uuid"
                          onChange={(e) => {
                            field.onChange(e.target.value);
                            setValue("court_uuid", e.target.value, {
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

                <div className="col-span-12 lg:col-span-3 mb-2">
                  <FormLabel htmlFor="modal-form-1">Tournament Type</FormLabel>
                  <Controller
                    name="type"
                    control={control}
                    render={({ field, fieldState }) =>
                      <div className="flex flex-col items-start pt-2">
                        <FormSwitch className="flex flex-row">
                          <FormSwitch.Input id="checkbox-switch-7" type="checkbox" checked={field.value != "KNOCKOUT"} onChange={(e) => field.onChange(!e.target.checked ? "KNOCKOUT" : "ROUND ROBIN")} />
                          <FormSwitch.Label htmlFor="checkbox-switch-7">
                            {field.value != "KNOCKOUT" ? "Round Robin" : "Knockout"}
                          </FormSwitch.Label>
                        </FormSwitch>
                        {field.value != "KNOCKOUT" && <FormHelp className={""}>
                          Requires 6 or more teams with min 12 players
                        </FormHelp>}
                        {field.value == "KNOCKOUT" && <FormHelp className={""}>
                          Requires 4 or more teams with min 8 players
                        </FormHelp>}
                        {!!fieldState.error && (
                          <FormHelp className={"text-danger"}>
                            {fieldState.error.message || "Form is not valid"}
                          </FormHelp>
                        )}
                      </div>
                    }
                  />
                </div>
                <div className="col-span-12 lg:col-span-9 mb-2 pl-4">
                  <FormLabel htmlFor="modal-form-1">Total Group</FormLabel>
                  <Controller
                    name="total_group"
                    control={control}
                    render={({ field, fieldState }) =>
                      <div className="flex flex-row gap-2 flex-wrap">
                        {totalGroup.map((item) => (
                          <Button
                            key={item}
                            variant={field.value == item ? "primary" : "outline-primary"}
                            onClick={() => field.onChange(item)}
                            className="w-10"
                            disabled={watch("type") !== "ROUND ROBIN"}
                            type="button"
                          >
                            {item}
                          </Button>
                        ))}
                      </div>
                    }
                  />
                  {!isGeometric(watch("total_group")) && <FormHelp className={""}>
                    By default, best group <span className="font-bold">runner up</span> of the tournament will be qualified to the next round
                  </FormHelp>}
                </div>
                <div className="col-span-12 lg:col-span-6 mb-2">
                  <FormLabel htmlFor="modal-form-1">Level</FormLabel>
                  <Controller
                    name="level_uuid"
                    control={control}
                    render={({ field, fieldState }) =>
                      <>
                        <FormSelect
                          id="modal-form-2"
                          name="level_uuid"
                          onChange={(e) => {
                            field.onChange(e.target.value);
                            setValue("level", e.target.value, {
                              shouldValidate: true,
                            });
                          }}
                          value={field.value}
                        >
                          <option key={"chooseLevel"} value="">Select Level</option>
                          {levelData?.data?.map((item) => (
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
                <div className="col-span-12 lg:col-span-3 mb-2 pl-4">
                  <FormLabel htmlFor="modal-form-1">Level</FormLabel>
                  <Controller
                    name="strict_level"
                    control={control}
                    render={({ field, fieldState }) =>
                      <div className="flex items-center pt-2">
                        <FormSwitch>
                          <FormSwitch.Input id="checkbox-switch-7" type="checkbox" checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />
                          <FormSwitch.Label htmlFor="checkbox-switch-7">
                            {field.value ? "Strict Level" : "Open"}
                          </FormSwitch.Label>
                        </FormSwitch>
                        {!!fieldState.error && (
                          <FormHelp className={"text-danger"}>
                            {fieldState.error.message || "Form is not valid"}
                          </FormHelp>
                        )}
                      </div>
                    }
                  />
                </div>
              </div>
            </div>
            <div className="col-span-12 lg:col-span-6 box h-fit p-4 grid grid-cols-12 ">
              <div className="col-span-12">
                <h2 className=" font-medium">Rules</h2>
                <Divider className="mb-2" />
              </div>
              <div className="col-span-12 grid grid-cols-12">
                {watch('rules')?.map((rule, index) => (
                  <div className="col-span-12 grid grid-cols-12 gap-2" key={index + "_rule"} >
                    <div className="col-span-1 text-right pr-2 ">
                      <Button type="button" size="sm" variant="outline-success" onClick={() => {
                        // setValue('rules', watch('rules').filter((_, i) => i !== index));
                      }}>
                        {index + 1}
                      </Button>
                    </div>
                    <div className="col-span-10 flex items-center">
                      <div className="html-render" dangerouslySetInnerHTML={{ __html: decodeURIComponent(rule.description) }}></div>
                    </div>
                    <div className="col-span-1">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline-danger"
                        onClick={() => {
                          setValue('rules', watch('rules').filter((_, i) => i !== index));
                        }}
                      >
                        <Lucide icon="Trash" />
                      </Button>
                    </div>
                    <Divider className="col-span-12 mt-0 mb-2" />
                  </div>
                ))}
              </div>
              <div className="col-span-12 lg:col-span-9 mb-2 mt-2 flex flex-row items-center">
                <ReactQuill
                  value={ruleDescription}
                  onChange={setRuleDescription}
                  theme="snow"
                  className="w-full min-h-36"

                  modules={{
                    toolbar: [
                      [
                        { 'size': ['small', false, 'large', 'huge'] },
                        'bold', 'italic', 'underline', 'link',
                        { 'color': [] },
                        { 'background': [] },
                        { 'align': [] },
                        { 'list': 'ordered' }, { 'list': 'bullet' }],
                    ]
                  }}
                />
              </div>
              <div className="col-span-12 lg:col-span-3 mb-2 mt-2 flex flex-row items-start pl-4">
                <Button
                  type="button"
                  variant="primary"
                  className="w-full"
                  key={JSON.stringify(!isHtmlEmpty(ruleDescription))}
                  disabled={isHtmlEmpty(ruleDescription) || watch('rules').length >= 20}
                  onClick={() => {
                    setValue('rules', [...getValues('rules'), {
                      uuid: undefined, description: encodeURIComponent(ruleDescription
                        .replace(/class="ql-size-small"/g, 'class="text-xs"')
                        .replace(/class="ql-size-large"/g, 'class="text-xl"')
                        .replace(/class="ql-size-huge"/g, 'class="text-3xl"')
                        // For other classes you might want to replace
                        .replace(/class="ql-align-center"/g, 'class="text-center"')
                        .replace(/class="ql-align-right"/g, 'class="text-right"'))
                    }]);
                    setRuleDescription("");
                  }}
                >
                  <Lucide icon="Plus" className="w-4 h-4 mr-2" />
                  Add Rule
                </Button>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-12 col-span-12 mt-6">
            <div className="col-span-12 box p-4 flex justify-between" >
              <Button
                type="button"
                variant="outline-secondary"
                onClick={() => {
                  methods.reset();
                  navigate(-1);
                }}
                className="w-[46%] lg:w-auto lg:mr-2"
              >
                Cancel
              </Button>
              <div className="flex">
                {tournamentUuid && <Button
                  type="button"
                  variant="outline-secondary"
                  onClick={() => {
                    navigate(paths.administrator.tournaments.new.players({ id: tournamentUuid }).$);

                  }}
                  className="w-[46%] lg:w-auto lg:mr-2"
                >
                  Next Step
                </Button>}
                <Button
                  variant="primary"
                  type="submit"
                  className="w-[46%] lg:w-auto"
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

      <ModalFormLeague
        key={"" + modalLeague.toString()}
        isModalOpen={modalLeague}
        setIsModalOpen={setModalLeague}
        onDismiss={() => {
          setModalLeague(false);
        }} />
    </>
  )
}
