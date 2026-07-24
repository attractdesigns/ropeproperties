"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ImageManager, type UploadedImage } from "@/components/admin/ImageManager";
import { slugify } from "@/lib/format";
import type { Agent } from "@/lib/types";

interface OpportunityFormProps {
  opportunity?: {
    id: string;
    title: string;
    slug: string;
    description: string;
    status: string;
    investment_type: string;
    city: string;
    neighbourhood: string | null;
    roi_range: string | null;
    min_entry: number | null;
    duration: string | null;
    map_embed_url: string | null;
    is_featured: boolean;
    agent_id: string | null;
  };
  images?: UploadedImage[];
  agents: Agent[];
}

const inputClass =
  "w-full border border-line px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none";
const labelClass = "block text-sm font-medium text-ink mb-1.5";

export function OpportunityForm({ opportunity, images: existingImages, agents }: OpportunityFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<UploadedImage[]>(existingImages ?? []);

  const [form, setForm] = useState({
    title: opportunity?.title ?? "",
    slug: opportunity?.slug ?? "",
    description: opportunity?.description ?? "",
    status: opportunity?.status ?? "draft",
    investment_type: opportunity?.investment_type ?? "off_plan",
    city: opportunity?.city ?? "",
    neighbourhood: opportunity?.neighbourhood ?? "",
    roi_range: opportunity?.roi_range ?? "",
    min_entry: opportunity?.min_entry?.toString() ?? "",
    duration: opportunity?.duration ?? "",
    map_embed_url: opportunity?.map_embed_url ?? "",
    is_featured: opportunity?.is_featured ?? false,
    agent_id: opportunity?.agent_id ?? "",
  });

  useEffect(() => {
    if (!opportunity && form.title && !form.slug) {
      setForm((f) => ({ ...f, slug: slugify(f.title) }));
    }
  }, [form.title, form.slug, opportunity]);

  const handleChange = (field: string, value: string | boolean) => {
    setForm((f) => ({ ...f, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const payload = {
        id: opportunity?.id,
        title: form.title,
        slug: form.slug,
        description: form.description,
        status: form.status,
        investment_type: form.investment_type,
        city: form.city,
        neighbourhood: form.neighbourhood || null,
        roi_range: form.roi_range || null,
        min_entry: form.min_entry ? parseFloat(form.min_entry) : null,
        duration: form.duration || null,
        map_embed_url: form.map_embed_url || null,
        is_featured: form.is_featured,
        agent_id: form.agent_id || null,
        images,
      };

      const response = await fetch("/api/admin/save-opportunity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error ?? "Failed to save");
      }

      router.push("/admin/investments");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white border border-line p-6 space-y-4">
          <h2 className="font-display text-lg text-ink">Details</h2>

          <div>
            <label className={labelClass}>Title *</label>
            <input className={inputClass} value={form.title} onChange={(e) => handleChange("title", e.target.value)} required />
          </div>

          <div>
            <label className={labelClass}>Slug *</label>
            <input className={inputClass} value={form.slug} onChange={(e) => handleChange("slug", e.target.value)} required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Type *</label>
              <select className={inputClass} value={form.investment_type} onChange={(e) => handleChange("investment_type", e.target.value)}>
                <option value="off_plan">Off-Plan</option>
                <option value="land_banking">Land Banking</option>
                <option value="buy_to_let">Buy-to-Let</option>
                <option value="development">Development</option>
                <option value="flip">Flip</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Status *</label>
              <select className={inputClass} value={form.status} onChange={(e) => handleChange("status", e.target.value)}>
                <option value="draft">Draft</option>
                <option value="open">Open</option>
                <option value="closing_soon">Closing Soon</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>City *</label>
              <input className={inputClass} value={form.city} onChange={(e) => handleChange("city", e.target.value)} required />
            </div>
            <div>
              <label className={labelClass}>Neighbourhood</label>
              <input className={inputClass} value={form.neighbourhood} onChange={(e) => handleChange("neighbourhood", e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>ROI Range</label>
              <input className={inputClass} value={form.roi_range} onChange={(e) => handleChange("roi_range", e.target.value)} placeholder="e.g. 15–20% p.a. projected" />
            </div>
            <div>
              <label className={labelClass}>Min Entry (NGN)</label>
              <input className={inputClass} type="number" value={form.min_entry} onChange={(e) => handleChange("min_entry", e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Duration</label>
              <input className={inputClass} value={form.duration} onChange={(e) => handleChange("duration", e.target.value)} placeholder="e.g. 18–24 months" />
            </div>
            <div>
              <label className={labelClass}>Map Embed URL</label>
              <input className={inputClass} value={form.map_embed_url} onChange={(e) => handleChange("map_embed_url", e.target.value)} />
            </div>
          </div>

          <div>
            <label className={labelClass}>Description</label>
            <textarea className={inputClass} rows={5} value={form.description} onChange={(e) => handleChange("description", e.target.value)} />
          </div>
        </div>

        <div className="bg-white border border-line p-6">
          <ImageManager images={images} onChange={setImages} uploadPrefix="investments" />
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-white border border-line p-6 space-y-4">
          <h2 className="font-display text-lg text-ink">Settings</h2>

          <label className="flex items-center gap-2 text-sm text-ink">
            <input type="checkbox" checked={form.is_featured} onChange={(e) => handleChange("is_featured", e.target.checked)} className="accent-accent" />
            Featured
          </label>

          <div>
            <label className={labelClass}>Agent</label>
            <select className={inputClass} value={form.agent_id} onChange={(e) => handleChange("agent_id", e.target.value)}>
              <option value="">None</option>
              {agents.map((agent) => (
                <option key={agent.id} value={agent.id}>{agent.name}</option>
              ))}
            </select>
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="flex-1 bg-ink text-white py-2.5 text-sm font-medium hover:bg-accent transition-colors disabled:opacity-50">
            {saving ? "Saving..." : "Save Opportunity"}
          </button>
          <Link href="/admin/investments" className="border border-line px-4 py-2.5 text-sm text-ink hover:border-accent transition-colors">
            Cancel
          </Link>
        </div>
      </div>
    </form>
  );
}