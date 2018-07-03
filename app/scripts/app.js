'use strict';

/**
 * @ngdoc overview
 * @name testApp
 * @description
 * # testApp
 *
 * Main module of the application.
 */
angular
	.module('testApp', [
		'ui.router',
		'ngAnimate',
		'ngCookies',
		'ngResource',
		'ngSanitize',
		'ngTouch',
		'ui.bootstrap',
		'ngTagsInput',
		'ngFileUpload',
		'ngToast',
		'pdf'
	])
	.config(function($stateProvider, $locationProvider,$urlRouterProvider) {
		$stateProvider
			.state('home', {
				url: "/home",
				templateUrl: 'views/home.html',
				controller: 'HomeCtrl'
			  })
			.state('login', {
				url : '/login',
				templateUrl: 'views/login.html',
				controller: 'LoginCtrl'
			})
			.state('register', {
				url : '/register',
				templateUrl: 'views/register.html',
				controller: 'RegisterCtrl'
			})
			.state('forgot', {
				url : '/forgot',
				templateUrl: 'views/forgot.html',
				controller: 'ForgotCntrl'
			})
			.state('notice', {
				url : '/notice',
				templateUrl: 'views/notice.html',
				controller: 'Notice'
			})
			.state('logout', {
				url : '/logout',
				templateUrl: 'views/login.html',
				controller: 'LogoutCntrl'
			})
			.state('classroom', {
				url : '/classroom',
				templateUrl: 'views/classroom.html',
				controller: 'ClassroomCntrl'
			})
			.state('course', {
				url : '/courseframework',
				params : {
					username : null
				},
				templateUrl: 'views/courseframework.html',
				controller: 'CourseframeworkCntrl'
			})
			.state('club', {
				url : '/clubs-society',
				templateUrl: 'views/club.html',
				controller: 'ClubCntrl'
			})
			.state('leave', {
				url : '/leave',
				templateUrl: 'views/leave.html',
				controller: 'LeaveCntrl'
			});
			$urlRouterProvider.otherwise('/login')
			$locationProvider.html5Mode(true);
	})
	.config(['$qProvider', function ($qProvider) {
		$qProvider.errorOnUnhandledRejections(false);
	}])
	.config(function($httpProvider, $httpParamSerializerJQLikeProvider) {
		$httpProvider.defaults.transformRequest.unshift($httpParamSerializerJQLikeProvider.$get());
		$httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded; charset=utf-8';
	})
	.config(['ngToastProvider', function(ngToast) { 
		ngToast.configure({ horizontalPosition: 'center', 
			maxNumber: 1, 
			animation: 'slide',
			dismissButton : true,
			timeout : 3000
		}); 
	}])
	.config(['$httpProvider',function($httpProvider) {
		$httpProvider.interceptors.push('apiCheck');
	}])
	.service('apiCheck', ['$location',function($location) {
		this.request = function(config) {
			if(window.sessionStorage && window.sessionStorage.user && config.url.indexOf('/api') > -1){
				config.headers['x-access-token']= JSON.parse(window.sessionStorage.user).token
			}
			return config;
		};
	
		this.response = function(response) {
		  if( response && response.data && response.data.status && response.data.status == 403){
			console.log(response)	 
			// window.location.href = '/logout';
		  }else
				   return response ;
		}
	}])
	.run(function($rootScope, $location, $state,$timeout,$http){
		$rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){
			//console.log('from state change...',toState.url);
			$http.pendingRequests.forEach(function(request) {
				console.log('from pending......',request)
				if (request.cancel) {
					request.cancel.resolve();
				}
			});
			var privateUrl = ['/home','/notice','/classroom','/courseframework','/club-society','/leave','/clubs-society'];
			if(privateUrl.indexOf(toState.url) > -1 && window.sessionStorage["user"]){
				//$timeout(function(){
				//	console.log("from heder")
					
				//},2)
				$rootScope.loggedin = true;	
				//console.log(JSON.parse(window.sessionStorage.user))
				$rootScope.userName = JSON.parse(window.sessionStorage.user).name;
				// $timeout(function(){
				// 	$('.header-class').removeClass("top-two-header");
				// })
				//window.location.href = '/login';
			}else if(privateUrl.indexOf(toState.url) > -1 && !window.sessionStorage["user"]){
				$('.header-class').addClass("top-two-header");
				$location.path('/login');
			}
		})
	})