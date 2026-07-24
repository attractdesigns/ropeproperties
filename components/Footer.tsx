import Link from "next/link";
import { Phone, Mail, MapPin, MessageCircle } from "lucide-react";
import { Logo } from "./Logo";

// TODO: Client to supply real contact details
const OFFICE_ADDRESS = "12 Adeola Odeku Street, Victoria Island, Lagos";
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

export function Footer() {
  return (
    <footer className="bg-surface border-t border-line">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Logo />
            <p className="mt-4 text-sm text-muted max-w-xs">
              Premium Nigerian real estate. Buy, rent, and invest with confidence.
            </p>
          </div>

          {/* Nav */}
          <div>
            <h3 className="text-xs uppercase tracking-wider text-muted mb-4">
              Explore
            </h3>
            <ul className="space-y-2">
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
          <div className="md:col-span-2">
            <h3 className="text-xs uppercase tracking-wider text-muted mb-4">
              Contact
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2 text-ink">
                <MapPin size={16} className="text-accent mt-0.5 shrink-0" />
                {OFFICE_ADDRESS}
              </li>
              <li className="flex items-center gap-2">
                <Phone size={16} className="text-accent shrink-0" />
                <a href={`tel:${PHONE_TEL}`} className="text-ink hover:text-accent transition-colors">
                  {PHONE}
                </a>
              </li>
              <li className="flex items-center gap-2">
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
              <li className="flex items-center gap-2">
                <Mail size={16} className="text-accent shrink-0" />
                <a href={`mailto:${EMAIL}`} className="text-ink hover:text-accent transition-colors">
                  {EMAIL}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-line flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted">
            © {new Date().getFullYear()} RopeProperties. All rights reserved.
          </p>
          <div className="flex gap-4 text-xs text-muted">
            {/* TODO: Add social links when provided */}
            <span>Instagram</span>
            <span>Facebook</span>
            <span>LinkedIn</span>
          </div>
        </div>
      </div>
    </footer>
  );
}