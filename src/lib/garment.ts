import type { GarmentType } from '@/types';

/**
 * Self-contained product imagery. The catalog stores image URLs like
 * `garment:tee:c8b6a0:0`; `resolveImage` turns those into inline SVG data URIs so the
 * demo works offline. Real http(s) URLs pass straight through, so swapping in CDN
 * photography requires no component changes.
 */

function clamp(n: number): number {
  return Math.max(0, Math.min(255, Math.round(n)));
}

export function shade(hex: string, amount: number): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const t = amount < 0 ? 0 : 255;
  const p = Math.abs(amount);
  const mix = (c: number) => clamp(c + (t - c) * p);
  return `#${[mix(r), mix(g), mix(b)].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

function isLight(hex: string): boolean {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return 0.299 * r + 0.587 * g + 0.114 * b > 150;
}

interface Palette {
  fill: string;
  edge: string;
  hi: string;
  detail: string;
}

type Shape = (p: Palette) => string;

const body = (d: string, p: Palette) =>
  `<path d="${d}" fill="${p.fill}" stroke="${p.edge}" stroke-width="2" stroke-linejoin="round"/>`;
const line = (d: string, p: Palette, w = 1.5) =>
  `<path d="${d}" fill="none" stroke="${p.detail}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
const button = (x: number, y: number, p: Palette) =>
  `<circle cx="${x}" cy="${y}" r="3.2" fill="${p.hi}" stroke="${p.edge}" stroke-width="1"/>`;

const SHAPES: Record<GarmentType, Shape> = {
  tee: (p) =>
    body(
      'M142 92 L98 112 L58 172 L100 198 L126 166 L126 412 L274 412 L274 166 L300 198 L342 172 L302 112 L258 92 Q200 128 142 92 Z',
      p,
    ) +
    line('M142 92 Q200 140 258 92', p, 2.5) +
    line('M126 166 L126 190 M274 166 L274 190', p) +
    line('M126 400 L274 400', p),
  shirt: (p) =>
    body(
      'M142 92 L96 110 L52 334 L90 342 L126 196 L126 424 L274 424 L274 196 L310 342 L348 334 L304 110 L258 92 Q200 124 142 92 Z',
      p,
    ) +
    `<path d="M142 92 L200 140 L258 92 L240 82 L200 112 L160 82 Z" fill="${p.hi}" stroke="${p.edge}" stroke-width="2" stroke-linejoin="round"/>` +
    line('M200 140 L200 424', p) +
    [175, 215, 255, 295, 335, 375].map((y) => button(200, y, p)).join('') +
    line('M52 334 L90 342 M348 334 L310 342', p),
  hoodie: (p) =>
    `<path d="M148 100 Q200 -6 252 100 Q200 140 148 100 Z" fill="${p.hi}" stroke="${p.edge}" stroke-width="2"/>` +
    body(
      'M148 100 L96 118 L54 340 L92 350 L126 200 L126 430 L274 430 L274 200 L308 350 L346 340 L304 118 L252 100 Q200 138 148 100 Z',
      p,
    ) +
    line('M178 118 L176 178 M222 118 L224 178', p, 2) +
    line('M150 330 L250 330 L262 392 L138 392 Z', p) +
    line('M126 414 L274 414', p),
  jacket: (p) =>
    body(
      'M146 92 L96 112 L54 340 L92 350 L126 206 L126 432 L274 432 L274 206 L308 350 L346 340 L304 112 L254 92 Q200 112 146 92 Z',
      p,
    ) +
    `<path d="M146 92 L186 150 L200 122 L214 150 L254 92 L236 84 L200 104 L164 84 Z" fill="${p.hi}" stroke="${p.edge}" stroke-width="2" stroke-linejoin="round"/>` +
    line('M200 122 L200 432', p, 2) +
    line('M152 300 L184 300 M216 300 L248 300', p, 2.5) +
    line('M126 206 L126 230 M274 206 L274 230', p),
  sweater: (p) =>
    body(
      'M148 94 L100 112 L60 300 L98 312 L126 184 L126 410 L274 410 L274 184 L302 312 L340 300 L300 112 L252 94 Q200 124 148 94 Z',
      p,
    ) +
    `<path d="M148 94 Q200 148 252 94 Q200 122 148 94 Z" fill="${p.hi}" stroke="${p.edge}" stroke-width="2"/>` +
    [0, 1, 2, 3, 4, 5]
      .map((i) => line(`M${126 + i * 0} ${392 + i * 3}L274 ${392 + i * 3}`, p, 1))
      .join('') +
    line('M64 286 L102 298 M336 286 L298 298', p, 2),
  dress: (p) =>
    body(
      'M162 70 L176 70 L182 132 Q200 156 218 132 L224 70 L238 70 L256 204 L330 436 L70 436 L144 204 Z',
      p,
    ) +
    line('M144 204 L256 204', p, 2) +
    line('M170 214 L120 430 M200 218 L200 434 M230 214 L280 430', p, 1) +
    line('M182 132 Q200 156 218 132', p, 2),
  skirt: (p) =>
    body('M146 104 L254 104 L330 402 L70 402 Z', p) +
    line('M146 128 L254 128', p, 2) +
    line('M168 132 L128 400 M200 132 L200 400 M232 132 L272 400', p, 1),
  trousers: (p) =>
    body('M136 80 L264 80 L276 448 L212 448 L200 210 L188 448 L124 448 Z', p) +
    line('M136 104 L264 104', p, 2) +
    line('M200 104 L200 210', p) +
    line('M150 112 Q168 150 186 130 M250 112 Q232 150 214 130', p),
  jeans: (p) =>
    body('M136 80 L264 80 L278 450 L212 450 L200 214 L188 450 L122 450 Z', p) +
    line('M136 104 L264 104', p, 2) +
    line('M200 104 L200 214', p, 1.5) +
    `<path d="M144 108 Q172 190 190 128" fill="none" stroke="${p.hi}" stroke-width="2" stroke-dasharray="4 3"/>` +
    `<path d="M256 108 Q228 190 210 128" fill="none" stroke="${p.hi}" stroke-width="2" stroke-dasharray="4 3"/>` +
    button(200, 92, p) +
    line('M125 430 L186 430 M214 430 L275 430', p, 1),
  shorts: (p) =>
    body('M134 96 L266 96 L292 292 L212 292 L200 184 L188 292 L108 292 Z', p) +
    line('M134 120 L266 120', p, 2) +
    line('M200 120 L200 184', p) +
    line('M112 274 L188 274 M212 274 L288 274', p, 1),
};

type View = 0 | 1 | 2 | 3;

const BACKGROUNDS: Record<View, [string, string]> = {
  0: ['#f1ece5', '#e6dfd4'],
  1: ['#e9e2d6', '#d9d0c1'],
  2: ['#f6f3ee', '#ebe6dd'],
  3: ['#dcd3c6', '#cfc5b5'],
};

export function renderGarmentSvg(type: GarmentType, hex: string, view: View = 0): string {
  const fill = `#${hex.replace('#', '')}`;
  const light = isLight(fill);
  const p: Palette = {
    fill,
    edge: shade(fill, light ? -0.28 : -0.45),
    hi: shade(fill, light ? -0.08 : 0.14),
    detail: shade(fill, light ? -0.3 : 0.28),
  };
  const [bg0, bg1] = BACKGROUNDS[view];
  const transform =
    view === 1
      ? 'translate(-70 -60) scale(1.35)'
      : view === 2
        ? 'rotate(-5 200 260) translate(8 6)'
        : view === 3
          ? 'translate(40 30) scale(0.8)'
          : '';
  const id = `g${view}`;
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" role="img">` +
    `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${bg0}"/><stop offset="1" stop-color="${bg1}"/></linearGradient>` +
    `<filter id="s" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="10" stdDeviation="9" flood-color="#000" flood-opacity=".16"/></filter></defs>` +
    `<rect width="400" height="500" fill="url(#${id})"/>` +
    `<ellipse cx="200" cy="470" rx="${view === 1 ? 190 : 120}" ry="9" fill="#000" opacity=".07"/>` +
    `<g filter="url(#s)" transform="${transform}">${SHAPES[type](p)}</g>` +
    `</svg>`
  );
}

const cache = new Map<string, string>();

export function garmentUrl(type: GarmentType, hex: string, view: number): string {
  return `garment:${type}:${hex.replace('#', '')}:${view}`;
}

export function resolveImage(src: string): string {
  if (!src.startsWith('garment:')) return src;
  const hit = cache.get(src);
  if (hit) return hit;
  const [, type, hex, view] = src.split(':');
  if (!type || !hex || !(type in SHAPES)) return src;
  const svg = renderGarmentSvg(type as GarmentType, hex, (Number(view ?? 0) % 4) as View);
  const uri = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  cache.set(src, uri);
  return uri;
}
