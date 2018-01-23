
/**
* Attempt to obtain the mngo uri configurations from a config file or env variables.
*
* In a production enviorment such as heroku, that config
* should not exist due to it beaing added to .gitignore, thus the env variables are checkd for the uris.
* If the config file does not exist and the env variables do not exist then an error is thrown.*
*/

const configFilePath = '../../config/mongo.config.json';
let mongoConfig;
try {
	mongoConfig = require(configFilePath);
}
catch(e)
{
	let mongoProdUri = process.env.MONGO_PROD_URI;
	let mongoDevUri = process.env.MONGO_DEV_URI;
	let mongoTestUri = process.env.MONGO_TEST_URI;
	
	if(!mongoProdUri || !mongoDevUri || !mongoTestUri)
	{
		throw new ReferenceError(`No mongo.config.json file found at path ${configFilePath} and env variables MONGO_PROD_URI, MONGO_DEV_URI or MONGO_TEST_URI have not been set. Fatal error. Exiting process.`);
	}
	else
	{
		mongoConfig = {
			productionUri: mongoProdUri,
			developmentUri: mongoDevUri,
			testingUri: mongoTestUri
		}
	}
}

/**
* @function
* Obtain the mongodb uri for the current enviorment (production, development, testing)
* @returns {string}
*/
module.exports = function getMongoUri()
{
	if(process.env.NODE_ENV == 'production')
	{
		return mongoConfig.productionUri;
	}
	else if(process.env.NODE_ENV == 'testing')
	{
		return mongoConfig.testingUri;
	}
	else
	{
		return mongoConfig.developmentUri;
	}
}