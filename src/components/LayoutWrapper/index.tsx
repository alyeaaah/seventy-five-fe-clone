import { Outlet } from "react-router-dom";

export default function LayoutWrapper({ children, className, isPreview }: { children: React.ReactNode, className?: string, isPreview?: boolean }) {
  return isPreview ? (
    <div className={`w-full ${className}`}>
      {children}
    </div>
  ) : (
    <div className={`px-4 sm:px-8 md:px-16 lg:px-16 xl:px-24 2xl:px-48 w-full ${className}`}>
      {children}
    </div>
  );
};