"use client";

import { useState, useCallback, useRef } from "react";
import Image from "next/image";
import { Upload } from "lucide-react";
import { getStorageUrl } from "@/lib/storage";
import type { Agent } from "@/lib/types";

interface AgentFormProps {
  /** Present in edit mode; omit to add a new agent. */
  agent?: Agent;
}

export function AgentForm({ agent }: AgentFormProps) {
  const isEdit = Boolean(agent);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  // Seed with the existing photo so saving without re-uploading doesn't wipe it.
  const [photoPath, setPhotoPath] = useState<string | null>(agent?.photo_path ?? null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const inputClass =
    "w-full border border-line px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none";
  const labelClass = "block text-sm font-medium text-ink mb-1.5";

  const previewUrl = getStorageUrl(photoPath);

  const handlePhotoUpload = useCallback(async (file: File) => {
    setUploadingPhoto(true);
    setError(null);
    const path = `agents/${Date.now()}-${Math.random().toString(36).slice(2)}-${file.name}`;
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    const { error } = await supabase.storage
      .from("property-images")
      .upload(path, file, { contentType: file.type });
    if (error) {
      setError("Photo upload failed. Please try again.");
    } else {
      setPhotoPath(path);
    }
    setUploadingPhoto(false);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const data = {
      id: agent?.id,
      name: formData.get("name"),
      role: formData.get("role") || "Agent",
      phone: formData.get("phone") || null,
      whatsapp: formData.get("whatsapp") || null,
      email: formData.get("email") || null,
      bio: formData.get("bio") || null,
      photo_path: photoPath,
      sort_order: Number(formData.get("sort_order") ?? 0),
      is_active: formData.get("is_active") === "on",
      is_primary: formData.get("is_primary") === "on",
    };

    try {
      const response = await fetch("/api/admin/save-agent", {
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
        window.location.href = "/admin/agents";
      } else {
        window.location.reload();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save agent.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
      <div>
        <label className={labelClass}>Name *</label>
        <input name="name" defaultValue={agent?.name} className={inputClass} required />
      </div>
      <div>
        <label className={labelClass}>Role</label>
        <input
          name="role"
          defaultValue={agent?.role}
          className={inputClass}
          placeholder="Realtor"
        />
        <p className="text-xs text-muted mt-1">
          Shown above the name on the About page.
        </p>
      </div>
      <div>
        <label className={labelClass}>Phone</label>
        <input name="phone" defaultValue={agent?.phone ?? ""} className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>WhatsApp</label>
        <input
          name="whatsapp"
          defaultValue={agent?.whatsapp ?? ""}
          className={inputClass}
          placeholder="234..."
        />
      </div>
      <div>
        <label className={labelClass}>Email</label>
        <input
          name="email"
          type="email"
          defaultValue={agent?.email ?? ""}
          className={inputClass}
        />
      </div>

      {/* Photo */}
      <div>
        <label className={labelClass}>Photo</label>
        <div className="flex items-center gap-3">
          <div className="relative w-16 h-16 shrink-0 bg-surface border border-line overflow-hidden">
            {previewUrl ? (
              <Image
                src={previewUrl}
                alt="Current photo"
                fill
                sizes="64px"
                className="object-cover"
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
            {uploadingPhoto ? (
              "Uploading..."
            ) : (
              <span className="flex items-center justify-center gap-1">
                <Upload size={14} /> {previewUrl ? "Replace photo" : "Upload photo"}
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
        <p className="text-xs text-muted mt-1">
          A portrait works best — it&apos;s shown tall on the About page.
        </p>
      </div>

      {/* Bio / story */}
      <div className="md:col-span-2">
        <label className={labelClass}>Bio / story</label>
        <textarea
          name="bio"
          rows={8}
          defaultValue={agent?.bio ?? ""}
          className={inputClass}
          placeholder={"Write in your own voice.\n\nLeave a blank line between paragraphs."}
        />
        <p className="text-xs text-muted mt-1">
          For the primary realtor this is the story on the About page. Leave a blank
          line between paragraphs; they&apos;ll render as separate paragraphs.
        </p>
      </div>

      <div>
        <label className={labelClass}>Sort order</label>
        <input
          name="sort_order"
          type="number"
          defaultValue={agent?.sort_order ?? 0}
          className={inputClass}
        />
      </div>
      <div className="flex items-end pb-2">
        <label className="flex items-center gap-2 text-sm text-ink">
          <input
            type="checkbox"
            name="is_active"
            defaultChecked={agent?.is_active ?? true}
            className="accent-accent"
          />
          Active (visible on the site)
        </label>
      </div>

      <div className="md:col-span-2 border border-line bg-surface p-3">
        <label className="flex items-start gap-2 text-sm text-ink">
          <input
            type="checkbox"
            name="is_primary"
            defaultChecked={agent?.is_primary ?? false}
            className="accent-accent mt-0.5"
          />
          <span>
            Primary realtor
            <span className="block text-xs text-muted mt-0.5">
              The face of the site. Their photo and story fill the About page, and they
              appear on every listing that has no specific agent assigned. Only one
              person can hold this — ticking it moves it from whoever has it now.
            </span>
          </span>
        </label>
      </div>

      {error && <p className="text-sm text-red-600 md:col-span-2">{error}</p>}
      {success && <p className="text-sm text-accent md:col-span-2">Saved.</p>}
      <div className="md:col-span-2 flex items-center gap-3">
        <button
          type="submit"
          disabled={saving || uploadingPhoto}
          className="bg-ink text-white px-4 py-2 text-sm font-medium hover:bg-accent transition-colors disabled:opacity-50"
        >
          {saving ? "Saving..." : isEdit ? "Save changes" : "Add Agent"}
        </button>
        {isEdit && (
          <a href="/admin/agents" className="text-sm text-muted hover:text-ink">
            Cancel
          </a>
        )}
      </div>
    </form>
  );
}
