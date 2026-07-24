"use client";

import { useState, useCallback, useRef } from "react";
import Image from "next/image";
import { Upload, X, GripVertical } from "lucide-react";

export interface UploadedImage {
  id?: string;
  storage_path: string;
  sort_order: number;
  alt: string | null;
  isNew?: boolean;
}

interface ImageManagerProps {
  images: UploadedImage[];
  onChange: (images: UploadedImage[]) => void;
  uploadPrefix: string; // e.g. "properties" or "investments"
}

export function ImageManager({ images, onChange, uploadPrefix }: ImageManagerProps) {
  const [uploading, setUploading] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(async (files: FileList) => {
    setUploading(true);
    const newImages: UploadedImage[] = [];

    for (const file of Array.from(files)) {
      // Compress/resize client-side
      const resized = await resizeImage(file, 1920);
      const path = `${uploadPrefix}/${Date.now()}-${Math.random().toString(36).slice(2)}-${file.name}`;

      // Upload to Supabase Storage
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();

      const { error } = await supabase.storage
        .from("property-images")
        .upload(path, resized, { contentType: file.type });

      if (!error) {
        newImages.push({
          storage_path: path,
          sort_order: images.length + newImages.length,
          alt: null,
          isNew: true,
        });
      }
    }

    onChange([...images, ...newImages]);
    setUploading(false);
  }, [images, onChange, uploadPrefix]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const removeImage = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    // Reindex sort_order
    updated.forEach((img, i) => (img.sort_order = i));
    onChange(updated);
  };

  const handleDragStart = (index: number) => setDraggedIndex(index);
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    const updated = [...images];
    const [moved] = updated.splice(draggedIndex, 1);
    updated.splice(index, 0, moved);
    updated.forEach((img, i) => (img.sort_order = i));
    onChange(updated);
    setDraggedIndex(index);
  };

  const getThumbUrl = (path: string) => {
    if (path.startsWith("http")) return path;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    return `${supabaseUrl}/storage/v1/object/public/property-images/${path}`;
  };

  return (
    <div>
      <label className="block text-sm font-medium text-ink mb-2">Images</label>

      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-line p-8 text-center cursor-pointer hover:border-accent transition-colors"
      >
        <Upload size={24} className="mx-auto text-muted mb-2" />
        <p className="text-sm text-muted">
          {uploading ? "Uploading..." : "Drag & drop images here, or click to select"}
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
      </div>

      {/* Thumbnails */}
      {images.length > 0 && (
        <div className="mt-4 grid grid-cols-4 gap-3">
          {images.map((image, index) => (
            <div
              key={index}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              className="relative group border border-line bg-surface"
            >
              <div className="relative aspect-square">
                <Image
                  src={getThumbUrl(image.storage_path)}
                  alt={image.alt ?? ""}
                  fill
                  sizes="100px"
                  className="object-cover"
                />
              </div>
              {index === 0 && (
                <span className="absolute top-1 left-1 bg-accent text-white text-xs px-1.5 py-0.5">
                  Cover
                </span>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeImage(index);
                }}
                className="absolute top-1 right-1 bg-white/90 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={12} className="text-red-600" />
              </button>
              <div className="absolute bottom-1 left-1 bg-white/90 p-0.5 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab">
                <GripVertical size={12} className="text-muted" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

async function resizeImage(file: File, maxWidth: number): Promise<Blob> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ratio = Math.min(1, maxWidth / img.width);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => resolve(blob ?? file), "image/jpeg", 0.85);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}