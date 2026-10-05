const body=document.body;
const header=document.querySelector('[data-header]');
const menu=document.querySelector('.menu');
const nav=document.querySelector('.nav-links');
requestAnimationFrame(()=>body.classList.add('ready'));

menu?.addEventListener('click',()=>{
  const open=menu.getAttribute('aria-expanded')==='true';
  menu.setAttribute('aria-expanded',String(!open));
  nav?.classList.toggle('open',!open);
});
nav?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{
  nav.classList.remove('open');
  menu?.setAttribute('aria-expanded','false');
}));

const onScroll=()=>{
  header?.classList.toggle('scrolled',window.scrollY>12);
};
onScroll();
window.addEventListener('scroll',onScroll,{passive:true});

const revealObserver=new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
},{threshold:.08,rootMargin:'0px 0px -24px'});
document.querySelectorAll('.reveal').forEach(el=>revealObserver.observe(el));

document.querySelectorAll('[data-year]').forEach(el=>el.textContent=new Date().getFullYear());

const mobileBook=document.querySelector('.mobile-book');
const hero=document.querySelector('.hero');
if(mobileBook&&hero){
  const obs=new IntersectionObserver(([entry])=>{
    mobileBook.style.opacity=entry.isIntersecting?'0':'1';
    mobileBook.style.pointerEvents=entry.isIntersecting?'none':'auto';
  },{threshold:.15});
  obs.observe(hero);
}

const bg=document.querySelector('[data-parallax-bg]');
if(bg&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches){
  let ticking=false;
  window.addEventListener('scroll',()=>{
    if(ticking)return;
    ticking=true;
    requestAnimationFrame(()=>{
      const y=Math.min(window.scrollY*.025,22);
      bg.style.transform='scale(1.05) translate3d(0,'+y+'px,0)';
      ticking=false;
    });
  },{passive:true});
}

if(window.matchMedia('(pointer:fine)').matches){
  document.querySelectorAll('.magnetic').forEach(el=>{
    el.addEventListener('pointermove',e=>{
      const r=el.getBoundingClientRect();
      const x=(e.clientX-r.left-r.width/2)*.06;
      const y=(e.clientY-r.top-r.height/2)*.10;
      el.style.transform='translate('+x+'px,'+y+'px)';
    });
    el.addEventListener('pointerleave',()=>{el.style.transform='';});
  });
}
