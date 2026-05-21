import type { Metadata } from "next";
import { Orbitron, Space_Grotesk } from "next/font/google";
import { Providers } from "@/providers/Providers";
import "./globals.css";

const display = Orbitron({
  subsets: ["latin"],
  variable: "--font-display",
});

const body = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "Boombox Warplet | Base × Farcaster",
  description:
    "Cosmic Whack-a-Mole on Base. Hit Warplets, stack multipliers, cash out or risk it all.",
  openGraph: {
    title: "Boombox Warplet",
    description: "Whack Warplets in the cosmic void. Risk vs reward on Base.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <head>
        <meta name="base:app_id" content="6a0f7b0e86fe5ef216020998" />
      </head>
      <body className="font-body antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
