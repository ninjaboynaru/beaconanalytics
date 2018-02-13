


/**
* @functions
* Return true if the provided argument is a number or is a string that represents a valid number,
* All other values, uncluding booleans, will return false.
* Empty strings (or all whitespace strings) will also return false.
*
*/
function isNumber(value) {
	if(value == null || typeof value == 'boolean') {
		return false;
	}
	else if(typeof value == 'string' && value.trim().length == 0) {
		return false;
	}
	else if(Number.isNaN(Number(value) ) ) {
		return false;
	}
	else {
		return true;
	}
}


/**
* @middleware
* Append a "count" number property to the request object given a "count" query parameter.
* If the "count" query parameter is not a number, undefined, less than 0 or greater than
* the default, it is set to the default of 20.
*
* RESULT
* request.count = number;
*/
function parseCountQuery(request, response, next) {
	const maxCount = 20;
	const countQuery = request.query.count;
	let countQueryAsNumber;

	if(isNumber(countQuery) == false) {
		countQueryAsNumber = maxCount;
	}
	else {
		countQueryAsNumber = Number(countQuery);
		if(countQueryAsNumber > maxCount || countQuery < 0) {
			countQueryAsNumber = maxCount;
		}
	}

	request.count = countQueryAsNumber;
	next();
}


module.exports = parseCountQuery;
