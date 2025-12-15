declare module "react-image-annotation" {
  import * as React from "react";

  export interface Geometry {
    type: "POINT" | "RECTANGLE";
    x: number;
    y: number;
    width?: number;
    height?: number;
  }

  export interface AnnotationData {
    id?: string | number;
    text?: string;
    [key: string]: any;
  }

  export interface Annotation<T extends AnnotationData = AnnotationData> {
    geometry: Geometry;
    data: T;
  }

  export interface AnnotationProps<T extends AnnotationData = AnnotationData> {
    src: string;
    annotations: Annotation<T>[];
    value: Partial<Annotation<T>>;
    onChange: (annotation: Partial<Annotation<T>>) => void;
    onSubmit: (annotation: Annotation<T>) => void;
    type?: "POINT" | "RECTANGLE";
    disableAnnotation?: boolean;
    allowTouch?: boolean;
    onClick?: (annotation: Annotation<T>) => void;
  }

  const AnnotationImage: React.FC<AnnotationProps>;

  export default AnnotationImage;
}
