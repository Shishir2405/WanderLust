(function () {
  "use strict";

  const STORAGE_KEY = "wl-theme";

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
  }

  function readStoredTheme() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (_) {
      return null;
    }
  }

  function persistTheme(theme) {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (_) {
      /* swallow quota / private-mode errors */
    }
  }

  function currentTheme() {
    return document.documentElement.getAttribute("data-theme") === "dark"
      ? "dark"
      : "light";
  }

  function toggleTheme() {
    const next = currentTheme() === "dark" ? "light" : "dark";
    applyTheme(next);
    persistTheme(next);
    if (window.Toast) {
      window.Toast.show(
        next === "dark" ? "Dark mode on" : "Light mode on",
        "info",
        2000
      );
    }
  }

  function bindToggle() {
    const btn = document.querySelector("[data-theme-toggle]");
    if (!btn) return;
    btn.addEventListener("click", toggleTheme);

    if (window.matchMedia) {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      mq.addEventListener?.("change", (e) => {
        if (readStoredTheme()) return;
        applyTheme(e.matches ? "dark" : "light");
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bindToggle);
  } else {
    bindToggle();
  }
})();
