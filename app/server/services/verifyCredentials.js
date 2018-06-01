const dotenv = require('dotenv-safe');
dotenv.config();

/**
* @function
* @param {string} key - API key
*/
function verifyCredentials(key)
{
	return key === process.env.KEY;
}


module.exports = verifyCredentials;
