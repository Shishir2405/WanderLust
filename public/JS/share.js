document.addEventListener("DOMContentLoaded", function () {
    const shareBtn = document.getElementById("shareBtn");

    if (navigator.share) {
      shareBtn.addEventListener("click", function () {
        navigator
          .share({
            title: "Wanderlust", 
            text:"Explore amazing travel destinations and adventures! Check out Wanderlust, your ultimate guide to wander and lust after the world's best spots.",
            url: window.location.href,
          })
          .then(() => console.log("Successful share"))
          .catch((error) => console.log("Error sharing:", error));
      });
    } else {
      shareBtn.style.display = "none"; 
    }
  });


  document.addEventListener("DOMContentLoaded", function () {
    const shareBtn = document.getElementById("shareImage");

    if (navigator.share) {
      shareBtn.addEventListener("click", function () {
        navigator
          .share({
            title: "Wanderlust", 
            text:"Explore amazing travel destinations and adventures! Check out Wanderlust, your ultimate guide to wander and lust after the world's best spots.",
            url: window.location.href,
          })
          .then(() => console.log("Successful share"))
          .catch((error) => console.log("Error sharing:", error));
      });
    } else {
      shareBtn.style.display = "none"; 
    }
  });