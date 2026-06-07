import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "animatch",
  description: "anime recommendations. no bullshit.",
  authors: [{ name: "developer" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${mono.variable} antialiased`}>
        {children}
        {/* Developer signature in console */}
        <script dangerouslySetInnerHTML={{
          __html: `
            console.log("%c╔════════════════════════════════════╗", "color: #e04f5f");
            console.log("%c║         anīmātch v1.0              ║", "color: #e04f5f");
            console.log("%c║    built by hand, not AI           ║", "color: #e04f5f");
            console.log("%c╚════════════════════════════════════╝", "color: #e04f5f");
            console.log("%c11,314 anime | 15 clusters | TF-IDF + K-Means", "color: #5b7c99");
          `
        }} />
      </body>
    </html>
  );
}