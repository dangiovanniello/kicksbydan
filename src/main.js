import '@fontsource-variable/archivo/standard.css';
import './style.css';
import { initScroll, reducedMotion } from './scroll.js';
import { playIntro } from './intro.js';
import { initMotion, observeReveal } from './motion.js';
import { initCatalog } from './catalog-ui.js';
import { initStage } from './stage.js';

if (!reducedMotion.matches) document.documentElement.classList.add('motion');
document.querySelector('#year').textContent = new Date().getFullYear();

initScroll();
const catalog = initCatalog({ observeReveal });
initStage({ onView: catalog.openProduct });
initMotion();
playIntro();
