import Image from "next/image";
import Link from "next/link";

export const LandingNews = () => {
  return (
    <div className="w-full bg-[#0C2D95] p-2 flex flex-col justify-center items-start lg:items-center text-neutral-100">
      <div className="flex justify-start items-center gap-20 w-full mb-4">
        <Image
          unoptimized
          src={"/news.gif"}
          alt="logo"
          width={30}
          height={30}
        />

        <h1 className="text-2xl font-semibold">News</h1>
      </div>
      {/* Card */}
      <div className="rounded-md text-sm">
        {/* Content */}
        <ul className="list-disc list-inside space-y-2">
          <li>
            Version <b>v1</b> is deployed with the{" "}
            <b>core game logic completed</b>
          </li>

          <li>
            Live version available at:{" "}
            <Link
              href="https://skribbl.amitesh.work/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-blue-200 break-all"
            >
              here
            </Link>
          </li>

          <li>
            Feedback received mainly for:
            <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
              <li>UI / UX improvements</li>
              <li>Responsiveness across devices</li>
            </ul>
          </li>

          <li>
            Currently working on:
            <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
              <li>Improving overall UI</li>
              <li>Better mobile & tablet support</li>
            </ul>
          </li>

          <li>
            Goal:
            <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
              <li>Clone the original experience as closely as possible</li>
              <li>Let’s see how far we can take it 🚀</li>
            </ul>
          </li>
        </ul>
      </div>
    </div>
  );
};
