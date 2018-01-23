const app = require('./controllers/app.js');
const appWS = require('./controllers/appWS.js');
const database = require('./database.js');
const logger = require('./services/logger.js');

/**
* Module that provides a centralized method of starting and ending the application server.
*/
const serverInterface = {
	_serverInstance: null,

	/**
	* @function
	* Start the application server. Connects to the mongo databse before starting the server.
	* May optionaly pass in an alternative express app to start instead of the default.
	*
	* @param {function} callback - (optional) Callback invoked with an error as its first parameter and an instance of the httpServer object as the second.
	*
	* @param {number} portNum - (optional) The port for the server to connect on. The "PORT" env variable will be used * if it is defined. If it is not, then portNum will be used. If neither is defined then the default port
	* of 8080 will be used.
	*
	* @param {ExpressApp} altApp - (optional) An alternative express app to start instead of the default one.
	* Created using "var app = express()".
	*/
	start: function start(callback, portNum, altApp) {
		const port = process.env.PORT || portNum || 8080;
		const envType = process.env.NODE_ENV;
		const appToUse = altApp || app;

		if(callback == null) {
			// easier than checking if callback is null everytime its used
			callback = function(){};
		}

		database.connect().then(onMongoSuccess, onMongoError);

		function onMongoSuccess() {
			logger.debug('Succesfully connected to mongo databse');

			this._serverInstance = appToUse.listen(port, function(){
				logger.debug(`Server started on port ${port}`);
				callback(null, this._serverInstance);
			});

			appWS(this._serverInstance);

			this._serverInstance.on('error', function(error){
				callback(error, null);
			});
		}
		function onMongoError(error) {
			logger.error({
				message:`Failed to connect to mongo database. Env type: ${envType} Mongo URI: ${database.getUri()}`,
				meta:{error:error, envType:envType, mongoUri:database.getUri()}
			});

			callback(error, null);
		}

	},

	/**
	* @function
	* Dosconnect the databse and close the server.
	* @param {function} callback - Callback to be called when the server and databse are closed.
	* If an error occured with the database, it will be the first argument to the callback.
	*/
	close: function close(callback) {
		if(callback == null) {
			// easier than checking if callback is null everytime its used
			callback = function(){};
		}

		database.disconnect().then(onMongooseDisconnect, onMongooseError);

		function onMongooseDisconnect() {
			if(this._serverInstance == null) {
				logger.debug('Server closed');
				callback();
			}
			else {
				this._serverInstance.close(function(){
					logger.debug('Server closed');
					callback();
				});
			}
		}

		function onMongooseError(error) {
			callback(error);
		}
	}

	// httpServerInstance: function httpServerInstance() {
	// 	return this._serverInstance;
	// }

}

module.exports = serverInterface;
