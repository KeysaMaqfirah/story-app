export function initMap(containerId) {
    if (typeof L === 'undefined') {
      console.error('Leaflet library is not loaded. Please include Leaflet in your HTML.');
      return null;
    }
    
    const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      
    });
    
    const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
      
    });
    

    const topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
      attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    });
    
    const map = L.map(containerId, {
      center: [-2.548926, 118.0148634], 
      zoom: 5,
      layers: [osmLayer]
    });
    
    const baseLayers = {
      'Street Map': osmLayer,
      'Satellite': satelliteLayer,
      'Topographic': topo  
    };
    
    
    L.control.layers(baseLayers).addTo(map);
    
    return map;
  }