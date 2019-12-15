/* eslint-disable no-await-in-loop */
require('dotenv').config();
const debug = require('debug')('tourie:scripts');
const { createAreas } = require('../helpers/createAreas');
const GoogleMaps = require('../services/google_maps');
const connect = require('../services/mongodb');
const placesService = require('../services/places');

const CITY_RADIUS = process.env.CITY_RADIUS || 5000;
const AREA_ROW_NUM = process.env.AREA_ROW_NUM || 20;
const AREA_COL_NUM = process.env.AREA_COL_NUM || 20;
const CITY_LATITUDE = process.env.CITY_LATITUDE || 53.1235;
const CITY_LONGITUDE = process.env.CITY_LONGITUDE || 18.0084;

connect().then(() => {
  debug('Connected to MongoDB');
  const googleMaps = new GoogleMaps();

  const areas = createAreas(
    { lat: CITY_LATITUDE, lng: CITY_LONGITUDE },
    AREA_ROW_NUM,
    AREA_COL_NUM,
    CITY_RADIUS,
  );

  (async function scanAreas() {
    for (let i = 0; i < areas.length; i++) {
      await googleMaps.findPlaces(areas[i].location, areas[i].radius)
        .then((places) => {
          places.forEach(async (place) => {
            debug('Attempting to add place', place.name);
            await placesService.createPlace(place);
          });
        }).catch((err) => {
          debug(err);
        });
    }
  }());
});
