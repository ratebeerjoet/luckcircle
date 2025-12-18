import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "The Luck Circle | Anti-Networking",
  description: "Stop networking. Start connecting. The Luck Circle uses AI to facilitate deep, 3-person conversations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${outfit.variable} font-sans antialiased bg-slate-950 text-slate-50`}
      >
        {children}
      </body>
    </html>
  );
}
