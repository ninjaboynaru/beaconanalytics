const express = require('express');
const logger = require('../services/logger.js');
const staticRoute = require('./staticRoute.js');
const dataRoute = require('./data/_dataRoute.js');


const app = express();

app.use(staticRoute);
app.use(dataRoute);
app.get('*', staticRoute.notFound404Handler);

/**
* Error handler
*/
app.use(function(error, request, response, next){
	logger.error({
		message:'Uncaught error occured in express and was caught by a "catch all" error handler',
		meta:{error:error, request:request}
	});

	if(request.accepts('html') )
	{
		staticRoute.internalError500Handler(request, response);
	}
	else
	{
		request.status(500).end();
	}
});

module.exports = app;
