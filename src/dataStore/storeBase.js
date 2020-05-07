/* Store is where we fetch
   data form other Service
*/
const request = require('request');
const config = require('../utils/config');

/* get all data and send it to the reducer */
function fetchData() {
    let fetchPromise = new Promise((reslove, reject) => {
        request(config.API_URL,
            { json: true }, (err, res, body) => {
                if (err) {
                    reject(err);
                }
                else {
                    reslove(body);
                }
            });
    });
    return fetchPromise;
}

module.exports = fetchData;