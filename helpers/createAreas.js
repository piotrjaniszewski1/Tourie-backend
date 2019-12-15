const metersToLat = distance => distance / 111111.1;

const metersToLng = (distance, latitude) => (
  distance / (111111.1 * Math.cos(latitude))
);

const getAreaRadius = (cityRadius, itemsInRow) => (
  cityRadius * Math.sqrt(2) / (2 * itemsInRow)
);

const zoneCenter = (origin, latOffset, lngOffset) => ({
  lat: origin.lat - metersToLat(latOffset),
  lng: origin.lng + metersToLng(lngOffset, origin.lat),
});

const subdivideArea = (cityCenterLocation, rows, cols, cityRadius) => {
  const subareas = [];

  // Start with north-west position on the map
  const origin = {
    lat: cityCenterLocation.lat + metersToLat(cityRadius),
    lng: cityCenterLocation.lng - metersToLng(cityRadius, cityCenterLocation.lat),
  };

  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      const latOffset = cityRadius * i / (cols / 2);
      const lngOffset = cityRadius * j / (rows / 2);
      subareas.push({
        location: zoneCenter(origin, latOffset, lngOffset),
        radius: getAreaRadius(cityRadius, rows),
      });
    }
  }

  return subareas;
};

module.exports.createAreas = subdivideArea;
