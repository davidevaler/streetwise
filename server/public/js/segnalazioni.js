// Importa le utility necessarie
const { convertToWGS84, fetchDataField, detectCoordinateSystem } = window.utils;

// Variabili globali
let map;
let currentMarker = null;
let selectedCoordinates = null;

// Inizializzazione della pagina
document.addEventListener('DOMContentLoaded', function() {
    initializeMap();
    initializeForm();
});

// Inizializza la mappa
async function initializeMap() {
    map = L.map('segnala-map').setView([46.0679, 11.1211], 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    try {
        const cittaData = await fetchDataField('citta', 'nome', 'Trento');
        if (cittaData && cittaData.length > 0) {
            const citta = cittaData[0];
            const center = convertToWGS84(citta.pos.x, citta.pos.y);
            const bounds = L.latLngBounds(
                convertToWGS84(citta.bounds.left, citta.bounds.down),
                convertToWGS84(citta.bounds.right, citta.bounds.up)
            );

            map.setView(center, parseInt(citta.zoom.min) + 2);
            map.setMinZoom(parseInt(citta.zoom.min));
            map.setMaxZoom(parseInt(citta.zoom.max));
            map.setMaxBounds(bounds, { maxBoundsViscosity: 0.9 });
        }
    } catch (error) {
        console.error('Errore nel caricamento dati città:', error);
    }

    map.on('click', onMapClick);
}

function onMapClick(e) {
    const { lat, lng } = e.latlng;

    if (currentMarker) {
        map.removeLayer(currentMarker);
    }

    currentMarker = L.marker([lat, lng], {
        icon: L.icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        })
    }).addTo(map);

    const utm32N = '+proj=utm +zone=32 +datum=WGS84 +units=m +no_defs';
    const utmCoords = proj4(proj4.WGS84, utm32N, [lng, lat]);

    selectedCoordinates = {
        x: utmCoords[0],
        y: utmCoords[1],
        lat,
        lng
    };

    updateCoordinateDisplay();
    validateForm();
}

function updateCoordinateDisplay() {
    const coordStatus = document.getElementById('coord-status');
    const coordXInput = document.getElementById('coord-x');
    const coordYInput = document.getElementById('coord-y');

    if (selectedCoordinates) {
        coordStatus.textContent = `Posizione selezionata: ${selectedCoordinates.lat.toFixed(6)}, ${selectedCoordinates.lng.toFixed(6)}`;
        coordStatus.className = 'coord-selected';
        coordXInput.value = selectedCoordinates.x;
        coordYInput.value = selectedCoordinates.y;
    } else {
        coordStatus.textContent = 'Clicca sulla mappa per selezionare la posizione del problema';
        coordStatus.className = 'coord-empty';
        coordXInput.value = '';
        coordYInput.value = '';
    }
}

function initializeForm() {
    const form = document.getElementById('segnalaForm');
    const titoloInput = document.getElementById('titolo');
    const emailInput = document.getElementById('email');
    const descrizioneTextarea = document.getElementById('descrizione');
    const charCounter = document.querySelector('.char-counter');
    const resetBtn = document.getElementById('reset-btn');

    descrizioneTextarea.addEventListener('input', function () {
        const currentLength = this.value.length;
        const maxLength = this.getAttribute('maxlength');
        charCounter.textContent = `${currentLength}/${maxLength} caratteri`;

        charCounter.style.color = currentLength > maxLength * 0.9 ? '#dc3545' : '#888';
        validateForm();
    });

    [titoloInput, emailInput, descrizioneTextarea].forEach(input => {
        input.addEventListener('input', validateForm);
        input.addEventListener('blur', validateForm);
    });

    resetBtn.addEventListener('click', resetForm);
    form.addEventListener('submit', handleFormSubmit);

    validateForm();
}

function validateForm() {
    const titolo = document.getElementById('titolo').value.trim();
    const email = document.getElementById('email').value.trim();
    const descrizione = document.getElementById('descrizione').value.trim();
    const submitBtn = document.getElementById('submit-btn');

    const isValid = titolo && email && descrizione && selectedCoordinates && isValidEmail(email);
    submitBtn.disabled = !isValid;

    return isValid;
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function resetForm() {
    document.getElementById('segnalaForm').reset();

    if (currentMarker) {
        map.removeLayer(currentMarker);
        currentMarker = null;
    }

    selectedCoordinates = null;
    updateCoordinateDisplay();

    const charCounter = document.querySelector('.char-counter');
    charCounter.textContent = '0/500 caratteri';
    charCounter.style.color = '#888';

    document.getElementById('submit-btn').disabled = true;
}

async function handleFormSubmit(e) {
    e.preventDefault();

    if (!validateForm()) {
        showError('Compila tutti i campi richiesti e seleziona una posizione sulla mappa');
        return;
    }

    const submitBtn = document.getElementById('submit-btn');
    const originalText = submitBtn.textContent;

    submitBtn.disabled = true;
    submitBtn.textContent = '⏳ Invio in corso...';

    try {
        const formData = {
            titolo: document.getElementById('titolo').value.trim(),
            email: document.getElementById('email').value.trim(),
            descrizione: document.getElementById('descrizione').value.trim(),
            coord: {
                x: selectedCoordinates.x,
                y: selectedCoordinates.y
            }
        };

        const response = await fetch(`/api/segnalazioni`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (response.ok) {
            showSuccessModal();
        } else {
            throw new Error(data.error || 'Errore durante l\'invio della segnalazione');
        }

    } catch (error) {
        console.error('Errore nell\'invio della segnalazione:', error);
        showError('Errore durante l\'invio della segnalazione. Riprova più tardi.');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
}

function showError(message) {
    const toast = document.createElement('div');
    toast.className = 'error-toast';
    toast.innerHTML = `
        <div class="toast-content">
            <span class="toast-icon">❌</span>
            <span class="toast-message">${message}</span>
        </div>
    `;

    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #dc3545;
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 5000);
}

function showSuccessModal() {
    const modal = document.getElementById('success-modal');
    modal.classList.remove('hidden');
    modal.addEventListener('click', function (e) {
        if (e.target === modal) {
            modal.classList.add('hidden');
        }
    });
}
