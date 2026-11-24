import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Wee Sparks — NI CCEA Foundation Stage (P1–P2)",
  description:
    "Offline-first, audio-first literacy and numeracy quests aligned to the Northern Ireland CCEA Foundation Stage curriculum.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-GB">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
