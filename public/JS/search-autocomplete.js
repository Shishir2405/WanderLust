(function () {
  "use strict";

  const DEBOUNCE_MS = 220;

  function debounce(fn, ms) {
    let t;
    return function (...args) {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), ms);
    };
  }

  function escapeHTML(s) {
    return String(s ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  function formatPrice(p) {
    if (p == null || isNaN(p)) return "";
    return "₹" + Number(p).toLocaleString("en-IN");
  }

  function renderSkeleton(panel) {
    panel.innerHTML = "";
    for (let i = 0; i < 3; i++) {
      const row = document.createElement("div");
      row.className = "wl-search__skel";
      row.innerHTML = `
        <div class="wl-search__skel-block wl-search__skel-thumb"></div>
        <div>
          <div class="wl-search__skel-block wl-search__skel-line"></div>
          <div class="wl-search__skel-block wl-search__skel-line"></div>
        </div>
      `;
      panel.appendChild(row);
    }
  }

  function renderResults(panel, results, query) {
    if (!results || results.length === 0) {
      panel.innerHTML = `<div class="wl-search__empty">No matches for "${escapeHTML(
        query
      )}"</div>`;
      return;
    }
    panel.innerHTML = "";
    results.forEach((r, i) => {
      const a = document.createElement("a");
      a.className = "wl-search__item" + (i === 0 ? " is-active" : "");
      a.href = "/listings/" + r.id;
      const meta = [r.location, r.country].filter(Boolean).join(", ");
      a.innerHTML = `
        <img class="wl-search__thumb" src="${escapeHTML(
          r.thumbnail || ""
        )}" alt="" />
        <div>
          <p class="wl-search__title">${escapeHTML(r.title || "")}</p>
          <p class="wl-search__meta">${escapeHTML(meta)}</p>
        </div>
        <span class="wl-search__price">${escapeHTML(formatPrice(r.price))}</span>
      `;
      panel.appendChild(a);
    });
  }

  function init() {
    const input = document.querySelector(".searchInput");
    if (!input) return;
    const wrap = input.closest(".searchBox") || input.parentElement;
    if (!wrap) return;
    wrap.classList.add("wl-search");

    const panel = document.createElement("div");
    panel.className = "wl-search__panel";
    panel.setAttribute("role", "listbox");
    panel.innerHTML =
      '<div class="wl-search__hint">Type to search listings…</div>';
    wrap.appendChild(panel);

    let activeRequest = null;

    const search = debounce(async (q) => {
      if (!q || q.trim().length < 2) {
        panel.innerHTML =
          '<div class="wl-search__hint">Keep typing… (min 2 chars)</div>';
        return;
      }
      renderSkeleton(panel);
      const ctrl = new AbortController();
      if (activeRequest) activeRequest.abort();
      activeRequest = ctrl;
      try {
        const res = await fetch(
          "/api/search?q=" + encodeURIComponent(q),
          { signal: ctrl.signal }
        );
        if (!res.ok) throw new Error("search failed");
        const data = await res.json();
        renderResults(panel, data.results || [], q);
      } catch (err) {
        if (err.name === "AbortError") return;
        panel.innerHTML =
          '<div class="wl-search__empty">Search unavailable. Try again.</div>';
      } finally {
        if (activeRequest === ctrl) activeRequest = null;
      }
    }, DEBOUNCE_MS);

    function open() {
      wrap.classList.add("is-open");
    }
    function close() {
      wrap.classList.remove("is-open");
    }

    input.addEventListener("focus", open);
    input.addEventListener("input", (e) => {
      open();
      search(e.target.value);
    });
    input.addEventListener("keydown", (e) => {
      const items = Array.from(panel.querySelectorAll(".wl-search__item"));
      if (items.length === 0) return;
      const activeIdx = items.findIndex((el) =>
        el.classList.contains("is-active")
      );
      if (e.key === "ArrowDown") {
        e.preventDefault();
        items[activeIdx]?.classList.remove("is-active");
        items[Math.min(activeIdx + 1, items.length - 1)].classList.add(
          "is-active"
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        items[activeIdx]?.classList.remove("is-active");
        items[Math.max(activeIdx - 1, 0)].classList.add("is-active");
      } else if (e.key === "Enter") {
        const target = items[Math.max(activeIdx, 0)];
        if (target) {
          e.preventDefault();
          window.location.href = target.href;
        }
      } else if (e.key === "Escape") {
        close();
        input.blur();
      }
    });

    document.addEventListener("click", (e) => {
      if (!wrap.contains(e.target)) close();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
