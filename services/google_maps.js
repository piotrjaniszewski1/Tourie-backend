/* eslint-disable no-await-in-loop */
const googleMaps = require('@google/maps');
const debug = require('debug')('services:googleMaps');
const mSleep = require('../helpers/mSleep');

const GOOGLE_API_SLEEP_TIMEOUT = 600;
const GOOGLE_DETAILS_FIELDS = ['price_level', 'rating', 'formatted_phone_number', 'review', 'website'];

class GoogleMaps {
  constructor() {
    this.client = googleMaps.createClient({
      key: process.env.GOOGLE_MAPS_API_KEY,
      Promise,
    });
  }

  findPlaces(location, radius) {
    debug('location, radius: ', location, radius);
    return new Promise(async (resolve, reject) => {
      let pageNum = 0;
      const places = [];
      let nextPageToken = null;
      do {
        const query = nextPageToken
          ? { pagetoken: nextPageToken }
          : { location, radius };

        try {
          const res = await this.client.placesNearby(query).asPromise();
          nextPageToken = res.json.next_page_token;
          const newPlaces = res.json.results;
          for (let i = 0; i < newPlaces.length; i++) {
            const detailsQuery = { placeid: newPlaces[i].place_id, fields: GOOGLE_DETAILS_FIELDS };
            const placeDetails = await this.client.place(detailsQuery, (err) => {
              debug(err);
            }).asPromise();
            places.push({ ...newPlaces[i], ...placeDetails.json.result });
          }
        } catch (err) {
          reject(err);
        }

        // Wait for Google to create the next places array.
        await mSleep(GOOGLE_API_SLEEP_TIMEOUT);

        pageNum++;
      } while (pageNum < 2 && nextPageToken);

      debug('Finished building up the places[60] array.');
      resolve(places);
    });
  }
}


module.exports = GoogleMaps;
