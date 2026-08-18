(() => {
  const dashboard = new URL('index.html', location.href);
  const dashboardDirectory = dashboard.pathname.replace(/index\.html$/, '');
  const query = new URLSearchParams(location.search);
  const pageScript = document.currentScript?.src
    ? new URL(document.currentScript.src)
    : new URL('dashboard-return.js', location.href);
  const sameSiteReferrer = (() => {
    if (!document.referrer) return false;
    try {
      const previous = new URL(document.referrer);
      return previous.origin === location.origin
        && previous.pathname.startsWith(dashboardDirectory);
    } catch (error) {
      return false;
    }
  })();
  const embeddedInDashboard = window.parent !== window
    && (query.get('dashboardShell') === '1' || sameSiteReferrer);
  const markedDashboardVisit = query.get('dashboardReturn') === '1';
  const cameFromDashboard = markedDashboardVisit || (() => {
    if (!document.referrer) return false;
    try {
      const previous = new URL(document.referrer);
      return previous.origin === location.origin
        && (previous.pathname === dashboard.pathname || previous.pathname === dashboardDirectory);
    } catch (error) {
      return false;
    }
  })();

  const init = () => {
    if (!document.body || document.querySelector('.lloamc-raven-home')) return;

    const isHomeLink = link => {
      if (!link.matches('a[href]') || link.classList.contains('lloamc-raven-home')) return false;
      try {
        const destination = new URL(link.href, location.href);
        return destination.origin === location.origin
          && (destination.pathname === dashboard.pathname || destination.pathname === dashboardDirectory);
      } catch (error) {
        return false;
      }
    };

    const hideOldHomeLinks = root => {
      const links = [];
      if (root.nodeType === Node.ELEMENT_NODE && isHomeLink(root)) links.push(root);
      if (root.querySelectorAll) links.push(...[...root.querySelectorAll('a[href]')].filter(isHomeLink));
      links.forEach(link => {
        link.hidden = true;
        link.style.setProperty('display', 'none', 'important');
        link.setAttribute('aria-hidden', 'true');
        link.tabIndex = -1;
      });
    };

    hideOldHomeLinks(document);
    new MutationObserver(records => {
      records.forEach(record => record.addedNodes.forEach(hideOldHomeLinks));
    }).observe(document.documentElement, { childList: true, subtree: true });

    const asset = name => new URL(name + '?v=20260818-2', pageScript).href;
    const stylesheetURL = asset('fly-home.css');
    let flyHomeStyles = [...document.querySelectorAll('link[rel="stylesheet"]')]
      .find(link => new URL(link.href, location.href).pathname.endsWith('/fly-home.css'));

    if (!flyHomeStyles) {
      flyHomeStyles = document.createElement('link');
      flyHomeStyles.rel = 'stylesheet';
      flyHomeStyles.href = stylesheetURL;
      document.head.appendChild(flyHomeStyles);
    } else if (flyHomeStyles.href !== stylesheetURL) {
      flyHomeStyles.href = stylesheetURL;
    }

    const sourceURL = asset('raven-home-source.png');
    const patchURLs = Array.from({ length: 6 }, (_, index) => asset(`raven-flap-patch-${index + 1}.png`));
    const fallbackURLs = Array.from({ length: 6 }, (_, index) => asset(`raven-home-fallback-${index + 1}.png`));

    const flyHome = document.createElement('a');
    flyHome.className = 'lloamc-raven-home';
    flyHome.href = dashboard.href;
    flyHome.hidden = true;
    flyHome.setAttribute('aria-label', 'Fly home to the Life Lessons dashboard');
    flyHome.title = 'Fly Home';
    flyHome.innerHTML = `<img class="lloamc-raven-home-source" src="${sourceURL}" alt="" aria-hidden="true">
      <svg class="lloamc-raven-home-label" viewBox="0 0 150 160" role="presentation" aria-hidden="true" focusable="false">
        <circle class="lloamc-raven-home-hit" cx="73.5" cy="92" r="58"></circle>
        <path class="lloamc-raven-home-hit lloamc-raven-home-hit-label" d="M 13 92 A 60 60 0 0 1 133 92"></path>
        <defs>
          <path id="lloamc-fly-home-arc" d="M 13 92 A 60 60 0 0 1 133 92"></path>
        </defs>
        <text>
          <textPath href="#lloamc-fly-home-arc" startOffset="50%" text-anchor="middle">FLY HOME</textPath>
        </text>
      </svg>`;
    document.body.appendChild(flyHome);

    const fallbackImage = flyHome.querySelector('.lloamc-raven-home-source');
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
    const sourceWidth = 1232;
    const sourceHeight = 888;
    const controlCrop = { x: 1048, y: 145, width: 150, height: 160 };
    const initialInlineBackground = document.body.style.backgroundImage;
    const baselineBackground = getComputedStyle(document.body).backgroundImage;
    const coverMatch = baselineBackground.match(/url\((?:"|')?[^)]*PaperbackCoverFinal\.png[^)]*\)/i);
    const frameBackgrounds = coverMatch
      ? patchURLs.map(url => baselineBackground.replace(coverMatch[0], `url("${url}"), ${coverMatch[0]}`))
      : [];
    let animationToken = 0;
    let animationTimer = 0;
    let activated = false;
    let wasDetached = false;
    let assetsReady = false;
    let preloadPromise = null;
    const preloadedImages = [];

    const preload = () => {
      if (preloadPromise) return preloadPromise;
      preloadPromise = Promise.all([...patchURLs, ...fallbackURLs, sourceURL].map(url => new Promise(resolve => {
        const image = new Image();
        preloadedImages.push(image);
        image.decoding = 'async';
        const finish = () => {
          if (typeof image.decode === 'function') {
            image.decode().catch(() => {}).finally(resolve);
          } else {
            resolve();
          }
        };
        image.addEventListener('load', finish, { once: true });
        image.addEventListener('error', resolve, { once: true });
        image.src = url;
        if (image.complete) finish();
      }))).then(() => {
        assetsReady = true;
      });
      return preloadPromise;
    };

    const positionControl = () => {
      const viewportWidth = document.documentElement.clientWidth || window.innerWidth;
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
      const scale = Math.max(viewportWidth / sourceWidth, viewportHeight / sourceHeight);
      const originX = (viewportWidth - sourceWidth * scale) / 2;
      const originY = (viewportHeight - sourceHeight * scale) / 2;
      let left = originX + controlCrop.x * scale;
      let top = originY + controlCrop.y * scale;
      let width = controlCrop.width * scale;
      let height = controlCrop.height * scale;
      const attachment = getComputedStyle(document.body).backgroundAttachment;
      const scrollingBackdrop = /scroll/i.test(attachment);
      if (scrollingBackdrop) {
        top -= window.scrollY;
      }
      const sourceVisible = left < viewportWidth
        && left + width > 0
        && top < viewportHeight
        && top + height > 0;
      const detached = !sourceVisible || !coverMatch;

      if (detached && !wasDetached) {
        document.body.style.backgroundImage = initialInlineBackground;
      }
      wasDetached = detached;

      if (detached) {
        const detachedScale = Math.max(.72, Math.min(1, viewportWidth / 720));
        width = controlCrop.width * detachedScale;
        height = controlCrop.height * detachedScale;
        left = Math.min(Math.max(8, left), Math.max(8, viewportWidth - width - 8));
        top = Math.min(Math.max(62, top), Math.max(62, viewportHeight - height - 8));
      }

      flyHome.classList.toggle('is-detached', detached);
      flyHome.style.setProperty('--lloamc-home-left', `${left.toFixed(2)}px`);
      flyHome.style.setProperty('--lloamc-home-top', `${top.toFixed(2)}px`);
      flyHome.style.setProperty('--lloamc-home-width', `${width.toFixed(2)}px`);
      flyHome.style.setProperty('--lloamc-home-height', `${height.toFixed(2)}px`);
    };

    const restoreArtwork = () => {
      clearTimeout(animationTimer);
      animationTimer = 0;
      document.body.style.backgroundImage = initialInlineBackground;
      fallbackImage.src = sourceURL;
    };

    const runAnimation = () => {
      if (reducedMotion.matches || animationTimer) return;
      const token = ++animationToken;
      let frame = 0;
      const advance = () => {
        if (token !== animationToken) return;
        if (frame >= patchURLs.length * 2) {
          animationTimer = window.setTimeout(() => {
            if (token !== animationToken) return;
            animationTimer = 0;
            restoreArtwork();
          }, 80);
          return;
        }
        const frameIndex = frame % patchURLs.length;
        if (frameBackgrounds.length && !flyHome.classList.contains('is-detached')) {
          document.body.style.backgroundImage = frameBackgrounds[frameIndex];
        }
        fallbackImage.src = fallbackURLs[frameIndex];
        frame += 1;
        animationTimer = window.setTimeout(() => {
          animationTimer = 0;
          advance();
        }, 86);
      };
      advance();
    };

    const animateRaven = () => {
      if (reducedMotion.matches || animationTimer) return;
      if (assetsReady) {
        runAnimation();
        return;
      }
      preload().then(() => {
        if (flyHome.matches(':hover') || document.activeElement === flyHome) runAnimation();
      });
    };

    const activate = () => {
      if (activated) return;
      activated = true;
      document.documentElement.classList.add('lloamc-raven-home-active');
      positionControl();
      flyHome.hidden = false;
      preload();
    };

    flyHome.addEventListener('pointerover', animateRaven);
    flyHome.addEventListener('focus', animateRaven);
    window.addEventListener('resize', positionControl, { passive: true });
    window.addEventListener('scroll', positionControl, { passive: true });
    window.visualViewport?.addEventListener('resize', positionControl, { passive: true });
    document.fonts?.ready.then(positionControl);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        animationToken += 1;
        animationTimer = 0;
        restoreArtwork();
      }
    });

    if (flyHomeStyles.sheet) {
      activate();
    } else {
      flyHomeStyles.addEventListener('load', activate, { once: true });
      setTimeout(activate, 1200);
    }

    if (!cameFromDashboard && !embeddedInDashboard) return;

    document.addEventListener('click', event => {
      const link = event.target.closest('a[href]');
      if (!link || event.defaultPrevented || event.button !== 0
        || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const destination = new URL(link.href, location.href);
      const returnsHome = destination.origin === location.origin
        && (destination.pathname === dashboard.pathname || destination.pathname === dashboardDirectory);
      if (!returnsHome) return;

      event.preventDefault();
      if (embeddedInDashboard) {
        window.parent.postMessage({ type: 'manChildDashboardHome' }, location.origin);
      } else {
        location.assign(dashboard.href);
      }
    }, true);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
