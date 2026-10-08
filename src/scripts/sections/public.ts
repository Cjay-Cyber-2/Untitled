import { gsap, reduced, ScrollTrigger, lenis } from '../core';
import { Actor, rel, relRect } from '../actor';
import { rng, layer, stroke, rectD, draw, erase } from '../sketch';
import { site } from '../../data/site';

let bound = false;

function bindOnce(section: HTMLElement) {
  if (bound) return;
  bound = true;
  // platform tiles: colour floods from where the pointer enters
  section.querySelectorAll<HTMLElement>('[data-pf]').forEach((pf) => {
    pf.addEventListener('pointerenter', (e) => {
      const r = pf.getBoundingClientRect();
      pf.style.setProperty('--mx', `${e.clientX - r.left}px`);
      pf.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
  });
}

export function publicSection() {
  const section = document.querySelector<HTMLElement>('[data-public]');
  if (!section) return;
  bindOnce(section);

  return gsap.context(() => {
    // ── marquee of latest drops: speed and lean follow the scroll
    const mtrack = section.querySelector<HTMLElement>('[data-mtrack]')!;
    let calm: (() => void) | null = null;
    if (!reduced) {
      const loop = gsap.to(mtrack, { xPercent: -50, duration: 60, ease: 'none', repeat: -1 });
      const skew = gsap.quickTo(mtrack, 'skewX', { duration: 0.5, ease: 'power3.out' });
      let dir = 1;
      const st = ScrollTrigger.create({
        trigger: section.querySelector('[data-marquee]'),
        start: 'top bottom',
        end: 'bottom top',
        onToggle: (s) => (s.isActive ? loop.play() : loop.pause()),
        onUpdate: (s) => {
          const v = lenis ? lenis.velocity : s.getVelocity() / 60;
          if (Math.abs(v) > 0.3) dir = v > 0 ? 1 : -1;
          gsap.to(loop, { timeScale: dir * (1 + Math.min(14, Math.abs(v) * 0.9)), duration: 0.3, overwrite: true });
          skew(Math.max(-8, Math.min(8, -v * 0.35)));
        },
      });
      st.isActive ? loop.play() : loop.pause();
      calm = () => {
        gsap.to(loop, { timeScale: dir, duration: 0.8, overwrite: true });
        skew(0);
      };
      ScrollTrigger.addEventListener('scrollEnd', calm);
      gsap.from(section.querySelectorAll('[data-pf]'), {
        y: 40, opacity: 0, duration: 0.8, stagger: 0.08, ease: 'power3.out',
        scrollTrigger: { trigger: section.querySelector('.pf-grid'), start: 'top 85%' },
      });
    }

    if (reduced) return () => calm && ScrollTrigger.removeEventListener('scrollEnd', calm);

    // ── the pinned "post" moment
    const r = rng(71);
    const stage = section.querySelector<HTMLElement>('[data-stage]')!;
    const main = section.querySelector<HTMLElement>('[data-main]')!;
    const sides = [...section.querySelectorAll<HTMLElement>('[data-side]')].filter((s) => s.offsetWidth > 0);
    const post = section.querySelector<HTMLElement>('[data-post]')!;
    const postB = section.querySelector<HTMLElement>('[data-post-b]')!;
    const bar = section.querySelector<HTMLElement>('[data-upbar]')!;
    const toasts = [...section.querySelectorAll<HTMLElement>('[data-toasts] .toast')].filter((t) => t.offsetWidth > 0);
    const countBox = section.querySelector<HTMLElement>('[data-countbox]')!;
    const count = section.querySelector<HTMLElement>('[data-count]')!;
    const bounds = { x: 0, y: 0, w: stage.offsetWidth, h: stage.offsetHeight };

    const phones = [main, ...sides].map((p) => relRect(p.querySelector('.phone')!, stage));
    const postAt = rel(post, stage, 0.5, 0.55);
    const toastAt = toasts.length ? rel(toasts[0], stage, 0.08, 0.5) : postAt;

    const svg = layer(stage);
    const outlines = phones.map((p) => stroke(svg, rectD(p.x, p.y, p.w, p.h, r, 4)));

    gsap.set([main, ...sides], { opacity: 0 });
    gsap.set(toasts, { opacity: 0, x: 60, scale: 0.9 });
    gsap.set(countBox, { opacity: 0, y: 20 });
    const n = { v: 0 };
    count.textContent = '0';

    const kemi = Actor.in(stage, 'kemi', bounds, r);
    const tobi = Actor.in(stage, 'tobi', bounds, r);

    // outlines sketch in while the stage scrolls up, the main phone lands
    const pre = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: stage, start: 'top 85%', end: 'top top', scrub: 0.6 } });
    draw(pre, outlines, 0, 1, 0.15);
    pre.to(main, { opacity: 1, duration: 0.4 }, 0.8);
    pre.from(main, { y: 60, duration: 0.6, ease: 'power3.out' }, 0.8);

    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { trigger: stage, start: 'top top', end: '+=170%', pin: true, scrub: 0.6 },
    });

    sides.forEach((s, i) => {
      tl.to(s, { opacity: 1, duration: 0.5 }, 0.1 + i * 0.15);
      tl.from(s, { y: 120, duration: 1, ease: 'power3.out' }, 0.1 + i * 0.15);
    });
    erase(tl, outlines, 0.4, 0.6, 0.1);

    // Kemi hits Post
    kemi.enter(tl, postAt, 1.0, 'bottom', 1.0);
    kemi.click(tl, 2.1);
    tl.to(post, { scale: 0.94, duration: 0.08, yoyo: true, repeat: 1 }, 2.1);
    tl.to(bar, { scaleX: 1, duration: 0.9, ease: 'power1.inOut' }, 2.2);
    tl.to(postB, { opacity: 1, duration: 0.15 }, 3.0);
    kemi.leave(tl, 3.3, 'left', 0.9);

    // the internet notices
    if (toasts.length) {
      tobi.enter(tl, toastAt, 2.8, 'right', 0.9);
      toasts.forEach((t, i) => {
        tl.to(t, { opacity: 1, x: 0, scale: 1, duration: 0.45, ease: 'back.out(1.8)' }, 3.2 + i * 0.4);
      });
      tobi.trace(tl, toasts.map((t) => rel(t, stage, 0.85, 0.5)), 3.3, toasts.length * 0.4);
      tobi.click(tl, 3.3 + toasts.length * 0.4);
      tobi.leave(tl, 3.7 + toasts.length * 0.4, 'right', 0.8);
    }
    tl.to(countBox, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 3.4);
    tl.to(n, {
      v: site.totalFollowers, duration: 2, ease: 'power2.out',
      onUpdate: () => (count.textContent = Math.round(n.v).toLocaleString('en-US')),
    }, 3.5);
    tl.to({}, { duration: 0.8 });

    // side phones drift (parallax) while pinned
    sides.forEach((s, i) => {
      tl.to(s, { yPercent: i ? -8 : 6, duration: tl.duration(), ease: 'none' }, 0);
    });

    return () => {
      if (calm) ScrollTrigger.removeEventListener('scrollEnd', calm);
      svg.remove();
      count.textContent = site.totalFollowers.toLocaleString('en-US');
    };
  }, section);
}
