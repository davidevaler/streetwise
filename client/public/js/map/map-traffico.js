// Gestione del traffico in tempo reale
let trafficLayerGroup = null;
let trafficData = null;
let trafficUpdateInterval = null;

// Colori per i diversi livelli di traffico
const trafficColors = {
    green: '#00ff00',   // Traffico scorrevole
    yellow: '#ffff00',  // Traffico moderato
    red: '#ff0000'      // Traffico intenso
};

// Inizializza il layer del traffico
function initTrafficLayer(map) {
    if (!trafficLayerGroup) {
        trafficLayerGroup = L.layerGroup();
    }
}

// Carica i dati del traffico dal server
async function loadTrafficData() {
    try {
        const response = await fetch(`${window.SERVER_URL}/api/traffico`);
        
        if (!response.ok) {
            throw new Error(`Errore HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
            trafficData = data;
            updateTrafficDisplay();
            updateTrafficInfo(data);
            console.log('Dati traffico caricati:', data); 
        } else {
            console.error('Errore nel caricamento dati traffico:', data.error);
            showTrafficError('Errore nel caricamento dei dati del traffico');
        }
    } catch (error) {
        console.error('Errore nella richiesta traffico:', error);
        showTrafficError('Impossibile caricare i dati del traffico');
    }
}

// Aggiorna la visualizzazione del traffico sulla mappa
function updateTrafficDisplay() {
    if (!trafficData || !trafficLayerGroup) return;
    
    // Pulisce i dati precedenti
    trafficLayerGroup.clearLayers();
    
    trafficData.trafficData.forEach(route => {
        // Converte le coordinate da OpenRouteService (lon, lat) a Leaflet (lat, lon)
        const latLngs = route.coordinates.map(coord => [coord[1], coord[0]]);
        
        // Crea la linea per il percorso
        const polyline = L.polyline(latLngs, {
            color: trafficColors[route.trafficLevel],
            weight: 4,
            opacity: 0.8,
            smoothFactor: 1
        });
        
        // Popup con informazioni dettagliate
        const popupContent = `
            <div class="traffic-popup">
                <h4>🚗 ${route.from} → ${route.to}</h4>
                <p><strong>Durata:</strong> ${route.duration} minuti</p>
                <p><strong>Distanza:</strong> ${route.distance} km</p>
                <p><strong>Velocità media:</strong> ${route.avgSpeed} km/h</p>
                <p><strong>Stato traffico:</strong> 
                    <span style="color: ${trafficColors[route.trafficLevel]}; font-weight: bold;">
                        ${getTrafficStatusText(route.trafficLevel)}
                    </span>
                </p>
                <small>Aggiornato: ${new Date(route.timestamp).toLocaleTimeString('it-IT')}</small>
            </div>
        `;
        
        polyline.bindPopup(popupContent);
        
        // Aggiunge al layer group
        trafficLayerGroup.addLayer(polyline);
    });
}

// Converte il livello di traffico in testo leggibile
function getTrafficStatusText(level) {
    switch (level) {
        case 'green': return 'Scorrevole';
        case 'yellow': return 'Moderato';
        case 'red': return 'Intenso';
        default: return 'Sconosciuto';
    }
}

// Aggiorna il pannello informativo del traffico
function updateTrafficInfo(data) {
    const summaryDiv = document.getElementById('traffic-summary');
    const lastUpdateDiv = document.getElementById('traffic-last-update');
    
    if (summaryDiv && data.summary) {
        summaryDiv.innerHTML = `
            <div class="traffic-summary">
                <div><span class="traffic-dot green"></span>Scorrevole: ${data.summary.greenRoutes}</div>
                <div><span class="traffic-dot yellow"></span>Moderato: ${data.summary.yellowRoutes}</div>
                <div><span class="traffic-dot red"></span>Intenso: ${data.summary.redRoutes}</div>
            </div>
        `;
    }
    
    if (lastUpdateDiv) {
        const updateTime = new Date(data.lastUpdate).toLocaleTimeString('it-IT');
        lastUpdateDiv.textContent = `Aggiornato alle ${updateTime}`;
    }
}

// Mostra errore nel pannello traffico
function showTrafficError(message) {
    const summaryDiv = document.getElementById('traffic-summary');
    if (summaryDiv) {
        summaryDiv.innerHTML = `<div style="color: red;">⚠️ ${message}</div>`;
    }
}

// Attiva/disattiva la visualizzazione del traffico
function toggleTrafficDisplay(map, show) {
    if (!trafficLayerGroup) {
        initTrafficLayer(map);
    }
    
    const trafficInfo = document.getElementById('traffic-info');
    
    if (show) {
        // Aggiunge il layer alla mappa
        map.addLayer(trafficLayerGroup);
        
        // Mostra il pannello info
        if (trafficInfo) {
            trafficInfo.style.display = 'block';
        }
        
        // Carica i dati iniziali
        loadTrafficData();
        
        // Imposta aggiornamento automatico ogni 5 minuti
        trafficUpdateInterval = setInterval(loadTrafficData, 5 * 60 * 1000);
        
        console.log('Traffico attivato - aggiornamento ogni 5 minuti');
    } else {
        // Rimuove il layer dalla mappa
        map.removeLayer(trafficLayerGroup);
        
        // Nasconde il pannello info
        if (trafficInfo) {
            trafficInfo.style.display = 'none';
        }
        
        // Ferma l'aggiornamento automatico
        if (trafficUpdateInterval) {
            clearInterval(trafficUpdateInterval);
            trafficUpdateInterval = null;
        }
        
        console.log('Traffico disattivato');
    }
}

// Event listener per la checkbox del traffico
document.addEventListener('DOMContentLoaded', function() {
    const trafficCheckbox = document.getElementById('filtroTraffico');
    
    if (trafficCheckbox) {
        trafficCheckbox.addEventListener('change', function() {
            // La mappa dovrebbe essere disponibile globalmente dal main.js
            if (typeof map !== 'undefined') {
                toggleTrafficDisplay(map, this.checked);
            } else {
                console.error('Mappa non disponibile per il controllo traffico');
            }
        });
    }
});
