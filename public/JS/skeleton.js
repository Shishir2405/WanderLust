(function () {
  "use strict";

  function markLoaded(wrap) {
    wrap.classList.remove("is-loading");
    wrap.classList.add("is-loaded");
  }

  function attachToImage(wrap) {
    const img = wrap.querySelector("img");
    if (!img) return;
    if (img.complete && img.naturalWidth > 0) {
      markLoaded(wrap);
      return;
    }
    img.addEventListener("load", () => markLoaded(wrap), { once: true });
    img.addEventListener(
      "error",
      () => {
        wrap.classList.remove("is-loading");
        wrap.classList.add("is-error");
      },
      { once: true }
    );
  }

  function init() {
    document
      .querySelectorAll(".card-image-wrap.is-loading")
      .forEach(attachToImage);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
