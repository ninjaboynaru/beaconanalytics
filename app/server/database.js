const mongoose = require('mongoose');
const getMongoUri = require('./utils/getMongoUri');
mongoose.Promise = global.Promise;

/**
* Module that provides a centralized method of connecting to the mongo database
* that corrisponds with the current NODE_ENV.
*/
const dbInterface = {
	/**
	* @function
	* Connect to the mongo databse corosponding to the current NODE_ENV.
	* Will return a promise that resolves to true if a connection already exists.
	* Returns a promise that resolves when connected or rejects with an error.
	*/
	connect: function connect() {
		return mongoose.connect(getMongoUri(), {useMongoClient:true});
	},

	/**
	* @function
	* Returns a promise that resolves when disconnected, or rejects with an error.
	*/
	disconnect: function disconnect() {
		return mongoose.disconnect();
	},

	getUri: function getUri() {
		return getMongoUri();
	}
}

module.exports = dbInterface;
