// Page-level motion: scroll reveals, header behaviour, velocity marquee and fitted headlines.
import { reducedMotion, scrollVelocity } from './scroll.js';

const io = new IntersectionObserver(entries => entries.forEach(entry => {
  if (!entry.isIntersecting) return;
  entry.target.classList.add('in');
  io.unobserve(entry.target);
}), { threshold: 0.12, rootMargin: '0px 0px -7% 0px' });

export const observeReveal = el => io.observe(el);

// Scale a headline so its widest line exactly fills its container.
function fitText(el, pickSelector, max) {
  const fit = () => {
    const selector = pickSelector();
    el.style.fontSize = '100px';
    const widest = Math.max(...[...el.querySelectorAll(selector)].map(node => node.getBoundingClientRect().width));
    const room = el.parentElement.clientWidth - parseFloat(getComputedStyle(el.parentElement).paddingLeft) * 2;
    el.style.fontSize = Math.min(max, (100 * room) / widest * 0.975).toFixed(2) + 'px';
  };
  fit();
  document.fonts.ready.then(fit);
  addEventListener('resize', fit);
}

export function initMotion() {
  document.querySelectorAll('[data-reveal]').forEach(observeReveal);
  fitText(document.querySelector('#hero-title'), () => (innerWidth <= 760 ? '.line > span' : '.row'), 190);
  fitText(document.querySelector('#wordmark'), () => '.line > span', 400);

  const header = document.querySelector('#header');
  const stage = document.querySelector('#stage');
  const marquee = document.querySelector('#marquee');
  const loopWidth = () => marquee.firstElementChild.getBoundingClientRect().width;
  let lastY = scrollY, offset = 0, skew = 0, lastTime = 0;

  function frame(time) {
    requestAnimationFrame(frame);
    const delta = Math.min(64, time - lastTime || 16);
    lastTime = time;
    const y = scrollY;
    const velocity = scrollVelocity();

    // Header: hide going down, return going up, and flip colour over the white stage.
    if (Math.abs(y - lastY) > 4) {
      header.classList.toggle('hidden', y > lastY && y > 160);
      lastY = y;
    }
    const s = stage.getBoundingClientRect();
    const overStage = s.top < 40 && s.bottom > 40;
    header.classList.toggle('on-light', overStage);
    header.classList.toggle('scrolled', y > 24 && !overStage);

    if (!reducedMotion.matches) {
      offset = (offset + delta * 0.05 + Math.abs(velocity) * 0.55) % loopWidth();
      skew += (Math.max(-7, Math.min(7, velocity * 0.12)) - skew) * 0.1;
      marquee.style.transform = `translate3d(${-offset.toFixed(1)}px, 0, 0) skewX(${(-skew).toFixed(2)}deg)`;
    }
  }
  requestAnimationFrame(frame);
}
