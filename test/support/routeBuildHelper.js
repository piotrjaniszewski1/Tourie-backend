const { buildArray } = require('./build');
const placesService = require('../../services/places');
const tourRoutesService = require('../../services/tourRoutes');

const createPlaces = length => (
  Promise.all(buildArray('place', length).map(placesService.createPlace))
);

const buildRoute = async (user, length) => {
  const places = await createPlaces(length);
  return tourRoutesService.createTourRoute({
    name: 'My route',
    places,
    savedBy: user.id,
  });
};

module.exports = { createPlaces, buildRoute };
