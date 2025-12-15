import Button from "@/components/Base/Button";
import { FormHelp, FormLabel, FormSelect } from "@/components/Base/Form";
import { Dialog } from "@/components/Base/Headless";
import { useRef } from "react";
import { Controller, FormProvider, SubmitHandler, useForm } from "react-hook-form";
import { useToast } from "@/components/Toast/ToastContext";
import { DatePicker } from "antd";
import dayjs from "dayjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CourtDetail } from "@/pages/Admin/Courts/api/schema";
import { Match } from "@/components/DrawingTeams/interface";
interface Props {
  isModalOpen: boolean;
  selectedMatch?: Partial<Match>;
  court: string;
  courtOptions?: CourtDetail;
  onSave: (match: Partial<Match>) => void;
  onDismiss: () => void;
}
export const ModalMatch = (props: Props) => {
  const { isModalOpen, selectedMatch, onDismiss, onSave, court, courtOptions } = props;
  const submitButtonRef = useRef(null);
  const { showNotification } = useToast();
  
  const methods = useForm({
    mode: "onChange",
    defaultValues: {
      court_field_uuid: selectedMatch?.court_field_uuid || "",
      date: selectedMatch?.date || ""
    },
    resolver: zodResolver(z.object({
      court_field_uuid: z.string({ required_error: "Court shouldn't be empty" }).min(1, "Court shouldn't be empty"),
      date: z.string({ required_error: "Date Shouldn't be empty" }).min(1, "Date shouldn't be empty"),
    }))
  });
  const { control, formState, handleSubmit } = methods;

  const onSubmit: SubmitHandler<any> = (val: { court_field_uuid: string, date: string }) => {
    const match = { ...selectedMatch }
    match.court_field_uuid = val.court_field_uuid
    match.court = courtOptions?.fields.find(f => f.uuid == val.court_field_uuid)?.name;
    match.date = val.date;

    onSave(match);
  }
  return (
    <Dialog
      open={isModalOpen}
      onClose={() => {
        onDismiss();
      }}
      initialFocus={submitButtonRef}
    >
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Dialog.Panel>
            <Dialog.Title>
              <h2 className="mr-auto text-base font-medium">
                New Tag #
              </h2>
            </Dialog.Title>
            <Dialog.Description className="grid grid-cols-24 gap-4 gap-y-3">
              <div className="col-span-12 sm:col-span-12">
                <FormLabel htmlFor="modal-form-2">Court Field</FormLabel>
                <Controller
                  name="court_field_uuid"
                  control={control}
                  render={({ field, fieldState }) =>
                    <>
                      <FormSelect id="modal-form-2" name="type" onChange={field.onChange} value={field.value}>
                        <option key={"-"} value={""}>
                          Choose Court Field
                        </option>
                        {courtOptions?.fields?.map((item) => (
                          <option key={item.uuid} value={item.uuid}>
                            {item.name }
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
              <div className="col-span-12 sm:col-span-12 flex flex-col">
                <FormLabel htmlFor="modal-form-2">Time</FormLabel>
                <Controller
                  name="date"
                  control={control}
                  render={({ field, fieldState }) =>
                    <>
                      <DatePicker
                        className="h-[38px]"
                        format="YYYY-MM-DD HH:mm"
                        showTime={{ defaultValue: dayjs('00:00:00', 'HH:mm:ss') }}
                        defaultValue={dayjs(selectedMatch?.date)}
                        onChange={(dt) => {
                          field.onChange(dt.toISOString())
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
            </Dialog.Description>
            <Dialog.Footer>
              <Button
                type="button"
                variant="outline-secondary"
                onClick={() => {
                  onDismiss();
                }}
                className="w-20 mr-1"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                type="submit"
                className="w-20"
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
  )
}