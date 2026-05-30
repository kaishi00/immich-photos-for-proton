// Suppress benign ResizeObserver loop warning that Chrome logs as an extension error.
// Must be an external file because Firefox AMO's default CSP blocks inline scripts.
window.addEventListener('error', function(e) {
  if (e.message && e.message.includes('ResizeObserver loop')) {
    e.stopImmediatePropagation();
    e.preventDefault();
  }
});

// Apply theme from URL parameter
(function() {
  const params = new URLSearchParams(window.location.search);
  const theme = params.get('theme');
  if (theme) document.documentElement.setAttribute('data-theme', theme);
})();
