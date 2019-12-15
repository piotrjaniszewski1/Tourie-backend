const faker = require('faker');

const factories = {};

factories.user = () => ({
  name: faker.name.firstName(),
  email: faker.internet.email(),
  password: faker.internet.password(),
});

factories.place = () => ({
  formatted_phone_number: faker.phone.phoneNumber(),
  place_id: faker.random.alphaNumeric(12),
  icon: faker.image.image(64, 64),
  geometry: {
    location: {
      lat: faker.address.latitude(),
      lng: faker.address.longitude(),
    },
  },
  name: faker.company.companyName(),
  opening_hours: ['8:00 - 16:00'],
  price_level: faker.random.arrayElement(['1', '2', '3', '4']),
  rating: faker.random.number({ min: 1, max: 5 }),
  reviews: [],
  types: [faker.random.arrayElement(['museum', 'cafe', 'zoo', 'church', 'stadium'])],
  vicinity: faker.address.streetAddress(),
  website: faker.internet.url(),
});

const build = (factory, overrides = {}) => {
  const object = factories[factory]();
  return Object.assign(object, overrides);
};

const buildArray = (
  factory, size, overrides = {},
) => new Array(size).fill().map(() => build(factory, overrides));

module.exports = { build, buildArray };
