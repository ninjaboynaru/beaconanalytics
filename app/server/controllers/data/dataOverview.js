const express = require('express');
const parseTimeRange = require('./middleware/parseTimeRange.js');

/**
* @Route
* Return a general overview of the analytics data.
* Accepts ?to and ?from query parameters.
*
* Requires the session model to be injected as the first argument.
*/
const dataOverviewRoute = function(sessionModelRef){
	const router = express.Router();

	router.use(parseTimeRange);
	router.get('/overview', function(request, response){
		sessionModelRef.getAnalyticsOverview(request.dateRange, function(error, result){
			if(error) {
				response.status(500).end();
			}
			else {
				response.status(200).json(result);
			}
		});
	});

	return router;
};


module.exports = dataOverviewRoute;
