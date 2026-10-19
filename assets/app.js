(() => {
  'use strict';
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = window.matchMedia('(max-width: 700px)');
  const motionButton = document.querySelector('.motion-toggle');
  const root = document.documentElement;
  const effects = new Set();
  let userPaused = false;
  try { userPaused = sessionStorage.getItem('kashmira-motion-paused') === 'true'; } catch { /* Preference storage is optional. */ }
  const motionOff = () => reduce.matches || userPaused;
  function applyMotion() {
    root.classList.add('motion-ready');
    root.classList.toggle('motion-paused', motionOff());
    if (motionButton) {
      motionButton.hidden = reduce.matches;
      motionButton.setAttribute('aria-pressed', String(userPaused));
      const label = userPaused ? 'Resume animations' : 'Pause animations';
      motionButton.setAttribute('aria-label', label);
      motionButton.querySelector('span').textContent = label;
    }
    if (motionOff()) [...effects].forEach(stop => stop());
  }
  motionButton?.addEventListener('click', () => {
    userPaused = !userPaused;
    try { sessionStorage.setItem('kashmira-motion-paused', String(userPaused)); } catch { /* Navigation remains usable without storage. */ }
    applyMotion();
  });
  reduce.addEventListener('change', applyMotion);
  applyMotion();
  document.addEventListener('visibilitychange', () => root.classList.toggle('motion-hidden', document.hidden));
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#site-nav');
  function setMenu(open, returnFocus = false) {
    if (!toggle || !nav) return;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    nav.classList.toggle('is-open', open);
    if (returnFocus) toggle.focus();
  }
  toggle?.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  nav?.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && toggle?.getAttribute('aria-expanded') === 'true') setMenu(false, true);
  });
  document.addEventListener('click', e => {
    if (mobile.matches && toggle?.getAttribute('aria-expanded') === 'true' && !e.target.closest('.site-header')) setMenu(false);
  });
  mobile.addEventListener('change', () => setMenu(false));
  document.documentElement.classList.add('nav-enhanced');
  const header = document.querySelector('.site-header');
  const progress = document.querySelector('.scroll-progress');
  let framePending = false;
  function updateScroll() {
    const max = document.documentElement.scrollHeight - innerHeight;
    header?.classList.toggle('scrolled', scrollY > 10);
    if (progress) progress.style.transform = `scaleX(${motionOff() || max <= 0 ? 0 : Math.min(1, scrollY / max)})`;
    framePending = false;
  }
  window.addEventListener('scroll', () => {
    if (!framePending) { framePending = true; requestAnimationFrame(updateScroll); }
  }, { passive: true });
  window.addEventListener('resize', updateScroll, { passive: true });
  updateScroll();
  // Animate entry without concealing off-screen or script-free content.
  const elements = [...document.querySelectorAll('[data-reveal]')];
  if (!motionOff() && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    }, { threshold: 0.06, rootMargin: '0px 0px 15px 0px' });
    elements.forEach((el, i) => {
      el.style.setProperty('--delay', `${(i % 3) * 65}ms`);
      observer.observe(el);
    });
    function revealAll() { elements.forEach(el => el.classList.add('is-visible')); observer.disconnect(); }
    reduce.addEventListener('change', revealAll);
    document.addEventListener('focusin', e => e.target.closest('[data-reveal]')?.classList.add('is-visible'));
  }
  // Continuous decorations run only while visible. All have a shared pause control.
  if ('IntersectionObserver' in window) {
    const scenes = new IntersectionObserver(entries => entries.forEach(entry => {
      entry.target.classList.toggle('motion-visible', entry.isIntersecting);
      entry.target.classList.toggle('scene-visible', entry.isIntersecting);
    }), { threshold: 0, rootMargin: '40px' });
    document.querySelectorAll('.doodle, .hero-art, .journey-trail').forEach(el => scenes.observe(el));
  }
  const smileButton = document.querySelector('.send-smile');
  const smileStatus = document.querySelector('#smile-status');
  const burst = document.querySelector('.smile-burst');
  let smileNumber = 0;
  smileButton?.addEventListener('click', () => {
    const messages = ['A little smile, just for you.', 'One more smile for your day.', 'Big feelings. A little smile.'];
    smileStatus.textContent = messages[smileNumber++ % messages.length];
    smileButton.classList.add('is-hello');
    if (motionOff() || !burst || typeof burst.animate !== 'function') return;
    // Repeated taps replace the previous burst instead of accumulating animation.
    [...effects].filter(stop => stop.isParticle).forEach(stop => stop());
    const width = burst.clientWidth;
    const height = burst.clientHeight;
    for (let i = 0; i < 10; i++) {
      const particle = document.createElement('img');
      particle.className = 'smile-particle'; particle.alt = '';
      particle.src = `assets/doodles/${i % 3 === 0 ? 'daisy' : i % 3 === 1 ? 'smile' : 'butterfly'}.svg`;
      particle.style.left = `${width * .5}px`; particle.style.top = `${height * .55}px`;
      burst.append(particle);
      const angle = i * Math.PI * 2 / 10 - Math.PI / 2;
      const distance = Math.min(width * .47, 220) * (i % 2 ? .75 : 1);
      const x = Math.cos(angle) * distance;
      const y = Math.sin(angle) * distance;
      const rotation = (i % 2 ? -1 : 1) * (30 + i * 8);
      const animation = particle.animate([
        { transform: 'translate(-50%, -50%) scale(.3)', opacity: 0 },
        { transform: `translate(calc(-50% + ${x * .8}px), calc(-50% + ${y * .8}px)) rotate(${rotation}deg) scale(1)`, opacity: 1, offset: .55 },
        { transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y + 22}px)) rotate(${rotation * 1.4}deg) scale(.7)`, opacity: 0 }
      ], { duration: 1000 + i * 25, easing: 'cubic-bezier(.2,.65,.3,1)', fill: 'both' });
      const stop = () => { animation.cancel(); particle.remove(); effects.delete(stop); };
      stop.isParticle = true;
      effects.add(stop);
      animation.finished.then(stop, stop);
    }
  });
  if (smileButton) smileButton.hidden = false;
  // Native details stay functional with no script or motion; enhance their height only.
  document.querySelectorAll('.care-item, .faq-list details').forEach(details => {
    const summary = details.querySelector('summary');
    let animation = null;
    let targetOpen = details.open;
    let stop = null;
    summary.addEventListener('click', event => {
      if (motionOff() || typeof details.animate !== 'function') return;
      event.preventDefault();
      const startHeight = details.getBoundingClientRect().height;
      targetOpen = animation ? !targetOpen : !details.open;
      if (animation) { animation.onfinish = null; animation.cancel(); effects.delete(stop); }
      details.style.height = ''; details.style.overflow = '';
      details.open = true;
      const endHeight = targetOpen ? details.getBoundingClientRect().height : summary.getBoundingClientRect().height + 1;
      details.style.overflow = 'hidden'; details.dataset.animating = 'true';
      animation = details.animate([{ height: `${startHeight}px` }, { height: `${endHeight}px` }], {
        duration: 340, easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'both'
      });
      stop = () => {
        if (!animation) return;
        animation.onfinish = null; animation.cancel(); animation = null;
        details.open = targetOpen;
        details.style.height = ''; details.style.overflow = '';
        delete details.dataset.animating; effects.delete(stop);
      };
      effects.add(stop); animation.onfinish = stop;
    });
  });
  const heroArt = document.querySelector('.hero-art');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  heroArt?.addEventListener('pointermove', event => {
    if (motionOff() || !finePointer.matches) return;
    const box = heroArt.getBoundingClientRect();
    const tilt = ((event.clientX - box.left) / box.width - .5) * 3;
    heroArt.style.setProperty('--portrait-tilt', `${tilt.toFixed(2)}deg`);
  }, { passive: true });
  heroArt?.addEventListener('pointerleave', () => heroArt.style.setProperty('--portrait-tilt', '0deg'));
  const form = document.querySelector('#booking-form');
  form?.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const name = form.querySelector('#booking-name').value.trim();
    const location = form.querySelector('#booking-location').value;
    const message = `Hello Dr. Kashmira,${name ? ` I’m ${name}.` : ''} I’d like to ask about an appointment. Preferred area: ${location}. Please let me know your availability. Thank you.`;
    const url = `https://wa.me/971505679198?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    const status = form.querySelector('.form-status');
    status.replaceChildren(document.createTextNode('Review and send your message in WhatsApp. If it didn’t open, '));
    const fallback = document.createElement('a');
    fallback.href = url; fallback.target = '_blank'; fallback.rel = 'noopener noreferrer';
    fallback.textContent = 'continue here ↗'; status.append(fallback);
  });
  if (form) form.querySelector('button[type=submit]').disabled = false;
})();
