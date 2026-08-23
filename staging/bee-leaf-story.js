(() => {
  'use strict';

  const chapters = [...document.querySelectorAll('.chapter')];
  const chapterButtons = [...document.querySelectorAll('[data-go]')];
  const previousButton = document.querySelector('#prevButton');
  const nextButton = document.querySelector('#nextButton');
  const pageStatus = document.querySelector('#pageStatus');
  const progressFill = document.querySelector('#progressFill');
  const readingModeButton = document.querySelector('#readingModeButton');
  const soundButton = document.querySelector('#soundButton');
  const bgMusic = document.querySelector('#bgMusic');
  const pageTurnSfx = document.querySelector('#pageTurnSfx');
  const storyPages = document.querySelector('#storyPages');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const pageKey = 'beeLeafStory.sessionPage';
  const furthestKey = 'beeLeafStory.furthestChapter';
  const readingKey = 'beeLeafStory.readingMode';
  const soundKey = 'beeLeafStory.soundEnabled';
  const lastChapter = chapters.length - 1;

  let currentChapter = clamp(readNumber(safelyRead(sessionStorage, pageKey), 0), 0, lastChapter);
  let furthestChapter = clamp(readNumber(safelyRead(localStorage, furthestKey), 0), 0, lastChapter);
  let readingMode = safelyRead(localStorage, readingKey) === 'true';
  let soundEnabled = safelyRead(localStorage, soundKey) === 'true';
  let swipeStart = null;

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

  function hydrateChapter(index, priority = false) {
    const chapter = chapters[index];
    if (!chapter) return;
    const source = chapter.querySelector('source[data-srcset]');
    const image = chapter.querySelector('img[data-src]');

    if (source) {
      source.srcset = source.dataset.srcset;
      source.removeAttribute('data-srcset');
    }
    if (image) {
      image.loading = priority ? 'eager' : 'lazy';
      image.fetchPriority = priority ? 'high' : 'auto';
      image.src = image.dataset.src;
      image.removeAttribute('data-src');
    } else if (priority) {
      const loadedImage = chapter.querySelector('img');
      if (loadedImage) loadedImage.fetchPriority = 'high';
    }
  }

  function playPageTurn() {
    if (!soundEnabled || !pageTurnSfx) return;
    pageTurnSfx.volume = .34;
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
    bgMusic.volume = .15;
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

  function updateProgress() {
    const progress = ((currentChapter + 1) / chapters.length) * 100;
    progressFill.style.width = `${progress}%`;
    pageStatus.innerHTML = `<span>${currentChapter + 1}</span> of ${chapters.length}`;
    previousButton.disabled = currentChapter === 0;
    nextButton.querySelector('span').textContent = currentChapter === lastChapter ? 'Begin the game' : 'Next chapter';

    chapterButtons.forEach((button, index) => {
      const current = index === currentChapter;
      if (current) button.setAttribute('aria-current', 'step');
      else button.removeAttribute('aria-current');
      button.classList.toggle('is-complete', index <= furthestChapter && !current);
    });
  }

  function showChapter(index, options = {}) {
    const destination = clamp(index, 0, lastChapter);
    if (readingMode && !options.initial) setReadingMode(false, false);
    if (destination === currentChapter && !options.initial) return;

    hydrateChapter(destination, true);
    hydrateChapter(destination + 1, true);

    chapters.forEach((chapter, chapterIndex) => {
      const active = chapterIndex === destination;
      chapter.hidden = !active;
      chapter.classList.toggle('is-active', active);
      chapter.setAttribute('aria-hidden', String(!active));
      if (active && !options.initial) {
        chapter.classList.remove('is-entering');
        requestAnimationFrame(() => chapter.classList.add('is-entering'));
      }
    });

    currentChapter = destination;
    furthestChapter = Math.max(furthestChapter, destination);
    safelyStore(sessionStorage, pageKey, currentChapter);
    safelyStore(localStorage, furthestKey, furthestChapter);
    updateProgress();

    if (!options.initial) {
      playPageTurn();
      chapters[currentChapter].scrollIntoView({ behavior: reducedMotion.matches ? 'auto' : 'smooth', block: 'start' });
      const heading = chapters[currentChapter].querySelector('h2');
      heading?.setAttribute('tabindex', '-1');
      if (options.focus !== false) window.setTimeout(() => heading?.focus({ preventScroll: true }), reducedMotion.matches ? 0 : 380);
    }
  }

  function setReadingMode(enabled, moveFocus = true) {
    readingMode = Boolean(enabled);
    safelyStore(localStorage, readingKey, readingMode);
    document.body.dataset.readingMode = String(readingMode);
    readingModeButton.setAttribute('aria-pressed', String(readingMode));
    readingModeButton.querySelector('span').textContent = readingMode ? 'Paged view' : 'Read all';

    if (readingMode) {
      chapters.forEach((chapter, index) => {
        hydrateChapter(index, index === currentChapter);
        chapter.hidden = false;
        chapter.removeAttribute('aria-hidden');
      });
    } else {
      chapters.forEach((chapter, index) => {
        const active = index === currentChapter;
        chapter.hidden = !active;
        chapter.setAttribute('aria-hidden', String(!active));
      });
    }

    if (moveFocus) {
      const heading = chapters[currentChapter].querySelector('h2');
      chapters[currentChapter].scrollIntoView({ behavior: reducedMotion.matches ? 'auto' : 'smooth', block: 'start' });
      window.setTimeout(() => heading?.focus({ preventScroll: true }), reducedMotion.matches ? 0 : 300);
    }
  }

  previousButton.addEventListener('click', () => showChapter(currentChapter - 1));
  nextButton.addEventListener('click', () => {
    if (currentChapter === lastChapter) {
      document.querySelector('.take-flight')?.click();
      return;
    }
    showChapter(currentChapter + 1);
  });
  chapterButtons.forEach(button => button.addEventListener('click', () => showChapter(Number(button.dataset.go))));
  readingModeButton.addEventListener('click', () => setReadingMode(!readingMode));
  soundButton.addEventListener('click', () => setSound(!soundEnabled));

  document.addEventListener('keydown', event => {
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.target.closest('input, textarea, select, [contenteditable="true"]')) return;
    if (event.target === document.querySelector('#holdBelief') && (event.key === ' ' || event.key === 'Enter')) return;
    if (readingMode) return;
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      showChapter(currentChapter - 1);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      if (currentChapter < lastChapter) showChapter(currentChapter + 1);
    }
  });

  storyPages.addEventListener('touchstart', event => {
    if (readingMode || event.touches.length !== 1 || event.target.closest('[data-interactive]')) {
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
    if (deltaX > 0) showChapter(currentChapter - 1, { focus: false });
    else if (currentChapter < lastChapter) showChapter(currentChapter + 1, { focus: false });
  }, { passive: true });

  function setupThreadReveal() {
    const field = document.querySelector('.thread-field');
    const toggle = field?.querySelector('.thread-toggle');
    if (!field || !toggle) return;

    field.addEventListener('pointermove', event => {
      if (!finePointer.matches) return;
      const bounds = field.getBoundingClientRect();
      field.style.setProperty('--pointer-x', `${((event.clientX - bounds.left) / bounds.width) * 100}%`);
      field.style.setProperty('--pointer-y', `${((event.clientY - bounds.top) / bounds.height) * 100}%`);
    });
    toggle.addEventListener('click', () => {
      const reveal = !field.classList.contains('is-revealed');
      field.classList.toggle('is-revealed', reveal);
      toggle.setAttribute('aria-pressed', String(reveal));
      toggle.textContent = reveal ? 'The thread was always there' : 'Reveal the unseen thread';
    });
  }

  function setupComicActions() {
    const field = document.querySelector('.comic-field');
    if (!field) return;
    const result = field.querySelector('.interaction-result');
    const messages = {
      crumb: 'The crumb rolls directly over Bea. Samson calls this “valuable data.”',
      loop: 'One graceful loop later, Bea has invented the daisy knot.',
      still: 'Four whole seconds! Bea officially completes stillness. Jonah respectfully disagrees.'
    };
    field.querySelectorAll('[data-comic-action]').forEach(button => {
      button.addEventListener('click', () => {
        const action = button.dataset.comicAction;
        field.dataset.beaAction = 'none';
        requestAnimationFrame(() => { field.dataset.beaAction = action; });
        result.textContent = messages[action];
      });
    });
  }

  function setupSeasonPromises() {
    const field = document.querySelector('.promises-field');
    if (!field) return;
    const result = field.querySelector('.season-message');
    const messages = {
      spring: 'Spring begins before it knows what will bloom.',
      summer: 'Summer gives away what it grows.',
      autumn: 'Autumn lets go so life can travel.',
      winter: 'Winter trusts what is alive beneath the silence.'
    };
    field.querySelectorAll('[data-season]').forEach(button => {
      button.addEventListener('click', () => {
        const season = button.dataset.season;
        field.dataset.season = season;
        field.querySelectorAll('[data-season]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
        result.textContent = messages[season];
      });
    });
  }

  function setupBeliefHold() {
    const field = document.querySelector('.belief-field');
    const button = document.querySelector('#holdBelief');
    const status = document.querySelector('#beliefInstruction');
    if (!field || !button || !status) return;
    let startTime = 0;
    let frame = 0;
    let holding = false;
    let complete = false;
    const holdDuration = reducedMotion.matches ? 700 : 1250;

    const stop = reset => {
      holding = false;
      cancelAnimationFrame(frame);
      if (reset && !complete) button.style.setProperty('--hold-progress', '0%');
    };
    const tick = now => {
      if (!holding) return;
      const progress = clamp((now - startTime) / holdDuration, 0, 1);
      button.style.setProperty('--hold-progress', `${progress * 100}%`);
      if (progress >= 1) {
        complete = true;
        stop(false);
        field.classList.add('is-revealed');
        button.querySelector('span').textContent = 'Thread revealed';
        button.querySelector('strong').textContent = 'BELIEF';
        status.textContent = 'The result was hidden. The connection was real.';
        return;
      }
      frame = requestAnimationFrame(tick);
    };
    const start = event => {
      if (complete || holding) return;
      if (event.type === 'keydown' && event.key !== ' ' && event.key !== 'Enter') return;
      if (event.cancelable) event.preventDefault();
      holding = true;
      startTime = performance.now();
      frame = requestAnimationFrame(tick);
    };

    button.addEventListener('pointerdown', start);
    button.addEventListener('pointerup', () => stop(true));
    button.addEventListener('pointercancel', () => stop(true));
    button.addEventListener('pointerleave', () => stop(true));
    button.addEventListener('keydown', start);
    button.addEventListener('keyup', event => {
      if (event.key === ' ' || event.key === 'Enter') stop(true);
    });
  }

  function setupGuideBea() {
    const field = document.querySelector('.guide-field');
    const bea = field?.querySelector('.guide-bea');
    const target = field?.querySelector('.seed-target');
    const status = field?.querySelector('.interaction-result');
    if (!field || !bea || !target || !status) return;
    let dragging = false;
    let complete = false;

    const finish = () => {
      if (complete) return;
      complete = true;
      field.classList.add('is-complete');
      status.textContent = 'Sheltered. Nothing sparkles—yet. Beneath the soil, the seed opens.';
    };
    const move = event => {
      if (complete || (!dragging && !finePointer.matches) || event.target.closest('button:not(.guide-bea)')) return;
      const bounds = field.getBoundingClientRect();
      const x = clamp(((event.clientX - bounds.left) / bounds.width) * 100, 7, 93);
      const y = clamp(((event.clientY - bounds.top) / bounds.height) * 100, 8, 88);
      bea.style.setProperty('--guide-x', `${x}%`);
      bea.style.setProperty('--guide-y', `${y}%`);
      if (x > 72 && y > 54 && y < 82) finish();
    };
    bea.addEventListener('pointerdown', event => {
      dragging = true;
      bea.setPointerCapture?.(event.pointerId);
      move(event);
    });
    bea.addEventListener('pointermove', move);
    bea.addEventListener('pointerup', () => { dragging = false; });
    bea.addEventListener('pointercancel', () => { dragging = false; });
    field.addEventListener('pointermove', move);
    target.addEventListener('click', finish);
  }

  function setupCurrents() {
    const field = document.querySelector('.currents-field');
    if (!field) return;
    const result = field.querySelector('.current-message');
    const messages = {
      spring: "Spring's rain hides Marigold—but cannot erase her.",
      summer: "Summer's heat carries Samson, Esther, and Jonah beyond sight.",
      autumn: "Autumn's wind tears Leif from the branch he trusted.",
      winter: "Winter's white silence swallows Solomon's silhouette—but not his voice."
    };
    field.querySelectorAll('[data-current]').forEach(button => {
      button.addEventListener('click', () => {
        const current = button.dataset.current;
        field.dataset.current = current;
        field.querySelectorAll('[data-current]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
        result.textContent = messages[current];
      });
    });
  }

  function initialize() {
    chapters.forEach((chapter, index) => {
      chapter.setAttribute('aria-roledescription', 'story chapter');
      chapter.classList.toggle('is-active', index === currentChapter);
    });
    hydrateChapter(currentChapter, true);
    hydrateChapter(currentChapter + 1, true);
    setupThreadReveal();
    setupComicActions();
    setupSeasonPromises();
    setupBeliefHold();
    setupGuideBea();
    setupCurrents();
    showChapter(currentChapter, { initial: true, focus: false });
    setReadingMode(readingMode, false);
    setSound(soundEnabled);
  }

  document.addEventListener('visibilitychange', () => {
    if (!bgMusic) return;
    if (document.hidden) bgMusic.pause();
    else if (soundEnabled) bgMusic.play().catch(() => {});
  });

  initialize();
})();
