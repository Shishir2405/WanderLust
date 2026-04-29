/* 5-step listing wizard
 *  - Steps are <section class="wizard-step" data-step="N">
 *  - The first step is shown by default; subsequent steps are revealed on Next.
 *  - Next is disabled until the current step's required fields pass HTML5 validity.
 *  - On the final step, the form's normal POST submit fires.
 */
(function () {
  const wizard = document.querySelector("[data-wizard]");
  if (!wizard) return;

  const form = wizard.closest("form");
  const steps = Array.from(wizard.querySelectorAll(".wizard-step"));
  const dots = Array.from(wizard.querySelectorAll(".wizard-dot"));
  const counterEl = wizard.querySelector(".wizard-step-counter");
  const btnNext = wizard.querySelector("[data-wizard-next]");
  const btnBack = wizard.querySelector("[data-wizard-back]");
  const btnSubmit = wizard.querySelector("[data-wizard-submit]");

  let current = 0;

  function getRequiredFields(stepEl) {
    return Array.from(
      stepEl.querySelectorAll("input, select, textarea")
    ).filter(
      (el) =>
        el.hasAttribute("required") &&
        !el.disabled &&
        el.type !== "hidden" &&
        el.offsetParent !== null
    );
  }

  function isStepValid(stepEl) {
    const fields = getRequiredFields(stepEl);
    return fields.every((el) => el.checkValidity());
  }

  function setActive(idx) {
    current = Math.max(0, Math.min(idx, steps.length - 1));
    steps.forEach((s, i) => {
      if (i === current) s.setAttribute("data-active", "");
      else s.removeAttribute("data-active");
    });
    dots.forEach((d, i) => {
      d.classList.toggle("is-active", i === current);
      d.classList.toggle("is-complete", i < current);
    });
    if (counterEl) {
      counterEl.textContent =
        "Step " + (current + 1) + " of " + steps.length;
    }
    btnBack.style.visibility = current === 0 ? "hidden" : "visible";
    if (current === steps.length - 1) {
      btnNext.style.display = "none";
      btnSubmit.style.display = "inline-block";
    } else {
      btnNext.style.display = "inline-block";
      btnSubmit.style.display = "none";
    }
    refreshNext();
  }

  function refreshNext() {
    const ok = isStepValid(steps[current]);
    if (btnNext.style.display !== "none") btnNext.disabled = !ok;
    if (btnSubmit && current === steps.length - 1) {
      btnSubmit.disabled = !ok;
    }
  }

  function bindLiveValidation() {
    steps.forEach((s) => {
      s.addEventListener("input", refreshNext, true);
      s.addEventListener("change", refreshNext, true);
    });
  }

  btnNext.addEventListener("click", function (e) {
    e.preventDefault();
    if (!isStepValid(steps[current])) {
      // Focus first invalid
      const fields = getRequiredFields(steps[current]);
      const bad = fields.find((el) => !el.checkValidity());
      if (bad) bad.reportValidity();
      return;
    }
    setActive(current + 1);
    wizard.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  btnBack.addEventListener("click", function (e) {
    e.preventDefault();
    setActive(current - 1);
    wizard.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  // File upload visual feedback
  const fileInput = wizard.querySelector('input[type="file"]');
  if (fileInput) {
    fileInput.addEventListener("change", function () {
      const zone = fileInput.closest(".upload-zone");
      const span = wizard.querySelector("[data-upload-text]");
      if (this.files && this.files.length > 0) {
        if (zone) zone.classList.add("has-file");
        if (span) {
          span.textContent = "Image ready: " + this.files[0].name;
          span.style.color = "#4BB543";
        }
      }
    });
  }

  // Form submit guard: ensure all steps validate.
  if (form) {
    form.addEventListener("submit", function (e) {
      for (let i = 0; i < steps.length; i++) {
        if (!isStepValid(steps[i])) {
          e.preventDefault();
          setActive(i);
          const fields = getRequiredFields(steps[i]);
          const bad = fields.find((el) => !el.checkValidity());
          if (bad) bad.reportValidity();
          return;
        }
      }
    });
  }

  bindLiveValidation();
  setActive(0);
})();
