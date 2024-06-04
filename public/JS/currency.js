document.addEventListener("DOMContentLoaded", () => {
    const currencySymbols = {
      INR: "₹",
      AUD: "$",
      BRL: "R$",
      BGN: "лв.",
      CAD: "$",
      CLP: "$",
      CNY: "￥",
      COP: "$",
      CRC: "₡",
      HRK: "kn",
      CZK: "Kč",
      DKK: "kr",
      AED: "ﺩ.ﺇ",
      EUR: "€",
      HKD: "$",
      HUF: "Ft",
      IDR: "Rp",
      ILS: "₪",
      JPY: "¥",
      MYR: "RM",
      MXN: "$",
      MAD: "د.م.",
      TWD: "$",
      NZD: "$",
      NOK: "kr",
      PEN: "S/",
      PHP: "₱",
      PLN: "zł",
      GBP: "£",
      RON: "lei",
      SAR: "SR",
      SGD: "$",
      ZAR: "R",
      KRW: "₩",
      SEK: "kr",
      CHF: "CHF",
      THB: "฿",
      TRY: "₺",
      USD: "$",
      UYU: "$U"
    };

    const conversionRates = {
      INR: 1,
      AUD: 0.018,
      BRL: 0.012,
      BGN: 0.022,
      CAD: 0.016,
      CLP: 0.0011,
      CNY: 0.083,
      COP: 0.00021,
      CRC: 0.0015,
      HRK: 0.011,
      CZK: 0.036,
      DKK: 0.087,
      AED: 0.045,
      EUR: 0.011,
      HKD: 0.094,
      HUF: 3.95,
      IDR: 188.63,
      ILS: 0.041,
      JPY: 1.50,
      MYR: 0.054,
      MXN: 0.20,
      MAD: 0.11,
      TWD: 0.38,
      NZD: 0.020,
      NOK: 0.13,
      PEN: 0.041,
      PHP: 0.68,
      PLN: 0.049,
      GBP: 0.0096,
      RON: 0.054,
      SAR: 0.046,
      SGD: 0.018,
      ZAR: 0.21,
      KRW: 14.92,
      SEK: 0.12,
      CHF: 0.011,
      THB: 0.37,
      TRY: 0.26,
      USD: 0.012,
      UYU: 0.27
    };

    const globeIcon = document.getElementById("globe");
    const modal = document.getElementById("currency-modal");
    const span = document.getElementsByClassName("close")[0];
    const currencyTabs = document.querySelectorAll(".currency-tab");

    globeIcon.onclick = function () {
      modal.style.display = "block";
    };

    span.onclick = function () {
      modal.style.display = "none";
    };

    window.onclick = function (event) {
      if (event.target == modal) {
        modal.style.display = "none";
      }
    };

    currencyTabs.forEach((tab) => {
      tab.onclick = function () {
        const selectedCurrency = this.getAttribute("data-currency");
        updateCurrency(selectedCurrency);
        modal.style.display = "none";
      };
    });

    function updateCurrency(currency) {
      const symbol = currencySymbols[currency];
      const rate = conversionRates[currency];

      document.querySelectorAll(".price-without-gst").forEach((element) => {
        let price = parseFloat(element.dataset.originalPrice);
        let convertedPrice = price * rate;
        element.innerHTML = `<b>${symbol} ${convertedPrice.toLocaleString()}</b> / night`;
      });

      document.querySelectorAll(".price-with-gst").forEach((element) => {
        let price = parseFloat(element.dataset.originalPrice);
        let convertedPrice = price * rate;
        element.innerHTML = `<b>${symbol} ${(convertedPrice * 1.18).toLocaleString()}</b> / night`;
      });
    }
  });

