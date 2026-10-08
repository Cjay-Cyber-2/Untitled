import { mount, gsap, scrollToTarget } from './core';
import { initChrome } from './chrome';
import { hero } from './sections/hero';
import { about } from './sections/about';
import { six } from './sections/six';
import { together } from './sections/together';
import { alone } from './sections/alone';
import { publicSection } from './sections/public';
import { origin } from './sections/origin';
import { nameUs } from './sections/nameus';
import { hello } from './sections/hello';

const chrome = initChrome();

mount([
  hero,
  about,
  six,
  together,
  alone,
  publicSection,
  origin,
  nameUs,
  hello,
  () => gsap.context(() => chrome.activeNav()),
]);

// arriving with #section in the URL
if (location.hash) {
  const target = document.querySelector<HTMLElement>(location.hash);
  if (target) document.fonts.ready.then(() => requestAnimationFrame(() => scrollToTarget(target, true)));
}
