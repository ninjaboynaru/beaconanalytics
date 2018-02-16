
function isValidTimestamp(possibleTimestamp) {
	if(!possibleTimestamp) {
		return false;
	}
	else {
		return new Date(possibleTimestamp).getTime() > 0
	}
}

/**
* @middleware
* Append a dateRange object to the request object given "from" and "to" query parameters on the request object.
* "form" and "to" query parameters should be valid javascript timestams (in miliseconds)
* The dateRange object will have "from" and "to" properties that are Date objects.
*
* If "from" and "to" are missing or invalid, a default dateRange is used
* DEFAULT: from = 1 month ago, to = 2 days in the future.
*
* RESULT
* request.dateRange = {from:Date, to:Date};
*
*/
function parseTimeRange(request, response, next) {
	const dateRange = {from:null, to:null};

	const fromQuery = request.query.from;
	const toQuery = request.query.to;

	if(isValidTimestamp(fromQuery) && isValidTimestamp(toQuery) ) {
		dateRange.from = new Date(fromQuery);
		dateRange.to = new Date(toQuery);
	}
	else {
		/*  DEFAULTS
		* from - date is 1 month ago
		* to - 2 date is 2 days in the future
		*/
		const fromDate = new Date();
		const toDate = new Date();
		fromDate.setMonth(fromDate.getMonth() - 1);
		toDate.setDate(toDate.getDate() + 2)

		dateRange.from = fromDate;
		dateRange.to = toDate;

	}

	request.dateRange = dateRange;
	next();
}

module.exports = parseTimeRange;
