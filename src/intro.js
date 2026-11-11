// Logo intro. The badge is split into layers (ring, arc text, Kicks, by, Dan, underline)
// so it can be written on in the order a hand would draw it, then it flies into the header.
import { lockScroll, reducedMotion } from './scroll.js';

const clamp01 = v => Math.min(1, Math.max(0, v));
const easeInOut = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOut = t => 1 - Math.pow(1 - t, 3);
const easeOutExpo = t => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));
const span = (now, start, end) => clamp01((now - start) / (end - start));

const DRAW_MS = 2150;
const HOLD_MS = 350;
const EXIT_MS = 950;

export function playIntro() {
  const root = document.documentElement;
  const intro = document.querySelector('#intro');
  const logo = document.querySelector('#intro-logo');

  const land = () => {
    root.classList.add('ready', 'landed');
    intro.classList.add('done');
    lockScroll(false);
  };
  if (reducedMotion.matches) return land();

  const layer = name => logo.querySelectorAll(`.l-${name}`);
  const set = (els, prop, value) => els.forEach(el => el.style.setProperty(prop, value));
  const [ring, arc, kicks, by, dan, line] = ['ring', 'arc', 'kicks', 'by', 'dan', 'line'].map(layer);

  let start = 0;
  let exiting = false;
  let raf = 0;

  function draw(now) {
    if (!start) start = now;
    const t = now - start;
    set(ring, '--a', (easeInOut(span(t, 0, 1150)) * 1.05).toFixed(4));
    set(arc, '--a', (easeInOut(span(t, 200, 1450)) * 1.12).toFixed(4));
    set(kicks, '--w', (4 + easeInOut(span(t, 380, 1180)) * 100).toFixed(2));
    set(by, '--o', easeOut(span(t, 1050, 1350)).toFixed(3));
    set(dan, '--w', (38 + easeInOut(span(t, 1180, 1720)) * 68).toFixed(2));
    set(line, '--w', (18 + easeOutExpo(span(t, 1640, DRAW_MS)) * 94).toFixed(2));
    logo.style.transform = `scale(${(0.9 + 0.1 * easeOut(span(t, 0, DRAW_MS + HOLD_MS))).toFixed(4)})`;
    if (t < DRAW_MS + HOLD_MS) raf = requestAnimationFrame(draw);
    else exit();
  }

  function exit() {
    if (exiting) return;
    exiting = true;
    cancelAnimationFrame(raf);
    // Finish every layer in case the intro was skipped mid-draw.
    set([...ring, ...arc], '--a', 1.2);
    set([...kicks, ...dan, ...line], '--w', 120);
    set(by, '--o', 1);

    const from = logo.getBoundingClientRect();
    const to = document.querySelector('#header-logo').getBoundingClientRect();
    const dx = to.left + to.width / 2 - (from.left + from.width / 2);
    const dy = to.top + to.height / 2 - (from.top + from.height / 2);
    const current = getComputedStyle(logo).transform;

    root.classList.add('ready');
    lockScroll(false);
    intro.style.pointerEvents = 'none';
    intro.animate({ backgroundColor: ['#000', 'rgb(0 0 0 / 0)'] }, { duration: 500, fill: 'forwards', easing: 'ease-out' });
    logo.animate(
      { transform: [current === 'none' ? 'scale(1)' : current, `translate(${dx}px, ${dy}px) scale(${to.width / logo.offsetWidth})`] },
      { duration: EXIT_MS, easing: 'cubic-bezier(.76, 0, .24, 1)', fill: 'forwards' }
    ).finished.then(land);
  }

  lockScroll(true);
  intro.addEventListener('click', exit, { once: true });
  addEventListener('keydown', exit, { once: true });
  // Start only when the layers are decoded so the first frames are not blank.
  const images = [...logo.querySelectorAll('img')];
  Promise.all(images.map(img => img.decode().catch(() => {}))).then(() => { raf = requestAnimationFrame(draw); });
}
