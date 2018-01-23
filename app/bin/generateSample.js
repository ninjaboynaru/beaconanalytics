/**
* @Description
* Script to generate sample/dummy session documents in the database.
*
* TODO: Randomize the session screenSize property. Randomize the session referrer property.
*/

const generateSampleData = require('../server/utils/generateSampleData.js');
let sampleCount = process.argv[2];
console.log('-----');
if(!sampleCount || Number.isNaN(Number(sampleCount)) ) {
	console.error('ERROR: First cmd line arg is missing or not a number. It must be the ammount of sample sessions to generate');
}
else {
	sampleCount = Number(sampleCount);
	generateSampleData(sampleCount, null, true);
}
