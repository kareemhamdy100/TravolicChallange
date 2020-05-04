const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const config = require('./utils/config');
const middlewares = require('./utils/middlewares');
const searchRouter = require('./routers/searchRouter');
const app = express();


app.use(cors());
app.use(bodyParser.json());
app.use(middlewares.requestLogger);

app.use('/api/search', searchRouter);

app.use(middlewares.unknownEndpoint);
app.use(middlewares.errorHandler);
module.exports = app;