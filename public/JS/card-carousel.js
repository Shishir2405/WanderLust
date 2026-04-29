(function () {
  "use strict";

  function initCarousel(root) {
    const track = root.querySelector(".card-carousel__track");
    const slides = Array.from(root.querySelectorAll(".card-carousel__slide"));
    if (!track || slides.length <= 1) {
      root.classList.add("card-carousel--single");
      return;
    }

    let index = 0;
    const dots = Array.from(root.querySelectorAll(".card-carousel__dot"));
    const prevBtn = root.querySelector(".card-carousel__btn--prev");
    const nextBtn = root.querySelector(".card-carousel__btn--next");

    function go(target) {
      index = (target + slides.length) % slides.length;
      track.style.transform = `translateX(-${index * 100}%)`;
      dots.forEach((d, i) => d.classList.toggle("is-active", i === index));
    }

    prevBtn?.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      go(index - 1);
    });

    nextBtn?.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      go(index + 1);
    });

    dots.forEach((dot, i) => {
      dot.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        go(i);
      });
    });

    let touchStartX = null;
    track.addEventListener(
      "touchstart",
      (e) => {
        touchStartX = e.touches[0].clientX;
      },
      { passive: true }
    );
    track.addEventListener(
      "touchend",
      (e) => {
        if (touchStartX == null) return;
        const dx = e.changedTouches[0].clientX - touchStartX;
        if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1));
        touchStartX = null;
      },
      { passive: true }
    );
  }

  function init() {
    document.querySelectorAll(".card-carousel").forEach(initCarousel);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
