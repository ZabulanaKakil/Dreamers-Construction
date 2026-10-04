import type { Metadata } from "next";
import { Syne, DM_Sans } from "next/font/google";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { StickyContactBar } from "@/components/layout/StickyContactBar";
import { ThemeRoot } from "@/components/theme/ThemeRoot";
import { themeInitScript } from "@/components/theme/themeInitScript";
import { asset } from "@/lib/asset";
import "./globals.css";

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const logoUrl = asset("/images/brand/logo.jpg");

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://zabulanakakil.github.io",
  ),
  title: {
    default: "Dreamer's Construction | Quality in Time",
    template: "%s | Dreamer's Construction",
  },
  description:
    "Dreamer's Construction — construction and development company in Bangladesh. Institutional, infrastructure, and residential projects delivered since 2019.",  keywords: [
    "Dreamer's Construction",
    "real estate developer Bangladesh",
    "construction company Dhaka",
    "Mirpur DOHS",
    "Jolshiri",
  ],
  openGraph: {
    type: "website",
    locale: "en_BD",
    siteName: "Dreamer's Construction",
    title: "Dreamer's Construction | Quality in Time",
    description:
      "Browse projects, services, and the project map of Dreamer's Construction — Quality in Time since 2019.",
    images: [
      {
        url: logoUrl,
        width: 512,
        height: 512,
        alt: "Dreamer's Construction",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Dreamer's Construction | Quality in Time",
    description:
      "Construction projects and services across Bangladesh.",
    images: [logoUrl],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${syne.variable} ${dmSans.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body
        className="min-h-full flex flex-col gradient-mesh"
        suppressHydrationWarning
      >
        <ThemeRoot>
          <Nav />
          <main className="flex-1 pt-16 pb-20 lg:pb-0">{children}</main>
          <Footer />
          <StickyContactBar />
        </ThemeRoot>
      </body>
    </html>
  );
}
