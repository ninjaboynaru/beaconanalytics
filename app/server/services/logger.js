const winston = require('winston');
const path = require('path');
const stringify = require('json-stringify-safe');
const errorToJson = require('utils-error-to-json');
const getMongoUri = require('../utils/getMongoUri.js');
require('winston-mongodb');

const logsFilePath = path.join(__dirname, '../logs/logs.txt');

/**
* @function
* Winston format function for printing readable information to the console.
* Will also print the "meta.error" property if it exists and the NODE_ENV is not set to "production".
*/
const formatPrint = winston.format.printf(function(info){
	let formatedPrint = `${info.timestamp} meta:${!!info.meta} ${info.level}: ${info.message}`;

	if(process.env.NODE_ENV != 'production' && info.meta && info.meta.error) {
		formatedPrint += `\nerror:\n ${stringify(info.meta.error, null, 2) }`;
	}

	return formatedPrint;
});

/**
* @function
* A winston format function.
*
* Parses the meta property of a log to be an object that can be successfully converted to MongoDBs' BSON format.
* Uses json-stringify-safe to safely handle circular references.
*/
const formatMetaToValidBSON = winston.format(function(info) {
	if(info.meta)
	{
		if(info.meta.error && info.meta.error instanceof Error) {
			info.meta.error = errorToJson(info.meta.error);
		}
		info.meta = JSON.parse(stringify(info.meta));
	}
	return info;
});

const transports = [
	new winston.transports.File({
		handleExceptions: true,
		level: 'info',
		filename: logsFilePath
	}),

	new winston.transports.MongoDB({
		handleExceptions: true,
		level: 'info',
		db: getMongoUri(),
		collection: 'logs',
		caped: true,
		decolorize: true,
		tryReconnect: true
	}),
]

if(process.env.NODE_ENV != 'production') {
	transports.push(new winston.transports.Console({handleExceptions: true, level:'debug'}) );
}

const logger = winston.createLogger({
	transports: transports,
	format: winston.format.combine(
		winston.format.timestamp(),
		winston.format.colorize({all:true}),
		formatMetaToValidBSON(),
		formatPrint
	)
});



module.exports = logger;
