const mongoose = require('mongoose');
const Review = require('./review');
const categoriesService = require('../services/categories');

const placeSchema = new mongoose.Schema({
  categories: {
    type: [{
      type: String,
      enum: categoriesService.listCategoryIds(),
    }],
  },
  formattedPhoneNumber: {
    type: String,
  },
  googleId: {
    type: String,
    required: true,
    unique: true,
  },
  iconUrl: {
    type: String,
  },
  location: {
    lat: {
      type: Number,
      required: true,
      min: -90,
      max: 90,
    },
    lng: {
      type: Number,
      required: true,
      min: -180,
      max: 180,
    },
  },
  name: {
    type: String,
    required: true,
  },
  openingHours: {
    periods: [{
      open: {
        day: {
          type: Number, // from 0–6, corresponding to the days of the week, starting on Sunday
        },
        time: {
          type: Number, // a time of day in 24-hour hhmm format, 0000–2359 (in its time zone)
        },
      },
      close: {
        day: {
          type: Number, // from 0–6, corresponding to the days of the week, starting on Sunday
        },
        time: {
          type: Number, // a time of day in 24-hour hhmm format, 0000–2359 (in its time zone)
        },
      },
    }],
  },
  photoReference: {
    type: String,
  },
  priceLevel: {
    type: String,
    enum: ['1', '2', '3', '4'],
  },
  rating: {
    type: Number,
    min: [1.0, 'Google places API rating ranges from 1.0 to 5.0'],
    max: [5.0, 'Google places API rating ranges from 1.0 to 5.0'],
  },
  reviews: {
    type: [Review.schema],
  },
  types: {
    type: [String],
    required: true,
  },
  vicinity: {
    type: String,
    required: true,
  },
  website: {
    type: String,
  },
});

module.exports = mongoose.model('Place', placeSchema);
