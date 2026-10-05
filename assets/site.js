const header=document.querySelector('.site-header');
const menuButton=document.querySelector('.menu-toggle');
const nav=document.querySelector('.main-nav');

const syncHeader=()=>{
  if(!header) return;
  if(document.body.classList.contains('home')){
    header.classList.toggle('scrolled',window.scrollY>24);
  }
};
syncHeader();
window.addEventListener('scroll',syncHeader,{passive:true});

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
},{threshold:.08,rootMargin:'0px 0px -24px'});
document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));
document.querySelectorAll('[data-year]').forEach(el=>el.textContent=new Date().getFullYear());

const hero=document.querySelector('.cinematic-hero');
const mobileBook=document.querySelector('.mobile-book');
if(hero&&mobileBook){
  const bookObserver=new IntersectionObserver(([entry])=>{
    mobileBook.style.opacity=entry.isIntersecting?'0':'1';
    mobileBook.style.pointerEvents=entry.isIntersecting?'none':'auto';
  },{threshold:.2});
  bookObserver.observe(hero);
}
