"use client";

import { useRestContext } from "@/context/rest";
import Landing from "@/page/Landing";
import { Main } from "@/page/Main";
import { MainLayout } from "@/page/main-layout";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

export default function page() {
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

  // return (
  //   <Suspense fallback="Loading...">
  //     <Main />
  //   </Suspense>
  // );
}
