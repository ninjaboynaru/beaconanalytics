const express = require('express');
const path = require('path');

const staticFilesPath = path.join(__dirname, '../../../www');
const devStaticFilesPath = path.join(__dirname, '../../www-src');
const wholeAppFilePath = path.join(__dirname, '../..');


/**
* @function
* Append a "serveFile(relativePath)" function to the response object to allow sending
* files using relative paths. The paths are relative to the "rootDirectory" argument.
*
* @param {string} rootDirectory - The root path that files to be serve are relative to.
*
* RESULT
* response.serveFile = function serveFile(relativePath){...}
*/
function serveFileRelative(rootDirectory) {

	return function serveFileMiddleware(request, response, next) {
		response.serveFile = function serveFile(relativePath) {
			response.sendFile(path.join(rootDirectory, relativePath) );
		}

		next();
	}
}


/**
* Handles serving of static content
*/
const staticRoute = express.Router();
staticRoute.use(express.static(staticFilesPath) );
staticRoute.use(serveFileRelative(staticFilesPath) );

if(process.env.NODE_ENV != 'production')
{
	staticRoute.use('/www-src', express.static(devStaticFilesPath) );
	staticRoute.use('/app', express.static(wholeAppFilePath) );
}

staticRoute.get( ['/', '/index', '/index.html'], function(request, response) {
	response.serveFile('/html/index.html');
});

staticRoute.notFound404Handler = function(request, response) {
	serveFileRelative(staticFilesPath)(request, response, ()=>{} );
	response.status(404).serveFile('/html/404.html');
}

staticRoute.internalError500Handler = function(request, response) {
	serveFileRelative(staticFilesPath)(request, response, ()=>{} );
	response.status(500).serveFile('/html/500.html');
}





module.exports = staticRoute;
