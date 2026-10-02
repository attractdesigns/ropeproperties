import Link from "next/link";
import { Phone, Mail, MapPin, MessageCircle, Instagram, Facebook, Linkedin } from "lucide-react";
import { Logo } from "./Logo";
import { NewsletterForm } from "./NewsletterForm";
import { REALTOR_NAME, BUSINESS_NAME } from "@/lib/site";

// TODO: Client to supply real contact details
const OFFICE_ADDRESS = "12 Adeola Odeku Street, Victoria Island, Lagos";
const MAP_LINK = "https://maps.google.com/?q=12+Adeola+Odeku+Street+Victoria+Island+Lagos";
const PHONE = "+234 800 000 0000";
const PHONE_TEL = "+2348000000000";
const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "2348000000000";
const EMAIL = "hello@ropeproperties.com";

const navLinks = [
  { label: "Listings", href: "/listings" },
  { label: "Invest", href: "/invest" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

const legalLinks = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Cookie Policy", href: "/cookies" },
];

export function Footer() {
  return (
    <footer className="bg-surface border-t border-line">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12">
          {/* Brand + newsletter */}
          <div className="md:col-span-5">
            <Logo />
            <p className="mt-4 text-sm text-muted max-w-sm leading-relaxed">
              Buy and invest in Nigerian property — handled personally by{" "}
              {REALTOR_NAME}. Straight talk, verified titles, no middlemen.
            </p>
            <div className="mt-6">
              <h3 className="text-xs uppercase tracking-[0.18em] text-muted mb-3">
                New listings in your inbox
              </h3>
              <NewsletterForm />
            </div>
          </div>

          {/* Explore */}
          <div className="md:col-span-2">
            <h3 className="text-xs uppercase tracking-[0.18em] text-muted mb-4">
              Explore
            </h3>
            <ul className="space-y-2.5">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-ink hover:text-accent transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="md:col-span-5">
            <h3 className="text-xs uppercase tracking-[0.18em] text-muted mb-4">
              Contact
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2.5 text-ink">
                <MapPin size={16} className="text-accent mt-0.5 shrink-0" />
                <a href={MAP_LINK} target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">
                  {OFFICE_ADDRESS}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone size={16} className="text-accent shrink-0" />
                <a href={`tel:${PHONE_TEL}`} className="text-ink hover:text-accent transition-colors">
                  {PHONE}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <MessageCircle size={16} className="text-accent shrink-0" />
                <a
                  href={`https://wa.me/${WHATSAPP}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-ink hover:text-accent transition-colors"
                >
                  Chat on WhatsApp
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail size={16} className="text-accent shrink-0" />
                <a href={`mailto:${EMAIL}`} className="text-ink hover:text-accent transition-colors">
                  {EMAIL}
                </a>
              </li>
            </ul>
            {/* Socials */}
            <div className="mt-5 flex gap-2">
              <SocialIcon href="https://instagram.com" label="Instagram">
                <Instagram size={16} />
              </SocialIcon>
              <SocialIcon href="https://facebook.com" label="Facebook">
                <Facebook size={16} />
              </SocialIcon>
              <SocialIcon href="https://linkedin.com" label="LinkedIn">
                <Linkedin size={16} />
              </SocialIcon>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-line flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted">
            © {new Date().getFullYear()} {BUSINESS_NAME}. All rights reserved.
          </p>
          <nav aria-label="Legal" className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted">
            {legalLinks.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-accent transition-colors">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}

function SocialIcon({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-line text-muted hover:border-accent hover:text-accent transition-colors"
    >
      {children}
    </a>
  );
}
