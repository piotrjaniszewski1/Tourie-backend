const supertest = require('supertest');

const app = require('../../app');
const enableDatabase = require('../support/enableDatabase');
const { build } = require('../support/build');
const usersService = require('../../services/users');
const placesService = require('../../services/places');
const authenticatedRequest = require('../support/authenticatedRequest');

describe('users', () => {
  const request = supertest(app);
  enableDatabase();

  describe('POST /places/favorites', () => {
    const action = (body, user) => authenticatedRequest(
      request
        .post('/places/favorites')
        .type('json')
        .send(body),
      user,
    );

    let user;
    let existingPlace;
    let newPlace;
    let fakePlaceId;

    beforeEach(async () => {
      user = await usersService.createUser(build('user'));
      existingPlace = await placesService.createPlace(build('place'));
      newPlace = await placesService.createPlace(build('place'));
      fakePlaceId = 'e05183';
      await usersService.incrementPlaceCounter(user, existingPlace.id);
    });

    describe('with correct place id', () => {
      it('returns 200', () => (
        action({ id: existingPlace.id }, user)
          .expect(200)
      ));

      it('creates entry', async () => {
        await action({ id: newPlace.id }, user);
        const updatedUser = await usersService.findById(user.id);
        expect(updatedUser.favouritePlaces.id(newPlace.id).count).toBe(1);
      });

      it('increments the counter', async () => {
        await action({ id: existingPlace.id }, user);
        const updatedUser = await usersService.findById(user.id);
        expect(updatedUser.favouritePlaces.id(existingPlace.id).count).toBe(2);
      });
    });

    describe('with incorrect place id', () => {
      it('returns 422', () => (
        action({ id: fakePlaceId }, user)
          .expect(422)
      ));

      it('doesn\'t update the user', async () => (
        action({ id: fakePlaceId }, user)
          .catch(async () => {
            const updatedUser = await usersService.findById(user.id);
            expect(updatedUser.favouritePlaces.length).toBe(user.favouritePlaces.length);
          })
      ));
    });
  });
});
