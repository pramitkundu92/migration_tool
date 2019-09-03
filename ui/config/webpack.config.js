const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const PATHS = {
   src: path.join(__dirname, '../app'),
   img: path.join(__dirname, '../app/assets/images'),
   style: path.join(__dirname, '../app/styles'),
   build: path.join(__dirname, '../dist')
}

module.exports = {
   // set src folder for app
   context: PATHS.src,
   // Specify entry point for app during bootstrap
   entry: './main.js',
   // Specify build output directory and filename
   output: {
      path: PATHS.build,
      filename: 'app.js'
   },
   // dev server config
   devServer: {
      https: true, // serve on https to enable UI with all brower features
      host: '0.0.0.0', // for all hosts on local
      publicPath: '/migration-app/', // partial path on which app will be loaded - http://0.0.0.0:8001/weather-app/index.html
      contentBase: path.resolve(__dirname, "/app/views"), // path to pick up views from
      watchContentBase: true, // for livereload server
      compress: true, // for reducing load time
      inline: true,
      port: 8001 // serving port for dev server
   },
   module: {
      rules: [
         // all js and jsx file are loaded using babel-loader - specify preset-env and preset-react in .babelrc file
         {
            test: /\.(js|jsx)?$/,
            exclude: /node_modules/,
            loader: 'babel-loader'
         },
         // load html views using html-loader, same can be configured for handlebars as well
         {
            test: /\.html?$/,
            use: [{
               loader: "html-loader"
            }]
         },
         // load scss, css files
         {
            test: /\.(scss)?$/,
            use: [
               {
                  loader: 'style-loader', // create style tags in index
               },
               {
                  loader: 'css-loader', // convert css into common js
               },
               {
                  loader: 'sass-loader' // convert sass to css
               }
            ],
            include: PATHS.style
         },
         // load images 
         {
            test: /\.(png|svg|jpg|gif)/,
            use: 'url-loader',
            include: PATHS.img
         }
      ]
   },
   // plugin to load up the main index.html page
   plugins:[
      new HtmlWebpackPlugin({
         template: './views/index.html',
         filename: 'index.html',
         favicon: './assets/images/favicon.png'
      })
   ]
};