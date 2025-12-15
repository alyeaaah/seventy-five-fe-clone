import Button, { Variant } from "@/components/Base/Button";
import { FormTextarea } from "@/components/Base/Form";
import { Dialog } from "@/components/Base/Headless";
import Lucide, { icons } from "@/components/Base/Lucide";
import { useState } from "react";

export interface AlertProps {
  open: boolean;
  onClose: () => void;
  icon: keyof typeof icons;
  iconClassname?: string;
  title: string;
  description: string;
  refId?: string;
  buttons?:
  {
    label: string;
    onClick: (param?: any) => void;
    variant: Variant;
    type?: "button" | "submit";
    autoFocus?: boolean;
    main?: boolean;
  }[];
  size?: "sm" | "md" | "lg";
  dismissable?: boolean;
  notes?: {
    placeholder: string;
    label: string;
    value: string
    required?: boolean
  } ;
  [key: string]: any;
}

const Confirmation = ({ open, onClose, title, description, buttons, size = "sm", dismissable = true, notes, icon, iconClassname, refId }: AlertProps) => {
  const [noteText, setNoteText] = useState(notes?.value || "");
  return (
    <Dialog
      className="z-[1000]"
      open={open}
      onClose={() => {
        setNoteText("");
        onClose();
      }}
      staticBackdrop={!dismissable}
      size={size}
      // initialFocus={deleteButtonRef}
    >
    <Dialog.Panel key={`${title}-${refId}-${open}`}>
      <div className="p-5 text-center">
        <Lucide icon={icon || "XCircle"} className={`w-16 h-16 mx-auto mt-3 ${iconClassname}`} />
        <div className="mt-5 text-3xl">{title}</div>
        <div className="mt-2 text-slate-500">
          {description}
        </div>
      </div>
      {notes && (
        <div className="px-4 pb-4 flex justify-around ">
          <FormTextarea
            key={`${notes.label}-${refId}-${open}`}
            rows={2}
            placeholder={notes.placeholder}
            value={noteText}
            onChange={(e) => {
              setNoteText(e.target.value);
            }}
          />
        </div>
      )}
      <div className="px-5 pb-8 flex flex-col justify-center space-y-2">
        {buttons?.map((button, index) => (
          <Button
            key={index}
            autoFocus={button.autoFocus}
            type={button.type || "button"}
            disabled={notes?.required && !noteText && button.main === true}
            variant={button.variant}
            onClick={() => button.onClick(noteText)}
            className="w-full"
          >
            {button.label}
          </Button>
        ))}
      </div>
    </Dialog.Panel>
  </Dialog>
  )
}

export default Confirmation;