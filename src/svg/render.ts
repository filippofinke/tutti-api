// Minimal, dependency-free SVG → PNG rasterizer. Supports ONLY what the tutti
// Auth0 captcha uses: <path> elements with absolute M/L/H/V/C/Q/Z commands,
// solid `fill` (or fill="none"), and thin `stroke`. Not a general SVG renderer.

interface Point {
  x: number;
  y: number;
}
interface SubPath {
  points: Point[];
  closed: boolean;
}
type RGB = [number, number, number];

const CURVE_STEPS = 18;
const INK: RGB = [0, 0, 0]; // everything renders black-on-white (monochrome)

// ---- path parsing + flattening ------------------------------------------------

function flattenPath(d: string): SubPath[] {
  const tokens = d.match(/[a-zA-Z]|-?\d*\.?\d+(?:[eE][+-]?\d+)?/g) ?? [];
  const subs: SubPath[] = [];
  let cur: Point[] | null = null;
  let cmd = "";
  let cx = 0;
  let cy = 0;
  let sx = 0;
  let sy = 0;
  let i = 0;
  const num = () => Number.parseFloat(tokens[i++]);

  const cubic = (
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    x: number,
    y: number,
  ) => {
    for (let s = 1; s <= CURVE_STEPS; s++) {
      const t = s / CURVE_STEPS;
      const u = 1 - t;
      const px =
        u * u * u * cx +
        3 * u * u * t * x1 +
        3 * u * t * t * x2 +
        t * t * t * x;
      const py =
        u * u * u * cy +
        3 * u * u * t * y1 +
        3 * u * t * t * y2 +
        t * t * t * y;
      cur?.push({ x: px, y: py });
    }
    cx = x;
    cy = y;
  };
  const quad = (x1: number, y1: number, x: number, y: number) => {
    for (let s = 1; s <= CURVE_STEPS; s++) {
      const t = s / CURVE_STEPS;
      const u = 1 - t;
      const px = u * u * cx + 2 * u * t * x1 + t * t * x;
      const py = u * u * cy + 2 * u * t * y1 + t * t * y;
      cur?.push({ x: px, y: py });
    }
    cx = x;
    cy = y;
  };

  while (i < tokens.length) {
    if (/[a-zA-Z]/.test(tokens[i])) cmd = tokens[i++];
    const rel = cmd >= "a";
    const c = cmd.toUpperCase();

    if (c === "Z") {
      if (cur) {
        cur.push({ x: sx, y: sy });
        subs.push({ points: cur, closed: true });
        cur = null;
      }
      cx = sx;
      cy = sy;
      continue;
    }
    if (c === "M") {
      let x = num();
      let y = num();
      if (rel) {
        x += cx;
        y += cy;
      }
      if (cur && cur.length) subs.push({ points: cur, closed: false });
      cur = [{ x, y }];
      cx = x;
      cy = y;
      sx = x;
      sy = y;
      cmd = rel ? "l" : "L"; // subsequent coords are implicit line-tos
      continue;
    }
    if (!cur) cur = [{ x: cx, y: cy }];
    if (c === "L") {
      let x = num();
      let y = num();
      if (rel) {
        x += cx;
        y += cy;
      }
      cur.push({ x, y });
      cx = x;
      cy = y;
    } else if (c === "H") {
      let x = num();
      if (rel) x += cx;
      cur.push({ x, y: cy });
      cx = x;
    } else if (c === "V") {
      let y = num();
      if (rel) y += cy;
      cur.push({ x: cx, y });
      cy = y;
    } else if (c === "C") {
      let x1 = num();
      let y1 = num();
      let x2 = num();
      let y2 = num();
      let x = num();
      let y = num();
      if (rel) {
        x1 += cx;
        y1 += cy;
        x2 += cx;
        y2 += cy;
        x += cx;
        y += cy;
      }
      cubic(x1, y1, x2, y2, x, y);
    } else if (c === "Q") {
      let x1 = num();
      let y1 = num();
      let x = num();
      let y = num();
      if (rel) {
        x1 += cx;
        y1 += cy;
        x += cx;
        y += cy;
      }
      quad(x1, y1, x, y);
    } else {
      // Unsupported command — stop to avoid desyncing on garbage.
      break;
    }
  }
  if (cur && cur.length) subs.push({ points: cur, closed: false });
  return subs;
}

// ---- raster buffer ------------------------------------------------------------

class Raster {
  readonly buf: Uint8Array;
  constructor(
    readonly w: number,
    readonly h: number,
  ) {
    this.buf = new Uint8Array(w * h * 4).fill(255); // opaque white
  }

  set(x: number, y: number, [r, g, b]: RGB): void {
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return;
    const i = (y * this.w + x) * 4;
    this.buf[i] = r;
    this.buf[i + 1] = g;
    this.buf[i + 2] = b;
    this.buf[i + 3] = 255;
  }

  // Nonzero-winding scanline fill of (implicitly closed) subpaths.
  fill(subs: SubPath[], color: RGB): void {
    const edges: Array<[number, number, number, number]> = [];
    for (const sub of subs) {
      const p = sub.points;
      for (let k = 0; k < p.length - 1; k++) {
        edges.push([p[k].x, p[k].y, p[k + 1].x, p[k + 1].y]);
      }
      const last = p[p.length - 1];
      if (last && (last.x !== p[0].x || last.y !== p[0].y)) {
        edges.push([last.x, last.y, p[0].x, p[0].y]);
      }
    }
    for (let y = 0; y < this.h; y++) {
      const yc = y + 0.5;
      const xs: Array<[number, number]> = [];
      for (const [ax, ay, bx, by] of edges) {
        if ((ay <= yc && by > yc) || (by <= yc && ay > yc)) {
          const x = ax + ((yc - ay) / (by - ay)) * (bx - ax);
          xs.push([x, by > ay ? 1 : -1]);
        }
      }
      xs.sort((a, b) => a[0] - b[0]);
      let wind = 0;
      for (let k = 0; k < xs.length - 1; k++) {
        wind += xs[k][1];
        if (wind !== 0) {
          const x0 = Math.round(xs[k][0]);
          const x1 = Math.round(xs[k + 1][0]);
          for (let x = x0; x < x1; x++) this.set(x, y, color);
        }
      }
    }
  }

  stroke(subs: SubPath[], color: RGB, width: number): void {
    const r = Math.max(width / 2, 0.6);
    for (const sub of subs) {
      const p = sub.points;
      for (let k = 0; k < p.length - 1; k++)
        this.segment(p[k], p[k + 1], r, color);
      if (sub.closed && p.length > 1)
        this.segment(p[p.length - 1], p[0], r, color);
    }
  }

  private segment(a: Point, b: Point, r: number, color: RGB): void {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const steps = Math.max(1, Math.ceil(Math.hypot(dx, dy)));
    for (let s = 0; s <= steps; s++) {
      const t = s / steps;
      this.disc(a.x + dx * t, a.y + dy * t, r, color);
    }
  }

  private disc(cx: number, cy: number, r: number, color: RGB): void {
    const r2 = r * r;
    for (let y = Math.floor(cy - r); y <= Math.ceil(cy + r); y++) {
      for (let x = Math.floor(cx - r); x <= Math.ceil(cx + r); x++) {
        const dx = x + 0.5 - cx;
        const dy = y + 0.5 - cy;
        if (dx * dx + dy * dy <= r2) this.set(x, y, color);
      }
    }
  }
}

function downsample(
  src: Raster,
  scale: number,
): { w: number; h: number; data: Uint8Array } {
  const w = Math.floor(src.w / scale);
  const h = Math.floor(src.h / scale);
  const out = new Uint8Array(w * h * 4);
  const n = scale * scale;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let r = 0;
      let g = 0;
      let b = 0;
      for (let sy = 0; sy < scale; sy++) {
        for (let sx = 0; sx < scale; sx++) {
          const i = ((y * scale + sy) * src.w + (x * scale + sx)) * 4;
          r += src.buf[i];
          g += src.buf[i + 1];
          b += src.buf[i + 2];
        }
      }
      const o = (y * w + x) * 4;
      out[o] = Math.round(r / n);
      out[o + 1] = Math.round(g / n);
      out[o + 2] = Math.round(b / n);
      out[o + 3] = 255;
    }
  }
  return { w, h, data: out };
}

// ---- color + svg attribute parsing -------------------------------------------

function parseColor(c: string | undefined): RGB | null {
  if (!c) return [0, 0, 0]; // SVG default fill is black
  const v = c.trim().toLowerCase();
  if (v === "none") return null;
  if (v[0] === "#") {
    if (v.length === 4) {
      const r = Number.parseInt(v[1] + v[1], 16);
      const g = Number.parseInt(v[2] + v[2], 16);
      const b = Number.parseInt(v[3] + v[3], 16);
      return [r, g, b];
    }
    if (v.length === 7) {
      return [
        Number.parseInt(v.slice(1, 3), 16),
        Number.parseInt(v.slice(3, 5), 16),
        Number.parseInt(v.slice(5, 7), 16),
      ];
    }
  }
  if (v === "black") return [0, 0, 0];
  if (v === "white") return [255, 255, 255];
  return [0, 0, 0];
}

function attrs(tag: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const m of tag.matchAll(/([\w-]+)\s*=\s*"([^"]*)"/g)) out[m[1]] = m[2];
  return out;
}

// ---- public API ---------------------------------------------------------------

export interface RenderOptions {
  /** Output scale relative to the SVG viewBox (default 3 → 150×50 ⇒ 450×150). */
  scale?: number;
  /** Supersampling factor for anti-aliasing (default 3). */
  supersample?: number;
}

/** Render a (captcha-style) SVG document to a PNG byte array. */
export function renderSvgToPng(
  svg: string,
  options: RenderOptions = {},
): Uint8Array {
  const scale = options.scale ?? 3;
  const ss = options.supersample ?? 3;

  const svgTag = svg.match(/<svg\b[^>]*>/i)?.[0] ?? "";
  const sa = attrs(svgTag);
  let vw = 0;
  let vh = 0;
  if (sa.viewBox) {
    const parts = sa.viewBox.split(/[ ,]+/).map(Number);
    vw = parts[2];
    vh = parts[3];
  }
  vw = vw || Number.parseFloat(sa.width) || 150;
  vh = vh || Number.parseFloat(sa.height) || 50;

  const finalW = Math.round(vw * scale);
  const finalH = Math.round(vh * scale);
  const raster = new Raster(finalW * ss, finalH * ss);
  const kx = (finalW * ss) / vw;
  const ky = (finalH * ss) / vh;

  for (const tag of svg.match(/<path\b[^>]*>/gi) ?? []) {
    const a = attrs(tag);
    if (!a.d) continue;
    const subs = flattenPath(a.d);
    for (const sub of subs) {
      for (const p of sub.points) {
        p.x *= kx;
        p.y *= ky;
      }
    }
    // Render monochrome: all ink black on white (cleaner for OCR than the
    // captcha's grays). parseColor is only used to honor `fill/stroke="none"`.
    if (parseColor(a.fill)) raster.fill(subs, INK);
    if ("stroke" in a && parseColor(a.stroke)) {
      const sw = (Number.parseFloat(a["stroke-width"]) || 1) * ((kx + ky) / 2);
      raster.stroke(subs, INK, sw);
    }
  }

  const { w, h, data } = downsample(raster, ss);
  return encodePng(w, h, data);
}

// ---- PNG encoder (stored/uncompressed DEFLATE; no compression dependency) -----

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(bytes: Uint8Array): number {
  let c = 0xffffffff;
  for (let i = 0; i < bytes.length; i++)
    c = CRC_TABLE[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function adler32(bytes: Uint8Array): number {
  let a = 1;
  let b = 0;
  for (let i = 0; i < bytes.length; i++) {
    a = (a + bytes[i]) % 65521;
    b = (b + a) % 65521;
  }
  return ((b << 16) | a) >>> 0;
}

function u32(n: number): number[] {
  return [(n >>> 24) & 0xff, (n >>> 16) & 0xff, (n >>> 8) & 0xff, n & 0xff];
}

function chunk(type: string, data: number[]): number[] {
  const typeBytes = [...type].map((ch) => ch.charCodeAt(0));
  const body = [...typeBytes, ...data];
  const crc = crc32(Uint8Array.from(body));
  return [...u32(data.length), ...body, ...u32(crc)];
}

/** zlib stream wrapping raw bytes in stored (uncompressed) DEFLATE blocks. */
function storedZlib(raw: Uint8Array): number[] {
  const out: number[] = [0x78, 0x01]; // zlib header (no compression)
  const MAX = 0xffff;
  for (let off = 0; off < raw.length; off += MAX) {
    const len = Math.min(MAX, raw.length - off);
    const final = off + len >= raw.length ? 1 : 0;
    out.push(final); // BFINAL, BTYPE=00 (stored)
    out.push(len & 0xff, (len >> 8) & 0xff);
    out.push(~len & 0xff, (~len >> 8) & 0xff);
    for (let i = 0; i < len; i++) out.push(raw[off + i]);
  }
  const ad = adler32(raw);
  out.push(
    (ad >>> 24) & 0xff,
    (ad >>> 16) & 0xff,
    (ad >>> 8) & 0xff,
    ad & 0xff,
  );
  return out;
}

function encodePng(w: number, h: number, rgba: Uint8Array): Uint8Array {
  // Raw image data: each row prefixed with filter-type byte 0 (none).
  const raw = new Uint8Array((w * 4 + 1) * h);
  for (let y = 0; y < h; y++) {
    const ro = y * (w * 4 + 1);
    raw[ro] = 0;
    raw.set(rgba.subarray(y * w * 4, (y + 1) * w * 4), ro + 1);
  }
  const ihdr = [...u32(w), ...u32(h), 8, 6, 0, 0, 0]; // 8-bit, RGBA
  const bytes = [
    0x89,
    0x50,
    0x4e,
    0x47,
    0x0d,
    0x0a,
    0x1a,
    0x0a, // PNG signature
    ...chunk("IHDR", ihdr),
    ...chunk("IDAT", storedZlib(raw)),
    ...chunk("IEND", []),
  ];
  return Uint8Array.from(bytes);
}
