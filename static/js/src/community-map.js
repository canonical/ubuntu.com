import L from "leaflet";

const mapElement = document.getElementById("locations-map");

if (mapElement) {
  mapElement.style.height = "400px";
  mapElement.style.zIndex = "1";

  const map = L.map(mapElement, {
    minZoom: 2,
    maxBounds: [
      [-75, -180],
      [80, 180],
    ],
    maxBoundsViscosity: 1.0,
  });
  map.on("load", () => {
    const figure = document.querySelector(".js-show-map");
    figure.style.visibility = "visible";
    figure.style.marginTop = "1rem";
    figure.style.marginBottom = "1.5rem";
    document.querySelector(".js-show-tabs").classList.remove("u-hide");
  });
  map.setView([31.505, -0.09], 2);

  const tiles = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);
  tiles.getContainer().style.filter = "grayscale(100%)";
  tiles.on("tileerror", (event) => {
    console.error("Unable to load map tile:", event.tile.src, event.error);
  });

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
    if (Number.isFinite(lat) && Number.isFinite(lon)) {
      L.marker([lat, lon], { icon }).bindPopup(name).addTo(map);
    }
  });
}
