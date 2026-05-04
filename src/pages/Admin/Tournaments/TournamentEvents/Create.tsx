import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Button from "@/components/Base/Button";
import { FormInput, FormTextarea, FormHelp } from "@/components/Base/Form";
import { FormLabel, FormSelect } from "@/components/Base/Form";
import { useToast } from "@/components/Toast/ToastContext";
import { TournamentEventCreatePayload, tournamentEventCreatePayloadSchema } from "../api/schema";
import { TournamentsApiHooks } from "../api";
import { paths } from "@/router/paths";
import Lucide from "@/components/Base/Lucide";
import { adminApiHooks } from "@/pages/Login/api";
import { RcFile, UploadChangeParam } from "antd/es/upload";
import UploadDropzone from "@/components/UploadDropzone";

const CreateTournamentEvent = () => {
  const navigate = useNavigate();
  const { showNotification } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<TournamentEventCreatePayload>({
    resolver: zodResolver(tournamentEventCreatePayloadSchema),
    defaultValues: {
      name: "",
      description: "",
      rules: "",
      commitment_fee: 0,
      status: "DRAFT",
    },
  });

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
        setValue("media_url" as any, res.imageUrl, {
          shouldValidate: true,
        });
      }
    });
    setUploading(false);
  };

  const { mutate: createTournamentEvent } = TournamentsApiHooks.useCreateTournamentEvent(
    {},
    {
      onSuccess: (response) => {
        showNotification({
          duration: 3000,
          text: "Tournament event created successfully",
          icon: "CheckCircle",
          variant: "success",
        });
        navigate(paths.administrator.tournaments.index);
      },
      onError: (error: any) => {
        showNotification({
          duration: 3000,
          text: error?.response?.data?.message || "Failed to create tournament event",
          icon: "AlertCircle",
          variant: "danger",
        });
      },
      onSettled: () => {
        setIsSubmitting(false);
      },
    }
  );

  const onSubmit = (data: TournamentEventCreatePayload) => {
    setIsSubmitting(true);
    createTournamentEvent({
      ...data,
      commitment_fee: Number(data.commitment_fee),
    });
  };

  const handleCancel = () => {
    navigate(paths.administrator.tournaments.index);
  };

  return (
    <div className="p-5 intro-y box">
      <div className="flex items-center mb-6">
        <h2 className="text-lg font-medium mr-auto">Create Tournament Event</h2>
        <Button
          variant="secondary"
          className="mr-2"
          onClick={handleCancel}
        >
          <Lucide icon="ArrowLeft" className="w-4 h-4 mr-2" />
          Back
        </Button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Event Image */}
          <div className="col-span-2 lg:col-span-4">
            <FormLabel htmlFor="event-image">Event Image</FormLabel>
            <Controller
              name="media_url"
              control={control}
              defaultValue=""
              render={({ field, fieldState }) => (
                <>
                  <UploadDropzone
                    uploadType="image"
                    name="media_url"
                    index={0}
                    onChange={uploadHandler}
                    fileList={field.value ? [field.value as any] : []}
                    onRemove={() => {
                      setValue("media_url" as any, "", {
                        shouldValidate: true,
                      });
                    }}
                    loading={uploading}
                  />
                  {!!fieldState.error && (
                    <FormHelp className="text-danger">
                      {fieldState.error.message || "Image is required"}
                    </FormHelp>
                  )}
                </>
              )}
            />
          </div>

          {/* Name */}
          <div className="col-span-2">
            <FormLabel htmlFor="name">Event Name *</FormLabel>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <FormInput
                  {...field}
                  id="name"
                  type="text"
                  placeholder="Enter tournament event name"
                  className={errors.name ? "border-danger" : ""}
                />
              )}
            />
            {errors.name && (
              <p className="text-danger text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="col-span-2">
            <FormLabel htmlFor="description">Description</FormLabel>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <FormTextarea
                  {...field}
                  id="description"
                  rows={4}
                  placeholder="Enter tournament event description"
                  className={errors.description ? "border-danger" : ""}
                />
              )}
            />
            {errors.description && (
              <p className="text-danger text-sm mt-1">{errors.description.message}</p>
            )}
          </div>

          {/* Rules */}
          <div className="col-span-2">
            <FormLabel htmlFor="rules">Rules</FormLabel>
            <Controller
              name="rules"
              control={control}
              render={({ field }) => (
                <FormTextarea
                  {...field}
                  id="rules"
                  rows={6}
                  placeholder="Enter tournament event rules"
                  className={errors.rules ? "border-danger" : ""}
                />
              )}
            />
            {errors.rules && (
              <p className="text-danger text-sm mt-1">{errors.rules.message}</p>
            )}
          </div>

          {/* Commitment Fee */}
          <div>
            <FormLabel htmlFor="commitment_fee">Commitment Fee</FormLabel>
            <Controller
              name="commitment_fee"
              control={control}
              render={({ field }) => (
                <FormInput
                  {...field}
                  id="commitment_fee"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  className={errors.commitment_fee ? "border-danger" : ""}
                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                />
              )}
            />
            {errors.commitment_fee && (
              <p className="text-danger text-sm mt-1">{errors.commitment_fee.message}</p>
            )}
          </div>

          {/* Status */}
          <div>
            <FormLabel htmlFor="status">Status</FormLabel>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <FormSelect
                  {...field}
                  id="status"
                  className={errors.status ? "border-danger" : ""}
                >
                  <option value="DRAFT">Draft</option>
                  <option value="POSTPONED">Postponed</option>
                  <option value="ONGOING">Ongoing</option>
                  <option value="ENDED">Ended</option>
                  <option value="CANCELLED">Cancelled</option>
                </FormSelect>
              )}
            />
            {errors.status && (
              <p className="text-danger text-sm mt-1">{errors.status.message}</p>
            )}
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-2 pt-6 border-t">
          <Button
            variant="secondary"
            type="button"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Lucide icon="Loader2" className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Lucide icon="Save" className="w-4 h-4 mr-2" />
                Create Event
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateTournamentEvent;
