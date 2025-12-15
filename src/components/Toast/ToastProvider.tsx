import { useRef, useState } from "react";
import { ToastContentInterface, ToastContext } from "./ToastContext";
import Notification, { NotificationElement } from "../Base/Notification";
import Lucide from "@/components/Base/Lucide";

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [content, setContent] = useState<ToastContentInterface>({
    duration: 3000,
    text: "",
    variant:"info"
  });

  const basicNonStickyNotification = useRef<NotificationElement>();

  const showNotification = (content: ToastContentInterface) => {
    setContent(content);
    basicNonStickyNotification.current?.showToast();
  };

  return (
    <ToastContext.Provider value={{ showNotification }}>
      {children}
      <Notification
        getRef={(el) => {
          basicNonStickyNotification.current = el;
        }}
        options={{
          duration: content.duration,
        }}
        className="flex flex-row "
      >
        {content.icon &&
          <Lucide icon={content.icon} className={`text-${content.variant} mr-2`} />
        }
        <div className="font-medium">
          {content.text}
        </div>
        {content?.action && <a
          className="mt-1 font-medium text-primary dark:text-slate-400 sm:mt-0 sm:ml-40"
          href="#"
          onClick={content.action.onClick}
        >
          {content.action.text}
        </a>}
      </Notification>
    </ToastContext.Provider>
  );
};