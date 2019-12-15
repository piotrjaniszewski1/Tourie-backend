const supertest = require('supertest');

const app = require('../../app');
const enableDatabase = require('../support/enableDatabase');
const { build } = require('../support/build');
const usersService = require('../../services/users');
const tourRoutesService = require('../../services/tourRoutes');
const authenticatedRequest = require('../support/authenticatedRequest');
const { buildRoute } = require('../support/routeBuildHelper');

describe('users', () => {
  const request = supertest(app);
  enableDatabase();

  describe('GET /users/me', () => {
    const action = () => request
      .get('/users/me');

    let user;

    beforeEach(async () => {
      const newUser = build('user');
      user = await usersService.createUser(newUser);
    });

    describe('with a valid access token', () => {
      it('returns current user details', () => authenticatedRequest(action(), user)
        .expect(200, {
          id: user.id,
          name: user.name,
          email: user.email,
        }));
    });

    describe('without an access token', () => {
      it('returns 401 unauthorized', () => action()
        .expect(401, { message: 'authentication token is required' }));
    });

    describe('with an invalid access token', () => {
      const invalidToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1MDdmMTkxZTgxMGMxOTcyOWRlODYwZWEiLCJpYXQiOjE1NDIzOTYyODd9.5XSXvhEfwJ1YEWhGinpmN1KqPtrK1_O2-DzWrOJ6L5Q';
      it('returns 401 unauthorized', () => action()
        .set('Authorization', `Bearer ${invalidToken}`)
        .expect(401, { message: 'invalid signature' }));
    });
  });

  describe('PATCH /users/me', () => {
    const action = body => request
      .patch('/users/me')
      .type('json')
      .send(body);

    let user;
    let requestedName;
    let duplicateEmail;
    let currentPassword;

    beforeEach(async () => {
      const newUser = build('user');
      const conflictUser = build('user');
      const { name, email } = conflictUser;
      const { password } = newUser;
      currentPassword = password;
      requestedName = name;
      duplicateEmail = email;
      user = await usersService.createUser(newUser);
      await usersService.createUser(conflictUser);
    });

    describe('with correct password tries to change a name', () => {
      it('returns current user details', () => (
        authenticatedRequest(
          action({
            name: requestedName,
            currentPassword,
          }),
          user,
        )
          .expect(200, {
            name: requestedName,
            email: user.email,
          })));
    });

    describe('with correct password tries to duplicate email', () => {
      it('returns 422', () => (
        authenticatedRequest(
          action({
            email: duplicateEmail,
            currentPassword,
          }),
          user,
        )
          .expect(422)));
    });

    describe('with incorrect password tries to change a name', () => {
      it('returns 403', () => (
        authenticatedRequest(
          action({
            name: requestedName,
            currentPassword: 'spam',
          }),
          user,
        )
          .expect(403)));
    });
  });

  describe('POST /users', () => {
    describe('with valid input', () => {
      const action = () => request
        .post('/users')
        .type('json')
        .send(build('user'));

      it('returns 200 status and a valid token', () => action().expect(201));
    });

    describe('with invalid input', () => {
      const action = () => request
        .post('/users')
        .type('json')
        .send({ name: 'Pat', email: 'idontcare' });

      it('fails', () => action().expect(422));
    });
  });

  describe('DELETE /users/me', () => {
    const action = user => authenticatedRequest(
      request.delete('/users/me'), user,
    );

    let user;

    beforeEach(async () => {
      const newUser = build('user');
      user = await usersService.createUser(newUser);
      await buildRoute(user, 5);
      await buildRoute(user, 3);
    });

    describe('existing user', () => {
      it('deletes the account', () => action(user)
        .expect(200)
        .then(async () => {
          expect(usersService.findById(user.id)).rejects.toBeInstanceOf(Error);
        }));

      it('removes user routes', () => action(user)
        .expect(200)
        .then(async () => {
          const routes = await tourRoutesService.listRoutesSavedByUser(user);
          expect(routes.length).toEqual(0);
        }));
    });
  });
});
