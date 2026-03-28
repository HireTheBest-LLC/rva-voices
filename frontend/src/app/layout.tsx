import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RVA Voices — Richmond Stories Project",
  description: "A civic storytelling platform connecting Richmond residents, historians, and city planners through neighborhood stories.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
