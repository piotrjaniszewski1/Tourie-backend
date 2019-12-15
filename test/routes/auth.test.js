const supertest = require('supertest');

const app = require('../../app');
const enableDatabase = require('../support/enableDatabase');
const { build } = require('../support/build');
const usersService = require('../../services/users');

describe('auth', () => {
  const request = supertest(app);
  enableDatabase();

  describe('POST /auth/login', () => {
    let user;
    let password;

    beforeEach(async () => {
      const newUser = build('user');
      password = newUser.password;
      user = await usersService.createUser(newUser);
    });

    describe('with correct credentials', () => {
      const action = () => request
        .post('/auth/login')
        .type('json')
        .send({ email: user.email, password });

      it('succeeds', () => action()
        .expect(200)
        .expect((response) => {
          const { userName } = response.body;
          expect(userName).toEqual(user.name);
        }));
    });

    describe('with wrong credentials', () => {
      const action = () => request
        .post('/auth/login')
        .type('json')
        .send({ email: user.email, password: `${password}!` });

      it('fails', () => action()
        .expect(401, { message: 'wrong credentials' }));
    });

    describe('with a NoSQL injection attempt', () => {
      const action = () => request
        .post('/auth/login')
        .type('json')
        .send({ email: { $ne: '' }, password });

      it('fails', () => action()
        .expect(400));
    });
  });
});
