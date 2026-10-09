/**
 * Read an image's pixel size from its first bytes (PNG, JPEG, WebP, GIF)
 * without downloading the whole file. Used on the server so galleries know
 * whether they hold portrait flyers *before* paint, which avoids a layout
 * shift when the frame switches from landscape to portrait.
 *
 * Returns null on any failure — callers fall back to client-side detection.
 */
import { getStorageUrl } from "@/lib/storage";

export type ImageSize = { width: number; height: number };

export async function getImageSize(url: string | null): Promise<ImageSize | null> {
  if (!url) return null;
  try {
    const res = await fetch(url, {
      headers: { Range: "bytes=0-65535" },
      next: { revalidate: 86400 },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return null;
    return parseSize(new Uint8Array(await res.arrayBuffer()));
  } catch {
    return null;
  }
}

function parseSize(b: Uint8Array): ImageSize | null {
  const u16be = (i: number) => (b[i] << 8) | b[i + 1];
  const u32be = (i: number) => ((b[i] << 24) | (b[i + 1] << 16) | (b[i + 2] << 8) | b[i + 3]) >>> 0;
  const u16le = (i: number) => b[i] | (b[i + 1] << 8);
  const ascii = (i: number, n: number) => String.fromCharCode(...b.slice(i, i + n));

  // PNG
  if (b.length > 24 && b[0] === 0x89 && ascii(1, 3) === "PNG") {
    return { width: u32be(16), height: u32be(20) };
  }
  // GIF
  if (b.length > 10 && ascii(0, 3) === "GIF") {
    return { width: u16le(6), height: u16le(8) };
  }
  // JPEG — walk segments until a start-of-frame marker
  if (b.length > 4 && b[0] === 0xff && b[1] === 0xd8) {
    let i = 2;
    while (i + 9 < b.length) {
      if (b[i] !== 0xff) { i++; continue; }
      const marker = b[i + 1];
      if (marker === 0xff) { i++; continue; }
      if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
        return { width: u16be(i + 7), height: u16be(i + 5) };
      }
      i += 2 + u16be(i + 2);
    }
    return null;
  }
  // WebP
  if (b.length > 30 && ascii(0, 4) === "RIFF" && ascii(8, 4) === "WEBP") {
    const kind = ascii(12, 4);
    if (kind === "VP8X") {
      return { width: 1 + (b[24] | (b[25] << 8) | (b[26] << 16)), height: 1 + (b[27] | (b[28] << 8) | (b[29] << 16)) };
    }
    if (kind === "VP8L") {
      const bits = b[21] | (b[22] << 8) | (b[23] << 16) | (b[24] << 24);
      return { width: 1 + (bits & 0x3fff), height: 1 + ((bits >> 14) & 0x3fff) };
    }
    if (kind === "VP8 ") {
      return { width: u16le(26) & 0x3fff, height: u16le(28) & 0x3fff };
    }
  }
  return null;
}

/**
 * Attach server-measured pixel sizes to gallery images. Never throws: images
 * whose size can't be read simply come back without one.
 */
export async function withImageSizes<T extends { storage_path: string }>(
  images: T[]
): Promise<(T & { width?: number | null; height?: number | null })[]> {
  return Promise.all(
    images.map(async (image) => {
      const size = await getImageSize(getStorageUrl(image.storage_path));
      return { ...image, width: size?.width ?? null, height: size?.height ?? null };
    })
  );
}
