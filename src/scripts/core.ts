import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { CustomEase } from 'gsap/CustomEase';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase, MotionPathPlugin);

// A hand moving a mouse: quick start, a small overshoot, then a settle.
CustomEase.create('human', 'M0,0 C0.22,0 0.3,0.88 0.54,0.985 0.68,1.022 0.82,1.004 1,1');

ScrollTrigger.config({ ignoreMobileResize: true });

export { gsap, ScrollTrigger, SplitText };

export const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
export const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
export const isSmall = () => window.innerWidth < 760;

export let lenis: Lenis | null = null;

export function startScroll() {
  if (reduced) return;
  lenis = new Lenis({ lerp: 0.11, wheelMultiplier: 0.95 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis?.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}

export function scrollToTarget(target: string | HTMLElement | number, immediate = false) {
  if (lenis) lenis.scrollTo(target as never, { offset: 0, immediate, duration: 1.4 });
  else if (typeof target === 'number') window.scrollTo({ top: target });
  else {
    const el = typeof target === 'string' ? document.querySelector(target) : target;
    el?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
  }
}

/** A section owns one gsap.context; on width changes every section is reverted and rebuilt in DOM order. */
export type SectionInit = () => gsap.Context | void;

export function mount(inits: SectionInit[]) {
  let ctxs: (gsap.Context | void)[] = [];
  const build = () => {
    ctxs = inits.map((fn) => {
      try {
        return fn();
      } catch (err) {
        console.error(err);
      }
    });
    ScrollTrigger.sort();
    ScrollTrigger.refresh();
  };
  const teardown = () => {
    for (let i = ctxs.length - 1; i >= 0; i--) ctxs[i]?.revert();
    ctxs = [];
  };

  const run = () => build();
  if (document.fonts?.status !== 'loaded') document.fonts.ready.then(run);
  else run();

  let w = window.innerWidth;
  let t: number | undefined;
  window.addEventListener('resize', () => {
    if (Math.abs(window.innerWidth - w) < 2) return;
    w = window.innerWidth;
    window.clearTimeout(t);
    t = window.setTimeout(() => {
      teardown();
      build();
    }, 220);
  });
}
