const supertest = require('supertest');

const app = require('../../app');
const enableDatabase = require('../support/enableDatabase');
const { build } = require('../support/build');
const { createPlaces, buildRoute } = require('../support/routeBuildHelper');
const usersService = require('../../services/users');
const tourRoutesService = require('../../services/tourRoutes');
const authenticatedRequest = require('../support/authenticatedRequest');

const assignCategories = (places, categories) => (
  Promise.all(places.map((place, i) => {
    place.categories = categories[i]; // eslint-disable-line no-param-reassign
    return place.save();
  }))
);

describe('tourRoutes', () => {
  const request = supertest(app);
  enableDatabase();

  let user1;
  let user2;
  let route1;
  let route2;
  let route3;
  let route4;
  let serializedRoute1;
  let serializedRoute2;
  let serializedRoute3;

  beforeEach(async () => {
    user1 = await usersService.createUser(build('user'));
    user2 = await usersService.createUser(build('user'));
    route1 = await buildRoute(user1, 5);
    route2 = await buildRoute(user1, 3);
    route3 = await buildRoute(user2, 8);
    route4 = await buildRoute(user2, 6);
    serializedRoute1 = await tourRoutesService.serializeRoute(route1);
    serializedRoute2 = await tourRoutesService.serializeRoute(route2);
    serializedRoute3 = await tourRoutesService.serializeSharedRoute(route3);
    await tourRoutesService.shareRouteWithUser(route3, user1);
  });

  describe('GET /routes', () => {
    const action = () => request
      .get('/routes');

    it('returns a list of routes saved by the current user', () => authenticatedRequest(action(), user1)
      .expect(200, {
        saved: [
          {
            id: serializedRoute1.id,
            name: serializedRoute1.name,
            placesCount: 5,
            photoReference: serializedRoute1.photoReference,
          },
          {
            id: serializedRoute2.id,
            name: serializedRoute2.name,
            placesCount: 3,
            photoReference: serializedRoute2.photoReference,
          },
        ],
        shared: [
          {
            id: serializedRoute3.id,
            name: serializedRoute3.name,
            placesCount: 8,
            sharedBy: user2.name,
            photoReference: serializedRoute3.photoReference,
          },
        ],
      }));
  });

  describe('GET /routes/:id', () => {
    const action = id => authenticatedRequest(
      request
        .get(`/routes/${id}`),
      user1,
    );

    describe('with a correct ID of a route saved by this user', () => {
      it('returns details of the route', () => action(route1.id)
        .expect(200)
        .then(async ({ body }) => {
          expect(body.id).toEqual(route1.id);
          expect(body.name).toEqual(route1.name);
          expect(body.places).toBeInstanceOf(Array);
        }));
    });

    describe('with a route ID belonging to a different user', () => {
      it('returns 404 not found', () => action(route4.id).expect(404));
    });

    describe('with an invalid route ID', () => {
      it('returns 404 not found', () => action('000000000000000000000000').expect(404));
    });
  });

  describe('POST /routes/:id/finish', () => {
    const action = id => authenticatedRequest(
      request
        .post(`/routes/${id}/finish`),
      user1,
    );

    describe('with a correct ID of a route saved by this user', () => {
      it('changes the date', () => action(route1.id)
        .expect(200)
        .then(async () => {
          const route = await tourRoutesService.findRouteForUser(route1.id, user1);
          expect(route.lastFinishedAt).toBeDefined();
        }));
    });

    describe('with a route ID belonging to a different user', () => {
      it('returns 404 not found', () => action(route4.id).expect(404));
    });

    describe('with an invalid route ID', () => {
      it('returns 404 not found', () => action('000000000000000000000000').expect(404));
    });
  });

  describe('POST /routes', () => {
    let user;
    let places;
    let routeName;
    let placeIds;

    beforeEach(async () => {
      user = await usersService.createUser(build('user'));
      places = (await createPlaces(10)).slice(0, 5);
      routeName = 'My route';
      assignCategories(places, [['sport'], ['sport'], ['sport'], ['outdoorLeisure'], ['outdoorLeisure']]);
      placeIds = places.map(place => place.id);
      user.selectedCategories.set('sport', 3);
      user.selectedCategories.set('culture', 5);
      await user.save();
    });

    describe('with new route name and list of place IDs', () => {
      const action = () => request
        .post('/routes')
        .type('json')
        .send({ name: routeName, places: placeIds });

      it('returns 201 created status', () => authenticatedRequest(action(), user)
        .expect(201)
        .then(({ body }) => {
          expect(body.id).toBeDefined();
          expect(body.name).toEqual(routeName);
          expect(body.places).toHaveLength(5);
        }));

      it('saves a route', async () => {
        await authenticatedRequest(action(), user);
        const routes = await tourRoutesService.listRoutesSavedByUser(user);
        expect(routes.length).toEqual(1);
      });

      it('increments the user\'s category counter', async () => {
        await authenticatedRequest(action(), user);
        const updatedUser = await usersService.findById(user.id);
        expect(updatedUser.selectedCategories.get('sport')).toBe(4);
        expect(updatedUser.selectedCategories.get('culture')).toBe(5);
        expect(updatedUser.selectedCategories.get('outdoorLeisure')).toBe(1);
      });
    });

    describe('without a route name', () => {
      const action = () => request
        .post('/routes')
        .type('json')
        .send({ places: placeIds });

      it('returns 422 unprocessable entity', () => authenticatedRequest(action(), user)
        .expect(422));
    });

    describe('without places', () => {
      const action = () => request
        .post('/routes')
        .type('json')
        .send({ name: routeName });

      it('returns 422 unprocessable entity', () => authenticatedRequest(action(), user)
        .expect(422));
    });

    describe('with invalid list of places', () => {
      const action = () => request
        .post('/routes')
        .type('json')
        .send({ name: routeName, places: ['why', 'should', 'i', 'care'] });

      it('returns 422 unprocessable entity', () => authenticatedRequest(action(), user)
        .expect(422));
    });
  });
});
