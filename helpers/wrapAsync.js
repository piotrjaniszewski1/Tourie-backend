module.exports = asyncRoute => (req, res, next) => asyncRoute(req, res, next).catch(next);
