"use client";

import { useState, useCallback, useRef } from "react";
import Image from "next/image";
import { Upload } from "lucide-react";
import { getStorageUrl } from "@/lib/storage";
import type { SiteSettings } from "@/lib/types";

interface SiteSettingsFormProps {
  settings: SiteSettings | null;
  defaults: { heading: string; subheading: string };
}

export function SiteSettingsForm({ settings, defaults }: SiteSettingsFormProps) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [uploading, setUploading] = useState(false);
  // Seed from the stored value so saving without re-uploading keeps the image.
  const [heroPath, setHeroPath] = useState<string | null>(
    settings?.hero_image_path ?? null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const inputClass =
    "w-full border border-line px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none";
  const labelClass = "block text-sm font-medium text-ink mb-1.5";

  const previewUrl = getStorageUrl(heroPath);

  const handleUpload = useCallback(async (file: File) => {
    setUploading(true);
    setError(null);
    const path = `site/${Date.now()}-${Math.random().toString(36).slice(2)}-${file.name}`;
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    const { error } = await supabase.storage
      .from("property-images")
      .upload(path, file, { contentType: file.type });
    if (error) {
      setError("Image upload failed. Please try again.");
    } else {
      setHeroPath(path);
    }
    setUploading(false);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const data = {
      hero_image_path: heroPath,
      hero_heading: formData.get("hero_heading") || null,
      hero_subheading: formData.get("hero_subheading") || null,
    };

    try {
      const response = await fetch("/api/admin/save-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const { error: serverError } = await response.json().catch(() => ({}));
        throw new Error(serverError ?? "Failed to save");
      }

      setSuccess(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Hero image */}
      <div>
        <label className={labelClass}>Hero image</label>
        <div className="relative w-full aspect-[21/9] bg-surface border border-line overflow-hidden">
          {previewUrl ? (
            <Image
              src={previewUrl}
              alt="Hero preview"
              fill
              sizes="(max-width: 768px) 100vw, 700px"
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-sm text-muted">
              No hero image set — a placeholder is shown on the site
            </div>
          )}
          {/* Mirrors the gradient + white heading used on the live homepage, so
              you can tell whether the text will still be readable. */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/40" />
          <div className="absolute inset-0 flex items-center justify-center px-4">
            <p className="font-display text-white text-xl md:text-2xl text-center">
              {settings?.hero_heading?.trim() || defaults.heading}
            </p>
          </div>
        </div>
        <div
          onClick={() => fileInputRef.current?.click()}
          className="mt-2 border border-dashed border-line p-3 text-center cursor-pointer hover:border-accent text-sm text-muted"
        >
          {uploading ? (
            "Uploading..."
          ) : (
            <span className="flex items-center justify-center gap-1">
              <Upload size={14} /> {previewUrl ? "Replace hero image" : "Upload hero image"}
            </span>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
          />
        </div>
        <p className="text-xs text-muted mt-1">
          Use a wide landscape photo, at least 1920×1080. It fills the whole screen,
          and the headline sits on top in white — avoid very dark or busy images.
        </p>
      </div>

      {/* Copy */}
      <div>
        <label className={labelClass}>Headline</label>
        <input
          name="hero_heading"
          defaultValue={settings?.hero_heading ?? ""}
          placeholder={defaults.heading}
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Subheading</label>
        <input
          name="hero_subheading"
          defaultValue={settings?.hero_subheading ?? ""}
          placeholder={defaults.subheading}
          className={inputClass}
        />
        <p className="text-xs text-muted mt-1">
          Leave either field empty to fall back to the default wording shown in grey.
        </p>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && (
        <p className="text-sm text-accent">
          Saved. Reload the homepage to see the change.
        </p>
      )}

      <button
        type="submit"
        disabled={saving || uploading}
        className="bg-ink text-white px-4 py-2 text-sm font-medium hover:bg-accent transition-colors disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save settings"}
      </button>
    </form>
  );
}
