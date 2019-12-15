const Review = require('../models/review');
const Aspects = require('./aspects');

module.exports.createReview = (review) => {
  const newReview = new Review({
    aspects: Aspects.parseGoogleResult(review.aspects),
    authorName: review.author_name,
    language: review.language,
    text: review.text,
  });
  return newReview.save();
};
