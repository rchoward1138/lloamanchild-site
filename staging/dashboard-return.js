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
      history.back();
    }
  }, true);
})();
