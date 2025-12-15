import { clsx } from "clsx";
import styles from "./EmptyImage.module.scss";
import { Empty as AntdEmpty, EmptyProps as AntdEmptyProps } from "antd";
import { ReactNode } from "react";
import Lucide from "@/components/Base/Lucide";

export interface EmptyImageProps
  extends Omit<AntdEmptyProps, "children" | "description" | "image"> {
  caption?: AntdEmptyProps["description"];
  image?: ReactNode;
}

function EmptyImage(props: Readonly<EmptyImageProps>) {
  const { className, caption = false, image, ...restProps } = props;

  return (
    <AntdEmpty
      className={(clsx(className), styles.container)}
      image={<Lucide icon="ImageOff" />}
      description={caption}
      {...restProps}
    />
  );
}

export default EmptyImage;
