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
				controller: 'HomeCtrl',
				controllerAs: 'home'
			  })
			.state('login', {
				url : '/login',
				templateUrl: 'views/login.html',
				controller: 'LoginCtrl',
				controllerAs: 'login'
			})
			.state('register', {
				url : '/register',
				templateUrl: 'views/register.html',
				controller: 'RegisterCtrl',
				controllerAs: 'register'
			})
			.state('forgot', {
				url : '/forgot',
				templateUrl: 'views/forgot.html',
				controller: 'ForgotCntrl',
				controllerAs: 'forgot'
			})
			.state('dashboard', {
				url : '/dashboard',
				templateUrl: 'views/dashboard.html',
				controller: 'Dashboard',
				controllerAs: 'dashboard'
			})
			.state('notice', {
				url : '/notice',
				templateUrl: 'views/notice.html',
				controller: 'Notice',
				controllerAs: 'notice'
			})
			.state('logout', {
				url : '/logout',
				templateUrl: 'views/login.html',
				controller: 'LogoutCntrl',
				controllerAs: 'logout'
			})
			.state('classroom', {
				url : '/classroom',
				templateUrl: 'views/classroom.html',
				controller: 'ClassroomCntrl',
				controllerAs: 'classroom'
			})
			.state('course', {
				url : '/courseframework',
				templateUrl: 'views/courseframework.html',
				controller: 'CourseframeworkCntrl',
				controllerAs: 'Courseframework'
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
	.run(function($rootScope, $location, $state,$timeout){
		$rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){
			var privateUrl = ['/home','/notice','/classroom'];
			if(privateUrl.indexOf(toState.url) > -1 && window.sessionStorage["user"]){
				//$timeout(function(){
					console.log("from heder")
					
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