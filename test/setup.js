require('dotenv').config();
const crypto = require('crypto');

if (!process.env.SECRET) {
  process.env.SECRET = crypto.randomBytes(32).toString('hex');
}
