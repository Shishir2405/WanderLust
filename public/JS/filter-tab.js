// Define selectedFilters object to store filter selections
let selectedFilters = {
  typeOfPlace: [],
  bedrooms: [],
  beds: [],
  accessibility: [],
};

// Function to toggle filter selection
function toggleSelection(filterType, value) {
  const index = selectedFilters[filterType].indexOf(value);
  if (index > -1) {
    selectedFilters[filterType].splice(index, 1);
  } else {
    selectedFilters[filterType].push(value);
  }
}

// Event listeners for filter buttons
document.querySelectorAll(".filter-typeOfPlace").forEach((button) => {
  button.addEventListener("click", () => {
    toggleSelection("typeOfPlace", button.getAttribute("data-value"));
    filterListings(); // Call function to filter listings
    arrangeFilteredCards(); // Arrange filtered cards
  });
});

document.querySelectorAll(".btn-bedrooms button").forEach((button) => {
  button.addEventListener("click", () => {
    toggleSelection("bedrooms", button.getAttribute("data-value"));
    filterListings();
    arrangeFilteredCards();
  });
});

document.querySelectorAll(".btn-beds button").forEach((button) => {
  button.addEventListener("click", () => {
    toggleSelection("beds", button.getAttribute("data-value"));
    filterListings();
    arrangeFilteredCards();
  });
});

document.querySelectorAll(".btn-accessibility button").forEach((button) => {
  button.addEventListener("click", () => {
    toggleSelection("accessibility", button.getAttribute("data-value"));
    filterListings();
    arrangeFilteredCards();
  });
});

// Function to filter listings based on selected filters
function filterListings() {
  const listings = document.querySelectorAll(".listing-card");
  listings.forEach((listing) => {
    const matchesType =
      !selectedFilters.typeOfPlace.length ||
      selectedFilters.typeOfPlace.includes(listing.getAttribute("data-type"));
    const matchesBedrooms =
      !selectedFilters.bedrooms.length ||
      selectedFilters.bedrooms.includes(listing.getAttribute("data-bedrooms"));
    const matchesBeds =
      !selectedFilters.beds.length ||
      selectedFilters.beds.includes(listing.getAttribute("data-beds"));
    const matchesAccessibility =
      !selectedFilters.accessibility.length ||
      selectedFilters.accessibility.includes(
        listing.getAttribute("data-accessibility")
      );

    const matches =
      matchesType && matchesBedrooms && matchesBeds && matchesAccessibility;
    listing.style.display = matches ? "block" : "none";
  });
}

// Function to arrange filtered cards
function arrangeFilteredCards() {
  const container = document.getElementById("listing-container");
  const listings = container.querySelectorAll(".listing-card");
  const sortedListings = Array.from(listings).sort((a, b) => {
    // Custom sorting logic here if needed
    // This example sorts by listing title
    const titleA = a.dataset.title.toUpperCase();
    const titleB = b.dataset.title.toUpperCase();
    if (titleA < titleB) return -1;
    if (titleA > titleB) return 1;
    return 0;
  });
  container.innerHTML = ""; // Clear container
  sortedListings.forEach((listing) => {
    container.appendChild(listing); // Re-append sorted listings
  });
}

// Event listener for "Show" button to hide modal
document.querySelector("#show").addEventListener("click", () => {
  document.getElementById("modal").style.display = "none";
});

// Event listener for "Close" button to hide modal
document.querySelector("#close").addEventListener("click", () => {
  document.getElementById("modal").style.display = "none";
});
