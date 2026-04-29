(function () {
  "use strict";

  const DEFAULT_DURATION = 4000;

  const ICONS = {
    success: '<i class="fa-solid fa-check" aria-hidden="true"></i>',
    error: '<i class="fa-solid fa-xmark" aria-hidden="true"></i>',
    info: '<i class="fa-solid fa-bell" aria-hidden="true"></i>',
  };

  const ROLE = {
    success: { role: "status", live: "polite" },
    info: { role: "status", live: "polite" },
    error: { role: "alert", live: "assertive" },
  };

  function ensureStack() {
    let stack = document.querySelector(".toast-stack");
    if (!stack) {
      stack = document.createElement("div");
      stack.className = "toast-stack";
      stack.setAttribute("aria-live", "polite");
      stack.setAttribute("aria-atomic", "false");
      document.body.appendChild(stack);
    }
    return stack;
  }

  function dismiss(toast) {
    if (!toast || toast.classList.contains("is-leaving")) return;
    toast.classList.add("is-leaving");
    toast.classList.remove("is-visible");
    const cleanup = () => toast.remove();
    toast.addEventListener("transitionend", cleanup, { once: true });
    setTimeout(cleanup, 500);
  }

  function show(message, type = "info", duration = DEFAULT_DURATION) {
    if (!message) return;
    const stack = ensureStack();
    const variant = ICONS[type] ? type : "info";
    const meta = ROLE[variant];

    const toast = document.createElement("div");
    toast.className = `toast-item toast-item--${variant}`;
    toast.setAttribute("role", meta.role);
    toast.setAttribute("aria-live", meta.live);

    toast.innerHTML = `
      <span class="toast-item__icon">${ICONS[variant]}</span>
      <div class="toast-item__body"></div>
      <button type="button" class="toast-item__close" aria-label="Dismiss notification">
        <i class="fa-solid fa-xmark" aria-hidden="true"></i>
      </button>
      <span class="toast-item__progress" style="animation-duration:${duration}ms"></span>
    `;
    toast.querySelector(".toast-item__body").textContent = message;
    toast
      .querySelector(".toast-item__close")
      .addEventListener("click", () => dismiss(toast));

    stack.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add("is-visible"));

    const timer = setTimeout(() => dismiss(toast), duration);
    toast.addEventListener("mouseenter", () => clearTimeout(timer));
  }

  function hydrateFromDOM() {
    const seeds = document.querySelectorAll("[data-toast]");
    seeds.forEach((node) => {
      const message = node.getAttribute("data-toast-message");
      const type = node.getAttribute("data-toast-type") || "info";
      if (message) show(message, type);
      node.remove();
    });
  }

  window.Toast = { show, dismiss };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", hydrateFromDOM);
  } else {
    hydrateFromDOM();
  }
})();
