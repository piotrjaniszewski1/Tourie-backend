const bcrypt = require('bcrypt');

const User = require('../../models/user');
const enableDatabase = require('../support/enableDatabase');
const { build } = require('../support/build');

describe('user', () => {
  beforeEach(() => {
    const newUser = build('user');
    this.password = newUser.password;
    this.user = new User(newUser);
  });

  it('is valid with correct attributes', () => this.user.validate());

  describe('name', () => {
    it('is required', () => {
      this.user.name = undefined;
      return expect(this.user.validate()).rejects
        .toHaveProperty('errors.name.kind', 'required');
    });
  });

  describe('email', () => {
    it('is required', () => {
      this.user.email = undefined;
      return expect(this.user.validate()).rejects
        .toHaveProperty('errors.email.kind', 'required');
    });

    it('must be a valid email', () => {
      this.user.email = 'inv4l!d @ddrEs$';
      return expect(this.user.validate()).rejects
        .toHaveProperty('errors.email.kind', 'regexp');
    });

    describe('uniqueness validation', () => {
      enableDatabase();

      it('must be unique', async () => {
        const anotherUser = build('user', { email: this.user.email });
        await new User(anotherUser).save();

        return expect(this.user.save()).rejects
          .toHaveProperty('errors.email.kind', 'unique');
      });
    });
  });

  describe('passwordDigest', () => {
    it('is hashed by bcrypt', () => {
      const passwordMatches = bcrypt.compare(this.password, this.user.passwordDigest);
      return expect(passwordMatches).resolves.toEqual(true);
    });
  });
});
