/* eslint-disable no-param-reassign */
const debug = require('debug')('services:tourRoutes');
const tspSolver = require('node-tspsolver');
const TourRoute = require('../models/tourRoute');
const placesService = require('./places');
const Place = require('../models/place');
const User = require('../models/user');
const getPartialUtility = require('../helpers/getPartialUtility');

debug.enabled = !!process.env.DEBUG_ENABLED;

const getMinMaxCategoryCounters = async () => {
  let minCategoryCounter;
  let maxCategoryCounter;

  await User.find()
    .then((users) => {
      minCategoryCounter = Math.min(...users.map(
        user => Math.min(...user.selectedCategories.values()),
      ));
      maxCategoryCounter = Math.max(...users.map(
        user => Math.max(...user.selectedCategories.values()),
      ));
    });

  return { minCategoryCounter, maxCategoryCounter };
};

const getPreferenceModel = async () => {
  const { minRating, maxRating } = await placesService.getMinMaxRatings();
  const { minPopularity, maxPopularity } = await placesService.getMinMaxPopularities();
  const { minCategoryCounter, maxCategoryCounter } = await getMinMaxCategoryCounters();

  const ratingSpread = maxRating - minRating;
  const popularitySpread = maxPopularity - minPopularity;
  const categoryCounterSpread = maxCategoryCounter - minCategoryCounter;

  return {
    rating: {
      weight: 0.1,
      partials: [
        {
          min: minRating,
          max: minRating + 0.5 * ratingSpread,
          slope: 0.667 / (0.5 * ratingSpread),
          offset: 0,
        },
        {
          min: minRating + 0.5 * ratingSpread,
          max: maxRating,
          slope: 0.333 / (0.5 * ratingSpread),
          offset: 0.667,
        },
      ],
    },
    popularity: { // number of reviews
      weight: 0.1,
      partials: [
        {
          min: minPopularity,
          max: minPopularity + 0.667 * popularitySpread,
          slope: 0.7 / (0.667 * popularitySpread),
          offset: 0,
        },
        {
          min: minPopularity + 0.667 * popularitySpread,
          max: maxRating,
          slope: 0.3 / (0.333 * popularitySpread),
          offset: 0.7,
        },
      ],
    },
    priceLevelDifference: {
      weight: 0.15,
      partials: [
        {
          min: 0,
          max: 3,
          slope: -1 / 3,
          offset: 1,
        },
      ],
    },
    distance: { // in meters
      weight: 0,
      partials: [
        {
          min: 0,
          max: 1000,
          slope: -1 / 1000,
          offset: 1,
        },
      ],
    },
    durationDifference: { // in minuters
      weight: 0,
      partials: [
        {
          min: 0,
          max: 30,
          slope: 1 / 30,
          offset: 1,
        },
      ],
    },
    visitedCategoriesCounter: { // increment it each time user visits a place of that type
      weight: 0.1,
      partials: [
        {
          min: minCategoryCounter,
          max: minCategoryCounter + 0.25 * categoryCounterSpread,
          slope: 0,
          offset: 0,
        },
        {
          min: minCategoryCounter + 0.25 * categoryCounterSpread,
          max: minCategoryCounter + 0.75 * categoryCounterSpread,
          slope: 0.25 / (0.5 * categoryCounterSpread),
          offset: 0,
        },
        {
          min: minCategoryCounter + 0.75 * categoryCounterSpread,
          max: maxCategoryCounter,
          slope: 0.75 / (0.25 * categoryCounterSpread),
          offset: 0.25,
        },
      ],
    },
    categoriesMatch: {
      weight: 0.55,
      partials: [
        {
          min: 0,
          max: 1,
          slope: 1,
          offset: 0,
        },
      ],
    },
  };
};

const createTourRoute = (attributes) => {
  const tourRoute = new TourRoute(attributes);
  return tourRoute.save();
};

const listRoutesSavedByUser = async user => TourRoute.find({ savedBy: user.id }).populate('places');

const deleteRoutesSavedByUser = async user => TourRoute.deleteMany({ savedBy: user.id });

const listRoutesSharedWithUser = async user => TourRoute.find({ sharedWith: user.id }).populate('savedBy').populate('places');

const findRouteForUser = (id, user) => TourRoute.findOne({ _id: id, savedBy: user.id });

const degreesToRadians = degrees => degrees * Math.PI / 180;

const determineDistance = (place1, place2) => {
  const earthRadius = 6371000;
  const dLat = degreesToRadians(place2.location.lat - place1.location.lat);
  const dLon = degreesToRadians(place2.location.lng - place1.location.lng);

  const lat1 = degreesToRadians(place1.location.lat);
  const lat2 = degreesToRadians(place2.location.lat);

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
    + Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadius * c;
};

const generateGraph = (places, userPreferenceModel) => places.map(place1 => places.map((place2) => {
  if (place1 !== place2) {
    return getPartialUtility('distance', determineDistance(place1, place2), userPreferenceModel) + place2.utility;
  }
  return 0;
}));

const convertPathToTourRoute = (path, rankedPlaces) => path.map(element => rankedPlaces[element]);

const getOtherMostPopularCategory = (categories, user) => {
  let max = 0; let maxKey = '';

  user.selectedCategories.forEach((value, key) => {
    if (max < value && !categories.includes(key)) {
      max = value;
      maxKey = key;
    }
  });

  return maxKey;
};

const updateWithMostPopularCategory = (categories, user) => {
  const otherMostPopularCategory = getOtherMostPopularCategory(categories, user);

  if (otherMostPopularCategory !== '') {
    return [...categories, otherMostPopularCategory];
  }

  return categories;
};

const jaccard = (set1, set2) => {
  const intersection = [...set1].filter(item => set2.has(item)).length;
  const union = set1.size + set2.size - intersection;
  return intersection / union;
};

const generateRoute = async ({
  categories, duration, priceLevel, user,
}) => {
  const userPreferenceModel = await getPreferenceModel();
  const selectedCategories = new Set(categories);
  const allCategories = updateWithMostPopularCategory(categories, user);

  let places = await Place.find({ categories: { $in: allCategories } });
  const favouritePlaces = await Place.find({ _id: { $in: user.favouritePlaces } });
  places = places.concat(favouritePlaces);

  places.forEach((place) => {
    place.utility = 0;
    if (place.rating) {
      place.utility += getPartialUtility('rating', place.rating, userPreferenceModel);
    }
    if (place.reviews.length) {
      const reviewsNum = place.reviews.length;
      place.utility += getPartialUtility('popularity', reviewsNum, userPreferenceModel);
    }
    if (place.priceLevel) {
      const priceLevelDifference = Math.abs(place.priceLevel - priceLevel);
      place.utility += getPartialUtility('priceLevelDifference', priceLevelDifference, userPreferenceModel);
    }
    const placeCategories = new Set(place.categories);
    const categoriesMatch = jaccard(selectedCategories, placeCategories);
    place.cmScore = getPartialUtility('categoriesMatch', categoriesMatch, userPreferenceModel);
    place.utility += place.cmScore;

    const differentCategories = place.categories
      .filter(item => !selectedCategories.has(item))
      .map(item => user.selectedCategories.get(item))
      .reduce((a, b) => a + b, 0) / place.categories.length;

    if (differentCategories > 0) {
      place.dcScore = getPartialUtility('visitedCategoriesCounter', differentCategories, userPreferenceModel);
      place.utility += place.dcScore;
    }
  });

  const rankedPlaces = places
    .sort((a, b) => b.utility - a.utility)
    .slice(0, duration * 2)
    .filter((place, i, arr) => (
      // eslint-disable-next-line no-underscore-dangle
      arr.findIndex(otherPlace => otherPlace._id === place._id) === i
    ));
  const graph = generateGraph(rankedPlaces, userPreferenceModel);

  const route = await tspSolver
    .solveTsp(graph, false, {})
    .then(result => convertPathToTourRoute(result, rankedPlaces));

  return route;
};

const generateRouteName = ({ categories }) => {
  const categoriesDescriptions = {
    culture: 'culture',
    food: 'restaurants',
    nightLife: 'night life',
    outdoorLeisure: 'parks',
    placesWorship: 'temples',
    sport: 'stadiums',
    shopping: 'shops',
  };

  const words = categories.map(category => categoriesDescriptions[category]);
  const description = [
    words.slice(0, -1).join(', '),
    words[words.length - 1],
  ].join(words.length > 1 ? ' and ' : '');
  return description.charAt(0).toUpperCase() + description.slice(1);
};

const shareRouteWithUser = (route, user) => {
  route.sharedWith.push(user.id);
  return route.save();
};

const serializeRoute = route => ({
  id: route.id,
  name: route.name,
  placesCount: route.places.length,
  photoReference: route.places[0].photoReference,
  lastFinishedAt: route.lastFinishedAt,
});

const serializeSharedRoute = route => ({
  ...serializeRoute(route),
  sharedBy: route.savedBy.name,
});

const finishRoute = (route) => {
  route.lastFinishedAt = new Date();
  return route.save();
};

const serializeRouteWithPlaces = route => route.populate('places').execPopulate().then(({ id, name, places }) => ({
  id,
  name,
  places: places.map(placesService.serializePlace),
}));

module.exports = {
  createTourRoute,
  listRoutesSavedByUser,
  deleteRoutesSavedByUser,
  listRoutesSharedWithUser,
  findRouteForUser,
  shareRouteWithUser,
  generateRoute,
  generateRouteName,
  finishRoute,
  serializeRoute,
  serializeSharedRoute,
  serializeRouteWithPlaces,
  getPreferenceModel,
};
