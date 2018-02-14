const handlebars = require('express-handlebars');
const locals = require('./locals.js');
const path = require('path');

module.exports = function applyViewEngine(expressApp) {
	const viewsDirectory = path.join(__dirname, '../templates/views');

	const handleBarsInstance = handlebars({
		layoutsDir: path.join(viewsDirectory, '/layouts'),
		extname: '.hbs',
		defaultLayout: 'main'
	});

	expressApp.set('views', viewsDirectory);
	expressApp.engine('.hbs', handleBarsInstance);
	expressApp.set('view engine', '.hbs');

	if(typeof expressApp.locals == 'object') {
		expressApp.locals = Object.assign({}, locals, expressApp.locals);
	}
	else {
		expressApp.locals = locals;
	}
}
