import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Button from "@/components/Base/Button";
import { useToast } from "@/components/Toast/ToastContext";
import { TournamentEvent, TournamentEventStatusEnum } from "../api/schema";
import { TournamentsApiHooks } from "../api";
import { paths } from "@/router/paths";
import Lucide from "@/components/Base/Lucide";
import moment from "moment";
import { Menu } from "@/components/Base/Headless";
import Tippy from "@/components/Base/Tippy";
import { queryClient } from "@/utils/react-query";
import Confirmation, { AlertProps } from "@/components/Modal/Confirmation";
import { Badge } from "antd";

const TournamentEventDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { showNotification } = useToast();
  const [modalAlert, setModalAlert] = useState<AlertProps | undefined>(undefined);

  // Fetch tournament event details
  const { data: eventData, isLoading, refetch } = TournamentsApiHooks.useGetTournamentEventDetail(
    {
      params: { uuid: id! }
    },
    {
      enabled: !!id,
    }
  );

  const { mutate: deleteTournamentEvent } = TournamentsApiHooks.useDeleteTournamentEvent(
    {
      params: { uuid: id! }
    },
    {
      onSuccess: () => {
        showNotification({
          duration: 3000,
          text: "Tournament event deleted successfully",
          icon: "CheckCircle",
          variant: "success",
        });
        setModalAlert(undefined);
        queryClient.invalidateQueries({
          queryKey: TournamentsApiHooks.getKeyByAlias("getTournamentEventsList"),
        });
        navigate(paths.administrator.tournaments.index);
      },
      onError: (error: any) => {
        showNotification({
          duration: 3000,
          text: error?.response?.data?.message || "Failed to delete tournament event",
          icon: "AlertCircle",
          variant: "danger",
        });
      },
    }
  );

  const { mutate: updateTournamentEvent } = TournamentsApiHooks.useUpdateTournamentEvent(
    {
      params: { uuid: id! }
    },
    {
      onSuccess: () => {
        showNotification({
          duration: 3000,
          text: "Tournament event updated successfully",
          icon: "CheckCircle",
          variant: "success",
        });
        queryClient.invalidateQueries({
          queryKey: TournamentsApiHooks.getKeyByAlias("getTournamentEventDetail"),
        });
        refetch();
      },
      onError: (error: any) => {
        showNotification({
          duration: 3000,
          text: error?.response?.data?.message || "Failed to update tournament event",
          icon: "AlertCircle",
          variant: "danger",
        });
      },
    }
  );

  const handleDeleteTournament = (uuid: string) => {
    setModalAlert({
      open: true,
      onClose: () => setModalAlert(undefined),
      title: "Delete Tournament Event",
      description: "Are you sure you want to delete this tournament event? This action cannot be undone.",
      icon: "Trash",
      refId: uuid,
      buttons: [
        {
          label: "Cancel",
          onClick: () => setModalAlert(undefined),
          variant: "secondary"
        },
        {
          label: "Delete",
          onClick: () => {
            deleteTournamentEvent(undefined);
          },
          variant: "danger"
        }
      ]
    });
  };

  const handlePublishTournament = (uuid: string, unpublish: boolean = false) => {
    updateTournamentEvent({
      published_at: unpublish ? null : new Date().toISOString(),
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DRAFT":
        return "bg-slate-100 text-slate-800";
      case "POSTPONED":
        return "bg-yellow-100 text-yellow-800";
      case "ONGOING":
        return "bg-blue-100 text-blue-800";
      case "ENDED":
        return "bg-green-100 text-green-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
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
    <>
      <div className="p-5 intro-y box">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Button
              variant="secondary"
              className="mr-4"
              onClick={() => navigate(paths.administrator.tournaments.index)}
            >
              <Lucide icon="ArrowLeft" className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h2 className="text-lg font-medium">Tournament Event Details</h2>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="primary"
              onClick={() => navigate(paths.administrator.tournamentEvents.edit({ id: eventData.data.uuid! }).$)}
            >
              <Lucide icon="Pencil" className="w-4 h-4 mr-2" />
              Edit
            </Button>
            <Menu>
              <Menu.Button as={Button} variant="secondary">
                <Lucide icon="MoreHorizontal" className="w-4 h-4" />
              </Menu.Button>
              <Menu.Items>
                {!eventData.data.published_at && eventData.data.status !== "ONGOING" && (
                  <Menu.Item
                    className="flex flex-row items-center gap-2 w-40 cursor-pointer hover:bg-slate-200"
                    onClick={() => navigate(paths.administrator.tournamentEvents.edit({ id: eventData.data.uuid! }).$)}
                  >
                    <Lucide icon="Pencil" className="w-4 h-4" />
                    Edit
                  </Menu.Item>
                )}
                {!eventData.data.published_at && (
                  <Menu.Item
                    className="flex flex-row items-center gap-2 w-40 cursor-pointer hover:bg-slate-200"
                    onClick={() => handlePublishTournament(eventData.data.uuid!, false)}
                  >
                    <Lucide icon="Rocket" className="w-4 h-4" />
                    Publish
                  </Menu.Item>
                )}
                {!!eventData.data.published_at && (
                  <Menu.Item
                    className="flex flex-row items-center gap-2 w-40 cursor-pointer hover:bg-slate-200"
                    onClick={() => handlePublishTournament(eventData.data.uuid!, true)}
                  >
                    <Lucide icon="Rocket" className="w-4 h-4 rotate-[135deg]" />
                    Unpublish
                  </Menu.Item>
                )}
                {!eventData.data.published_at && eventData.data.status !== "ONGOING" && (
                  <Menu.Item
                    className="flex flex-row items-center gap-2 w-40 text-danger cursor-pointer hover:text-danger hover:bg-slate-200 bg-red-50"
                    onClick={() => handleDeleteTournament(eventData.data.uuid!)}
                  >
                    <Lucide icon="Trash" className="w-4 h-4" />
                    Delete
                  </Menu.Item>
                )}
              </Menu.Items>
            </Menu>
          </div>
        </div>

        {/* Event Information */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <div className="bg-white p-6 rounded-lg border border-slate-200">
              <h3 className="text-base font-medium mb-4 flex items-center">
                <Lucide icon="Info" className="w-4 h-4 mr-2" />
                Basic Information
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-600">Event Name</label>
                  <p className="mt-1 text-sm">{eventData.data?.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Status</label>
                  <div className="mt-1">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(eventData.data?.status || "")}`}>
                      {eventData.data?.status}
                    </span>
                  </div>
                </div>
                {eventData.data?.published_at && (
                  <div>
                    <label className="text-sm font-medium text-slate-600">Published At</label>
                    <p className="mt-1 text-sm">{moment(eventData.data.published_at).format("DD MMM YYYY, HH:mm")}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            {eventData.data?.description && (
              <div className="bg-white p-6 rounded-lg border border-slate-200">
                <h3 className="text-base font-medium mb-4 flex items-center">
                  <Lucide icon="FileText" className="w-4 h-4 mr-2" />
                  Description
                </h3>
                <p className="text-sm whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: decodeURIComponent(eventData.data.description || "") }}></p>
              </div>
            )}

            {/* Rules */}
            {eventData.data?.rules && (
              <div className="bg-white p-6 rounded-lg border border-slate-200">
                <h3 className="text-base font-medium mb-4 flex items-center">
                  <Lucide icon="BookOpen" className="w-4 h-4 mr-2" />
                  Rules
                </h3>
                <div className="text-sm whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: decodeURIComponent(eventData.data.rules || "") }}></div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Event Details */}
            <div className="bg-white p-6 rounded-lg border border-slate-200">
              <h3 className="text-base font-medium mb-4 flex items-center">
                <Lucide icon="Settings" className="w-4 h-4 mr-2" />
                Event Details
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-600">Commitment Fee</label>
                  <p className="mt-1 text-sm">${eventData.data?.commitment_fee || 0}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Created At</label>
                  <p className="mt-1 text-sm">{moment(eventData.data?.created_at).format("DD MMM YYYY, HH:mm")}</p>
                </div>
                {eventData.data?.updated_at && (
                  <div>
                    <label className="text-sm font-medium text-slate-600">Last Updated</label>
                    <p className="mt-1 text-sm">{moment(eventData.data.updated_at).format("DD MMM YYYY, HH:mm")}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white p-6 rounded-lg border border-slate-200">
              <h3 className="text-base font-medium mb-4 flex items-center">
                <Lucide icon="Zap" className="w-4 h-4 mr-2" />
                Quick Actions
              </h3>
              <div className="space-y-2">
                <Button
                  variant="outline-primary"
                  className="w-full justify-start"
                  onClick={() => navigate(paths.administrator.tournamentEvents.edit({ id: eventData.data?.uuid! }).$)}
                >
                  <Lucide icon="Pencil" className="w-4 h-4 mr-2" />
                  Edit Event
                </Button>
                {!eventData.data?.published_at ? (
                  <Button
                    variant="outline-success"
                    className="w-full justify-start"
                    onClick={() => handlePublishTournament(eventData.data?.uuid!, false)}
                  >
                    <Lucide icon="Rocket" className="w-4 h-4 mr-2" />
                    Publish Event
                  </Button>
                ) : (
                  <Button
                    variant="outline-warning"
                    className="w-full justify-start"
                    onClick={() => handlePublishTournament(eventData.data?.uuid!, true)}
                  >
                    <Lucide icon="Rocket" className="w-4 h-4 mr-2 rotate-[135deg]" />
                    Unpublish Event
                  </Button>
                )}
                {!eventData.data?.published_at && eventData.data?.status !== "ONGOING" && (
                  <Button
                    variant="outline-danger"
                    className="w-full justify-start"
                    onClick={() => handleDeleteTournament(eventData.data?.uuid!)}
                  >
                    <Lucide icon="Trash" className="w-4 h-4 mr-2" />
                    Delete Event
                  </Button>
                )}
              </div>
            </div>
            {/* Tournaments */}
            <div className="bg-white p-6 rounded-lg border border-slate-200">
              <h3 className="text-base font-medium mb-4 flex items-center">
                <Lucide icon="Zap" className="w-4 h-4 mr-2" />
                Tournaments
              </h3>
              <div className="space-y-2">
                {eventData?.data?.tournaments?.map((tournament) => (
                  <Button
                    variant="outline-primary"
                    className="w-full justify-between flex"
                    key={tournament.uuid}
                    onClick={() => navigate(paths.administrator.tournaments.detail({ id: tournament?.uuid! }).$)}
                  >
                    <div className="flex flex-row">
                      <Lucide icon="Pencil" className="w-4 h-4 mr-2" />
                      {tournament.name}
                    </div>
                    <div className="flex flex-row">
                      <div color="warning" className="ml-1 py-0.5 px-1 rounded-lg bg-red-600 text-white min-w-8">
                        {tournament.counter?.requested ? `${tournament.counter.requested}` : "0"}
                      </div>
                      <div color="warning" className="ml-1 py-0.5 px-1 rounded-lg bg-emerald-600 text-white min-w-8">
                        {tournament.counter?.approved ? `${tournament.counter.approved}` : "0"}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div >
      </div >

      {/* Confirmation Modal */}
      {
        modalAlert && (
          <Confirmation
            open={modalAlert.open}
            title={modalAlert.title}
            description={modalAlert.description}
            icon={modalAlert.icon}
            variant={modalAlert.variant}
            onConfirm={modalAlert.onConfirm}
            onClose={modalAlert.onClose}
          />
        )
      }
    </>
  );
};

export default TournamentEventDetail;
