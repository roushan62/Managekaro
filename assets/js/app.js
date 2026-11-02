/* Managekaro — boot & router wiring */
(function (MK) {
  'use strict';
  const U = MK.U, S = MK.store;
  MK.routes = MK.routes || [];

  function boot() {
    S.init();
    MK.UI.shell();
    const route = () => MK.render();
    window.addEventListener('hashchange', route);
    if (!location.hash) location.hash = '#/';
    route();
    S.on('session', () => MK.render());
  }

  MK.boot = boot;
  window.addEventListener('mk-ready', () => { if (!MK._booted) { MK._booted = true; boot(); } }, { once: false });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => { if (!MK._booted) { MK._booted = true; boot(); } });
  else if (!MK._booted) { MK._booted = true; boot(); }
})(window.MK);
