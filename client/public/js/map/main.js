//Setta la mappa
//const { fetchDataField, convertToWGS84 } = window.utils; // Dobbiamo caricare i  dati sulla città

//  Per ora default Trento
const nomeCitta = "Trento";     //ADD search bar in index.ejs

fetchDataField('citta', 'nome', nomeCitta).then(citta => {
    citta = citta[0];
    const map = L.map('leaflet-map', {
        center: convertToWGS84(citta.pos.x, citta.pos.y),   //Pos Trento,
        zoom: parseInt(citta.zoom.min)+2,                             //Zoom iniziale, si vede tutta la città
        maxBounds: [//non fa allontanare dal centro
            convertToWGS84(citta.bounds.left, citta.bounds.down),
            convertToWGS84(citta.bounds.right, citta.bounds.up)
        ],
        maxBoundsViscosity: 0.7 //fa effetto elastico sugli angoli
    }) //pos

    map.setMinZoom(parseInt(citta.zoom.min));
    map.setMaxZoom(parseInt(citta.zoom.max));

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    console.log(citta);

    loadAllMapData(map, citta.id);
});
