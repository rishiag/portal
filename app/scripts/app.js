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
		'pdf',
		'chart.js'
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
			})
			.state('e-resources', {
				url : '/e-resources',
				templateUrl: 'views/e-resources.html',
				controller: 'EresourcesCntrl'
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
	.directive('starRating', function () {
		return {
			restrict: 'A',
			template: '<ul class="rating" id="{{starId}}" abc="{{count}}">' +
				'<li ng-repeat="star in stars" ng-class="star " ng-click="ratingFlag && toggle($index)" >' +
				'\u2605' +
				'</li>' +
				'</ul>',
			scope: {
				ratingValue: '=',
				ratingFlag : '=',
				starId : '=',
				max: '=',
				onRatingSelected: '&'
			},
			controller : ['$scope','$rootScope', function ($scope,$rootScope) {
				$scope.rating = 0;
				//$scope.count = 0;
				$scope.getSelectedRating = function (rating) {
					//console.log('eeeeeeeeee',rating);
				}
			}],
			link: function (scope, elem, attrs) {
				//scope.count = 0;
				var updateStars = function () {
					scope.stars = [];
					scope.count = 0;
					for (var i = 0; i < scope.max; i++) {
						scope.count = i < scope.ratingValue ? scope.count+1 : scope.count;
						scope.stars.push({
							filled: i < scope.ratingValue
						});
					}
					scope.getSelectedRating(scope.count);
				};
	
				scope.toggle = function (index) {
					scope.ratingValue = index + 1;
					scope.onRatingSelected({
						rating: index + 1
					});
				};
	
				scope.$watch('ratingValue', function (oldVal, newVal) {
					if (newVal) {
						updateStars();
					}
				});
			}
		}
	})
	.service('broadcastService', function($rootScope, $log) {
		this.broadcast = function(eventName, payload) {
			$log.info('broadcasting: ' + eventName + payload);
			console.log("from broadcast service")
			$rootScope.$broadcast(eventName, payload);
		};
	})
	.directive('footerDirective', function(broadcastService, $log) {
		return {
			restrict: 'E',
			templateUrl:'views/footer.html',
			link: function(scope, elm, attr) {
				elm.hide();
				scope.$on('ShowFooter', function(payload) {
					$log.info('payload received');
					$log.debug(payload);
					// assuming you have jQuery
					elm.show();
				});
				scope.$on('HideFooter', function() {
					// assuming you have jQuery
					elm.hide();
				});
			}
		}
	})
	.directive('headerDirective', function(broadcastService, $log,) {
		return {
			restrict: 'E',
			templateUrl:'views/top-bar.html',
			link: function(scope, elm, attr) {
				elm.hide();
				scope.$on('ShowFooter', function(payload) {
					console.log("from directicve")
					$log.info('payload received');
					$log.debug(payload);
					// assuming you have jQuery
					elm.show();
				});
				scope.$on('HideFooter', function() {
					// assuming you have jQuery
					elm.hide();
				});
			}
		}
	})
	.service('apiCheck', ['$location',function($location) {
		this.request = function(config) {
			if(window.sessionStorage && window.sessionStorage.user && config.url.indexOf('/api') > -1){
				config.headers['x-access-token']= JSON.parse(window.sessionStorage.user).token
			}
			return config;
		};
	
		this.response = function(response) {
		  if( response && response.data && response.data.status && response.data.status == 403){
			 window.location.href = '/logout';
		  }else
				   return response ;
		}
	}])
	.run(function($rootScope, $location, $state,$timeout,$http){
		$rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams,broadcastService){
			//console.log('from state change...',toState.url);
			$http.pendingRequests.forEach(function(request) {
				console.log('from pending......',request)
				if (request.cancel) {
					request.cancel.resolve();
				}
			});
			var privateUrl = ['/home','/notice','/classroom','/courseframework','/club-society','/leave','/clubs-society'];
			if(privateUrl.indexOf(toState.url) > -1 && window.sessionStorage["user"]){
				
					
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