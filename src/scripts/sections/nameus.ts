import { gsap, reduced, ScrollTrigger } from '../core';
import { Actor, rel, relRect, type P } from '../actor';
import { rng } from '../sketch';
import { members, rejectedNames, memberBySlug, palette } from '../../data/site';

const KEY = 'untitled-pitches';
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

function stoneHTML(name: string, by: string, color: string) {
  return `<li class="stone is-new" style="--c:${color}"><span class="mono">RIP</span><s>${esc(name)}</s><span class="stone-by">${esc(by)}</span></li>`;
}

let formBound = false;

export function nameUs() {
  const section = document.querySelector<HTMLElement>('[data-name]');
  if (!section) return;
  const grave = section.querySelector<HTMLElement>('[data-grave]')!;

  // restore the visitor's own past pitches (this browser only)
  if (!formBound) {
    try {
      const saved: { name: string; by: string }[] = JSON.parse(localStorage.getItem(KEY) ?? '[]');
      saved.slice(-6).forEach((p) => grave.insertAdjacentHTML('afterbegin', stoneHTML(p.name, p.by, palette.lime)));
    } catch {}
  }

  return gsap.context(() => {
    const r = rng(97);
    const stage = section.querySelector<HTMLElement>('[data-stage]')!;
    const slot = section.querySelector<HTMLElement>('[data-slot]')!;
    const by = section.querySelector<HTMLElement>('[data-by]')!;
    const cmt = section.querySelector<HTMLElement>('[data-reject]')!;
    const form = section.querySelector<HTMLFormElement>('[data-form]')!;
    const input = form.querySelector<HTMLInputElement>('input')!;
    const bounds = { x: 0, y: 0, w: stage.offsetWidth, h: stage.offsetHeight };
    const original = slot.textContent!;
    const originalBy = by.textContent!;

    // measure the slot for every name it will show; long names shrink to fit
    const line = slot.parentElement!;
    const maxW = stage.offsetWidth - 48;
    const fitOf = (txt: string) => {
      line.style.setProperty('--fit', '1');
      line.style.transition = 'none';
      slot.textContent = txt;
      const w = slot.offsetWidth;
      const fit = Math.min(1, maxW / w);
      return { w: w * fit, fit };
    };
    const slotR = relRect(slot, stage);
    const names = rejectedNames.map((n) => ({ ...n, ...fitOf(n.name) }));
    const homeW = fitOf(original).w;
    slot.textContent = original;
    line.style.removeProperty('transition');
    const setFit = (tl: gsap.core.Timeline, fit: number, pos: gsap.Position) => tl.call(() => line.style.setProperty('--fit', String(fit)), [], pos);
    const cmtAt = rel(cmt, stage, 0.08, 0.9);
    const at = (w: number, dy = 0.7): P => ({ x: slotR.x + w + 8, y: slotR.y + slotR.h * dy });

    let shown = original;
    const setText = (s: string) => {
      shown = s;
      slot.textContent = s;
    };
    /** backspace to the shared prefix, then type the rest */
    const retype = (tl: gsap.core.Timeline, to: string, pos: gsap.Position, dur: number) => {
      const steps: string[] = [];
      let cur = '';
      tl.call(() => (cur = shown), [], pos);
      const proxy = { p: 0 };
      tl.fromTo(proxy, { p: 0 }, {
        p: 1, duration: dur, ease: 'none', immediateRender: false,
        onStart: () => {
          steps.length = 0;
          let s = cur;
          let k = 0;
          while (k < s.length && k < to.length && s[k] === to[k]) k++;
          while (s.length > k) { s = s.slice(0, -1); steps.push(s); }
          for (let i = k + 1; i <= to.length; i++) steps.push(to.slice(0, i));
          slot.classList.add('is-typing');
        },
        onUpdate: () => {
          const i = Math.min(steps.length - 1, Math.floor(proxy.p * steps.length));
          if (i >= 0 && steps[i] !== shown) setText(steps[i]);
        },
        onComplete: () => {
          setText(to);
          slot.classList.remove('is-typing');
        },
      }, '>');
    };

    const actors = Object.fromEntries(members.map((m) => [m.slug, Actor.in(stage, m.slug, bounds, r)]));
    const guest = Actor.in(stage, 'guest', bounds, r);

    // ── the idle loop: someone pitches, someone else kills it
    const loop = gsap.timeline({ repeat: -1, paused: true, repeatDelay: 0.6 });
    const reset = () => {
      Object.values(actors).forEach((a) => gsap.set(a.el, { autoAlpha: 0 }));
    };
    let t = 0.4;
    names.forEach((n, i) => {
      const a = actors[n.by];
      const killer = actors[members[(members.findIndex((m) => m.slug === n.by) + 2 + i) % members.length].slug];
      a.enter(loop, at(homeW), t, i % 2 ? 'left' : 'bottom', 0.8);
      loop.call(() => slot.classList.add('is-sel'), [], t + 0.85);
      loop.call(() => slot.classList.remove('is-sel'), [], t + 1.1);
      setFit(loop, n.fit, t + 1.1);
      retype(loop, n.name, t + 1.1, 0.9);
      a.moveTo(loop, at(n.w), t + 1.1, 0.9);
      loop.call(() => (by.textContent = `Suggested by ${memberBySlug(n.by).first}`), [], t + 1.2);
      a.leave(loop, t + 2.1, 'bottom', 0.7);
      killer.enter(loop, { x: slotR.x - 10, y: slotR.y + slotR.h * 0.52 }, t + 2.0, i % 2 ? 'top' : 'left', 0.8);
      killer.press(loop, t + 2.8);
      killer.moveTo(loop, { x: slotR.x + n.w + 10, y: slotR.y + slotR.h * 0.54 }, t + 2.85, 0.35);
      loop.call(() => slot.classList.add('is-struck'), [], t + 2.85);
      killer.release(loop, t + 3.2);
      loop.call(() => (by.textContent = `${memberBySlug(n.by).first}’s idea · ${n.cause}`), [], t + 3.2);
      killer.leave(loop, t + 4.0, 'right', 0.7);
      loop.call(() => slot.classList.remove('is-struck'), [], t + 4.2);
      setFit(loop, 1, t + 4.2);
      retype(loop, original, t + 4.2, 0.7);
      loop.call(() => (by.textContent = originalBy), [], t + 4.9);
      t += 5.6;
    });
    loop.eventCallback('onRepeat', reset);

    const st = ScrollTrigger.create({
      trigger: stage, start: 'top 75%', end: 'bottom 20%',
      onToggle: (s) => {
        if (reduced) return;
        if (s.isActive && !busy) loop.play();
        else loop.pause();
      },
    });

    // ── a visitor pitches a name
    let busy = false;
    const onSubmit = (e: SubmitEvent) => {
      e.preventDefault();
      const name = input.value.trim().replace(/\s+/g, ' ').slice(0, 28);
      if (!name || busy) return;
      busy = true;
      loop.pause();
      slot.classList.remove('is-struck', 'is-sel', 'is-typing');
      reset();
      const killer = members[Math.floor(Math.random() * members.length)];
      const ka = actors[killer.slug];
      const { w, fit } = fitOf(name);
      setText(shown);
      line.style.setProperty('--fit', '1');
      const tl = gsap.timeline({
        onComplete: () => {
          busy = false;
          if (st.isActive && !reduced) loop.restart();
        },
      });
      guest.enter(tl, at(homeW), 0, 'bottom', 0.7);
      setFit(tl, fit, 0.75);
      retype(tl, name, 0.75, Math.min(1.4, 0.3 + name.length * 0.06));
      guest.moveTo(tl, at(w), 0.75, 0.9);
      tl.call(() => (by.textContent = 'Suggested by you · under review…'), [], 0.9);
      guest.leave(tl, 2.0, 'bottom', 0.7);
      ka.enter(tl, { x: slotR.x - 10, y: slotR.y + slotR.h * 0.52 }, 1.9, 'top', 0.8);
      ka.press(tl, 2.75);
      ka.moveTo(tl, { x: slotR.x + w + 10, y: slotR.y + slotR.h * 0.54 }, 2.8, 0.35);
      tl.call(() => slot.classList.add('is-struck'), [], 2.8);
      ka.release(tl, 3.15);
      ka.moveTo(tl, cmtAt, 3.25, 0.7);
      ka.click(tl, 3.95);
      tl.call(() => {
        cmt.style.setProperty('--c', palette[killer.color]);
        const av = cmt.querySelector<HTMLElement>('[data-rav]')!;
        av.textContent = killer.first[0];
        av.style.setProperty('--c', palette[killer.color]);
        cmt.querySelector('[data-rname]')!.textContent = killer.first;
        cmt.querySelector('[data-rtext]')!.textContent = `Rejected. We’re keeping Untitled.`;
        by.textContent = `Your idea · rejected by ${killer.first}`;
        const entry = { name, by: `by you · rejected by ${killer.first}` };
        grave.insertAdjacentHTML('afterbegin', stoneHTML(entry.name, entry.by, palette.lime));
        gsap.from(grave.firstElementChild, { scale: 0.6, rotate: -8, opacity: 0, duration: 0.6, ease: 'back.out(2)' });
        try {
          const saved = JSON.parse(localStorage.getItem(KEY) ?? '[]');
          saved.push(entry);
          localStorage.setItem(KEY, JSON.stringify(saved.slice(-12)));
        } catch {}
      }, [], 4.0);
      tl.fromTo(cmt, { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(2.2)', immediateRender: false }, 4.0);
      ka.leave(tl, 4.6, 'right', 0.8);
      tl.to(cmt, { opacity: 0, duration: 0.3 }, 7.0);
      tl.call(() => slot.classList.remove('is-struck'), [], 7.0);
      setFit(tl, 1, 7.0);
      retype(tl, original, 7.0, 0.7);
      tl.call(() => (by.textContent = originalBy), [], 7.8);
      input.value = '';
      if (reduced) tl.progress(1);
    };
    form.addEventListener('submit', onSubmit);
    formBound = true;

    return () => {
      form.removeEventListener('submit', onSubmit);
      line.style.removeProperty('--fit');
      slot.textContent = original;
      slot.classList.remove('is-struck', 'is-sel', 'is-typing');
      by.textContent = originalBy;
    };
  }, section);
}
