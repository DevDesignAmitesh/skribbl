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
  } else if (view === "create-room" || view === "share-room") {
    return <MainLayout />;
  } else if (view === "summary") {
    return <div>summary</div>;
  } else if (view === "waiting") {
    return <div>waiting</div>;
  } else if (view === "error") {
    return <div>error hai bsdk</div>;
  }

  // return (
  //   <Suspense fallback="Loading...">
  //     <Main />
  //   </Suspense>
  // );
}
