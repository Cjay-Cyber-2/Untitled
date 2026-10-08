import { gsap, reduced, finePointer, ScrollTrigger } from '../core';

let bound = false;

function bindOnce(section: HTMLElement) {
  if (bound) return;
  bound = true;
  const rows = [...section.querySelectorAll<HTMLElement>('[data-row]')];
  const filters = [...section.querySelectorAll<HTMLButtonElement>('[data-f]')];

  filters.forEach((btn) => btn.addEventListener('click', () => {
    const f = btn.dataset.f!;
    filters.forEach((b) => {
      const on = b === btn;
      b.classList.toggle('is-on', on);
      b.setAttribute('aria-pressed', String(on));
    });
    const show = rows.filter((r) => f === 'all' || r.dataset.owner === f);
    rows.forEach((r) => r.classList.toggle('is-hidden', !show.includes(r)));
    if (!reduced) {
      gsap.set(rows.map((r) => r.querySelector('.al-cover')), { scaleX: 0 });
      gsap.fromTo(show, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.45, stagger: 0.05, ease: 'power3.out' });
    }
    ScrollTrigger.refresh();
  }));

  const pv = section.querySelector<HTMLElement>('[data-previewer]')!;
  const pvs = [...pv.querySelectorAll<HTMLElement>('.al-pv')];
  if (!finePointer || reduced) return;
  const xTo = gsap.quickTo(pv, 'x', { duration: 0.5, ease: 'power3.out' });
  const yTo = gsap.quickTo(pv, 'y', { duration: 0.5, ease: 'power3.out' });
  const rTo = gsap.quickTo(pv, 'rotate', { duration: 0.6, ease: 'power3.out' });
  let lastX = 0;
  rows.forEach((row) => {
    row.addEventListener('pointerenter', (e) => {
      const i = Number(row.dataset.preview);
      pvs.forEach((p, k) => p.classList.toggle('is-on', k === i));
      gsap.set(pv, { x: e.clientX + 28, y: e.clientY - 120 });
      gsap.to(pv, { opacity: 1, scale: 1, duration: 0.35, ease: 'back.out(2)' });
    });
    row.addEventListener('pointerleave', () => gsap.to(pv, { opacity: 0, scale: 0.8, duration: 0.25 }));
    window.addEventListener('scroll', () => {
      if (Number(gsap.getProperty(pv, 'opacity')) > 0 && !row.matches(':hover')) gsap.to(pv, { opacity: 0, scale: 0.8, duration: 0.2 });
    }, { passive: true });
    row.addEventListener('pointermove', (e) => {
      xTo(e.clientX + 28);
      yTo(e.clientY - 120);
      rTo(Math.max(-8, Math.min(8, (e.clientX - lastX) * 0.4)));
      lastX = e.clientX;
    });
  });
}

export function alone() {
  const section = document.querySelector<HTMLElement>('[data-alone]');
  if (!section) return;
  bindOnce(section);
  if (reduced) return;

  return gsap.context(() => {
    // each row is "written" by its owner: their cursor slides across as the row inks in
    section.querySelectorAll<HTMLElement>('[data-row]').forEach((row) => {
      const cur = row.querySelector<HTMLElement>('.cur')!;
      const cover = row.querySelector<HTMLElement>('.al-cover')!;
      const w = row.offsetWidth;
      const h = row.offsetHeight;
      gsap.set(cover, { scaleX: 1 });
      const tl = gsap.timeline({ paused: true });
      tl.to(cover, { scaleX: 0, duration: 0.95, ease: 'power2.inOut' }, 0.1);
      tl.fromTo(cur, { x: -20, y: h * 0.55, autoAlpha: 1 }, { x: w - 24, duration: 0.95, ease: 'power2.inOut' }, 0.1);
      tl.to(cur, { y: -50, x: w + 30, autoAlpha: 0, duration: 0.45, ease: 'power2.in' }, 1.1);
      ScrollTrigger.create({ trigger: row, start: 'top 90%', once: true, onEnter: () => tl.play() });
    });
  }, section);
}
