const { utm32N, resizeCanvas, fetchData } = window.utils;

const filtroTratti = document.getElementById('filtroTratti');
filtroTratti.checked = false

const filtroIncidenti = document.getElementById('filtroIncidenti');
filtroIncidenti.checked = false

window.loadAllMapData = async function(map) {
  

  const [strade, tratti, giunti, incidenti] = await Promise.all([
    fetchData('strade'),
    fetchData('tratti'),
    fetchData('giunti'),
    fetchData('incidenti')
  ]);

  const giuntiById = Object.fromEntries(giunti.map(g => [g.id.toString(), g]));

  const trattiProiettati = tratti.map(tratto => {
    const start = giuntiById[tratto.start.toString()].coord;
    const end = giuntiById[tratto.end.toString()].coord;
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
        return [lat, lon, 1]; //intensità uguale per ogni incidente (si potrebbe variare con più dati)
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
   
  const heatLayer = L.heatLayer(incidentiProiettati, {
    radius: 15,
    blur:   25,
    maxZoom:14,
  });

  map.on('zoomstart', () => {
    if (overlayTratti._canvas && overlayTratti._canvas.style) {
    overlayTratti._canvas.style.display = 'none';
    //heatLayer._canvas.style.display = 'none';
    }
  });
  map.on('zoomend', () => {
    if (overlayTratti._canvas && overlayTratti._canvas.style){
    overlayTratti._canvas.style.display = 'block';
    //heatLayer._canvas.style.display = 'block';
    }
  });

  filtroTratti.addEventListener('change', function() {
    if (this.checked) { overlayTratti.addTo(map);} 
    else { map.removeLayer(overlayTratti); }
  });
  filtroIncidenti.addEventListener('change', function() {
    if (this.checked) { heatLayer.addTo(map); } 
    else { map.removeLayer(heatLayer); }
  });
}