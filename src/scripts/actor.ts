/**
 * The cursor engine. An Actor is one member's cursor inside a stage.
 * Positions are measured once (before any tween exists) relative to the stage,
 * and the Actor remembers where it is so every move knows its start.
 */
import { gsap } from './core';
import type { Rand } from './sketch';
import { jit } from './sketch';

export type P = { x: number; y: number };
export type Side = 'left' | 'right' | 'top' | 'bottom';

export function rel(el: Element, base: Element, ax = 0.5, ay = 0.5): P {
  const a = el.getBoundingClientRect();
  const b = base.getBoundingClientRect();
  return { x: a.left - b.left + a.width * ax, y: a.top - b.top + a.height * ay };
}

export function relRect(el: Element, base: Element) {
  const a = el.getBoundingClientRect();
  const b = base.getBoundingClientRect();
  return { x: a.left - b.left, y: a.top - b.top, w: a.width, h: a.height };
}

const Y_EASES = ['sine.inOut', 'power1.inOut', 'power2.inOut', 'sine.out'];

export class Actor {
  x = 0;
  y = 0;
  arrow: Element;
  ring: Element;

  constructor(
    public el: HTMLElement,
    public bounds: { x: number; y: number; w: number; h: number },
    private r: Rand,
  ) {
    this.arrow = el.querySelector('.cur-arrow')!;
    this.ring = el.querySelector('.cur-ring')!;
  }

  static in(scope: ParentNode, who: string, bounds: Actor['bounds'], r: Rand) {
    const el = scope.querySelector<HTMLElement>(`.cur[data-cur="${who}"]`);
    if (!el) throw new Error(`cursor ${who} missing`);
    return new Actor(el, bounds, r);
  }

  off(side: Side, near: P): P {
    const b = this.bounds;
    switch (side) {
      case 'left': return { x: b.x - 90, y: near.y + jit(this.r, 80) };
      case 'right': return { x: b.x + b.w + 60, y: near.y + jit(this.r, 80) };
      case 'top': return { x: near.x + jit(this.r, 120), y: b.y - 80 };
      default: return { x: near.x + jit(this.r, 120), y: b.y + b.h + 60 };
    }
  }

  enter(tl: gsap.core.Timeline, to: P, at: gsap.Position, side: Side = 'bottom', dur = 0.9) {
    const s = this.off(side, to);
    tl.set(this.el, { x: s.x, y: s.y, autoAlpha: 1 }, at);
    this.x = s.x;
    this.y = s.y;
    return this.moveTo(tl, to, '<', dur);
  }

  private yEase = 'sine.inOut';
  private yDur = 0.7;

  moveTo(tl: gsap.core.Timeline, to: P, at: gsap.Position, dur = 0.7) {
    this.yEase = Y_EASES[Math.floor(this.r() * Y_EASES.length)];
    this.yDur = dur * (0.86 + this.r() * 0.22);
    tl.to(this.el, { x: to.x, duration: dur, ease: 'human' }, at);
    tl.to(this.el, { y: to.y, duration: this.yDur, ease: this.yEase }, '<');
    this.x = to.x;
    this.y = to.y;
    return this;
  }

  /** Follow a list of points at constant speed (writing, dragging along a line). */
  trace(tl: gsap.core.Timeline, pts: P[], at: gsap.Position, dur: number) {
    if (!pts.length) return this;
    tl.to(this.el, { keyframes: { x: pts.map((p) => p.x), y: pts.map((p) => p.y), easeEach: 'none' }, duration: dur, ease: 'none' }, at);
    const last = pts[pts.length - 1];
    this.x = last.x;
    this.y = last.y;
    return this;
  }

  click(tl: gsap.core.Timeline, at: gsap.Position) {
    tl.to(this.arrow, { scale: 0.8, duration: 0.07, ease: 'power2.out' }, at);
    tl.to(this.arrow, { scale: 1, duration: 0.14, ease: 'back.out(3)' }, '>');
    tl.fromTo(this.ring, { scale: 0.2, opacity: 0.9 }, { scale: 1.7, opacity: 0, duration: 0.4, ease: 'power2.out', immediateRender: false }, '<-0.07');
    return this;
  }

  press(tl: gsap.core.Timeline, at: gsap.Position) {
    tl.to(this.arrow, { scale: 0.82, duration: 0.1 }, at);
    return this;
  }

  release(tl: gsap.core.Timeline, at: gsap.Position) {
    tl.to(this.arrow, { scale: 1, duration: 0.18, ease: 'back.out(3)' }, at);
    return this;
  }

  leave(tl: gsap.core.Timeline, at: gsap.Position, side: Side = 'right', dur = 0.75) {
    this.moveTo(tl, this.off(side, this), at, dur);
    tl.set(this.el, { autoAlpha: 0 }, '>');
    return this;
  }

  /** An element rides along with the cursor from its current spot into its natural place. */
  carry(tl: gsap.core.Timeline, el: Element, elAnchor: P, to: P, at: gsap.Position, dur = 0.8) {
    const from = { x: this.x, y: this.y };
    const dx = from.x - elAnchor.x;
    const dy = from.y - elAnchor.y;
    gsap.set(el, { x: dx, y: dy, scale: 0.55, rotate: jit(this.r, 8) });
    this.moveTo(tl, to, at, dur);
    tl.to(el, { y: 0, duration: this.yDur, ease: this.yEase }, '<');
    tl.to(el, { x: 0, duration: dur, ease: 'human' }, '<');
    tl.to(el, { scale: 1.06, rotate: 0, duration: dur * 0.8, ease: 'power2.out' }, '<');
    tl.to(el, { scale: 1, duration: 0.3, ease: 'back.out(2.4)' }, '>');
    return this;
  }
}
