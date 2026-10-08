/**
 * Client-side helper for the admin upload flow. Posts a file to the
 * server-side /api/admin/upload route (which holds the Nhost admin
 * secret) and returns the resulting Nhost Storage file UUID.
 */
export async function uploadAdminFile(file: Blob): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/admin/upload", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const { error } = await response.json().catch(() => ({}));
    throw new Error(error ?? "Upload failed");
  }

  const { id } = await response.json();
  return id;
}
