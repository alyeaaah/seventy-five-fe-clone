import { Skeleton, SkeletonProps } from 'antd';
import React from 'react';

interface CustomSkeletonProps extends SkeletonProps {
  height?: string | number;
  width?: string | number;
  rounded?: string | number;
}

export const CustomSkeleton = ({
  height = "100%",
  width = "100%",
  rounded = "12px",
  ...props
}: CustomSkeletonProps) => {
  return (
    <Skeleton
      active
      avatar={false}
      title={false}
      paragraph={{
        rows: 1,
        width: width,
        style: {
          height,
          width,
          borderRadius: rounded,
        },
      }}
      {...props}
    />
  );
};