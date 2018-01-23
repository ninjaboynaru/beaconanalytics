const webpack = require('webpack');
const Uglify = require('uglifyjs-webpack-plugin');
const path = require('path');

let devtool;
const plugins = [];
const envType = process.env.NODE_ENV;

/* ! These keys shoud be defined in credentials.config.json ! Should be used by frontend code
* when for making calls to the API ! */
const productionAPIKey = 'afb51b19';
const developmentAPIKey = 'Z1HZ123';
let apiKeyToUse;

if(envType == 'production')
{
	console.log(`Webpack building for production. Using API Key: ${productionAPIKey}`);
	apiKeyToUse = productionAPIKey;
	devtool = 'none';
	plugins.push(new Uglify() );
}
else
{
	console.log(`Webpack building for development. Using API Key: ${developmentAPIKey}`);
	devtool = 'eval-source-map';
	apiKeyToUse = developmentAPIKey;
}

plugins.push( new webpack.DefinePlugin({
	// API_KEY should be added to eslint config files' "globals" object to prevent "no-undef" errors
	API_KEY: JSON.stringify(apiKeyToUse)
}));

const webpackConfig = {
	context: __dirname,
	entry: './app/www-src/js/index.js',
	output: {
		path: path.join(__dirname, 'www/js'),
		filename: 'bundle.js'
	},

	stats: {
		colors:true,
		reasons:true,
		chunks:true
	},

	devtool: devtool,
	plugins: plugins,

	module: {
		rules: [
			{
				enforce: 'pre',
				test: /\.js$/,
				loader: 'eslint-loader',
				exclude: '/node_modules'
			},
			{
				test: /\.js$/,
				loader: 'babel-loader'
			}
		]
	}
}



module.exports = webpackConfig;
