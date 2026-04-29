(function () {
  "use strict";

  const RULES = {
    required: (v) => (v.trim().length > 0 ? null : "This field is required."),
    email: (v) =>
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())
        ? null
        : "Enter a valid email address.",
    minLength: (v, n) =>
      v.trim().length >= n ? null : `Must be at least ${n} characters.`,
    maxLength: (v, n) =>
      v.trim().length <= n ? null : `Must be at most ${n} characters.`,
    minNumber: (v, n) =>
      Number(v) >= n ? null : `Must be greater than or equal to ${n}.`,
    pattern: (v, regex) =>
      new RegExp(regex).test(v) ? null : "Doesn't match the expected format.",
  };

  function validateInput(input) {
    const value = input.value || "";
    const rules = parseRules(input);

    for (const [name, arg] of rules) {
      const fn = RULES[name];
      if (!fn) continue;
      const message = fn(value, arg);
      if (message) {
        return input.dataset.validateMessage || message;
      }
    }
    return null;
  }

  function parseRules(input) {
    const rules = [];
    if (input.required) rules.push(["required", null]);
    if (input.type === "email" && input.value) rules.push(["email", null]);
    if (input.minLength > 0) rules.push(["minLength", input.minLength]);
    if (input.maxLength > 0 && input.maxLength < 524288)
      rules.push(["maxLength", input.maxLength]);
    if (input.type === "number" && input.min !== "")
      rules.push(["minNumber", Number(input.min)]);
    if (input.pattern) rules.push(["pattern", input.pattern]);
    return rules;
  }

  function ensureFieldShell(input) {
    let shell = input.closest(".wl-field");
    if (shell) return shell;
    const parent = input.parentElement;
    if (!parent) return null;
    parent.classList.add("wl-field");
    shell = parent;
    if (!shell.querySelector(".wl-field__error")) {
      const err = document.createElement("p");
      err.className = "wl-field__error";
      err.setAttribute("aria-live", "polite");
      shell.appendChild(err);
    }
    return shell;
  }

  function applyState(input, message) {
    const shell = ensureFieldShell(input);
    if (!shell) return;
    const errEl = shell.querySelector(".wl-field__error");
    shell.classList.toggle("is-invalid", Boolean(message));
    shell.classList.toggle("is-valid", !message && (input.value || "").length > 0);
    if (errEl) errEl.textContent = message || "";
  }

  function bindForm(form) {
    const inputs = Array.from(
      form.querySelectorAll("input, textarea, select")
    ).filter((el) => el.type !== "hidden" && el.type !== "submit" && el.type !== "button");

    inputs.forEach((input) => {
      ensureFieldShell(input);
      input.addEventListener("blur", () => {
        input.closest(".wl-field")?.classList.add("is-touched");
        applyState(input, validateInput(input));
      });
      input.addEventListener("input", () => {
        const shell = input.closest(".wl-field");
        if (shell?.classList.contains("is-touched")) {
          applyState(input, validateInput(input));
        }
      });
    });

    form.addEventListener("submit", (e) => {
      let firstInvalid = null;
      inputs.forEach((input) => {
        const shell = input.closest(".wl-field");
        if (shell) shell.classList.add("is-touched");
        const msg = validateInput(input);
        applyState(input, msg);
        if (msg && !firstInvalid) firstInvalid = input;
      });
      if (firstInvalid) {
        e.preventDefault();
        firstInvalid.focus({ preventScroll: false });
        if (window.Toast)
          window.Toast.show("Please fix the highlighted fields", "error", 3000);
      }
    });
  }

  function init() {
    document
      .querySelectorAll("form[data-validate-form]")
      .forEach(bindForm);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
