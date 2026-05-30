// Suppress benign ResizeObserver loop warning that Chrome logs as an extension error.
// Must be an external file because Firefox AMO's default CSP blocks inline scripts.
window.addEventListener('error', function(e) {
  if (e.message && e.message.includes('ResizeObserver loop')) {
    e.stopImmediatePropagation();
    e.preventDefault();
  }
});
