require('dotenv-safe').config();
const webpack = require('webpack');
const Uglify = require('uglifyjs-webpack-plugin');
const path = require('path');

let devtool;
const plugins = [];
const envType = process.env.NODE_ENV;

if(envType == 'production')
{
	console.log('Webpack building for production');
	devtool = 'none';
	plugins.push(new Uglify() );
}
else
{
	console.log('Webpack building for development');
	devtool = 'source-map';
}

plugins.push( new webpack.DefinePlugin({
	// API_KEY should be added to eslint config files' "globals" object to prevent "no-undef" errors
	API_KEY: JSON.stringify(process.env.KEY)
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
