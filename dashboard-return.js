(() => {
  const dashboard = new URL('index.html', location.href);
  const dashboardDirectory = dashboard.pathname.replace(/index\.html$/, '');
  const query = new URLSearchParams(location.search);
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
    if (!link.matches('a[href]') || link.classList.contains('lloamc-fixed-home')) return false;
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
    const fixedHomeStyles = document.createElement('style');
    fixedHomeStyles.textContent = `
      .lloamc-fixed-home {
        position: fixed;
        top: 12px;
        left: 50%;
        z-index: 2147483647;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-height: 40px;
        padding: 11px 16px;
        border: 2px solid #00ffff;
        border-radius: 999px;
        background: linear-gradient(135deg, rgba(8, 13, 24, .95), rgba(41, 16, 77, .95));
        color: #00ffff;
        font-family: "Press Start 2P", Orbitron, monospace;
        font-size: 10px;
        font-weight: 700;
        line-height: 1.35;
        letter-spacing: .04em;
        text-decoration: none;
        box-shadow: 0 0 16px rgba(0, 255, 255, .47), inset 0 0 14px rgba(255, 0, 255, .13);
        backdrop-filter: blur(8px);
        transform: translateX(-50%);
      }

      @media (max-width: 700px) {
        .lloamc-fixed-home {
          top: 12px;
          left: 12px;
          transform: none;
        }
      }
    `;
    document.head.appendChild(fixedHomeStyles);

    const fixedHome = document.createElement('a');
    fixedHome.className = 'lloamc-fixed-home';
    fixedHome.href = dashboard.href;
    fixedHome.textContent = '◀ BACK TO HOME';
    fixedHome.setAttribute('aria-label', 'Back to Home');
    document.body.appendChild(fixedHome);
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
