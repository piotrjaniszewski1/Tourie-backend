const debug = require('debug')('routes:tourRoutes');
const express = require('express');
const wrapAsync = require('../helpers/wrapAsync');
const tourRoutesService = require('../services/tourRoutes');
const usersService = require('../services/users');
const placesService = require('../services/places');
const authenticate = require('../middleware/authenticate');

debug.enabled = !!process.env.DEBUG_ENABLED;

const router = express.Router();
router.use(authenticate);

router.get('/', wrapAsync(async (req, res) => {
  const saved = (await tourRoutesService.listRoutesSavedByUser(req.user))
    .map(tourRoutesService.serializeRoute);
  const shared = (await tourRoutesService.listRoutesSharedWithUser(req.user))
    .map(tourRoutesService.serializeSharedRoute);
  res.json({ saved, shared });
}));

router.get('/:id', wrapAsync(async (req, res) => {
  const { id } = req.params;
  const route = await tourRoutesService.findRouteForUser(id, req.user);

  if (route) {
    const routeJson = await tourRoutesService.serializeRouteWithPlaces(route);
    res.status(200).json(routeJson);
  } else {
    res.status(404).end();
  }
}));

router.post('/:id/finish', wrapAsync(async (req, res) => {
  const { id } = req.params;
  const route = await tourRoutesService.findRouteForUser(id, req.user);

  if (route) {
    await tourRoutesService.finishRoute(route);
    res.status(200).end();
  } else {
    res.status(404).end();
  }
}));

router.post('/', wrapAsync(async (req, res) => {
  const { name, places } = req.body;
  const route = await tourRoutesService.createTourRoute({ name, places, savedBy: req.user.id });
  const routeJson = await tourRoutesService.serializeRouteWithPlaces(route);

  const categories = await placesService.getCategoriesOfPlacesByIds(places);
  await usersService.incrementSelectedCategories(req.user, categories);

  res.status(201).json(routeJson);
}));

router.post('/generate', wrapAsync(async (req, res) => {
  const { categories, duration, priceLevel } = req.body;
  const places = (await tourRoutesService.generateRoute({
    categories, duration, priceLevel, user: req.user,
  })).map(placesService.serializePlace);

  const name = tourRoutesService.generateRouteName({ categories, duration, priceLevel });

  res.json({ places, name });
}));

module.exports = router;
