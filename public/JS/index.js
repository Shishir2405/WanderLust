document.getElementById("scroll-left").addEventListener("click", function () {
  document.getElementById("filters").scrollBy({
    left: -300,
    behavior: "smooth",
  });
});

document.getElementById("scroll-right").addEventListener("click", function () {
  document.getElementById("filters").scrollBy({
    left: 300,
    behavior: "smooth",
  });
});

document
  .getElementById("flexSwitchCheck")
  .addEventListener("click", function () {
    let pricesWithoutGst = document.querySelectorAll(".price-without-gst");
    let pricesWithGst = document.querySelectorAll(".price-with-gst");

    pricesWithoutGst.forEach((item) => {
      item.style.display = item.style.display === "none" ? "inline" : "none";
    });

    pricesWithGst.forEach((item) => {
      item.style.display = item.style.display === "none" ? "inline" : "none";
    });
  });

let originalOrder = [];

document.querySelector(".searchInput").addEventListener("input", function () {
  let searchValue = this.value.trim().toLowerCase();
  let cards = document.querySelectorAll(".listing-card");
  let container = document.getElementById("listing-container");
  let matchedCards = [];

  if (originalOrder.length === 0) {
    originalOrder = Array.from(cards);
  }

  cards.forEach((card) => {
    let title = card.dataset.title;
    if (title.includes(searchValue)) {
      matchedCards.push(card);
    }
  });

  cards.forEach((card) => {
    card.style.display = "none";
  });

  matchedCards.forEach((card) => {
    card.style.display = "block";
    container.insertBefore(card, container.firstChild);
  });
});

document.querySelector(".searchInput").addEventListener("blur", function () {
  if (this.value === "") {
    let container = document.getElementById("listing-container");
    container.innerHTML = "";

    originalOrder.forEach((card) => {
      container.appendChild(card);
      card.style.display = "block";
    });

    originalOrder = [];
  }
});

document.querySelectorAll(".listing-card").forEach((card) => {
  card.addEventListener("click", function () {
    let listingId = this.dataset.listingId;

    let url = `/listings/${listingId}`;

    window.location.href = url;
  });
});


document
  .getElementById("flexSwitch")
  .addEventListener("click", function () {
    let pricesWithoutGst = document.querySelectorAll(".price-without-gst");
    let pricesWithGst = document.querySelectorAll(".price-with-gst");

    pricesWithoutGst.forEach((item) => {
      item.style.display = item.style.display === "none" ? "inline" : "none";
    });

    pricesWithGst.forEach((item) => {
      item.style.display = item.style.display === "none" ? "inline" : "none";
    });
  });
