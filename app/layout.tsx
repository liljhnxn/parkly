import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Parkly | Web3 Parking Space Management & Reservations",
  description:
    "Find a space. Park with ease. Simple, secure on-chain parking management on Botchain.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className="bg-charcoal-950 text-gray-100 min-h-screen selection:bg-parklyGreen/20 selection:text-emerald-300"
        suppressHydrationWarning
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
