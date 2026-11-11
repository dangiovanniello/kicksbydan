// One place that owns scrolling: Lenis when motion is allowed, native otherwise.
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

export const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

let lenis = null;
let lastY = scrollY;
let nativeVelocity = 0;

export function initScroll() {
  if (reducedMotion.matches) return;
  lenis = new Lenis({ autoRaf: true, anchors: true, lerp: 0.11 });
}

export function scrollToY(y) {
  if (lenis) lenis.scrollTo(y, { duration: 1.2 });
  else scrollTo({ top: y });
}

export function lockScroll(locked) {
  document.documentElement.classList.toggle('intro-lock', locked);
  if (!lenis) return;
  if (locked) lenis.stop();
  else lenis.start();
}

// Pixels per frame, positive when scrolling down.
export function scrollVelocity() {
  if (lenis) return lenis.velocity;
  nativeVelocity = scrollY - lastY;
  lastY = scrollY;
  return nativeVelocity;
}
