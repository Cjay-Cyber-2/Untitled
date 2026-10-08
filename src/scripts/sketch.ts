/**
 * Hand-drawn strokes. Every path is one continuous line with pathLength=1,
 * so drawing is just stroke-dashoffset 1 → 0, at any size.
 */

export type Rand = () => number;
export type Pt = [number, number];

export function rng(seed = 1): Rand {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export const jit = (r: Rand, amt: number) => (r() - 0.5) * 2 * amt;
const n = (v: number) => Math.round(v * 10) / 10;

/** Smooth curve through points (Catmull-Rom to cubic Bézier). */
export function smooth(pts: Pt[], k = 1): string {
  if (pts.length < 2) return '';
  let d = `M${n(pts[0][0])},${n(pts[0][1])}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1x = p1[0] + ((p2[0] - p0[0]) / 6) * k;
    const c1y = p1[1] + ((p2[1] - p0[1]) / 6) * k;
    const c2x = p2[0] - ((p3[0] - p1[0]) / 6) * k;
    const c2y = p2[1] - ((p3[1] - p1[1]) / 6) * k;
    d += ` C${n(c1x)},${n(c1y)} ${n(c2x)},${n(c2y)} ${n(p2[0])},${n(p2[1])}`;
  }
  return d;
}

export function lineD(x1: number, y1: number, x2: number, y2: number, r: Rand, bow = 0.025): string {
  const len = Math.hypot(x2 - x1, y2 - y1) || 1;
  const ux = (x2 - x1) / len;
  const uy = (y2 - y1) / len;
  const o = Math.min(8, len * 0.03);
  const sx = x1 - ux * o * r();
  const sy = y1 - uy * o * r() + jit(r, 1.5);
  const ex = x2 + ux * o * r();
  const ey = y2 + uy * o * r() + jit(r, 1.5);
  const b = jit(r, len * bow);
  const cx = (sx + ex) / 2 - uy * b;
  const cy = (sy + ey) / 2 + ux * b;
  return `M${n(sx)},${n(sy)} Q${n(cx)},${n(cy)} ${n(ex)},${n(ey)}`;
}

/** Rectangle drawn in one go, corners slightly missed, end runs past the start. */
export function rectD(x: number, y: number, w: number, h: number, r: Rand, amt = 3): string {
  const c: Pt[] = [
    [x + jit(r, amt), y + jit(r, amt)],
    [x + w + jit(r, amt), y + jit(r, amt)],
    [x + w + jit(r, amt), y + h + jit(r, amt)],
    [x + jit(r, amt), y + h + jit(r, amt)],
  ];
  const start: Pt = [c[0][0] + 6 + r() * 10, c[0][1] + jit(r, 2)];
  let d = `M${n(start[0])},${n(start[1])}`;
  const seq = [c[1], c[2], c[3], c[0], [c[0][0] + 18 + r() * 24, c[0][1] + jit(r, 3)] as Pt];
  let prev = start;
  for (const p of seq) {
    const len = Math.hypot(p[0] - prev[0], p[1] - prev[1]) || 1;
    const b = jit(r, Math.min(len * 0.012, 5));
    const mx = (prev[0] + p[0]) / 2 - ((p[1] - prev[1]) / len) * b;
    const my = (prev[1] + p[1]) / 2 + ((p[0] - prev[0]) / len) * b;
    d += ` Q${n(mx)},${n(my)} ${n(p[0])},${n(p[1])}`;
    prev = p;
  }
  return d;
}

/** A loose, slightly spiralling circle, the kind you draw around something important. */
export function ellipseD(cx: number, cy: number, rx: number, ry: number, r: Rand, turns = 1.14): string {
  const steps = 30;
  const a0 = -Math.PI * (0.55 + r() * 0.2);
  const ph = r() * 6;
  const pts: Pt[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const a = a0 + t * Math.PI * 2 * turns;
    const wob = 1 + Math.sin(t * 7 + ph) * 0.035 + (t - 0.5) * 0.08;
    pts.push([cx + Math.cos(a) * rx * wob, cy + Math.sin(a) * ry * wob]);
  }
  return smooth(pts);
}

/** Placeholder "text" scribble: a wavy pencil line. */
export function squiggleD(x: number, y: number, w: number, amp: number, r: Rand): string {
  const pts: Pt[] = [];
  const step = 11 + r() * 5;
  let i = 0;
  for (let px = x; px <= x + w; px += step) {
    pts.push([px, y + (i % 2 ? -1 : 1) * amp * (0.55 + r() * 0.45)]);
    i++;
  }
  return smooth(pts, 1.2);
}

/** Highlighter swipe across a line of text. */
export function hlD(x1: number, x2: number, y: number, r: Rand): string {
  const l = x1 - 4 - r() * 6;
  const rr = x2 + 4 + r() * 8;
  return `M${n(l)},${n(y + jit(r, 2))} Q${n((l + rr) / 2)},${n(y + jit(r, 4))} ${n(rr)},${n(y + jit(r, 3))}`;
}

/** Tick mark. */
export function tickD(x: number, y: number, s: number, r: Rand): string {
  return smooth([
    [x - s * 0.5, y + jit(r, 1)],
    [x - s * 0.12, y + s * 0.42],
    [x + s * 0.6, y - s * 0.55 + jit(r, 2)],
  ], 0.6);
}

const NS = 'http://www.w3.org/2000/svg';

/** An SVG overlay that covers `host` (host must be positioned). Coordinates are CSS px. */
export function layer(host: HTMLElement, cls = ''): SVGSVGElement {
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('class', `sk ${cls}`.trim());
  svg.setAttribute('aria-hidden', 'true');
  svg.style.width = '100%';
  svg.style.height = '100%';
  host.appendChild(svg);
  return svg;
}

export function stroke(svg: SVGSVGElement, d: string, cls = '', width?: number): SVGPathElement {
  const p = document.createElementNS(NS, 'path');
  p.setAttribute('d', d);
  p.setAttribute('pathLength', '1');
  if (cls) p.setAttribute('class', cls);
  if (width) p.style.strokeWidth = `${width}px`;
  svg.appendChild(p);
  return p;
}

type Paths = SVGPathElement | SVGPathElement[];

export function draw(tl: gsap.core.Timeline, paths: Paths, at: gsap.Position, dur = 0.5, stagger = 0) {
  tl.fromTo(paths, { opacity: 0 }, { opacity: 1, duration: 0.001, stagger }, at);
  tl.fromTo(paths, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: dur, ease: 'power1.inOut', stagger }, '<');
  return tl;
}

export function erase(tl: gsap.core.Timeline, paths: Paths, at: gsap.Position, dur = 0.35, stagger = 0) {
  tl.to(paths, { strokeDashoffset: -1, duration: dur, ease: 'power1.in', stagger }, at);
  tl.to(paths, { opacity: 0, duration: 0.001 }, '>');
  return tl;
}
