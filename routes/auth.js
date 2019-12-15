const express = require('express');
const { celebrate, Joi } = require('celebrate');
const wrapAsync = require('../helpers/wrapAsync');
const usersService = require('../services/users');
const authService = require('../services/auth');

const router = express.Router();

router.post('/login', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required(),
    password: Joi.string().required(),
  }),
}), wrapAsync(async (req, res) => {
  const user = await usersService.attemptLogin(req.body);
  if (user) {
    const token = authService.generateToken(user);
    res.json({ token, userName: user.name, userEmail: user.email });
  } else {
    res.status(401).json({ message: 'wrong credentials' });
  }
}));

module.exports = router;
