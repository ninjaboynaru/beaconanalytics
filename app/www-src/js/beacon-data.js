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
	const toQuery = to ? `count=${to}&` : '';
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


BeaconData.prototype.getBasicData = function getBasicData(callback) {
	const url = this._buildURL({endpoint:'overview'});
	this._makeRequest(url, callback);


}

BeaconData.prototype.getStatisticsData = function getStatsticsData(callback, statType, count=6) {
	const url = this._buildURL({
		endpoint:'stats',
		count: count,
		statType: statType
	});
	this._makeRequest(url, callback);

}

BeaconData.prototype.getAllStatisticsData = function getAllStatsticsData(callback, count=6) {
	const url = this._buildURL({
		endpoint:'stats',
		count: count,
		statType: 'all'
	});
	this._makeRequest(url, callback);
}

BeaconData.prototype.getClickData = function getClickData(callback, count=6) {
	const url = this._buildURL({
		endpoint:'stats',
		count: count,
		statType: 'click'
	});
	this._makeRequest(url, callback);
}


export default BeaconData;
