
  let selectedFilters = {
    typeOfPlace: [],
    bedrooms: [],
    beds: [],
    accessibility: [],
  };

  function toggleSelection(filterType, value) {
    const index = selectedFilters[filterType].indexOf(value);
    if (index > -1) {
      selectedFilters[filterType].splice(index, 1);
    } else {
      selectedFilters[filterType].push(value);
    }
  }

  document.querySelectorAll(".filter-typeOfPlace").forEach((button) => {
    button.addEventListener("click", () => {
      toggleSelection("typeOfPlace", button.getAttribute("data-value"));
    });
  });

  document.querySelectorAll(".btn-bedrooms button").forEach((button) => {
    button.addEventListener("click", () => {
      toggleSelection("bedrooms", button.getAttribute("data-value"));
    });
  });

  document.querySelectorAll(".btn-beds button").forEach((button) => {
    button.addEventListener("click", () => {
      toggleSelection("beds", button.getAttribute("data-value"));
    });
  });

  document.querySelectorAll(".btn-accessibility button").forEach((button) => {
    button.addEventListener("click", () => {
      toggleSelection("accessibility", button.getAttribute("data-value"));
    });
  });

  document
    .querySelector(".footer-filter button")
    .addEventListener("click", () => {
      console.log(selectedFilters); // Check the selected filters
      const listings = document.querySelectorAll(".listing-card");
      listings.forEach((listing) => {
        const matchesType =
          !selectedFilters.typeOfPlace.length ||
          selectedFilters.typeOfPlace.includes(
            listing.getAttribute("data-type")
          );
        const matchesBedrooms =
          !selectedFilters.bedrooms.length ||
          selectedFilters.bedrooms.includes(
            listing.getAttribute("data-bedrooms")
          );
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

      // Reposition matched listing cards
      const container = document.getElementById("listing-container");
      container.innerHTML = ""; // Clear the container
      listings.forEach((listing) => {
        if (listing.style.display === "block") {
          container.appendChild(listing);
        }
      });

      document.getElementById("modal").style.display = "none";
    });

  document
    .querySelector(".footer-filter span")
    .addEventListener("click", () => {
      selectedFilters = {
        typeOfPlace: [],
        bedrooms: [],
        beds: [],
        accessibility: [],
      };
      document.querySelectorAll(".listing-card").forEach((listing) => {
        listing.style.display = "block";
      });
      document.getElementById("modal").style.display = "none";
    });

  document.querySelector("#close").addEventListener("click", () => {
    document.getElementById("modal").style.display = "none";
  });
