(function () {
  "use strict";

  const modal = document.getElementById("coll-modal");
  if (!modal) return;
  const list = document.getElementById("coll-modal-list");
  const createForm = document.getElementById("coll-modal-create");
  let activeListingId = null;

  function open(listingId) {
    activeListingId = listingId;
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    loadCollections();
  }

  function close() {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    activeListingId = null;
  }

  async function loadCollections() {
    list.innerHTML =
      '<p style="color: var(--wl-text-muted,#6b6b6b); padding: 0.5rem;">Loading…</p>';
    try {
      const res = await fetch("/collections/mine.json");
      if (res.status === 401 || res.redirected) {
        list.innerHTML =
          '<p style="padding: 0.5rem;"><a href="/login">Sign in</a> to save to a collection.</p>';
        return;
      }
      const data = await res.json();
      renderList(data.collections || []);
    } catch (_) {
      list.innerHTML =
        '<p style="padding: 0.5rem;">Couldn\'t load collections. Try again.</p>';
    }
  }

  function renderList(collections) {
    if (collections.length === 0) {
      list.innerHTML =
        '<p style="color: var(--wl-text-muted,#6b6b6b); padding: 0.5rem;">No collections yet — create one below.</p>';
      return;
    }
    list.innerHTML = "";
    collections.forEach((c) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "coll-modal__item";
      btn.innerHTML = `
        <span class="coll-modal__swatch" style="background:${c.coverColor};"></span>
        <span style="flex:1;">
          <span style="font-weight:600;">${escapeText(c.name)}</span>
          <span style="display:block; font-size:0.78rem; color: var(--wl-text-muted,#6b6b6b);">${c.count} listing${c.count === 1 ? "" : "s"}</span>
        </span>
      `;
      btn.addEventListener("click", () => addToCollection(c.id));
      list.appendChild(btn);
    });
  }

  function escapeText(s) {
    const el = document.createElement("span");
    el.textContent = String(s ?? "");
    return el.innerHTML;
  }

  async function addToCollection(collectionId) {
    if (!activeListingId) return;
    try {
      const res = await fetch(`/collections/${collectionId}/listings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId: activeListingId }),
      });
      if (!res.ok) throw new Error();
      if (window.Toast) window.Toast.show("Saved to collection", "success", 2400);
      close();
    } catch (_) {
      if (window.Toast) window.Toast.show("Couldn't save", "error", 3000);
    }
  }

  createForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(createForm);
    const name = (fd.get("name") || "").toString().trim();
    if (!name) return;
    const body = new URLSearchParams();
    body.set("collection[name]", name);
    body.set("collection[coverColor]", "#fe424d");
    try {
      const res = await fetch("/collections", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
        redirect: "manual",
      });
      createForm.reset();
      await loadCollections();
      if (window.Toast)
        window.Toast.show("Collection created — pick it to save", "info", 2600);
    } catch (_) {
      if (window.Toast) window.Toast.show("Couldn't create", "error", 3000);
    }
  });

  document.addEventListener("click", (e) => {
    const trigger = e.target.closest("[data-save-to-collection]");
    if (trigger) {
      e.preventDefault();
      const id = trigger.getAttribute("data-save-to-collection");
      open(id);
      return;
    }
    if (e.target === modal || e.target.matches("[data-coll-modal-close]")) {
      close();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("is-open")) close();
  });
})();
