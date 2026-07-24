"use client";

import { useState, useCallback, useRef } from "react";
import { Upload } from "lucide-react";

export function PartnerForm() {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logoPath, setLogoPath] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const inputClass =
    "w-full border border-line px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none";
  const labelClass = "block text-sm font-medium text-ink mb-1.5";

  const handleLogoUpload = useCallback(async (file: File) => {
    const path = `partners/${Date.now()}-${Math.random().toString(36).slice(2)}-${file.name}`;
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    const { error } = await supabase.storage
      .from("property-images")
      .upload(path, file, { contentType: file.type });
    if (!error) setLogoPath(path);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name"),
      website_url: formData.get("website_url") || null,
      description: formData.get("description") || null,
      logo_path: logoPath,
      sort_order: 0,
      is_active: true,
    };

    try {
      const response = await fetch("/api/admin/save-partner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Failed to save");

      window.location.reload();
    } catch {
      setError("Failed to save partner.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
      <div>
        <label className={labelClass}>Name *</label>
        <input name="name" className={inputClass} required />
      </div>
      <div>
        <label className={labelClass}>Website URL</label>
        <input name="website_url" className={inputClass} placeholder="https://..." />
      </div>
      <div className="md:col-span-2">
        <label className={labelClass}>Description</label>
        <input name="description" className={inputClass} placeholder="One-liner about the partner" />
      </div>
      <div>
        <label className={labelClass}>Logo</label>
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border border-dashed border-line p-3 text-center cursor-pointer hover:border-accent text-sm text-muted"
        >
          {logoPath ? "✓ Uploaded" : (
            <span className="flex items-center gap-1">
              <Upload size={14} /> Upload logo
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
      {error && <p className="text-sm text-red-600 md:col-span-2">{error}</p>}
      <div className="md:col-span-2">
        <button
          type="submit"
          disabled={saving}
          className="bg-ink text-white px-4 py-2 text-sm font-medium hover:bg-accent transition-colors disabled:opacity-50"
        >
          {saving ? "Saving..." : "Add Partner"}
        </button>
      </div>
    </form>
  );
}