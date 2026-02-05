"use client";

import { MainArea } from "@/components/new/MainArea";
import { MainHeader } from "@/components/new/MainHeader";

export const MainLayout = () => {
  return (
    <div className="min-h-screen w-full bg-[url(/landing-bg.png)] pt-2">
      <div className="w-full max-w-7xl mx-auto px-2">
        <MainHeader />
        <MainArea />
      </div>
    </div>
  );
};
