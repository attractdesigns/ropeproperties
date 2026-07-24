"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Phone, Mail, MapPin, Clock, Check } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Section, SectionTitle } from "@/components/Section";
import { WhatsAppButton } from "@/components/WhatsAppButton";

const contactSchema = z.object({
  name: z.string().min(2, "Please enter your name"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  message: z.string().min(5, "Please enter a message"),
  // Honeypot
  company: z.string().optional(),
});

type ContactFormData = z.infer<typeof contactSchema>;

// TODO: Client to supply real contact details
const OFFICE_ADDRESS = "12 Adeola Odeku Street, Victoria Island, Lagos";
const PHONE = "+234 800 000 0000";
const PHONE_TEL = "+2348000000000";
const EMAIL = "hello@ropeproperties.com";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    setError(null);
    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "contact",
          name: data.name,
          phone: data.phone,
          email: data.email || null,
          message: data.message,
        }),
      });

      if (!response.ok) {
        const { error: serverError } = await response.json().catch(() => ({}));
        throw new Error(serverError ?? "Failed to submit");
      }

      setSubmitted(true);
      reset();
    } catch (e) {
      setError(
        e instanceof Error && e.message !== "Failed to submit"
          ? e.message
          : "Something went wrong. Please try again or call us directly."
      );
    }
  };

  const inputClass =
    "w-full border border-line px-3 py-2.5 text-sm text-ink focus:border-accent focus:outline-none";
  const labelClass = "block text-sm font-medium text-ink mb-1.5";
  const errorClass = "text-xs text-red-600 mt-1";

  return (
    <>
      <Header />
      <main className="pt-16">
        <Section>
          <SectionTitle>Get in Touch</SectionTitle>
          <p className="mt-4 text-muted max-w-lg">
            Whether you&apos;re buying, renting, investing, or looking to sell — we&apos;re
            here to help. Send us a message or reach us directly.
          </p>

          <div className="mt-12 grid md:grid-cols-2 gap-12">
            {/* Form */}
            <div>
              {submitted ? (
                <div className="border border-line p-8 text-center">
                  <div className="w-12 h-12 mx-auto bg-accent-tint flex items-center justify-center mb-4">
                    <Check className="text-accent" size={24} />
                  </div>
                  <h3 className="font-display text-lg text-ink">Thank you</h3>
                  <p className="mt-2 text-sm text-muted">
                    Your message has been sent. We&apos;ll be in touch shortly.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="mt-4 text-sm text-accent hover:text-accent-deep"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <input
                    type="text"
                    {...register("company")}
                    className="hidden"
                    tabIndex={-1}
                    autoComplete="off"
                  />

                  <div>
                    <label className={labelClass}>Name *</label>
                    <input className={inputClass} {...register("name")} />
                    {errors.name && <p className={errorClass}>{errors.name.message}</p>}
                  </div>

                  <div>
                    <label className={labelClass}>Phone *</label>
                    <input className={inputClass} type="tel" {...register("phone")} />
                    {errors.phone && <p className={errorClass}>{errors.phone.message}</p>}
                  </div>

                  <div>
                    <label className={labelClass}>Email</label>
                    <input className={inputClass} type="email" {...register("email")} />
                    {errors.email && <p className={errorClass}>{errors.email.message}</p>}
                  </div>

                  <div>
                    <label className={labelClass}>Message *</label>
                    <textarea
                      className={inputClass}
                      rows={5}
                      {...register("message")}
                    />
                    {errors.message && <p className={errorClass}>{errors.message.message}</p>}
                  </div>

                  {error && <p className="text-sm text-red-600">{error}</p>}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-ink text-white px-6 py-3 text-sm font-medium hover:bg-accent transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? "Sending..." : "Send Message"}
                  </button>
                </form>
              )}
            </div>

            {/* Office info */}
            <div className="space-y-6">
              <div className="border border-line p-6 space-y-4">
                <h3 className="font-display text-lg text-ink">Office</h3>

                <div className="flex items-start gap-3">
                  <MapPin size={18} className="text-accent mt-0.5 shrink-0" />
                  <span className="text-sm text-ink">{OFFICE_ADDRESS}</span>
                </div>

                <div className="flex items-center gap-3">
                  <Phone size={18} className="text-accent shrink-0" />
                  <a
                    href={`tel:${PHONE_TEL}`}
                    className="text-sm text-ink hover:text-accent transition-colors"
                  >
                    {PHONE}
                  </a>
                </div>

                <div className="flex items-center gap-3">
                  <Mail size={18} className="text-accent shrink-0" />
                  <a
                    href={`mailto:${EMAIL}`}
                    className="text-sm text-ink hover:text-accent transition-colors"
                  >
                    {EMAIL}
                  </a>
                </div>

                <div className="flex items-start gap-3">
                  <Clock size={18} className="text-accent mt-0.5 shrink-0" />
                  <div className="text-sm text-ink">
                    <p>Mon–Fri: 9am – 6pm</p>
                    <p>Sat: 10am – 4pm</p>
                  </div>
                </div>

                <div className="pt-2">
                  <WhatsAppButton label="WhatsApp Us" variant="solid" />
                </div>
              </div>

              {/* Map */}
              <div className="aspect-[4/3] border border-line">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3964.0!2d3.4!3d6.4!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNsKwMjQnMDAuMCJOIDPCsDI0JzAwLjAiRQ!5e0!3m2!1sen!2sng!4v0000000000000"
                  className="w-full h-full"
                  loading="lazy"
                  title="Office location"
                />
              </div>
            </div>
          </div>
        </Section>
      </main>
      <Footer />
    </>
  );
}