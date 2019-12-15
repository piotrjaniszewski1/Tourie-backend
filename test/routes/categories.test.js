const supertest = require('supertest');

const app = require('../../app');
const enableDatabase = require('../support/enableDatabase');
const { build } = require('../support/build');
const usersService = require('../../services/users');
const categoriesService = require('../../services/categories');
const authenticatedRequest = require('../support/authenticatedRequest');

describe('categories', () => {
  const request = supertest(app);
  enableDatabase();

  describe('GET /categories', () => {
    const action = () => request
      .get('/categories');

    let user;
    let categories;

    beforeEach(async () => {
      user = await usersService.createUser(build('user'));
      categories = categoriesService.listCategories();
    });

    it('returns a list of categories', () => authenticatedRequest(action(), user)
      .expect(200, { categories }));
  });
});
