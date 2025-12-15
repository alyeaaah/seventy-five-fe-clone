import Button from "@/components/Base/Button";
import { useState } from "react";
import { GalleriesApiHooks } from "../api";
import { useToast } from "@/components/Toast/ToastContext";
import {
  Divider
} from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import { useRouteParams } from "typesafe-routes/react-router";
import { paths } from "@/router/paths";
import Lucide from "@/components/Base/Lucide";
import Confirmation, { AlertProps } from "@/components/Modal/Confirmation";
import Image from "@/components/Image";
import { queryClient } from "@/utils/react-query";
import ImagePreview from "@/components/ImagePreview/ImagePreview";
import { imageResizer } from "@/utils/helper";
import Tippy from "@/components/Base/Tippy";
import moment from "moment";
import { ImageTag } from "@/components/Image/TaggableImage";
interface Props {
  gallery?: string;
}

export const GalleriesDetail = (props: Props) => {
  const navigate = useNavigate();
  const queryParams = useRouteParams(paths.administrator.galleries.edit);
  const { id: galleryUuid } = queryParams;
  const { showNotification } = useToast();
  const [modalAlert, setModalAlert] = useState<AlertProps | undefined>(undefined);
  const [currentPreview, setCurrentPreview] = useState<string | undefined>(undefined);
  const location = useLocation();
  const { data } = GalleriesApiHooks.useGetGalleriesDetail({
    params: {
      uuid: galleryUuid || 0
    }
  }, {
    enabled: !!galleryUuid
  });

  const { mutate: actionDeleteGallery } = GalleriesApiHooks.useDeleteGalleries(
    {
      params: {
        uuid: modalAlert?.refId || 0
      }
    },
    {
      onSuccess: () => {
        showNotification({
          duration: 3000,
          text: "Gallery deleted successfully",
          icon: "WashingMachine",
          variant: "danger",
        });
        setModalAlert(undefined);
        navigate(-1);
        queryClient.invalidateQueries({
          queryKey: GalleriesApiHooks.getKeyByAlias("getGalleriesDetail"),
        });
        queryClient.invalidateQueries({
          queryKey: GalleriesApiHooks.getKeyByAlias("getGalleries"),
        });

      }
    }
  );
  const { mutate: actionFeaturedImage } = GalleriesApiHooks.useToggleFeaturedGalleries(
    {
      params: {
        uuid: modalAlert?.refId || 0
      }
    },
    {
      onSuccess: () => {
        showNotification({
          duration: 3000,
          text: "Gallery featured successfully",
          icon: "Star",
          variant: "success",
        });
        setModalAlert(undefined);
        queryClient.invalidateQueries({
          queryKey: GalleriesApiHooks.getKeyByAlias("getGalleriesDetail"),
        });
      }
    }
  );
  const { mutate: actionUpdateGalleryPlayers } = GalleriesApiHooks.useUpdateGalleryPlayers(
    {
      params: {
        uuid: currentPreview || 0
      }
    },
    {
      onSuccess: () => {
        showNotification({
          duration: 3000,
          text: "Player in this photos updated successfully",
          icon: "CheckCircle",
          variant: "success",
        });
        setModalAlert(undefined);
        queryClient.invalidateQueries({
          queryKey: GalleriesApiHooks.getKeyByAlias("getGalleriesDetail"),
        });
      }
    }
  );
  const handleDeleteGallery = (refId: string) => {
    setModalAlert({
      open: true,
      onClose: () => setModalAlert(undefined),
      icon: "XCircle",
      title: "Are you sure?",
      description: "Do you really want to delete these records? This process cannot be undone.",
      refId: refId,
      buttons: [
        {
          label: "Cancel",
          onClick: () => setModalAlert(undefined),
          variant: "secondary"
        },
        {
          label: "Delete",
          onClick: () => {
            // Handle delete logic here
            actionDeleteGallery(undefined);
          },
          variant: "danger"
        }
      ]
    });
  };
  const handleFeaturedImage = (refId: string) => {
    setModalAlert({
      open: true,
      onClose: () => setModalAlert(undefined),
      icon: "Star",
      iconClassname: "!text-success",
      title: "Are you sure?",
      description: "Do you really want to featured this image? This process cannot be undone.",
      refId: refId,
      buttons: [
        {
          label: "Cancel",
          onClick: () => setModalAlert(undefined),
          variant: "secondary"
        },
        {
          label: "Set as Featured",
          onClick: () => {
            // Handle featured logic here
            actionFeaturedImage(undefined);
          },
          variant: "primary"
        }
      ]
    });
  };

  return (
    <>
      <div className="flex flex-row items-center mt-8 intro-y justify-between">
        <h2 className="mr-auto text-lg font-medium">{data?.data?.name || ""}'s Album</h2>
      </div>
      <Divider />
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 grid grid-cols-12 gap-4 intro-y box p-4 relative min-h-24">
          <div className="absolute right-2 top-2 z-10 flex flex-row">
            <Button
              variant="outline-danger"
              size="sm"
              className="w-full flex align-middle mr-2"
              onClick={() => handleDeleteGallery(galleryUuid)}
            >
              <Lucide icon="Trash" className="h-full" />
            </Button>
            <Button
              variant="outline-primary"
              size="sm"
              className="w-full flex align-middle"
              onClick={() => navigate(paths.administrator.galleries.edit({ id: galleryUuid }).$)}
            >
              <Lucide icon="Pencil" className="h-full" />
            </Button>
          </div>
          <div className="col-span-12 sm:col-span-12">
            {data?.data?.description}
          </div>
        </div>
        <div className="col-span-12 grid grid-cols-12 gap-4 intro-y">
          {
            data?.data?.galleries?.map((gallery, idx) => (
              <div className="col-span-12 sm:col-span-3 box p-4 relative grid grid-cols-12 gap-4" key={location.pathname + `galleries.${idx}`}>
                <div className="absolute top-6 left-6 z-20">
                  <Button
                    className="w-8 h-8 flex flex-col p-0 rounded-full"
                    type="button"
                    variant={gallery?.uuid == data?.data?.pinned_gallery_uuid ? "primary" : "outline-warning"}
                    disabled={gallery?.uuid == data?.data?.pinned_gallery_uuid}
                    onClick={() => {
                      // togglePin
                    }}
                  >
                    {gallery?.uuid == data?.data?.pinned_gallery_uuid ? <Lucide icon="BookImage" className="w-4 h-4" /> : <Lucide icon="ImageOff" className="w-4 h-4" />}
                  </Button>
                </div>
                <div className="absolute top-6 right-6 z-20">
                  <Tippy
                    content={gallery.featured_at ? `Featured at ${moment(gallery.featured_at).format("YYYY-MM-DD hh:mm")}` : "Set as Featured Image"}
                  >
                    <Button
                      size="sm"
                      className="w-full flex align-middle border-none shadow-none"
                      onClick={() => handleFeaturedImage(gallery.uuid)}
                    >
                      <Lucide icon={`${gallery.featured_at ? "Star" : "StarOff"}`} className={`h-full ${gallery.featured_at ? "text-yellow-500" : "text-gray-500"}`} />
                    </Button>
                  </Tippy>
                </div>
                <div className="col-span-12 h-fit">
                  <div className="col-span-12 sm:col-span-12 w-full relative">
                    <ImagePreview
                      editable
                      tags={data?.data?.galleries?.find(g => g.uuid == currentPreview)?.playerGalleries?.map(player => ({
                        id: player.id,
                        label: player.player_name,
                        value: player.player_uuid,
                        x: player.x_percent,
                        y: player.y_percent,
                        isDeleted: player.isDeleted || false,
                      })) || [] as ImageTag[]}
                      items={data?.data?.galleries?.map(g => g.link) || []}
                      description={data?.data?.galleries?.map(g => g.description || "") || []}
                      titles={data?.data?.galleries?.map(g => g.name || "") || []}
                      preview={{
                        defaultCurrent: idx,
                        onChange(current, prevCurrent) {
                          setCurrentPreview(data?.data?.galleries?.[current]?.uuid || "");
                        },
                        onVisibleChange(visible) {
                          if (visible) {
                            setCurrentPreview(data?.data?.galleries?.[idx]?.uuid || "");
                          } else {
                            setCurrentPreview(undefined);
                          }
                        },
                      }}
                      onTagSubmit={(tags) => {
                        actionUpdateGalleryPlayers({
                          gallery_uuid: currentPreview || "",
                          players: tags.map(tag => ({
                            id: 0,
                            player_uuid: tag.value || "",
                            player_name: tag.label,
                            x_percent: tag.x,
                            y_percent: tag.y,
                            isDeleted: tag.isDeleted
                          }))
                        })
                      }}
                      className="w-full"
                    >
                      <Image src={imageResizer(gallery?.link ||"", 300)} className="w-full aspect-square object-cover"/>
                    </ImagePreview>
                  </div>
                </div>
                <div className="col-span-12 sm:col-span-12">
                  <div className="text-sm font-medium normal-case">
                    {gallery?.name}
                  </div>
                  <div className="text-xs text-gray-500 line-clamp-3">
                    {gallery?.description}
                  </div>
                </div>
              </div>
            ))
          }
          
        </div>
      </div>
      <Confirmation
        open={!!modalAlert?.open}
        onClose={() => setModalAlert(undefined)}
        icon={modalAlert?.icon || "Info"}
        iconClassname={modalAlert?.iconClassname || ""}
        title={modalAlert?.title || ""}
        description={modalAlert?.description || ""}
        refId={modalAlert?.refId}
        buttons={modalAlert?.buttons}
      />
    </>
  )
}