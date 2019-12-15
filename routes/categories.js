const express = require('express');
const authenticate = require('../middleware/authenticate');
const categoriesService = require('../services/categories');

const router = express.Router();
router.use(authenticate);

router.get('/', (req, res) => {
  const categories = categoriesService.listCategories();
  res.json({ categories });
});

module.exports = router;
