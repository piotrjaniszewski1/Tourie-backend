const mongoose = require('mongoose');

module.exports = () => {
  let uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tourie';
  if (process.env.JEST_WORKER_ID) {
    uri += `Test${process.env.JEST_WORKER_ID}`;
  }
  const options = {
    useNewUrlParser: true,
    useCreateIndex: true,
  };
  mongoose.Promise = Promise;
  mongoose.connect(uri, options);

  const db = mongoose.connection;
  return new Promise((resolve, reject) => {
    db.once('connected', () => resolve(db));
    db.on('error', reject);
  });
};
