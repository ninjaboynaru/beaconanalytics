const express = require('express');
const parseTimeRange = require('../middleware/parseTimeRange.js');

/**
* @Route
* Return a controller that responds with general overview of the analytics data.
* Accepts ?to and ?from query parameters.
*
* Requires the session model to be injected as the first argument.
*/
const dataOverviewController = function(sessionModelRef){
	
	return function dataOverview(request, response) {
		sessionModelRef.getAnalyticsOverview(request.dateRange, function(error, result){
			if(error) {
				response.status(500).end();
			}
			else {
				response.status(200).json(result);
			}
		});
	}
};


module.exports = dataOverviewController;
