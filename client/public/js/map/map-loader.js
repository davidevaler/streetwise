const { convertToWGS84, utm32N, resizeCanvas, fetchData, fetchDataField } = window.utils;

const filtroTratti = document.getElementById('filtroTratti');
filtroTratti.checked = false;

const filtroIncidenti = document.getElementById('filtroIncidenti');
filtroIncidenti.checked = false;

const subfilterIncidenti = document.getElementById('subfilter-incidenti');
const filtroAnno = document.getElementById('filtroAnno');

// Variabili globali per gestire i dati
let allIncidentiProiettati = [];
let currentHeatLayer = null;

window.loadAllMapData = async function(map, idCitta) {

  const [strade, tratti, giunti, incidenti] = await Promise.all([
    fetchDataField('strade', 'citta', idCitta),
    fetchDataField('tratti', 'citta', idCitta),
    fetchDataField('giunti', 'citta', idCitta),
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

  // Processa tutti gli incidenti con gestione diversa per anni 2002-2006
  allIncidentiProiettati = incidenti.map(incidente => {
    const pos = incidente.coord;
    if (pos && isFinite(pos.x) && isFinite(pos.y)) {
      let coords;
      const anno = incidente.anno || 'unknown';

      // Se l'anno è tra 2002 e 2006 inclusi, usa convertToWGS84
      if (["2002","2003","2004","2005","2006"].includes(anno.toString())) {
        coords = convertToWGS84(pos.x, pos.y);
      } else {
        coords = proj4(utm32N, proj4.WGS84, [parseFloat(pos.x), parseFloat(pos.y)]);
      }

      if (coords) {
        const [lon, lat] = coords;
        return {
          coords: [lat, lon, 1],
          anno: anno
        };
      }
    }
    return null;
  }).filter(Boolean);

  // Popola il select degli anni
  populateYearFilter();

  map.createPane('pane-tratti');
  map.getPane('pane-tratti').style.zIndex = 610;
  map.createPane('pane-incidenti');
  map.getPane('pane-incidenti').style.zIndex = 630;

  const overlayTratti = new L.CanvasOverlay((canvas, ctx, map) => {
    ctx.clearRect(0,0,canvas.width, canvas.height);
    drawTratti(trattiProiettati, ctx, map);
  }, { name: 'trattiLayer', pane: 'pane-tratti' });

  map.on('zoomstart', () => {
    if (overlayTratti._canvas && overlayTratti._canvas.style) {
      overlayTratti._canvas.style.display = 'none';
    }
  });

  map.on('zoomend', () => {
    if (overlayTratti._canvas && overlayTratti._canvas.style){
      overlayTratti._canvas.style.display = 'block';
    }
  });

  // Gestione filtro tratti
  filtroTratti.addEventListener('change', function() {
    if (this.checked) { 
      overlayTratti.addTo(map);
    } else { 
      map.removeLayer(overlayTratti); 
    }
  });

  // Gestione filtro incidenti principale
  filtroIncidenti.addEventListener('change', function() {
    if (this.checked) {
      subfilterIncidenti.classList.remove('hidden');
      subfilterIncidenti.classList.add('visible');
      updateHeatLayer(map);
    } else {
      subfilterIncidenti.classList.remove('visible');
      subfilterIncidenti.classList.add('hidden');

      if (currentHeatLayer && map.hasLayer(currentHeatLayer)) {
        map.removeLayer(currentHeatLayer);
      }
    }
  });

  // Gestione cambio anno
  filtroAnno.addEventListener('change', function() {
    if (filtroIncidenti.checked) {
      updateHeatLayer(map);
    }
  });

  function updateHeatLayer(map) {
    if (currentHeatLayer && map.hasLayer(currentHeatLayer)) {
      map.removeLayer(currentHeatLayer);
    }

    const annoSelezionato = filtroAnno.value;
    let incidentiFiltrati;

    if (annoSelezionato === 'all') {
      incidentiFiltrati = allIncidentiProiettati.map(inc => inc.coords);
    } else {
      incidentiFiltrati = allIncidentiProiettati
        .filter(inc => inc.anno.toString() === annoSelezionato)
        .map(inc => inc.coords);
    }

    if (incidentiFiltrati.length > 0) {
      currentHeatLayer = L.heatLayer(incidentiFiltrati, {
        radius: 15,
        blur: 25,
        maxZoom: 14,
      });

      currentHeatLayer.addTo(map);
    }
  }

  function populateYearFilter() {
    const anni = new Set();

    allIncidentiProiettati.forEach(incidente => {
      if (incidente.anno !== 'unknown') {
        anni.add(incidente.anno);
      }
    });

    const anniArray = Array.from(anni).sort((a, b) => b - a);

    while (filtroAnno.children.length > 1) {
      filtroAnno.removeChild(filtroAnno.lastChild);
    }

    anniArray.forEach(anno => {
      const option = document.createElement('option');
      option.value = anno;
      option.textContent = anno;
      filtroAnno.appendChild(option);
    });

    const hasUnknownYear = allIncidentiProiettati.some(inc => inc.anno === 'unknown');
    if (hasUnknownYear) {
      const option = document.createElement('option');
      option.value = 'unknown';
      option.textContent = 'Anno sconosciuto';
      filtroAnno.appendChild(option);
    }
  }
};
