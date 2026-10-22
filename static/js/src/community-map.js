import L from "leaflet";
// Natural Earth 1:110m countries GeoJSON, v5.1.2 (public domain).
// Source: https://github.com/nvkelso/natural-earth-vector/blob/v5.1.2/geojson/ne_110m_admin_0_countries.geojson
import countries from "../data/natural-earth-countries.json";

const mapElement = document.getElementById("locations-map");

if (mapElement) {
  const map = L.map(mapElement, {
    minZoom: 2,
    maxZoom: 6,
    maxBounds: [
      [-75, -180],
      [80, 180],
    ],
    maxBoundsViscosity: 1.0,
  }).setView([31.505, -0.09], 2);

  L.geoJSON(countries, {
    interactive: false,
    style: {
      color: "#999",
      weight: 1,
      fillColor: "#fff",
      fillOpacity: 1,
    },
    attribution:
      'Made with <a href="https://www.naturalearthdata.com/">Natural Earth</a>',
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
