import { map, utmToLatLon, fetchData } from './map-common.js';

const filtroIncidenti = document.getElementById('filter2');
filtroIncidenti.checked = true;

let heatLayer = null;

async function loadIncidenti() {
  const incidenti = await fetchData('incidenti');

  //converti in array
  const heatPoints = incidenti.map(i => {
    const [lat, lon] = utmToLatLon(i.coord.x, i.coord.y);
    return [lat, lon, 1]; //intensità 1 per ogni punto
  });

  heatLayer = L.heatLayer(heatPoints, {
    radius: 15,
    blur: 25,
    maxZoom: 17,
  });

  if (filtroIncidenti.checked) {
    heatLayer.addTo(map);
  }

  filtroIncidenti.addEventListener('change', () => {
    if (filtroIncidenti.checked) {
      heatLayer.addTo(map);
    } else {
      map.removeLayer(heatLayer);
    }
  });
}

loadIncidenti();
