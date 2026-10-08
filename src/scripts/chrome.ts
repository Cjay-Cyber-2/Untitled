/** Everything that lives outside the sections: top bar, the visitor's cursor, page wipes, tab title. */
import { gsap, ScrollTrigger, finePointer, reduced, startScroll, scrollToTarget, lenis } from './core';

const root = document.documentElement;

function guestCursor() {
  if (!finePointer) return;
  const el = document.querySelector<HTMLElement>('.guest');
  if (!el) return;
  const tag = el.querySelector<HTMLElement>('.cur-tag')!;
  let n = '';
  try {
    n = sessionStorage.getItem('untitled-guest') ?? '';
    if (!n) {
      n = String(100 + Math.floor(Math.random() * 900));
      sessionStorage.setItem('untitled-guest', n);
    }
  } catch {
    n = String(100 + Math.floor(Math.random() * 900));
  }
  const base = `You · Guest #${n}`;
  tag.textContent = base;
  root.classList.add('has-guest');

  let x = -100;
  let y = -100;
  let raf = 0;
  const paint = () => {
    raf = 0;
    el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  };
  window.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    x = e.clientX - 3;
    y = e.clientY - 2;
    root.classList.add('guest-on');
    if (!raf) raf = requestAnimationFrame(paint);
  }, { passive: true });
  document.addEventListener('pointerleave', () => root.classList.remove('guest-on'));
  window.addEventListener('blur', () => root.classList.remove('guest-on'));

  const arrow = el.querySelector('.cur-arrow')!;
  window.addEventListener('pointerdown', () => gsap.to(arrow, { scale: 0.8, duration: 0.08 }));
  window.addEventListener('pointerup', () => gsap.to(arrow, { scale: 1, duration: 0.25, ease: 'back.out(3)' }));

  document.addEventListener('pointerover', (e) => {
    const t = (e.target as HTMLElement).closest<HTMLElement>('[data-cursor], a, button, input, textarea');
    if (!t) {
      tag.textContent = base;
      el.style.removeProperty('--c');
      root.classList.remove('guest-hidden');
      return;
    }
    if (t.matches('input, textarea')) {
      root.classList.add('guest-hidden');
      return;
    }
    root.classList.remove('guest-hidden');
    tag.textContent = t.dataset.cursor ?? (t.matches('a') ? 'Open' : 'Click');
    el.style.setProperty('--c', 'var(--lime)');
  });
}

function progress() {
  const bar = document.querySelector<HTMLElement>('[data-progress]');
  const label = document.querySelector<HTMLElement>('[data-build]');
  if (!bar) return;
  let last = -1;
  const update = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    bar.style.transform = `scaleX(${p})`;
    const pct = Math.round(p * 100);
    if (label && pct !== last) {
      last = pct;
      label.textContent = pct >= 99 ? 'Built. Still untitled.' : `Building… ${pct}%`;
    }
  };
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
}

function activeNav() {
  const links = [...document.querySelectorAll<HTMLAnchorElement>('.tb-nav a')];
  links.forEach((a) => {
    const id = a.getAttribute('href')?.split('#')[1];
    const sec = id ? document.getElementById(id) : null;
    if (!sec) return;
    ScrollTrigger.create({
      trigger: sec,
      start: 'top 50%',
      end: 'bottom 50%',
      onToggle: (st) => a.classList.toggle('is-active', st.isActive),
    });
  });
}

function menu() {
  const btn = document.querySelector<HTMLButtonElement>('[data-menu]');
  const sheet = document.querySelector<HTMLElement>('[data-sheet]');
  if (!btn || !sheet) return;
  const set = (open: boolean) => {
    btn.setAttribute('aria-expanded', String(open));
    btn.textContent = open ? 'Close' : 'Menu';
    sheet.hidden = !open;
    if (open && !reduced) gsap.from(sheet.querySelectorAll('a'), { y: 24, opacity: 0, stagger: 0.035, duration: 0.45, ease: 'power3.out' });
  };
  btn.addEventListener('click', () => set(sheet.hidden));
  sheet.addEventListener('click', (e) => {
    if ((e.target as HTMLElement).closest('a')) set(false);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !sheet.hidden) set(false);
  });
}

function links() {
  document.addEventListener('click', (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href]');
    if (!a || a.target === '_blank' || a.hasAttribute('download')) return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin) return;

    // same-page anchor
    if (url.pathname === location.pathname && url.hash) {
      const target = document.querySelector<HTMLElement>(url.hash);
      if (target) {
        e.preventDefault();
        scrollToTarget(target);
        history.replaceState(null, '', url.hash);
      }
      return;
    }
    if (url.pathname === location.pathname && !url.hash) {
      e.preventDefault();
      scrollToTarget(0);
      return;
    }

    // another page: wipe, then go
    if (reduced) return;
    e.preventDefault();
    const color = a.dataset.wipe ?? 'var(--lime)';
    try { sessionStorage.setItem('untitled-wipe', color); } catch {}
    const wipe = document.querySelector<HTMLElement>('.wipe')!;
    wipe.style.setProperty('--wipe', color);
    root.classList.add('is-leaving');
    lenis?.stop();
    gsap.timeline({ onComplete: () => { location.href = url.href; } })
      .set(wipe, { transformOrigin: '50% 100%' })
      .to(wipe, { scaleY: 1, duration: 0.55, ease: 'power4.inOut' })
      .to(wipe.querySelector('span'), { opacity: 1, duration: 0.2 }, '-=0.15');
  });
}

function wipeIn() {
  const wipe = document.querySelector<HTMLElement>('.wipe');
  if (!wipe || !root.classList.contains('wipe-in')) return;
  try { sessionStorage.removeItem('untitled-wipe'); } catch {}
  gsap.set(wipe, { scaleY: 1, transformOrigin: '50% 0%' });
  root.classList.remove('wipe-in');
  gsap.to(wipe, { scaleY: 0, duration: 0.7, ease: 'power4.inOut', delay: 0.05 });
}

function tabTitle() {
  const original = document.title;
  document.addEventListener('visibilitychange', () => {
    document.title = document.hidden ? 'come back, we still don’t have a name 🥲' : original;
  });
}

export function initChrome() {
  if (history.scrollRestoration) history.scrollRestoration = 'manual';
  startScroll();
  wipeIn();
  guestCursor();
  progress();
  menu();
  links();
  tabTitle();
  window.addEventListener('pageshow', (e) => {
    if (e.persisted) {
      root.classList.remove('is-leaving');
      gsap.set('.wipe', { scaleY: 0 });
      lenis?.start();
    }
  });
  console.log('%cUntitled', 'font: 900 40px sans-serif; color:#800020; background:#d4ff4f; padding:4px 12px;');
  console.log('Six builders. Still no name. If you are reading this, you should probably build with us.');
  return { activeNav };
}
