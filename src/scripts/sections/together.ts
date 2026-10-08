import { gsap, reduced } from '../core';
import { Actor, rel, relRect } from '../actor';
import { rng, layer, stroke, rectD, lineD, squiggleD, draw, erase } from '../sketch';
import { prepType, typeIn, type Typer } from '../type';

export function together() {
  const section = document.querySelector<HTMLElement>('[data-together]');
  if (!section) return;
  if (reduced) {
    section.querySelectorAll<HTMLElement>('[data-type]').forEach((el) => el.classList.add('prepped'));
    return;
  }

  return gsap.context(() => {
    const r = rng(53);
    const pin = section.querySelector<HTMLElement>('[data-pin]')!;
    const track = section.querySelector<HTMLElement>('[data-track]')!;
    const panels = [...section.querySelectorAll<HTMLElement>('[data-gp]')];
    const svgs: SVGSVGElement[] = [];
    const typers: Typer[] = [];
    const distance = () => track.scrollWidth - pin.offsetWidth;
    const vh = pin.offsetHeight || window.innerHeight;

    // ── measure
    const plans = panels.map((gp) => {
      const slot = gp.querySelector<HTMLElement>('[data-slot]')!;
      const name = gp.querySelector<HTMLElement>('[data-type]')!;
      const bits = [...gp.querySelectorAll<HTMLElement>('[data-bit]')];
      return {
        gp, slot, name, bits,
        shot: gp.querySelector<HTMLElement>('[data-shot]')!,
        sel: gp.querySelector<HTMLElement>('[data-sel]')!,
        note: gp.querySelector<HTMLElement>('.cmt')!,
        body: gp.querySelector<HTMLElement>('.shot-ph, .shot-body img'),
        top: relRect(gp, pin).y,
        slotR: relRect(slot, gp),
        nameR: relRect(name, gp),
        bitR: bits.map((b) => relRect(b, gp)),
        noteAt: rel(gp.querySelector('.cmt')!, gp, 0.12, 0.85),
        curs: [...gp.querySelectorAll<HTMLElement>('.cur')].map((c) => c.dataset.cur!),
      };
    });

    const slide = gsap.to(track, {
      x: () => -distance(),
      ease: 'none',
      scrollTrigger: { trigger: pin, start: 'top top', end: () => `+=${distance()}`, pin: true, scrub: 0.8, invalidateOnRefresh: true },
    });

    plans.forEach((p, i) => {
      const bounds = { x: -400, y: -p.top, w: p.gp.offsetWidth + 800, h: vh };
      const [a, b, c] = p.curs.map((who) => Actor.in(p.gp, who, bounds, r));
      const svg = layer(p.gp);
      svgs.push(svg);
      const s = p.slotR;
      const frame = stroke(svg, rectD(s.x, s.y, s.w, s.h, r, 3));
      const xs = [stroke(svg, lineD(s.x + 12, s.y + 12, s.x + s.w - 12, s.y + s.h - 12, r)), stroke(svg, lineD(s.x + s.w - 12, s.y + 12, s.x + 12, s.y + s.h - 12, r))];
      const nameBox = stroke(svg, rectD(p.nameR.x - 6, p.nameR.y - 4, p.nameR.w + 12, p.nameR.h + 8, r, 2));
      const scribbles = p.bitR.map((br) => stroke(svg, squiggleD(br.x, br.y + br.h / 2, Math.min(br.w, 360), Math.min(7, br.h * 0.2), r)));
      const typer = prepType(p.name);
      typers.push(typer);

      // small frame first, dragged to full size
      const startW = 0.42;
      const startH = 0.46;
      gsap.set(p.shot, { opacity: 0, clipPath: `inset(0% ${(1 - startW) * 100}% ${(1 - startH) * 100}% 0% round 14px)` });
      gsap.set(p.sel, { right: s.w * (1 - startW) - 6, bottom: s.h * (1 - startH) - 6 });
      gsap.set(p.bits, { opacity: 0, y: 12 });
      gsap.set(p.note, { opacity: 0, scale: 0.6 });

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: { trigger: p.gp, containerAnimation: slide, start: 'left 92%', end: 'left 8%', scrub: 0.6 },
      });

      draw(tl, [frame, ...xs, nameBox, ...scribbles], 0, 1, 0.03);

      // A grabs the frame corner and drags it to full size
      const small = { x: s.x + s.w * startW, y: s.y + s.h * startH };
      const full = { x: s.x + s.w, y: s.y + s.h };
      a.enter(tl, { x: s.x + s.w * 0.2, y: s.y + s.h * 0.2 }, 0.6, 'top', 0.9);
      a.click(tl, 1.5);
      tl.to(p.sel, { opacity: 1, duration: 0.15 }, 1.52);
      tl.set(p.shot, { opacity: 1 }, 1.52);
      a.moveTo(tl, small, 1.7, 0.6);
      a.press(tl, 2.3);
      a.moveTo(tl, full, 2.4, 1.2);
      tl.to(p.shot, { clipPath: 'inset(0% 0% 0% 0% round 14px)', duration: 1.2, ease: 'power2.inOut' }, 2.4);
      tl.to(p.sel, { right: -6, bottom: -6, duration: 1.2, ease: 'power2.inOut' }, 2.4);
      erase(tl, [frame, ...xs], 2.5, 0.6);
      a.release(tl, 3.6);
      tl.to(p.sel, { opacity: 0, duration: 0.3 }, 4.2);
      a.leave(tl, 4.0, 'bottom', 0.9);

      // B types the name
      const nameAt = { x: p.nameR.x + 4, y: p.nameR.y + p.nameR.h * 0.72 };
      if (b) {
        b.enter(tl, nameAt, 2.0, 'top', 1.0);
        b.click(tl, 3.0);
        erase(tl, nameBox, 3.05, 0.3);
        typeIn(tl, typer, 3.1, 1.4, r, { typo: i % 2 === 1 ? 3 : false });
        b.moveTo(tl, { x: nameAt.x + Math.min(p.nameR.w, 300), y: nameAt.y + 30 }, 3.2, 1.4);
        b.leave(tl, 5.2, 'top', 0.9);
      } else {
        typeIn(tl, typer, 3.1, 1.2, r);
      }

      // C fills in the details and leaves a note
      const bit0 = p.bitR[0];
      const d = c ?? a;
      d.enter(tl, { x: bit0.x + 20, y: bit0.y + bit0.h }, 3.6, 'bottom', 0.9);
      d.click(tl, 4.5);
      erase(tl, scribbles, 4.55, 0.6, 0.05);
      tl.to(p.bits, { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out' }, 4.6);
      d.moveTo(tl, p.noteAt, 5.3, 0.9);
      d.click(tl, 6.2);
      tl.to(p.note, { opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(2.4)' }, 6.25);
      d.leave(tl, 6.7, 'top', 0.9);
      tl.to({}, { duration: 0.6 });

      // inner parallax while the panel travels
      if (p.body) {
        gsap.fromTo(p.body, { xPercent: 4 }, {
          xPercent: -4, ease: 'none',
          scrollTrigger: { trigger: p.gp, containerAnimation: slide, start: 'left right', end: 'right left', scrub: true },
        });
      }
    });

    return () => {
      svgs.forEach((s) => s.remove());
      typers.forEach((t) => t.restore());
    };
  }, section);
}
