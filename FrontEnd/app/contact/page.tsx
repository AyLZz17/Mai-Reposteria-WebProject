import type { Metadata } from "next";
import ContactPage from "./contact-page";

export const metadata: Metadata = {
  title: "Contact",
  description: "Escríbenos por correo o WhatsApp.",
};

export const dynamic = "force-dynamic";

export default function ContactRoute() {
  return <ContactPage contactEmail={process.env.CONTACT_EMAIL?.trim() || ""} />;
}
