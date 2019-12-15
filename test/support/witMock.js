const WitAI = require('node-wit');

const MockWit = jest.fn(() => ({
  name: 'Wit',
  constructor: jest.fn(() => {}),
  message: jest.fn(query => (
    new Promise(resolve => resolve({ intent: query }))
  )),
}));

WitAI.Wit = MockWit;
