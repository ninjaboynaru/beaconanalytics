const credentials = require('../../config/credentials.config.json');


/**
* @function
* Return a matching set of credentials for a given API key and host/origin url.
* If no matching credentials could be found, undefined is returned.
*
* May optionaly provide a credentials object to check against as the 3rd argument. If this
* argument is provied then that object will be returned if it matches the key and host name args or undefined will be returned.
*
* See the credentials.config.json file for the structure of a credentials object.
*
* @param {string} hostName - Origin of the API rquest. Can be obtained in the "host" header of the API request.
* @param {string} key - API key
* @param {object} credentialsObject - (optional) Sample credentials to check against. See the credentials config file for the structure of this object.
*/
function verifyCredentials(hostName, key, credentialsObject)
{
	let matchingCredentials;

	if(typeof credentialsObject == 'object')
	{
		if(credentialsObject.key == key && Array.isArray(credentialsObject.allowedOrigins) )
		{
			if(credentialsObject.allowedOrigins.indexOf(hostName) != -1)
			{
				matchingCredentials = credentialsObject;
			}
			else if(credentialsObject.allowedOrigins.indexOf('*') != -1 && process.env.NODE_ENV != 'production') {
				matchingCredentials = credentialsObject;
			}
		}
	}
	else
	{
		matchingCredentials = credentials.find(function(cred){
			if(cred.key == key) {
				if(cred.allowedOrigins.indexOf(hostName) != -1) {
					return true;
				}
				else if(cred.allowedOrigins.indexOf('*') != -1) {
					return true;
				}
				else {
					return false;
				}
			}
			else {
				return false;
			}
		});
	}

	return matchingCredentials;
}


module.exports = verifyCredentials;
