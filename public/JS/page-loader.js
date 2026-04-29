/**
 * Page-load progress bar.
 * Animates a top-fixed brand-red bar during outgoing same-origin navigations.
 */
(function () {
  "use strict";

  function ensureBar() {
    var bar = document.getElementById("wl-page-loader");
    if (!bar) {
      bar = document.createElement("div");
      bar.id = "wl-page-loader";
      bar.setAttribute("role", "progressbar");
      bar.setAttribute("aria-hidden", "true");
      (document.body || document.documentElement).appendChild(bar);
    }
    return bar;
  }

  var fadeTimer = null;

  function startProgress() {
    var bar = ensureBar();
    if (fadeTimer) {
      clearTimeout(fadeTimer);
      fadeTimer = null;
    }
    // Reset to 0%, force reflow so the transition runs.
    bar.classList.add("is-active");
    bar.style.width = "0%";
    // eslint-disable-next-line no-unused-expressions
    bar.offsetWidth;
    bar.style.width = "80%";

    // Safety: if navigation never completes, fade out after 6s.
    fadeTimer = setTimeout(function () {
      finishProgress();
    }, 6000);
  }

  function finishProgress() {
    var bar = document.getElementById("wl-page-loader");
    if (!bar) return;
    bar.style.width = "100%";
    setTimeout(function () {
      bar.classList.remove("is-active");
      bar.style.width = "0%";
    }, 250);
    if (fadeTimer) {
      clearTimeout(fadeTimer);
      fadeTimer = null;
    }
  }

  function isSameOriginNav(anchor) {
    if (!anchor || !anchor.href) return false;
    if (anchor.target && anchor.target !== "" && anchor.target !== "_self") {
      return false;
    }
    if (anchor.hasAttribute("download")) return false;
    if (anchor.closest("[data-no-loader]")) return false;

    var url;
    try {
      url = new URL(anchor.href, window.location.href);
    } catch (e) {
      return false;
    }

    if (url.origin !== window.location.origin) return false;

    // Anchor-only links on the same page should not trigger.
    var sameDoc =
      url.pathname === window.location.pathname &&
      url.search === window.location.search;
    if (sameDoc && url.hash) return false;

    // Custom protocols / mailto / tel
    if (
      url.protocol !== window.location.protocol &&
      (url.protocol === "mailto:" || url.protocol === "tel:")
    ) {
      return false;
    }

    return true;
  }

  document.addEventListener("DOMContentLoaded", function () {
    var bar = ensureBar();
    // First paint: complete a quick sweep then hide.
    bar.classList.add("is-active");
    bar.style.width = "100%";
    setTimeout(function () {
      bar.classList.remove("is-active");
      bar.style.width = "0%";
    }, 350);
  });

  document.addEventListener(
    "click",
    function (e) {
      // Ignore modifier-key clicks (open in new tab, etc.)
      if (
        e.defaultPrevented ||
        e.button !== 0 ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      ) {
        return;
      }
      var target = e.target;
      var anchor = target && target.closest ? target.closest("a") : null;
      if (!anchor) return;
      if (!isSameOriginNav(anchor)) return;
      startProgress();
    },
    true
  );

  window.addEventListener("beforeunload", function () {
    startProgress();
  });

  window.addEventListener("pagehide", function () {
    finishProgress();
  });
})();
