const express = require('express');
const path = require('path');

const staticFilesPath = path.join(__dirname, '../../../../www');


const staticRoute = express.Router();
staticRoute.use(express.static(staticFilesPath) );

if(process.env.NODE_ENV != 'production')
{
	const devStaticFilesPath = path.join(__dirname, '../../www-src');
	const wholeAppFilePath = path.join(__dirname, '../..');
	staticRoute.use('/www-src', express.static(devStaticFilesPath) );
	staticRoute.use('/app', express.static(wholeAppFilePath) );
}

staticRoute.get('', function(request, response) {
	response.render('index');
});

staticRoute.notFound404Handler = function(request, response) {
	response.status(404).render('404');
}

staticRoute.internalError500Handler = function(request, response) {
	response.status(500).render('500');
}


module.exports = staticRoute;
