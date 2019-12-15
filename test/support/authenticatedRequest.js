const authService = require('../../services/auth');

const authenticatedRequest = (request, user) => {
  const token = authService.generateToken(user);
  return request.set('Authorization', `Bearer ${token}`);
};

module.exports = authenticatedRequest;
