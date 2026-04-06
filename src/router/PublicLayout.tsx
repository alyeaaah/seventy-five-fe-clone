import { clientEnv } from "@/env";
import { FooterComponent } from "@/pages/Public/LandingPage/components/FooterComponent";
import { PublicHeader } from "@/pages/Public/LandingPage/components/HeaderLandingPage";
import { Layout } from "antd";
import { Helmet as HelmetBase } from "react-helmet";
import React, { Suspense } from "react";
import { Outlet } from "react-router-dom";
import { LoadingAnimation } from "@/components/LoadingAnimation";

export const PublicLayout = () => {
  const Helmet = HelmetBase as unknown as React.ComponentType<any>;
  const isDevelopment = clientEnv.API_BASE_URL.includes('localhost') || clientEnv.API_BASE_URL.includes('127.0.0.1');
  const DevComponent = () => {
    return (
      <div className="fixed top-0 right-0 z-50 flex gap-2 overflow-hidden items-center justify-center text-white  shadow-lg cursor-pointer w-full h-4 bg-red-800 hover:bg-red-600 animate-bounce">
        {Array.from({ length: 33 }, (d, i) => (
          <div key={i} className="text-lg font-bold border-r-2 p-2 -skew-x-12 text-neutral-800">DEVELOP</div>
        ))}
      </div>
    );
  };
  return (
    <>
      <Layout className="min-h-screen bg-white text-white public-page">
        {isDevelopment && <DevComponent />}
        {/* Top Navbar */}
        <Helmet >
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link href="https://fonts.googleapis.com/css2?family=Permanent+Marker&family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet" />
        </Helmet>
        {location.pathname != "" && location.pathname != "/" && location.pathname != clientEnv.BASENAME && <PublicHeader className="border-b-8 border-emerald-800 rounded-b-2xl shadow-2xl fixed w-full z-20" />}
        {location.pathname != "" && location.pathname != "/" && location.pathname != clientEnv.BASENAME && <div className="h-24" />}
        <Suspense fallback={
          <div className="flex items-center justify-center h-96">
            <LoadingAnimation autoplay loop label="Loading page..." className="py-4" />
          </div>
        }>
          <div className="min-h-[calc(100vh-360px)]">
            <Outlet />
          </div>
          <FooterComponent className='bg-[#37144E] py-16 text-white' />
        </Suspense>
      </Layout>
    </>
  );
};
