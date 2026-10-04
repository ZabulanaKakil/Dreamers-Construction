import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Map",
  description:
    "Explore Dreamer's Construction projects and residences across Dhaka, Jolshiri, Mirpur DOHS, Narayanganj DOHS, and Bangladesh.",
};

export default function MapLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
