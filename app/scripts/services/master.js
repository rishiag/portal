angular
	.module('testApp')
	.service('BackendService', function Service($http, $q, $httpParamSerializerJQLike) {

		return {	
			fetchData: fetchData,
			getTags : getTags
		};
		function fetchData(term, limit) {
			return $http.get('login').then(handleSuccess, handleError);
		}

		function getTags() {
			return $http.get('tags').then(handleSuccess, handleError);
		}
		

		// private functions
		function handleSuccess(res) {
			return res.data;
		}
		function handleError(res) {
			return $q.reject(res.data);
		}
	});