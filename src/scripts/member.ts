import { gsap, reduced, mount } from './core';
import { initChrome } from './chrome';
import { Actor, rel, relRect } from './actor';
import { rng, layer, stroke, rectD, lineD, squiggleD, draw, erase } from './sketch';
import { prepType, typeIn } from './type';
import { hello } from './sections/hello';

initChrome();

function memberHero() {
  const hero = document.querySelector<HTMLElement>('[data-mhero]');
  if (!hero) return;
  const name = hero.querySelector<HTMLElement>('[data-type]')!;
  if (reduced) {
    name.classList.add('prepped');
    return;
  }
  return gsap.context(() => {
    const r = rng(name.textContent!.length * 31);
    const slot = hero.querySelector<HTMLElement>('[data-slot]')!;
    const photo = hero.querySelector<HTMLElement>('[data-photo]')!;
    const flood = hero.querySelector<HTMLElement>('[data-flood]')!;
    const ins = hero.querySelectorAll('[data-in]');
    const bounds = { x: 0, y: 0, w: hero.offsetWidth, h: hero.offsetHeight };
    const slotR = relRect(slot, hero);
    const nameR = relRect(name, hero);
    const photoAt = rel(slot, hero);
    const nameAt = { x: nameR.x + 6, y: nameR.y + nameR.h * 0.7 };
    const floodAt = { x: bounds.w * 0.08, y: bounds.h * 0.82 };

    const svg = layer(hero);
    const frame = stroke(svg, rectD(slotR.x, slotR.y, slotR.w, slotR.h, r, 3));
    const xs = [stroke(svg, lineD(slotR.x + 12, slotR.y + 12, slotR.x + slotR.w - 12, slotR.y + slotR.h - 12, r)), stroke(svg, lineD(slotR.x + slotR.w - 12, slotR.y + 12, slotR.x + 12, slotR.y + slotR.h - 12, r))];
    const nameBox = stroke(svg, rectD(nameR.x - 8, nameR.y - 6, Math.min(nameR.w, bounds.w * 0.55) + 16, nameR.h + 12, r, 2));
    const typer = prepType(name);
    const a = Actor.in(hero, hero.querySelector<HTMLElement>('.cur')!.dataset.cur!, bounds, r);

    gsap.set(flood, { clipPath: `circle(0px at ${floodAt.x}px ${floodAt.y}px)` });
    gsap.set(ins, { opacity: 0, y: 14 });

    const tl = gsap.timeline({ delay: 0.35 });
    draw(tl, [frame, ...xs, nameBox], 0, 0.7, 0.06);
    a.enter(tl, { x: photoAt.x - 30, y: bounds.h + 60 }, 0.3, 'bottom', 0.01);
    a.carry(tl, photo, photoAt, photoAt, 0.35, 1.0);
    erase(tl, [frame, ...xs], 1.2, 0.3);
    a.click(tl, 1.4);
    a.moveTo(tl, nameAt, 1.55, 0.7);
    a.click(tl, 2.25);
    erase(tl, nameBox, 2.3, 0.25);
    typeIn(tl, typer, 2.3, 0.9, r, { typo: 2 });
    a.moveTo(tl, floodAt, 3.25, 0.7);
    a.click(tl, 3.95);
    tl.to(flood, { clipPath: `circle(${Math.hypot(bounds.w, bounds.h) * 1.05}px at ${floodAt.x}px ${floodAt.y}px)`, duration: 1.0, ease: 'power2.inOut' }, 4.0);
    tl.to(ins, { opacity: 1, y: 0, duration: 0.6, stagger: 0.08, ease: 'power3.out' }, 4.1);
    a.leave(tl, 4.3, 'right', 0.8);
    tl.timeScale(1.25);

    return () => {
      svg.remove();
      typer.restore();
    };
  }, hero);
}

function reveals() {
  if (reduced) return;
  return gsap.context(() => {
    const r = rng(7);
    const svgs: SVGSVGElement[] = [];
    document.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
      const kids = [...el.children];
      if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
      const svg = layer(el);
      const w = el.offsetWidth;
      const line = stroke(svg, squiggleD(0, -14, Math.min(w, 420), 4, r));
      gsap.set(kids, { opacity: 0, y: 24 });
      const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 85%', once: true } });
      draw(tl, line, 0, 0.5);
      tl.to(kids, { opacity: 1, y: 0, duration: 0.7, stagger: 0.08, ease: 'power3.out' }, 0.2);
      erase(tl, line, 0.7, 0.4);
      svgs.push(svg);
    });
    return () => svgs.forEach((s) => s.remove());
  });
}

mount([memberHero, reveals, hello]);
