import { inventory } from './catalog.js';

// Listings that have a matching 36-angle turntable sequence in /public/rotations.
const rotationIds = [1, 2, 3, 4, 5, 7, 8, 10, 11, 12];

export const FRAME_COUNT = 36;
export const shoes = rotationIds.map(id => ({ ...inventory.find(p => p.id === id), frameBase: `/rotations/${id}` }));

export const brandLabel = { kobe: 'Kobe', jordan: 'Jordan', yeezy: 'Yeezy', other: 'Other' };
export const shortPrice = p => p.price.replace(/\.00$/, '');
