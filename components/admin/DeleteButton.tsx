"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";

interface DeleteButtonProps {
  id: string;
  type: "property" | "opportunity" | "agent" | "partner" | "inquiry";
  title: string;
}

export function DeleteButton({ id, type, title }: DeleteButtonProps) {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const response = await fetch(`/api/admin/delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, type }),
      });

      if (response.ok) {
        window.location.reload();
      } else {
        alert("Failed to delete. Please try again.");
      }
    } catch {
      alert("An error occurred.");
    } finally {
      setDeleting(false);
    }
  };

  if (confirming) {
    return (
      <span className="inline-flex items-center gap-2">
        <span className="text-sm text-muted">
          Delete <span className="text-ink">{title}</span>?
        </span>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="text-sm text-red-600 hover:text-red-700"
        >
          {deleting ? "Deleting..." : "Confirm"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="text-sm text-muted hover:text-ink"
        >
          Cancel
        </button>
      </span>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="text-sm text-red-600 hover:text-red-700 inline-flex items-center gap-1"
    >
      <Trash2 size={14} />
      Delete
    </button>
  );
}