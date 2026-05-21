import type { Metadata } from "next";
import { Orbitron, Space_Grotesk } from "next/font/google";
import { APP_URL } from "@/constants/appUrl";
import { buildMiniAppEmbedMeta } from "@/lib/farcasterManifest";
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

const miniAppEmbed = JSON.stringify(buildMiniAppEmbedMeta());

export const metadata: Metadata = {
  title: "Boombox Warplet | Base × Farcaster",
  description:
    "Cosmic Whack-a-Mole on Base. Hit Warplets, stack multipliers, cash out or risk it all.",
  metadataBase: new URL(APP_URL),
  openGraph: {
    title: "Boombox Warplet",
    description: "Whack Warplets in the cosmic void. Risk vs reward on Base.",
    url: APP_URL,
    images: [{ url: "/opengraph-image" }],
  },
  other: {
    "fc:miniapp": miniAppEmbed,
    "fc:frame": miniAppEmbed,
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
