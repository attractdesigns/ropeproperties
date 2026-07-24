"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Check } from "lucide-react";

const interestSchema = z.object({
  name: z.string().min(2, "Please enter your name"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  message: z.string().optional(),
  // Honeypot
  company: z.string().optional(),
});

type InterestFormData = z.infer<typeof interestSchema>;

interface InvestmentInterestFormProps {
  opportunityId: string;
  opportunityTitle: string;
}

export function InvestmentInterestForm({
  opportunityId,
  opportunityTitle,
}: InvestmentInterestFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<InterestFormData>({
    resolver: zodResolver(interestSchema),
  });

  const onSubmit = async (data: InterestFormData) => {
    setError(null);
    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "investment",
          opportunity_id: opportunityId,
          name: data.name,
          phone: data.phone,
          email: data.email || null,
          message: data.message || null,
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

  if (submitted) {
    return (
      <div className="border border-line p-6 text-center">
        <div className="w-12 h-12 mx-auto bg-accent-tint flex items-center justify-center mb-4">
          <Check className="text-accent" size={24} />
        </div>
        <h3 className="font-display text-lg text-ink">Thank you</h3>
        <p className="mt-2 text-sm text-muted">
          Your interest in <span className="text-ink">{opportunityTitle}</span> has
          been registered. I&apos;ll be in touch shortly.
        </p>
        <button
          onClick={() => setSubmitted(false)}
          className="mt-4 text-sm text-accent hover:text-accent-deep"
        >
          Send another enquiry
        </button>
      </div>
    );
  }

  const inputClass =
    "w-full border border-line px-3 py-2.5 text-sm text-ink focus:border-accent focus:outline-none";
  const labelClass = "block text-sm font-medium text-ink mb-1.5";
  const errorClass = "text-xs text-red-600 mt-1";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="border border-line p-6">
      <h3 className="font-display text-lg text-ink mb-4">Register Interest</h3>

      <input
        type="text"
        {...register("company")}
        className="hidden"
        tabIndex={-1}
        autoComplete="off"
      />

      <div className="space-y-4">
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
          <label className={labelClass}>Message</label>
          <textarea
            className={inputClass}
            rows={3}
            placeholder="Tell us about your investment goals..."
            {...register("message")}
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-ink text-white py-3 text-sm font-medium hover:bg-accent transition-colors disabled:opacity-50"
        >
          {isSubmitting ? "Submitting..." : "Submit"}
        </button>
      </div>
    </form>
  );
}