import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AniMatch ✦ summon your next watch",
  description: "A gacha-style anime recommender. Make a wish, pull a card.",
  authors: [{ name: "Saanvi" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">
        {children}
        {/* Console signature for the curious */}
        <script dangerouslySetInnerHTML={{
          __html: `
            console.log("%c✦ AniMatch ✦", "font: 800 34px 'Baloo 2',sans-serif; color:#ff9ec7; text-shadow:0 2px 14px rgba(255,158,199,.5)");
            console.log("%cキラキラ ~ make a wish, pull a card", "color:#c79bff; font-family:monospace; font-size:12px");
            console.log("%c11,314 titles · TF-IDF + K-Means · made with love", "color:#9a8299; font-family:monospace; font-size:11px");
          `
        }} />
      </body>
    </html>
  );
}
