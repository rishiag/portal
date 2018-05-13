'use strict';

/**
 * @ngdoc function
 * @name testApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the testApp
 */
angular.module('testApp')
	.controller('HomeCtrl', function ($scope, $uibModal) {
		console.log('HomeCtrl')
	})
	.controller('LoginCtrl', function ($scope, $uibModal) {
		console.log('LoginCtrl')
	})
	.controller('RegisterCtrl', function ($scope, $uibModal) {
		console.log('RegisterCtrl')
	})