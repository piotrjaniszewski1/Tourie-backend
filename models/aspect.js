const mongoose = require('mongoose');

const aspectSchema = new mongoose.Schema({
  rating: {
    type: Number,
    min: [0, 'Google places API rating ranges from 0 to 3'],
    max: [3, 'Google places API rating ranges from 0 to 3'],
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('Aspect', aspectSchema);
