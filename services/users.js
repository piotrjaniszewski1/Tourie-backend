const bcrypt = require('bcrypt');
const User = require('../models/user');
const tourRoutesService = require('./tourRoutes');

module.exports.createUser = (attributes) => {
  const user = new User(attributes);
  return user.save();
};

module.exports.findById = id => User.findById(id).orFail(new Error(`user with id ${id} not found`));

module.exports.updateUser = async (user, newValues) => {
  Object.assign(user, newValues);
  return user.save();
};

module.exports.deleteUser = async (user) => {
  await tourRoutesService.deleteRoutesSavedByUser(user);
  return user.remove();
};

const verifyPassword = async (user, password) => (
  bcrypt.compare(password, user.passwordDigest)
);

module.exports.verifyPassword = verifyPassword;

module.exports.attemptLogin = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) {
    return false;
  }
  const result = await verifyPassword(user, password);
  if (!result) {
    return false;
  }
  return user;
};

module.exports.incrementSelectedCategories = (user, categories) => {
  categories.forEach((category) => {
    const oldValue = user.selectedCategories.get(category) || 0;
    user.selectedCategories.set(category, oldValue + 1);
  });
  return user.save();
};

module.exports.incrementPlaceCounter = (user, placeId) => {
  const place = user.favouritePlaces.id(placeId);

  if (place) {
    place.count++;
  } else {
    user.favouritePlaces.push({ _id: placeId, count: 1 });
  }

  return user.save();
};
