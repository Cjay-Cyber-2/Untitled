import { gsap, reduced } from '../core';
import { Actor, rel, relRect } from '../actor';
import { rng, layer, stroke, rectD, lineD, squiggleD, ellipseD, draw, erase } from '../sketch';
import { prepType, typeIn, type Typer } from '../type';

export function six() {
  const section = document.querySelector<HTMLElement>('[data-six]');
  if (!section) return;
  if (reduced) {
    section.querySelectorAll<HTMLElement>('[data-type]').forEach((el) => el.classList.add('prepped'));
    return;
  }

  return gsap.context(() => {
    section.classList.add('is-pinned');
    const r = rng(37);
    const stage = section.querySelector<HTMLElement>('[data-stage]')!;
    const cards = [...section.querySelectorAll<HTMLElement>('[data-card]')];
    const dots = [...section.querySelectorAll<HTMLElement>('[data-dot]')];
    const svgs: SVGSVGElement[] = [];
    const typers: Typer[] = [];

    // ── measure every card at rest before any tween exists
    const plans = cards.map((card) => {
      const slot = card.querySelector<HTMLElement>('[data-slot]')!;
      const photo = card.querySelector<HTMLElement>('[data-photo]')!;
      const name = card.querySelector<HTMLElement>('[data-type]')!;
      const fact = card.querySelector<HTMLElement>('[data-fact]')!;
      const bits = [...card.querySelectorAll<HTMLElement>('[data-bit]')];
      const W = card.offsetWidth;
      const H = card.offsetHeight;
      const slotR = relRect(slot, card);
      const nameR = relRect(name, card);
      const factR = relRect(fact, card);
      const bitR = bits.map((b) => relRect(b, card));
      return {
        card, slot, photo, name, fact, bits, W, H, slotR, nameR, factR, bitR,
        photoAt: rel(slot, card),
        nameAt: { x: nameR.x + 4, y: nameR.y + nameR.h * 0.7 },
        floodAt: { x: W - 70, y: 60 },
      };
    });
    const sR = stage.getBoundingClientRect();
    const cR = cards[0].getBoundingClientRect();
    const offX = cR.left - sR.left;
    const offY = cR.top - sR.top;

    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: stage, start: 'top top', end: () => `+=${cards.length * 115}%`, pin: true, scrub: 0.7,
        onUpdate: (st) => {
          const i = Math.min(cards.length - 1, Math.floor(st.progress * cards.length * 0.999));
          dots.forEach((d, k) => d.classList.toggle('is-on', k === i));
        },
      },
    });

    plans.forEach((p, i) => {
      const { card, W, H } = p;
      // stage-sized bounds in card coordinates so cursors arrive from the screen edge
      const bounds = { x: -offX, y: -offY, w: sR.width, h: sR.height };
      const who = card.querySelector<HTMLElement>('.cur')!.dataset.cur!;
      const a = Actor.in(card, who, bounds, r);

      // pencil wireframe
      const svg = layer(card);
      svgs.push(svg);
      const frame = stroke(svg, rectD(p.slotR.x, p.slotR.y, p.slotR.w, p.slotR.h, r, 3));
      const xs = [
        stroke(svg, lineD(p.slotR.x + 10, p.slotR.y + 10, p.slotR.x + p.slotR.w - 10, p.slotR.y + p.slotR.h - 10, r)),
        stroke(svg, lineD(p.slotR.x + p.slotR.w - 10, p.slotR.y + 10, p.slotR.x + 10, p.slotR.y + p.slotR.h - 10, r)),
      ];
      const nameBox = stroke(svg, rectD(p.nameR.x - 6, p.nameR.y - 4, Math.min(p.nameR.w, W * 0.5) + 12, p.nameR.h + 8, r, 2));
      const scribbles = p.bitR.map((b) => stroke(svg, squiggleD(b.x, b.y + b.h / 2, Math.min(b.w, W * 0.42), Math.min(8, b.h * 0.18), r)));
      const factSq = stroke(svg, squiggleD(p.factR.x, p.factR.y + p.factR.h / 2, Math.min(p.factR.w, W * 0.4), 6, r));
      const circle = stroke(svg, ellipseD(p.factR.x + p.factR.w / 2, p.factR.y + p.factR.h / 2, p.factR.w / 2 + 16, p.factR.h / 2 + 14, r), 'ink');
      const allSketch = [frame, ...xs, nameBox, ...scribbles, factSq];

      const typer = prepType(p.name);
      typers.push(typer);

      // starting state
      gsap.set(card.querySelector('[data-flood]'), { clipPath: `circle(0px at ${p.floodAt.x}px ${p.floodAt.y}px)` });
      gsap.set(p.bits, { opacity: 0, y: 14 });
      gsap.set(p.fact, { opacity: 0 });
      if (i > 0) gsap.set(card, { yPercent: 112, rotate: i % 2 ? 2.5 : -2.5 });

      const t0 = i * 10;
      const label = `c${i}`;
      tl.addLabel(label, t0);

      // card slides in over the previous one
      if (i > 0) {
        tl.to(card, { yPercent: 0, rotate: 0, duration: 1.6, ease: 'power3.out' }, t0);
        tl.to(cards[i - 1], { scale: 0.94, yPercent: -7, opacity: 0.6, duration: 1.6, ease: 'power2.out' }, t0);
        if (i > 1) tl.to(cards[i - 2], { opacity: 0, duration: 0.6 }, t0);
      }
      const b = t0 + (i > 0 ? 1.2 : 0);

      draw(tl, allSketch, b, 1.0, 0.04);

      // the member drags their own photo in
      a.enter(tl, { x: p.photoAt.x - 40, y: bounds.y + bounds.h + 40 }, b + 0.9, 'bottom', 0.01);
      a.carry(tl, p.photo, p.photoAt, p.photoAt, b + 1.0, 1.4);
      erase(tl, [frame, ...xs], b + 2.1, 0.4);
      a.click(tl, b + 2.45);

      // types their name
      a.moveTo(tl, p.nameAt, b + 2.7, 0.8);
      a.click(tl, b + 3.5);
      erase(tl, nameBox, b + 3.55, 0.3);
      typeIn(tl, typer, b + 3.6, 1.3, r, { typo: i % 2 === 0 ? 2 : false });
      a.moveTo(tl, { x: p.nameAt.x + Math.min(p.nameR.w, 320) * 0.8, y: p.nameAt.y + 34 }, b + 3.7, 1.3);

      // colour floods from the corner
      a.moveTo(tl, p.floodAt, b + 5.05, 0.75);
      a.click(tl, b + 5.8);
      tl.to(card.querySelector('[data-flood]'), {
        clipPath: `circle(${Math.hypot(W, H) * 1.05}px at ${p.floodAt.x}px ${p.floodAt.y}px)`,
        duration: 1.1, ease: 'power2.inOut',
      }, b + 5.85);
      erase(tl, scribbles, b + 5.9, 0.6, 0.05);
      tl.to(p.bits, { opacity: 1, y: 0, duration: 0.6, stagger: 0.12, ease: 'power2.out' }, b + 6.1);

      // circles the fun fact
      const fx = p.factR.x + p.factR.w / 2;
      const fy = p.factR.y + p.factR.h / 2;
      const rx = p.factR.w / 2 + 16;
      const ry = p.factR.h / 2 + 14;
      a.moveTo(tl, { x: fx - rx * 0.4, y: fy - ry }, b + 6.6, 0.7);
      erase(tl, factSq, b + 7.1, 0.3);
      tl.to(p.fact, { opacity: 1, duration: 0.3 }, b + 7.2);
      a.press(tl, b + 7.35);
      const loop = Array.from({ length: 10 }, (_, k) => {
        const ang = -Math.PI * 0.62 + (k / 9) * Math.PI * 2.25;
        return { x: fx + Math.cos(ang) * rx, y: fy + Math.sin(ang) * ry };
      });
      a.trace(tl, loop, b + 7.35, 0.75);
      draw(tl, circle, b + 7.35, 0.75);
      a.release(tl, b + 8.1);
      a.leave(tl, b + 8.2, i % 2 ? 'left' : 'right', 0.8);
    });
    tl.to({}, { duration: 1.2 });

    return () => {
      section.classList.remove('is-pinned');
      svgs.forEach((s) => s.remove());
      typers.forEach((t) => t.restore());
      dots.forEach((d) => d.classList.remove('is-on'));
    };
  }, section);
}
