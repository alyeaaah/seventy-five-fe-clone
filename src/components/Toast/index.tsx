
import Lucide from "@/components/Base/Lucide";
import Notification from "@/components/Base/Notification";
import { NotificationElement } from "@/components/Base/Notification";
import { FormSwitch } from "@/components/Base/Form";
import Button from "@/components/Base/Button";
import fakerData from "@/utils/faker";
import { useRef, useState } from "react";
interface ContentInterface {
  duration: number;
  text: string;
  action: {
    onClick: () => void;
    text: string;
  };
}
const ToastNotification = () => {
  const [content, setContent] = useState<ContentInterface>({
    duration: 3000,
    text: "",
    action: {
      onClick: () => {},
      text: "",
    },
  });

  const basicNonStickyNotification = useRef<NotificationElement>();
  const showNotification = (content: ContentInterface) => {
    setContent(content);
    basicNonStickyNotification.current?.showToast();
  };
  return (
    <Notification
      getRef={(el) => {
        basicNonStickyNotification.current = el;
      }}
      options={{
        duration: content.duration,
      }}
      className="flex flex-col sm:flex-row"
    >
      <div className="font-medium">
        {content.text}
      </div>
      <a
        className="mt-1 font-medium text-primary dark:text-slate-400 sm:mt-0 sm:ml-40"
        href="#"
        onClick={content.action.onClick}
      >
        {content.action.text}
      </a>
    </Notification>
  );
};
export default ToastNotification;