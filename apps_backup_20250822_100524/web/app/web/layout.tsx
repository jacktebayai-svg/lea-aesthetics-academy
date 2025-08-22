import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// Maerose Typography - Inter Variable Font Only (weights 300-700)
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Lea's Aesthetics Master Suite",
  description:
    "An all-in-one system for Lea's Aesthetics Clinical Academy, unifying client bookings and student education into a single, seamless, and luxurious experience.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
