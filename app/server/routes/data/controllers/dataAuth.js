const verifyCredentials = require('../../../services/verifyCredentials.js');

/**
* @Route
* Ensure the provided key is valid.
* Should be run on a path with a "/:key" url param.
*/
function dataAuthHandler(request, response, next){
	const key = request.params.key;

	if(verifyCredentials(key) === false) {
		response.status(403).end();
	}
	else {
		next();
	}

};

module.exports = dataAuthHandler;
