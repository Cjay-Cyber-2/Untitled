import { gsap, reduced, lenis } from '../core';
import { Actor, rel, relRect } from '../actor';
import { rng, layer, stroke, hlD, draw } from '../sketch';
import { prepType, typeIn } from '../type';

// Set once the intro has run in this page load, so a window resize rebuild
// doesn't replay it. It resets on every visit or reload.
let played = false;

export function hero() {
  const section = document.querySelector<HTMLElement>('[data-hero]');
  if (!section) return;
  const stage = section.querySelector<HTMLElement>('[data-stage]')!;
  const word = section.querySelector<HTMLElement>('[data-type]')!;
  if (reduced) {
    word.classList.add('prepped');
    section.querySelectorAll<HTMLElement>('.cmt').forEach((c) => (c.style.opacity = '1'));
    return;
  }

  return gsap.context(() => {
    const r = rng(11);
    const box = section.querySelector<HTMLElement>('[data-box]')!;
    const sel = section.querySelector<HTMLElement>('[data-sel]')!;
    const size = section.querySelector<HTMLElement>('[data-size]')!;
    const cta = section.querySelector<HTMLElement>('[data-cta]')!;
    const [c1, c2] = section.querySelectorAll<HTMLElement>('.cmt');
    const ins = section.querySelectorAll('[data-in]');
    const skip = section.querySelector<HTMLButtonElement>('[data-skip]')!;
    const W = stage.offsetWidth;
    const H = stage.offsetHeight;
    const bounds = { x: 0, y: 0, w: W, h: H };

    // ── measure: wide (final) state first, then narrow
    const handle = sel.querySelectorAll('i')[3];
    const wide = { handle: rel(handle, stage), box: relRect(box, stage) };
    const ctaAt = rel(cta, stage);
    const c1At = rel(c1, stage, 0.1, 0.9);
    const c2At = rel(c2, stage, 0.1, 0.9);
    word.style.setProperty('--w', '58');
    const narrow = { handle: rel(handle, stage), box: relRect(box, stage) };

    const typer = prepType(word);
    const ada = Actor.in(stage, 'ada', bounds, r);
    const tobi = Actor.in(stage, 'tobi', bounds, r);
    const zara = Actor.in(stage, 'zara', bounds, r);
    const kemi = Actor.in(stage, 'kemi', bounds, r);
    const femi = Actor.in(stage, 'femi', bounds, r);
    const ngozi = Actor.in(stage, 'ngozi', bounds, r);

    // highlighter swipe under the stretched word
    const hlSvg = layer(stage, 'sk-hl');
    hlSvg.style.position = 'absolute';
    hlSvg.style.inset = '0';
    const hlY = wide.box.y + wide.box.h * 0.8;
    const hlX1 = wide.box.x + wide.box.w * 0.05;
    const hlX2 = wide.box.x + wide.box.w * 0.95;
    const hl = stroke(hlSvg, hlD(hlX1, hlX2, hlY, r), 'hl', Math.max(14, wide.box.h * 0.2));
    hl.style.setProperty('--c', 'var(--lime)');

    const tl = gsap.timeline({ paused: true, onComplete: done });

    // presence: six people join the file
    const avs = document.querySelectorAll('.tb-av');
    const editing = document.querySelector<HTMLElement>('[data-editing]');
    const count = { n: 0 };
    tl.from(avs, { scale: 0, duration: 0.45, stagger: 0.09, ease: 'back.out(3)' }, 0.1);
    if (editing) tl.to(count, { n: 6, duration: 0.6, ease: 'none', snap: { n: 1 }, onUpdate: () => (editing.textContent = String(count.n)) }, 0.1);
    tl.from(ins[0], { opacity: 0, y: 10, duration: 0.5 }, 0.2);
    tl.from(ins[1], { opacity: 0, y: 10, duration: 0.5 }, 0.3);
    gsap.set([ins[2], ins[3]], { opacity: 0 });

    // Ada makes a text box and types
    const typeStart = { x: narrow.box.x + 6, y: narrow.box.y + narrow.box.h * 0.62 };
    ada.enter(tl, typeStart, 0.45, 'left', 0.95);
    ada.click(tl, 1.42);
    tl.fromTo(sel, { opacity: 0, scale: 0.97 }, { opacity: 1, scale: 1, duration: 0.25, ease: 'power2.out' }, 1.45);
    typeIn(tl, typer, 1.55, 1.55, r, { typo: 4 });
    ada.moveTo(tl, { x: narrow.box.x + narrow.box.w * 0.55, y: narrow.box.y + narrow.box.h + 60 }, 3.15, 0.7);
    ada.leave(tl, 4.4, 'left', 0.8);

    // Tobi grabs the corner and stretches the word wide
    tobi.enter(tl, narrow.handle, 2.55, 'right', 0.95);
    tobi.press(tl, 3.55);
    tl.fromTo(word, { '--w': 58 }, {
      '--w': 118, duration: 0.85, ease: 'power2.inOut',
      onUpdate: () => (size.textContent = `W ${Math.round(box.offsetWidth)} × H ${Math.round(box.offsetHeight)}`),
    }, 3.62);
    tobi.moveTo(tl, wide.handle, '<', 0.85);
    tobi.release(tl, 4.5);
    tobi.leave(tl, 4.75, 'right', 0.8);
    tl.set(size, { textContent: 'Text' }, 0);

    // Zara swipes the highlighter
    zara.enter(tl, { x: hlX1, y: hlY }, 3.95, 'top', 0.8);
    zara.press(tl, 4.75);
    zara.trace(tl, [{ x: (hlX1 + hlX2) / 2, y: hlY + 3 }, { x: hlX2, y: hlY - 2 }], 4.8, 0.5);
    draw(tl, hl, 4.8, 0.5);
    zara.release(tl, 5.3);
    zara.leave(tl, 5.45, 'top', 0.7);

    // Kemi asks the question, Femi answers it
    kemi.enter(tl, c1At, 4.4, 'top', 0.85);
    kemi.click(tl, 5.25);
    tl.fromTo(c1, { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.45, ease: 'back.out(2.2)' }, 5.3);
    kemi.leave(tl, 5.9, 'top', 0.8);
    femi.enter(tl, c2At, 5.1, 'right', 0.8);
    femi.click(tl, 6.0);
    tl.fromTo(c2, { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(2.6)' }, 6.05);
    femi.leave(tl, 6.45, 'right', 0.7);

    // Ngozi drags the buttons in, the tagline inks in
    ngozi.enter(tl, { x: ctaAt.x + 40, y: H + 40 }, 4.9, 'bottom', 0.01);
    ngozi.carry(tl, cta, ctaAt, ctaAt, 4.95, 0.95);
    ngozi.click(tl, 6.05);
    tl.to(ins[2], { opacity: 1, duration: 0.6 }, 5.6);
    tl.from(ins[2], { y: 16, duration: 0.6, ease: 'power3.out' }, 5.6);
    ngozi.leave(tl, 6.4, 'bottom', 0.7);

    // deselect, done
    tl.to(sel, { opacity: 0, duration: 0.3 }, 5.85);
    tl.to(ins[3], { opacity: 1, duration: 0.5 }, 6.6);

    tl.timeScale(1.3);

    function done() {
      document.documentElement.classList.remove('is-intro');
      unbind();
    }
    const hurry = () => {
      if (tl.progress() < 1) tl.timeScale(7);
    };
    const keys = (e: KeyboardEvent) => {
      if (['ArrowDown', 'PageDown', ' ', 'End', 'Escape'].includes(e.key)) hurry();
    };
    const unbind = () => {
      window.removeEventListener('wheel', hurry);
      window.removeEventListener('touchmove', hurry);
      window.removeEventListener('keydown', keys);
    };
    skip.addEventListener('click', hurry);

    if (played || window.scrollY > 40) {
      tl.progress(1);
    } else {
      document.documentElement.classList.add('is-intro');
      window.addEventListener('wheel', hurry, { passive: true });
      window.addEventListener('touchmove', hurry, { passive: true });
      window.addEventListener('keydown', keys);
      tl.play(0);
    }
    played = true;

    // leaving the hero: the canvas drifts away
    gsap.to('[data-title]', {
      yPercent: -28, scale: 0.92, ease: 'none',
      scrollTrigger: { trigger: section, start: 'top top', end: 'bottom top', scrub: true },
    });
    gsap.to([c1, c2], {
      y: -120, ease: 'none',
      scrollTrigger: { trigger: section, start: 'top top', end: 'bottom top', scrub: true },
    });

    return () => {
      unbind();
      typer.restore();
      hlSvg.remove();
      word.style.removeProperty('--w');
      document.documentElement.classList.remove('is-intro');
      if (editing) editing.textContent = '6';
      lenis?.start();
    };
  }, section);
}
