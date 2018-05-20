'use strict';

/**
 * @ngdoc function
 * @name testApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the testApp
 */
angular.module('testApp')
	.controller('HomeCtrl', function ($scope, $uibModal,BackendService,ngToast,Upload) {
		$scope.allTags = [{ text: 'vinay',isGroup:false },
							{ text: 'chirag',isGroup:false },
							{ text: 'click-labs',isGroup:true }];

		BackendService.getTags().then(function(data){
			if(data.status == 200){
				$scope.allTags = data.tags;
			}
		})
		$scope.tags = [];

		$scope.loadTags = function(query) {
			return $scope.allTags;
		};

		$scope.sendEmail = function(){
			if($scope.tags.length == 0)
					return message('Please enter user name or group name');
			else if($scope.subject == '' || !$scope.subject)
					return message('Please enter subject');
			else if($scope.content == '' || !$scope.content)
					return message('Please enter some content');
			else{

				Upload.upload({
					url: '/sendMail',
					data: {
								tags : $scope.tags,
								subject : $scope.subject,
								content : $scope.content,
								file : $scope.file ? $scope.file : null
							}
				}).then(function (resp) {
					$scope.file = null;
					$scope.tags = [];
					$scope.subject = '';
					$scope.content = '';
					$scope.fileName = '';
					if(response.status == 200)
						return message('Mail successfully sent....');
					else
						return message(response.message);
				}, function (resp) {
					console.log('Error status: ' + resp.status);
				}, function (evt) {
					var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
					console.log('progress: ' + progressPercentage + '% ' + evt.config.data.file.name);
				});
			}
		}

		$scope.upload = function(element) {
			console.log(element.files[0]);
			$scope.file = element.files[0];
			$scope.fileName = element.files[0].name;
		}

		$scope.openFileWindow = function() {
			angular.element('#fileUpload').trigger('click');
		  }

		function message(message){
			ngToast.create(message);
		}
	})
	.controller('LoginCtrl', function ($scope, $uibModal) {
		console.log('LoginCtrl')
	})
	.controller('RegisterCtrl', function ($scope, $uibModal) {
		console.log('RegisterCtrl')
	})

	