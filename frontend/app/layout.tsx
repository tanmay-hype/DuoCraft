import type { Metadata } from "next";
import {
  Caveat,
  DM_Sans,
  Playfair_Display,
} from "next/font/google";

import "./globals.css";


const headlineFont = Playfair_Display({
  variable: "--font-headline",
  subsets: ["latin"],
  display: "swap",
});


const bodyFont = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});


const accentFont = Caveat({
  variable: "--font-accent",
  subsets: ["latin"],
  display: "swap",
});


export const metadata: Metadata = {
  title: {
    default: "DuoCraft",
    template: "%s | DuoCraft",
  },
  description:
    "Personalized digital gifts made from your words, photos, and memories.",
};


interface RootLayoutProps {
  children: React.ReactNode;
}


export default function RootLayout({
  children,
}: Readonly<RootLayoutProps>) {
  return (
    <html lang="en">
      <body
        className={[
          headlineFont.variable,
          bodyFont.variable,
          accentFont.variable,
        ].join(" ")}
      >
        {children}
      </body>
    </html>
  );
}