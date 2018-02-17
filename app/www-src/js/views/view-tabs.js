import * as d3 from 'd3';


/**
* @class
* View that renders a collection of DataItem a.k.a tabs.
*
* @param {string|Element} rootElement - The DOM element to contain the View. If this
* is a string, it shoud be the id of the element. If an element with this id could not be found or it is not
* of type window.Element, an error will be thrown.
*/
function TabView(rootElement) {
	if(typeof rootElement == 'string') {
		this.rootElement = document.getElementById(rootElement);
		if(this.rootElement == null) {
			throw new Error(`Element with id ${rootElement} could not be found. TabView is unable to initialize.`);
		}
	}
	else if(rootElement instanceof window.Element) {
		this.rootElement = rootElement;
	}
	else {
		throw new TypeError('The "rootElement" argument of new TabView() must be a string or an Element object');
	}
}


TabView.prototype.initialize = function initialize() {
	this.container = document.createElement('div');
	this.heading = document.createElement('h2');

	this.container.classList.add('data-tabs');
	this.heading.classList.add('data-tabs__heading');

	this.rootElement.appendChild(this.container);
	this.container.appendChild(this.heading);

	return this;
}

TabView.prototype.setHeading = function setHeading(heading) {
	this.heading.textContent = heading;

	return this;
}


/**
* @typedef DataItem
* @type {object}
*
* @property {string} name
* @property {string|number} value
* @property {string} unit - OPTIONAL
*
*/

/**
* @function
* Render a series of tabs
* @property {DataItem[]} tabData - An array of DataItems, each representing a tab to render.
*/
TabView.prototype.render = function render(tabData) {
	this.clear();
	
	const tabs = d3.select(this.container).selectAll('div').data(tabData).enter().append('div');
	tabs.attr('class', 'data-tabs__tab');

	const dataCSS = 'data-tabs__tab__data';
	tabs.append('span').text( (d)=>d.name ).attr('class', dataCSS);
	tabs.append('span').text( (d)=>d.value ).attr('class', dataCSS);

	return this;
}

TabView.prototype.clear = function clear() {
	d3.select(this.container).selectAll('div').remove();
}



export default TabView;
