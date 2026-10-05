const menuButton=document.querySelector('.menu-toggle');
const nav=document.querySelector('.site-nav');

menuButton?.addEventListener('click',()=>{
  const open=menuButton.getAttribute('aria-expanded')==='true';
  menuButton.setAttribute('aria-expanded',String(!open));
  nav?.classList.toggle('open',!open);
});
nav?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{
  nav.classList.remove('open');
  menuButton?.setAttribute('aria-expanded','false');
}));

const observer=new IntersectionObserver((entries)=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
},{threshold:.08,rootMargin:'0px 0px -20px'});
document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));

document.querySelectorAll('[data-year]').forEach(el=>{
  el.textContent=new Date().getFullYear();
});

const mobileBook=document.querySelector('.mobile-book');
const hero=document.querySelector('.hero-clean');
if(mobileBook&&hero){
  const heroObserver=new IntersectionObserver(([entry])=>{
    mobileBook.style.opacity=entry.isIntersecting?'0':'1';
    mobileBook.style.pointerEvents=entry.isIntersecting?'none':'auto';
  },{threshold:.18});
  heroObserver.observe(hero);
}
