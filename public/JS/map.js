mapboxgl.accessToken = mapToken;
console.log(mapToken);
const map = new mapboxgl.Map({
  container: "map",
  center: listing.geometry.coordinates, // starting position [lng, lat]
  zoom: 8,
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


