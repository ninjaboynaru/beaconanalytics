const dotenv = require('dotenv-safe');
dotenv.config();

/**
* @function
* Obtain the mongodb uri for the current enviorment (production, development, testing)
* @returns {string}
*/
module.exports = function getMongoUri()
{
	if(process.env.NODE_ENV == 'production')
	{
		return process.env.MONGO_PROD_URI;
	}
	else if(process.env.NODE_ENV == 'testing')
	{
		return process.env.MONGO_TEST_URI;
	}
	else
	{
		return process.env.MONGO_DEV_URI;
	}
}
