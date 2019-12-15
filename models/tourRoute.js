const mongoose = require('mongoose');

const userRef = {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'User',
};

const tourRouteSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  places: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Place' }],
    required: true,
    validate: [places => places.length > 0, 'The route must contain at least one place'],
  },
  savedBy: userRef,
  sharedWith: [userRef],
  lastFinishedAt: {
    type: Date,
  },
});

module.exports = mongoose.model('TourRoute', tourRouteSchema);
