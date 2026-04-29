(function () {
  "use strict";

  function initReadMore() {
    const desc = document.querySelector(".show-description");
    const toggle = document.querySelector(".show-description__toggle");
    if (!desc || !toggle) return;

    const isLong = desc.scrollHeight > desc.clientHeight + 4;
    if (!isLong) {
      desc.classList.remove("is-clamped");
      toggle.style.display = "none";
      return;
    }

    toggle.addEventListener("click", () => {
      const expanded = !desc.classList.contains("is-clamped");
      if (expanded) {
        desc.classList.add("is-clamped");
        toggle.textContent = "Read more";
      } else {
        desc.classList.remove("is-clamped");
        toggle.textContent = "Show less";
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initReadMore);
  } else {
    initReadMore();
  }
})();
