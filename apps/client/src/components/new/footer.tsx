import Link from "next/link";

export const Footer = () => {
  return (
    <footer className="text-neutral-100 w-full text-center mt-16 text-sm">
      <p>
        Build with 💖 by {" "}
        <span className="font-semibold underline hover:opacity-90">
          <Link href={"https://amitesh.work/"} target="_blank">
            Amitesh
          </Link>
        </span>
      </p>
    </footer>
  );
};
