import { IconLogo } from "@/assets/images/icons";
import { HTMLProps } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Layout, Typography, Menu } from 'antd';
import LayoutWrapper from "@/components/LayoutWrapper";
import { MenuSquare } from "lucide-react";
import { paths } from "@/router/paths";
import { PublicTournamentApiHooks } from "../../Tournament/api";
import { useAtomValue } from "jotai";
import { userAtom } from "@/utils/store";

const { Header, Content } = Layout;
const { Title } = Typography;

interface LandingPageProps extends HTMLProps<HTMLDivElement> {
  className?: string;
  innerClassName?: string;
}

export const PublicHeader = ({ className, innerClassName }: LandingPageProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAtomValue(userAtom);

  const { data } = PublicTournamentApiHooks.useGetFeaturedTournament({
    queries: {
      limit: 10
    }
  });
  const menuItems = [
    {
      key: paths.landingPage,
      label: <Link to={paths.landingPage}>Home</Link>,

    },
    {
      key: `/${paths.tournament.index.template.split('/')[1]}`,
      label: <Link to={paths.tournament.index.template}>Tournament</Link>,
    },
    {
      key: `/${paths.challenger.index.template.split('/')[1]}`,
      label: <Link to={paths.challenger.index.template}>Challenger</Link>,
    },
    {
      key: `/${paths.shop.index}`,
      label: <Link to={paths.shop.index}>Merchandise</Link>,
    },
    {
      key: paths.galleries.index,
      label: <Link to={paths.galleries.index}>Gallery</Link>,
    },
    {
      key: paths.wallOfFame.index,
      label: <Link to={paths.wallOfFame.index}>Wall of Fame</Link>,
    },
    {
      key: paths.news.index,
      label: <Link to={paths.news.index}>News</Link>,
    },
    {
      key: `${paths.login({}).$}`,
      label: <Link to={`${paths.login({}).$}`}>Login</Link>,
    },
  ];
  if (user?.role === 'admin') {
    const loginIndex = menuItems.findIndex((item) => item.key === `${paths.login({}).$}`);
    menuItems[loginIndex].label = <Link to={paths.administrator.dashboard}>Hi, {user.name}!</Link>;
    menuItems[loginIndex].key = paths.administrator.dashboard;
  }
  if (user?.role === 'player') {
    const loginIndex = menuItems.findIndex((item) => item.key === `${paths.login({}).$}`);
    menuItems[loginIndex].label = <Link to={paths.player.home}>Hi, {user.name}!</Link>;
    menuItems[loginIndex].key = paths.player.home;
  }
  return (
    <Header className={`bg-[#EBCE56] flex flex-col items-center h-24 ${className}`}>
      <LayoutWrapper className='h-full'>
        <div className={`border-white rounded-xl flex justify-between items-center h-full w-full px-4 ${innerClassName}`}>
          <Link to={paths.landingPage}>
            <Title level={3} className="!text-emerald-800 !mb-0 flex flex-row">
              <IconLogo className="mr-2 w-20 h-16" />
            </Title>
          </Link>
          <div className="w-full ">
            <Menu
              overflowedIndicator={<MenuSquare />}
              className='bg-transparent font-bold text-emerald-800 text-sm flex justify-end items-center custom-menu border-none'
              mode="horizontal"
              defaultSelectedKeys={['/']}
              selectedKeys={[`/${location.pathname.split('/')[1]}`]}
              items={menuItems}
            />
          </div>
        </div>
      </LayoutWrapper>
    </Header>
  );
};