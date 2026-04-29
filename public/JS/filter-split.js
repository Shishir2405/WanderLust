(function () {
  "use strict";

  function init() {
    const toggleBtn = document.querySelector("[data-split-view-toggle]");
    const splitRoot = document.querySelector(".filter-split");
    if (!toggleBtn || !splitRoot) return;

    const dataNode = document.getElementById("filter-split-data");
    if (!dataNode) return;
    let payload;
    try {
      payload = JSON.parse(dataNode.textContent || "{}");
    } catch (_) {
      return;
    }

    const listings = (payload.listings || []).filter(
      (l) => l && l.coordinates && l.coordinates.length === 2
    );
    const mapToken = payload.mapToken;
    if (!mapToken || listings.length === 0) {
      toggleBtn.disabled = true;
      toggleBtn.title = "Map view unavailable";
      return;
    }

    let map;
    let markers = new Map();
    let initialized = false;
    let activeListingId = null;

    function buildMap() {
      if (initialized) return;
      initialized = true;
      mapboxgl.accessToken = mapToken;
      const center = listings[0].coordinates;
      map = new mapboxgl.Map({
        container: splitRoot.querySelector(".filter-split__map"),
        style: "mapbox://styles/mapbox/streets-v12",
        center,
        zoom: 4,
      });

      const bounds = new mapboxgl.LngLatBounds();

      listings.forEach((listing) => {
        const el = document.createElement("button");
        el.type = "button";
        el.className = "wl-price-marker";
        el.textContent = "₹" + Number(listing.price || 0).toLocaleString("en-IN");
        el.setAttribute("aria-label", listing.title || "Listing");

        const marker = new mapboxgl.Marker({ element: el })
          .setLngLat(listing.coordinates)
          .addTo(map);
        markers.set(listing.id, { marker, el });
        bounds.extend(listing.coordinates);

        el.addEventListener("mouseenter", () => highlight(listing.id, true));
        el.addEventListener("mouseleave", () => highlight(listing.id, false));
        el.addEventListener("click", () => selectListing(listing.id));
      });

      if (listings.length > 1) {
        map.fitBounds(bounds, { padding: 60, duration: 600, maxZoom: 12 });
      }
    }

    function highlight(id, isHover) {
      const card = splitRoot.querySelector(
        `[data-listing-id="${id}"]`
      );
      const entry = markers.get(id);
      if (card) card.classList.toggle("is-active-marker", isHover);
      if (entry) entry.el.classList.toggle("is-hovered", isHover);
    }

    function selectListing(id) {
      if (activeListingId && markers.get(activeListingId)) {
        markers.get(activeListingId).el.classList.remove("is-selected");
      }
      activeListingId = id;
      const entry = markers.get(id);
      if (entry) entry.el.classList.add("is-selected");
      const card = splitRoot.querySelector(`[data-listing-id="${id}"]`);
      if (card) card.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    splitRoot.querySelectorAll("[data-listing-id]").forEach((card) => {
      const id = card.getAttribute("data-listing-id");
      card.addEventListener("mouseenter", () => highlight(id, true));
      card.addEventListener("mouseleave", () => highlight(id, false));
    });

    function setView(on) {
      document.body.dataset.splitView = on ? "on" : "off";
      toggleBtn.classList.toggle("is-active", on);
      toggleBtn.setAttribute("aria-pressed", String(on));
      if (on) {
        buildMap();
        setTimeout(() => map && map.resize(), 60);
      }
    }

    toggleBtn.addEventListener("click", () => {
      const on = document.body.dataset.splitView !== "on";
      setView(on);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
