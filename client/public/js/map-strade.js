import { map, utmToLatLon, fetchData, CanvasOverlay } from './map-common.js';

//canvas overlay per disegnare le linee
let redrawTimeout = null;

//checkbox filtro
const filtroStrade = document.getElementById('filter1');
filtroStrade.checked = true;

//funzione principale
async function loadStrade() {
  const [strade, tratti, giunti] = await Promise.all([
    fetchData('strade'),
    fetchData('tratti'),
    fetchData('giunti')
  ]);

  const segments = tratti
    .map(tratto => {
      const start = giunti[tratto.start]?.coord;
      const end = giunti[tratto.end]?.coord;
      if (!start || !end) return null;
      const [lat1, lon1] = utmToLatLon(start.x, start.y);
      const [lat2, lon2] = utmToLatLon(end.x, end.y);
      return [[lat1, lon1], [lat2, lon2]];
    })
    .filter(Boolean);

  const overlay = new CanvasOverlay((canvas, ctx, map) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 1.5;

    for (const [[lat1, lon1], [lat2, lon2]] of segments) {
      const p1 = map.latLngToContainerPoint([lat1, lon1]);
      const p2 = map.latLngToContainerPoint([lat2, lon2]);
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    }
  });

  overlay.addTo(map);

  map.on('zoomstart', () => { overlay._canvas.style.display = 'none'; });
  map.on('zoomend', () => { overlay._canvas.style.display = 'block'; });

  filtroStrade.addEventListener('change', function () {
    if (this.checked) {
      overlay.addTo(map);
    } else {
      map.removeLayer(overlay);
    }
  });
}

loadStrade();
