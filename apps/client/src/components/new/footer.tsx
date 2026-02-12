import Link from "next/link";

export const Footer = () => {
  return (
    <footer className="text-neutral-100 w-full flex flex-col justify-center items-center gap-2 mt-16 text-sm">
      <p>
        Build with 💖 by{" "}
        <span className="font-semibold underline hover:opacity-90">
          <Link href={"https://amitesh.work/"} target="_blank">
            Amitesh
          </Link>
        </span>
      </p>
      <p>
        Credits to {" "}
        <span className="font-semibold underline hover:opacity-90">
          <Link href={"https://skribbl.io/"} target="_blank">
            Skribbl
          </Link>
        </span>
      </p>
    </footer>
  );
};
