/* eslint-disable quote-props */
const debug = require('debug')('services:places');
const Place = require('../models/place');
const Review = require('../models/review');
const categoriesService = require('./categories');

debug.enabled = !!process.env.DEBUG_ENABLED;

const createPlace = (place) => {
  const placeReviews = place.reviews ? place.reviews.map(review => new Review(review)) : [];

  const newPlace = new Place({
    categories: categoriesService.convertTypesToCategories(place.types),
    formattedPhoneNumber: place.formatted_phone_number,
    googleId: place.place_id,
    iconUrl: place.icon,
    photoReference: place.photos ? place.photos[0].photo_reference : null,
    location: {
      lat: place.geometry.location.lat,
      lng: place.geometry.location.lng,
    },
    name: place.name,
    openingHours: place.opening_hours,
    priceLevel: place.price_level,
    rating: place.rating,
    reviews: placeReviews,
    types: place.types,
    vicinity: place.vicinity,
    website: place.website,
  });

  return newPlace.save();
};

const getCategoriesOfPlaces = (places) => {
  const allCategories = new Set();
  places.forEach((place) => {
    place.categories.forEach(category => allCategories.add(category));
  });
  return Array.from(allCategories);
};

const getCategoriesOfPlacesByIds = placeIds => (
  Place.find({ _id: { $in: placeIds } }).then(getCategoriesOfPlaces)
);

const serializePlace = place => ({
  id: place._id,
  name: place.name,
  categories: place.categories.map(categoriesService.getCategoryById),
  address: place.vicinity,
  photoReference: place.photoReference,
  website: place.website,
  location: place.location,
});

const getMinMaxRatings = async () => {
  const sortedPlaces = await Place.find({ rating: { $exists: true } }).sort({ rating: 1 });
  const minRating = sortedPlaces[0].rating;
  const maxRating = sortedPlaces[sortedPlaces.length - 1].rating;

  return { minRating, maxRating };
};

const getMinMaxPopularities = async () => {
  let minPopularity;
  let maxPopularity;

  await (Place.aggregate(
    [
      {
        '$project': {
          'length': { '$size': '$reviews' },
        },
      },
      { '$sort': { 'length': 1 } },
    ],
  )).then((results) => {
    minPopularity = results[0].length;
    maxPopularity = results[results.length - 1].length;
  });

  return { minPopularity, maxPopularity };
};

module.exports = {
  createPlace,
  getCategoriesOfPlaces,
  getCategoriesOfPlacesByIds,
  serializePlace,
  getMinMaxRatings,
  getMinMaxPopularities,
};
