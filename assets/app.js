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
  document.addEventListener('focusin', e => {
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
    const messages = ['A smile for you!', 'Here comes another smile!', 'Smiles all round!'];
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
  const buddies = { 'tooth-friend': 'Tooth is your co-pilot. Ready for take-off!', rainbow: 'Rainbow is your co-pilot. Ready for take-off!', rocket: 'Rocket is your co-pilot. Ready for take-off!' };
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
      launchStatus.textContent = 'Blast-off! Your rocket is on its way.';
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
      status.textContent = 'Mission started. Collect all six stars in any order. Take your time.';
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
      } else status.textContent = `Star ${index + 1} collected. ${collected.size} of 6 stars collected. Choose another star.`;
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
  const caseCards = [...document.querySelectorAll('[data-case-tab]')];
  const casePanels = [...document.querySelectorAll('[data-case-panel]')];
  const caseGrid = document.querySelector('.case-grid');
  const caseFilters = caseSection?.querySelector('.case-filters');
  const caseCategory = document.querySelector('#case-category');
  const caseSort = document.querySelector('#case-sort');
  const caseCategoryChips = caseSection?.querySelector('.case-category-chips');
  const caseSearch = document.querySelector('#case-search');
  const caseClear = document.querySelector('#case-clear-filters');
  const caseResults = document.querySelector('#case-results-status');
  const caseEmpty = document.querySelector('#case-no-results');
  const caseLoadMore = document.querySelector('#case-load-more');
  const caseDetail = document.querySelector('#case-detail');
  const viewer = document.querySelector('#case-viewer');
  let selectedCase = null;
  let caseEntryStop = null;
  if (caseCards.length && caseCards.length === casePanels.length && caseGrid && caseFilters && caseCategory && caseSearch && caseClear && caseResults && caseEmpty && caseLoadMore && caseDetail && typeof caseDetail.showModal === 'function') {
    const pageSize = 12;
    const caseDetailContent = caseDetail.querySelector('#case-detail-content');
    const caseDetailTitle = caseDetail.querySelector('#case-detail-title');
    const caseDetailCategory = caseDetail.querySelector('#case-detail-category');
    const previousCase = caseDetail.querySelector('[data-case-detail-prev]');
    const nextCase = caseDetail.querySelector('[data-case-detail-next]');
    const caseChips = [...(caseCategoryChips?.querySelectorAll('[data-case-category]') || [])];
    const caseById = new Map(casePanels.map((panel, index) => [panel.id, { panel, card: caseCards[index] }]));
    const panelMarkers = new Map();
    const coverSources = new Map();
    const cardEffects = new Set();
    let matchingCards = [];
    let visibleLimit = pageSize;
    let hasRenderedCards = false;
    let detailScroll = null;
    let coverRequest = 0;
    let detailFocusFrame = null;
    const normalizeCaseSearch = value => String(value).normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/&/g, ' and ').replace(/\bprevention\b/g, 'preventive').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
    const searchText = new Map(caseCards.map(card => [card, normalizeCaseSearch(card.dataset.search || card.textContent)]));
    const originalOrder = new Map(caseCards.map((card, index) => [card, index]));
    const caseCollator = new Intl.Collator('en', { numeric: true, sensitivity: 'base' });
    function orderCases(items) {
      const order = caseSort?.value || 'featured';
      const result = [...items];
      if (order === 'name') result.sort((a, b) => caseCollator.compare(a.querySelector('.case-card-copy strong')?.textContent || '', b.querySelector('.case-card-copy strong')?.textContent || ''));
      else if (order === 'category') result.sort((a, b) => caseCollator.compare(a.dataset.categoryLabel || '', b.dataset.categoryLabel || '') || caseCollator.compare(a.querySelector('.case-card-copy strong')?.textContent || '', b.querySelector('.case-card-copy strong')?.textContent || ''));
      else result.sort((a, b) => originalOrder.get(a) - originalOrder.get(b));
      caseGrid.append(...caseCards);
      caseGrid.append(...result);
      return result;
    }
    function animateCaseEntry(element, { delay = 0, cards = false } = {}) {
      if (motionOff() || document.hidden || typeof element.animate !== 'function') return null;
      const animation = element.animate([
        { opacity: .35, transform: 'translateY(12px)' },
        { opacity: 1, transform: 'translateY(0)' }
      ], { duration: 310, delay, easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'backwards' });
      const stop = () => {
        animation.cancel(); effects.delete(stop); cardEffects.delete(stop);
        if (caseEntryStop === stop) caseEntryStop = null;
      };
      effects.add(stop);
      if (cards) cardEffects.add(stop);
      animation.finished.then(stop, stop);
      return stop;
    }
    function renderCaseCards({ animate = true } = {}) {
      const previouslyVisible = new Set(hasRenderedCards ? caseCards.filter(card => !card.hidden) : []);
      hasRenderedCards = true;
      [...cardEffects].forEach(stop => stop());
      const visibleCards = new Set(matchingCards.slice(0, visibleLimit));
      caseCards.forEach(card => {
        card.hidden = !visibleCards.has(card);
        card.classList.toggle('is-current', card.getAttribute('href') === `#${selectedCase}`);
      });
      caseChips.forEach(chip => chip.setAttribute('aria-pressed', String(chip.dataset.caseCategory === caseCategory.value)));
      caseEmpty.hidden = matchingCards.length > 0;
      caseResults.textContent = `Showing ${visibleCards.size} of ${matchingCards.length} cases`;
      caseLoadMore.hidden = visibleCards.size >= matchingCards.length;
      if (animate) matchingCards.filter(card => visibleCards.has(card) && !previouslyVisible.has(card)).slice(0, pageSize).forEach((card, index) => animateCaseEntry(card, { delay: index * 24, cards: true }));
    }
    function revealCaseCard(card) {
      const position = matchingCards.indexOf(card);
      if (position >= visibleLimit) {
        visibleLimit = Math.ceil((position + 1) / pageSize) * pageSize;
        renderCaseCards({ animate: false });
      }
    }
    function restoreCasePanel(id) {
      const entry = caseById.get(id);
      if (!entry) return;
      ++coverRequest;
      entry.panel.hidden = true;
      panelMarkers.get(entry.panel).after(entry.panel);
      const coverImage = entry.panel.querySelector('.case-cover img');
      if (coverImage && coverSources.has(coverImage)) coverImage.setAttribute('src', coverSources.get(coverImage));
    }
    function finishCaseClose({ updateHash = true, returnFocus = true, preserveScroll = true } = {}) {
      if (!selectedCase) return;
      const closingId = selectedCase;
      const card = caseById.get(closingId)?.card;
      caseEntryStop?.();
      if (viewer?.open) viewer.close();
      restoreCasePanel(closingId);
      selectedCase = null;
      caseCards.forEach(item => item.classList.remove('is-current'));
      document.body.classList.remove('case-detail-open');
      if (updateHash && caseById.has(location.hash.slice(1))) history.replaceState(history.state, '', `${location.pathname}${location.search}`);
      if (returnFocus && card && !card.hidden) card.focus({ preventScroll: true });
      if (preserveScroll && detailScroll) window.scrollTo({ left: detailScroll.x, top: detailScroll.y, behavior: 'instant' });
      if (preserveScroll && returnFocus && card && !card.hidden) {
        const top = Math.max(0, header?.getBoundingClientRect().bottom || 0);
        const booking = document.querySelector('.mobile-book');
        const bottom = booking?.getClientRects().length ? Math.min(innerHeight, booking.getBoundingClientRect().top) : innerHeight;
        const bounds = card.getBoundingClientRect();
        if (bounds.top < top || bounds.bottom > bottom) {
          card.scrollIntoView({ block: 'nearest', behavior: 'instant' });
        }
      }
      detailScroll = null;
    }
    function closeCaseDetail(options = {}) {
      if (viewer?.open) viewer.close();
      if (caseDetail.open) caseDetail.close();
      finishCaseClose(options);
    }
    function keepCaseDetailFocus() {
      if (!caseDetail.contains(document.activeElement)) caseDetail.querySelector('[data-case-detail-close]').focus({ preventScroll: true });
    }
    function scheduleCaseDetailFocus() {
      if (detailFocusFrame !== null) return;
      detailFocusFrame = requestAnimationFrame(() => {
        detailFocusFrame = null;
        if (caseDetail.open && !viewer?.open && document.hasFocus()) keepCaseDetailFocus();
      });
    }
    function loadCaseCover(entry) {
      const cover = entry.panel.querySelector('.case-cover');
      const coverImage = cover?.querySelector('img');
      if (!coverImage) return;
      if (!coverSources.has(coverImage)) coverSources.set(coverImage, coverImage.getAttribute('src'));
      const request = ++coverRequest;
      const fullImage = new Image();
      fullImage.decoding = 'async';
      const showFullCover = () => {
        if (request === coverRequest && selectedCase === entry.panel.id && caseDetail.open) coverImage.src = fullImage.src;
      };
      if (typeof fullImage.decode !== 'function') fullImage.onload = showFullCover;
      fullImage.src = cover.href;
      if (typeof fullImage.decode === 'function') fullImage.decode().then(showFullCover, () => {});
    }
    function openCaseDetail(id, { historyMode = 'none', animate = true } = {}) {
      const entry = caseById.get(id);
      if (!entry || !matchingCards.includes(entry.card)) return;
      revealCaseCard(entry.card);
      if (selectedCase === id && caseDetail.open) { keepCaseDetailFocus(); return; }
      if (viewer?.open) viewer.close();
      caseEntryStop?.();
      if (selectedCase) restoreCasePanel(selectedCase);
      if (!caseDetail.open) detailScroll = { x: scrollX, y: scrollY };
      selectedCase = id;
      caseDetailTitle.textContent = entry.panel.querySelector('h2').textContent;
      caseDetailCategory.textContent = entry.card.dataset.categoryLabel || '';
      loadCaseCover(entry);
      entry.panel.hidden = false;
      caseDetailContent.append(entry.panel);
      caseCards.forEach(card => card.classList.toggle('is-current', card === entry.card));
      previousCase.disabled = matchingCards.length < 2;
      nextCase.disabled = matchingCards.length < 2;
      document.body.classList.add('case-detail-open');
      if (!caseDetail.open) caseDetail.showModal();
      keepCaseDetailFocus();
      caseDetail.scrollTop = 0;
      caseDetailContent.scrollTop = 0;
      if (animate) caseEntryStop = animateCaseEntry(entry.panel);
      if (historyMode !== 'none' && location.hash !== `#${id}`) history[historyMode === 'push' ? 'pushState' : 'replaceState'](history.state, '', `${location.pathname}${location.search}#${id}`);
    }
    function filterCases({ animate = true, closeDetail = true } = {}) {
      if (closeDetail && selectedCase) closeCaseDetail({ returnFocus: false });
      const query = normalizeCaseSearch(caseSearch.value);
      const category = caseCategory.value;
      matchingCards = orderCases(caseCards.filter(card => (!category || card.dataset.category === category) && (!query || searchText.get(card).includes(query))));
      visibleLimit = pageSize;
      renderCaseCards({ animate });
    }
    casePanels.forEach(panel => {
      const marker = document.createComment(` Original location of ${panel.id} `);
      panel.before(marker); panelMarkers.set(panel, marker); panel.hidden = true;
    });
    caseCards.forEach(card => {
      card.setAttribute('aria-haspopup', 'dialog'); card.setAttribute('aria-controls', 'case-detail');
      card.addEventListener('click', event => {
        if (event.button || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        openCaseDetail(card.getAttribute('href').slice(1), { historyMode: caseDetail.open ? 'replace' : 'push' });
      });
    });
    caseChips.forEach(chip => chip.addEventListener('click', () => {
      caseCategory.value = chip.dataset.caseCategory;
      filterCases();
    }));
    caseCategory.addEventListener('change', () => filterCases());
    caseSort?.addEventListener('change', () => filterCases());
    caseSearch.addEventListener('input', () => filterCases());
    caseClear.addEventListener('click', () => {
      caseCategory.value = ''; caseSearch.value = ''; if (caseSort) caseSort.value = 'featured'; filterCases();
    });
    caseLoadMore.addEventListener('click', () => {
      const firstNewCard = matchingCards[visibleLimit];
      visibleLimit += pageSize;
      renderCaseCards();
      firstNewCard?.focus();
    });
    caseDetail.querySelectorAll('[data-case-detail-close]').forEach(button => button.addEventListener('click', () => closeCaseDetail()));
    function stepCase(direction) {
      if (!selectedCase || matchingCards.length < 2) return;
      const current = matchingCards.indexOf(caseById.get(selectedCase).card);
      const card = matchingCards[(current + direction + matchingCards.length) % matchingCards.length];
      openCaseDetail(card.getAttribute('href').slice(1), { historyMode: 'replace' });
    }
    previousCase.addEventListener('click', () => stepCase(-1));
    nextCase.addEventListener('click', () => stepCase(1));
    caseDetail.addEventListener('keydown', event => {
      if (event.key !== 'Tab') return;
      const controls = [...caseDetail.querySelectorAll('button:not(:disabled), a[href]')].filter(control => control.getClientRects().length);
      const first = controls[0], last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    });
    caseDetail.addEventListener('focusout', scheduleCaseDetailFocus);
    caseDetail.addEventListener('cancel', event => {
      if (viewer?.open) { event.preventDefault(); viewer.close(); }
      else { event.preventDefault(); closeCaseDetail(); }
    });
    caseDetail.addEventListener('close', () => { if (!caseDetail.open) finishCaseClose(); });
    caseDetail.addEventListener('click', event => {
      if (event.target !== caseDetail) return;
      const bounds = caseDetail.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) closeCaseDetail();
    });
    caseSection.classList.add('cases-enhanced');
    const showHashCase = () => {
      const id = location.hash.slice(1);
      const entry = caseById.get(id);
      if (!entry) {
        closeCaseDetail({ updateHash: false, preserveScroll: location.hash !== '#top' });
        return;
      }
      if (!matchingCards.includes(entry.card)) {
        caseCategory.value = ''; caseSearch.value = '';
        filterCases({ animate: false, closeDetail: false });
      }
      openCaseDetail(id, { animate: false });
    };
    caseCategory.value = ''; caseSearch.value = '';
    filterCases();
    caseFilters.hidden = false;
    if (caseCategoryChips) caseCategoryChips.hidden = false;
    showHashCase();
    window.addEventListener('hashchange', showHashCase);
    window.addEventListener('popstate', showHashCase);
    window.addEventListener('load', scheduleCaseDetailFocus);
    window.addEventListener('pageshow', () => { showHashCase(); scheduleCaseDetailFocus(); });
  }
  if (viewer && typeof viewer.showModal === 'function') {
    const viewerImage = viewer.querySelector('.case-viewer-image');
    const viewerTitle = viewer.querySelector('#case-viewer-title');
    const viewerCounter = viewer.querySelector('#case-viewer-counter');
    const viewerCaption = viewer.querySelector('#case-viewer-caption');
    let photos = [];
    let photoIndex = 0;
    let photoOpener = null;
    let photoRequest = 0;
    let photoFadeStop = null;
    function showPhoto(index) {
      if (!photos.length) return;
      photoIndex = (index + photos.length) % photos.length;
      const photo = photos[photoIndex];
      const request = ++photoRequest;
      const source = photo.href;
      photoFadeStop?.();
      viewerImage.onload = () => {
        if (request !== photoRequest || !viewer.open || viewerImage.currentSrc !== source || motionOff() || document.hidden || typeof viewerImage.animate !== 'function') return;
        const animation = viewerImage.animate([{ opacity: .4 }, { opacity: 1 }], { duration: 180, easing: 'ease-out' });
        const stop = () => { animation.cancel(); effects.delete(stop); if (photoFadeStop === stop) photoFadeStop = null; };
        photoFadeStop = stop; effects.add(stop); animation.finished.then(stop, stop);
      };
      viewerImage.src = photo.href;
      viewerImage.alt = photo.querySelector('img').alt;
      if (viewerCaption) viewerCaption.textContent = photo.dataset.caption || photo.closest('figure')?.querySelector('figcaption')?.textContent || viewerImage.alt;
      viewerCounter.textContent = `Image ${photoIndex + 1} of ${photos.length}`;
      viewer.querySelector('[data-case-prev]').disabled = photos.length < 2;
      viewer.querySelector('[data-case-next]').disabled = photos.length < 2;
    }
    caseSection?.addEventListener('click', event => {
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
      if (event.key === 'Escape') event.stopPropagation();
      if (event.key === 'Tab') {
        const buttons = [...viewer.querySelectorAll('button:not(:disabled)')];
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
    viewer.addEventListener('close', () => {
      ++photoRequest; viewerImage.onload = null; photoFadeStop?.();
      document.body.classList.remove('case-viewer-open');
      if (photoOpener?.isConnected && !photoOpener.closest('[data-case-panel]')?.hidden && (!caseDetail?.contains(photoOpener) || caseDetail.open)) photoOpener.focus({ preventScroll: true });
    });
  }
  const form = document.querySelector('#booking-form');
  if (form) {
    const location = form.querySelector('#booking-location');
    const selection = form.querySelector('#booking-selected-clinic');
    const showSelection = () => {
      const clinic = location.selectedOptions[0];
      selection.hidden = !clinic.value;
      selection.textContent = clinic.value ? `${clinic.dataset.practiceName}\n${clinic.dataset.practiceAddress}` : '';
    };
    location.addEventListener('change', showSelection);
    showSelection();
  }
  form?.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const name = form.querySelector('#booking-name').value.trim();
    const clinic = form.querySelector('#booking-location').selectedOptions[0];
    const request = clinic.value
      ? `I would like to ask about an appointment at ${clinic.dataset.practiceName}, ${clinic.dataset.practiceAddress}. Please let me know the availability.`
      : 'I would like to arrange a pediatric dental appointment in Abu Dhabi or Dubai. Please help me choose a clinic and confirm availability.';
    const message = `Hello Dr. Kashmira,${name ? ` My name is ${name}.` : ''} ${request} Thank you.`;
    const url = `mailto:${form.dataset.contactEmail}?subject=${encodeURIComponent('Appointment enquiry — Dr. Kashmira Pawar')}&body=${encodeURIComponent(message)}`;
    const status = form.querySelector('.form-status');
    status.replaceChildren(document.createTextNode('Your email draft should open in your email app. If it does not, '));
    const fallback = document.createElement('a');
    fallback.href = url;
    fallback.textContent = 'open the email draft here';
    status.append(fallback);
    window.location.href = url;
  });
  if (form) form.querySelector('button[type=submit]').disabled = false;
})();
