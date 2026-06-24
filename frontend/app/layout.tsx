import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AniMatch — AI-Powered Anime Discovery",
  description:
    "Built for people who spend more time choosing than watching. AniMatch uses intelligent recommendation models to help you discover anime you'll actually enjoy.",
  authors: [{ name: "AniMatch" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">{children}</body>
    </html>
  );
}
