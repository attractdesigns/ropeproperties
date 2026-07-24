"use client";

import { useState } from "react";

export function TestimonialForm() {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputClass =
    "w-full border border-line px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none";
  const labelClass = "block text-sm font-medium text-ink mb-1.5";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      client_name: formData.get("client_name"),
      location: formData.get("location") || null,
      quote: formData.get("quote"),
      sort_order: Number(formData.get("sort_order") ?? 0),
      is_active: true,
    };

    try {
      const response = await fetch("/api/admin/save-testimonial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const { error: serverError } = await response.json().catch(() => ({}));
        throw new Error(serverError ?? "Failed to save");
      }

      window.location.reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save testimonial.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
      <div>
        <label className={labelClass}>Client name *</label>
        <input name="client_name" className={inputClass} required />
      </div>
      <div>
        <label className={labelClass}>Location</label>
        <input
          name="location"
          className={inputClass}
          placeholder="e.g. Lekki Phase 1, Lagos"
        />
      </div>
      <div className="md:col-span-2">
        <label className={labelClass}>Quote *</label>
        <textarea name="quote" rows={3} className={inputClass} required />
      </div>
      <div>
        <label className={labelClass}>Sort order</label>
        <input
          name="sort_order"
          type="number"
          defaultValue={0}
          className={inputClass}
        />
      </div>
      {error && <p className="text-sm text-red-600 md:col-span-2">{error}</p>}
      <div className="md:col-span-2">
        <button
          type="submit"
          disabled={saving}
          className="bg-ink text-white px-4 py-2 text-sm font-medium hover:bg-accent transition-colors disabled:opacity-50"
        >
          {saving ? "Saving..." : "Add Testimonial"}
        </button>
      </div>
    </form>
  );
}
