const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const PurifyCSSPlugin = require('purifycss-webpack-plugin');
//DEV
exports.devServer = function(options) {
  return {
      //if HMR is not working
      /*watchOptions: {
            // Delay the rebuild after the first change
            aggregateTimeout: 300,
            // Poll using interval (in ms, accepts boolean too)
            poll: 1000
      },*/
      devServer: {
            // Enable history API fallback so HTML5 History API based
            // routing works. This is a good default that will come
            // in handy in more complicated setups.
            historyApiFallback: true,

            // Unlike the cli flag, this doesn't set
            // HotModuleReplacementPlugin!
            hot: true,
            inline: true,

            // Display only errors to reduce the amount of output.
            stats: 'errors-only',

            // Parse host and port from env to allow customization.
            //
            // If you use Vagrant or Cloud9, set
            // host: options.host || '0.0.0.0';
            //
            // 0.0.0.0 is available to all network devices
            // unlike default `localhost`.
            host: options.host, // Defaults to `localhost`
            port: options.port // Defaults to 8080
      },
      plugins: [
            // Enable multi-pass compilation for enhanced performance
            // in larger projects. Good default.
            new webpack.HotModuleReplacementPlugin({
                  multiStep: true
            })
      ]
  };
}

//CSS during development
exports.setupCSS = function(paths) {
      return {
            module: {
                  loaders:[
                        {
                              test: /\.css$/,
                              loaders:['style', 'css'],
                              include: paths
                        }
                  ]
            }
      }
}

//minificiation
exports.minify = function() {
      return {
            plugins: [
                  new webpack.optimize.UglifyJsPlugin({
                        // Compression specific options
                        compress: {
                              warnings: false,
                              // Drop `console` statements
                              drop_console: true
                        }
                       /* 
                        //note: these are generally on by default
                       // Don't beautify output (enable for neater output)
                        beautify: false,
                        // Eliminate comments
                        comments: false,
                        // Mangling specific options
                        mangle: {
                              // Don't mangle $
                              except: ['$', 'webpackJsonp'],
                              // Don't care about IE8
                              screw_ie8 : true,
                              // Don't mangle function names
                              keep_fnames: false
                        }*/
                  })
            ]
      }
}

//for even smaller builds
exports.setFreeVariable = function(key, value){
      const env = {};
      env[key] = JSON.stringify(value);
      return {
            plugins: [
                  new webpack.DefinePlugin(env)
            ]
      };
}

//chucking plugin
exports.extractBundle = function(options){
      const entry = {};
      entry[options.name] = options.entries;
      return {
            //Define an entry point needed for splitting
            entry: entry,
            plugins: [
                  //Extract bundle and manifest files. 
                  //Manifest is needed for reliable caching.
                  new webpack.optimize.CommonsChunkPlugin({
                        names: [options.name, 'manifest']
                  })
            ]
      };
}

//Clean the build folder between builds
exports.clean = function(path) {
      return {
            plugins: [
                  new CleanWebpackPlugin([path], {
                        //wont work without root
                        root: process.cwd()
                  })
            ]
      };
}

//extract Css to its own files to avoid Flash of Unstyled content FOUC
exports.extractCSS = function(paths) {
      return {
            module: {
                  loaders: [
                  //extract css during build
                        {
                              test: /\.css$/,
                              loader: ExtractTextPlugin.extract('style', 'css'),
                              include: paths
                        }
                  ]
            },
            plugins: [
                  //output extracted css to a file
                  new ExtractTextPlugin('[name].[chunkhash].css')
            ]
      };
}

//Dedupelicate plugins
exports.removeDuplicates = function() {
      return {
            plugins: [
                  new webpack.optimize.DedupePlugin()
            ]
      }
}

//PurifyCss Plugin to remove all unused CSS definitions to the build
exports.purifyCSS = function(paths) {
      return {
            plugins: [
                  new PurifyCSSPlugin({
                        basePath: process.cwd(),
                        // `paths` is used to point PurifyCSS to files not
                        // visible to Webpack. You can pass glob patterns to it.
                        // or hand coded path to css files used int he project
                        
                        //https://github.com/purifycss/purifycss#the-optional-options-argument
                        paths: paths,
                        info: true,
                        minify: true,
                        rejected: true
                  })
            ]
      };
}
