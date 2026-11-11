// The pinned 360° stage. Each featured pair is a 36-frame photographic turntable;
// scrolling turns the current pair once and then hands over to the next.
import { shoes, FRAME_COUNT, metaLine, shortPrice } from './data.js';
import { reducedMotion, scrollToY } from './scroll.js';

const clamp01 = v => Math.min(1, Math.max(0, v));
const lerp = (a, b, t) => a + (b - a) * t;
const easeInOut = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const pad2 = n => String(n).padStart(2, '0');

const SPIN_PART = 0.8; // share of each pair's scroll spent turning; the rest is the hand-over
const MOBILE = 760;

export function initStage({ onView }) {
  const wrap = document.querySelector('#rotation');
  const stage = document.querySelector('#stage');
  const canvas = document.querySelector('#turntable');
  const cursor = document.querySelector('#drag-cursor');
  const ctx = canvas.getContext('2d');
  const el = id => document.querySelector(id);
  const text = { index: el('#st-index'), meta: el('#st-meta'), name: el('#st-name'), price: el('#st-price') };

  wrap.style.setProperty('--n', shoes.length);
  el('#st-total').textContent = pad2(shoes.length);
  el('#rail').innerHTML = shoes.map((s, i) => `<li><button type="button" aria-label="${s.name}">${pad2(i + 1)}</button></li>`).join('');
  const ticks = [...el('#rail').querySelectorAll('button')];

  let width = 0, height = 0, dirty = true;
  let progress = 0, shown = -1, lastTime = 0;
  let turn = 0, spinVelocity = 0, dragging = false, dragX = 0;
  let drawn = '';
  const cache = new Map();
  const debug = (window.__kicksStage = { index: 0, frame: 0, loaded: 0 });

  function resize() {
    const ratio = Math.min(devicePixelRatio || 1, 2);
    width = stage.clientWidth;
    height = stage.clientHeight;
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.imageSmoothingQuality = 'high';
    dirty = true;
  }
  new ResizeObserver(resize).observe(stage);
  resize();

  function load(index) {
    if (index < 0 || index >= shoes.length || cache.has(index)) return;
    const state = { images: [], loaded: 0 };
    cache.set(index, state);
    let next = 0;
    const request = () => {
      if (cache.get(index) !== state || next >= FRAME_COUNT) return;
      const n = next++;
      const image = new Image();
      image.decoding = 'async';
      image.onload = () => { state.images[n] = image; state.loaded++; dirty = true; request(); };
      image.onerror = request;
      image.src = `${shoes[index].frameBase}/${pad2(n + 1)}.jpg`;
    };
    for (let i = 0; i < 4; i++) request();
  }

  function nearestFrame(state, frame) {
    if (!state) return null;
    for (let d = 0; d < FRAME_COUNT; d++) {
      const image = state.images[(frame + d) % FRAME_COUNT] || state.images[(frame - d + FRAME_COUNT) % FRAME_COUNT];
      if (image) return image;
    }
    return null;
  }

  // entry: 0 while the stage is still a card peeking under the hero, 1 once it fills the screen.
  function drawShoe(index, frame, slide, alpha, entry, peek) {
    const image = nearestFrame(cache.get(index), frame);
    if (!image) return;
    const mobile = width < MOBILE;
    const fullW = mobile ? Math.min(width * 1.18, height * 0.74) : Math.min(width * 0.6, height * 1.02, 1060);
    const w = lerp(Math.min(fullW, peek * 1.75, width * 0.9), fullW, entry) * (1 - Math.abs(slide) * 0.08);
    const h = w * image.naturalHeight / image.naturalWidth;
    const x = lerp(width * 0.5, mobile ? width * 0.5 : width * 0.68, entry) + slide * width * (mobile ? 0.95 : 0.55);
    const y = lerp(peek * 0.5, mobile ? height * 0.39 : height * 0.5, entry);
    ctx.globalAlpha = alpha;
    ctx.drawImage(image, x - w / 2, y - h / 2, w, h);
    ctx.globalAlpha = 1;
  }

  function showInfo(index) {
    const s = shoes[index];
    text.index.textContent = pad2(index + 1);
    text.meta.innerHTML = metaLine(s) + (s.replica ? ' · <b>1:1 replica</b>' : '');
    text.name.textContent = s.name.replace(' (1:1 Reps)', '');
    text.price.textContent = shortPrice(s);
    ticks.forEach((t, i) => t.setAttribute('aria-current', String(i === index)));
    if (shown >= 0 && !reducedMotion.matches) {
      const from = index > shown ? '105%' : '-105%';
      [text.meta, text.name, text.price].forEach((node, i) => {
        node.getAnimations().forEach(a => a.cancel());
        node.animate({ transform: [`translateY(${from})`, 'translateY(0)'] }, { duration: 750, delay: i * 55, easing: 'cubic-bezier(.16, 1, .3, 1)', fill: 'backwards' });
      });
    }
    shown = index;
  }

  function frame(time) {
    requestAnimationFrame(frame);
    const delta = Math.min(64, time - lastTime || 16);
    lastTime = time;
    const rect = wrap.getBoundingClientRect();
    const vh = innerHeight;
    if (rect.bottom < -50 || rect.top > vh + 50) return;

    const heroHeight = Math.max(1, Math.min(wrap.offsetTop, vh * 0.9));
    const entryRaw = clamp01(1 - rect.top / heroHeight);
    const entry = reducedMotion.matches ? 1 : easeInOut(entryRaw);
    stage.style.setProperty('--e', entryRaw.toFixed(4));
    stage.style.setProperty('--in', clamp01((entryRaw - 0.72) / 0.28).toFixed(4));

    const track = wrap.offsetHeight - vh;
    const target = Math.min(shoes.length - 0.001, clamp01(-rect.top / track) * shoes.length);
    progress = reducedMotion.matches ? target : progress + (target - progress) * (1 - Math.exp(-delta / 90));
    if (Math.abs(progress - target) < 0.0002) progress = target;

    // Free spin: idle turn while the stage is still under the hero, plus drag inertia.
    if (!dragging) {
      if (entryRaw < 0.25 && !reducedMotion.matches) spinVelocity = lerp(spinVelocity, 0.00015, 0.04);
      turn += spinVelocity * delta;
      spinVelocity *= Math.pow(0.94, delta / 16);
    }

    const index = Math.floor(progress);
    const part = progress - index;
    const handOver = reducedMotion.matches ? 0 : easeInOut(clamp01((part - SPIN_PART) / (1 - SPIN_PART)));
    const rotation = (((Math.min(1, part / SPIN_PART) + turn) % 1) + 1) % 1;
    const frameIndex = reducedMotion.matches ? 0 : Math.floor(rotation * FRAME_COUNT) % FRAME_COUNT;

    load(index);
    if (part > 0.3) load(index + 1);
    for (const key of cache.keys()) if (Math.abs(key - index) > 2) cache.delete(key);

    const shownIndex = handOver > 0.5 ? Math.min(shoes.length - 1, index + 1) : index;
    if (shownIndex !== shown) showInfo(shownIndex);
    ticks.forEach((t, i) => t.style.setProperty('--f', clamp01(progress - i).toFixed(3)));

    const key = [index, frameIndex, handOver.toFixed(3), entry.toFixed(3)].join();
    if (dirty || key !== drawn) {
      const peek = Math.max(160, vh - heroHeight);
      // The frames are shot on white, so multiply lets two of them overlap without boxes.
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, width, height);
      ctx.globalCompositeOperation = 'multiply';
      // The outgoing pair is gone before the incoming one is fully in, so they never ghost over each other.
      drawShoe(index, frameIndex, -handOver, 1 - clamp01(handOver * 1.7), entry, peek);
      if (handOver > 0 && index < shoes.length - 1) drawShoe(index + 1, 0, 1 - handOver, clamp01((handOver - 0.3) / 0.7), entry, peek);
      drawn = key;
      dirty = false;
    }
    debug.index = index;
    debug.frame = frameIndex;
    debug.loaded = cache.get(index)?.loaded || 0;
  }
  requestAnimationFrame(frame);

  // Drag to turn the shoe by hand.
  canvas.addEventListener('pointerdown', e => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    dragging = true;
    dragX = e.clientX;
    spinVelocity = 0;
    canvas.classList.add('dragging');
    cursor.classList.add('down');
  });
  addEventListener('pointermove', e => {
    if (!dragging) return;
    const step = -(e.clientX - dragX) / Math.max(320, width * 0.55);
    dragX = e.clientX;
    turn += step;
    spinVelocity = lerp(spinVelocity, step / 16, 0.5);
  });
  const release = () => { dragging = false; canvas.classList.remove('dragging'); cursor.classList.remove('down'); };
  addEventListener('pointerup', release);
  addEventListener('pointercancel', release);

  // "Drag" follower for mouse users.
  if (matchMedia('(hover: hover) and (pointer: fine)').matches && !reducedMotion.matches) {
    let cx = 0, cy = 0, tx = 0, ty = 0, active = false;
    canvas.style.cursor = 'none';
    canvas.addEventListener('pointermove', e => {
      const r = stage.getBoundingClientRect();
      tx = e.clientX - r.left;
      ty = e.clientY - r.top;
      if (!active) { cx = tx; cy = ty; active = true; cursor.classList.add('on'); }
    });
    canvas.addEventListener('pointerleave', () => { active = false; cursor.classList.remove('on'); });
    (function follow() {
      cx += (tx - cx) * 0.2;
      cy += (ty - cy) * 0.2;
      cursor.style.transform = `translate(${cx.toFixed(1)}px, ${cy.toFixed(1)}px)`;
      requestAnimationFrame(follow);
    })();
  }

  ticks.forEach((tick, i) => tick.addEventListener('click', () => {
    const top = wrap.getBoundingClientRect().top + scrollY;
    scrollToY(top + ((i + 0.02) / shoes.length) * (wrap.offsetHeight - innerHeight));
  }));
  el('#st-view').addEventListener('click', () => onView(shoes[Math.max(0, shown)].id));

  load(0);
  showInfo(0);
}
