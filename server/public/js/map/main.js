//Setta la mappa
async function loadCitta(map, nomeCitta) {
  try{
    fetchDataField('citta', 'nome', nomeCitta).then(citta => {
        if (!citta) {
            showToast("La città non è presente nei DataBase di StreetWise", tipo='warning', lifeSpan= 3000);
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
  } catch(err) {
    showToast(message=err, tipo='error');
  }
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
