import type { Metadata, Viewport } from "next";
import { MotionProvider } from "@/components/providers/MotionProvider";
import { ServiceWorkerRegistrar } from "@/components/providers/ServiceWorkerRegistrar";
import "./globals.css";

export const metadata: Metadata = {
  applicationName: "Wee Sparks",
  title: "Wee Sparks — NI CCEA Foundation Stage (P1–P2)",
  description:
    "Offline-first, audio-first literacy and numeracy quests aligned to the Northern Ireland CCEA Foundation Stage curriculum.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Wee Sparks",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { url: "/icons/icon.svg", type: "image/svg+xml" },
    ],
    apple: [
      {
        url: "/icons/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#0284C7",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-GB">
      <body className="min-h-screen">
        <ServiceWorkerRegistrar />
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
