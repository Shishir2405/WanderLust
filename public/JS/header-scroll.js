(function () {
  "use strict";

  const THRESHOLD = 80;
  let ticking = false;

  function update() {
    const scrolled = window.scrollY > THRESHOLD;
    document.body.dataset.navScrolled = scrolled ? "true" : "false";
    ticking = false;
  }

  function onScroll() {
    if (!ticking) {
      window.requestAnimationFrame(update);
      ticking = true;
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  update();
})();
