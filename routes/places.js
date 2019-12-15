const express = require('express');
const authenticate = require('../middleware/authenticate');
const usersService = require('../services/users');
const wrapAsync = require('../helpers/wrapAsync');

const router = express.Router();

router.post('/favorites', authenticate, wrapAsync(async (req, res) => {
  const { id } = req.body;

  await usersService.incrementPlaceCounter(req.user, id);
  res.status(200).end();
}));

module.exports = router;
