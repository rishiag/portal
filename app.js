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
		multipart = require('connect-multiparty'),
	    multipartMiddleware = multipart();
		port 					= process.env.PORT || 8000;

		app.use(expressValidator());
		app.use(bodyParser.json());
		app.use(bodyParser.urlencoded({ extended: false }));
		const fs = require('fs');
		var _ = require('underscore');


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
const notificationController = require('./controllers/notification');
const timetableController = require('./controllers/timetable');
const eventController = require('./controllers/event');
const hallController = require('./controllers/hall');
const leaveController = require('./controllers/leave');
const Utils = require('./Utils/utility');
const utility = new Utils();
/**
 * Primary app routes.
 */
app.post('/api/register', userController.postRegister);
app.post('/api/login', userController.login);
app.post('/api/forgot', userController.forgot);
app.post('/api/user',utility.authenticateUser, userController.changePassword);
app.get('/api/birthevent',utility.authenticateUser, userController.getBirthdayAndEvents);
app.get('/api/usertags', utility.authenticateUser,userController.getUserTags);
app.post('/api/notification', multipartMiddleware,utility.authenticateUser,notificationController.saveNotification);
app.get('/api/notification',utility.authenticateUser,notificationController.getNotification);
app.get('/api/getTrainingMaterial',utility.authenticateUser, userController.getTrainingMaterial);
app.get('/api/getTrainingSubject',utility.authenticateUser, userController.getTrainingSubject);
app.get('/api/getTrainingMaterialHome',utility.authenticateUser, userController.getTrainingMaterialHome);
app.get('/api/getTraining', utility.authenticateUser,userController.getFolderFiles);
app.post('/api/createtimetable', multipartMiddleware,utility.authenticateUser,timetableController.saveTimetable);
app.get('/api/timetable', utility.authenticateUser,timetableController.getTimetable);
app.get('/api/batch',utility.authenticateUser,userController.getBatch);

app.get('/api/user',userController.importUsers);

app.get('/api/event',utility.authenticateUser,eventController.getEvent);
app.post('/api/event',multipartMiddleware,utility.authenticateUser,eventController.saveEvent);

app.get('/api/hall',utility.authenticateUser,hallController.getHallOfFame);
app.post('/api/hall',utility.authenticateUser,hallController.saveHallOfFame);
app.post('/api/hallupdate',utility.authenticateUser,hallController.updateHallOfFame);
app.delete('/api/hall',utility.authenticateUser,hallController.deleteteHallOfFame);

app.get('/api/leave',utility.authenticateUser,leaveController.getLeaves);
app.post('/api/leave',utility.authenticateUser,leaveController.saveLeave);
app.post('/api/leaveupdate',utility.authenticateUser,leaveController.approveOrDecline);

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
