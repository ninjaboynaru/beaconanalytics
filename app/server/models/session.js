const mongoose = require('mongoose');
const crypto = require('crypto');
const uaParser = require('ua-parser');
const langParser = require('accept-language-parser');


/**
* @schema
* Schema representing a users' usage session of a website.
*/
const sessionSchema = new mongoose.Schema({
	sessionStartTime: {type:Date, required:true},
	sessionEndTime: {type:Date, required:true},
	duration: {type: Number, required: true},
	ipAddress: {type: String, required: true},

	userAgent: {type: String, required: true},
	browser: {type: String, required: true},
	os: {type: String, required: true},
	device: {type: String, required: true},
	lang: {type: String, required: true},
	referrer: {type: String},
	screenSize: {width: {type: Number, required: true}, height: {type: Number, required: true}},

	/**
	* @property {string}
	* Unique hash to identify the user session.
	*/
	hash: {type: String, required: true},

	clicks:[{
		itemId: {type: String, required: true},
		itemCategory: {type: String, required:true},
		clickTime: {type:Date, required:true}
	}],

	breaks: [{
		breakStartTime: {type:Date, required:true},
		breakEndTime: {type:Date, required:true},
		duration: {type:Number, required:true},
		clickBeforeBreak: {type:Number, required:true}
	}],

	// set to true when session was artificaly created for testing purposes/as a sample session
	_sample: {type:Boolean}
});

/**
* @function
* Initialize the users' session and the sessions hash.
*
* @param {string} userAgentHeader
* @param {string} langHeader
* @param {string} ipAddress
*/
sessionSchema.methods.start = function(userAgentHeader, langHeader, ipAddress)
{
	const lang = langParser.parse(langHeader)[0].code;
	const agent = uaParser.parse(userAgentHeader);

	this.userAgent = userAgentHeader;
	this.lang = lang;
	this.ipAddress = ipAddress;

	this.browser = agent.ua.family;
	this.os = agent.os.family;
	this.device = agent.device.family;

	this.referrer = '';
	this.sessionStartTime = Date.now();

	const hashSource = ipAddress + lang + userAgentHeader;
	this.hash = crypto.createHash('sha1').update(hashSource).digest('hex');
}

/**
* @function
* End the user session.
*/
sessionSchema.methods.end = function()
{
	this.sessionEndTime = Date.now();
	this.duration = this.sessionEndTime - this.sessionStartTime;
}

/**
* @function
* Resume a user session that has ended.
*
* If the session has not ended, nothing will happen. To determine if a session has ended, the sessionEndTime
* field is checked. If it is defined, the session is assumed to have been ended.
*/
sessionSchema.methods.resume = function()
{
	if(this.sessionEndTime)
	{
		this.breaks.push({
			breakStartTime: this.sessionEndTime,
			breakEndTime: Date.now(),
			duration: Date.now() - this.sessionEndTime,
			clickBeforeBreak: this.clicks.length - 1 || -1
		});

		this.sessionEndTime = undefined;
	}
}

/**
* @function
* Add a user click to the session data.
* @param {string} itemId
* @param {string | null} itemCategory - May be null
*/
sessionSchema.methods.addClick = function(itemId, itemCategory)
{
	if(!itemCategory)
	{
		itemCategory = 'none';
	}

	this.clicks.push({
		itemId: itemId,
		itemCategory: itemCategory.trim(),
		clickTime: Date.now()
	})
}

/**
* Date Range object
* @typedef DateRange
* @property {Date} from - Date object representing the start date.
* @property {Date} to - Date object representing the end date.
*/

/*
* NOTE!
* Use the analyzeSample.js script to see how the responses from the below analytics functions are structured.
*/

/**
* @function
* Return a general analytics overview of the sessions data.
*
* @param {DateRange} dateRange - Return statistics from within this time range.
* @param {function} callback - Callback function invoked with an error and result arguments (error first).
*/
sessionSchema.statics.getAnalyticsOverview = function(dateRange, callback) {
	this.aggregate([
		{ $match:{sessionStartTime:{$gte:dateRange.from, $lte:dateRange.to}} },
		{ $group:{
			_id:null,
			count:{$sum:1},
			avgSessionDuration:{$avg:'$duration'},
			breaks: {$push:'$breaks'}

		}},
		{ $unwind:{path:'$breaks', preserveNullAndEmptyArrays:true} },
		{ $unwind:{path:'$breaks', preserveNullAndEmptyArrays:true} },
		{ $group:{
			_id:null,
			avgBreakDuration:{$avg:'$breaks.duration'},
			avgSessionDuration:{$first:'$avgSessionDuration'},
			count:{$first:'$count'}
		}},
		{ $project:{
			_id:0,
			total:'$count',
			avgSessionDuration:{$divide:['$avgSessionDuration', 1000]},
			avgBreakDuration:{$divide:['$avgBreakDuration', 1000]}
		}}
	]).exec(onAggregateFinish);

	function onAggregateFinish(error, result){
		if(Array.isArray(result) ) {
			result = result[0];
		}
		callback(error, result);
	}
}

function buildStatsPipeline(dateRange, statType, totalSessions) {
	return [
		{ $match:{
			sessionStartTime:{$gte:dateRange.from, $lte:dateRange.to}
		}},
		{ $group:{
			_id:statType,
			count:{$sum:1}
		}},
		{ $project:{
			_id:0,
			name:'$_id',
			percent:{$multiply:['$count', 100/totalSessions]},
			total:'$count'
		}},
		{ $sort:{total:-1} }
	]
}

/**
* @function
* Returns a shallow copy of an array trimed down to a certain size.
* If the argument is not an array then the argument is returned.
*/
function trimArray(arr, size){
	if(Array.isArray(arr)) {
		return arr.slice(0, size);
	}
	return arr;
}

/**
* @function
* Return statistics for a certain aspect of the session such as browser, os, or device statistics.
*
* @param {DateRange} dateRange - Return statistics from within this time range
* @param {string} statType - The type of statistics to return. Example: "os" or "browser".
* @param {function} callback - Callback function invoked with an error and result arguments.
*/
sessionSchema.statics.getAnalyticsStats = function(dateRange, resultSize, statType, callback) {
	const statTypeMaping = {
		'browser': '$browser',
		'os': '$os',
		'device': '$device',
		'referrer': '$referrer'
	}
	const stat = statTypeMaping[statType];
	if(stat == null) {
		callback(null, []);
		return;
	}

	// assign "this" to var so it can be used in callback of Session.count(...)
	const Session = this;

	Session.count({sessionStartTime:{$gte:dateRange.from, $lte:dateRange.to}})
	.then(
		function(totalSessions){
			Session.aggregate(buildStatsPipeline(dateRange, stat, totalSessions), function(error, result) {
				callback(null, result.slice(0, resultSize) )
			});
		},
		function(countError){
			callback(countError);
		}
	)
	.catch(function(fatalError){
		callback(fatalError);
	});
}

sessionSchema.statics.getAllAnalyticsStats = function(dateRange, resultSize, callback) {
	const Session = this;

	Session.count({sessionStartTime:{$gte:dateRange.from, $lte:dateRange.to}})
	.then(
		function(totalSessions){
			const pipelines = {
				"browser": buildStatsPipeline(dateRange, "$browser", totalSessions),
				"os": buildStatsPipeline(dateRange, "$os", totalSessions),
				"device": buildStatsPipeline(dateRange, "$device", totalSessions),
				"referrer": buildStatsPipeline(dateRange, "$referrer", totalSessions)
			}
			Session.aggregate([{$facet:pipelines}], function(error, result){
				if(Array.isArray(result) ) {
					result = result[0];

					result.browser = trimArray(result.browser, resultSize);
					result.os = trimArray(result.os, resultSize);
					result.device = trimArray(result.device, resultSize);
					result.referrer = trimArray(result.referrer, resultSize);
				}
				callback(error, result);
			});
		},
		function(countError){
			callback(countError);
		}
	)
	.catch(function(fatalError){
		callback(fatalError);
	});
}

/**
* @function
* Return statistics for session clicks.
*
* @param {DateRange} dateRange - Return statistics from within this time range
* @param {function} callback - Callback function invoked with an error and result arguments.
*/
sessionSchema.statics.getAnalyticsClickStats = function(dateRange, resultSize, callback) {
	this.aggregate([
		{ $match:{
			sessionStartTime:{$gte:dateRange.from, $lte:dateRange.to},
		}},
		{ $unwind:{path:'$clicks'} },
		{ $group:{
			_id:'$clicks.itemCategory',
			categoryCount: {$sum:1},
			originalClicks: {$push:'$clicks'}
		}},
		{ $unwind: {path:'$originalClicks'} },
		{ $group:{
			_id:{itemId:'$originalClicks.itemId', itemCategory:'$originalClicks.itemCategory'},
			categoryCount: {$first:'$categoryCount'},
			itemCount: {$sum:1},
		}},
		{ $project:{
			_id:0,
			itemId: '$_id.itemId',
			itemCategory: '$_id.itemCategory',
			categoryTotal: '$categoryCount',
			total: '$itemCount',
			percent: {$multiply:[
				'$itemCount',
				{$divide:[100, '$categoryCount']}
			]}
		}},
		{ $sort:{
			total:-1
		}},
		{ $group:{
			_id: '$itemCategory',
			clicks: {$push:'$$ROOT'}
		}},
		{ $project:{
			_id:0,
			category: '$_id',
			clicks: '$clicks'
		}}
	],
	function(error, result){
		if(Array.isArray(result) ) {
			for(let clickGroup of result) {
				clickGroup.clicks = trimArray(clickGroup.clicks, resultSize);
			}
		}
		callback(error, result)
	});
}








const session = mongoose.model('Session', sessionSchema);
module.exports = session;
