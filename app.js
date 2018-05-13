var express 			= require('express'),
		path 					= require('path'),
		favicon 			= require('serve-favicon'),
		logger 				= require('morgan'),
		cookieParser 	= require('cookie-parser'),
		bodyParser 		= require('body-parser'),
		app 					= express(),
		dotenv 				= require('dotenv');
		chalk 				= require('chalk');
		session 			= require('express-session'),
		expressValidator = require('express-validator'),
		router 				= express.Router(),
		request 			= require('request'),
		mongoose 			= require('mongoose'),
		port 					= process.env.PORT || 5678;

		app.use(expressValidator());
		app.use(bodyParser.json());
		app.use(bodyParser.urlencoded({ extended: false }));


/**
 * Load environment variables from .env file, where API keys and passwords are configured.
 */
dotenv.load({ path: '.env' });


/**
 * Connect to MongoDB.
 */

mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI, { useMongoClient: true });
mongoose.connection.on('error', (err) => {
  console.error(err);
  console.log('%s MongoDB connection error. Please make sure MongoDB is running.', chalk.red('✗'));
  process.exit();
});


/**
 * Controllers (route handlers).
 */
const userController = require('./controllers/user');


/**
 * Primary app routes.
 */
app.post('/api/register', userController.postRegister);




if(process.env.NODE_ENV && process.env.NODE_ENV.toLowerCase() == "production"){

	console.log('Running is production environment')

	app.use("/", express.static('dist'));

	app.get('*', function(req, res) {
		res.sendFile(path.join(__dirname, 'dist', 'index.html')); // load the single view file (angular will handle the page changes on the front-end)
	});
}else{

	console.log('Running is development environment')

	app.use("/", express.static('app'));
	app.use("/", express.static('bower_components'));

	app.get('*', function(req, res) {
		res.sendFile(path.join(__dirname, 'app', 'index.html')); // load the single view file (angular will handle the page changes on the front-end)
	});
}


module.exports = app;

app.listen(port, function() {
	console.log('Listening on port '+port);
});