const mongoose = require('mongoose');
const Aspect = require('./aspect');

const reviewSchema = new mongoose.Schema({
  aspects: [Aspect.schema],
  authorName: {
    type: String,
  },
  language: {
    type: String,
  },
  text: {
    type: String,
  },
});

module.exports = mongoose.model('Review', reviewSchema);
