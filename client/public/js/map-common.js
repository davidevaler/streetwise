const SERVER_URL = window.SERVER_URL;

//proiezione UTM
export const UTM32N = '+proj=utm +zone=32 +datum=WGS84 +units=m +no_defs';

//funzione di conversione coordinate UTM → LatLon
export function utmToLatLon(x, y) {
  const [lon, lat] = proj4(UTM32N, proj4.WGS84, [parseFloat(x), parseFloat(y)]);
  return [lat, lon];
}

//funzione fetch generica per tutte le API
export async function fetchData(endpoint) {
  try {
    const res = await fetch(`${SERVER_URL}/api/${endpoint}`);
    if (!res.ok) throw new Error(`Fetch ${endpoint} ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error(err);
    return [];
  }
}

//oggetto mappa condiviso
export const map = L.map('leaflet-map').setView([46.065, 11.12], 13);

//tile layer base di OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

//overlay Canvas custom
export const CanvasOverlay = L.Layer.extend({
  initialize: function (drawCallback) {
    this._drawCallback = drawCallback;
  },
  onAdd: function (map) {
    this._map = map;
    this._canvas = L.DomUtil.create('canvas', 'leaflet-canvas-overlay');
    this._canvas.style.position = 'absolute';
    this._ctx = this._canvas.getContext('2d');
    map.getPane('overlayPane').appendChild(this._canvas);
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
    this._ctx.clearRect(0, 0, size.x, size.y);
    this._drawCallback(this._canvas, this._ctx, this._map);
  }
});