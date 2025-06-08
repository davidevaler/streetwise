// Elementi DOM per i filtri trasporti
const filtroTrasporti = document.getElementById('filtroTrasporti');
const subfilterTrasporti = document.getElementById('subfilter-trasporti');
const filtroLinea = document.getElementById('filtroLinea');
const filtroOraInizio = document.getElementById('filtroOraInizio');
const filtroOraFine = document.getElementById('filtroOraFine');
const transportInfo = document.getElementById('transport-info');
const transportSummary = document.getElementById('transport-summary');

let allFermateData = [];
let allCorseData = [];
let currentFermateLayer = null;
let currentHeatLayerTrasporti = null;
let currentBusStopMarkers = [];

const MIN_ZOOM_FOR_STOPS = 14;

window.loadTrasportiData = async function(map, idCitta) {
  try {
    const [fermate, corse] = await Promise.all([
      fetchDataField('fermate', 'citta', idCitta),
      fetchDataField('corse', 'citta', idCitta)
    ]);

    allFermateData = (fermate || []).map(f => ({
      ...f,
      lat: f.coord?.y,
      lon: f.coord?.x
    })).filter(f => isFinite(f.lat) && isFinite(f.lon));

    allCorseData = corse || [];

    populateLineFilter();

    filtroTrasporti.addEventListener('change', function() {
      if (this.checked) {
        subfilterTrasporti.classList.remove('hidden');
        subfilterTrasporti.classList.add('visible');
        transportInfo.style.display = 'block';
        updateTrasportiDisplay(map);
        updateTransportInfo();
      } else {
        subfilterTrasporti.classList.remove('visible');
        subfilterTrasporti.classList.add('hidden');
        transportInfo.style.display = 'none';
        clearTrasportiDisplay(map);
      }
    });

    [filtroLinea, filtroOraInizio, filtroOraFine].forEach(f => {
      f.addEventListener('change', function() {
        if (filtroTrasporti.checked) {
          updateTrasportiDisplay(map);
          updateTransportInfo();
        }
      });
    });

    map.on('zoomend', function() {
      if (filtroTrasporti.checked) updateBusStopsVisibility(map);
    });
  } catch (error) {
    console.error('Errore nel caricamento dati trasporti:', error);
  }
};

function populateLineFilter() {
  const linee = new Set(allCorseData.map(c => c.linea).filter(Boolean));
  const lineeArray = Array.from(linee).sort();
  while (filtroLinea.children.length > 1) filtroLinea.removeChild(filtroLinea.lastChild);
  lineeArray.forEach(linea => {
    const option = document.createElement('option');
    option.value = linea;
    option.textContent = `Linea ${linea}`;
    filtroLinea.appendChild(option);
  });
}

function updateTrasportiDisplay(map) {
  clearTrasportiDisplay(map);
  const corseFiltrate = filterCorseData();
  const heatmapData = generateHeatmapData(corseFiltrate);
  if (heatmapData.length > 0) {
    currentHeatLayerTrasporti = L.heatLayer(heatmapData, {
      radius: 20,
      blur: 30,
      maxZoom: 16
    });
    currentHeatLayerTrasporti.addTo(map);
  }
  updateBusStopsVisibility(map);
}

function filterCorseData() {
  const linea = filtroLinea.value;
  const oraInizio = filtroOraInizio.value;
  const oraFine = filtroOraFine.value;
  return allCorseData.filter(c => {
    if (linea !== 'all' && c.linea !== linea) return false;
    if (oraInizio && c.ora_partenza < oraInizio) return false;
    if (oraFine && c.ora_partenza > oraFine) return false;
    return true;
  });
}

function generateHeatmapData(corse) {
  const fermatePasseggeri = {};
  corse.forEach(c => {
    fermatePasseggeri[c.fermata] = (fermatePasseggeri[c.fermata] || 0) + (c.salita || 0);
  });
  return Object.entries(fermatePasseggeri).map(([id, tot]) => {
    const fermata = allFermateData.find(f => f._id.toString() === id);
    return fermata ? [fermata.lat, fermata.lon, Math.min(tot / 10, 5)] : null;
  }).filter(Boolean);
}

function getTimeIntervalHours() {
  const start = filtroOraInizio.value || '00:00';
  const end = filtroOraFine.value || '23:59';
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  let diff = (eh * 60 + em) - (sh * 60 + sm);
  if (diff <= 0) diff += 24 * 60;
  return diff / 60;
}

function getColorByPassengersPerHour(pph) {
  if (pph < 1) return '#00bfff'; // Azzurro
  if (pph < 10) return '#00cc66';
  if (pph < 25) return '#ccff33';
  if (pph < 35) return '#ffff00';
  if (pph < 50) return '#ff9900';
  if (pph < 70) return '#ff3300';
  if (pph < 90) return '#cc0000';
  if (pph < 140) return '#660000';
  return '#000000'; // Rosso molto scuro
}

function updateBusStopsVisibility(map) {
  const zoom = map.getZoom();
  currentBusStopMarkers.forEach(m => map.removeLayer(m));
  currentBusStopMarkers = [];

  if (zoom >= MIN_ZOOM_FOR_STOPS) {
    const corseFiltrate = filterCorseData();
    const fermateAttive = new Set(corseFiltrate.map(c => c.fermata));
    const hours = getTimeIntervalHours();

    allFermateData.forEach(f => {
      if (fermateAttive.has(f._id)) {
        const corseFermata = corseFiltrate.filter(c => c.fermata === f._id);
        const passeggeri = corseFermata.reduce((s, c) => s + (c.salita || 0), 0);
        const pph = passeggeri / hours;

        const passeggeriTotali = passeggeri;
        const numeroCorse = corseFermata.length;
        const intensity = passeggeriTotali / Math.sqrt(numeroCorse);
        const radius = Math.min(16, Math.max(4, intensity));

        const marker = L.circleMarker([f.lat, f.lon], {
          radius: radius,
          fillColor: getColorByPassengersPerHour(pph),
          color: '#fff',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.85
        });

        const linee = [...new Set(corseFermata.map(c => c.linea))].sort();

        const popup = `
          <div style="font-family: Arial; min-width: 200px;">
            <h4 style="margin: 0 0 8px; font-size: 14px;">🚏 ${f.nome || 'Fermata'}</h4>
            <div style="margin: 4px 0; border-bottom: 1px solid #eee;">
              <strong>Passeggeri totali:</strong> <span style="color: #e74c3c; font-weight: bold;">${passeggeri}</span>
            </div>
            <div style="margin: 4px 0; border-bottom: 1px solid #eee;">
              <strong>Linee attive:</strong> <span style="color: #3498db;">${linee.join(', ')}</span>
            </div>
            <div style="margin: 4px 0;">
              <strong>Corse totali:</strong> <span style="color: #27ae60;">${corseFermata.length}</span>
            </div>
          </div>
        `;

        marker.bindPopup(popup);
        marker.addTo(map);
        currentBusStopMarkers.push(marker);
      }
    });
  }
}

function updateTransportInfo() {
  const corseFiltrate = filterCorseData();
  const fermateAttive = new Set(corseFiltrate.map(c => c.fermata));
  const lineeAttive = new Set(corseFiltrate.map(c => c.linea));
  const totalPasseggeri = corseFiltrate.reduce((s, c) => s + (c.salita || 0), 0);
  const lineaText = filtroLinea.value === 'all' ? 'Tutte le linee' : `Linea ${filtroLinea.value}`;
  const orarioText = (filtroOraInizio.value || filtroOraFine.value) ? `${filtroOraInizio.value || '00:00'} - ${filtroOraFine.value || '23:59'}` : 'Tutto il giorno';

  transportSummary.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 6px;">
      <div><strong>📊 Dati visualizzati:</strong></div>
      <div>• ${lineaText}</div>
      <div>• Orario: ${orarioText}</div>
      <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #dee2e6;">
        <strong>📈 Statistiche:</strong>
      </div>
      <div>• Fermate attive: <span style="color: #e74c3c; font-weight: bold;">${fermateAttive.size}</span></div>
      <div>• Linee coinvolte: <span style="color: #3498db; font-weight: bold;">${lineeAttive.size}</span></div>
      <div>• Passeggeri totali: <span style="color: #27ae60; font-weight: bold;">${totalPasseggeri}</span></div>
      <div>• Corse totali: <span style="color: #f39c12; font-weight: bold;">${corseFiltrate.length}</span></div>
    </div>
  `;
}

function clearTrasportiDisplay(map) {
  if (currentHeatLayerTrasporti && map.hasLayer(currentHeatLayerTrasporti)) {
    map.removeLayer(currentHeatLayerTrasporti);
    currentHeatLayerTrasporti = null;
  }
  currentBusStopMarkers.forEach(marker => map.removeLayer(marker));
  currentBusStopMarkers = [];
}

window.trasportiMapUtils = {
  updateTrasportiDisplay,
  clearTrasportiDisplay,
  generateHeatmapData,
  updateTransportInfo
};
