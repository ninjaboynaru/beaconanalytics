
function DateView(inputElement) {
	if(typeof inputElement == 'string') {
		this.inputElement = document.getElementById(inputElement);
		if(this.inputElement == null) {
			throw new Error(`Element with id ${inputElement} could not be found. DateView is unable to initialize.`);
		}
	}
	else if(inputElement instanceof window.Element) {
		this.rootElement = inputElement;
	}

	// if(this.inputElement.nodeName != 'INPUT') {
	// 	throw new Error(`Element with id ${inputElement} is not of element type <input> DateView is unable to initialize.`)
	// }

	if(window.$ == null) {
		throw new Error('global $ variable has not been defined. DateView requires jquery to be exposed globaly.');
	}
}

DateView.prototype.initialize = function initialize() {
	this._jqueryElement = window.$(this.inputElement).datepicker();
	this._jqueryElement.datepicker('option', 'dateFormat', 'd MM, yy');
}

DateView.prototype.setDate = function setDate(date) {
	this._jqueryElement.datepicker('setDate', date);
}

DateView.prototype.setMinDate = function setMinDate(date) {
	this._jqueryElement.datepicker('option', 'minDate', date);
}

DateView.prototype.setMaxDate = function setMaxDate(date) {
	this._jqueryElement.datepicker('option', 'maxDate', date);
}

DateView.prototype.getDate = function getDate() {
	return this._jqueryElement.datepicker('getDate');
}

DateView.prototype.addChangeListener = function addChangeListener(listenerFn) {
	this._jqueryElement.on('change', function(){
		listenerFn(this.getDate());
	}.bind(this));
}



export default DateView;
