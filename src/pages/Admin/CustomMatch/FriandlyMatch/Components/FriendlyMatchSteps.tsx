import { IconPlayer, IconPoints } from "@/assets/images/icons";
import { IconBracket } from "@/assets/images/icons";
import LoadingIcon from "@/components/Base/LoadingIcon";
import Lucide from "@/components/Base/Lucide";
import { StepProps, Steps } from "antd";

interface FriendlyMatchStepsProps {
  step: number;
}

const FriendlyMatchSteps = ({ step }: FriendlyMatchStepsProps) => {
  const items: StepProps[] = [
    {
      title: 'Information',
      status: 'process',
      icon: <Lucide icon="FilePlus2" className="w-full h-full" />,

    },
    {
      title: 'Add Players',
      status: 'wait',
      icon: <IconPlayer size="small" />,
    },
    {
      title: 'Points',
      status: 'wait',
      icon: <IconPoints size="small" />,
    },
    {
      title: 'Schedule',
      status: 'wait',
      icon: <Lucide icon="Clock12" />,
    },
    {
      title: 'Done',
      status: 'wait',
      icon: <Lucide icon="BadgeCheck"/>,
    },
  ]
  return (
    <div className="grid grid-cols-12 box gap-4 p-4 mb-4">
      <Steps
        className="col-span-12 "
        responsive={true}
        size="small"
        items={items.map((item, index) => {
          const itemsStep = index + 1
          if (itemsStep < step) {
            item.status = "finish";
          } else if (itemsStep === step) {
            item.status = "process";
            item.icon = <LoadingIcon icon="puff" />
          } else if (itemsStep > step) {
            item.status = "wait";
          } else {
            item.status = "error";
          }
          return item;
        })}
      />
    </div>
  );
};

export default FriendlyMatchSteps;