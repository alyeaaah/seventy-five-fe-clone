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
import Button from "@/components/Base/Button";
import { Divider } from "antd";
import { PublicPlayerApiHooks } from "@/pages/Public/Player/api";

import { RcFile, UploadChangeParam } from "antd/es/upload";
import { compressImage } from "@/utils/image-compression";
import { adminApiHooks } from "@/pages/Login/api";
import { useState } from "react";
import { Image } from "antd";
import UploadDropzone from "@/components/UploadDropzone";

// Custom CSS animation for 538x looping effect
const customStyles = `
  @keyframes loop-538x {
    0% { transform: translateX(0); }
    25% { transform: translateX(5px); }
    50% { transform: translateX(0); }
    75% { transform: translateX(-5px); }
    100% { transform: translateX(0); }
  }
  
  .animate-loop-538x {
    display: inline-block;
    animation: loop-538x 0.5s ease-in-out infinite;
  }
`;

interface ModalAvatarProps {
  onClose: () => void;
  data?: PlayersPartialSchema;
}

export const ModalAvatar = ({ onClose, data }: ModalAvatarProps) => {
  const userData = useAtomValue(userAtom);
  const { showNotification } = useToast();
  const [uploadedAvatar, setUploadedAvatar] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);

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
      avatar_url: data?.avatar_url || "",
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

  const { mutate: actionUploadImage } = adminApiHooks.useMediaUpload();

  const uploadHandler = async (info: UploadChangeParam) => {
    setIsUploading(true);
    try {
      // Compress image before upload
      const compressedFile = await compressImage(info.file as RcFile);

      await actionUploadImage({ image: compressedFile as RcFile }, {
        onSuccess: (response) => {
          setUploadedAvatar(response.imageUrl);
          setValue("avatar_url", response.imageUrl);
          setIsUploading(false);
          showNotification({
            duration: 3000,
            text: "Avatar uploaded successfully",
            icon: "CheckSquare2",
            variant: "success",
          });
        },
        onError: (error) => {
          setIsUploading(false);
          showNotification({
            duration: 3000,
            text: error?.message || "Failed to upload avatar",
            icon: "WashingMachine",
            variant: "danger",
          });
        },
      });
    } catch (error) {
      setIsUploading(false);
      showNotification({
        duration: 3000,
        text: "Failed to compress image",
        icon: "WashingMachine",
        variant: "danger",
      });
    }
  };

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

  return (
    <>
      <style>{customStyles}</style>
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="w-full grid grid-cols-12 gap-4">
            <Divider className="col-span-12 my-0" />

            {/* Left Side - Photo Example */}
            <div className="col-span-12 md:col-span-4">
              <FormLabel>Photo Guidelines</FormLabel>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="w-full overflow-hidden aspect-[3/4] rounded bg-gray-200 border-2 border-emerald-800 mb-3 relative">
                    <div className="grid absolute top-0 left-0 font-bold grid-cols-12 gap-2">
                      {Array.from({ length: 33 }).map((_, index) => (
                        <span key={index} className="animate-bounce rotate-3 col-span-4 text-[8px] opacity-65">IMAGE WITH TRANSPARENT BACKGROUND</span>
                      ))}
                    </div>
                    <Image
                      src="https://res.cloudinary.com/doqyrkqgw/image/upload/v1778314036/ixfdtevc2z98z10n91o2.png"
                      alt="Example Photo"
                      className="w-full h-full  aspect-[3/4] object-cover rounded-full"
                    />
                  </div>
                </div>

                <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                  <h4 className="font-semibold text-emerald-800 mb-2">Photo Requirements:</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li className="flex items-start">
                      <span className="text-emerald-600 mr-2">✓</span>
                      Clear, recent photo
                    </li>
                    <li className="flex items-start">
                      <span className="text-emerald-600 mr-2">✓</span>
                      Face clearly visible
                    </li>
                    <li className="flex items-start">
                      <span className="text-emerald-600 mr-2">✓</span>
                      Plain background
                    </li>
                    <li className="flex items-start">
                      <span className="text-emerald-600 mr-2">✓</span>
                      PNG or GIF format
                    </li>
                    <li className="flex items-start">
                      <span className="text-emerald-600 mr-2">✓</span>
                      Max file size: 2MB
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Middle - Form */}
            <div className="col-span-12 md:col-span-4">
              <FormLabel>Upload Avatar</FormLabel>
              <div className="space-y-4">
                <UploadDropzone
                  loading={isUploading}
                  fileList={uploadedAvatar ? [uploadedAvatar] : []}
                  index={0}
                  onChange={uploadHandler}
                  uploadType="image"
                  uploadIcon={
                    <div className="text-center py-8">
                      <div className="text-4xl mb-2">📷</div>
                      <div className="text-sm text-gray-600">Click or drag image here</div>
                      <div className="text-xs text-gray-400 mt-1">JPG, PNG (Max 5MB)</div>
                    </div>
                  }
                  className="border-2 border-dashed border-emerald-300 rounded-lg"
                />

                <Controller
                  name="avatar_url"
                  control={control}
                  render={({ field }) => (
                    <input
                      type="hidden"
                      {...field}
                      value={uploadedAvatar || field.value || ""}
                    />
                  )}
                />
              </div>
            </div>

            {/* Right Side - Preview */}
            <div className="col-span-12 md:col-span-4">
              <FormLabel>Preview</FormLabel>
              <div className="space-y-4">
                <div className="text-center">
                  {(uploadedAvatar || data?.avatar_url) ? (
                    <Image
                      src={uploadedAvatar || data?.avatar_url || undefined}
                      alt="Avatar Preview"
                      className="w-32 h-32 mx-auto rounded-full object-cover border-4 border-emerald-800 shadow-lg"
                    />
                  ) : (
                    <div className="w-32 h-32 mx-auto rounded-full bg-gray-200 border-4 border-emerald-800 flex items-center justify-center shadow-lg">
                      <span className="text-gray-500 text-4xl">
                        {data?.name?.charAt(0)?.toUpperCase() || userData?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                  )}

                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600">
                      <strong>Current Status:</strong><br />
                      {uploadedAvatar ? (
                        <span className="text-green-600">✓ New avatar uploaded</span>
                      ) : data?.avatar_url ? (
                        <span className="text-blue-600">✓ Existing avatar</span>
                      ) : (
                        <span className="text-orange-600">⚠ No avatar set</span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-2">Tips:</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">💡</span>
                      Use a high-quality photo
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">💡</span>
                      Ensure good lighting
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">💡</span>
                      Center your face in the frame
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <Divider className="col-span-12 my-0" />
            <div className="col-span-12 flex gap-2 justify-end">
              <Button
                type="button"
                onClick={() => {
                  methods.reset();
                  setUploadedAvatar("");
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
                {formState.isSubmitting ? "Updating..." : "Update Avatar"}
              </Button>
            </div>
          </div>
        </form>
      </FormProvider>
    </>
  );
};