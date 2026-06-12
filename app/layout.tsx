import type { Metadata } from "next";
import { Bebas_Neue, Lato } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

const bebasNeue = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
  display: "swap",
});

const lato = Lato({
  subsets: ["latin"],
  weight: ["300", "400", "700", "900"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Flicknest — Cinema Redefined",
  description:
    "A cinematic luxury streaming experience. Discover, watch, and immerse yourself in the world of film.",
  openGraph: {
    title: "Flicknest — Cinema Redefined",
    description:
      "A cinematic luxury streaming experience. Discover, watch, and immerse yourself in the world of film.",
    type: "website",
    siteName: "Flicknest",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${bebasNeue.variable} ${lato.variable}`}>
      <body className="antialiased min-h-screen">
        <div className="flex min-h-screen">
          <Sidebar />
          <div className="flex-1 min-w-0">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
