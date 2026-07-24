"use client";

import { useState, useCallback, useRef } from "react";
import { Upload } from "lucide-react";

export function AgentForm() {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [photoPath, setPhotoPath] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const inputClass =
    "w-full border border-line px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none";
  const labelClass = "block text-sm font-medium text-ink mb-1.5";

  const handlePhotoUpload = useCallback(async (file: File) => {
    const path = `agents/${Date.now()}-${Math.random().toString(36).slice(2)}-${file.name}`;
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    const { error } = await supabase.storage
      .from("property-images")
      .upload(path, file, { contentType: file.type });
    if (!error) setPhotoPath(path);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name"),
      role: formData.get("role") || "Agent",
      phone: formData.get("phone") || null,
      whatsapp: formData.get("whatsapp") || null,
      email: formData.get("email") || null,
      bio: formData.get("bio") || null,
      photo_path: photoPath,
      sort_order: 0,
      is_active: true,
      is_primary: formData.get("is_primary") === "on",
    };

    try {
      const response = await fetch("/api/admin/save-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Failed to save");

      setSuccess(true);
      window.location.reload();
    } catch {
      setError("Failed to save agent.");
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
        <label className={labelClass}>Role</label>
        <input name="role" className={inputClass} placeholder="Agent" />
      </div>
      <div>
        <label className={labelClass}>Phone</label>
        <input name="phone" className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>WhatsApp</label>
        <input name="whatsapp" className={inputClass} placeholder="234..." />
      </div>
      <div>
        <label className={labelClass}>Email</label>
        <input name="email" type="email" className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>Photo</label>
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border border-dashed border-line p-3 text-center cursor-pointer hover:border-accent text-sm text-muted"
        >
          {photoPath ? "✓ Uploaded" : (
            <span className="flex items-center gap-1">
              <Upload size={14} /> Upload photo
            </span>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handlePhotoUpload(e.target.files[0])}
          />
        </div>
      </div>
      <div className="md:col-span-2">
        <label className={labelClass}>Bio</label>
        <textarea name="bio" rows={2} className={inputClass} />
      </div>
      <div className="md:col-span-2 border border-line bg-surface p-3">
        <label className="flex items-start gap-2 text-sm text-ink">
          <input
            type="checkbox"
            name="is_primary"
            className="accent-accent mt-0.5"
          />
          <span>
            Primary realtor
            <span className="block text-xs text-muted mt-0.5">
              The face of the site. Shown on the About page and on every listing that
              has no specific agent assigned. Only one person can hold this — ticking it
              moves it from whoever has it now.
            </span>
          </span>
        </label>
      </div>
      {error && <p className="text-sm text-red-600 md:col-span-2">{error}</p>}
      {success && <p className="text-sm text-accent md:col-span-2">Agent saved!</p>}
      <div className="md:col-span-2">
        <button
          type="submit"
          disabled={saving}
          className="bg-ink text-white px-4 py-2 text-sm font-medium hover:bg-accent transition-colors disabled:opacity-50"
        >
          {saving ? "Saving..." : "Add Agent"}
        </button>
      </div>
    </form>
  );
}