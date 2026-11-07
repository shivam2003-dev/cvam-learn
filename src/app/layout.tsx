import type { Metadata } from "next";
import { Bricolage_Grotesque, Geist, Geist_Mono } from "next/font/google";
import { NavigationProgress } from "@/components/NavigationProgress";
import { PromoPopup } from "@/components/PromoPopup";
import { SiteFooter } from "@/components/SiteFooter";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { default: "cvam.learn", template: "%s · cvam.learn" },
  description:
    "Learning paths, visual roadmaps and hands-on practice problems for engineers.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${bricolage.variable} antialiased`}
    >
      <body className="min-h-dvh">
        <NavigationProgress />
        {children}
        <SiteFooter />
        <PromoPopup />
      </body>
    </html>
  );
}
