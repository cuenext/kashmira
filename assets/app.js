const body=document.body;
const header=document.querySelector('[data-header]');
const menu=document.querySelector('.menu');
const nav=document.querySelector('.nav-links');
const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
if(bg&&!reduceMotion){
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

if(window.matchMedia('(pointer:fine)').matches&&!reduceMotion){
  document.querySelectorAll('.magnetic').forEach(el=>{
    el.addEventListener('pointermove',e=>{
      const r=el.getBoundingClientRect();
      const x=(e.clientX-r.left-r.width/2)*.06;
      const y=(e.clientY-r.top-r.height/2)*.10;
      el.style.transform='translate('+x+'px,'+y+'px)';
    });
    el.addEventListener('pointerleave',()=>{el.style.transform='';});
  });

  document.querySelectorAll('.care-panel,.instagram-post,.case-card').forEach(card=>{
    card.addEventListener('pointermove',e=>{
      const r=card.getBoundingClientRect();
      const px=(e.clientX-r.left)/r.width-.5;
      const py=(e.clientY-r.top)/r.height-.5;
      const img=card.querySelector('img');
      if(img){
        img.style.transform='scale(1.045) translate('+(-px*5)+'px,'+(-py*5)+'px)';
      }
    });
    card.addEventListener('pointerleave',()=>{
      const img=card.querySelector('img');
      if(img) img.style.transform='';
    });
  });
}

const sectionLinks=[...document.querySelectorAll('.nav-links a[href^="#"],.nav-links a[href*="#"]')];
const sectionPairs=sectionLinks.map(link=>{
  const href=link.getAttribute('href')||'';
  const id=href.includes('#')?href.split('#')[1]:'';
  return id?{link,section:document.getElementById(id)}:null;
}).filter(x=>x?.section);
if(sectionPairs.length){
  const activeObserver=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(!entry.isIntersecting)return;
      sectionPairs.forEach(({link,section})=>{
        if(section===entry.target){
          sectionLinks.forEach(l=>l.classList.remove('section-active'));
          link.classList.add('section-active');
        }
      });
    });
  },{rootMargin:'-30% 0px -55% 0px',threshold:0});
  sectionPairs.forEach(({section})=>activeObserver.observe(section));
}

window.addEventListener('load',()=>body.classList.add('loaded'));


const instagramShell=document.querySelector('.instagram-live-shell');
if(instagramShell){
  const inner=instagramShell.querySelector('.instagram-live-inner');
  const syncInstagram=()=>{
    const iframe=inner?.querySelector('iframe');
    if(iframe){
      instagramShell.classList.add('instagram-loaded');
      instagramShell.classList.remove('instagram-failed');
      return true;
    }
    return false;
  };
  const igObserver=new MutationObserver(()=>syncInstagram());
  if(inner) igObserver.observe(inner,{childList:true,subtree:true});
  window.addEventListener('load',()=>{
    try{window.instgrm?.Embeds?.process();}catch(e){}
    setTimeout(()=>{
      if(!syncInstagram()) instagramShell.classList.add('instagram-failed');
    },5500);
  });
}


// v12 interactive care showcase
const careExperience=document.querySelector('[data-care-experience]');
if(careExperience){
  const tabs=[...careExperience.querySelectorAll('[data-care-tab]')];
  const slides=[...careExperience.querySelectorAll('[data-care-slide]')];
  const copies=[...careExperience.querySelectorAll('[data-care-copy]')];
  let active=0;
  let timer=null;
  let paused=false;

  const activateCare=(index,userInitiated=false)=>{
    active=(index+tabs.length)%tabs.length;
    tabs.forEach((tab,i)=>{
      const on=i===active;
      tab.classList.toggle('active',on);
      tab.setAttribute('aria-selected',String(on));
      tab.tabIndex=on?0:-1;
    });
    slides.forEach((slide,i)=>slide.classList.toggle('active',i===active));
    copies.forEach((copy,i)=>copy.classList.toggle('active',i===active));
    careExperience.classList.remove('is-playing');
    void careExperience.offsetWidth;
    if(!reduceMotion&&!paused) careExperience.classList.add('is-playing');
    if(userInitiated) restartCare();
  };

  const nextCare=()=>activateCare(active+1);
  const restartCare=()=>{
    clearInterval(timer);
    if(!reduceMotion&&!paused) timer=setInterval(nextCare,6000);
  };

  tabs.forEach((tab,i)=>{
    tab.addEventListener('click',()=>activateCare(i,true));
    tab.addEventListener('keydown',e=>{
      if(e.key==='ArrowRight'||e.key==='ArrowLeft'){
        e.preventDefault();
        const next=e.key==='ArrowRight'?i+1:i-1;
        const normalized=(next+tabs.length)%tabs.length;
        activateCare(normalized,true);
        tabs[normalized].focus();
      }
    });
  });

  careExperience.addEventListener('mouseenter',()=>{
    paused=true;
    clearInterval(timer);
    careExperience.classList.remove('is-playing');
  });
  careExperience.addEventListener('mouseleave',()=>{
    paused=false;
    activateCare(active);
    restartCare();
  });
  careExperience.addEventListener('focusin',()=>{
    paused=true;
    clearInterval(timer);
    careExperience.classList.remove('is-playing');
  });
  careExperience.addEventListener('focusout',e=>{
    if(!careExperience.contains(e.relatedTarget)){
      paused=false;
      activateCare(active);
      restartCare();
    }
  });

  activateCare(0);
  restartCare();
}
