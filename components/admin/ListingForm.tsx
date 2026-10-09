"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ImageManager, type UploadedImage } from "@/components/admin/ImageManager";
import { slugify } from "@/lib/format";
import type { Agent, PartnerCompany, PlotOption, PaymentTerms } from "@/lib/types";

interface ListingFormProps {
  property?: {
    id: string;
    title: string;
    slug: string;
    description: string;
    status: string;
    property_type: string;
    price: number;
    price_period: string;
    bedrooms: number | null;
    bathrooms: number | null;
    toilets: number | null;
    parking: number | null;
    size_sqm: number | null;
    city: string;
    neighbourhood: string | null;
    address: string | null;
    features: string[];
    map_embed_url: string | null;
    is_featured: boolean;
    is_investment: boolean;
    investment_note: string | null;
    partner_id: string | null;
    agent_id: string | null;
    plot_options?: PlotOption[] | null;
    payment_terms?: PaymentTerms | null;
  };
  images?: UploadedImage[];
  agents: Agent[];
  partners: PartnerCompany[];
}

const inputClass =
  "w-full border border-line px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none";
const labelClass = "block text-sm font-medium text-ink mb-1.5";

export function ListingForm({ property, images: existingImages, agents, partners }: ListingFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<UploadedImage[]>(existingImages ?? []);
  const [features, setFeatures] = useState<string[]>(property?.features ?? []);
  const [featureInput, setFeatureInput] = useState("");

  // Land listings: plot rows are edited as strings and parsed on save.
  type PlotRow = { size_sqm: string; price: string; initial_deposit: string; suggested_use: string };
  const [plots, setPlots] = useState<PlotRow[]>(
    (property?.plot_options ?? []).map((o) => ({
      size_sqm: String(o.size_sqm),
      price: String(o.price),
      initial_deposit: o.initial_deposit != null ? String(o.initial_deposit) : "",
      suggested_use: o.suggested_use ?? "",
    }))
  );
  const [terms, setTerms] = useState({
    title_doc: property?.payment_terms?.title_doc ?? "",
    payment_plan: property?.payment_terms?.payment_plan ?? "",
    highlights: (property?.payment_terms?.highlights ?? []).join("\n"),
    disclaimer: property?.payment_terms?.disclaimer ?? "",
  });
  const updatePlot = (i: number, field: keyof PlotRow, value: string) =>
    setPlots((rows) => rows.map((r, j) => (j === i ? { ...r, [field]: value } : r)));

  const [form, setForm] = useState({
    title: property?.title ?? "",
    slug: property?.slug ?? "",
    description: property?.description ?? "",
    status: property?.status ?? "draft",
    property_type: property?.property_type ?? "apartment",
    price: property?.price?.toString() ?? "",
    price_period: property?.price_period ?? "total",
    bedrooms: property?.bedrooms?.toString() ?? "",
    bathrooms: property?.bathrooms?.toString() ?? "",
    toilets: property?.toilets?.toString() ?? "",
    parking: property?.parking?.toString() ?? "",
    size_sqm: property?.size_sqm?.toString() ?? "",
    city: property?.city ?? "",
    neighbourhood: property?.neighbourhood ?? "",
    address: property?.address ?? "",
    map_embed_url: property?.map_embed_url ?? "",
    is_featured: property?.is_featured ?? false,
    is_investment: property?.is_investment ?? false,
    investment_note: property?.investment_note ?? "",
    partner_id: property?.partner_id ?? "",
    agent_id: property?.agent_id ?? "",
  });

  // Auto-generate slug from title (only for new listings)
  useEffect(() => {
    if (!property && form.title && !form.slug) {
      setForm((f) => ({ ...f, slug: slugify(f.title) }));
    }
  }, [form.title, form.slug, property]);

  const handleChange = (field: string, value: string | boolean) => {
    setForm((f) => ({ ...f, [field]: value }));
  };

  const addFeature = () => {
    const trimmed = featureInput.trim();
    if (trimmed && !features.includes(trimmed)) {
      setFeatures([...features, trimmed]);
      setFeatureInput("");
    }
  };

  const removeFeature = (feature: string) => {
    setFeatures(features.filter((f) => f !== feature));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const payload = {
        id: property?.id,
        title: form.title,
        slug: form.slug,
        description: form.description,
        status: form.status,
        property_type: form.property_type,
        price: parseFloat(form.price) || 0,
        price_period: form.price_period,
        bedrooms: form.bedrooms ? parseInt(form.bedrooms) : null,
        bathrooms: form.bathrooms ? parseInt(form.bathrooms) : null,
        toilets: form.toilets ? parseInt(form.toilets) : null,
        parking: form.parking ? parseInt(form.parking) : null,
        size_sqm: form.size_sqm ? parseFloat(form.size_sqm) : null,
        city: form.city,
        neighbourhood: form.neighbourhood || null,
        address: form.address || null,
        features,
        map_embed_url: form.map_embed_url || null,
        is_featured: form.is_featured,
        is_investment: form.is_investment,
        investment_note: form.is_investment ? form.investment_note : null,
        partner_id: form.partner_id || null,
        agent_id: form.agent_id || null,
        plot_options: plots
          .filter((r) => parseFloat(r.size_sqm) > 0 && parseFloat(r.price) > 0)
          .map((r) => ({
            size_sqm: parseFloat(r.size_sqm),
            price: parseFloat(r.price),
            initial_deposit: r.initial_deposit ? parseFloat(r.initial_deposit) : null,
            suggested_use: r.suggested_use.trim() || null,
          })),
        payment_terms:
          terms.title_doc || terms.payment_plan || terms.highlights.trim() || terms.disclaimer
            ? {
                title_doc: terms.title_doc.trim() || null,
                payment_plan: terms.payment_plan.trim() || null,
                highlights: terms.highlights.split("\n").map((l) => l.trim()).filter(Boolean),
                disclaimer: terms.disclaimer.trim() || null,
              }
            : null,
        images,
      };

      const response = await fetch("/api/admin/save-property", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error ?? "Failed to save");
      }

      router.push("/admin/listings");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-6">
      {/* Details */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white border border-line p-6 space-y-4">
          <h2 className="font-display text-lg text-ink">Details</h2>

          <div>
            <label className={labelClass}>Title *</label>
            <input
              className={inputClass}
              value={form.title}
              onChange={(e) => handleChange("title", e.target.value)}
              required
            />
          </div>

          <div>
            <label className={labelClass}>Slug *</label>
            <input
              className={inputClass}
              value={form.slug}
              onChange={(e) => handleChange("slug", e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Type *</label>
              <select
                className={inputClass}
                value={form.property_type}
                onChange={(e) => handleChange("property_type", e.target.value)}
              >
                <option value="apartment">Apartment</option>
                <option value="house">House</option>
                <option value="duplex">Duplex</option>
                <option value="terrace">Terrace</option>
                <option value="bungalow">Bungalow</option>
                <option value="land">Land</option>
                <option value="commercial">Commercial</option>
              </select>
            </div>

            <div>
              <label className={labelClass}>Status *</label>
              <select
                className={inputClass}
                value={form.status}
                onChange={(e) => handleChange("status", e.target.value)}
              >
                <option value="draft">Draft</option>
                <option value="for_sale">For Sale</option>
                <option value="sold">Sold</option>
              </select>
            </div>
          </div>

          <div>
            <label className={labelClass}>Price (NGN) *</label>
            <input
              className={inputClass}
              type="number"
              value={form.price}
              onChange={(e) => handleChange("price", e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className={labelClass}>Beds</label>
              <input className={inputClass} type="number" value={form.bedrooms} onChange={(e) => handleChange("bedrooms", e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Baths</label>
              <input className={inputClass} type="number" value={form.bathrooms} onChange={(e) => handleChange("bathrooms", e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Toilets</label>
              <input className={inputClass} type="number" value={form.toilets} onChange={(e) => handleChange("toilets", e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Parking</label>
              <input className={inputClass} type="number" value={form.parking} onChange={(e) => handleChange("parking", e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Size (m²)</label>
              <input className={inputClass} type="number" value={form.size_sqm} onChange={(e) => handleChange("size_sqm", e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>City *</label>
              <input className={inputClass} value={form.city} onChange={(e) => handleChange("city", e.target.value)} required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Neighbourhood</label>
              <input className={inputClass} value={form.neighbourhood} onChange={(e) => handleChange("neighbourhood", e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Address</label>
              <input className={inputClass} value={form.address} onChange={(e) => handleChange("address", e.target.value)} />
            </div>
          </div>

          <div>
            <label className={labelClass}>Map Embed URL</label>
            <input className={inputClass} value={form.map_embed_url} onChange={(e) => handleChange("map_embed_url", e.target.value)} placeholder="https://www.google.com/maps/embed?..." />
          </div>

          <div>
            <label className={labelClass}>Description</label>
            <textarea className={inputClass} rows={5} value={form.description} onChange={(e) => handleChange("description", e.target.value)} />
          </div>

          {/* Features tag input */}
          <div>
            <label className={labelClass}>Features / Amenities</label>
            <div className="flex gap-2 mb-2">
              <input
                className={inputClass}
                value={featureInput}
                onChange={(e) => setFeatureInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addFeature();
                  }
                }}
                placeholder="Add feature and press Enter"
              />
              <button type="button" onClick={addFeature} className="bg-surface border border-line px-3 text-sm">Add</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {features.map((feature) => (
                <span key={feature} className="inline-flex items-center gap-1 bg-accent-tint text-accent-deep px-2 py-1 text-sm">
                  {feature}
                  <button type="button" onClick={() => removeFeature(feature)} className="hover:text-red-600">✕</button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Land plots & payment terms */}
        <div className="bg-white border border-line p-6 space-y-4">
          <div>
            <h2 className="font-display text-lg text-ink">Plot options &amp; payment terms</h2>
            <p className="text-xs text-muted mt-1">
              Optional. Shown as a comparison table with a highlighted terms panel. Leave empty for ordinary listings.
            </p>
          </div>

          <div className="space-y-3">
            {plots.map((r, i) => (
              <div key={i} className="grid grid-cols-2 gap-2 border border-line p-3 sm:grid-cols-5">
                <input className={inputClass} type="number" placeholder="Size m²" aria-label={`Plot ${i + 1} size in square metres`} value={r.size_sqm} onChange={(e) => updatePlot(i, "size_sqm", e.target.value)} />
                <input className={inputClass} type="number" placeholder="Price ₦" aria-label={`Plot ${i + 1} price`} value={r.price} onChange={(e) => updatePlot(i, "price", e.target.value)} />
                <input className={inputClass} type="number" placeholder="Deposit ₦" aria-label={`Plot ${i + 1} initial deposit`} value={r.initial_deposit} onChange={(e) => updatePlot(i, "initial_deposit", e.target.value)} />
                <input className={`${inputClass} col-span-2 sm:col-span-1`} placeholder="Suggested use" aria-label={`Plot ${i + 1} suggested use`} value={r.suggested_use} onChange={(e) => updatePlot(i, "suggested_use", e.target.value)} />
                <button type="button" onClick={() => setPlots(plots.filter((_, j) => j !== i))} className="text-sm hover:text-red-600" aria-label={`Remove plot ${i + 1}`}>
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setPlots([...plots, { size_sqm: "", price: "", initial_deposit: "", suggested_use: "" }])}
              className="bg-surface border border-line px-3 py-1.5 text-sm"
            >
              Add plot size
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Title document</label>
              <input className={inputClass} value={terms.title_doc} onChange={(e) => setTerms({ ...terms, title_doc: e.target.value })} placeholder="e.g. Government-allocated C of O" />
            </div>
            <div>
              <label className={labelClass}>Payment plan (short)</label>
              <input className={inputClass} value={terms.payment_plan} onChange={(e) => setTerms({ ...terms, payment_plan: e.target.value })} placeholder="e.g. 6 months interest-free" />
            </div>
          </div>
          <div>
            <label className={labelClass}>Terms (one per line)</label>
            <textarea className={inputClass} rows={5} value={terms.highlights} onChange={(e) => setTerms({ ...terms, highlights: e.target.value })} />
          </div>
          <div>
            <label className={labelClass}>Closing note</label>
            <input className={inputClass} value={terms.disclaimer} onChange={(e) => setTerms({ ...terms, disclaimer: e.target.value })} placeholder="e.g. Confirm prices and documents before commitment." />
          </div>
        </div>

        {/* Image Manager */}
        <div className="bg-white border border-line p-6">
          <ImageManager
            images={images}
            onChange={setImages}
            uploadPrefix="properties"
          />
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        <div className="bg-white border border-line p-6 space-y-4">
          <h2 className="font-display text-lg text-ink">Settings</h2>

          <label className="flex items-center gap-2 text-sm text-ink">
            <input type="checkbox" checked={form.is_featured} onChange={(e) => handleChange("is_featured", e.target.checked)} className="accent-accent" />
            Featured
          </label>

          <label className="flex items-center gap-2 text-sm text-ink">
            <input type="checkbox" checked={form.is_investment} onChange={(e) => handleChange("is_investment", e.target.checked)} className="accent-accent" />
            Investment opportunity
          </label>

          {form.is_investment && (
            <div>
              <label className={labelClass}>Investment Note</label>
              <input
                className={inputClass}
                value={form.investment_note}
                onChange={(e) => handleChange("investment_note", e.target.value)}
                placeholder="e.g. Projected yield 12–15% p.a."
              />
            </div>
          )}

          <div>
            <label className={labelClass}>Agent</label>
            <select className={inputClass} value={form.agent_id} onChange={(e) => handleChange("agent_id", e.target.value)}>
              <option value="">None</option>
              {agents.map((agent) => (
                <option key={agent.id} value={agent.id}>{agent.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Listed by (Partner)</label>
            <select className={inputClass} value={form.partner_id} onChange={(e) => handleChange("partner_id", e.target.value)}>
              <option value="">RopeProperties</option>
              {partners.map((partner) => (
                <option key={partner.id} value={partner.id}>{partner.name}</option>
              ))}
            </select>
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-ink text-white py-2.5 text-sm font-medium hover:bg-accent transition-colors disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Listing"}
          </button>
          <Link href="/admin/listings" className="border border-line px-4 py-2.5 text-sm text-ink hover:border-accent transition-colors">
            Cancel
          </Link>
        </div>
      </div>
    </form>
  );
}