import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AniMatch — find something good",
  description: "A content-based anime recommender. Scroll through the spectrum.",
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
            console.log("%cAniMatch", "font: 700 38px Georgia,serif; color:#b06ef5; text-shadow:0 2px 12px rgba(176,110,245,.4)");
            console.log("%cliving spectrum · scroll the palette ↓", "color:#6e8efb; font-family:monospace; font-size:12px");
            console.log("%c11,314 titles · TF-IDF + K-Means · FastAPI + Next.js", "color:#7a8299; font-family:monospace; font-size:11px");
          `
        }} />
      </body>
    </html>
  );
}
