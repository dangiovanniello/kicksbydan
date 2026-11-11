// Scroll-driven motion: progress bar, per-shoe copy/number choreography, and section reveals.
// Everything is skipped under prefers-reduced-motion, where content simply shows.
export function initMotion(){
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');if(reduced.matches)return;
 document.documentElement.classList.add('motion');
 const bar=document.createElement('div');bar.className='scroll-progress';bar.setAttribute('aria-hidden','true');document.body.append(bar);
 const groups=['.photo-heading>div>*','.photo-heading>p','.real-pair>figure','.real-pair>div>*','.next-shoe','.vault-heading>*','.catalog-controls','.trade-section>div>*','.trade-section>form','.about-section>*','footer>*'];
 const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.12,rootMargin:'0px 0px -6% 0px'});
 groups.forEach(sel=>document.querySelectorAll(sel).forEach(el=>{const i=[...el.parentElement.children].indexOf(el);el.style.setProperty('--i',Math.min(i,6));el.classList.add('rv');io.observe(el)}));
 const stories=[...document.querySelectorAll('.shoe-story')],clamp=v=>Math.min(1,Math.max(0,v));
 function frame(){
  const max=document.documentElement.scrollHeight-innerHeight;bar.style.transform=`scaleX(${max>0?clamp(scrollY/max):0})`;
  for(const s of stories){const r=s.getBoundingClientRect();if(r.bottom<-innerHeight||r.top>innerHeight*2)continue;
   const p=clamp(-r.top/(r.height-innerHeight*.15)),enter=clamp(1-r.top/(innerHeight*.55)),leave=clamp((p-.78)/.2);
   s.style.setProperty('--p',p.toFixed(4));s.style.setProperty('--show',(enter*(1-leave)).toFixed(4))}
  requestAnimationFrame(frame)}
 requestAnimationFrame(frame);
 reduced.addEventListener('change',()=>{if(reduced.matches){document.documentElement.classList.remove('motion');document.querySelectorAll('.rv').forEach(el=>el.classList.add('in'))}});
}
