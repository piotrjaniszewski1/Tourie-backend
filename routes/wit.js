const debug = require('debug')('routes:wit');
const express = require('express');
const wrapAsync = require('../helpers/wrapAsync');
const WitController = require('../services/wit');

debug.enabled = !!process.env.DEBUG_ENABLED;

const router = express.Router();

router.get('/', wrapAsync(async (req, res) => {
  const wit = new WitController();
  const userMessage = req.query.message;

  try {
    const backMessage = userMessage && await wit.message(req.query.message);
    if (backMessage) res.json(backMessage);
    else res.status(404).json({ wit: 'Action not specified.' });
  } catch (err) {
    res.status(404).json({ wit: 'Action not specified.' });
  }
}));

module.exports = router;
