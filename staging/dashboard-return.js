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

  const isHomeLink = link => {
    if (!link.matches('a[href]') || link.classList.contains('lloamc-fly-home')) return false;
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

  if (!embeddedInDashboard) {
    const flyHomeStyles = document.createElement('link');
    flyHomeStyles.rel = 'stylesheet';
    flyHomeStyles.href = new URL('fly-home.css?v=20260817-1', pageScript).href;
    document.head.appendChild(flyHomeStyles);
    document.documentElement.classList.add('lloamc-fly-home-active');

    const flyHomeDock = document.createElement('aside');
    flyHomeDock.className = 'lloamc-fly-home-dock';
    flyHomeDock.setAttribute('aria-label', 'Return navigation');

    const flyHome = document.createElement('a');
    flyHome.className = 'lloamc-fly-home';
    flyHome.href = dashboard.href;
    flyHome.setAttribute('aria-label', 'Fly home to the Life Lessons dashboard');
    flyHome.title = 'Fly Home';
    flyHome.innerHTML = `<span class="lloamc-fly-home-art" aria-hidden="true">
          <svg viewBox="0 0 120 110" role="presentation" focusable="false">
            <defs>
              <radialGradient id="lloamc-moon-surface" cx="34%" cy="28%" r="72%">
                <stop offset="0%" stop-color="#fff9c9"/>
                <stop offset="44%" stop-color="#ffd978"/>
                <stop offset="78%" stop-color="#d88a42"/>
                <stop offset="100%" stop-color="#7d3650"/>
              </radialGradient>
              <linearGradient id="lloamc-raven-feather" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#26163d"/>
                <stop offset="48%" stop-color="#05040b"/>
                <stop offset="100%" stop-color="#23064a"/>
              </linearGradient>
              <filter id="lloamc-moon-glow" x="-60%" y="-60%" width="220%" height="220%">
                <feGaussianBlur stdDeviation="4" result="glow"/>
                <feMerge><feMergeNode in="glow"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
            </defs>
            <circle class="lloamc-moon-halo" cx="60" cy="51" r="47"/>
            <circle class="lloamc-moon" cx="60" cy="51" r="41" fill="url(#lloamc-moon-surface)" filter="url(#lloamc-moon-glow)"/>
            <g class="lloamc-moon-craters">
              <ellipse cx="43" cy="35" rx="8" ry="5"/>
              <ellipse cx="73" cy="29" rx="5" ry="8"/>
              <ellipse cx="80" cy="60" rx="9" ry="6"/>
              <ellipse cx="47" cy="70" rx="6" ry="9"/>
              <circle cx="64" cy="47" r="4"/>
            </g>
            <g class="lloamc-raven">
              <path class="lloamc-wing lloamc-wing-left" d="M58 49C47 38 36 25 17 22c10 12 15 20-2 27 16 1 29 8 44 14z"/>
              <path class="lloamc-wing lloamc-wing-right" d="M64 49c13-12 25-22 42-20-11 10-13 17 4 23-16 1-30 7-45 12z"/>
              <path class="lloamc-raven-tail" d="M56 64 43 82l16-8 8 13 5-20z"/>
              <path class="lloamc-raven-body" d="M51 49c6-8 19-9 27-2 7 6 6 16 0 22-8 8-23 5-28-5-3-6-2-11 1-15z"/>
              <circle class="lloamc-raven-head" cx="78" cy="47" r="8"/>
              <path class="lloamc-raven-beak" d="m84 45 16 5-16 3z"/>
              <circle class="lloamc-raven-eye" cx="80" cy="44" r="1.5"/>
            </g>
          </svg>
        </span>
        <span class="lloamc-fly-home-label">FLY HOME</span>`;

    flyHomeDock.appendChild(flyHome);
    document.body.appendChild(flyHomeDock);
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
})();
