import LayoutWrapper from "@/components/LayoutWrapper";
import { Typography, Empty } from "antd";

const { Title } = Typography;

export const PublicWallOfFame = () => {
  return (
    <>
      <LayoutWrapper className="grid grid-cols-12 gap-4 sm:gap-8 mt-4 sm:mt-8 min-h-[calc(100vh-300px)]">
        <div className="col-span-12">
          <Title level={1} className="text-emerald-800 mb-4 text-center">
            Wall of <span className="font-bold">Fame</span>
          </Title>
          <div className="text-center py-12">
            <Empty
              description="Wall of Fame content coming soon"
              className="py-12"
            />
          </div>
        </div>
      </LayoutWrapper>
    </>
  );
};