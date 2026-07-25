"use client";

import { useState, useCallback, useRef } from "react";
import Image from "next/image";
import { Upload } from "lucide-react";
import { getStorageUrl } from "@/lib/storage";
import type { PartnerCompany } from "@/lib/types";

interface PartnerFormProps {
  /** Present in edit mode; omit to add a new partner. */
  partner?: PartnerCompany;
}

export function PartnerForm({ partner }: PartnerFormProps) {
  const isEdit = Boolean(partner);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  // Seed with the existing logo so saving without re-uploading doesn't wipe it.
  const [logoPath, setLogoPath] = useState<string | null>(partner?.logo_path ?? null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const inputClass =
    "w-full border border-line px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none";
  const labelClass = "block text-sm font-medium text-ink mb-1.5";

  const previewUrl = getStorageUrl(logoPath);

  const handleLogoUpload = useCallback(async (file: File) => {
    setUploadingLogo(true);
    setError(null);
    const path = `partners/${Date.now()}-${Math.random().toString(36).slice(2)}-${file.name}`;
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    const { error } = await supabase.storage
      .from("property-images")
      .upload(path, file, { contentType: file.type });
    if (error) {
      setError("Logo upload failed. Please try again.");
    } else {
      setLogoPath(path);
    }
    setUploadingLogo(false);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const data = {
      id: partner?.id,
      name: formData.get("name"),
      website_url: formData.get("website_url") || null,
      description: formData.get("description") || null,
      logo_path: logoPath,
      sort_order: Number(formData.get("sort_order") ?? 0),
      is_active: formData.get("is_active") === "on",
    };

    try {
      const response = await fetch("/api/admin/save-partner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const { error: serverError } = await response.json().catch(() => ({}));
        throw new Error(serverError ?? "Failed to save");
      }

      setSuccess(true);
      if (isEdit) {
        window.location.href = "/admin/partners";
      } else {
        window.location.reload();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save partner.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
      <div>
        <label className={labelClass}>Name *</label>
        <input name="name" defaultValue={partner?.name} className={inputClass} required />
      </div>
      <div>
        <label className={labelClass}>Website URL</label>
        <input
          name="website_url"
          defaultValue={partner?.website_url ?? ""}
          className={inputClass}
          placeholder="https://..."
        />
      </div>
      <div className="md:col-span-2">
        <label className={labelClass}>Description</label>
        <input
          name="description"
          defaultValue={partner?.description ?? ""}
          className={inputClass}
          placeholder="One-liner about the partner"
        />
      </div>
      <div>
        <label className={labelClass}>Logo</label>
        <div className="flex items-center gap-3">
          <div className="relative w-16 h-10 shrink-0 bg-surface border border-line overflow-hidden">
            {previewUrl ? (
              <Image
                src={previewUrl}
                alt="Current logo"
                fill
                sizes="64px"
                className="object-contain"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted text-xs">
                None
              </div>
            )}
          </div>
          <div
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 border border-dashed border-line p-3 text-center cursor-pointer hover:border-accent text-sm text-muted"
          >
            {uploadingLogo ? (
              "Uploading..."
            ) : (
              <span className="flex items-center justify-center gap-1">
                <Upload size={14} /> {previewUrl ? "Replace logo" : "Upload logo"}
              </span>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleLogoUpload(e.target.files[0])}
            />
          </div>
        </div>
      </div>
      <div>
        <label className={labelClass}>Sort order</label>
        <input
          name="sort_order"
          type="number"
          defaultValue={partner?.sort_order ?? 0}
          className={inputClass}
        />
      </div>
      <div className="flex items-end pb-2">
        <label className="flex items-center gap-2 text-sm text-ink">
          <input
            type="checkbox"
            name="is_active"
            defaultChecked={partner?.is_active ?? true}
            className="accent-accent"
          />
          Active (visible on the site)
        </label>
      </div>
      {error && <p className="text-sm text-red-600 md:col-span-2">{error}</p>}
      {success && <p className="text-sm text-accent md:col-span-2">Saved.</p>}
      <div className="md:col-span-2 flex items-center gap-3">
        <button
          type="submit"
          disabled={saving || uploadingLogo}
          className="bg-ink text-white px-4 py-2 text-sm font-medium hover:bg-accent transition-colors disabled:opacity-50"
        >
          {saving ? "Saving..." : isEdit ? "Save changes" : "Add Partner"}
        </button>
        {isEdit && (
          <a href="/admin/partners" className="text-sm text-muted hover:text-ink">
            Cancel
          </a>
        )}
      </div>
    </form>
  );
}