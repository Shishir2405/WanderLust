/**
 * ! Booking panel client-side script.
 * * Loads availability ranges via AJAX and prevents picking overlapping dates.
 * * Computes a live price preview (nights x price) as the user picks dates.
 */
(function () {
  "use strict";

  const panel = document.querySelector("[data-booking-panel]");
  if (!panel) return;

  const listingId = panel.dataset.listingId;
  const price = parseFloat(panel.dataset.price || "0");
  const form = panel.querySelector("[data-booking-form]");
  if (!form) return;

  const startInput = form.querySelector("[data-booking-start]");
  const endInput = form.querySelector("[data-booking-end]");
  const preview = form.querySelector("[data-booking-preview]");
  const previewText = form.querySelector("[data-booking-preview-text]");

  let bookedRanges = null;
  let fetchPromise = null;

  function notify(message, type) {
    if (window.Toast && typeof window.Toast.show === "function") {
      window.Toast.show(message, type || "error");
    } else {
      alert(message);
    }
  }

  function fetchAvailability() {
    if (bookedRanges) return Promise.resolve(bookedRanges);
    if (fetchPromise) return fetchPromise;
    fetchPromise = fetch(`/listings/${listingId}/bookings/availability.json`)
      .then((r) => (r.ok ? r.json() : { ranges: [] }))
      .then((data) => {
        bookedRanges = (data.ranges || []).map((r) => ({
          start: new Date(r.start),
          end: new Date(r.end),
        }));
        return bookedRanges;
      })
      .catch(() => {
        bookedRanges = [];
        return bookedRanges;
      });
    return fetchPromise;
  }

  function parseDateLocal(s) {
    if (!s) return null;
    const d = new Date(s);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  function nightsBetween(start, end) {
    return Math.round((end - start) / (1000 * 60 * 60 * 24));
  }

  function rangeOverlaps(start, end) {
    if (!bookedRanges) return false;
    return bookedRanges.some((r) => start < r.end && end > r.start);
  }

  function formatINR(amount) {
    try {
      return amount.toLocaleString("en-IN");
    } catch (e) {
      return String(amount);
    }
  }

  function updatePreview() {
    const start = parseDateLocal(startInput.value);
    const end = parseDateLocal(endInput.value);
    if (!start || !end || start >= end) {
      preview.hidden = true;
      previewText.textContent = "";
      return;
    }
    const nights = nightsBetween(start, end);
    const total = nights * price;
    previewText.textContent = `${nights} night${
      nights === 1 ? "" : "s"
    } × ₹${formatINR(price)} = ₹${formatINR(total)}`;
    preview.hidden = false;
  }

  function onDateChange() {
    if (startInput.value) {
      const next = new Date(startInput.value);
      next.setDate(next.getDate() + 1);
      const nextStr = next.toISOString().slice(0, 10);
      if (!endInput.min || endInput.min < nextStr) {
        endInput.min = nextStr;
      }
      if (endInput.value && endInput.value <= startInput.value) {
        endInput.value = "";
      }
    }
    fetchAvailability().then(updatePreview);
  }

  startInput.addEventListener("change", onDateChange);
  endInput.addEventListener("change", onDateChange);

  form.addEventListener("submit", function (e) {
    const start = parseDateLocal(startInput.value);
    const end = parseDateLocal(endInput.value);

    if (!start || !end) {
      e.preventDefault();
      notify("Please pick both check-in and check-out dates.", "error");
      return;
    }
    if (start >= end) {
      e.preventDefault();
      notify("Check-out must be after check-in.", "error");
      return;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (start < today) {
      e.preventDefault();
      notify("Check-in cannot be in the past.", "error");
      return;
    }
    if (rangeOverlaps(start, end)) {
      e.preventDefault();
      notify(
        "Those dates overlap an existing booking. Pick another range.",
        "error"
      );
    }
  });

  fetchAvailability();
})();
