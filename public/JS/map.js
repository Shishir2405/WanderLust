mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/streets-v12",
  center: listing.geometry.coordinates,
  zoom: 9,
});

const markerElement = document.getElementById("marker");

const marker1 = new mapboxgl.Marker({ element: markerElement })
  .setLngLat(listing.geometry.coordinates)
  .setPopup(
    new mapboxgl.Popup({ offset: 25 }).setHTML(
      `<h5>${listing.location}</h5><p>Exact location provided after booking.</p>`
    )
  )
  .addTo(map);
