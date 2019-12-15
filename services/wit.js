const { Wit, log, interactive } = require('node-wit');
const debug = require('debug')('services:wit');

debug.enabled = !!process.env.DEBUG_ENABLED;

const supportedActions = new Set([
  'home_screen',
  'routes_screen',
  'tour_screen',
  'generate_route',
  'settings_screen',
  'next_place',
  'previous_place',
  'logout',
]);

class WitController {
  constructor() {
    this.client = new Wit({
      accessToken: process.env.WIT_ACCESS_TOKEN,
      logger: new log.Logger(log.DEBUG),
    });
  }

  message(text) {
    return new Promise((resolve, reject) => {
      const backMessage = {};
      this.client.message(text, {})
        .then((data) => {
          Object.entries(data.entities)
            .forEach(([entity, values]) => {
              if (entity === 'intent') {
                const action = values[0].value;
                if (supportedActions.has(action)) {
                  Object.assign(backMessage, { intent: action });
                }
              }
            });
          resolve(backMessage);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  interactive() {
    interactive(this.client);
  }
}

module.exports = WitController;
