import 'whatwg-fetch';

/**
* @class
* Obtains analytics data from the Beacon Analytics API.
* @param {string} key - (OPTIONAL) Alternative API key to use instead of the default
*/
function BeaconData(key) {
	// API_KEY is global const that should be defined using webpack.DefinePlugin(...)
	this._key = key || API_KEY;
}


BeaconData.prototype._buildURL = function _buildURL( {endpoint, count, from, to, statType}={}) {
	const countQuery = count ? `count=${count}&` : '';
	const fromQuery = from ? `from=${from}&` : '';
	const toQuery = to ? `to=${to}&` : '';
	const statTypeQuery = statType ? `statType=${statType}&` : '';

	const fullQuery = '?' + countQuery + statTypeQuery + fromQuery + toQuery;

	return `/data/${this._key}/${endpoint}/${fullQuery}`;
}


BeaconData.prototype._makeRequest = function _makeRequest(url, callback) {
	function handleFetchRespoonse(response) {
		if(response.ok) {
			return response;
		}
		else {
			throw {
				name: 'BeaconData fetch error',
				message: 'Error fetching data',
				url: url,
				status: response.status,
				statusText: response.statusText,
				response: response
			};
		}
	}

	function parseResponseJSON(response) {
		return response.json();
	}

	function callbackError(error) {
		callback(error);
	}

	fetch(url).then(handleFetchRespoonse).
	then(parseResponseJSON).
	then(function(basicData){
		callback(null, basicData);
	}).
	catch(callbackError);
}


BeaconData.prototype.getBasicData = function getBasicData(callback, options) {
	const finalOpts = Object.assign({count:6}, options, {endpoint:'overview'});
	const url = this._buildURL(finalOpts);
	this._makeRequest(url, callback);


}

BeaconData.prototype.getStatisticsData = function getStatsticsData(callback, options) {
	const finalOpts = Object.assign({count:6}, options, {endpoint:'stats'});
	const url = this._buildURL(finalOpts);
	this._makeRequest(url, callback);

}

BeaconData.prototype.getAllStatisticsData = function getAllStatsticsData(callback, options) {
	const finalOpts = Object.assign({count:6}, options, {endpoint:'stats', statType:'all'});
	const url = this._buildURL(finalOpts);
	this._makeRequest(url, callback);
}

BeaconData.prototype.getClickData = function getClickData(callback, options) {
	const finalOpts = Object.assign({count:6}, options, {endpoint:'stats', statType:'click'});
	const url = this._buildURL(finalOpts);
	this._makeRequest(url, callback);
}


export default BeaconData;
