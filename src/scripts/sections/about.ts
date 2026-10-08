import { gsap, reduced, SplitText } from '../core';
import { Actor, rel, relRect } from '../actor';
import { rng, layer, stroke, squiggleD, hlD, ellipseD, draw, erase } from '../sketch';

export function about() {
  const section = document.querySelector<HTMLElement>('[data-about]');
  if (!section || reduced) return;

  return gsap.context(() => {
    const r = rng(23);
    const pin = section.querySelector<HTMLElement>('[data-pin]')!;
    const text = section.querySelector<HTMLElement>('[data-text]')!;
    const note = section.querySelector<HTMLElement>('[data-note]')!;
    const split = SplitText.create(text, { type: 'lines,words', wordsClass: 'w', linesClass: 'ln' });
    const bounds = { x: 0, y: 0, w: pin.offsetWidth, h: pin.offsetHeight };

    // ── measure
    const lines = split.lines.map((ln) => {
      const words = [...ln.querySelectorAll<HTMLElement>('.w')];
      const first = relRect(words[0], pin);
      const last = relRect(words[words.length - 1], pin);
      return { words, x1: first.x, x2: last.x + last.w, y: first.y, h: first.h };
    }).filter((l) => l.words.length);

    const segs = (mark: Element) => {
      const ws = [...mark.querySelectorAll<HTMLElement>('.w')].map((w) => relRect(w, pin));
      const rows: { x1: number; x2: number; y: number; h: number }[] = [];
      ws.forEach((w) => {
        const row = rows.find((rw) => Math.abs(rw.y - w.y) < w.h * 0.5);
        if (row) row.x2 = Math.max(row.x2, w.x + w.w);
        else rows.push({ x1: w.x, x2: w.x + w.w, y: w.y, h: w.h });
      });
      return rows;
    };
    const hlRows = segs(section.querySelector('[data-mark="hl"]')!);
    const circleRows = segs(section.querySelector('[data-mark="circle"]')!);
    const noteAt = rel(note, pin, 0.15, 0.6);

    // ── draw layer
    const svg = layer(pin);
    const hlSvg = layer(pin, 'sk-hl');
    const squiggles = lines.map((l) => stroke(svg, squiggleD(l.x1, l.y + l.h * 0.55, l.x2 - l.x1, l.h * 0.09, r)));
    const hls = hlRows.map((row) => {
      const p = stroke(hlSvg, hlD(row.x1, row.x2, row.y + row.h * 0.6, r), 'hl', row.h * 0.55);
      p.style.setProperty('--c', 'var(--lime)');
      return p;
    });
    const c = circleRows[circleRows.length - 1];
    const circle = stroke(svg, ellipseD((c.x1 + c.x2) / 2, c.y + c.h * 0.52, (c.x2 - c.x1) / 2 + 22, c.h * 0.62, r), 'ink');

    gsap.set(split.words, { opacity: 0 });
    gsap.set(note, { opacity: 0 });

    // squiggles sketch in as the section arrives
    const pre = gsap.timeline({ scrollTrigger: { trigger: section, start: 'top 85%', end: 'top 10%', scrub: true } });
    draw(pre, squiggles, 0, 0.6, 0.12);

    // ── pinned build
    const femi = Actor.in(pin, 'femi', bounds, r);
    const ada = Actor.in(pin, 'ada', bounds, r);
    const kemi = Actor.in(pin, 'kemi', bounds, r);
    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { trigger: pin, start: 'top top', end: '+=220%', pin: true, scrub: 0.6 },
    });

    let t = 0.05;
    femi.enter(tl, { x: lines[0].x1, y: lines[0].y + lines[0].h * 0.9 }, t, 'left', 0.7);
    t += 0.75;
    lines.forEach((l, i) => {
      const dur = 0.25 + (l.words.length * 0.11);
      const yy = l.y + l.h * 0.92;
      if (i > 0) {
        femi.moveTo(tl, { x: l.x1, y: yy }, t, 0.3);
        t += 0.3;
      }
      femi.trace(tl, [{ x: (l.x1 + l.x2) / 2, y: yy + 3 }, { x: l.x2 + 6, y: yy }], t, dur);
      tl.to(l.words, { opacity: 1, duration: 0.12, stagger: (dur - 0.12) / Math.max(1, l.words.length - 1) }, t);
      erase(tl, squiggles[i], t, dur);
      t += dur;
    });
    femi.leave(tl, t, 'right', 0.7);

    // Ada highlights, Kemi circles
    const h0 = hlRows[0];
    ada.enter(tl, { x: h0.x1, y: h0.y + h0.h * 0.6 }, t - 0.4, 'top', 0.7);
    let th = t + 0.35;
    hlRows.forEach((row, i) => {
      if (i > 0) {
        ada.moveTo(tl, { x: row.x1, y: row.y + row.h * 0.6 }, th, 0.25);
        th += 0.25;
      }
      ada.press(tl, th);
      ada.trace(tl, [{ x: row.x2 + 6, y: row.y + row.h * 0.62 }], th, 0.45);
      draw(tl, hls[i], th, 0.45);
      th += 0.5;
    });
    ada.release(tl, th);
    ada.leave(tl, th + 0.1, 'top', 0.7);

    const cx = (c.x1 + c.x2) / 2;
    const rx = (c.x2 - c.x1) / 2 + 22;
    kemi.enter(tl, { x: cx, y: c.y - 6 }, th - 0.2, 'bottom', 0.7);
    const loop = Array.from({ length: 9 }, (_, i) => {
      const a = -Math.PI * 0.6 + (i / 8) * Math.PI * 2.2;
      return { x: cx + Math.cos(a) * rx, y: c.y + c.h * 0.52 + Math.sin(a) * c.h * 0.62 };
    });
    kemi.press(tl, th + 0.5);
    kemi.trace(tl, loop, th + 0.5, 0.6);
    draw(tl, circle, th + 0.5, 0.6);
    kemi.release(tl, th + 1.1);
    kemi.moveTo(tl, noteAt, th + 1.2, 0.6);
    kemi.click(tl, th + 1.8);
    tl.to(note, { opacity: 1, duration: 0.3 }, th + 1.82);
    tl.from(note, { rotate: -10, scale: 0.8, duration: 0.4, ease: 'back.out(2)' }, th + 1.82);
    kemi.leave(tl, th + 2.3, 'bottom', 0.7);
    tl.to({}, { duration: 0.5 });

    return () => {
      svg.remove();
      hlSvg.remove();
    };
  }, section);
}
