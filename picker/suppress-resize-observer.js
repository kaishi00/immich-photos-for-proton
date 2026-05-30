// Suppress benign ResizeObserver loop warning that Chrome logs as an extension error.
// Must be an external file because Firefox AMO's default CSP blocks inline scripts.
window.addEventListener('error', function(e) {
  if (e.message && e.message.includes('ResizeObserver loop')) {
    e.stopImmediatePropagation();
    e.preventDefault();
  }
});

// Apply theme and version from URL parameters (passed by content script,
// since browser.runtime may not be available in web-accessible iframe)
(function() {
  const params = new URLSearchParams(window.location.search);
  const theme = params.get('theme');
  if (theme) document.documentElement.setAttribute('data-theme', theme);
  const v = params.get('v');
  if (v) document.documentElement.setAttribute('data-version', v);
})();
