import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { GoogleAnalytics } from "@next/third-parties/google";
import { WsContextProvider } from "@/context/ws";
import { RestContextProvider } from "@/context/rest";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "notskribbl - Free Multiplayer Drawing & Guessing Game",
  description:
    "notskribbl.xyz is a free mutiplayer drawing and guessing game. Draw and guess....",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <RestContextProvider>
          <WsContextProvider>{children}</WsContextProvider>
        </RestContextProvider>
        <Toaster position="top-right" richColors />

        {/* Google Analytics) */}
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID!} />
      </body>
    </html>
  );
}
