//Setta la mappa
async function loadCitta(map, nomeCitta) {

    fetchDataField('citta', 'nome', nomeCitta).then(citta => {
        citta = citta[0];
        if (!citta) {
            showToast("La città non è presente nei DataBase di StreetWise", tipo='warning', lifeSpan= 3000);
            //alert("La città non è presente nei DataBase di StreetWise");
            return;
        }

        const center = convertToWGS84(citta.pos.x, citta.pos.y);
        const bounds = L.latLngBounds(
            convertToWGS84(citta.bounds.right, citta.bounds.up),
            convertToWGS84(citta.bounds.left, citta.bounds.down)
        )

        map.setView(center, parseInt(citta.zoom.min)+2);
        map.setMinZoom(parseInt(citta.zoom.min));
        map.setMaxZoom(parseInt(citta.zoom.max));
        map.setMaxBounds(bounds, maxBoundsViscosity=0.9);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        loadAllMapData(map, citta.id);
    });

};

let map;

document.addEventListener('DOMContentLoaded', function() {
  map = L.map('leaflet-map');
  const nomeCittaInput = document.getElementById('search-city');
  loadCitta(map, nomeCittaInput.value);

  nomeCittaInput.addEventListener("change", () => {
    loadCitta(map, nomeCittaInput.value)
  });
});
