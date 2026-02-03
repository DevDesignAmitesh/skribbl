import { Main } from "@/page/Main";
import { Suspense } from "react";

export default function Home() {
  return (
    <Suspense fallback="Loading...">
      <Main />
    </Suspense>
  );
}
