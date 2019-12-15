module.exports = (obj, ref = {}) => (
  Object.keys(obj)
    .filter(key => obj[key] !== ref[key])
    .reduce((acc, key) => ({ ...acc, [key]: obj[key] }), {})
);
