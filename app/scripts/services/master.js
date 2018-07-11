angular
	.module('testApp')
	.service('BackendService', function Service($http, $q, $httpParamSerializerJQLike) {

		return {
			getTags: getTags,
			login: login,
			forgot: forgot,
			getNotifications: getNotifications,
			updateNotifStatus : updateNotifStatus,
			register: register,
			getTrainingMaterial: getTrainingMaterial,
			getTrainingSubject: getTrainingSubject,
			getTrainingMaterialHome: getTrainingMaterialHome,
			downloadFile : downloadFile,
			getTraining: getTraining,
			changePass: changePass,
			getTimetable: getTimetable,
			getBatch: getBatch,
			getFacultyData : getFacultyData,
			getEvent: getEvent,
			saveHallOfFame: saveHallOfFame,
			getHallOfFame: getHallOfFame,
			updateHallOfFame: updateHallOfFame,
			deleteHallOfFame: deleteHallOfFame,
			getBirthAndEvent: getBirthAndEvent,
			getPastEvent: getEvent,
			applyForLeave: applyForLeave,
			getLeaves: getLeaves,
			leaveApproveOrDecline: leaveApproveOrDecline,
			cancelLeave : cancelLeave,
			createWeekSession : createWeekSession,
			getWeekSession : getWeekSession,
			actWeekSession : actWeekSession,
			sessionFeedback : sessionFeedback,
			deleteSession : deleteSession
		};

		
		function downloadFile(query){
			return $http.get('/api/download'+query).then(handleSuccess, handleError);
		}

		function deleteSession(query){
			return $http.delete('/api/weeksession'+query).then(handleSuccess, handleError);
		}

		function sessionFeedback(obj){
			return $http.post('/api/feedback', obj).then(handleSuccess, handleError);
		}

		function actWeekSession(query,obj){
			return $http.post('/api/weeksession/update'+query, obj).then(handleSuccess, handleError);
		}

		function createWeekSession(obj){
			return $http.post('/api/weeksession', obj).then(handleSuccess, handleError);
		}

		function getWeekSession(query){
			return $http.get('/api/weeksession'+query).then(handleSuccess, handleError);
		}

		function cancelLeave(query, ) {
			return $http.delete('/api/leave' + query).then(handleSuccess, handleError);
		}

		function applyForLeave(query, obj) {
			return $http.post('/api/leave' + query, obj).then(handleSuccess, handleError);
		}

		function leaveApproveOrDecline(query, obj) {
			return $http.post('/api/leaveupdate' + query, obj).then(handleSuccess, handleError);
		}

		function getLeaves(query) {
			return $http.get('/api/leave' + query).then(handleSuccess, handleError);
		}

		function getBirthAndEvent(query) {
			return $http.get('/api/birthevent' + query).then(handleSuccess, handleError);
		}
		function getTags() {
			return $http.get('/api/usertags').then(handleSuccess, handleError);
		}

		function getBatch() {
			var cancel = $q.defer();
			var request = {
				method: 'GET',
				url: '/api/batch',
				timeout: cancel.promise, // cancel promise, standard thing in $http request
				cancel: cancel // this is where we do our magic
			};
			return $http(request).then(handleSuccess, handleError);
		}

		

		function getFacultyData() {
			var cancel = $q.defer();
			var request = {
				method: 'GET',
				url: '/api/user/faculty',
				timeout: cancel.promise, // cancel promise, standard thing in $http request
				cancel: cancel // this is where we do our magic
			};
			return $http(request).then(handleSuccess, handleError);
		}

		function getTimetable() {
			var cancel = $q.defer();
			var request = {
				method: 'GET',
				url: '/api/timetable',
				timeout: cancel.promise, // cancel promise, standard thing in $http request
				cancel: cancel // this is where we do our magic
			};
			return $http(request).then(handleSuccess, handleError);
		}

		function getEvent(query) {
			return $http.get('/api/event' + query).then(handleSuccess, handleError);
		}

		function getTrainingSubject() {
			return $http.get('/api/getTrainingMaterial').then(handleSuccess, handleError);
		}

		function getTrainingMaterial(subject) {
			return $http.get('/api/getTrainingMaterial?subject=' + (subject ? subject : null)).then(handleSuccess, handleError);
		}

		function getTrainingMaterialHome(subject) {
			return $http.get('/api/getTrainingMaterialHome').then(handleSuccess, handleError);
		}

		function getTraining(subject) {
			return $http.get('/api/getTraining').then(handleSuccess, handleError);
		}

		function login(obj) {
			return $http.post('/api/login', obj).then(handleSuccess, handleError);
		}

		function forgot(obj) {
			return $http.post('/api/forgot', obj).then(handleSuccess, handleError);
		}

		function saveHallOfFame(obj) {
			return $http.post('/api/hall', obj).then(handleSuccess, handleError);
		}

		function getHallOfFame() {
			return $http.get('/api/hall').then(handleSuccess, handleError);
		}

		function updateHallOfFame(obj) {
			console.log(obj)
			return $http.post('/api/hallupdate', obj).then(handleSuccess, handleError);
		}

		function deleteHallOfFame(id) {
			return $http.delete('/api/hall?id=' + id).then(handleSuccess, handleError);
		}

		function changePass(obj) {
			return $http.post('/api/user', obj).then(handleSuccess, handleError);
		}

		function register(obj) {
			return $http.post('/api/register', obj).then(handleSuccess, handleError);
		}

		function getNotifications(hash) {
			return $http.get('/api/notification?email=' + JSON.parse(window.sessionStorage.user).email + (hash ? hash : '')).then(handleSuccess, handleError);
		}

		function updateNotifStatus(query){
			return $http.put('/api/notification'+query).then(handleSuccess, handleError);
		}

		// private functions
		function handleSuccess(res) {
			return res.data;
		}
		function handleError(res) {
			return $q.reject(res.data);
		}
	});