const express = require('express');
const parseTimeRange = require('../middleware/parseTimeRange.js');
const parseCountQuery = require('../middleware/parseCountQuery.js');


/**
* @Route
* Return a controller that, responds with statistics on a certain part of the analytics
* data, such as browser, os, or client statistics.
*
* Accepts ?count, ?statType, ?to, and ?from, query parameters.
*
* ?statType should be "click" or a string acceptable to the session models' getAnalyticsStats function.
*
* Requires the session model to be injected as the first argument.
*/
const dataStatsController = function(sessionModelRef){

	return function dataStats(request, response){
		const statType = request.query.statType;
		let analyticMethodToCall;

		if(statType == 'click') {
			analyticMethodToCall = sessionModelRef.getAnalyticsClickStats.bind(sessionModelRef, request.dateRange, request.count);
		}
		else if(statType == 'all') {
			analyticMethodToCall = sessionModelRef.getAllAnalyticsStats.bind(sessionModelRef, request.dateRange, request.count);
		}
		else {
			analyticMethodToCall = sessionModelRef.getAnalyticsStats.bind(sessionModelRef, request.dateRange, request.count, statType);
		}

		analyticMethodToCall(function(error, result){
			if(error) {
				response.status(500).end();
			}
			else {
				response.status(200).json(result);
			}
		});
	}
}


module.exports = dataStatsController;
