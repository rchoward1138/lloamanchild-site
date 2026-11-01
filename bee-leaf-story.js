(() => {
  'use strict';

  const pages = [...document.querySelectorAll('.page-card')];
  const pageButtons = [...document.querySelectorAll('[data-go]')];
  const livingScenes = [...document.querySelectorAll('.living-scene')];
  const previousButton = document.querySelector('#prevButton');
  const nextButton = document.querySelector('#nextButton');
  const pageStatus = document.querySelector('#pageStatus');
  const progressFill = document.querySelector('#progressFill');
  const fullStoryButton = document.querySelector('#fullStoryButton');
  const motionButton = document.querySelector('#motionButton');
  const soundButton = document.querySelector('#soundButton');
  const bgMusic = document.querySelector('#bgMusic');
  const pageTurnSfx = document.querySelector('#pageTurnSfx');
  const storyPages = document.querySelector('#storyPages');

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const narrowScreen = window.matchMedia('(max-width: 620px)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const pageKey = 'beeLeafLivingStory.sessionPage';
  const furthestKey = 'beeLeafLivingStory.furthestPage';
  const motionKey = 'beeLeafLivingStory.motionPaused';
  const soundKey = 'beeLeafStory.soundEnabled';
  const finalPage = pages.length - 1;

  let currentPage = clamp(readNumber(safelyRead(sessionStorage, pageKey), 0), 0, finalPage);
  let furthestPage = clamp(readNumber(safelyRead(localStorage, furthestKey), 0), 0, finalPage);
  let motionPaused = safelyRead(localStorage, motionKey) === 'true';
  let soundEnabled = safelyRead(localStorage, soundKey) === 'true';
  let swipeStart = null;
  let pointerFrame = 0;

  const sceneRatios = new Map(livingScenes.map(scene => [scene, 0]));

  function clamp(value, minimum, maximum) {
    return Math.min(maximum, Math.max(minimum, value));
  }

  function readNumber(value, fallback) {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  function safelyRead(storage, key) {
    try { return storage.getItem(key); } catch (_) { return null; }
  }

  function safelyStore(storage, key, value) {
    try { storage.setItem(key, String(value)); } catch (_) { /* Storage is optional. */ }
  }

  function playPageTurn() {
    if (!soundEnabled || !pageTurnSfx) return;
    pageTurnSfx.volume = .32;
    pageTurnSfx.currentTime = 0;
    const playback = pageTurnSfx.play();
    if (playback?.catch) playback.catch(() => {});
  }

  async function setSound(enabled) {
    soundEnabled = Boolean(enabled);
    safelyStore(localStorage, soundKey, soundEnabled);
    soundButton.setAttribute('aria-pressed', String(soundEnabled));
    soundButton.querySelector('span').textContent = soundEnabled ? 'Sound on' : 'Sound off';

    if (!bgMusic) return;
    bgMusic.volume = .14;
    if (!soundEnabled) {
      bgMusic.pause();
      return;
    }

    try {
      await bgMusic.play();
    } catch (_) {
      soundEnabled = false;
      safelyStore(localStorage, soundKey, false);
      soundButton.setAttribute('aria-pressed', 'false');
      soundButton.querySelector('span').textContent = 'Tap for sound';
    }
  }

  function setMotionPaused(paused, storePreference = true) {
    motionPaused = Boolean(paused);
    if (storePreference) safelyStore(localStorage, motionKey, motionPaused);
    document.body.dataset.motionPaused = String(motionPaused);
    motionButton.setAttribute('aria-pressed', String(motionPaused));
    motionButton.querySelector('span').textContent = motionPaused ? 'Motion paused' : 'Motion on';
    syncMotion();
  }

  function updateProgress() {
    const progress = ((currentPage + 1) / pages.length) * 100;
    progressFill.style.width = `${progress}%`;
    pageStatus.innerHTML = `<span>${currentPage + 1}</span> of ${pages.length}`;
    previousButton.disabled = currentPage === 0;
    nextButton.querySelector('span').textContent = currentPage === finalPage ? 'Begin the game' : (currentPage === finalPage - 1 ? 'Read full story' : 'Next page');
    fullStoryButton.querySelector('span').textContent = currentPage === finalPage ? 'Picture book' : 'Full story';

    pageButtons.forEach((button, index) => {
      const current = index === currentPage;
      if (current) button.setAttribute('aria-current', 'step');
      else button.removeAttribute('aria-current');
      button.classList.toggle('is-complete', index <= furthestPage && !current);
    });
  }

  function showPage(index, options = {}) {
    const destination = clamp(index, 0, finalPage);
    if (destination === currentPage && !options.initial) return;

    pages.forEach((page, pageIndex) => {
      const active = pageIndex === destination;
      page.hidden = !active;
      page.classList.toggle('is-active', active);
      page.setAttribute('aria-hidden', String(!active));
      if (active && !options.initial) {
        page.classList.remove('is-entering');
        requestAnimationFrame(() => page.classList.add('is-entering'));
      }
    });

    currentPage = destination;
    furthestPage = Math.max(furthestPage, destination);
    safelyStore(sessionStorage, pageKey, currentPage);
    safelyStore(localStorage, furthestKey, furthestPage);
    updateProgress();

    requestAnimationFrame(syncMotion);

    if (!options.initial) {
      playPageTurn();
      const behavior = reducedMotion.matches ? 'auto' : 'smooth';
      pages[currentPage].scrollIntoView({ behavior, block: 'start' });
      const heading = pages[currentPage].querySelector('h2, h3');
      heading?.setAttribute('tabindex', '-1');
      if (options.focus !== false) {
        window.setTimeout(() => heading?.focus({ preventScroll: true }), reducedMotion.matches ? 0 : 420);
      }
    }
  }

  function createParticles() {
    document.querySelectorAll('[data-particles]').forEach((field, fieldIndex) => {
      if (field.childElementCount) return;
      const count = clamp(readNumber(field.dataset.count, 8), 1, 14);
      for (let index = 0; index < count; index += 1) {
        const particle = document.createElement('i');
        const seed = (fieldIndex + 3) * 41 + index * 67;
        const x = (seed * 17) % 96;
        const y = (seed * 29) % 92;
        const size = 3 + ((seed * 13) % 8);
        const duration = 6.5 + ((seed * 11) % 65) / 10;
        const delay = -((seed * 7) % 90) / 10;
        particle.style.setProperty('--x', `${x}%`);
        particle.style.setProperty('--y', `${y}%`);
        particle.style.setProperty('--size', `${size}px`);
        particle.style.setProperty('--duration', `${duration}s`);
        particle.style.setProperty('--delay', `${delay}s`);
        field.append(particle);
      }
    });
  }

  function sceneIsEligible(scene) {
    return !scene.closest('[hidden]') && (sceneRatios.get(scene) || 0) > .12;
  }

  function syncMotion() {
    const canAnimate = !document.hidden && !motionPaused && !reducedMotion.matches;
    const candidates = livingScenes
      .filter(sceneIsEligible)
      .sort((a, b) => (sceneRatios.get(b) || 0) - (sceneRatios.get(a) || 0));
    const running = new Set(canAnimate ? candidates.slice(0, narrowScreen.matches ? 1 : 2) : []);
    livingScenes.forEach(scene => scene.classList.toggle('is-motion-active', running.has(scene)));
    document.body.classList.toggle('motion-suspended', !canAnimate);
  }

  function setupMotionObserver() {
    if (!('IntersectionObserver' in window)) {
      livingScenes.forEach(scene => sceneRatios.set(scene, 1));
      syncMotion();
      return;
    }

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => sceneRatios.set(entry.target, entry.intersectionRatio));
      syncMotion();
    }, {
      threshold: [0, .12, .3, .55, .8],
      rootMargin: '8% 0px'
    });

    livingScenes.forEach(scene => observer.observe(scene));
  }

  function setupPointerParallax() {
    livingScenes.forEach(scene => {
      scene.addEventListener('pointermove', event => {
        if (!finePointer.matches || !scene.classList.contains('is-motion-active')) return;
        const clientX = event.clientX;
        const clientY = event.clientY;
        cancelAnimationFrame(pointerFrame);
        pointerFrame = requestAnimationFrame(() => {
          const bounds = scene.getBoundingClientRect();
          const x = clamp(((clientX - bounds.left) / bounds.width) - .5, -.5, .5) * -8;
          const y = clamp(((clientY - bounds.top) / bounds.height) - .5, -.5, .5) * -8;
          scene.style.setProperty('--parallax-x', `${x}px`);
          scene.style.setProperty('--parallax-y', `${y}px`);
        });
      });
      scene.addEventListener('pointerleave', () => {
        scene.style.setProperty('--parallax-x', '0px');
        scene.style.setProperty('--parallax-y', '0px');
      });
    });
  }

  previousButton.addEventListener('click', () => showPage(currentPage - 1));
  nextButton.addEventListener('click', () => {
    if (currentPage === finalPage) {
      document.querySelector('.take-flight')?.click();
      return;
    }
    showPage(currentPage + 1);
  });
  pageButtons.forEach(button => button.addEventListener('click', () => showPage(Number(button.dataset.go))));
  fullStoryButton.addEventListener('click', () => showPage(currentPage === finalPage ? 0 : finalPage));
  motionButton.addEventListener('click', () => setMotionPaused(!motionPaused));
  soundButton.addEventListener('click', () => setSound(!soundEnabled));

  document.addEventListener('keydown', event => {
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || currentPage === finalPage) return;
    if (event.target.closest('input, textarea, select, button, a, [contenteditable="true"]')) return;
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      showPage(currentPage - 1);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      showPage(currentPage + 1);
    }
  });

  storyPages.addEventListener('touchstart', event => {
    if (currentPage === finalPage || event.touches.length !== 1 || event.target.closest('button, a')) {
      swipeStart = null;
      return;
    }
    const touch = event.touches[0];
    swipeStart = { x: touch.clientX, y: touch.clientY, at: performance.now() };
  }, { passive: true });

  storyPages.addEventListener('touchend', event => {
    if (!swipeStart || event.changedTouches.length !== 1) return;
    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - swipeStart.x;
    const deltaY = touch.clientY - swipeStart.y;
    const duration = performance.now() - swipeStart.at;
    swipeStart = null;
    if (duration > 900 || Math.abs(deltaX) < 64 || Math.abs(deltaX) < Math.abs(deltaY) * 1.35) return;
    if (deltaX > 0) showPage(currentPage - 1, { focus: false });
    else showPage(currentPage + 1, { focus: false });
  }, { passive: true });

  document.addEventListener('visibilitychange', () => {
    syncMotion();
    if (!bgMusic) return;
    if (document.hidden) bgMusic.pause();
    else if (soundEnabled) bgMusic.play().catch(() => {});
  });

  const resync = () => requestAnimationFrame(syncMotion);
  narrowScreen.addEventListener?.('change', resync);
  reducedMotion.addEventListener?.('change', () => {
    if (reducedMotion.matches) {
      motionButton.disabled = true;
      motionButton.querySelector('span').textContent = 'Reduced motion';
    } else {
      motionButton.disabled = false;
      setMotionPaused(motionPaused, false);
    }
    syncMotion();
  });

  function initialize() {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    const liteMode = Boolean(connection?.saveData || (navigator.deviceMemory && navigator.deviceMemory <= 4));
    document.body.dataset.motionLite = String(liteMode);

    pages.forEach((page, index) => {
      page.setAttribute('aria-roledescription', index === finalPage ? 'full illustrated story' : 'picture-book page');
      page.classList.toggle('is-active', index === currentPage);
    });

    createParticles();
    setupMotionObserver();
    setupPointerParallax();
    showPage(currentPage, { initial: true, focus: false });

    if (reducedMotion.matches) {
      motionButton.disabled = true;
      motionButton.setAttribute('aria-pressed', 'true');
      motionButton.querySelector('span').textContent = 'Reduced motion';
      document.body.dataset.motionPaused = 'true';
    } else {
      setMotionPaused(motionPaused, false);
    }
    setSound(soundEnabled);
  }

  initialize();
})();

