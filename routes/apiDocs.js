const fs = require('fs');
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const yaml = require('js-yaml');

const router = express.Router();

fs.readFile('./public/documentation.yml', 'utf-8', (err, data) => {
  if (err) {
    throw err;
  }

  const documentation = yaml.safeLoad(data);
  router.use(swaggerUi.serve);
  router.use(swaggerUi.setup(documentation));
});

module.exports = router;
