/* Site enhancements; navigation and content also work without JavaScript. */
(function () {
  'use strict';
  function initializeTheme() {
    var toggle = document.querySelector('.theme-toggle');
    if (!toggle) return;
    var dark = false;
    try { dark = localStorage.getItem('theme') === 'dark-mode' ||
        (localStorage.getItem('theme') === null && localStorage.getItem('darkMode') === 'true'); } catch (error) {}
    function applyTheme() {
      document.documentElement.classList.toggle('dark-mode', dark);
      document.body.classList.toggle('dark-mode', dark);
      toggle.setAttribute('aria-pressed', String(dark));
      toggle.textContent = dark ? 'Light mode' : 'Dark mode';
    }
    applyTheme();
    toggle.hidden = false;
    toggle.addEventListener('click', function () {
      dark = !dark;
      applyTheme();
      try { localStorage.setItem('theme', dark ? 'dark-mode' : ''); } catch (error) {}
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeTheme);
  } else {
    initializeTheme();
  }
}());
