const supertest = require('supertest');

const app = require('../../app');
const enableDatabase = require('../support/enableDatabase');
const { build } = require('../support/build');
const usersService = require('../../services/users');
const authenticatedRequest = require('../support/authenticatedRequest');
require('../support/witMock');

describe('wit', () => {
  const request = supertest(app);
  enableDatabase();

  describe('GET /', () => {
    const action = (user, query) => authenticatedRequest(
      request.get(`/wit?message=${encodeURIComponent(query.toLowerCase())}`), user,
    );

    let user;

    beforeEach(async () => {
      const newUser = build('user');
      user = await usersService.createUser(newUser);
    });

    describe('with query message', () => {
      it('returns object with intent', () => action(user, 'czesc')
        .expect(200));
    });

    describe('with invalid query message', () => {
      it('returns 404', () => action(user, '')
        .expect(404));
    });
  });
});
