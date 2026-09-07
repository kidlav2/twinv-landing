import { closeSync, openSync, readSync } from "node:fs";
import path from "node:path";

/**
 * Pixel dimensions of a file in `public/`, read at build time.
 *
 * Every screenshot surface on a case page has the same problem to solve: the
 * shots are not one shape — 1.48 to 2.17 on this site, and a phone capture is
 * 0.46 — so any fixed frame either crops real interface (a CRM loses its
 * sidebar and its totals panel) or leaves a band of dead colour around the
 * picture. The gallery's band was literally `bg-carbon`, which is why it read
 * as black bars.
 *
 * Neither is necessary once the size is known before the browser has the
 * file: the frame takes the picture's shape instead of the picture taking the
 * frame's. Measuring has to happen here rather than from an `onload`, or the
 * page would resize under the reader.
 *
 * Server-only by construction (`node:fs`). Every caller is a route that
 * `generateStaticParams` prerenders, so this runs at build and never in a
 * request.
 */
export type PhotoSize = { w: number; h: number };

/** Header parsing rather than a dependency: two formats ship in `public/work`
 *  and both put their dimensions in the first few dozen bytes. */
function parse(buf: Buffer): PhotoSize | null {
  // PNG: 8-byte signature, then the IHDR chunk — width and height are the
  // first two big-endian uint32s of its data.
  if (buf.length > 24 && buf.readUInt32BE(0) === 0x89504e47) {
    const w = buf.readUInt32BE(16);
    const h = buf.readUInt32BE(20);
    return w && h ? { w, h } : null;
  }

  // JPEG: walk the marker chain to the start-of-frame, which is the only
  // segment that carries the size. Everything before it (EXIF, quantisation
  // tables, an embedded thumbnail) is skipped by its own length.
  if (buf.length > 4 && buf.readUInt16BE(0) === 0xffd8) {
    let i = 2;
    while (i + 9 < buf.length) {
      if (buf[i] !== 0xff) {
        i += 1;
        continue;
      }
      const marker = buf[i + 1];
      // SOF0-3, SOF5-7, SOF9-11, SOF13-15. The gaps are DHT, JPGA and DAC,
      // which share the 0xC0 range but are not frame headers.
      const isSOF =
        marker >= 0xc0 &&
        marker <= 0xcf &&
        marker !== 0xc4 &&
        marker !== 0xc8 &&
        marker !== 0xcc;
      if (isSOF) {
        const h = buf.readUInt16BE(i + 5);
        const w = buf.readUInt16BE(i + 7);
        return w && h ? { w, h } : null;
      }
      i += 2 + buf.readUInt16BE(i + 2);
    }
  }

  return null;
}

const cache = new Map<string, PhotoSize | null>();

/** `src` is a public path as authored in lib/content.ts (`/work/x/y.png`). */
export function photoSize(src: string): PhotoSize | undefined {
  if (!src) return undefined;
  if (!cache.has(src)) {
    let size: PhotoSize | null = null;
    try {
      const file = path.join(process.cwd(), "public", src.replace(/^\//, ""));
      // The header is all that is read: a 3840x2160 PNG is 850KB on disk and
      // none of it past the first chunk says anything about its size.
      const fd = openSync(file, "r");
      try {
        const head = Buffer.alloc(65536);
        const read = readSync(fd, head, 0, head.length, 0);
        size = parse(head.subarray(0, read));
      } finally {
        closeSync(fd);
      }
    } catch {
      size = null;
    }
    cache.set(src, size);
  }
  return cache.get(src) ?? undefined;
}

/**
 * Every picture a page can end up showing, measured up front and handed over
 * as one map: the hub swaps layers and the gallery swaps frames without a
 * request, so the sizes have to travel with the page rather than be fetched
 * when the picture changes. Unreadable files are simply absent, and every
 * consumer falls back to its fixed frame.
 */
export function photoSizes(sources: string[]): Record<string, PhotoSize> {
  const out: Record<string, PhotoSize> = {};
  for (const src of sources) {
    const size = photoSize(src);
    if (size) out[src] = size;
  }
  return out;
}
