import { useControllableValue } from "ahooks";
import {
  Image as AntdImage,
  Grid,
  type ImageProps as AntdImageProps,
} from "antd";
import { clsx } from "clsx";
import { ComponentProps } from "react";

import styles from "./ImagePreview.module.scss";
import { omit } from "lodash";
import Image from "../Image";
import EmptyImage from "@/components/Image/EmptyImage/EmptyImage";
import { Annotation } from "react-image-annotation";
import TaggableImage, { ImageTag } from "../Image/TaggableImage";
import Button from "../Base/Button";
import { useState } from "react";

const { useBreakpoint } = Grid;

const AntdImagePreviewGroup = AntdImage.PreviewGroup;
type AntdImagePreviewGroupProps = ComponentProps<typeof AntdImagePreviewGroup>;

export interface ImagePreviewProps
  extends Omit<AntdImagePreviewGroupProps, "items" | "preview"> {
  items: string[];
  className?: string;
  description?: string[];
  titles?: string[];
  editable?: boolean;
  tags?: ImageTag[];
  onTagSubmit?: (tags: ImageTag[]) => void;
  preview?: Omit<
    Exclude<AntdImagePreviewGroupProps["preview"], boolean | undefined>,
    "afterOpenChange" | "toolbarRender" | "imageRender" | "countRender"
  > & {
    defaultCurrent?: number;
  };
}

export default function ImagePreview(props: ImagePreviewProps) {
  const { items, tags, editable, onTagSubmit } = props;

  const [visible, setVisible] = useControllableValue(props.preview, {
    valuePropName: "visible",
    trigger: "onVisibleChange",
    defaultValue: false,
  });

  const [currentImageIndex, setCurrentImageIndex] = useControllableValue(
    props.preview,
    {
      valuePropName: "current",
      defaultValuePropName: "defaultCurrent",
      trigger: "onChange",
      defaultValue: 0,
    },
  );

  const screens = useBreakpoint();

  function shouldAlignImagesCenter() {
    // read screen size to determine if thumbnails on preview need justify-content: center
    if (
      Array.isArray(items) &&
      ((screens.lg && items.length <= 15) ||
        (screens.md && items.length <= 11) ||
        (screens.sm && items.length <= 7) ||
        (screens.xs && items.length <= 5))
    ) {
      return true;
    }

    return false;
  }

  return (
    <div className={clsx(props.className, styles.container)}>

      <AntdImage.PreviewGroup
        {...omit(props, ["children", "className"])}
        preview={{
          ...props.preview,
          visible: visible,
          onVisibleChange: setVisible,
          current: currentImageIndex,
          onChange: setCurrentImageIndex,
          toolbarRender: () => null,
          rootClassName: clsx(
            props.preview?.rootClassName,
            styles.previewRoot,
            {
              [styles.single]: items.length === 1,
            },
          ),
          afterOpenChange(open) {
            if (!open) setCurrentImageIndex(props.preview?.defaultCurrent || 0);
          },
          imageRender(originalNode, info) {
            // console.log({originalNode});

            return (
              <div
                className={clsx(styles.imageContainer, {
                  [styles.single]: items.length === 1,
                })}
              >
                <div className="text-white [text-shadow:0px_0px_4px_#135F46] font-bold text-lg mb-4">{props.titles?.[info.current]}</div>
                <div className="w-full min-h-[100%] flex items-center justify-center relative">
                  {tags ?
                    <TaggableImage
                      src={items[info.current]}
                      tags={tags}
                      key={items[info.current]}
                      editable={editable}
                      imgProps={{
                        className: originalNode.props.className
                      }}
                      onTagsSubmit={onTagSubmit}
                    /> :
                    <Image
                      src={items[info.current]}
                      fallback={
                        <EmptyImage />
                      }
                      {...omit(originalNode.props, ["imgRef"])} // 🚀 remove invalid props here
                      className={`${originalNode.props.className} ${tags ? "with-annotation" : ""}`}
                    />
                  }
                </div>
                <div className="text-white [text-shadow:0px_0px_4px_#135F46] capitalize my-4">{props.description?.[info.current]}</div>
                {items.length >= 1 && (
                  <>
                    <div
                      className={clsx(styles.footerContainer, {
                        [styles.centered]: shouldAlignImagesCenter(),
                      })}
                    >
                      <div className="absolute top-0 border-t-4 border-white"></div>
                      {items?.map((image, imageIndex) => {
                        return (
                          <div
                            key={image}
                            className="cursor-pointer hover:scale-110 transition-all duration-300"
                            onClick={() => {
                              setCurrentImageIndex(imageIndex);
                            }}
                          >
                            <Image
                              src={image}
                              fallback={
                                <EmptyImage />
                              }
                              className={clsx(styles.miniThumbnail, {
                                [styles.inactive]:
                                  imageIndex !== currentImageIndex,
                              })}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
                <div
                  className={clsx(styles.counterContainer, {
                    [styles.single]: items.length === 1,
                  })}
                >{`${info.current + 1} / ${items.length}`}</div>
              </div>
            );
          },
          countRender: () => null,
        }}
      >
        <div className="w-full h-full flex !items-stretch !justify-stretch" onClick={() => setVisible(true)}>{props.children}</div>
      </AntdImage.PreviewGroup>
    </div>
  );
}

type ImagePreviewThumbnailProps = AntdImageProps;

ImagePreview.Thumbnail = function ImagePreviewThumbnail(
  props: ImagePreviewThumbnailProps,
) {
  return <AntdImage {...props} width={"100%"} height={"100%"} className="cursor-pointer" />;
};
