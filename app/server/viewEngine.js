const handlebars = require('express-handlebars');
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

	expressApp.locals = {
		title: 'Beacon'
	}
}
