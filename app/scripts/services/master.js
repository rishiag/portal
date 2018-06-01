angular
	.module('testApp')
	.service('BackendService', function Service($http, $q, $httpParamSerializerJQLike) {

		return {	
			getTags : getTags,
			login : login,
			forgot: forgot,
			getNotifications : getNotifications,
			register : register,
			getTrainingMaterial : getTrainingMaterial,
			getTrainingSubject : getTrainingSubject,
			getTrainingMaterialHome : getTrainingMaterialHome
		};
		function getTags() {
			return $http.get('/api/usertags').then(handleSuccess, handleError);
		}

		function getTrainingSubject() {
			return $http.get('/api/getTrainingMaterial').then(handleSuccess, handleError);
		}

		function getTrainingMaterial(subject) {
			return $http.get('/api/getTrainingMaterial?subject='+(subject ? subject : null)).then(handleSuccess, handleError);
		}

		function getTrainingMaterialHome(subject) {
			return $http.get('/api/getTrainingMaterialHome').then(handleSuccess, handleError);
		}
		
		function login(obj) {
			return $http.post('/api/login',obj).then(handleSuccess, handleError);
		}

		function forgot(obj) {
			return $http.post('/api/forgot',obj).then(handleSuccess, handleError);
		}

		function register(obj) {
			return $http.post('/api/register',obj).then(handleSuccess, handleError);
		}

		function getNotifications(hash){
			return $http.get('/api/notification?email='+JSON.parse(window.sessionStorage.user).email+(hash?hash:'')).then(handleSuccess, handleError);
		}

		// private functions
		function handleSuccess(res) {
			return res.data;
		}
		function handleError(res) {
			return $q.reject(res.data);
		}
	});