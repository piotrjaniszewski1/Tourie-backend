const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const uniqueValidation = require('mongoose-beautiful-unique-validation');

const emailPattern = /^[a-z0-9\u007F-\uffff!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9\u007F-\uffff!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/i;

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [emailPattern, 'invalid email'],
  },
  passwordDigest: {
    type: String,
    required: true,
  },
  selectedCategories: {
    type: Map,
    of: {
      type: Number,
      min: 0,
    },
    default: {},
  },
  favouritePlaces: {
    type: [{
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Place',
      },
      count: {
        type: Number,
        min: 0,
      },
    }],
    default: [],
  },
});
userSchema.plugin(uniqueValidation);

userSchema.virtual('password').set(function hashPassword(password) {
  this.passwordDigest = bcrypt.hashSync(password, 10);
});

module.exports = mongoose.model('User', userSchema);
