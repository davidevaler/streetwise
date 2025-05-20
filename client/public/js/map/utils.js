window.utils = {
  //fetchData
  fetchData: async function(endpoint) {
    try {
      const response = await fetch(`http://localhost:5000/api/${endpoint}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch /api/${endpoint}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
        console.log(`Error fetching ${endpoint}:`, error);
        return null;
    }
  },

  utm32N : '+proj=utm +zone=32 +datum=WGS84 +units=m +no_defs',

  projectCoordUTM: function(map, _x, _y) {
    const x = parseFloat(_x);
    const y = parseFloat(_y);

    const [lon, lat] = proj4(this.utm32N, proj4.WGS84, [x,y]);
    const point = map.latLngToContainerPoint([lat, lon]);

    return [point.x, point.y];
  },

  resizeCanvas: function(map, canvas) {
    const rect = map.getContainer().getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
  }

}