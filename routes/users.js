const express = require('express');
const authenticate = require('../middleware/authenticate');
const authService = require('../services/auth');
const usersService = require('../services/users');
const wrapAsync = require('../helpers/wrapAsync');
const filterAttributes = require('../helpers/filterAttributesIfMatch');

const router = express.Router();

router.get('/me', authenticate, (req, res) => {
  const { id, name, email } = req.user;
  res.json({ id, name, email });
});

router.patch('/me', authenticate, wrapAsync(async (req, res) => {
  const {
    name: requestedName,
    email: requestedEmail,
    password: requestedPassword,
    currentPassword,
  } = req.body;
  const isPasswordCorrect = await usersService
    .verifyPassword(req.user, currentPassword);

  if (!isPasswordCorrect) {
    res.status(403).json({ errors: { currentPassword: 'Current password is not correct.' } });
    return;
  }

  const {
    name: newName, email: newEmail,
  } = await usersService.updateUser(req.user, filterAttributes({
    name: requestedName,
    email: requestedEmail,
    password: requestedPassword,
  }));

  res.status(200).json({
    name: newName, email: newEmail,
  });
}));

router.delete('/me', authenticate, wrapAsync(async (req, res) => {
  await usersService.deleteUser(req.user);
  res.status(200).end();
}));

router.post('/', wrapAsync(async (req, res) => {
  const user = await usersService.createUser(req.body);
  const token = authService.generateToken(user);
  res.status(201).json({ token, userName: user.name, userEmail: user.email });
}));

module.exports = router;
