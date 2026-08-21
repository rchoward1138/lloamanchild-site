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
    if (!document.body || document.querySelector('[data-lloamc-dashboard-home]')) return;

    const homeSelector = '[data-lloamc-dashboard-home]';
    const isHomeLink = link => {
      if (!link.matches('a[href]') || link.matches(homeSelector)) return false;
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
    const legacyLinkObserver = new MutationObserver(records => {
      records.forEach(record => record.addedNodes.forEach(hideOldHomeLinks));
    });
    legacyLinkObserver.observe(document.documentElement, { childList: true, subtree: true });

    const asset = name => new URL(`${name}?v=20260821-1`, pageScript).href;
    const stylesheetURL = asset('fly-home.css');
    let commandStyles = [...document.querySelectorAll('link[rel="stylesheet"]')]
      .find(link => new URL(link.href, location.href).pathname.endsWith('/fly-home.css'));

    if (!commandStyles) {
      commandStyles = document.createElement('link');
      commandStyles.rel = 'stylesheet';
      commandStyles.href = stylesheetURL;
      document.head.appendChild(commandStyles);
    } else if (commandStyles.href !== stylesheetURL) {
      commandStyles.href = stylesheetURL;
    }

    const pageLabels = {
      'about.html': 'ABOUT THE AUTHOR',
      'bee-leaf.html': 'BEE-LEAF',
      'cat-library-runner.html': "JUMPIN' PUNKIN'",
      'contra-life-lessons.html': 'CONTRA LIFE LESSONS',
      'cryptogram.html': 'SHALL WE PLAY A GAME?',
      'currents.html': 'CURRENTS',
      'honeygame.html': 'BEE-LEAF ADVENTURE',
      'kittykids.html': 'KITTY KIDS',
      'lens.html': 'THROUGH THE MAN-CHILD LENS',
      'man-childness.html': 'MAN-CHILDNESS',
      'meaning.html': 'THE MEANING OF LIFE',
      'mimaw.html': 'MIMAW',
      'more.html': 'MORE LIFE LESSONS',
      'podcasts.html': 'THE MAN-CHILD BROADCAST',
      'share.html': 'SHARE THE STORY',
      'squirrel.html': 'SUPER SECRET SQUIRREL',
      'tictactoe.html': 'GRID DUEL',
      'ultimate-gift.html': 'THE ULTIMATE GIFT',
      'why-he-did-this.html': 'WHY HE DID THIS'
    };
    const pageName = location.pathname.split('/').pop() || '';
    const pageLabel = pageLabels[pageName]
      || document.title.split('|')[0].split(' - ')[0].trim().toUpperCase()
      || 'LIFE LESSONS';

    const commandBar = document.createElement('nav');
    commandBar.className = 'lloamc-home-command';
    commandBar.hidden = true;
    commandBar.setAttribute('aria-label', 'Site navigation');
    commandBar.innerHTML = `<a class="lloamc-home-command-link" data-lloamc-dashboard-home href="${dashboard.href}" aria-label="Return to the Life Lessons home dashboard">
        <span class="lloamc-home-command-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" focusable="false" role="presentation">
            <path class="lloamc-home-command-roof" d="M2.75 11.25 12 3l9.25 8.25"></path>
            <path class="lloamc-home-command-house" d="M5 9.6V21h5v-6h4v6h5V9.6"></path>
            <path class="lloamc-home-command-pixel" d="M18.5 3.5h2v2h-2z"></path>
          </svg>
        </span>
        <span class="lloamc-home-command-copy">
          <strong>HOME</strong>
          <small>MAIN DASHBOARD</small>
        </span>
      </a>
      <span class="lloamc-home-command-context" aria-hidden="true">
        <span>LIFE LESSONS</span><i>//</i><strong>${pageLabel}</strong>
      </span>
      ${embeddedInDashboard ? '<span class="lloamc-home-command-hint" aria-hidden="true"><kbd>ESC</kbd> CLOSE</span>' : '<span aria-hidden="true"></span>'}`;

    const findStageBanner = () => document.querySelector('.stage, #lloamc-staging-banner');
    const placeCommandBar = () => {
      const stageBanner = findStageBanner();
      if (stageBanner) {
        document.documentElement.classList.add('lloamc-home-command-has-stage');
        if (stageBanner.nextElementSibling !== commandBar) stageBanner.after(commandBar);
      } else if (!commandBar.isConnected) {
        document.body.prepend(commandBar);
      }
    };

    placeCommandBar();
    const stageObserver = new MutationObserver(() => {
      if (!findStageBanner()) return;
      placeCommandBar();
      stageObserver.disconnect();
    });
    if (!findStageBanner()) stageObserver.observe(document.body, { childList: true });

    let activated = false;
    const activate = () => {
      if (activated) return;
      activated = true;
      document.documentElement.classList.add('lloamc-home-command-active');
      commandBar.hidden = false;
    };

    if (commandStyles.sheet) {
      activate();
    } else {
      commandStyles.addEventListener('load', activate, { once: true });
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
