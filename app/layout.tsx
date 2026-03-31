import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Aralkada",
  description:
    "AI-powered study companion for Filipino students — lessons, flashcards, mock exams, college tracking and more.",
  icons: {
    icon: "/mascot.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${nunito.variable} h-full`}>
      <body
        className="min-h-full"
        style={{ fontFamily: "var(--font-nunito), 'Nunito', sans-serif" }}
      >
        {children}
      </body>
    </html>
  );
}
