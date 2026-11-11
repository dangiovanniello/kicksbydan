// Pairs grid, product dialog and the sell / trade form.
import { inventory, contact } from './catalog.js';
import { brandLabel, metaLine, shortPrice } from './data.js';
import { reducedMotion } from './scroll.js';

const arrow = '<svg><use href="#arrow"/></svg>';
const q = s => document.querySelector(s);
const cleanName = p => p.name.replace(' (1:1 Reps)', '');

export function initCatalog({ observeReveal }) {
  const grid = q('#grid');
  const dialog = q('#product-dialog');
  let brand = 'all';
  let firstRender = true;

  const tabs = [['all', 'All'], ...Object.entries(brandLabel)];
  q('#tabs').innerHTML = tabs.map(([value, label]) => `<button type="button" data-brand="${value}" aria-pressed="${value === brand}">${label}</button>`).join('');
  q('#hero-count').textContent = inventory.length;

  function render() {
    const list = inventory.filter(p => brand === 'all' || p.brand === brand);
    q('#pair-count').textContent = list.length;
    grid.innerHTML = list.map((p, i) => `
      <button class="card${firstRender ? '' : ' in'}" type="button" data-product="${p.id}" style="--i:${i % 4};view-transition-name:pair-${p.id}">
        <span class="card-img">
          <img src="${p.img}" alt="${cleanName(p)}" loading="lazy" width="800" height="800">
          ${p.replica ? '<span class="card-flag">1:1 replica</span>' : ''}
          <span class="card-go">${arrow}</span>
        </span>
        <span class="card-row"><span>${cleanName(p)}</span><span class="card-price">${shortPrice(p)}</span></span>
        <span class="card-sub">${[`Size ${p.size}`, p.used, p.box].filter(Boolean).join(' · ')}</span>
      </button>`).join('') || '<p class="empty">Nothing in that brand right now.</p>';
    if (firstRender) grid.querySelectorAll('.card').forEach(observeReveal);
    firstRender = false;
  }

  q('#tabs').addEventListener('click', e => {
    const button = e.target.closest('[data-brand]');
    if (!button || button.dataset.brand === brand) return;
    brand = button.dataset.brand;
    q('#tabs').querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
    if (document.startViewTransition && !reducedMotion.matches) document.startViewTransition(render);
    else render();
  });
  grid.addEventListener('click', e => {
    const card = e.target.closest('[data-product]');
    if (card) openProduct(Number(card.dataset.product));
  });

  function openProduct(id) {
    const p = inventory.find(item => item.id === id);
    const subject = encodeURIComponent(`${p.name}, size ${p.size}`);
    const body = encodeURIComponent(`Hi Dan,\n\nI'm interested in the ${p.name}, size ${p.size}, listed at ${p.price} (${[p.used, p.box].filter(Boolean).join(', ')}).${p.replica ? ' I understand this pair is a 1:1 replica.' : ''}\n\nIs it still available?`);
    q('#product-details').innerHTML = `
      <img class="pd-photo" src="${p.img}" alt="Dan’s pair: ${cleanName(p)}" width="800" height="800">
      <div class="pd-body">
        <p class="pd-meta">${metaLine(p)}</p>
        <h2 class="pd-name" id="pd-name">${cleanName(p)}</h2>
        <p class="pd-price">${shortPrice(p)}</p>
        ${p.replica ? '<p class="pd-flag">This pair is a 1:1 replica, not an authentic Nike product.</p>' : ''}
        <p class="pd-note">This is Dan’s photo of the actual pair. Message him to check it’s still available and sort out payment and delivery.</p>
        <div class="pd-actions">
          <a class="btn btn-light" href="${contact.instagram}" target="_blank" rel="noopener">DM on Instagram ${arrow}</a>
          <a class="btn btn-line" href="mailto:${contact.email}?subject=${subject}&body=${body}">Email Dan</a>
        </div>
      </div>`;
    dialog.showModal();
  }
  q('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });

  // Netlify Forms handles the POST when hosted there. Anywhere else the POST fails,
  // so the same details open as a ready-to-send email instead of being lost.
  const form = q('#trade-form');
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const status = q('#form-status');
    const button = form.querySelector('button[type=submit]');
    const data = new FormData(form);
    button.disabled = true;
    status.textContent = 'Sending…';
    try {
      if (['localhost', '127.0.0.1'].includes(location.hostname)) throw new Error('local preview');
      const response = await fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(data).toString() });
      if (!response.ok) throw new Error('not accepted');
      status.textContent = 'Sent. Dan will get back to you.';
      form.reset();
    } catch {
      const lines = [
        `Name: ${data.get('name')}`, `Contact: ${data.get('contact')}`, `I want to: ${data.get('action_type')}`,
        `Model: ${data.get('shoe_model')}`, `Size: ${data.get('shoe_size') || '-'}`, `Price: ${data.get('price_or_asking') || '-'}`,
        '', data.get('message') || ''
      ];
      location.href = `mailto:${contact.email}?subject=${encodeURIComponent(`${data.get('action_type')}: ${data.get('shoe_model')}`)}&body=${encodeURIComponent(lines.join('\n'))}`;
      status.textContent = 'Your email app should open with everything filled in. Just hit send.';
    } finally {
      button.disabled = false;
    }
  });

  render();
  return { openProduct };
}
