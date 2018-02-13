/**
  @typedef SocketError
  @type {object}
  @property {object} error.
  @property {string} error.type.
  @property {string} error.description.
 /


/**
* Service module that constructs session websocket errors in a uniform manner.
*/
const errorBuilder = {}

/**
* @function
* Build web socket error as a JSON string.
*
* @param {string} type
* @parm {string} description
* @returns {SocketError}
*/
errorBuilder.buildError = function(type, description) {
	return JSON.stringify( {error:{type:type, description:description}} );
}

/**
* @function
* Build a web socket error for a missing input error.
*
* @param {string} parameterName - The name of the input that was missing
* @returns {SocketError}
*/
errorBuilder.missingParameter = function(parameterName) {
	return errorBuilder.buildError('Missing Input', `The provided input was missing the "${parameterName}" parameter`);
}

module.exports = errorBuilder;
