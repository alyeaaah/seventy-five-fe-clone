import { IconPlayer, IconPoints, IconBracket } from "@/assets/images/icons";
import LoadingIcon from "@/components/Base/LoadingIcon";
import Lucide from "@/components/Base/Lucide";
import { StepProps, Steps } from "antd";
import { useNavigate } from "react-router-dom";
import { paths } from "@/router/paths";

interface TournamentStepsProps {
  step: number;
  tournamentUuid?: string;
  showGroup?: boolean;
  tournamentType?: string | null | undefined;
}

const TournamentSteps = ({ step, tournamentUuid, showGroup = false, tournamentType }: TournamentStepsProps) => {
  const navigate = useNavigate();

  const handleStepClick = (stepNumber: number) => {
    if (!tournamentUuid && stepNumber !== 1) {
      // Can only navigate to Information step if no tournamentUuid
      return;
    }

    switch (stepNumber) {
      case 1:
        // Information - navigate to edit or new
        if (tournamentUuid) {
          navigate(paths.administrator.tournaments.edit({ tournament: tournamentUuid }).$);
        } else {
          navigate(paths.administrator.tournaments.new.index);
        }
        break;
      case 2:
        // Add Players - requires tournamentUuid
        if (tournamentUuid) {
          navigate(paths.administrator.tournaments.new.players({ id: tournamentUuid }).$);
        }
        break;
      case 3:
        // Points - requires tournamentUuid
        if (tournamentUuid) {
          navigate(paths.administrator.tournaments.new.points({ id: tournamentUuid }).$);
        }
        break;
      case 4:
        // Group or Bracket - depends on showGroup
        if (tournamentUuid) {
          if (showGroup) {
            navigate(paths.administrator.tournaments.new.group({ id: tournamentUuid }).$);
          } else {
            navigate(paths.administrator.tournaments.new.brackets({ id: tournamentUuid }).$);
          }
        }
        break;
      case 5:
        // Bracket (if showGroup) or Done (if not showGroup)
        if (tournamentUuid) {
          if (showGroup) {
            navigate(paths.administrator.tournaments.new.brackets({ id: tournamentUuid }).$);
          } else {
            navigate(paths.administrator.tournaments.new.done({ id: tournamentUuid }).$);
          }
        }
        break;
      case 6:
        // Done - only when showGroup is true
        if (tournamentUuid) {
          navigate(paths.administrator.tournaments.new.done({ id: tournamentUuid }).$);
        }
        break;
      default:
        break;
    }
  };

  const baseItems: StepProps[] = [
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
  ];

  const groupItem: StepProps = {
    title: 'Group',
    status: 'wait',
    icon: <Lucide icon="Users" className="w-full h-full" />,
  };

  const bracketItem: StepProps = {
    title: 'Bracket',
    status: 'wait',
    icon: <IconBracket size="small" />,
  };

  const doneItem: StepProps = {
    title: 'Done',
    status: 'wait',
    icon: <Lucide icon="BadgeCheck" />,
  };

  const items: StepProps[] = showGroup
    ? [...baseItems, groupItem, bracketItem, doneItem]
    : [...baseItems, bracketItem, doneItem];

  return (
    <div className="grid grid-cols-12 box gap-4 p-4 mb-4">
      <Steps
        className="col-span-12 "
        responsive={true}
        size="small"
        items={items.map((item, index) => {
          const itemsStep = index + 1;
          const stepItem = { ...item };

          if (itemsStep < step) {
            stepItem.status = "finish";
          } else if (itemsStep === step) {
            stepItem.status = "process";
            stepItem.icon = <LoadingIcon icon="puff" />;
          } else if (itemsStep > step) {
            stepItem.status = "wait";
          } else {
            stepItem.status = "error";
          }

          // Make finished steps (green) clickable
          if (stepItem.status === "finish") {
            stepItem.onClick = () => handleStepClick(itemsStep);
            stepItem.className = "cursor-pointer hover:opacity-80 transition-opacity";
          }

          return stepItem;
        })}
      />
    </div>
  );
};

export default TournamentSteps;