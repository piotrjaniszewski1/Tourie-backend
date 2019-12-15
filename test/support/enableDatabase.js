const connect = require('../../services/mongodb');

const enableDatabase = () => {
  let db;

  beforeAll(() => connect().then((connection) => {
    db = connection;
  }));

  beforeEach(() => {
    const models = Object.values(db.models);
    return Promise.all(models.map(model => model.deleteMany()));
  });

  afterAll(async () => {
    await db.dropDatabase();
    await db.close();
  });
};

module.exports = enableDatabase;
