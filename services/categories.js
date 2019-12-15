const categories = Object.freeze([
  { id: 'culture', name: 'Culture' },
  { id: 'food', name: 'Food' },
  { id: 'nightLife', name: 'Night life' },
  { id: 'outdoorLeisure', name: 'Outdoor leisure' },
  { id: 'placesWorship', name: 'Places of worship' },
  { id: 'shopping', name: 'Shopping' },
  { id: 'sport', name: 'Sport' },
]);

const categoriesByIds = (() => {
  const map = {};
  categories.forEach((category) => { map[category.id] = category; });
  return map;
})();

const categoriesToTypes = Object.freeze({
  culture: [
    'art_gallery',
    'movie_theater',
    'museum',
  ],
  food: [
    'bakery',
    'cafe',
    'meal_delivery',
    'meal_takeaway',
    'restaurant',
  ],
  nightLife: [
    'bar',
    'casino',
    'night_club',
  ],
  outdoorLeisure: [
    'amusement_park',
    'park',
    'zoo',
  ],
  placesWorship: [
    'church',
    'hindu_temple',
    'mosque',
    'synagogue',
  ],
  shopping: [
    'book_store',
    'clothing_store',
    'convenience_store',
    'department_store',
    'gas_station',
    'jewelry_store',
    'liquor_store',
    'pet_store',
    'shoe_store',
    'shopping_mall',
    'store',
    'supermarket',
  ],
  sport: [
    'bowling_alley',
    'stadium',
  ],
});

const typesToCategories = {
  art_gallery: 'culture',
  movie_theater: 'culture',
  museum: 'culture',
  bakery: 'food',
  cafe: 'food',
  meal_delivery: 'food',
  meal_takeaway: 'food',
  restaurant: 'food',
  bar: 'nightLife',
  casino: 'nightLife',
  night_club: 'nightLife',
  amusement_park: 'outdoorLeisure',
  park: 'outdoorLeisure',
  zoo: 'outdoorLeisure',
  church: 'placesWorship',
  hindu_temple: 'placesWorship',
  mosque: 'placesWorship',
  synagogue: 'placesWorship',
  book_store: 'shopping',
  clothing_store: 'shopping',
  convenience_store: 'shopping',
  department_store: 'shopping',
  gas_station: 'shopping',
  jewelry_store: 'shopping',
  liquor_store: 'shopping',
  pet_store: 'shopping',
  shoe_store: 'shopping',
  shopping_mall: 'shopping',
  store: 'shopping',
  supermarket: 'shopping',
  bowling_alley: 'sport',
  stadium: 'sport',
};

const listCategories = () => [
  { id: 'culture', name: 'Culture' },
  { id: 'food', name: 'Food' },
  { id: 'nightLife', name: 'Night life' },
  { id: 'outdoorLeisure', name: 'Outdoor leisure' },
  { id: 'placesWorship', name: 'Places of worship' },
  { id: 'shopping', name: 'Shopping' },
  { id: 'sport', name: 'Sport' },
];

const listCategoryIds = () => Object.keys(categoriesByIds);

const getCategoryById = id => categoriesByIds[id];

const typesToCategory = (() => {
  const ret = {};
  const keys = Object.keys(categoriesToTypes);

  keys.forEach((key) => {
    const types = categoriesToTypes[key];
    types.forEach((element) => {
      ret[element] = key;
    });
  });

  return ret;
})();

const convertTypesToCategories = (types) => {
  const placeCategories = new Set();
  types.forEach(type => placeCategories.add(typesToCategory[type]));
  return Array.from(placeCategories).filter(el => el != null);
};

const getCategoryNames = types => types.map(type => typesToCategories[type]).filter(category => typeof category === 'string');

module.exports = {
  listCategories,
  listCategoryIds,
  getCategoryById,
  categoriesToTypes,
  convertTypesToCategories, // returns id of categories
  getCategoryNames, // returns the name of categories
};
