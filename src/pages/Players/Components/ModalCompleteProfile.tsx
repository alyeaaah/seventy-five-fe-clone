import { Divider, Modal, Slider } from "antd";
import { useAtomValue } from "jotai";
import { userAtom } from "@/utils/store";
import { PlayerHomeApiHooks } from "../Home/api";
import { profileChecker } from "@/utils/helper";
import Lucide from "@/components/Base/Lucide";
import { IconLogo } from "@/assets/images/icons";
import { Controller, FormProvider, SubmitHandler, useForm } from "react-hook-form";
import { FormCheck, FormHelp, FormInput, FormLabel, FormSelect, FormTextarea, InputGroup } from "@/components/Base/Form";
import UploadDropzone from "@/components/UploadDropzone";
import clsx from "clsx";
import { PlayersPayload, playersSchema } from "../Profile/api/schema";
import { playersSchema as playerHomeSchema } from "../Home/api/schema";
import { PlayerProfileApiHooks } from "../Profile/api";
import { queryClient } from "@/utils/react-query";
import { useToast } from "@/components/Toast/ToastContext";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { adminApiHooks } from "@/pages/Login/api";
import { RcFile, UploadChangeParam } from "antd/es/upload";
import { useState } from "react";
import { BackhandStyleValue, ForehandStyleValue, GenderTypeValue } from "@/utils/faker";
import Litepicker from "@/components/Base/Litepicker";
import moment from "moment";
import Button from "@/components/Base/Button";
import Confirmation, { AlertProps } from "@/components/Modal/Confirmation";
import { LandingPageApiHooks } from "@/pages/Public/LandingPage/api";
import { PublicPlayerApiHooks } from "@/pages/Public/Player/api";


export const ModalCompleteProfile = () => {

  const navigate = useNavigate();
  const { showNotification } = useToast();
  const [uploading, setUploading] = useState<boolean>(false);
  const [modalAlert, setModalAlert] = useState<AlertProps | undefined>(undefined);
  const { data: levelList, isLoading, refetch } = LandingPageApiHooks.useGetLevelList({}, { });
  
  const userData = useAtomValue(userAtom);
  const { data } = PlayerHomeApiHooks.useGetPlayersDetail({
    params: {
      uuid: userData?.uuid as string
    }
  }, {
    onSuccess: (data) => {
      if (data) {
        methods.reset({
          uuid: data.data.uuid,
          name: data.data.name,
          email: data.data.email || "",
          city: data.data.city || "",
          address: data.data.address || "",
          username: data.data.username || "",
          nickname: data.data.nickname || "",
          phone: data.data.phone || "",
          media_url: data.data.media_url || "",
          dateOfBirth: data.data.dateOfBirth || "",
          placeOfBirth: data.data.placeOfBirth || "",
          gender: data.data.gender || "",
          height: data.data.height || 0,
          turnDate: data.data.turnDate || "",
          playstyleForehand: data.data.playstyleForehand || "",
          playstyleBackhand: data.data.playstyleBackhand || "",
          socialMediaIg: data.data.socialMediaIg || "",
          socialMediaX: data.data.socialMediaX || "",
          level: data.data.level || "",
          level_uuid: data.data.level_uuid || "",
          skills: data.data.skills || {
            forehand: 50,
            backhand: 50,
            serve: 50,
            volley: 50,
            overhead: 50
          }
        });
      }
    },
    enabled: !!userData?.uuid
  });
  const methods = useForm({
      mode: "onChange",
      defaultValues: {
        uuid: userData?.uuid || "",
        name: data?.data?.name || "",
        email: data?.data?.email || "",
        city: data?.data?.city || "",
        address: data?.data?.address || "",
        username: data?.data?.username || "",
        nickname: data?.data?.nickname || "",
        phone: data?.data?.phone || "",
        media_url: data?.data?.media_url || "",
        dateOfBirth: data?.data?.dateOfBirth || "",
        placeOfBirth: data?.data?.placeOfBirth || "",
        isVerified: data?.data?.isVerified || true,
        gender: data?.data?.gender || "",
        height: data?.data?.height || "",
        skills: data?.data?.skills || {
          forehand: 50,
          backhand: 50,
          serve: 50,
          volley: 50,
          overhead: 50
        },
        turnDate: data?.data?.turnDate || "",
        playstyleForehand: data?.data?.playstyleForehand || "",
        playstyleBackhand: data?.data?.playstyleBackhand || "",
        socialMediaIg: data?.data?.socialMediaIg || "",
        socialMediaX: data?.data?.socialMediaX || "",
        level: data?.data?.level || "",
        level_uuid: data?.data?.level_uuid || "",
      },
    resolver: zodResolver(playerHomeSchema),
    });
  const { control, formState, handleSubmit, setValue, watch, getValues } = methods;
  const { mutate: actionUpdatePlayer } = PlayerProfileApiHooks.useUpdatePlayer({
    params: {
      uuid: userData?.uuid as string
    }
  });
  const onSubmit: SubmitHandler<any> = (values: PlayersPayload) => {

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
  return profileChecker({
      uuid: data?.data?.uuid,
      name: data?.data?.name,
      skills: data?.data?.skills,
      height: data?.data?.height
    }) === "UPDATE" ? (
      <div>
        <Modal
          classNames={{body: "rounded-xl bg-gray-50 border"}}
          title={
            <div className="flex flex-row items-center w-full !text-gray-800 border-b pb-3">
              <IconLogo className="w-16 h-10 mr-3" />
              <div className="flex flex-col items-start justify-center">
                <div className=" text-lg">Complete Your Profile</div>
                <p className="text-xs font-normal text-gray-500">Complete your profile to get access to Seventy Five's player dashboard and get the best experience!</p>
              </div>
            </div>
          }
          
          open
          closeIcon={false}
          width={"80%"}
          height={"100%"}
          onCancel={() => {}}
          footer={null}
        >

          <FormProvider {...methods} key={location.pathname + "_form"}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-12">
                  <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-12 sm:col-span-6 p-4 grid grid-cols-12 gap-2">
                      <div className="col-span-12">
                        <h2 className="text-gray-600 font-bold">Personal Information</h2>
                        <Divider className="mb-0 mt-2 " />
                      </div>
                      <div className="col-span-12 sm:col-span-6 w-full">
                        <FormLabel>Photo Profile</FormLabel>
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
                      <div className="col-span-12 sm:col-span-4">
                      </div>
                      <div className="col-span-12 sm:col-span-4">
                        <FormLabel>Gender</FormLabel>
                        <Controller
                          name={`gender`}
                          control={control}
                          defaultValue=""
                          render={({ field, fieldState }) =>
                            <div className="flex-row flex mt-2">
                              <FormCheck className="mr-6" defaultValue={field.value}>
                                <FormCheck.Input
                                  id="gender-switch-1"
                                  type="radio"
                                  name="gender"
                                  value={GenderTypeValue.MALE}
                                  onChange={field.onChange}
                                  checked={field.value === GenderTypeValue.MALE}
                                />
                                <FormCheck.Label htmlFor="gender-switch-1" className="flex-row flex">
                                  Male
                                </FormCheck.Label>
                              </FormCheck>
                              <FormCheck className="">
                                <FormCheck.Input
                                  id="gender-switch-2"
                                  type="radio"
                                  name="gender"
                                  value={GenderTypeValue.FEMALE}
                                  onChange={field.onChange}
                                  checked={field.value === GenderTypeValue.FEMALE}
                                />
                                <FormCheck.Label htmlFor="gender-switch-2" className="flex-row flex">
                                  Female
                                </FormCheck.Label>
                              </FormCheck>
                              {!!fieldState.error && (
                                <FormHelp className={"text-danger"}>
                                  {fieldState.error.message || "Form is not valid"}
                                </FormHelp>
                              )}
                            </div>
                          }
                        />
                      </div>
                      <div className="col-span-12 sm:col-span-6">
                        <FormLabel>Height</FormLabel>
                        <Controller
                          name="height"
                          control={control}
                          render={({ field, fieldState }) =>
                            <>
                              <FormInput
                                name="height"
                                type="number"
                                value={field.value}
                                className={clsx({
                                  "border-danger": !!fieldState.error,
                                })}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                                placeholder="Height"
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
                        <FormLabel>Player Name</FormLabel>
                        <Controller
                          name="name"
                          control={control}
                          render={({ field, fieldState }) =>
                            <>
                              <FormInput
                                name="name"
                                value={field.value}
                                className={clsx({
                                  "border-danger": !!fieldState.error,
                                })}
                                onChange={field.onChange}
                                placeholder="Player Name"
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
                        <FormLabel>Nickname</FormLabel>
                        <Controller
                          name="nickname"
                          control={control}
                          render={({ field, fieldState }) =>
                            <>
                              <FormInput
                                name="nickname"
                                value={field.value}
                                className={clsx({
                                  "border-danger": !!fieldState.error,
                                })}
                                onChange={field.onChange}
                                placeholder="Nickname"
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
                      <div className="col-span-12 sm:col-span-12">
                        <FormLabel>Address</FormLabel>
                        <Controller
                          name="address"
                          key={location.pathname+"_address"}
                          control={control}
                          render={({ field, fieldState }) =>
                            <>
                              <FormTextarea
                                rows={2}
                                value={field.value}
                                name="address"
                                className={clsx({
                                  "border-danger": !!fieldState.error,
                                })}
                                onChange={field.onChange}
                                placeholder="Address"
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
                      <div className="col-span-12 sm:col-span-12">
                        <FormLabel>City</FormLabel>
                        <Controller
                          name="city"
                          key={location.pathname+"_city"}
                          control={control}
                          render={({ field, fieldState }) =>
                            <>
                              <FormInput
                                name="city"
                                value={field.value}
                                className={clsx({
                                  "border-danger": !!fieldState.error,
                                })}
                                onChange={field.onChange}
                                placeholder="City"
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
                      <div className="col-span-12 sm:col-span-6">
                        <FormLabel>Place of Birth</FormLabel>
                        <Controller
                          name="placeOfBirth"
                          control={control}
                          render={({ field, fieldState }) =>
                            <>
                              <FormInput
                                
                                name="placeOfBirth"
                                value={field.value}
                                className={clsx({
                                  "border-danger": !!fieldState.error,
                                })}
                                onChange={field.onChange}
                                placeholder="Place of Birth"
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
                      <div className="col-span-12 sm:col-span-6">
                        <FormLabel>Date of Birth</FormLabel>
                        <Controller
                          name="dateOfBirth"
                          control={control}
                          render={({ field, fieldState }) =>
                            <>
                              <Litepicker
                                value={moment(field.value).format('DD MMM, YYYY')}
                                onChange={(e) => {
                                  field.onChange(moment(e.target.value).format('Y-MM-DD'));
                                }}
                                options={{
                                  autoApply: false,
                                  maxDate: moment().subtract(5, 'years').toDate(),
                                  showWeekNumbers: false,
                                  dropdowns: {
                                    minYear: 1940,
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
                      <div className="col-span-12 sm:col-span-12">
                        <FormLabel>Username</FormLabel>
                        <Controller
                          name="username"
                          control={control}
                          render={({ field, fieldState }) =>
                            <>
                              <FormInput
                                
                                name="username"
                                value={field.value}
                                className={clsx({
                                  "border-danger": !!fieldState.error,
                                })}
                                onChange={field.onChange}
                                placeholder="Username"
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
                      <div className="col-span-12 sm:col-span-6">
                        <FormLabel>Instagram</FormLabel>
                        <Controller
                          name="socialMediaIg"
                          control={control}
                          render={({ field, fieldState }) =>
                            <>
                              <InputGroup>
                                <InputGroup.Text>@</InputGroup.Text>
                                <FormInput
                                  
                                  name="socialMediaIg"
                                  value={field.value}
                                  className={clsx({
                                    "border-danger": !!fieldState.error,
                                  })}
                                  onChange={field.onChange}
                                  placeholder="Instagram"
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
                      <div className="col-span-12 sm:col-span-6">
                        <FormLabel>Twitter / X</FormLabel>
                        <Controller
                          name="socialMediaX"
                          control={control}
                          render={({ field, fieldState }) =>
                            <>
                              <InputGroup>
                                <InputGroup.Text>@</InputGroup.Text>
                                <FormInput
                                  
                                  name="socialMediaX"
                                  value={field.value}
                                  className={clsx({
                                    "border-danger": !!fieldState.error,
                                  })}
                                  onChange={field.onChange}
                                  placeholder="Twitter / X"
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
                    </div>
                    <div className="col-span-12 sm:col-span-6 p-4">
                      <div className="grid grid-cols-12 gap-4" key={location.pathname + `fields`}>
                        <div className="col-span-12">
                          <h2 className="text-gray-600 font-bold">Skills</h2>
                          <Divider className="mb-0 mt-2" />
                        </div>
                        <div className="col-span-12">
                          <FormLabel>Forehand</FormLabel>
                          <Controller
                            name={`skills.forehand`}
                            control={control}
                            defaultValue={50}
                            render={({ field, fieldState }) =>
                              <div className="">
                                <div className="flex flex-row">
                                  <Slider
                                    className="w-full mr-6"
                                    marks={{0: "0", 100: "100"}}
                                    value={field.value}
                                    defaultValue={50}
                                    onChangeComplete={(value) => {
                                    }}
                                    tooltip={{ trigger: "click"}}
                                    onChange={field.onChange}
                                  />
                                  <FormInput
                                    
                                    name={`skills.forehand`}
                                    size={10}
                                    value={field.value}
                                    type="number"
                                    className={clsx({
                                      "border-danger": !!fieldState.error,
                                      "w-12": true,
                                      "pl-0": true,
                                      "pr-0": true,
                                      "text-center": true
                                    })}
                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                    placeholder="Forehand"
                                  />
                                </div>
                                {!!fieldState.error && (
                                  <FormHelp className={"text-danger"}>
                                    {fieldState.error.message || "Form is not valid"}
                                  </FormHelp>
                                )}
                              </div>
                            }
                          />
                        </div>
                        <div className="col-span-12">
                          <FormLabel>Backhand</FormLabel>
                          <Controller
                            name={`skills.backhand`}
                            control={control}
                            defaultValue={50}
                            render={({ field, fieldState }) =>
                              <div className="">
                                <div className="flex flex-row">
                                  <Slider
                                    className="w-full mr-6"
                                    marks={{ 0: "0", 100: "100" }}
                                    value={field.value}
                                    defaultValue={50}
                                    onChangeComplete={(value) => {
                                    }}
                                    tooltip={{  trigger: "click" }}
                                    onChange={field.onChange}
                                  />
                                  <FormInput
                                    
                                    name={`skills.backhand`}
                                    size={10}
                                    value={field.value}
                                    type="number"
                                    className={clsx({
                                      "border-danger": !!fieldState.error,
                                      "w-12": true,
                                      "pl-0": true,
                                      "pr-0": true,
                                      "text-center": true
                                    })}
                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                    placeholder="Forehand"
                                  />
                                </div>
                                {!!fieldState.error && (
                                  <FormHelp className={"text-danger"}>
                                    {fieldState.error.message || "Form is not valid"}
                                  </FormHelp>
                                )}
                              </div>
                            }
                          />
                        </div>
                        <div className="col-span-12">
                          <FormLabel>Volley</FormLabel>
                          <Controller
                            name={`skills.volley`}
                            control={control}
                            defaultValue={50}
                            render={({ field, fieldState }) =>
                              <div className="">
                                <div className="flex flex-row">
                                  <Slider
                                    className="w-full mr-6"
                                    marks={{ 0: "0", 100: "100" }}
                                    value={field.value}
                                    defaultValue={50}
                                    onChangeComplete={(value) => {
                                    }}
                                    tooltip={{  trigger: "click" }}
                                    onChange={field.onChange}
                                  />
                                  <FormInput
                                    
                                    name={`skills.volley`}
                                    size={10}
                                    value={field.value}
                                    type="number"
                                    className={clsx({
                                      "border-danger": !!fieldState.error,
                                      "w-12": true,
                                      "pl-0": true,
                                      "pr-0": true,
                                      "text-center": true
                                    })}
                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                    placeholder="Forehand"
                                  />
                                </div>
                                {!!fieldState.error && (
                                  <FormHelp className={"text-danger"}>
                                    {fieldState.error.message || "Form is not valid"}
                                  </FormHelp>
                                )}
                              </div>
                            }
                          />
                        </div>
                        <div className="col-span-12">
                          <FormLabel>Serve</FormLabel>
                          <Controller
                            name={`skills.serve`}
                            control={control}
                            defaultValue={50}
                            render={({ field, fieldState }) =>
                              <div className="">
                                <div className="flex flex-row">
                                  <Slider
                                    className="w-full mr-6"
                                    marks={{ 0: "0", 100: "100" }}
                                    value={field.value}
                                    defaultValue={50}
                                    onChangeComplete={(value) => {
                                    }}
                                    tooltip={{  trigger: "click" }}
                                    onChange={field.onChange}
                                  />
                                  <FormInput
                                    
                                    name={`skills.serve`}
                                    size={10}
                                    value={field.value}
                                    type="number"
                                    className={clsx({
                                      "border-danger": !!fieldState.error,
                                      "w-12": true,
                                      "pl-0": true,
                                      "pr-0": true,
                                      "text-center": true
                                    })}
                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                    placeholder="Forehand"
                                  />
                                </div>
                                {!!fieldState.error && (
                                  <FormHelp className={"text-danger"}>
                                    {fieldState.error.message || "Form is not valid"}
                                  </FormHelp>
                                )}
                              </div>
                            }
                          />
                        </div>
                        <div className="col-span-12">
                          <FormLabel>Overhead</FormLabel>
                          <Controller
                            name={`skills.overhead`}
                            key={`skills.overhead`}
                            control={control}
                            defaultValue={50}
                            render={({ field, fieldState }) =>
                              <div className="">
                                <div className="flex flex-row">
                                  <Slider
                                    className="w-full mr-6"
                                    marks={{ 0: "0", 100: "100" }}
                                    value={field.value}
                                    key={`skills.overhead`}
                                    defaultValue={50}
                                    onChangeComplete={(value) => {
                                    }}
                                    tooltip={{ trigger: "click"}}
                                    onChange={field.onChange}
                                  />
                                  <FormInput
                                    
                                    name={`skills.overhead`}
                                    size={10}
                                    value={field.value}
                                    type="number"
                                    className={clsx({
                                      "border-danger": !!fieldState.error,
                                      "w-12": true,
                                      "pl-0": true,
                                      "pr-0": true,
                                      "text-center": true
                                    })}
                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                    placeholder="Forehand"
                                  />
                                </div>
                                {!!fieldState.error && (
                                  <FormHelp className={"text-danger"}>
                                    {fieldState.error.message || "Form is not valid"}
                                  </FormHelp>
                                )}
                              </div>
                            }
                          />
                        </div>
                        <div className="col-span-12">
                          <FormLabel>Forehand Style</FormLabel>
                          <Controller
                            name={`playstyleForehand`}
                            control={control}
                            defaultValue=""
                            render={({ field, fieldState }) =>
                              <div className="flex-col flex sm:flex-row">
                                <FormCheck className="mr-6 sm:mb-0 mb-3" defaultValue={field.value}>
                                  <FormCheck.Input
                                    id="forehand-switch-1"
                                    type="radio"
                                    name="playstyleForehand"
                                    value={ForehandStyleValue.LEFT}
                                    onChange={field.onChange}
                                    checked={field.value === ForehandStyleValue.LEFT}
                                  />
                                  <FormCheck.Label htmlFor="forehand-switch-1" className="flex-row flex">
                                    <Lucide className="w-4 h-4 scale-x-[-1] mr-2" icon="Hand" />
                                    Left Handed
                                  </FormCheck.Label>
                                </FormCheck>
                                <FormCheck className="">
                                  <FormCheck.Input
                                    id="forehand-switch-2"
                                    type="radio"
                                    name="playstyleForehand"
                                    value={ForehandStyleValue.RIGHT}
                                    onChange={field.onChange}
                                    checked={field.value === ForehandStyleValue.RIGHT}
                                  />
                                  <FormCheck.Label htmlFor="forehand-switch-2" className="flex-row flex">
                                    <Lucide className="w-4 h-4 mr-2" icon="Hand" />
                                    Right Handed
                                  </FormCheck.Label>
                                </FormCheck>
                                {!!fieldState.error && (
                                  <FormHelp className={"text-danger"}>
                                    {fieldState.error.message || "Form is not valid"}
                                  </FormHelp>
                                )}
                              </div>
                            }
                          />
                        </div>
                        <div className="col-span-12">
                          <FormLabel>Backhand Style</FormLabel>
                          <Controller
                            name={`playstyleBackhand`}
                            control={control}
                            defaultValue={BackhandStyleValue.DOUBLEHANDED}
                            render={({ field, fieldState }) =>
                              <div className="flex-col flex sm:flex-row">
                                <FormCheck className="mr-6 sm:mb-0 mb-3">
                                  <FormCheck.Input
                                    id="backhand-switch-1"
                                    type="radio"
                                    name="playstyleBackhand"
                                    value={BackhandStyleValue.ONEHANDED}
                                    onChange={field.onChange}
                                    checked={field.value === BackhandStyleValue.ONEHANDED}
                                  />
                                  <FormCheck.Label htmlFor="backhand-switch-1" className="flex-row flex">
                                    <Lucide className="w-4 h-4 mr-2" icon="Hand" />
                                    One Handed
                                  </FormCheck.Label>
                                </FormCheck>
                                <FormCheck className="">
                                  <FormCheck.Input
                                    id="backhand-switch-2"
                                    type="radio"
                                    name="playstyleBackhand"
                                    value={BackhandStyleValue.DOUBLEHANDED}
                                    onChange={field.onChange}
                                    checked={field.value === BackhandStyleValue.DOUBLEHANDED}
                                  />
                                  <FormCheck.Label htmlFor="backhand-switch-2" className="flex-row flex">
                                    <Lucide className="w-4 h-4 scale-x-[-1] " icon="Hand" />
                                    <Lucide className="w-4 h-4 mr-2" icon="Hand" />
                                    Double Handed
                                  </FormCheck.Label>
                                </FormCheck>
                                {!!fieldState.error && (
                                  <FormHelp className={"text-danger"}>
                                    {fieldState.error.message || "Form is not valid"}
                                  </FormHelp>
                                )}
                              </div>
                            }
                          />
                        </div>
                        <div className="col-span-12 sm:col-span-6">
                          <FormLabel>Level</FormLabel>
                          <Controller
                            name="level_uuid"
                            control={control}
                            render={({ field, fieldState }) =>
                              <>
                                <FormSelect
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
                                  {levelList?.data?.map((item) => (
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
                        <div className="col-span-12">
                          <FormLabel>Turn Date</FormLabel>
                          <Controller
                            name="turnDate"
                            control={control}
                            render={({ field, fieldState }) =>
                              <>
                                <Litepicker
                                  value={moment(field.value).format('DD MMM, YYYY')}
                                  onChange={(e) => {
                                    field.onChange(moment(e.target.value).format('Y-MM-DD'));
                                  }}
                                  options={{
                                    autoApply: false,
                                    maxDate: new Date(),
                                    showWeekNumbers: false,
                                    dropdowns: {
                                      minYear: 1940,
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
                      </div>
                      <Divider className="col-span-12" />
                    </div>
                  </div>
              
                </div>
                <div className="col-span-12 hidden sm:flex">
                  <Divider className="mb-0"/>
                </div>
                <div className="col-span-12 hidden sm:flex justify-end pb-4 pr-4">
                  <Button
                    type="button"
                    variant="outline-secondary"
                    onClick={() => {
                      methods.reset();
                      navigate(-1);
                    }}
                    className="mr-2"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={formState.isSubmitting || !formState.isValid}
                  >
                    <Lucide icon="Save" className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                </div>
              </div>
            </form>
          </FormProvider>
        </Modal>
        <Confirmation
          open={!!modalAlert?.open}
          onClose={() => setModalAlert(undefined)}
          icon={modalAlert?.icon || "Info"}
          title={modalAlert?.title || ""}
          description={modalAlert?.description || ""}
          refId={modalAlert?.refId}
          buttons={modalAlert?.buttons}
        />
      </div>
  ) : null;
}