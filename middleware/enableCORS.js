const cors = require('cors');

const enableCORS = cors({
  origin: process.env.ORIGIN || '*',
});

module.exports = enableCORS;
