const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
	entry: {
		'index.js': './scripts/index.js',
	},
	output: {
		filename: '[name]',
		path: path.resolve(__dirname, 'public')
	},
	module: {
		loaders: [
			{
				test: /.js$/,
				exclude: /(node_modules)/,
				loaders: 'buble-loader',
				include: path.join(__dirname, 'scripts'),
				query: {
					objectAssign: 'Object.assign'
				}
			},
			{
				test: /\.css$/,
				use: [ 'style-loader', 'css-loader' ]
			}
		]
	},
	plugins: [new HtmlWebpackPlugin({
		title: 'Cards game',
		template: './template/index.ejs'
	})],
	devtool: 'inline-source-map',
};
