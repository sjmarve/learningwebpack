const webpack = require("webpack");
const path = require("path");
const merge = require("webpack-merge");
// validator for this config file
const validate = require("webpack-validator");

const parts = require("./libs/parts");

const HtmlWebpackPlugin = require("html-webpack-plugin");
// const FaviconsWebpackPlugin = require('favicons-webpack-plugin');

const PATHS = {
    app: path.join(__dirname, 'app'),
    build: path.join(__dirname, 'build'),
    style: [
        path.join(__dirname, 'app', 'main.css'),
        path.join(__dirname, 'node_modules', 'purecss')
    ]
};

const packages = require('./package.json');

//Common tasks for all targets i.e. test, dev, production etc
const common = {
    entry: {
        app: PATHS.app,
        style: PATHS.style,
        vendor: Object.keys(packages.dependencies)
    },
    output: {
        path: PATHS.build,
        publicPath: '/webpack-demo/',
        filename: '[name].js',
        chunkFilename: '[chunkhash].js'
},
    plugins: [
        new HtmlWebpackPlugin({
            title: "Webpack demo"
        })
        // new FaviconsWebpackPlugin('my-logo.png')
    ]
}

//variable with all the settings.
var config = {
  output: {
    // Modify the name of the generated sourcemap file.
    // You can use [file], [id], and [hash] replacements here.
    // The default option is enough for most use cases.
    sourceMapFilename: '[file].map', // Default

    // This is the sourcemap filename template. It's default format
    // depends on the devtool option used. You don't need to modify this
    // often.
    devtoolModuleFilenameTemplate: 'webpack:///[resource-path]?[loaders]'
  }
};

//Detect how npm is run and branch based on that
switch(process.env.npm_lifecycle_event)
{
    case 'build':
    case 'stats':
        config = merge(
            common,
            {
                devtool: 'source-map',
                output: {
                    path: PATHS.build,
                    filename: '[name].[chunkhash].js',
                    chunkFilename: '[chunkhash].js'
                }
            },
            parts.clean(PATHS.build),
            //to preseve dotfiles in the build folder use this instead
            // parts.clean(path.join(PATHS.build, '*')),
            parts.setFreeVariable('process.env.NODE_ENV', 'production'),
            parts.removeDuplicates(),
            parts.extractBundle({
                name: 'vendor',
                //to explicitly state the vendor specific packages to be bundled in vendor.js
                //filter function to exclude some
                entries: Object.keys(packages.dependencies)
            }),
            parts.minify(),
            parts.extractCSS(PATHS.style),
            //must be after the ExtractTextPlugin is used otherwise it wont work
            parts.purifyCSS([PATHS.app])
        );
        break;
    default:
        config = merge(
            common,
            {
                devtool: 'eval-source-map'
            },
            parts.setupCSS(PATHS.style),
            parts.devServer({
                //Customize host/port here if needed
                host: process.env.HOST,
                port: process.env.PORT
            })
        );
        break;
}

module.exports = validate(config, {
    quiet: true
});


