"use client";

import { useState } from "react";

interface InquiryReadToggleProps {
  id: string;
  isRead: boolean;
}

export function InquiryReadToggle({ id, isRead }: InquiryReadToggleProps) {
  const [read, setRead] = useState(isRead);

  const toggle = async () => {
    const newRead = !read;
    setRead(newRead);
    try {
      await fetch("/api/admin/update-inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, is_read: newRead }),
      });
    } catch {
      setRead(!newRead);
    }
  };

  return (
    <button
      onClick={toggle}
      className={`text-xs px-2 py-1 ${read ? "text-muted" : "text-accent"}`}
    >
      {read ? "○ Read" : "● Unread"}
    </button>
  );
}