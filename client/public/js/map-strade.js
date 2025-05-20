//Elementi del Doc utili
const canvas = document.getElementById('map-canvas');
const ctx = canvas.getContext('2d');
const filtroStrade = document.getElementById('filter1');
filtroStrade.checked = true;

//Setta la mappa
const map = L.map('leaflet-map').setView([46.065, 11.12], 13); // Coord Trento

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);


//Converti coord da UTM 
//UTM e un sistema diverso dal classico GPS per le coord
const utm32N = '+proj=utm +zone=32 +datum=WGS84 +units=m +no_defs';
function projectCoordUTM(x, y) {
  x = parseFloat(x)
  y = parseFloat(y)
  const [lon, lat] = proj4(utm32N, proj4.WGS84, [x, y]);
  const point = map.latLngToContainerPoint([lat, lon]);
  return [point.x, point.y];
}


// Cambia le dim. di canvas per essere uguali alla mappa
function resizeCanvas() {
  const rect = map.getContainer().getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.height;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);


// Inizializzo mantoStradale
let mantoStradale = null;


// Disegna le strade
let redrawTimeout = 0;
L.CanvasOverlay = L.Layer.extend({
  initialize: function (drawCallback) {
    this._drawCallback = drawCallback;
  },

  onAdd: function (map) {
    this._map = map;
    this._canvas = L.DomUtil.create('canvas', 'leaflet-canvas-overlay');
    this._canvas.style.position = 'absolute';
    this._ctx = this._canvas.getContext('2d');

    const pane = map.getPane('overlayPane');
    pane.appendChild(this._canvas);

    map.on('move zoom resize', this._reset, this);
    this._reset();
  },

  onRemove: function () {
    L.DomUtil.remove(this._canvas);
    this._map.off('move zoom resize', this._reset, this);
  },

  _reset: function () {
    const size = this._map.getSize();
    const pos = this._map.containerPointToLayerPoint([0, 0]);

    this._canvas.width = size.x;
    this._canvas.height = size.y;
    L.DomUtil.setPosition(this._canvas, pos);

    clearTimeout(redrawTimeout);
    redrawTimeout = setTimeout(() => {
      this._ctx.clearRect(0, 0, size.x, size.y);
      this._drawCallback(this._canvas, this._ctx, this._map);
    }, 20); // Pausa per il movimento (altirmenti lagga)
  }
});


//fetch API/endpoint
async function fetchData(endpoint) {
  try {
    const response = await fetch(`${SERVER_URL}/api/${endpoint}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch /api/${endpoint}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    return null;
  }
}

async function loadAllMapData() {
  const [strade, tratti, giunti] = await Promise.all([
    fetchData('strade'),
    fetchData('tratti'),
    fetchData('giunti')
  ]);

  const projectedSegments = tratti.map(tratto => {
    const start = giunti[tratto.start.toString()].coord;
    const end = giunti[tratto.end.toString()].coord;
    if (
      start && end &&
      isFinite(start.x) && isFinite(start.y) &&
      isFinite(end.x) && isFinite(end.y)
    ) {
      const [lon1, lat1] = proj4(utm32N, proj4.WGS84, [parseFloat(start.x), parseFloat(start.y)]);
      const [lon2, lat2] = proj4(utm32N, proj4.WGS84, [parseFloat(end.x), parseFloat(end.y)]);

      return [[lat1, lon1], [lat2, lon2]];
    } else { return; }
  }).filter(Boolean);

  const overlay = new L.CanvasOverlay((canvas, ctx, map) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const [[lat1, lon1], [lat2, lon2]] of projectedSegments) {
      const p1 = map.latLngToContainerPoint([lat1, lon1]);
      const p2 = map.latLngToContainerPoint([lat2, lon2]);
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.strokeStyle = '#444';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  });

  // Per 'nascondere' il canvas mentre si zoomma 
  // Altrimenti lagga
  map.on('zoomstart', () => {
    overlay._canvas.style.display = 'none';
  });
  map.on('zoomend', () => {
    overlay._canvas.style.display = 'block';
  });
    
  overlay.addTo(map);

  filtroStrade.addEventListener('change', function () {
    if (this.checked) {
      overlay.addTo(map);
    } else {
      map.removeLayer(overlay);
    }
  });

}

loadAllMapData();
