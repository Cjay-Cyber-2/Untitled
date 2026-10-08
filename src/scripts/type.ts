/** Typing that feels human: uneven rhythm, the odd typo, a pause, then backspace. */
import type { Rand } from './sketch';

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
const NEAR: Record<string, string> = { a: 's', e: 'r', i: 'o', o: 'p', n: 'm', t: 'y', l: 'k', d: 'f', r: 't', s: 'd', u: 'i', m: 'n' };

export interface Typer {
  el: HTMLElement;
  full: string;
  restore: () => void;
}

/** Swap the text for typed + ghost spans so layout never moves while typing. */
export function prepType(el: HTMLElement): Typer {
  const full = el.dataset.full ?? el.textContent ?? '';
  el.dataset.full = full;
  el.innerHTML = `<span class="t-typed" aria-hidden="true"></span><span class="t-ghost" aria-hidden="true">${esc(full)}</span><span class="sr-only">${esc(full)}</span>`;
  el.classList.add('prepped');
  return {
    el,
    full,
    restore: () => {
      el.textContent = full;
      el.classList.remove('is-typing');
    },
  };
}

function states(full: string, r: Rand, typoAt: number | null): { s: string; w: number }[] {
  const out: { s: string; w: number }[] = [];
  for (let i = 1; i <= full.length; i++) {
    const s = full.slice(0, i);
    const ch = full[i - 1];
    out.push({ s, w: ch === ' ' ? 1.5 : 0.55 + r() * 0.9 });
    if (typoAt !== null && i === typoAt) {
      const nextCh = full[i] ?? 'e';
      const lower = nextCh.toLowerCase();
      let wrong = NEAR[lower] ?? 'x';
      if (nextCh !== lower) wrong = wrong.toUpperCase();
      out.push({ s: s + wrong, w: 0.7 });
      out.push({ s: s + wrong + (full[i + 1] ?? ''), w: 0.6 });
      out.push({ s: s + wrong, w: 2.6 });
      out.push({ s, w: 0.45 });
    }
  }
  return out;
}

export function typeIn(
  tl: gsap.core.Timeline,
  t: Typer,
  at: gsap.Position,
  dur: number,
  r: Rand,
  opts: { typo?: boolean | number } = {},
) {
  const len = t.full.length;
  const typoAt = opts.typo === undefined || opts.typo === false ? null : typeof opts.typo === 'number' ? opts.typo : Math.max(1, Math.floor(len * (0.4 + r() * 0.3)));
  const seq = states(t.full, r, len > 2 ? typoAt : null);
  const total = seq.reduce((a, b) => a + b.w, 0);
  let acc = 0;
  const stops = seq.map((x) => (acc += x.w) / total);
  const typed = t.el.querySelector<HTMLElement>('.t-typed')!;
  const ghost = t.el.querySelector<HTMLElement>('.t-ghost')!;
  const proxy = { p: 0 };
  let last = -1;
  tl.to(proxy, {
    p: 1,
    duration: dur,
    ease: 'none',
    onUpdate() {
      const p = proxy.p;
      let i = -1;
      while (i + 1 < stops.length && stops[i + 1] <= p + 1e-6) i++;
      if (i !== last) {
        last = i;
        const s = i < 0 ? '' : seq[i].s;
        typed.textContent = s;
        ghost.textContent = t.full.slice(Math.min(s.length, len));
      }
      t.el.classList.toggle('is-typing', p > 0.0005 && p < 0.9995);
    },
  }, at);
  return tl;
}
