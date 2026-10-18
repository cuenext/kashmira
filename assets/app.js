(() => {
  'use strict';
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = window.matchMedia('(max-width: 700px)');
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
    if (progress) progress.style.transform = `scaleX(${reduce.matches || max <= 0 ? 0 : Math.min(1, scrollY / max)})`;
    framePending = false;
  }
  window.addEventListener('scroll', () => {
    if (!framePending) { framePending = true; requestAnimationFrame(updateScroll); }
  }, { passive: true });
  window.addEventListener('resize', updateScroll, { passive: true });
  updateScroll();
  // Animate entry without concealing off-screen or script-free content.
  const elements = [...document.querySelectorAll('[data-reveal]')];
  if (!reduce.matches && 'IntersectionObserver' in window) {
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
