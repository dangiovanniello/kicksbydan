// Logo intro. The badge is revealed through a droplet of liquid glass (see glass-reveal.js),
// then it flies into the header.
import { lockScroll, reducedMotion } from './scroll.js';
import { createGlassReveal } from './glass-reveal.js';

const EXIT_MS = 950;
const FALLBACK_HOLD_MS = 900;

export function playIntro() {
  const root = document.documentElement;
  const intro = document.querySelector('#intro');
  const stage = document.querySelector('#intro-logo');
  const mark = stage.querySelector('img');

  const land = () => {
    root.classList.add('ready', 'landed');
    intro.classList.add('done');
    lockScroll(false);
  };
  if (reducedMotion.matches) return land();

  let reveal = null;
  let exiting = false;

  // Swap the canvas for the same logo as an image, then fly it onto the header logo.
  function exit() {
    if (exiting) return;
    exiting = true;
    if (reveal) {
      mark.style.width = `${reveal.logoSize()}px`;
      reveal.dispose();
    }
    intro.classList.add('plain');
    const from = mark.getBoundingClientRect();
    const to = document.querySelector('#header-logo').getBoundingClientRect();
    const dx = to.left + to.width / 2 - (from.left + from.width / 2);
    const dy = to.top + to.height / 2 - (from.top + from.height / 2);

    root.classList.add('ready');
    lockScroll(false);
    intro.style.pointerEvents = 'none';
    intro.animate({ backgroundColor: ['#000', 'rgb(0 0 0 / 0)'] }, { duration: 500, fill: 'forwards', easing: 'ease-out' });
    stage.animate(
      { transform: ['none', `translate(${dx}px, ${dy}px) scale(${to.width / from.width})`] },
      { duration: EXIT_MS, easing: 'cubic-bezier(.76, 0, .24, 1)', fill: 'forwards' }
    ).finished.then(land);
  }

  // No WebGL2, or the logo failed to load: show the logo as it is, then fly it up.
  function plainIntro() {
    reveal?.dispose();
    reveal = null;
    intro.classList.add('plain');
    setTimeout(exit, FALLBACK_HOLD_MS);
  }

  const skip = () => (reveal ? reveal.finish() : exit());

  lockScroll(true);
  intro.addEventListener('click', skip, { once: true });
  addEventListener('keydown', skip, { once: true });

  reveal = createGlassReveal(stage, {
    logo: '/logo/mark.webp',
    originalColors: true,
    tileSize: 520,
    logoScale: 0.78,
    speed: 1.1,
    onEnd: exit,
    onError: plainIntro
  });
  if (!reveal) plainIntro();
}
