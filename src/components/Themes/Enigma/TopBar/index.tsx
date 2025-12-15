import { useState, Fragment } from "react";
import { Link, useNavigate } from "react-router-dom";
import Lucide from "@/components/Base/Lucide";
import logoUrl from "@/assets/images/logo.svg";
import Breadcrumb from "@/components/Base/Breadcrumb";
import { FormInput } from "@/components/Base/Form";
import { Menu, Popover } from "@/components/Base/Headless";
import fakerData from "@/utils/faker";
import _ from "lodash";
import clsx from "clsx";
import { Transition } from "@headlessui/react";
import { IconLogo } from "@/assets/images/icons";
import { useAtomValue, useSetAtom } from "jotai";
import { accessTokenAtom, userAtom } from "@/utils/store";
import { paths } from "@/router/paths";

function Main(props: { layout?: "side-menu" | "simple-menu" | "top-menu" }) {
  const [searchDropdown, setSearchDropdown] = useState(false);
  const showSearchDropdown = () => {
    setSearchDropdown(true);
  };
  const hideSearchDropdown = () => {
    setSearchDropdown(false);
  };
  const navigate = useNavigate();
  const userData = useAtomValue(userAtom);
  const setUser = useSetAtom(userAtom);
  const setToken = useSetAtom(accessTokenAtom);
  return (
    <>
      <div
        className={clsx([
          "h-[70px] md:h-[65px] z-[51] border-b border-white/[0.08] mt-12 md:mt-0 -mx-3 sm:-mx-8 md:-mx-0 px-3 md:border-b-0 relative md:fixed md:inset-x-0 md:top-0 sm:px-8 md:px-10 md:pt-10 md:bg-gradient-to-b md:from-slate-100 md:to-transparent dark:md:from-darkmode-700",
          props.layout == "top-menu" && "dark:md:from-darkmode-800",
          "before:content-[''] before:absolute before:h-[65px] before:inset-0 before:top-0 before:mx-7 before:bg-primary/30 before:mt-3 before:rounded-xl before:hidden before:md:block before:dark:bg-darkmode-600/30",
          "after:content-[''] after:absolute after:inset-0 after:h-[65px] after:mx-3 after:bg-primary after:mt-5 after:rounded-xl after:shadow-md after:hidden after:md:block after:dark:bg-darkmode-600",
        ])}
      >
        <div className="flex items-center h-full justify-between sm:px-8 md:px-16 lg:px-48 xl:px-64">
          {/* BEGIN: Logo */}
          <Link
            to="/"
            className={clsx([
              "-intro-x hidden md:flex items-center",
              props.layout == "side-menu" && "xl:w-[180px]",
              props.layout == "simple-menu" && "xl:w-auto",
              props.layout == "top-menu" && "w-auto",
            ])}
          >
            <IconLogo className="h-full w-16 text-white" />
            <span
              className={clsx([
                "ml-3 text-lg text-white font-bold",
                props.layout == "side-menu" && "hidden xl:block",
                props.layout == "simple-menu" && "hidden",
              ])}
            >
              Seventy Five
            </span>
          </Link>
          {/* END: Logo */}
          {/* BEGIN: Account Menu */}
          <Menu>
            <Menu.Button className="flex flex-row items-center">
              {userData?.name  ? <span className="text-white z-10 mr-2">Hi, {userData?.name}!</span> : null}
              <div className="block w-8 h-8 overflow-hidden rounded-full text-white shadow-lg image-fit zoom-in intro-x">
              {userData?.media_url ? <img
                alt="Midone Tailwind HTML Admin Template"
                src={userData?.media_url}
                /> : <Lucide icon="CircleUser" className="w-full h-full" />}
              </div>
            </Menu.Button>
            <Menu.Items className="w-56 mt-px relative bg-primary/80 before:block before:absolute before:bg-black before:inset-0 before:rounded-md before:z-[-1] text-white">
              <Menu.Header className="font-normal">
                <div className="font-medium capitalize">{userData?.name}</div>
                <div className="text-xs text-white/70 mt-0.5 dark:text-slate-500 capitalize">
                  {userData?.role}
                </div>
              </Menu.Header>
              <Menu.Divider className="bg-white/[0.08]" />
              { userData?.role === "admin" && <Menu.Item className="hover:bg-white/5" >
                <Link to={paths.administrator.dashboard} replace={true} target="_blank" className="flex flex-row items-center">
                  <Lucide icon="RefreshCw" className="w-4 h-4 mr-2" /> Admin Dashboard
                </Link>
              </Menu.Item>}
              {/* <Menu.Item className="hover:bg-white/5">
                <Lucide icon="User" className="w-4 h-4 mr-2" /> Profile
              </Menu.Item> */}
              <Menu.Item className="hover:bg-white/5" onClick={() => {
                setToken(null);
                setUser(null)
                navigate(paths.login, {replace: true});
              }}>
                <Lucide icon="ToggleRight" className="w-4 h-4 mr-2" /> Logout
              </Menu.Item>
            </Menu.Items>
          </Menu>
          {/* END: Account Menu */}
        </div>
      </div>
    </>
  );
}

export default Main;
