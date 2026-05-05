import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Button from "@/components/Base/Button";
import { FormInput, FormTextarea, FormHelp } from "@/components/Base/Form";
import { FormLabel, FormSelect } from "@/components/Base/Form";
import { useToast } from "@/components/Toast/ToastContext";
import { TournamentEventUpdatePayload, tournamentEventUpdatePayloadSchema, TournamentEvent } from "../api/schema";
import { TournamentsApiHooks } from "../api";
import { paths } from "@/router/paths";
import Lucide from "@/components/Base/Lucide";
import { adminApiHooks } from "@/pages/Login/api";
import { RcFile, UploadChangeParam } from "antd/es/upload";
import UploadDropzone from "@/components/UploadDropzone";
import { queryClient } from "@/utils/react-query";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const EditTournamentEvent = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { showNotification } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

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

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<TournamentEventUpdatePayload>({
    resolver: zodResolver(tournamentEventUpdatePayloadSchema),
  });

  // Fetch tournament event details
  const { data: eventData, isLoading: isLoadingEvent } = TournamentsApiHooks.useGetTournamentEventDetail(
    {
      params: { uuid: id! }
    },
    {
      enabled: !!id,
      onSuccess: (response) => {
        if (response?.data) {
          const data = response.data;
          setValue("name", data.name || "");
          setValue("description", data.description || "");
          setValue("rules", data.rules || "");
          setValue("commitment_fee", data.commitment_fee || 0);
          setValue("status", data.status || "DRAFT");
          setValue("media_url", data.media_url || "");
          setValue("published_at", data.published_at || undefined);
        }
        setIsLoading(false);
      },
      onError: (error: any) => {
        showNotification({
          duration: 3000,
          text: error?.response?.data?.message || "Failed to fetch tournament event",
          icon: "AlertCircle",
          variant: "danger",
        });
        navigate(paths.administrator.tournaments.index);
      },
    }
  );

  const { mutate: updateTournamentEvent } = TournamentsApiHooks.useUpdateTournamentEvent(
    {
      params: { uuid: id! }
    },
    {
      onSuccess: (response) => {
        showNotification({
          duration: 3000,
          text: "Tournament event updated successfully",
          icon: "CheckCircle",
          variant: "success",
        });
        queryClient.invalidateQueries({
          queryKey: TournamentsApiHooks.getKeyByAlias("getTournamentEventDetail"),
        });
        navigate(paths.administrator.tournaments.index);
      },
      onError: (error: any) => {
        showNotification({
          duration: 3000,
          text: error?.response?.data?.message || "Failed to update tournament event",
          icon: "AlertCircle",
          variant: "danger",
        });
      },
      onSettled: () => {
        setIsSubmitting(false);
      },
    }
  );

  const onSubmit = (data: TournamentEventUpdatePayload) => {
    setIsSubmitting(true);
    updateTournamentEvent({
      ...data,
      commitment_fee: data.commitment_fee !== undefined ? Number(data.commitment_fee) : undefined,
    });
  };

  const handleCancel = () => {
    navigate(paths.administrator.tournaments.index);
  };

  if (isLoading || isLoadingEvent) {
    return (
      <div className="p-5 intro-y box">
        <div className="flex items-center justify-center h-64">
          <Lucide icon="Loader2" className="w-8 h-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (!eventData) {
    return (
      <div className="p-5 intro-y box">
        <div className="text-center">
          <p className="text-danger">Tournament event not found</p>
          <Button
            variant="primary"
            className="mt-4"
            onClick={() => navigate(paths.administrator.tournaments.index)}
          >
            Back to Events
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 intro-y box">
      <div className="flex items-center mb-6">
        <h2 className="text-lg font-medium mr-auto">Edit Tournament Event</h2>
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
        <div className="grid grid-cols-2 sm:grid-cols-12 gap-6">
          <div className="col-span-8 gap-2 flex flex-col">

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
          </div>
          <div className="col-span-4 gap-2 flex flex-col">
            {/* Event Image */}
            <div className="">
              <FormLabel htmlFor="event-image">Event Image</FormLabel>
              <Controller
                name="media_url"
                control={control}
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
                        {fieldState.error.message || "Image upload failed"}
                      </FormHelp>
                    )}
                  </>
                )}
              />
            </div>

          </div>
          <div className="col-span-4 gap-2 flex flex-col">
            {/* Event Image */}
            <div className="">
              <FormLabel htmlFor="event-image">Event Image</FormLabel>
              <Controller
                name="media_url"
                control={control}
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
                        {fieldState.error.message || "Image upload failed"}
                      </FormHelp>
                    )}
                  </>
                )}
              />
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
                Updating...
              </>
            ) : (
              <>
                <Lucide icon="Save" className="w-4 h-4 mr-2" />
                Update Event
              </>
            )}
          </Button>
        </div>
      </form >
    </div >
  );
};

export default EditTournamentEvent;
