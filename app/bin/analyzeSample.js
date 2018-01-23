
/**
* @Description
* Log the raw results of the session models' analytic functions.
*/
const database = require('../server/database.js');
const sessionModel = require('../server/models/session.js');

console.log('-----');

database.connect().then(onMongoSuccess, onMongoError);

function onMongoSuccess() {
	console.log('Sucessfully connected to mongo database at: ' + database.getUri() );
	analyzeData();
}
function onMongoError(error) {
	console.error('An error occured while connecting to mongo database at: ' + database.getUri() );
	console.error('Error object: ', error);
}


function analyzeData() {
	console.log('Calling session analytic functions');

	// start date is 1 month ago, end date is 12 days in the future (generateSaple.js may create sessions in the future)
	const startDate = new Date();
	const endDate = new Date();
	startDate.setMonth(startDate.getMonth() - 1);
	endDate.setDate(endDate.getDate() + 12);
	const dateRange = {from:startDate, to:endDate};

	const resultCount = 6;

	sessionModel.getAnalyticsOverview(dateRange, function(error, result){
		console.log('----');
		if(error) {
			console.error('Error getting analytics overview:\n', error);
		}
		else {
			console.log('Analytics overview result:\n', result);
		}
	});

	sessionModel.getAnalyticsStats(dateRange, resultCount, 'browser', function(error, result){
		console.log('----');
		if(error) {
			console.error('Error getting browser stats:\n', error);
		}
		else {
			console.log('Browser stats result:\n', result);
		}
	});

	sessionModel.getAllAnalyticsStats(dateRange, resultCount, function(error, result){
		console.log('----');
		if(error) {
			console.error('Error getting all stats:\n', error);
		}
		else {
			console.log('All stats result:\n', result);
		}
	});

	sessionModel.getAnalyticsClickStats(dateRange, resultCount, function(error, result){
		console.log('----');
		if(error) {
			console.error('Error getting click stats:\n', error);
		}
		else {
			console.log('Click stats result:\n', result);
			result.forEach(function(r){
				console.log(' Click Category: ', r.category);
				console.log('  Clicks:\n', r.clicks);
			});
		}
	});

}
