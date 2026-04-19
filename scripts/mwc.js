// Material Web Components — sparing enhancement.
// Loaded as a plain ES module so CSP can stay strict (no inline scripts).
// If jsdelivr is blocked or the import fails, the page still works:
// every link below is a native <a> with full semantics.

const MWC = 'https://cdn.jsdelivr.net/npm/@material/web@2.4.1';

const imports = [
  import(`${MWC}/ripple/ripple.js`),
  import(`${MWC}/focus/md-focus-ring.js`),
];

Promise.allSettled(imports).then((results) => {
  const failed = results.filter((r) => r.status === 'rejected');
  if (failed.length) {
    document.documentElement.dataset.mwc = 'degraded';
    // Silently degrade — native links remain fully functional.
    return;
  }
  document.documentElement.dataset.mwc = 'ready';
});
