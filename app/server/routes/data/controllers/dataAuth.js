const express = require('express');
const verifyCredentials = require('../../../services/verifyCredentials.js');

/**
* @Route
* Ensure the provided key exists and comes from the correct host.
* Should be run on a path with a "/:key" url param.
*/
function dataAuthHandler(request, response, next){
	const hostName = request.get('host');
	const key = request.params.key;
	const matchingCredentials = verifyCredentials(hostName, key);

	if(matchingCredentials == null) {
		response.status(403).end();
	}
	else {
		next();
	}

};

module.exports = dataAuthHandler;
