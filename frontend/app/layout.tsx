import type { Metadata } from "next";
import { Space_Grotesk, Syne } from "next/font/google";
import "./globals.css";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "600", "700", "800"],
});

const grotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
  title: "AniMatch — AI Anime Recommendations",
  description:
    "Discover your next obsession. Content-based AI recommendations powered by genre, mood, and era.",
  openGraph: {
    title: "AniMatch",
    description: "AI-powered anime recommendations",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${syne.variable} ${grotesk.variable}`}>
      <body className="bg-[#080810] text-white antialiased font-body">
        {children}
      </body>
    </html>
  );
}
