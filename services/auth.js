const jwt = require('jsonwebtoken');
const usersService = require('../services/users');

module.exports.generateToken = (user) => {
  const payload = { sub: user.id };
  const secret = process.env.SECRET;
  return jwt.sign(payload, secret);
};

module.exports.getUserFromToken = (token) => {
  const secret = process.env.SECRET;
  return new Promise((resolve, reject) => {
    jwt.verify(token, secret, (err, payload) => (err ? reject(err) : resolve(payload)));
  }).then(payload => usersService.findById(payload.sub));
};
