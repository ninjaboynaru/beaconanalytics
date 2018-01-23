import * as d3 from 'd3';


/**
* @class
* View that renders a table or group of tables.
*
* @param {string|Element} rootElement - The DOM element to contain the View. If this
* is a string, it shoud be the id of the element. If an element with this id could not be found or it is not
* of type window.Element, an error will be thrown.
*/
function TableView(rootElement) {
	if(typeof rootElement == 'string') {
		this.rootElement = document.getElementById(rootElement);
		if(this.rootElement == null) {
			throw new Error(`Element with id ${rootElement} could not be found. TableView is unable to initialize.`);
		}
	}
	else if(rootElement instanceof window.Element) {
		this.rootElement = rootElement;
	}
	else {
		throw new TypeError('The "rootElement" argument of new TableView() must be a string or an Element object');
	}
}

TableView.prototype.initialize = function initialize() {
	this.container = document.createElement('div');
	this.heading = document.createElement('h2');
	this.sections = document.createElement('nav');

	this.container.classList.add('data-table');
	this.heading.classList.add('data-table__heading');
	this.sections.classList.add('data-table__sections');

	this.rootElement.appendChild(this.container);
	this.container.appendChild(this.heading);
	this.container.appendChild(this.sections);

	return this;
}
TableView.prototype.setHeading = function setHeading(heading) {
	this.heading.textContent = heading;

	return this;
}

/**
* @typedef TableData
* @type {object}
*
* @property {string} name - OPTIONAL
* @property {string[]} headings
* @property {string[][]} rows
*/


/**
* @function
* Render a table table or group of tables.
*
* @param {TableData} tableDataArg - A TableData object to render. If this is an array of TableData objects, then
* a sections area will be rendered along with the tables. One section per TableData object. Each sections' heading will * be the "name" property of the TableData object it corisponds to and clicking it will activate the table.
*
* @returns {TableView} - This TableView object.
*/
TableView.prototype.render = function render(tableDataArg) {
	const tableHTML = 'table';
	const headingContainerHTML = 'tr';
	const headingHTML = 'th';
	const rowHTML = 'tr';
	const columnHTML = 'td';

	let tableData = tableDataArg;
	if(Array.isArray(tableData) == false) {
		tableData = [tableDataArg];
	}

	const tables = d3.select(this.container)
	.selectAll(tableHTML)
	.data(tableData)
	.enter()
	.append(tableHTML)
	.attr('class', 'data-table__table data-table__table--hidden');

	const headingContainer = tables.append(headingContainerHTML).attr('class', 'data-table__table__headings');

	// headings (elements inside the headingContainer)
	headingContainer.selectAll(headingHTML)
	.data( (table)=>table.headings )
	.enter()
	.append(headingHTML).attr('class', 'data-table__table__headings__heading')
	.text( (headingText)=>headingText );


	const rows = tables.selectAll(rowHTML)
	.data( (table)=>table.rows )
	.enter()
	.append(rowHTML)
	.attr('class', 'data-table__table__row');

	// columns
	rows.selectAll(columnHTML)
	.data( (rowArray)=>rowArray )
	.enter()
	.append(columnHTML)
	.attr('class', 'data-table__table__row__column')
	.text( (rowArrayItem)=>rowArrayItem );


	const sectionBtns = d3.select(this.sections)
	.selectAll('button')
	.data(tableData)
	.enter()
	.append('button')
	.attr('class', 'data-table__sections__btn')
	.text( (table)=>table.name );

	sectionBtns.on('click', function(datum, btnIndex){
		tables.classed('data-table__table--hidden', (datum, index)=>index != btnIndex );
		sectionBtns.classed('data-table__sections__btn--selected', (datum, index)=>index == btnIndex );
	});

	// simulate a click on the first sectionBtn to activate it
	sectionBtns.each(function(datum, index){
		if(index == 1) {
			this.click();
		}
	});

	return this;
}


export default TableView;
