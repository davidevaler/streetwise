//Setta la mappa
const map = L.map('leaflet-map', {
    center: [46.065, 11.12],        //Pos Trento
    zoom: 14,                       //Zoom iniziale, si vede tutta la città
    maxBounds: [                    //non fa allontanare dal centro
        [45.96, 11.00], 
        [46.16, 11.24]  
    ],
    maxBoundsViscosity: 0.7         //fa effetto elastico sugli angoli
}) //pos Trento

map.setMinZoom(13);
map.setMaxZoom(18);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

loadAllMapData(map);
