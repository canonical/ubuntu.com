import L from "leaflet";

const mapElement = document.getElementById("locations-map");

if (mapElement) {
  const map = L.map(mapElement, {
    minZoom: 2,
    maxZoom: 19,
    maxBounds: [
      [-75, -180],
      [80, 180],
    ],
    maxBoundsViscosity: 1.0,
  }).setView([31.505, -0.09], 2);

  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  const icon = L.icon({
    iconUrl: "https://assets.ubuntu.com/v1/ea30540d-marker-icon.png",
    iconRetinaUrl: "https://assets.ubuntu.com/v1/ed796590-marker-icon-2x.png",
    iconSize: [20, 32.8],
    iconAnchor: [10, 32.8],
    popupAnchor: [0, -32.8],
  });
  const markers = JSON.parse(
    document.getElementById("map-markers").textContent,
  );
  markers.forEach(({ lat, lon, name }) => {
    L.marker([lat, lon], { icon }).bindPopup(name).addTo(map);
  });

  mapElement.closest(".p-community-map").classList.add("is-ready");
}
