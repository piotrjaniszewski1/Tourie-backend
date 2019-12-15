const Aspect = require('../models/aspect');

module.exports.createAspect = (aspect) => {
  const newAspect = new Aspect({
    rating: aspect.rating,
    type: aspect.type,
  });
  return newAspect.save();
};

module.exports.parseGoogleResult = aspects => (
  aspects.map(({ rating, type }) => new Aspect({ rating, type }))
);
