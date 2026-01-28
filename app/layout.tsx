import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Who Owes Who",
  description: "Figure out who owes how much to whom. Free. No signup.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <header className="header">
          <h1>Who Owes Who</h1>
          <span className="tagline">
            Paste payments. Get settlements. No signup.
          </span>
        </header>

        {children}

        <footer className="footer">
          <span>Free & open utility · No data stored | Made by Saugata Kundu</span>
        </footer>
      </body>
    </html>
  );
}
