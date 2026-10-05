const menuButton=document.querySelector('.menu-toggle');
const nav=document.querySelector('.site-nav');
const header=document.querySelector('.site-header');

menuButton?.addEventListener('click',()=>{
  const open=menuButton.getAttribute('aria-expanded')==='true';
  menuButton.setAttribute('aria-expanded',String(!open));
  nav?.classList.toggle('open',!open);
});
nav?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{
  nav.classList.remove('open');
  menuButton?.setAttribute('aria-expanded','false');
}));

requestAnimationFrame(()=>document.body.classList.add('motion-ready'));

const observer=new IntersectionObserver((entries)=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
},{threshold:.08,rootMargin:'0px 0px -28px'});
document.querySelectorAll('.reveal,.media-reveal').forEach(el=>observer.observe(el));

document.querySelectorAll('[data-year]').forEach(el=>{
  el.textContent=new Date().getFullYear();
});

let lastY=0;
let ticking=false;
const parallaxEls=[...document.querySelectorAll('[data-parallax]')];
const updateMotion=()=>{
  const vh=window.innerHeight;
  const y=window.scrollY;
  header?.classList.toggle('is-condensed',y>18);

  parallaxEls.forEach(el=>{
    const rect=el.getBoundingClientRect();
    if(rect.bottom<0||rect.top>vh) return;
    const factor=parseFloat(el.dataset.parallax||'0');
    const center=rect.top+rect.height/2-vh/2;
    const offset=Math.max(-28,Math.min(28,-center*factor));
    const img=el.querySelector('img');
    if(img) img.style.setProperty('--parallax-y',offset.toFixed(2)+'px');
  });
  ticking=false;
};
window.addEventListener('scroll',()=>{
  lastY=window.scrollY;
  if(!ticking){requestAnimationFrame(updateMotion);ticking=true;}
},{passive:true});
window.addEventListener('resize',()=>requestAnimationFrame(updateMotion));
updateMotion();

const counters=[...document.querySelectorAll('.count-up')];
const counterObserver=new IntersectionObserver((entries)=>{
  entries.forEach(entry=>{
    if(!entry.isIntersecting) return;
    const el=entry.target;
    const target=Number(el.dataset.count||0);
    const start=performance.now();
    const duration=900;
    const animate=(now)=>{
      const t=Math.min(1,(now-start)/duration);
      const eased=1-Math.pow(1-t,3);
      el.textContent=Math.round(target*eased);
      if(t<1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
    counterObserver.unobserve(el);
  });
},{threshold:.6});
counters.forEach(el=>counterObserver.observe(el));

const mobileBook=document.querySelector('.mobile-book');
const hero=document.querySelector('.dm-hero');
if(mobileBook&&hero){
  const heroObserver=new IntersectionObserver(([entry])=>{
    mobileBook.style.opacity=entry.isIntersecting?'0':'1';
    mobileBook.style.pointerEvents=entry.isIntersecting?'none':'auto';
  },{threshold:.16});
  heroObserver.observe(hero);
}

if(window.matchMedia('(pointer:fine)').matches){
  document.querySelectorAll('.button-lift').forEach(button=>{
    button.addEventListener('pointermove',(e)=>{
      const r=button.getBoundingClientRect();
      const x=(e.clientX-r.left-r.width/2)*.08;
      const y=(e.clientY-r.top-r.height/2)*.12;
      button.style.transform='translate('+x+'px,'+y+'px)';
    });
    button.addEventListener('pointerleave',()=>{button.style.transform='';});
  });
}
