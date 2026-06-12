import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Discover — Flicknest",
  description:
    "Discover community-submitted films. Browse, vote, and explore the deeper meaning behind every story.",
  openGraph: {
    title: "Discover — Flicknest",
    description:
      "Discover community-submitted films. Browse, vote, and explore the deeper meaning behind every story.",
    type: "website",
    siteName: "Flicknest",
  },
};

export default function DiscoverLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
