import { forwardRef, ReactNode, useState } from "react";
import EmptyImage from "./EmptyImage/EmptyImage";
import TaggableImage, { ImageTag } from "./TaggableImage";

export interface ImageProps
  extends Omit<
    React.DetailedHTMLProps<
      React.ImgHTMLAttributes<HTMLImageElement>,
      HTMLImageElement
    >,
    "onChange" | "onSubmit" | "onClick"
  > {
  fallback?: ReactNode;
  onChangeTags?: (tags: ImageTag[]) => void;
  onSubmitTags?: (tags: ImageTag[]) => void;
  tags?: ImageTag[];
  editable?: boolean;
  onClick?: () => void;
}

const Image_ = forwardRef<HTMLImageElement, ImageProps>((props, ref) => {
  const {
    onChangeTags,
    onSubmitTags,
    tags,
    fallback,
    src,
    className,
    onError,
    editable,
    ...restProps
  } = props;

  const [isError, setIsError] = useState(false);

  if (isError) {
    return <div className={`${className} !overflow-hidden`}>{fallback || <EmptyImage />}</div>;
  }
  if (!tags) {

    return (
      <img
        onError={(e) => {
          if (onError) onError(e);
          setIsError(true);
        }}
        src={src ?? ""}
        className={className}
        {...restProps}
      />
    );
  }

  return (
    <div className={`${className} h-full`}>
      {/* Hidden <img> just to detect loading error */}
      <img
        src={src || ""}
        onError={() => setIsError(true)}
        style={{ display: "none" }}
        alt=""
      />
      <TaggableImage
        src={src || ""}
        tags={tags}
        onTagChange={onChangeTags}
        onTagsSubmit={onSubmitTags}
        editable={editable}
        className={className}
        imgProps={restProps}
      />

    </div>
  );
});

const Image = forwardRef<HTMLImageElement, ImageProps>((props, ref) => {
  return <Image_ key={props.src || ""} {...props} />;
});

export default Image;
