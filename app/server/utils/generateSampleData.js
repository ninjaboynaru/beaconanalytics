/*
TODO: Randomize the session screenSize property. Randomize the session referrer property.
*/

const randomUserAgent = require('random-useragent');
const database = require('../database');
const sessionModel = require('../models/session.js');

const utils = {
	randomLang: function randomLangHeader() {
		const possibleLangs = ['en', 'de', 'fr', 'es'];
		return possibleLangs[utils.randomIntInclusive(0, possibleLangs.length-1) ];

	},
	randomIntInclusive: function randomInt(min, max) {
		min = Math.ceil(min);
		max = Math.floor(max);
		return Math.floor(Math.random() * (max - min + 1)) + min;
	},
	randomStartEndTimes: function randomStartEndTimes(minDuration=10000, maxDuration=180000) {
		const startDataVary = 2; // Start date will be + or - between 0 and 2 days from now.
		const startDate = new Date();
		const minStartDate = startDate.getDate() - startDataVary;
		const maxStartDate = startDate.getDate() + startDataVary;
		startDate.setDate(utils.randomIntInclusive(minStartDate, maxStartDate) );

		const startTime = startDate.getTime();
		const endTime = startTime + utils.randomIntInclusive(minDuration, maxDuration);
		const duration = endTime - startTime;

		return {startTime:startTime, endTime:endTime, duration:duration};
	},
	randomClickData: function randomClickData(minClicks=0, maxClicks=3) {
		const projectCategory = {name:'Projects', clickItems:['Proj 1', 'Proj 2', 'Proj 3', 'Proj 4', 'Proj 5']};
		const linkCategory = {name:'Links', clickItems:['Link 1', 'Link 2', 'Link 3', 'Link 4']};
		const demoCategory = {name:'Demos', clickItems:['Demo 1', 'Demo 2', 'Demo 3', 'Demo 4']};
		const anchorCategory = {name:'Anchor', clickItems:['Anch 1', 'Anch 2', 'Anch 3', 'Anch 4']};

		const clickOptions = [projectCategory, linkCategory, demoCategory, anchorCategory];

		const clickData = [];
		const clicksToGenerate = utils.randomIntInclusive(minClicks, maxClicks);
		for(let i = 0; i < clicksToGenerate; i++) {
			const chosenCategory = clickOptions[utils.randomIntInclusive(0, clickOptions.length-1) ];
			const chosenClickItem = chosenCategory.clickItems[utils.randomIntInclusive(0, chosenCategory.clickItems.length-1) ];

			clickData.push({itemId:chosenClickItem, itemCategory:chosenCategory.name});
		}


		return clickData;
	}
}

const logger = {
	enabled: false,
	log: function log(...args){
		if(logger.enabled === true) {
			return console.log(...args);
		}
		else {
			return;
		}
	}
}


function generateSampleData(sampleCount, callback, logging=false, disconnectWhenDone=true) {

	if(callback == null) {
		// easier than checking if callback is null everytime its used
		callback = function(){};
	}
	logger.enabled = logging;

	database.connect().then(function(){
		logger.log('Generating sample data');
		const sessionDocs = [];

		for(let i = 0; i < sampleCount; i++) {
			const session = new sessionModel();
			session.start(randomUserAgent.getRandom(), utils.randomLang(), '::1');
			session.screenSize = {width:1920, height:1080};
			session.end();

			const randomStartEndTime = utils.randomStartEndTimes();
			session.sessionStartTime = randomStartEndTime.startTime;
			session.sessionEndTime = randomStartEndTime.endTime;
			session.duration = randomStartEndTime.duration;


			const randomClickData = utils.randomClickData(0, 5);
			randomClickData.forEach(function(clickData){
				session.addClick(clickData.itemId, clickData.itemCategory);
			});

			const breakCount = utils.randomIntInclusive(0, 3);
			for(let b = 0; b < breakCount; b++) {
				session.breaks.push({
					// break start and end time don't matter. For sample purposes, only the break duration matters
					breakStartTime:Date.now(),
					breakEndTime:Date.now(),
					duration: utils.randomIntInclusive(500, 120000),
					clickBeforeBreak: -1
				});
			}

			session._sample = true;
			sessionDocs.push(session);
		}

		sessionModel.insertMany(sessionDocs, function(error){
			if(disconnectWhenDone === true) {
				database.disconnect();
			}
			
			if(error) {
				console.error('Bulk save error: ', error);
				callback(error, null);
			}
			else {
				logger.log(`Succesfully bulk saved ${sampleCount} sample sessions`);
				callback(null, sessionDocs);
			}
		});
	}, function(databaseConnectionError) {
		logger.log('Error connecting to mongodb. Unable to generate sample data');
		callback(databaseConnectionError, null);
	});

}

module.exports = generateSampleData;
