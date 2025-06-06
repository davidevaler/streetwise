window.utils = {
  //fetchData
  fetchData: async function(endpoint) {
    try {
      const response = await fetch(`${SERVER_URL}/api/${endpoint}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch /api/${endpoint}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
        console.log(`Error fetching ${endpoint}:`, error);
        return null;
    }
  },

  fetchDataField: async function (endpoint, field, value) {
    try {
      const response = await fetch(`${SERVER_URL}/api/${endpoint}?${field}=${encodeURIComponent(value)}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch /api/${endpoint}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  },

  utm32N : '+proj=utm +zone=32 +datum=WGS84 +units=m +no_defs',
  gaussBoaga : '+proj=tmerc +lat_0=0 +lon_0=9 +k=0.9996 +x_0=1500000 +y_0=0 +ellps=intl +towgs84=-104.1,-49.1,-9.9,0.971,-2.917,0.714,-11.68 +units=m +no_defs',

  // Rileva automaticamente il sistema di coordinate in base alle coordinate X
  detectCoordinateSystem: function(x) {
    const coordX = parseFloat(x);
    // UTM 32N per Trento: circa 600.000-700.000
    // Gauss-Boaga Est per Trento: circa 1.600.000-1.700.000
    if (coordX > 1000000) {
      return window.utils.gaussBoaga;
    } else {
      return window.utils.utm32N;
    }
  },

  // Converte coordinate (auto-rilevamento sistema) in WGS84
  convertToWGS84: function(x, y) {
    const coordinateSystem = window.utils.detectCoordinateSystem(y);
    const coordX = parseFloat(x);
    const coordY = parseFloat(y);
    
    if (isFinite(coordX) && isFinite(coordY)) {
      const coord = proj4(coordinateSystem, proj4.WGS84, [coordX, coordY]);
      return [coord[1], coord[0]];
    }
    return null;
  },

  projectCoordUTM: function(map, _x, _y) {
    const conversion = window.utils.convertToWGS84(_x, _y);
    if (!conversion) return null;
    
    const [lat, lon] = conversion;
    const point = map.latLngToContainerPoint([lat, lon]);
    console.log(point.x);
    return [point.x, point.y];
  },

  resizeCanvas: function(map, canvas) {
    const rect = map.getContainer().getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
  }

}