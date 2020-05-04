// const http = require('http');
// const app = require('./app');
// const config = require('./utils/config');

// const server = http.createServer(app);

// server.listen(config.PORT, () => {
//     console.log(`[*] server listenning on port ${config.PORT} ...`);
// });
// const https = require('https')
// const options = {
//     hostname: 'api.myjson.com',
//     port: 443,
//     path: '/bins/tl0bp',
//     method: 'GET'
// }

// const result = [];

// app.get('/', (req, res, next) => {

//     const request = https.request(options, r => {
        
//         result.on('data', d => {

//             result = JSON.parse(d.toString()).hotles;
//             console.log(arr);
//             res.json({status : r.statusCode});
//         })
//     })

//     request.end();
// });

// app.get('/search', (req, res, next) => {
//     res.json(result);
// })


// app.listen(3000, () => {
//     console.log("listing to port 3000");
// })

const http = require('http');
const app = require('./src/app');
const config = require('./src/utils/config');

const server = http.createServer(app);

server.listen(config.PORT, () => {
    console.log(`[*] server listenning on port ${config.PORT} ...`);
});