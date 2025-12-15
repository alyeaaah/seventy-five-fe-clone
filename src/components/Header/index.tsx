
import { IconLogo } from '@/assets/images/icons';
import { Layout, Card, Progress, List, Typography } from 'antd';
import LayoutWrapper from '../LayoutWrapper';

const { Header, Content } = Layout;
const { Title, Text } = Typography;

export const PageHeader = () => {
  return (
    <Header className="bg-emerald-800 py-2  top-0 z-20 rounded-b-2xl shadow-xl border-t-4 border-[#EBCE56] h-20">
      <LayoutWrapper key={location.pathname} >
        <div className="bg-emerald-800  border-white rounded-xl flex justify-between items-center w-full h-full px-4">
          <Title level={3} className="!text-white !mb-0 flex flex-row">
            <IconLogo className="mr-2 fill-white text-emerald-50 w-16 h-12" />
          </Title>
          <Text className="text-gray-400">15 March 2025</Text>
        </div>
      </LayoutWrapper>
    </Header>
  );
};