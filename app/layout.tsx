import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Aria Lite - Building Engineer Chat",
  description: "AI-powered building engineer chat demo",
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
