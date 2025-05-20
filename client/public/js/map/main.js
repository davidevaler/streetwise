//Setta la mappa
const map = L.map('leaflet-map').setView([46.065, 11.12], 13) //pos Trento

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

loadAllMapData(map);
