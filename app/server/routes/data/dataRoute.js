const express = require('express');
const sessionModel = require('../../models/session.js');

const dataAuthController = require('./controllers/dataAuth.js');
const dataOverviewController = require('./controllers/dataOverview.js')(sessionModel);
const dateStatisticsController = require('./controllers/dataStatistics.js')(sessionModel);

const timeRangeMiddleware = require('./middleware/parseTimeRange.js');
const countQueryMiddleware = require('./middleware/parseCountQuery.js');

const mainRouter = express.Router();
const dataRouter = express.Router();


/**
* @route
* API route for getting data from the database
*/
dataRouter.use('', [countQueryMiddleware, timeRangeMiddleware]);
dataRouter.get('/overview', dataOverviewController);
dataRouter.get('/stats', dateStatisticsController);

mainRouter.use('/data/:key', [dataAuthController, dataRouter]);


module.exports = mainRouter;
