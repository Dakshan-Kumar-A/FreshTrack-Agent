import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FreshTrack Assistant - Food Waste Reduction",
  description: "Agentic AI system for tracking food inventory and reducing waste",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
