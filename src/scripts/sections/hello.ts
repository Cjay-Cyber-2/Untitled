import { gsap, reduced, finePointer, scrollToTarget } from '../core';
import { Actor, rel } from '../actor';
import { rng } from '../sketch';
import { members } from '../../data/site';

let bound = false;

function bindOnce() {
  if (bound) return;
  bound = true;
  const copy = document.querySelector<HTMLButtonElement>('[data-copy]');
  const out = document.querySelector<HTMLElement>('[data-copied]');
  copy?.addEventListener('click', async () => {
    const email = copy.dataset.copy!;
    try {
      await navigator.clipboard.writeText(email);
      if (out) out.textContent = 'Copied. Now paste it somewhere nice.';
    } catch {
      if (out) out.textContent = email;
    }
  });

  document.querySelector('[data-top]')?.addEventListener('click', () => scrollToTarget(0));

  const clock = document.querySelector<HTMLElement>('[data-clock]');
  if (clock) {
    const fmt = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Lagos' });
    const tick = () => (clock.textContent = fmt.format(new Date()));
    tick();
    setInterval(tick, 15000);
  }

  // footer word: letters near the pointer stretch wide, far ones squeeze
  const word = document.querySelector<HTMLElement>('[data-word]');
  if (word && finePointer && !reduced) {
    const spans = [...word.querySelectorAll<HTMLElement>('span')];
    word.addEventListener('pointermove', (e) => {
      spans.forEach((s) => {
        const b = s.getBoundingClientRect();
        const d = Math.abs(e.clientX - (b.left + b.width / 2)) / window.innerWidth;
        s.style.setProperty('--w', String(Math.round(150 - Math.min(1, d * 3.2) * 95)));
      });
    });
    word.addEventListener('pointerleave', () => spans.forEach((s) => s.style.setProperty('--w', '100')));
  }
}

export function hello() {
  const section = document.querySelector<HTMLElement>('[data-hello]');
  bindOnce();
  if (!section || reduced) return;

  return gsap.context(() => {
    const r = rng(113);
    const pin = section.querySelector<HTMLElement>('[data-pin]')!;
    const canvas = section.querySelector<HTMLElement>('[data-canvas]')!;
    const cta = section.querySelector<HTMLElement>('[data-cta]')!;
    const boards = [...section.querySelectorAll<HTMLElement>('[data-board]')].filter((b) => b.offsetWidth > 0);
    const bounds = { x: 0, y: 0, w: pin.offsetWidth, h: pin.offsetHeight };

    // each cursor rests beside a board
    const spots = members.map((_, i) => {
      const b = boards[i % boards.length];
      const p = rel(b, pin, 0.7 + r() * 0.25, 0.75 + r() * 0.2);
      return p;
    });
    const actors = members.map((m) => Actor.in(pin, m.slug, bounds, r));

    gsap.set(cta, { opacity: 0, y: 40, scale: 0.94 });

    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { trigger: pin, start: 'top top', end: '+=170%', pin: true, scrub: 0.7 },
    });
    // zoomed into the first board, then pull back to see the whole file
    tl.fromTo(canvas, { scale: 3.4 }, { scale: 1, duration: 3, ease: 'power2.inOut' }, 0);
    tl.from(boards.slice(1), { opacity: 0, y: 20, duration: 0.6, stagger: 0.08 }, 1.1);
    actors.forEach((a, i) => {
      a.enter(tl, spots[i], 2.0 + i * 0.12, (['left', 'right', 'top', 'bottom'] as const)[i % 4], 1.0);
    });
    tl.to(canvas, { opacity: 0.55, duration: 0.6 }, 3.3);
    tl.to(cta, { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: 'back.out(1.6)' }, 3.4);
    // everyone waves
    actors.forEach((a, i) => {
      tl.to(a.arrow, { rotate: -22, duration: 0.15, yoyo: true, repeat: 5, ease: 'sine.inOut', transformOrigin: '30% 90%' }, 4.0 + i * 0.06);
    });
    tl.to({}, { duration: 0.8 });
  }, section);
}
