import Landing from "@/page/Landing";
import { Main } from "@/page/Main";
import { MainLayout } from "@/page/main-layout";
import { Suspense } from "react";

export default function Home() {
  return <MainLayout />;
  return <Landing />;
  // return (
  //   <Suspense fallback="Loading...">
  //     <Main />
  //   </Suspense>
  // );
}
