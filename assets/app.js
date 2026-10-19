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
  document.addEventListener('visibilitychange', () => {
    root.classList.toggle('motion-hidden', document.hidden);
    if (document.hidden) [...effects].forEach(stop => stop());
  });
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
    document.querySelectorAll('.doodle, .hero-art, .journey-trail, .space-planet, .space-cruiser').forEach(el => scenes.observe(el));
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
      particle.src = `assets/play/${['sun', 'flower', 'rocket', 'tooth-friend', 'rainbow'][i % 5]}.svg?v=36`;
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
  const buddyPicker = document.querySelector('.buddy-picker');
  const buddyImage = document.querySelector('#visit-buddy');
  const buddyStatus = document.querySelector('#buddy-status');
  const buddies = { 'tooth-friend': 'Your tooth buddy is here to say hello.', rainbow: 'A rainbow buddy, ready for a colourful hello.', rocket: 'Your rocket buddy is ready for a little adventure.' };
  if (buddyPicker && buddyImage && buddyStatus) {
    buddyPicker.addEventListener('click', event => {
      const button = event.target.closest('[data-buddy]');
      if (!button || !Object.hasOwn(buddies, button.dataset.buddy)) return;
      buddyPicker.querySelectorAll('[data-buddy]').forEach(choice => choice.setAttribute('aria-pressed', String(choice === button)));
      buddyImage.src = `assets/play/${button.dataset.buddy}.svg?v=36`;
      buddyStatus.textContent = buddies[button.dataset.buddy];
    });
    buddyPicker.hidden = false;
  }
  // Space play is untimed: collected stars remain reachable and motion is optional.
  const launchButton = document.querySelector('.rocket-launch');
  const cruiser = document.querySelector('.space-cruiser');
  const launchStatus = document.querySelector('#launch-status');
  let stopLaunch = null;
  if (launchButton && cruiser && launchStatus) {
    launchButton.hidden = false;
    launchButton.addEventListener('click', () => {
      launchStatus.textContent = 'Rocket away! A little hello among the stars.';
      stopLaunch?.();
      if (motionOff() || typeof cruiser.animate !== 'function') return;
      const current = getComputedStyle(cruiser);
      const animation = cruiser.animate([
        { left: current.left, top: current.top, transform: current.transform, opacity: 1 },
        { left: '46%', top: '0%', transform: 'rotate(35deg) scale(1.1)', opacity: 1, offset: .45 },
        { left: '86%', top: '-15%', transform: 'rotate(45deg) scale(.85)', opacity: .2 }
      ], { duration: 1600, easing: 'cubic-bezier(.25,.5,.45,1)' });
      const stop = () => { animation.cancel(); effects.delete(stop); if (stopLaunch === stop) stopLaunch = null; };
      stopLaunch = stop; effects.add(stop); animation.finished.then(stop, stop);
    });
  }
  const mission = document.querySelector('#star-mission');
  if (mission) {
    const board = mission.querySelector('#space-game-board');
    const start = mission.querySelector('[data-game-start]');
    const reset = mission.querySelector('[data-game-reset]');
    const stars = [...mission.querySelectorAll('[data-game-star]')];
    const rocket = mission.querySelector('#mission-rocket');
    const score = mission.querySelector('#mission-score');
    const boardScore = mission.querySelector('[data-board-score]');
    const status = mission.querySelector('#mission-status');
    const badge = mission.querySelector('.mission-badge');
    const points = [[18,19],[51,17],[84,25],[76,64],[43,79],[16,62]];
    const collected = new Set();
    let playing = false;
    let stopFlight = null;
    function moveRocket(x, y, animate = true) {
      const style = getComputedStyle(rocket);
      const fromX = parseFloat(style.left) / board.clientWidth * 100;
      const fromY = parseFloat(style.top) / board.clientHeight * 100;
      stopFlight?.();
      rocket.style.left = `${x}%`; rocket.style.top = `${y}%`;
      if (!animate || motionOff() || typeof rocket.animate !== 'function') return;
      const animation = rocket.animate([
        { left: `${fromX}%`, top: `${fromY}%` },
        { left: `${x}%`, top: `${y}%` }
      ], { duration: 650, easing: 'cubic-bezier(.2,.7,.2,1)' });
      const stop = () => { animation.cancel(); effects.delete(stop); if (stopFlight === stop) stopFlight = null; };
      stopFlight = stop; effects.add(stop); animation.finished.then(stop, stop);
    }
    function beginMission() {
      collected.clear(); playing = true; stopFlight?.();
      board.classList.add('is-playing'); board.classList.remove('is-complete');
      badge.hidden = true; start.hidden = true; reset.hidden = true; rocket.hidden = false;
      stars.forEach(star => {
        star.hidden = false; star.dataset.collected = 'false';
        star.setAttribute('aria-disabled', 'false');
        star.setAttribute('aria-label', `Collect star ${Number(star.dataset.gameStar) + 1}`);
      });
      moveRocket(12, 84, false); score.textContent = '0 / 6'; boardScore.textContent = '0 / 6';
      status.textContent = 'Mission started. Find six stars, in any order. Take your time.';
      if (mobile.matches) board.scrollIntoView({ block: 'center', behavior: motionOff() ? 'instant' : 'smooth' });
      stars[0].focus({ preventScroll: true });
    }
    function collectStar(index) {
      if (!playing || collected.has(index)) return;
      collected.add(index);
      const star = stars[index];
      star.dataset.collected = 'true'; star.setAttribute('aria-disabled', 'true');
      star.setAttribute('aria-label', `Star ${index + 1} collected`);
      moveRocket(...points[index]);
      score.textContent = `${collected.size} / 6`;
      boardScore.textContent = `${collected.size} / 6`;
      if (collected.size === stars.length) {
        playing = false; board.classList.add('is-complete'); badge.hidden = false; reset.hidden = false;
        status.textContent = 'Mission complete! All six stars found. You’re a Little Explorer.';
        reset.focus({ preventScroll: true });
      } else status.textContent = `Star ${index + 1} collected. ${collected.size} of six found. Choose another star.`;
    }
    stars.forEach((star, index) => star.addEventListener('click', () => collectStar(index)));
    board.addEventListener('keydown', event => {
      if (!playing || !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
      event.preventDefault();
      const direction = event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 1;
      const current = Math.max(0, stars.indexOf(document.activeElement));
      for (let step = 1; step <= stars.length; step++) {
        const index = (current + step * direction + stars.length * 2) % stars.length;
        if (!collected.has(index)) { stars[index].focus({ preventScroll: true }); break; }
      }
    });
    start.addEventListener('click', beginMission); reset.addEventListener('click', beginMission);
    start.hidden = false;
  }
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
  // Real photo links and all case articles remain available without enhancement.
  const caseSection = document.querySelector('#cases');
  const caseTabs = [...document.querySelectorAll('[data-case-tab]')];
  const casePanels = [...document.querySelectorAll('[data-case-panel]')];
  const caseTablist = document.querySelector('.case-tabs');
  let selectedCase = null;
  let caseEntryStop = null;
  function selectCase(id, { focus = false, updateHash = false, animate = true } = {}) {
    const index = casePanels.findIndex(panel => panel.id === id);
    if (index < 0) return;
    caseEntryStop?.();
    caseTabs.forEach((tab, i) => {
      tab.setAttribute('aria-selected', String(i === index));
      tab.tabIndex = i === index ? 0 : -1;
      casePanels[i].hidden = i !== index;
    });
    const panel = casePanels[index];
    if (animate && selectedCase !== id && !motionOff() && typeof panel.animate === 'function') {
      const animation = panel.animate([{ opacity: .35, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], { duration: 260, easing: 'cubic-bezier(.2,.7,.2,1)' });
      const stop = () => { animation.cancel(); effects.delete(stop); if (caseEntryStop === stop) caseEntryStop = null; };
      caseEntryStop = stop; effects.add(stop); animation.finished.then(stop, stop);
    }
    selectedCase = id;
    if (focus) { caseTabs[index].focus({ preventScroll: true }); if (mobile.matches) caseTabs[index].scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'instant' }); }
    if (updateHash) history.replaceState(null, '', `#${id}`);
  }
  if (caseTabs.length && caseTabs.length === casePanels.length) {
    caseTablist.setAttribute('role', 'tablist');
    const setOrientation = () => caseTablist.setAttribute('aria-orientation', mobile.matches ? 'horizontal' : 'vertical');
    setOrientation(); mobile.addEventListener('change', setOrientation);
    caseTabs.forEach((tab, index) => {
      tab.setAttribute('role', 'tab'); tab.setAttribute('aria-controls', casePanels[index].id);
      casePanels[index].setAttribute('role', 'tabpanel'); casePanels[index].setAttribute('aria-labelledby', tab.id); casePanels[index].tabIndex = 0;
      tab.addEventListener('click', event => {
        if (event.button || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
        event.preventDefault(); selectCase(casePanels[index].id, { updateHash: true });
      });
      tab.addEventListener('keydown', event => {
        const previous = mobile.matches ? 'ArrowLeft' : 'ArrowUp';
        const next = mobile.matches ? 'ArrowRight' : 'ArrowDown';
        let target = index;
        if (event.key === previous) target = (index + caseTabs.length - 1) % caseTabs.length;
        else if (event.key === next) target = (index + 1) % caseTabs.length;
        else if (event.key === 'Home') target = 0;
        else if (event.key === 'End') target = caseTabs.length - 1;
        else return;
        event.preventDefault(); selectCase(casePanels[target].id, { focus: true, updateHash: true });
      });
    });
    caseSection.classList.add('cases-enhanced');
    const showHashCase = () => { if (casePanels.some(panel => `#${panel.id}` === location.hash)) selectCase(location.hash.slice(1), { animate: false }); };
    selectCase(casePanels[0].id, { animate: false }); showHashCase();
    window.addEventListener('hashchange', showHashCase);
  }
  const viewer = document.querySelector('#case-viewer');
  if (viewer && typeof viewer.showModal === 'function') {
    const viewerImage = viewer.querySelector('.case-viewer-image');
    const viewerTitle = viewer.querySelector('#case-viewer-title');
    const viewerCounter = viewer.querySelector('#case-viewer-counter');
    let photos = [];
    let photoIndex = 0;
    let photoOpener = null;
    function showPhoto(index) {
      photoIndex = (index + photos.length) % photos.length;
      const photo = photos[photoIndex];
      viewerImage.src = photo.href;
      viewerImage.alt = photo.querySelector('img').alt;
      viewerCounter.textContent = `Photo ${photoIndex + 1} of ${photos.length}`;
    }
    caseSection.addEventListener('click', event => {
      const link = event.target.closest('.case-photo');
      if (!link || event.button || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      const panel = document.getElementById(link.dataset.caseId);
      photos = [...panel.querySelectorAll('.case-thumb')]; photoOpener = link;
      viewerTitle.textContent = panel.querySelector('h2').textContent;
      showPhoto(Number(link.dataset.photoIndex));
      viewer.showModal(); document.body.classList.add('case-viewer-open');
    });
    viewer.querySelector('[data-case-close]').addEventListener('click', () => viewer.close());
    viewer.querySelector('[data-case-prev]').addEventListener('click', () => showPhoto(photoIndex - 1));
    viewer.querySelector('[data-case-next]').addEventListener('click', () => showPhoto(photoIndex + 1));
    viewer.addEventListener('keydown', event => {
      if (event.key === 'Tab') {
        const buttons = [...viewer.querySelectorAll('button')];
        const first = buttons[0], last = buttons[buttons.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
      if (event.key === 'ArrowLeft') { event.preventDefault(); showPhoto(photoIndex - 1); }
      if (event.key === 'ArrowRight') { event.preventDefault(); showPhoto(photoIndex + 1); }
      if (event.key === 'Home') { event.preventDefault(); showPhoto(0); }
      if (event.key === 'End') { event.preventDefault(); showPhoto(photos.length - 1); }
    });
    viewer.addEventListener('click', event => {
      if (event.target !== viewer) return;
      const bounds = viewer.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) viewer.close();
    });
    viewer.addEventListener('close', () => { document.body.classList.remove('case-viewer-open'); photoOpener?.focus({ preventScroll: true }); });
  }
  const form = document.querySelector('#booking-form');
  form?.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const name = form.querySelector('#booking-name').value.trim();
    const message = `Hello Dr. Kashmira,${name ? ` I’m ${name}.` : ''} I’d like to ask about an appointment at Dr. Munir Silwadi Dental Centre, Al Raha Mall, Abu Dhabi. Please let me know your availability. Thank you.`;
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
