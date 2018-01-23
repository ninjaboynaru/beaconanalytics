import TabView from './views/view-tabs.js'
import TableView from './views/view-table.js';
import BeaconData from './beacon-data.js';


const beaconUtils = {
	round: function round(number, decimalPlaces) {
		const factor = Math.pow(10, decimalPlaces);
		return Math.round(number * factor) / factor;
	},

	/**
	* @function
	* Create and return a TableData object from an array of objects.
	*
	* Each row in the table corisponds to a single object in the array.
	* The columns/items in each row are obtained by applying the function "accessorFn" to
	* each object.
	*
	*
	* @param {string} name - The name of the table
	* @param {string[]} headings - Array of strings to represent the table headings
	* @param {object[]} objects
	* @param {function} accessorFn - The "accessorFn" is called once for each object in the "objects" array
	* and is passed the object as its first argument. It should return an array of strings or numbers to be
	* used for the columns/items in the row that corisponds to that object. If an array is not returned, the
	* object it was passed will not be included in the table.
	*/
	tableDataFromObjects: function tableDataFromObjects(name, headings, objects, accessorFn) {
		const tableData = {};
		tableData.name = name;
		tableData.headings = headings;
		tableData.rows = [];

		for(let currentObj of objects) {
			const newRow = accessorFn(currentObj);
			if(Array.isArray(newRow) ) {
				tableData.rows.push(newRow);
			}
		}

		return tableData;
	}
}

/**
* @class
* Main controller of Beacon Analytics.
* !The only required argument is the "rootElement" argument. The others are optional.
*
* @param {string|Element} rootElement - The DOM element to contain the Beacon application. If this
* is a string, it shoud be the id of the element. If an element with this id could not be found or it is not
* of type window.Element, an error will be thrown.
*
* @param {TabView} customTabView - If specified, this will be used instead of the default TabView class.
* @param {TabView} customTableView - If specified, this will be used instead of the default customTableView class.
* @param {TabView} customBeaconData - If specified, this will be used instead of the default customBeaconData class.
*/
function Beacon(rootElement, customTabView, customTableView, customBeaconData) {

	if(typeof rootElement == 'string') {
		this.rootElement = document.getElementById(rootElement);
		if(this.rootElement == null) {
			throw new Error(`Element with id ${rootElement} could not be found. Beacon is unable to initialize.`);
		}
	}
	else if(rootElement instanceof window.Element) {
		this.rootElement = rootElement;
	}
	else {
		throw new TypeError('The "rootElement" argument of new Beacon() must be a string or an Element object');
	}

	const tabView = customTabView || TabView;
	const tableView = customTableView || TableView;
	const dataClass = customBeaconData || BeaconData;

	this.data = new dataClass();
	this.basicDataView = new tabView(this.rootElement);
	this.statisticsDataView = new tableView(this.rootElement);
	this.clickDataView = new tableView(this.rootElement);
}

Beacon.prototype.initialize = function initialize() {
	this.basicDataView.initialize().setHeading('Loading');
	this.statisticsDataView.initialize().setHeading('Loading');
	this.clickDataView.initialize().setHeading('Loading');

	this.data.getBasicData(this.renderBasicData.bind(this) );
	this.data.getAllStatisticsData(this.renderStatisticsData.bind(this) );
	this.data.getClickData(this.renderClickData.bind(this) );

}

/**
* @function
* Render basic overview data from the API.
* Should be used as a callback for a data fetching function.
*/
Beacon.prototype.renderBasicData = function renderBasicData(error, rawData) {
	if(error) {
		this.basicDataView.setHeading('There was a problem getting the data. Check your internet connection or try again later');
		console.error('Error getting basic data: ', error);
	}
	else {
		const parsedData = this._parseBasicData(rawData);
		this.basicDataView.render(parsedData).setHeading('Overview');
	}
}
/**
* @function
* @private
* Parse the basic overview data returned by the API, into an array of DataItem objects.
*/
Beacon.prototype._parseBasicData = function _parseBasicData(rawData) {
	const dataItem = (name, value, unit) => { return {name, value, unit }};

	const parsedData = [];

	parsedData.push(dataItem('Sessions', rawData.total) );
	parsedData.push(dataItem('Avg Session Duration', beaconUtils.round(rawData.avgSessionDuration, 2) ));
	parsedData.push(dataItem('Avg Break Duration', beaconUtils.round(rawData.avgBreakDuration, 2) ));

	return parsedData;
}


/**
* @function
* Render statistics data from the API.
* Should be used as a callback for a data fetching function.
*/
Beacon.prototype.renderStatisticsData = function renderStatisticsData(error, rawData) {
	if(error) {
		this.statisticsDataView.setHeading('There was a problem getting the data. Check your internet connection or try again later');
		console.error('Error getting statistics data: ', error);
	}
	else {
		const parsedData = this._parseStatisticsData(rawData);
		this.statisticsDataView.render(parsedData).setHeading('Statistics');
	}
}
/**
* @function
* @private
* Parse the statistics data returned by the API, into an array of TableData objects.
*/
Beacon.prototype._parseStatisticsData = function _parseStatisticsData(rawData) {

	const tableHeadings = ['Name', 'Percent', 'Total'];
	const accessorFn = (statItem) => [statItem.name, beaconUtils.round(statItem.percent, 2), statItem.total];

	const browserTable = beaconUtils.tableDataFromObjects('Browser', tableHeadings, rawData.browser, accessorFn);
	const osTable = beaconUtils.tableDataFromObjects('OS', tableHeadings, rawData.os, accessorFn);
	const deviceTable = beaconUtils.tableDataFromObjects('Device', tableHeadings, rawData.device, accessorFn);
	const referrerTable = beaconUtils.tableDataFromObjects('Referrer', tableHeadings, rawData.referrer, accessorFn);

	return [browserTable, osTable, deviceTable, referrerTable];
}


/**
* @function
* Render click data from the API.
* Should be used as a callback for a data fetching function.
*/
Beacon.prototype.renderClickData = function renderClickData(error, rawData) {
	if(error) {
		this.clickDataView.setHeading('There was a problem getting the data. Check your internet connection or try again later');
		console.error('Error getting click data: ', error);
	}
	else {
		const parsedData = this._parseClickData(rawData);
		this.clickDataView.render(parsedData).setHeading('Clicks');
	}
}
/**
* @function
* @private
* Parse the click data returned by the API, into an array of TableData objects.
*/
Beacon.prototype._parseClickData = function _parseClickData(rawData) {

	const tables = [];
	const tableHeadings = ['Name', 'Percent', 'Total'];
	const accessorFn = (clickStat) => [clickStat.itemId, beaconUtils.round(clickStat.percent, 2), clickStat.total];

	for(let clickGroup of rawData) {
		const tableName = clickGroup.category;
		const clicks = clickGroup.clicks;
		tables.push(beaconUtils.tableDataFromObjects(tableName, tableHeadings, clicks, accessorFn) );
	}

	return tables;
}




export default Beacon;
