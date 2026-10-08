import { gsap, reduced } from '../core';
import { rel } from '../actor';
import { rng, smooth, tickD, type Pt } from '../sketch';

const NS = 'http://www.w3.org/2000/svg';

export function origin() {
  const section = document.querySelector<HTMLElement>('[data-origin]');
  if (!section || reduced) return;

  return gsap.context(() => {
    const r = rng(89);
    const pin = section.querySelector<HTMLElement>('[data-pin]')!;
    const view = section.querySelector<HTMLElement>('[data-view]')!;
    const track = section.querySelector<HTMLElement>('[data-track]')!;
    const cps = [...section.querySelectorAll<HTMLElement>('[data-cp]')];
    const cur = track.querySelector<HTMLElement>('.cur')!;

    // ── measure dots in track space, build the route through them
    const dots = cps.map((cp) => rel(cp.querySelector('[data-dot]')!, track));
    const start: Pt = [dots[0].x - 120, dots[0].y + 30];
    const end: Pt = [dots[dots.length - 1].x + 160, dots[dots.length - 1].y - 20];
    const pts: Pt[] = [start];
    dots.forEach((d, i) => {
      if (i > 0) {
        const prev = dots[i - 1];
        pts.push([(prev.x + d.x) / 2, (prev.y + d.y) / 2 + (i % 2 ? 46 : -46) + (r() - 0.5) * 20]);
      }
      pts.push([d.x, d.y]);
    });
    pts.push(end);
    const d = smooth(pts, 1);

    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('class', 'or-route');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('width', String(track.scrollWidth));
    svg.setAttribute('height', String(track.offsetHeight));
    const map = document.createElementNS(NS, 'path');
    map.setAttribute('class', 'map');
    map.setAttribute('d', d);
    const trail = document.createElementNS(NS, 'path');
    trail.setAttribute('class', 'trail');
    trail.setAttribute('d', d);
    trail.setAttribute('pathLength', '1');
    svg.append(map, trail);
    track.prepend(svg);

    const ticks = dots.map((p) => {
      const t = document.createElementNS(NS, 'path');
      t.setAttribute('d', tickD(p.x + 2, p.y - 28, 18, r));
      t.setAttribute('pathLength', '1');
      t.setAttribute('class', 'trail');
      t.style.strokeWidth = '3';
      svg.appendChild(t);
      return t;
    });

    const span = end[0] - start[0];
    const at = (x: number) => Math.max(0, Math.min(1, (x - start[0]) / span));
    const distance = () => Math.max(0, track.scrollWidth - view.offsetWidth);

    gsap.set(trail, { strokeDashoffset: 1 });
    gsap.set(ticks, { strokeDashoffset: 1 });
    gsap.set(cps.map((c) => c.querySelector('[data-card]')), { opacity: 0.35, y: (i) => (i % 2 ? -10 : 10) });
    gsap.set(cps.map((c) => c.querySelector('[data-dot] i')), { scale: 0 });
    gsap.set(cur, { autoAlpha: 1 });

    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { trigger: pin, start: 'top top', end: () => `+=${distance() + window.innerHeight * 0.6}`, pin: true, scrub: 0.8, invalidateOnRefresh: true },
    });
    const T = 10;
    tl.to(track, { x: () => -distance(), duration: T }, 0);
    tl.to(trail, { strokeDashoffset: 0, duration: T }, 0);
    tl.to(cur, {
      duration: T,
      motionPath: { path: trail, align: trail, alignOrigin: [0.12, 0.08] },
    }, 0);

    dots.forEach((p, i) => {
      const t = at(p.x) * T;
      const cp = cps[i];
      tl.to(cp.querySelector('[data-dot] i'), { scale: 1, duration: 0.3, ease: 'back.out(3)' }, t);
      tl.fromTo(cp.querySelector('[data-dot]'), { scale: 1 }, { scale: 1.35, duration: 0.15, yoyo: true, repeat: 1, immediateRender: false }, t);
      tl.to(ticks[i], { strokeDashoffset: 0, duration: 0.25 }, t + 0.05);
      tl.to(cp.querySelector('[data-card]'), { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }, t - 0.1);
    });
    tl.to({}, { duration: 0.6 });

    return () => svg.remove();
  }, section);
}
