import type { Metadata } from "next";
import AboutPage from "./about-page";

export const metadata: Metadata = {
  title: "About Mai",
  description: "Conoce la esencia de Mai Repostería.",
};

export default function AboutRoute() {
  return <AboutPage />;
}
