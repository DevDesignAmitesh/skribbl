import { FinalLayout } from "@/page/finallayout";
import { Suspense } from "react";

export default function page() {
  return (
    <Suspense
      fallback={
        <div className="h-screen w-full bg-[url(/landing-bg.png)] px-4"></div>
      }
    >
      <FinalLayout />
    </Suspense>
  );
}
