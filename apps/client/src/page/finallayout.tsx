"use client";

import { useRestContext } from "@/context/rest";
import Landing from "./Landing";
import { MainLayout } from "./main-layout";
import { useSearchParams } from "next/navigation";

export const FinalLayout = () => {
  const params = useSearchParams();
  const roomId = params.get("roomId");

  const { view } = useRestContext();

  if (view === "landing") {
    return <Landing roomId={roomId} />;
  } else if (view === "error") {
    return (
      <div className="bg-[url(/landing-bg.png)] bg-card text-accent text-lg font-semibold rounded-lg h-screen w-full flex justify-center items-center">
        Some technical error, kindly refresh the page or view later
      </div>
    );
  } else {
    return <MainLayout />;
  }
};
