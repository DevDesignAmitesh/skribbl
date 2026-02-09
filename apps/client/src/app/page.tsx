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

  console.log("view ", view);

  if (view === "landing") {
    return <Landing roomId={roomId} />;
  } else {
    return <MainLayout />;
  }

  // return (
  //   <Suspense fallback="Loading...">
  //     <Main />
  //   </Suspense>
  // );
}
