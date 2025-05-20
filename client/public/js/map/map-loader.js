const { utm32N, resizeCanvas, fetchData } = window.utils;

//const canvasTratti = document.getElementById('map-canvas-tratti');
//const ctxTratti = canvasTratti.getContext('2d');
const filtroTratti = document.getElementById('filtroTratti');
filtroTratti.checked = false

//const canvasIncidenti = document.getElementById('map-canvas-incidenti');
//const ctxIncidenti = canvasIncidenti.getContext('2d');
const filtroIncidenti = document.getElementById('filtroIncidenti');
filtroIncidenti.checked = false

window.loadAllMapData = async function(map) {
  

  const [strade, tratti, giunti, incidenti] = await Promise.all([
    fetchData('strade'),
    fetchData('tratti'),
    fetchData('giunti'),
    fetchData('incidenti')
  ]);

  const trattiProiettati = tratti.map(tratto => {
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

  const incidentiProiettati = incidenti.map(incidente => {
    const pos = incidente.coord;
    if (
      pos && isFinite(pos.x) && isFinite(pos.y)
    ) {
        const [lon, lat] = proj4(utm32N, proj4.WGS84, [parseFloat(pos.x), parseFloat(pos.y)]);
        return [lat, lon];
    } else { return; }
  }).filter(Boolean);

  map.createPane('pane-tratti');
  map.getPane('pane-tratti').style.zIndex = 610;
  map.createPane('pane-incidenti');
  map.getPane('pane-incidenti').style.zIndex = 630;

  const overlayTratti = new L.CanvasOverlay((canvas, ctx, map) => {
    ctx.clearRect(0,0,canvas.width, canvas.height);
    drawTratti(trattiProiettati, ctx, map);
  }, { name: 'trattiLayer', pane: 'pane-tratti' });
  const overlayIncidenti = new L.CanvasOverlay((canvas, ctx, map) => {
    ctx.clearRect(0,0,canvas.width, canvas.height);
    drawIncidenti(incidentiProiettati, ctx, map);
  }, { name: 'incidentiLayer', pane: 'pane-incidenti' });
  
  map.on('zoomstart', () => {
    overlayTratti._canvas.style.display = 'none';
    overlayIncidenti._canvas.style.display = 'none';
  });
  map.on('zoomend', () => {
    overlayTratti._canvas.style.display = 'block';
    overlayIncidenti._canvas.style.display = 'block';
  });

  filtroTratti.addEventListener('change', function() {
    if (this.checked) { overlayTratti.addTo(map);} 
    else { map.removeLayer(overlayTratti); }
  });
  filtroIncidenti.addEventListener('change', function() {
    if (this.checked) { overlayIncidenti.addTo(map); } 
    else { map.removeLayer(overlayIncidenti); }
  });
}