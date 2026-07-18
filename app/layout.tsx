import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Starter App",
  description: "A clean Next.js starter ready to grow.",
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
