import { inventory } from './catalog.js';

// Listings that have a matching 36-angle turntable sequence in /public/rotations.
const rotationIds = [14, 16, 1, 2, 3, 13, 4, 5, 15, 7, 8, 10, 11, 12];

export const FRAME_COUNT = 36;
export const shoes = rotationIds.map(id => ({ ...inventory.find(p => p.id === id), frameBase: `/rotations/${id}` }));

export const brandLabel = { kobe: 'Kobe', jordan: 'Jordan', yeezy: 'Yeezy', other: 'Other' };
export const shortPrice = p => p.price.replace(/\.00$/, '');

// "Kobe · Size 13 M · Worn Once · No Box": brand is left out for 'other', box when the listing does not say.
export const metaLine = p => [p.brand === 'other' ? null : brandLabel[p.brand], `Size ${p.size}`, p.used, p.box].filter(Boolean).join(' · ');
