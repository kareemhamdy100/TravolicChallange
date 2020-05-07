require('dotenv').config();

let PORT = process.env.PORT;
let API_URL = process.env.API_URL;

module.exports = {
    PORT,
    API_URL
};