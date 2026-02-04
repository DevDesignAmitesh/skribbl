import Landing from "@/page/Landing";
import { Main } from "@/page/Main";
import { Suspense } from "react";

export default function Home() {
  return <Landing />;
  // return (
  //   <Suspense fallback="Loading...">
  //     <Main />
  //   </Suspense>
  // );
}
