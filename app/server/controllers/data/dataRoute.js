const express = require('express');
const sessionModel = require('../../models/session.js');

const dataAuthHandler = require('./dataAuth.js');
const dataOverviewRoute = require('./dataOverview.js')(sessionModel);
const dateStatisticsRoute = require('./dataStatistics.js')(sessionModel);

const dataRoute = express.Router();


/**
* @route
* Retrieve session data from the database
*/
dataRoute.use('/data/:key', [dataAuthHandler, dataOverviewRoute, dateStatisticsRoute]);

module.exports = dataRoute;
