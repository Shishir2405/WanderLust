(function () {
  "use strict";

  function readFormMeta(form) {
    const get = (name) => {
      const el = form.querySelector(`[name="${name}"]`);
      return el ? (el.value || "").trim() : "";
    };
    return {
      title: get("listing[title]"),
      location: get("listing[location]"),
      country: get("listing[country]"),
      category: get("listing[category]"),
    };
  }

  function init() {
    const block = document.querySelector("[data-ai-gen]");
    if (!block) return;
    const form = block.closest("form");
    const targetSelector = block.getAttribute("data-ai-target");
    const target = form?.querySelector(targetSelector);
    if (!form || !target) return;

    const bullets = block.querySelector(".ai-gen__bullets");
    const btn = block.querySelector("[data-ai-go]");
    const ghost = block.querySelector("[data-ai-clear]");
    const status = block.querySelector(".ai-gen__status");

    btn.addEventListener("click", async (e) => {
      e.preventDefault();
      const v = (bullets.value || "").trim();
      if (v.length < 8) {
        if (window.Toast)
          window.Toast.show("Add a few bullets first", "info", 2400);
        bullets.focus();
        return;
      }
      block.classList.add("is-loading");
      btn.disabled = true;
      status.textContent = "Generating description…";
      try {
        const res = await fetch("/api/ai/listing-description", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bullets: v, ...readFormMeta(form) }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Generation failed");
        target.value = data.description || "";
        target.dispatchEvent(new Event("input", { bubbles: true }));
        if (window.Toast)
          window.Toast.show(
            "Draft inserted — feel free to edit",
            "success",
            2600
          );
      } catch (err) {
        if (window.Toast)
          window.Toast.show(err.message || "Couldn't generate", "error", 3500);
      } finally {
        block.classList.remove("is-loading");
        btn.disabled = false;
        status.textContent = "";
      }
    });

    ghost?.addEventListener("click", (e) => {
      e.preventDefault();
      bullets.value = "";
      bullets.focus();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
