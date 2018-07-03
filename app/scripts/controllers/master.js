'use strict';

/**
 * @ngdoc function
 * @name testApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the testApp
 */
angular.module('testApp')
	.directive('carousel', function ($timeout) {
		return {
			restrict: 'E',
			scope: {
				links: '='
			},
			templateUrl: 'views/carousel.html',
			link: function (scope, element) {
				$timeout(function () {
					$('.carousel-indicators li', element).first().addClass('active');
					$('.carousel-inner .item', element).first().addClass('active');
				});
			}
		}
	})
	.directive('player', ['$sce', '$compile', function ($sce, $compile) {
		'use strict';
		return {
			restrict: 'E',
			link: function (scope, element, attrs) {
				var video = element.find('video');
				element.addClass('player');
				//video[0].controls = false;
				scope.playing = false;
				scope.trustSrc = function (src) {
					return $sce.trustAsResourceUrl(src);
				}

				video.on('timeupdate', function (e) {
					scope.$apply(function () {
						scope.percent = (video[0].currentTime / video[0].duration) * 100;
					});
				});

				scope.frame = function (num) {
					if (video[0].readyState !== 0) {
						video[0].currentTime += num;
					}
				};

				scope.toggle = function () {
					// if(!video[0].controls)
					// 	video[0].controls = true;
					if (video[0].paused === true) {
						video[0].play();
						scope.playing = true;
					} else {
						video[0].pause();
						scope.playing = false;
					}
				};



				scope.$watch('videos', function (newVal, oldVal) {
					if (newVal && newVal !== oldVal) {
						$compile(element)(scope);
					}
				});
				if (video)
					video[0].play();
			},
			template: '<video preload="none" poster="{{ trustSrc(videos[0].poster) }}" controls>' +
				'<source ng-repeat="item in videos" ng-src="{{ trustSrc(item.src) }}" type="video/{{ item.type }}" />' +
				'<track kind="captions" ng-src="{{ trustSrc(videos[0].captions) }}" srclang="en" label="English" />' +
				'</video>'

			// '<div class="noselect" controls>' +
			// '<a ng-click="frame(-0.04)">&lt;</a>' +
			// '<a ng-click="toggle()"> <span ng-show="!playing">&#9654;</span><span ng-show="playing">&#9616;&#9616;</span> </a>' +
			// '<a ng-click="frame(0.04)">&gt;</a>' +
			// '</div>'
		};
	}])
	.controller('HomeCtrl', function ($scope, $uibModal, BackendService, ngToast, Upload, $filter, $rootScope, $location, $timeout, $compile) {
		$('.header-class').removeClass("top-two-header");
		// $scope.trainingArr = [];
		// 						{fileName : 'Minute to minute program of Mr bipin rawat'},
		// 						{fileName : 'Minute to minute program of Mr bipin rawat'}];

		// $scope.notices = [];
		// 						{fileName : 'Minute to minute program of Mr bipin rawat'},
		// 						{fileName : 'Minute to minute program of Mr bipin rawat'}];

		$scope.fileAvailable = false;
		$scope.videoAvailable = false;

		BackendService.getNotifications().then(function (response) {
			var folderName = 'notice-files/';
			if (response.status == 200) {
				$scope.notices = response.data;
				$scope.unread = 0;
				$scope.notices.forEach(function (item) {
					if (item.status == 'unread')
						$scope.unread = $scope.unread + 1;
					item.time = new Date(item.createdAt).setHours(0, 0, 0, 0) == new Date().setHours(0, 0, 0, 0) ? new Date(item.createdAt).toLocaleTimeString().replace(/:\d{2}\s/, ' ') : ($filter('date')(item.createdAt)).split(',')[0];
					item.subjectToShow = item.subject ? (item.subject.length > 50 ? item.subject.substring(0, 50) + '...' : item.subject) : item.subject.substring(0, 50) + '...';
					if (item.fileName)
						item.fileName = folderName + item.fileName;
					//$scope.notices.push(item);
				});



				$scope.noNoticeAvailableMeassage = 'No Official Notice Available.';
			}
		})

		BackendService.getBirthAndEvent('?email=' + JSON.parse(window.sessionStorage.user).email + (JSON.parse(window.sessionStorage.user).groupName ? '&group_name=' + JSON.parse(window.sessionStorage.user).groupName : '')).then(function (response) {
			//console.log(response)
			if (response.status == 200) {
				$scope.birthdays = response.data.birthdays;
				if ($scope.birthdays.length > 0 && $scope.birthdays[0].month == new Date().getMonth() + 1 && $scope.birthdays[0].day == new Date().getDay()) {
					$scope.adv = '';
					$scope.bname = $scope.birthdays[0].name;
				} else if ($scope.birthdays.length > 0) {
					$scope.adv = 'Advance ';
					$scope.bname = $scope.birthdays[0].name;
				} else {
					$scope.adv = '';
				}
				$scope.events = response.data.events;
			}
		})

		BackendService.getTrainingMaterialHome().then(function (response) {
			if (response.status == 200) {
				$scope.trainingArr = response.data;
			}
		});


		$scope.callFromHome = function (obj, url) {
			$rootScope[url] = obj;
			$('.ul-sub-menu li.active').removeClass('active');
			$('#' + url).addClass('active');
			$location.url('/' + url);
		}
	})
	.controller('LoginCtrl', function ($scope, ngToast, $location, BackendService, $rootScope) {
		$('.header-class').addClass("top-two-header");
		sessionStorage.clear();
		$rootScope.loggedin = false;
		$scope.links = [
			{ src: "http://www.conceptcarz.com/images/Suzuki/suzuki-concept-kizashi-3-2008-01-800.jpg", alt: "", caption: "" },
			{ src: "http://www.conceptcarz.com/images/Volvo/2009_Volvo_S60_Concept-Image-01-800.jpg", alt: "", caption: "" },
			{ src: "http://www.sleepzone.ie/uploads/images/PanelImages800x400/TheBurren/General/sleepzone_hostels_burren_800x400_14.jpg", alt: "", caption: "" },
		];

		$scope.displayPopup = function (f, b) {

			$('#pwd').popover('toggle');
		}

		$scope.displayPopup1 = function (f, b) {
			$('#pwd').popover('hide');
		}
		$scope.loginF = function () {
			if (!$scope.email || $scope.email == '')
				return message('Please enter email', ngToast);
			else if (!$scope.passwd || $scope.passwd == '')
				return message('Please enter password', ngToast)
			else
				BackendService.login({ email: $scope.email, passwd: $scope.passwd }).then(function (response) {
					if (response.status == 200) {
						window.sessionStorage.user = JSON.stringify(response.data);
						$rootScope.loggedin = true;
						$rootScope.userName = response.data.name;
						$location.url('/home');
					}
					else
						return message(response.message, ngToast);
				})
		}
	})
	.controller('ForgotCntrl', function ($scope, ngToast, $location, BackendService) {
		$('.header-class').addClass("top-two-header");
		$scope.forgotP = function () {
			if (!$scope.email || $scope.email == '')
				return message('Please enter email', ngToast);
			else
				BackendService.forgot({ email: $scope.email }).then(function (response) {
					if (response.status == 200) {
						message('Password sent to your mail');
						$location.path('/login');
					}
					else
						return message(response.message, ngToast);
				})
		}
	})
	.controller('LogoutCntrl', function ($scope, $location, $rootScope) {
		$('.header-class').addClass("top-two-header");
		sessionStorage.clear();
		$rootScope.loggedin = false;
		$location.path("/login");
	})
	.controller('RegisterCtrl', function ($scope, $location, $rootScope, BackendService, ngToast) {
		$('.header-class').addClass("top-two-header");
		sessionStorage.clear();
		$rootScope.loggedin = false;
		$scope.signup = function () {
			if (!$scope.name || $scope.name == '')
				return message('Please enter name', ngToast);
			if (!$scope.email || $scope.email == '')
				return message('Please enter email', ngToast);
			else if (!$scope.passwd || $scope.passwd == '')
				return message('Please enter password', ngToast)
			else
				BackendService.register({ email: $scope.email, passwd: $scope.passwd, name: $scope.name }).then(function (response) {
					if (response.status == 200) {
						message('You are successfully registerd', ngToast, $location.url('/login'))
					}
					else
						return message(response.message, ngToast);
				})
		}

	})
	.controller('Dashboard', function ($scope, $location) {
		$('.header-class').removeClass("top-two-header");
		$('.ul-sub-menu').click(function (evt) {
			$('.ul-sub-menu li.active').removeClass('active');
			$('#' + evt.target.id).addClass('active');
		})
		$scope.callOption = function (path, event) {
			//console.log('calloption....',path,event);
			$location.path('/' + path);
			//window.location.href = '/'+path;
		}
	})
	.controller('Notice', function ($scope, BackendService, $location, ngToast, Upload, $filter, $timeout, $rootScope) {
		$('.header-class').removeClass("top-two-header");
		BackendService.getTags().then(function (response) {
			if (response.status == 200) {
				$scope.allTags = response.data;
			}
		});

		BackendService.getNotifications($rootScope.notice ? ('&notificationHash=' + $rootScope.notice._id) : null).then(function (response) {
			var folderName = 'notice-files/';
			$scope.personal = [];
			$scope.official = [];
			console.log(response)
			if (response.status == 200) {
				$scope.notices = response.data;
				$scope.notices.forEach(function (item) {
					item.time = new Date(item.createdAt).setHours(0, 0, 0, 0) == new Date().setHours(0, 0, 0, 0) ? new Date(item.createdAt).toLocaleTimeString().replace(/:\d{2}\s/, ' ') : $filter('date')(item.createdAt);
					//	item.fileNameToShow = item.subject.substring(0,20)+'...'// ? item.fileName.substring(0,20)+'......' : +'......';
					item.subjectToShow = item.subject ? (item.subject.length > 40 ? item.subject.substring(0, 40) + '...' : item.subject) : item.subject.substring(0, 40) + '...';
					if (item.fileName)
						item.fileName = folderName + item.fileName;
					if (item.notificationType == 'personal')
						$scope.personal.push(item);
					else
						$scope.official.push(item);
				});
				$scope.commonArr = $scope.official;

				if ($rootScope.notice) {
					//console.log('notice from home....',$rootScope.notice);
					$scope.activateNotice($rootScope.notice.notificationType, $rootScope.notice);
				} else {
					if ($scope.commonArr.length > 0)
						if ($scope.commonArr[0].content.length >= 1) {
							$scope.fileAvailable = false;
							$scope.textToShow = $scope.commonArr[0].content;
							$scope.sender = $scope.commonArr[0].creator;
							$scope.subject = $scope.commonArr[0].subject;
							$scope.fileAttached = $scope.commonArr[0].fileName ? $scope.commonArr[0].fileName : null;
						} else {
							$scope.fileAvailable = true;
							$scope.pdfUrl = $scope.commonArr[0].fileName;
						}
					else
						$scope.noNoticeAvailableMeassage = 'No Official Notice Available.';
					$scope.officialTotal = $scope.official.length;
					$scope.personalTotal = $scope.personal.length;
					$timeout(function () {
						if ($scope.commonArr.length > 0)
							$('#' + $scope.commonArr[0]._id).addClass('notice-active');
					})
				}
			}
		})

		$scope.publishOptions = ['Immediately', 'Later'];
		$scope.selectedPublish = $scope.publishOptions[0];

		$scope.tags = [];
		var creator = JSON.parse(window.sessionStorage.user).email;

		$scope.loadTags = function (query) {
			return $scope.allTags.filter(o => o.text.toLowerCase().indexOf(query.toLowerCase()) > -1);
		};

		$scope.sendEmail = function () {

			if ($scope.subject == '' || !$scope.subject)
				return message('Please enter notice heading', ngToast);
			if ($scope.tags.length == 0)
				return message('Please enter address', ngToast);
			else if ($scope.content == '' || !$scope.content)
				return message('Please write some content', ngToast);
			else {

				var to = [];
				$scope.tags.forEach(function (tag) {
					to.push(tag.text);
				})
				Upload.upload({
					url: '/api/notification',
					data: {
						to: to,
						subject: $scope.subject,
						content: $scope.content,
						file: $scope.file ? $scope.file : null,
						publishOn: $scope.selectedPublish,
						creator: creator
					}
				}).then(function (resp) {
					$scope.file = null;
					$scope.tags = [];
					$scope.subject = '';
					$scope.content = '';
					$scope.fileName = '';
					if (resp.status == 200)
						return message('Mail successfully sent....', ngToast);
					else
						return message(response.message, ngToast);
				}, function (resp) {
					console.log('Error status: ' + resp.status);
				}, function (evt) {
					var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
					console.log('progress: ' + progressPercentage + '% ');
				});
			}
		}

		$scope.upload = function (element) {
			//console.log(element.files[0]);
			$scope.file = element.files[0];
			$scope.fileName = element.files[0].name;
		}

		$scope.openFileWindow = function () {
			angular.element('#fileUpload').trigger('click');
		}



		$('.ul-sub-menu1').click(function (evt) {
			$('.ul-sub-menu1 li.active-bottom').removeClass('active-bottom');
			$('#' + evt.target.id).addClass('active-bottom');
		});

		$scope.activateNotice = function (type, notice) {
			//console.log(type,notice)
			//$scope.fileAttached = null;
			if (notice) {
				$scope.commonArr = notice.notificationType == 'official' ? $scope.official : $scope.personal;
				$('.ul-sub-menu1 li.active-bottom').removeClass('active-bottom');
				$('#' + type).addClass('active-bottom');
				$scope.openNotice(notice, notice.content.length >= 1 ? true : false, notice._id)
			} else {
				if (type == 'personal')
					$scope.commonArr = $scope.personal;
				else
					$scope.commonArr = $scope.official;
				if ($scope.commonArr.length > 0 && $scope.commonArr[0].content.length >= 1) {
					$scope.fileAvailable = false;
					$scope.textToShow = $scope.commonArr[0].content;
					$scope.sender = $scope.commonArr[0].creator;
					$scope.subject = $scope.commonArr[0].subject;
					$scope.fileAttached = $scope.commonArr[0].fileName ? $scope.commonArr[0].fileName : null;
				} else if ($scope.commonArr.length > 0 && $scope.commonArr[0].fileName) {
					$scope.fileAvailable = true;
					$scope.pdfUrl = $scope.commonArr[0].fileName;
					//$('#'+$scope.commonArr[0]._id).addClass('notice-active');
				} else {
					$scope.noNoticeAvailableMeassage = 'No ' + type + ' Notice Available.';
				}
			}




			//	console.log($scope.commonArr[0]._id)
			$timeout(function () {
				if ($scope.commonArr.length > 0 && !$rootScope.notice)
					$('#' + $scope.commonArr[0]._id).addClass('notice-active');
				else
					$rootScope.notice = null;
			})
		}

		$scope.openNotice = function (link, fileOrText, id) {
			//console.log('hhhhh',link,fileOrText,id)
			$timeout(function () {
				$('.notice-link').removeClass('notice-active');
				$('#' + id).addClass('notice-active');
			})
			if (fileOrText) {
				$scope.fileAvailable = false;
				$scope.textToShow = link.content;
				$scope.sender = link.creator;
				$scope.subject = link.subject;
				$scope.fileAttached = link.fileName ? link.fileName : null;
			} else {
				$scope.fileAvailable = true;
				$scope.pdfUrl = link.fileName;
			}
		}
	})
	.controller('ClassroomCntrl', function ($scope, $location, $window, $sce, BackendService, $rootScope, $timeout) {
		$('.header-class').removeClass("top-two-header");
		$scope.fileAvailable = false;
		$scope.videoAvailable = false;
		$scope.displayAreaFlag = true;
		$('.ul-sub-menu1').click(function (evt) {
			$('.ul-sub-menu1 li.active-bottom').removeClass('active-bottom');
			$('#' + evt.target.id).addClass('active-bottom');
		});

		// BackendService.getBatch().then(function(response){
		// 	console.log('getBatch',response);
		// 	if(response.status == 200){
		// 		$scope.batchArr = response.data;
		// 		$scope.batch = $scope.batchArr[0];
		// 	}
		// });

		//getTrainingMaterial
		BackendService.getTraining($rootScope.classroom ? $rootScope.classroom.subject : null).then(function (response) {
			if (response.status == 200) {
				$scope.activeTab = 'training';
				$scope.training = response.data.training ? response.data.training : [];
				$scope.session = response.data.session ? response.data.session : [];
				$scope.sessionSubjects = response.data.sessionSubjects;
				$scope.trainingSubjects = response.data.trainingSubjects;
				if ($rootScope.classroom) {
					//console.log($rootScope.classroom)
					$scope.weeks = ($scope.training.find(o => o.name === $rootScope.classroom.subject)).children;
					//$scope.weeks = $scope.training[0].children;
					$scope.subjectOptions = $scope.trainingSubjects;
					$scope.selectedSubject = $rootScope.classroom.subject;
					$scope.toggleWeek(null, null, null, $rootScope.classroom);

				} else {
					$scope.weeks = $scope.training[0].children;
					$scope.subjectOptions = $scope.trainingSubjects;
					$scope.selectedSubject = $scope.training[0].name;
				}
			}
		});

		$scope.subjectChanged = function () {
			$('.load-wait').removeClass('.loading');

			$scope.displayAreaFlag = true;
			$scope.fileAvailable = false;
			$scope.pdfUrl = null;
			$scope.videoAvailable = false;

			if ($scope.activeTab == 'training')
				$scope.training.forEach(function (subject) {
					if (subject.name == $scope.selectedSubject) {
						$scope.weeks = subject.children;
					}
				});
			else
				$scope.session.forEach(function (subject) {
					if (subject.name == $scope.selectedSubject) {
						$scope.weeks = subject.children;
					}
				});
		}

		$scope.activateTrainingOrSession = function (tab) {
			$scope.displayAreaFlag = true;
			$scope.fileAvailable = false;
			$scope.pdfUrl = null;
			$scope.videoAvailable = false;
			$scope.activeTab = tab;
			if (tab == 'training') {
				$scope.weeks = $scope.training && $scope.training.length > 0 ? $scope.training[0].children : [];
				$scope.activeTab = 'training';
				$scope.subjectOptions = $scope.trainingSubjects;
				$scope.selectedSubject = $scope.training[0].name;
			} else {
				$scope.weeks = $scope.session && $scope.session.length > 0 ? $scope.session[0].children : [];
				$scope.activeTab = 'session';
				$scope.subjectOptions = $scope.sessionSubjects;
				$scope.selectedSubject = $scope.session[0].name;
			}
			if ($scope.weeks.length > 0) {
				$scope.disableSelectSubject = false;
			} else {
				//console.log('from no week')
				$scope.disableSelectSubject = true
				$scope.selectedSubject = 'No subject Available';
				$scope.subjectOptions = ['No subject Available'];
			}

		}


		// $scope.callOption = function(path,event){
		// 	$location.url('/'+path)
		// }


		//$scope.selectedSubject = $scope.subjectOptions[0];
		$scope.toggleWeek = function (id, titleFromRoot, obj, objFromHome) {
			$rootScope.classroom = null;
			var toggleForWeek = function (id) {

				$timeout(function () {
					var x = document.getElementById(id);
					//console.log(x)
					if (x.style.display === "none") {
						x.style.display = "block";
					} else {
						x.style.display = "none";
					}
					var y = document.getElementsByClassName(id);
					if (y[0].className.indexOf('up') > -1) {
						//console.log("from uup")
						$('.' + id).removeClass('fas fa-chevron-up')
						$('.' + id).addClass('fas fa-chevron-down')
					} else {
						$('.' + id).removeClass('fas fa-chevron-down')
						$('.' + id).addClass('fas fa-chevron-up')
					}
				}, 10)
			}

			if (objFromHome && objFromHome.listOfFolders) {
				for (var i = 0; i < objFromHome.listOfFolders.length; i++) {
					(function (i) {
						//console.log('from foreach',objFromHome.listOfFolders)
						toggleForWeek(objFromHome.listOfFolders[i]);
						if (i == objFromHome.listOfFolders.length - 1) {
							$scope.openMaterial({ link: objFromHome.path, title: objFromHome.title })
						}

					}(i))
				}
			} else {
				toggleForWeek(id)
			}

		}



		$scope.onLoad = function () {
			$scope.loadingPdf = false;
		}

		$scope.openMaterial = function (obj) {
			$rootScope.classroom = null;
			$scope.displayAreaFlag = false;
			var extArr = obj.link.split('.');
			//console.log('extArr',extArr)
			if (extArr[extArr.length - 1] == 'pdf') {
				$scope.loadingPdf = true;
				$scope.videos = [];
				$scope.fileAvailable = true;
				$scope.videoAvailable = false;
				$scope.pdfUrl = obj.link;
			}
			else if (extArr[extArr.length - 1] == 'ppt')
				console.log('ppt');
			else {
				$scope.fileAvailable = false;
				$scope.videoAvailable = true;
				$scope.videos = [{ "type": "mp4", "src": obj.link, "poster": "http://www.videojs.com/img/poster.jpg", "captions": "http://www.videojs.com/vtt/captions.vtt" }];
			}

			$timeout(function () {
				$('.material-link').removeClass('training-material-active');
				$('#' + obj.id).addClass('training-material-active');
			})
		}


	})
	.controller('CourseframeworkCntrl', function ($scope, ngToast, $location, BackendService, Upload, $timeout, $stateParams) {

		$scope.facultyArr = [{
			firstName: 'Chirag',
			lastName: 'Gupta',
			typeOfFaculty: 'Guest',
			designation: 'Pr. DGIT',
			location: 'National Academy of Direct Taxes',
			officeAddress: 'NADT, Chhindwara Road, Nagpur-440030',
			mailingAddress: 'NADT, Chhindwara Road, Nagpur-440030',
			contact: {
				phone: '9988454538',
				fax: ''
			},
			email: 'dg@nadt.gov.in',
			profileDesc: "Dr. Pushpinder Singh Puniha is an IRS officer of the 39th Batch. He did his schooling from Delhi Public School, R.K. Puram, New Delhi. In the 1979 CBSE Examination of 10+2, he secured 9th position in the All India Merit List. He has graduated from St. Stephen's College, Delhi University with Hons. in Economics in 1982 and did an MA in Economics from Delhi School of Economics. He also holds a master's degree in Public Policy from University of Southern California, Los Angeles, U.S.A. He is also an awardee of Ph.D degree in Development Finance from Sol Price School of Public Policy, University of Southern California, USA. In the Department, he has long years of experience in Assessment, Administration, Appeals and Investigation divisions. He has been posted at Ludhiana, Chandigarh, New Delhi, Bangalore and Mumbai in the department. He has published 7 articles and papers and one book chapter in an international publication. He has also edited the CBDT's Investigation report for the last five years. Dr. Pushpinder Singh Puniha is married to Mrs. Harinder and they have two sons, Uday and Abhay.",
			areaOfSpecializaion: '',
			comments: '',
			isStudent: false,
			batchName: '',
			gender: '',
			dob: '',
			maritalStatus: '',
			eduQualification: '',
			hometown: '',
			state: '',
			profilePic: 'profile-images/abc.jpeg'
		}, {
			firstName: 'Pankaj',
			lastName: 'Gupta',
			typeOfFaculty: 'Guest',
			designation: 'Pr. DGIT',
			location: 'National Academy of Direct Taxes',
			officeAddress: 'NADT, Chhindwara Road, Nagpur-440030',
			mailingAddress: 'NADT, Chhindwara Road, Nagpur-440030',
			contact: {
				phone: '07125623',
				fax: ''
			},
			email: 'dg@nadt.gov.in',
			profileDesc: "Dr. Pushpinder Singh Puniha is an IRS officer of the 39th Batch. He did his schooling from Delhi Public School, R.K. Puram, New Delhi. In the 1979 CBSE Examination of 10+2, he secured 9th position in the All India Merit List. He has graduated from St. Stephen's College, Delhi University with Hons. in Economics in 1982 and did an MA in Economics from Delhi School of Economics. He also holds a master's degree in Public Policy from University of Southern California, Los Angeles, U.S.A. He is also an awardee of Ph.D degree in Development Finance from Sol Price School of Public Policy, University of Southern California, USA. In the Department, he has long years of experience in Assessment, Administration, Appeals and Investigation divisions. He has been posted at Ludhiana, Chandigarh, New Delhi, Bangalore and Mumbai in the department. He has published 7 articles and papers and one book chapter in an international publication. He has also edited the CBDT's Investigation report for the last five years. Dr. Pushpinder Singh Puniha is married to Mrs. Harinder and they have two sons, Uday and Abhay.",
			areaOfSpecializaion: '',
			comments: '',
			isStudent: false,
			batchName: '',
			gender: '',
			dob: '',
			maritalStatus: '',
			eduQualification: '',
			hometown: '',
			state: '',
			profilePic: 'profile-images/aa.jpg'
		}, {
			firstName: 'Ashish',
			lastName: 'Gupta',
			typeOfFaculty: 'In house faculty',
			designation: 'Deputy Director, ACD NADT, Nagpur',
			officeAddress: 'Course Director (71st Batch IRS), NADT Nagpur',
			mailingAddress: 'Room No. 215, Admin Building, NADT Nagpur',
			contact: {
				phone: '0712589999',
				fax: ''
			},
			email: 'dg@nadt.gov.in',
			profileDesc: "Dr. Pushpinder Singh Puniha is an IRS officer of the 39th Batch. He did his schooling from Delhi Public School, R.K. Puram, New Delhi. In the 1979 CBSE Examination of 10+2, he secured 9th position in the All India Merit List. He has graduated from St. Stephen's College, Delhi University with Hons. in Economics in 1982 and did an MA in Economics from Delhi School of Economics. He also holds a master's degree in Public Policy from University of Southern California, Los Angeles, U.S.A. He is also an awardee of Ph.D degree in Development Finance from Sol Price School of Public Policy, University of Southern California, USA. In the Department, he has long years of experience in Assessment, Administration, Appeals and Investigation divisions. He has been posted at Ludhiana, Chandigarh, New Delhi, Bangalore and Mumbai in the department. He has published 7 articles and papers and one book chapter in an international publication. He has also edited the CBDT's Investigation report for the last five years. Dr. Pushpinder Singh Puniha is married to Mrs. Harinder and they have two sons, Uday and Abhay.",
			areaOfSpecializaion: '',
			comments: '',
			isStudent: false,
			batchName: '',
			gender: '',
			dob: '',
			maritalStatus: '',
			eduQualification: '',
			hometown: '',
			state: '',
			profilePic: 'profile-images/ab.jpg'
		}, {
			firstName: 'Abdul',
			lastName: 'Hannan',
			typeOfFaculty: 'Guest',
			designation: 'Pr. DGIT',
			location: 'National Academy of Direct Taxes',
			officeAddress: 'NADT, Chhindwara Road, Nagpur-440030',
			mailingAddress: 'NADT, Chhindwara Road, Nagpur-440030',
			contact: {
				phone: '0712992871',
				fax: ''
			},
			email: 'dg@nadt.gov.in',
			profileDesc: "Dr. Pushpinder Singh Puniha is an IRS officer of the 39th Batch. He did his schooling from Delhi Public School, R.K. Puram, New Delhi. In the 1979 CBSE Examination of 10+2, he secured 9th position in the All India Merit List. He has graduated from St. Stephen's College, Delhi University with Hons. in Economics in 1982 and did an MA in Economics from Delhi School of Economics. He also holds a master's degree in Public Policy from University of Southern California, Los Angeles, U.S.A. He is also an awardee of Ph.D degree in Development Finance from Sol Price School of Public Policy, University of Southern California, USA. In the Department, he has long years of experience in Assessment, Administration, Appeals and Investigation divisions. He has been posted at Ludhiana, Chandigarh, New Delhi, Bangalore and Mumbai in the department. He has published 7 articles and papers and one book chapter in an international publication. He has also edited the CBDT's Investigation report for the last five years. Dr. Pushpinder Singh Puniha is married to Mrs. Harinder and they have two sons, Uday and Abhay.",
			areaOfSpecializaion: '',
			comments: '',
			isStudent: false,
			batchName: '',
			gender: '',
			dob: '',
			maritalStatus: '',
			eduQualification: '',
			hometown: '',
			state: '',
			profilePic: 'profile-images/abc.jpeg'
		}, {
			firstName: 'Sagar',
			lastName: 'Gupta',
			typeOfFaculty: 'Guest',
			designation: 'Pr. DGIT',
			location: 'National Academy of Direct Taxes',
			officeAddress: 'NADT, Chhindwara Road, Nagpur-440030',
			mailingAddress: 'NADT, Chhindwara Road, Nagpur-440030',
			contact: {
				phone: '8812582871',
				fax: ''
			},
			email: 'dg@nadt.gov.in',
			profileDesc: "Dr. Pushpinder Singh Puniha is an IRS officer of the 39th Batch. He did his schooling from Delhi Public School, R.K. Puram, New Delhi. In the 1979 CBSE Examination of 10+2, he secured 9th position in the All India Merit List. He has graduated from St. Stephen's College, Delhi University with Hons. in Economics in 1982 and did an MA in Economics from Delhi School of Economics. He also holds a master's degree in Public Policy from University of Southern California, Los Angeles, U.S.A. He is also an awardee of Ph.D degree in Development Finance from Sol Price School of Public Policy, University of Southern California, USA. In the Department, he has long years of experience in Assessment, Administration, Appeals and Investigation divisions. He has been posted at Ludhiana, Chandigarh, New Delhi, Bangalore and Mumbai in the department. He has published 7 articles and papers and one book chapter in an international publication. He has also edited the CBDT's Investigation report for the last five years. Dr. Pushpinder Singh Puniha is married to Mrs. Harinder and they have two sons, Uday and Abhay.",
			areaOfSpecializaion: '',
			comments: '',
			isStudent: false,
			batchName: '',
			gender: '',
			dob: '',
			maritalStatus: '',
			eduQualification: '',
			hometown: '',
			state: '',
			profilePic: 'profile-images/abc.jpeg'
		}, {
			firstName: 'Aseem',
			lastName: 'dalal',
			typeOfFaculty: 'Guest',
			designation: 'Pr. DGIT',
			location: 'National Academy of Direct Taxes',
			officeAddress: 'NADT, Chhindwara Road, Nagpur-440030',
			mailingAddress: 'NADT, Chhindwara Road, Nagpur-440030',
			contact: {
				phone: '0712582822',
				fax: ''
			},
			email: 'dg@nadt.gov.in',
			profileDesc: "Dr. Pushpinder Singh Puniha is an IRS officer of the 39th Batch. He did his schooling from Delhi Public School, R.K. Puram, New Delhi. In the 1979 CBSE Examination of 10+2, he secured 9th position in the All India Merit List. He has graduated from St. Stephen's College, Delhi University with Hons. in Economics in 1982 and did an MA in Economics from Delhi School of Economics. He also holds a master's degree in Public Policy from University of Southern California, Los Angeles, U.S.A. He is also an awardee of Ph.D degree in Development Finance from Sol Price School of Public Policy, University of Southern California, USA. In the Department, he has long years of experience in Assessment, Administration, Appeals and Investigation divisions. He has been posted at Ludhiana, Chandigarh, New Delhi, Bangalore and Mumbai in the department. He has published 7 articles and papers and one book chapter in an international publication. He has also edited the CBDT's Investigation report for the last five years. Dr. Pushpinder Singh Puniha is married to Mrs. Harinder and they have two sons, Uday and Abhay.",
			areaOfSpecializaion: '',
			comments: '',
			isStudent: false,
			batchName: '',
			gender: '',
			dob: '',
			maritalStatus: '',
			eduQualification: '',
			hometown: '',
			state: '',
			profilePic: 'profile-images/abc.jpeg'
		}, {
			firstName: 'Rishi',
			lastName: 'Agarwal',
			typeOfFaculty: 'Guest',
			designation: 'Pr. DGIT',
			location: 'National Academy of Direct Taxes',
			officeAddress: 'NADT, Chhindwara Road, Nagpur-440030',
			mailingAddress: 'NADT, Chhindwara Road, Nagpur-440030',
			contact: {
				phone: '712582871',
				fax: ''
			},
			email: 'dg@nadt.gov.in',
			profileDesc: "Dr. Pushpinder Singh Puniha is an IRS officer of the 39th Batch. He did his schooling from Delhi Public School, R.K. Puram, New Delhi. In the 1979 CBSE Examination of 10+2, he secured 9th position in the All India Merit List. He has graduated from St. Stephen's College, Delhi University with Hons. in Economics in 1982 and did an MA in Economics from Delhi School of Economics. He also holds a master's degree in Public Policy from University of Southern California, Los Angeles, U.S.A. He is also an awardee of Ph.D degree in Development Finance from Sol Price School of Public Policy, University of Southern California, USA. In the Department, he has long years of experience in Assessment, Administration, Appeals and Investigation divisions. He has been posted at Ludhiana, Chandigarh, New Delhi, Bangalore and Mumbai in the department. He has published 7 articles and papers and one book chapter in an international publication. He has also edited the CBDT's Investigation report for the last five years. Dr. Pushpinder Singh Puniha is married to Mrs. Harinder and they have two sons, Uday and Abhay.",
			areaOfSpecializaion: '',
			comments: '',
			isStudent: false,
			batchName: '',
			gender: '',
			dob: '',
			maritalStatus: '',
			eduQualification: '',
			hometown: '',
			state: '',
			profilePic: 'profile-images/abc.jpeg'
		}, {
			firstName: 'PC',
			lastName: 'Yadav',
			typeOfFaculty: 'Guest',
			designation: 'Pr. DGIT',
			location: 'National Academy of Direct Taxes',
			officeAddress: 'NADT, Chhindwara Road, Nagpur-440030',
			mailingAddress: 'NADT, Chhindwara Road, Nagpur-440030',
			contact: {
				phone: '012582871',
				fax: ''
			},
			email: 'dg@nadt.gov.in',
			profileDesc: "Dr. Pushpinder Singh Puniha is an IRS officer of the 39th Batch. He did his schooling from Delhi Public School, R.K. Puram, New Delhi. In the 1979 CBSE Examination of 10+2, he secured 9th position in the All India Merit List. He has graduated from St. Stephen's College, Delhi University with Hons. in Economics in 1982 and did an MA in Economics from Delhi School of Economics. He also holds a master's degree in Public Policy from University of Southern California, Los Angeles, U.S.A. He is also an awardee of Ph.D degree in Development Finance from Sol Price School of Public Policy, University of Southern California, USA. In the Department, he has long years of experience in Assessment, Administration, Appeals and Investigation divisions. He has been posted at Ludhiana, Chandigarh, New Delhi, Bangalore and Mumbai in the department. He has published 7 articles and papers and one book chapter in an international publication. He has also edited the CBDT's Investigation report for the last five years. Dr. Pushpinder Singh Puniha is married to Mrs. Harinder and they have two sons, Uday and Abhay.",
			areaOfSpecializaion: '',
			comments: '',
			isStudent: false,
			batchName: '',
			gender: '',
			dob: '',
			maritalStatus: '',
			eduQualification: '',
			hometown: '',
			state: '',
			profilePic: 'profile-images/abc.jpeg'
		}, {
			firstName: 'Virat',
			lastName: 'Kohli',
			typeOfFaculty: 'Guest',
			designation: 'Pr. DGIT',
			location: 'National Academy of Direct Taxes',
			officeAddress: 'NADT, Chhindwara Road, Nagpur-440030',
			mailingAddress: 'NADT, Chhindwara Road, Nagpur-440030',
			contact: {
				phone: '072582871',
				fax: ''
			},
			email: 'dg@nadt.gov.in',
			profileDesc: "Dr. Pushpinder Singh Puniha is an IRS officer of the 39th Batch. He did his schooling from Delhi Public School, R.K. Puram, New Delhi. In the 1979 CBSE Examination of 10+2, he secured 9th position in the All India Merit List. He has graduated from St. Stephen's College, Delhi University with Hons. in Economics in 1982 and did an MA in Economics from Delhi School of Economics. He also holds a master's degree in Public Policy from University of Southern California, Los Angeles, U.S.A. He is also an awardee of Ph.D degree in Development Finance from Sol Price School of Public Policy, University of Southern California, USA. In the Department, he has long years of experience in Assessment, Administration, Appeals and Investigation divisions. He has been posted at Ludhiana, Chandigarh, New Delhi, Bangalore and Mumbai in the department. He has published 7 articles and papers and one book chapter in an international publication. He has also edited the CBDT's Investigation report for the last five years. Dr. Pushpinder Singh Puniha is married to Mrs. Harinder and they have two sons, Uday and Abhay.",
			areaOfSpecializaion: '',
			comments: '',
			isStudent: false,
			batchName: '',
			gender: '',
			dob: '',
			maritalStatus: '',
			eduQualification: '',
			hometown: '',
			state: '',
			profilePic: 'profile-images/abc.jpeg'
		}, {
			firstName: 'Yuvraj',
			lastName: 'Singh',
			typeOfFaculty: 'Guest',
			designation: 'Pr. DGIT',
			location: 'National Academy of Direct Taxes',
			officeAddress: 'NADT, Chhindwara Road, Nagpur-440030',
			mailingAddress: 'NADT, Chhindwara Road, Nagpur-440030',
			contact: {
				phone: '071582871',
				fax: ''
			},
			email: 'dg@nadt.gov.in',
			profileDesc: "Dr. Pushpinder Singh Puniha is an IRS officer of the 39th Batch. He did his schooling from Delhi Public School, R.K. Puram, New Delhi. In the 1979 CBSE Examination of 10+2, he secured 9th position in the All India Merit List. He has graduated from St. Stephen's College, Delhi University with Hons. in Economics in 1982 and did an MA in Economics from Delhi School of Economics. He also holds a master's degree in Public Policy from University of Southern California, Los Angeles, U.S.A. He is also an awardee of Ph.D degree in Development Finance from Sol Price School of Public Policy, University of Southern California, USA. In the Department, he has long years of experience in Assessment, Administration, Appeals and Investigation divisions. He has been posted at Ludhiana, Chandigarh, New Delhi, Bangalore and Mumbai in the department. He has published 7 articles and papers and one book chapter in an international publication. He has also edited the CBDT's Investigation report for the last five years. Dr. Pushpinder Singh Puniha is married to Mrs. Harinder and they have two sons, Uday and Abhay.",
			areaOfSpecializaion: '',
			comments: '',
			isStudent: false,
			batchName: '',
			gender: '',
			dob: '',
			maritalStatus: '',
			eduQualification: '',
			hometown: '',
			state: '',
			profilePic: 'profile-images/abc.jpeg'
		}, {
			firstName: 'Suresh',
			lastName: 'Raina',
			typeOfFaculty: 'Guest',
			designation: 'Pr. DGIT',
			location: 'National Academy of Direct Taxes',
			officeAddress: 'NADT, Chhindwara Road, Nagpur-440030',
			mailingAddress: 'NADT, Chhindwara Road, Nagpur-440030',
			contact: {
				phone: '071282871',
				fax: ''
			},
			email: 'dg@nadt.gov.in',
			profileDesc: "Dr. Pushpinder Singh Puniha is an IRS officer of the 39th Batch. He did his schooling from Delhi Public School, R.K. Puram, New Delhi. In the 1979 CBSE Examination of 10+2, he secured 9th position in the All India Merit List. He has graduated from St. Stephen's College, Delhi University with Hons. in Economics in 1982 and did an MA in Economics from Delhi School of Economics. He also holds a master's degree in Public Policy from University of Southern California, Los Angeles, U.S.A. He is also an awardee of Ph.D degree in Development Finance from Sol Price School of Public Policy, University of Southern California, USA. In the Department, he has long years of experience in Assessment, Administration, Appeals and Investigation divisions. He has been posted at Ludhiana, Chandigarh, New Delhi, Bangalore and Mumbai in the department. He has published 7 articles and papers and one book chapter in an international publication. He has also edited the CBDT's Investigation report for the last five years. Dr. Pushpinder Singh Puniha is married to Mrs. Harinder and they have two sons, Uday and Abhay.",
			areaOfSpecializaion: '',
			comments: '',
			isStudent: false,
			batchName: '',
			gender: '',
			dob: '',
			maritalStatus: '',
			eduQualification: '',
			hometown: '',
			state: '',
			profilePic: 'profile-images/abc.jpeg'
		}, {
			firstName: 'Harbhajan',
			lastName: 'Singh',
			typeOfFaculty: 'Guest',
			designation: 'Pr. DGIT',
			location: 'National Academy of Direct Taxes',
			officeAddress: 'NADT, Chhindwara Road, Nagpur-440030',
			mailingAddress: 'NADT, Chhindwara Road, Nagpur-440030',
			contact: {
				phone: '071252871',
				fax: ''
			},
			email: 'dg@nadt.gov.in',
			profileDesc: "Dr. Pushpinder Singh Puniha is an IRS officer of the 39th Batch. He did his schooling from Delhi Public School, R.K. Puram, New Delhi. In the 1979 CBSE Examination of 10+2, he secured 9th position in the All India Merit List. He has graduated from St. Stephen's College, Delhi University with Hons. in Economics in 1982 and did an MA in Economics from Delhi School of Economics. He also holds a master's degree in Public Policy from University of Southern California, Los Angeles, U.S.A. He is also an awardee of Ph.D degree in Development Finance from Sol Price School of Public Policy, University of Southern California, USA. In the Department, he has long years of experience in Assessment, Administration, Appeals and Investigation divisions. He has been posted at Ludhiana, Chandigarh, New Delhi, Bangalore and Mumbai in the department. He has published 7 articles and papers and one book chapter in an international publication. He has also edited the CBDT's Investigation report for the last five years. Dr. Pushpinder Singh Puniha is married to Mrs. Harinder and they have two sons, Uday and Abhay.",
			areaOfSpecializaion: '',
			comments: '',
			isStudent: false,
			batchName: '',
			gender: '',
			dob: '',
			maritalStatus: '',
			eduQualification: '',
			hometown: '',
			state: '',
			profilePic: 'profile-images/abc.jpeg'
		}, {
			firstName: 'Sachin',
			lastName: 'Tendulekar',
			typeOfFaculty: 'Guest',
			designation: 'Pr. DGIT',
			location: 'National Academy of Direct Taxes',
			officeAddress: 'NADT, Chhindwara Road, Nagpur-440030',
			mailingAddress: 'NADT, Chhindwara Road, Nagpur-440030',
			contact: {
				phone: '071258871',
				fax: ''
			},
			email: 'dg@nadt.gov.in',
			profileDesc: "Dr. Pushpinder Singh Puniha is an IRS officer of the 39th Batch. He did his schooling from Delhi Public School, R.K. Puram, New Delhi. In the 1979 CBSE Examination of 10+2, he secured 9th position in the All India Merit List. He has graduated from St. Stephen's College, Delhi University with Hons. in Economics in 1982 and did an MA in Economics from Delhi School of Economics. He also holds a master's degree in Public Policy from University of Southern California, Los Angeles, U.S.A. He is also an awardee of Ph.D degree in Development Finance from Sol Price School of Public Policy, University of Southern California, USA. In the Department, he has long years of experience in Assessment, Administration, Appeals and Investigation divisions. He has been posted at Ludhiana, Chandigarh, New Delhi, Bangalore and Mumbai in the department. He has published 7 articles and papers and one book chapter in an international publication. He has also edited the CBDT's Investigation report for the last five years. Dr. Pushpinder Singh Puniha is married to Mrs. Harinder and they have two sons, Uday and Abhay.",
			areaOfSpecializaion: '',
			comments: '',
			isStudent: false,
			batchName: '',
			gender: '',
			dob: '',
			maritalStatus: '',
			eduQualification: '',
			hometown: '',
			state: '',
			profilePic: 'profile-images/abc.jpeg'
		}, {
			firstName: 'Virendra',
			lastName: 'Singh',
			typeOfFaculty: 'Guest',
			designation: 'Pr. DGIT',
			location: 'National Academy of Direct Taxes',
			officeAddress: 'NADT, Chhindwara Road, Nagpur-440030',
			mailingAddress: 'NADT, Chhindwara Road, Nagpur-440030',
			contact: {
				phone: '071258271',
				fax: ''
			},
			email: 'dg@nadt.gov.in',
			profileDesc: "Dr. Pushpinder Singh Puniha is an IRS officer of the 39th Batch. He did his schooling from Delhi Public School, R.K. Puram, New Delhi. In the 1979 CBSE Examination of 10+2, he secured 9th position in the All India Merit List. He has graduated from St. Stephen's College, Delhi University with Hons. in Economics in 1982 and did an MA in Economics from Delhi School of Economics. He also holds a master's degree in Public Policy from University of Southern California, Los Angeles, U.S.A. He is also an awardee of Ph.D degree in Development Finance from Sol Price School of Public Policy, University of Southern California, USA. In the Department, he has long years of experience in Assessment, Administration, Appeals and Investigation divisions. He has been posted at Ludhiana, Chandigarh, New Delhi, Bangalore and Mumbai in the department. He has published 7 articles and papers and one book chapter in an international publication. He has also edited the CBDT's Investigation report for the last five years. Dr. Pushpinder Singh Puniha is married to Mrs. Harinder and they have two sons, Uday and Abhay.",
			areaOfSpecializaion: '',
			comments: '',
			isStudent: false,
			batchName: '',
			gender: '',
			dob: '',
			maritalStatus: '',
			eduQualification: '',
			hometown: '',
			state: '',
			profilePic: 'profile-images/abc.jpeg'
		}, {
			firstName: 'MS',
			lastName: 'Dhoni',
			typeOfFaculty: 'Guest',
			designation: 'Pr. DGIT',
			location: 'National Academy of Direct Taxes',
			officeAddress: 'NADT, Chhindwara Road, Nagpur-440030',
			mailingAddress: 'NADT, Chhindwara Road, Nagpur-440030',
			contact: {
				phone: '071258281',
				fax: ''
			},
			email: 'dg@nadt.gov.in',
			profileDesc: "Dr. Pushpinder Singh Puniha is an IRS officer of the 39th Batch. He did his schooling from Delhi Public School, R.K. Puram, New Delhi. In the 1979 CBSE Examination of 10+2, he secured 9th position in the All India Merit List. He has graduated from St. Stephen's College, Delhi University with Hons. in Economics in 1982 and did an MA in Economics from Delhi School of Economics. He also holds a master's degree in Public Policy from University of Southern California, Los Angeles, U.S.A. He is also an awardee of Ph.D degree in Development Finance from Sol Price School of Public Policy, University of Southern California, USA. In the Department, he has long years of experience in Assessment, Administration, Appeals and Investigation divisions. He has been posted at Ludhiana, Chandigarh, New Delhi, Bangalore and Mumbai in the department. He has published 7 articles and papers and one book chapter in an international publication. He has also edited the CBDT's Investigation report for the last five years. Dr. Pushpinder Singh Puniha is married to Mrs. Harinder and they have two sons, Uday and Abhay.",
			areaOfSpecializaion: '',
			comments: '',
			isStudent: false,
			batchName: '',
			gender: '',
			dob: '',
			maritalStatus: '',
			eduQualification: '',
			hometown: '',
			state: '',
			profilePic: 'profile-images/abc.jpeg'
		}];

		$scope.facultydiv = true;
		$scope.batchdiv = false;
		$scope.profilediv = false;
		$scope.timetablediv = false;


		$scope.faculty = {
			profilePic: 'profile-images/abc.jpeg',
			profileDesc: "Dr. Pushpinder Singh Puniha is an IRS officer of the 39th Batch. He did his schooling from Delhi Public School, R.K. Puram, New Delhi. In the 1979 CBSE Examination of 10+2, he secured 9th position in the All India Merit List. He has graduated from St. Stephen's College, Delhi University with Hons. in Economics in 1982 and did an MA in Economics from Delhi School of Economics. He also holds a master's degree in Public Policy from University of Southern California, Los Angeles, U.S.A. He is also an awardee of Ph.D degree in Development Finance from Sol Price School of Public Policy, University of Southern California, USA. In the Department, he has long years of experience in Assessment, Administration, Appeals and Investigation divisions. He has been posted at Ludhiana, Chandigarh, New Delhi, Bangalore and Mumbai in the department. He has published 7 articles and papers and one book chapter in an international publication. He has also edited the CBDT's Investigation report for the last five years. Dr. Pushpinder Singh Puniha is married to Mrs. Harinder and they have two sons, Uday and Abhay.",
			areaOfSpecializaion: '',
			firstName: 'Pushpinder Singh',
			lastName: 'Puniha',
			typeOfFaculty: 'In house faculty',
			designation: 'Pr. DGIT National Academy of Direct Taxes',
			officeAddress: 'NADT, Chhindwara Road, Nagpur-440030',
			mailingAddress: 'NADT, Chhindwara Road, Nagpur-440030',
			contact: {
				phone: '071258287',
				fax: ''
			},
			email: 'dg@nadt.gov.in',
		};


		var folder = '';
		BackendService.getTimetable().then(function (response) {
			//console.log('getTimetable');
			if (response.status == 200) {
				$scope.timetableArr = response.data;
				folder = response.folder;
			}
		});

		BackendService.getBatch().then(function (response) {
			//console.log('getBatch',response);
			if (response.status == 200) {
				$scope.batchArr = response.data;
				$scope.batch = $scope.batchArr[0];
			}
		});


		$scope.openFacultyProfile = function (faculty) {
			$('.list-group-item').removeClass('faculty-list-active');
			$('#' + faculty.contact.phone).addClass('faculty-list-active');
			$scope.faculty = faculty;
		}

		$scope.openBatchProfile = function (batch) {
			$('.list-group-item').removeClass('faculty-list-active');
			$('#' + batch._id).addClass('faculty-list-active');
			$scope.batch = batch;
		}

		$scope.myProfile = JSON.parse(window.sessionStorage.user);

		$scope.activateCouserFrame = function (id, childId) {
			$scope.pdfUrl = null;
			$scope.showtimetable = false;
			$('.course-menu').removeClass('active-bottom');
			$('#' + id).addClass('active-bottom');
			$scope.facultydiv = false;
			$scope.batchdiv = false;
			$scope.profilediv = false;
			$scope.timetablediv = false;
			if (id === 'timetable') {
				$scope.timetablediv = true;
			} else if (id === 'myprofile') {
				$scope.profilediv = true;
			} else if (id === 'faculty') {
				$scope.facultydiv = true;
			} else if (id === 'batch') {
				$scope.batchdiv = true;
			}
			// $('#faculty-main-div').css({'display':'none'});
			// $('#batch-div').css({'display':'none'});
			// $('#timetable-div').css({'display':'none'});
			// $('#profile').css({'display':'none'});
			// $('#training-calender-div').css({'display':'none'});
			// $('#'+childId).css({'display':'block'});
			if (childId === 'timetable-div' || childId === 'training-calender-div') {
				$scope.showtimetable = $scope.timetableArr && $scope.timetableArr.length > 0 ? true : false;
				$scope.pdfUrl = $scope.timetableArr && $scope.timetableArr.length > 0 ? folder + $scope.timetableArr[0].fileName : null;
				$timeout(function () {
					$('.notice-link').removeClass('notice-active');
					if (+$scope.timetableArr && +$scope.timetableArr.length > 0)
						$('#' + $scope.timetableArr[0]._id).addClass('notice-active');
				})
				//console.log('$scope.pdfUrl',$scope.pdfUrl)
			}
		}

		if ($stateParams.username) {
			$scope.query = $stateParams.username;
			$scope.activateCouserFrame('batch');
		}
		$scope.openTimeTable = function (filename, id) {
			$scope.pdfUrl = folder + filename;
			$timeout(function () {
				$('.notice-link').removeClass('notice-active');
				$('#' + id).addClass('notice-active');
			})
		}

		$scope.changePass = function () {
			if ($scope.newPass != '') {
				if ($scope.confPass === $scope.newPass) {
					BackendService.changePass({ passwd: $scope.newPass, email: JSON.parse(window.sessionStorage.user).email }).then(function (response) {
						$scope.confPass = '';
						$scope.newPass = '';
						if (response.status == 200) {
							message('Password changed', ngToast)
						} else {
							message(response.message, ngToast)
						}
					})
				} else {
					message('Password not matched', ngToast)
				}

			} else {
				message('Please enter a valid password', ngToast)
			}
		}

		$scope.sendEmail = function () {
			if ($scope.subject == '' || !$scope.subject)
				return message('Please enter time table heading', ngToast);
			else if (!$scope.file) {
				return message('Please attach time table', ngToast);
			} else {
				var creatorEmail = JSON.parse(window.sessionStorage.user).email;
				var creatorName = JSON.parse(window.sessionStorage.user).name;
				Upload.upload({
					url: '/api/createtimetable',
					data: {
						subject: $scope.subject,
						content: $scope.content,
						file: $scope.file,
						publishOn: $scope.selectedPublish,
						creatorName: creatorName,
						creatorEmail: creatorEmail
					}
				}).then(function (resp) {
					$scope.file = null;
					$scope.subject = '';
					$scope.fileName = '';
					if (resp.status == 200)
						return message('Time table successfully created....', ngToast);
					else
						return message(response.message, ngToast);
				}, function (resp) {
					console.log('Error status: ' + resp.status);
				}, function (evt) {
					var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
					console.log('progress: ' + progressPercentage + '% ');
				});
			}
		}

		$scope.openFileWindow = function () {
			angular.element('#fileUpload').trigger('click');
		}

		$scope.upload = function (element) {
			$scope.file = element.files[0];
			$scope.fileName = element.files[0].name;
		}
	})
	.controller('ClubCntrl', function ($scope, ngToast, $location, BackendService, $timeout, Upload, $rootScope) {
		$scope.cultOpts = ['Dramatics Club', 'Fine Arts Club', 'Music and Dance Club'];
		$scope.hobbOpts = ['Astronomy Club', 'Adventure Club', 'Social Welfare Club', 'ICT Club', 'Extra Mural Club', 'Literary Club', 'Photography and Movies Club', 'Nature and Wildlife Club'];
		$scope.optsEvent = ['Active-Events', 'Past-Events'];
		$scope.optEvent = $scope.optsEvent[0];
		if ($rootScope['clubs-society']) {
			$scope.opts = $rootScope['clubs-society'].eventCategory == 'cultural' ? $scope.cultOpts : $scope.hobbOpts;
			$scope.activeCategoty = $rootScope['clubs-society'].eventCategory == 'cultural' ? 'cultural' : 'hobbies';
			$scope.optSelected = $rootScope['clubs-society']["eventSubCategory"];
			$('.ul-sub-menu1 li.active-bottom').removeClass('active-bottom');
			$('#' + $scope.activeCategoty).addClass('active-bottom');
		} else {
			$scope.opts = $scope.cultOpts;
			$scope.optSelected = $scope.opts[0];
			$scope.activeCategoty = 'cultural';
		}

		var creator = { name: JSON.parse(window.sessionStorage.user).name, email: JSON.parse(window.sessionStorage.user).email }
		var groupName = JSON.parse(window.sessionStorage.user).groupName;
		BackendService.getTags().then(function (response) {
			if (response.status == 200) {
				$scope.allTags = response.data;
			}
		});

		BackendService.getEvent('?email=' + creator.email + '&group_name=' + groupName).then(function (response) {
			if (response.status == 200) {
				$scope.events = response.data;
				//$scope.commonArr = $scope.events[$scope.activeCategoty][$scope.optSelected];
				$scope.refreshData($rootScope['clubs-society'] ? $rootScope['clubs-society']._id : null);
				$rootScope['clubs-society'] = null;
			}
		});

		BackendService.getPastEvent('?email=' + creator.email + '&group_name=' + groupName + '&past=past').then(function (response) {
			//console.log(response)
			if (response.status == 200) {
				$scope.pastEvents = response.data;
			}
		});

		BackendService.getHallOfFame().then(function (response) {
			if (response.status == 200) {
				$scope.hallOfFame = response.data;
				$scope.refreshHallOfFameData();
			}
		})

		$scope.refreshHallOfFameData = function () {
			$scope.hallOfFameArr = $scope.hallOfFame[$scope.activeCategoty] && $scope.hallOfFame[$scope.activeCategoty][$scope.optSelected] ? $scope.hallOfFame[$scope.activeCategoty][$scope.optSelected] : [];
		}


		$scope.refreshData = function (id) {
			//console.log($scope.optEvent,$scope.optsEvent[1])
			if ($scope.optEvent == $scope.optsEvent[1]) {
				$scope.commonArr = $scope.pastEvents[$scope.activeCategoty] && $scope.pastEvents[$scope.activeCategoty][$scope.optSelected] ? $scope.pastEvents[$scope.activeCategoty][$scope.optSelected] : [];
				$('.create-event-button').css({ 'display': 'none' });
			} else {
				$scope.commonArr = $scope.events[$scope.activeCategoty] && $scope.events[$scope.activeCategoty][$scope.optSelected] ? $scope.events[$scope.activeCategoty][$scope.optSelected] : [];
				$('.create-event-button').css({ 'display': 'block' });
			}

			if ($scope.commonArr && $scope.commonArr.length) {
				var event;
				if (id) {
					$scope.commonArr.forEach(function (item) {
						if (item._id == id)
							event = item;
					})
				} else {
					event = $scope.commonArr[0];
				}
				//console.log('event',event)
				$scope.sender = event.creator.email;
				$scope.subject = event.subject;
				$scope.content = event.content;
				$scope.eventDate = event.eventDate;
				$scope.eventVanue = event.eventVanue;
				if (event.file) {
					$scope.fileAttached = '../event-files/' + event.file.name;

				} else {
					$scope.fileAttached = null;
				}
				$timeout(function () {
					$('#' + event._id).addClass('event-active');
				})
			}
			$scope.refreshHallOfFameData();
		}

		$scope.activateClub = function (id) {
			$('.ul-sub-menu1 li.active-bottom').removeClass('active-bottom');
			$('#' + id).addClass('active-bottom');
			$scope.activeCategoty = id;
			if (id == 'cultural')
				$scope.opts = $scope.cultOpts;
			else
				$scope.opts = $scope.hobbOpts;
			$scope.optSelected = $scope.opts[0];
			$scope.refreshData();
		}

		$scope.openEvent = function (event) {
			$scope.sender = event.creator.email;
			$scope.subject = event.subject;
			$scope.content = event.content;
			$scope.activeEvent(event._id);
		}


		$scope.activeEvent = function (id) {
			$timeout(function () {
				$('.event-link').removeClass('event-active');
				$('#' + id).addClass('event-active');
			})
		}

		$scope.tags = [];

		$scope.loadTags = function (query) {
			return $scope.allTags.filter(o => o.text.toLowerCase().indexOf(query.toLowerCase()) > -1);
		};

		$scope.sendEmail = function () {
			if ($scope.subjectInput == '' || !$scope.subjectInput)
				return message('Please enter event heading', ngToast);
			else if ($scope.eventDateInput == '' || !$scope.eventDateInput)
				return message('Please enter event date', ngToast);
			else if ($scope.eventVanueInput == '' || !$scope.eventVanueInput)
				return message('Please enter event vanue', ngToast);
			else if ($scope.tags.length == 0)
				return message('Please enter address', ngToast);
			else if ($scope.contentInput == '' || !$scope.contentInput)
				return message('Please write some content', ngToast);
			else {

				var to = [];
				$scope.tags.forEach(function (tag) {
					to.push(tag.text);
				})
				Upload.upload({
					url: '/api/event',
					data: {
						to: to,
						subject: $scope.subjectInput,
						content: $scope.contentInput,
						file: $scope.file ? $scope.file : null,
						creator: creator,
						eventDate: $scope.eventDateInput,
						eventVanue: $scope.eventVanueInput,
						eventType: { category: $scope.activeCategoty, subCategory: $scope.optSelected }
					}
				}).then(function (resp) {
					$scope.file = null;
					$scope.tags = [];
					$scope.subjectInput = '';
					$scope.contentInput = '';
					$scope.fileName = '';
					$scope.eventDateInput = '';
					$scope.eventVanueInput = '';
					if (resp.status == 200)
						return message('Mail successfully sent....', ngToast);
					else
						return message(response.message, ngToast);
				}, function (resp) {
					console.log('Error status: ' + resp.status);
				}, function (evt) {
					var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
					console.log('progress: ' + progressPercentage + '% ');
				});
			}
		}

		$scope.upload = function (element) {
			$scope.file = element.files[0];
			$timeout(function () {
				$scope.fileName = element.files[0].name;
			})
		}

		$scope.openFileWindow = function () {
			angular.element('#fileUpload').trigger('click');
		}

		$scope.saveHallOfFame = function () {
			if ($scope.hallOfFameContent && $scope.hallOfFameContent != '') {
				var obj = { hallOfFameContent: $scope.hallOfFameContent, name: JSON.parse(window.sessionStorage.user).name, email: JSON.parse(window.sessionStorage.user).email, category: $scope.activeCategoty, subCategory: $scope.optSelected }
				$scope.hallOfFameContent = '';
				BackendService.saveHallOfFame(obj).then(function (response) {
					if (response.status == 200) {
						$scope.hallOfFame = response.data;
						$scope.refreshHallOfFameData();
						message('Hall Of Fame added successfully......', ngToast);
					}
				})
			} else {
				message('Please add some content......', ngToast);
			}
		}

		$scope.deleteHallOfFame = function (id) {
			BackendService.deleteHallOfFame(id).then(function (response) {
				if (response.status == 200) {
					$scope.hallOfFame = response.data;
					$scope.refreshHallOfFameData();
					message('Hall Of Fame deleted successfully......', ngToast);
				}
			})
		}

		$scope.showEditModal = function (hall) {
			$scope.hall = hall;
			$scope.hallOfFameContentEdit = hall.hallOfFameContent;
			$('#hallOfFameEdit').modal().show();
		}

		$scope.updateHallOfFame = function () {
			BackendService.updateHallOfFame({ id: $scope.hall._id, hallOfFameContent: $scope.hallOfFameContentEdit }).then(function (response) {
				$scope.hall = null;
				if (response.status == 200) {
					$scope.hallOfFame = response.data;
					$scope.refreshHallOfFameData();
					message('Hall Of Fame updated successfully......', ngToast);

				}
			})
		}

		$(function () {
			$("#datepicker").datepicker({
				minDate: new Date()
			});
		});
	})
	.controller('LeaveCntrl', function ($scope, BackendService, ngToast, $timeout) {
		$scope.user = JSON.parse(window.sessionStorage.user);
		$scope.totalLeaves = $scope.user.totalLeaves;

		$scope.optsLeave = ['Casual', 'Station'];
		$scope.leaveType = $scope.optsLeave[0];
		$scope.optsCombining = ['Yes', 'No'];
		$scope.combiningFlag = $scope.optsCombining[0];
		$scope.optsStatusLeave = ['Declined', 'Approved'];

		BackendService.getLeaves('?email=' + $scope.user.email).then(function (response) {
			console.log('response', response)
			$scope.leaves = [];
			if (response.status == 200) {
				$scope.refreshLeave(response);
			}
		});

		$scope.refreshLeave = function (response) {
			$scope.leaves = [];
			$scope.lastApprovedLeave = response.lastApprovedLeave && response.lastApprovedLeave.length ? response.lastApprovedLeave[0] : {};
			if (response.data.length && $scope.user.isStudent) {
				console.log('from leaves....', response.data[0])
				$scope.leavesTaken = response.data[0].userId.leavesTaken;
			} else if ($scope.user.isStudent) {
				$scope.leavesTaken = 0;
			}
			if (response.data.length >= 1) {
				response.data.forEach(function (item) {
					item.to = item.to.join();
					if (!$scope.user.isStudent)
						item.commentToShow = item.reason.length > 20 ? item.reason.substring(0, 20) + '...' : item.reason;
					$scope.leaves.push(item);
					$scope.leaves.push({});
				})
			} else if (response.data.length == 0) {
				response.data.to = response.data.to.join();
				if (!$scope.user.isStudent)
					response.data[0].commentToShow = response.data[0].reason.length > 20 ? response.data[0].reason.substring(0, 20) + '...' : response.data[0].reason;
				$scope.leaves = response.data;
			} else {
				$scope.leaves = [];
			}


		}

		$scope.viewComment = function (comment, leave) {
			$scope.comm = '';
			$scope.leaveApplyOrDecApprReason = '';
			if (leave) {
				$scope.comm = leave.leaveAppDeclineReason;
				$scope.leaveApplyOrDecApprReason = 'Leave Decline/Approve Reason';
			} else {
				$scope.comm = comment;
				$scope.leaveApplyOrDecApprReason = 'Leave Application Reason';
			}

			$('#comment').modal('show');
		}

		$scope.changeLeaveStatus = function (leave) {
			$scope.leave = leave;
			$scope.leaveOptStatus = $scope.optsStatusLeave[0]; //$scope.optsStatusLeave[$scope.optsStatusLeave.indexOf(leave.status)];
			$('#leaveStatusModal').modal('show');
		}
		$scope.leaveStatusSelected = function () {
			if ($scope.leaveOptStatus != 'Declined') {
				$scope.showLeaveDays = true;
			} else {
				$scope.showLeaveDays = false;
			}
		}
		$scope.leaveStatusByAdmin = function () {
			if ($scope.showLeaveDays && ($scope.leaveDays > 0))
				return message('Please enter calculated leave days', ngToast);
			else {
				var obj = {};
				obj.approver = $scope.user.email;
				obj.approverName = $scope.user.name;
				obj.leaveDays = $('#leaveDays').val();
				obj.leaveOldStatus = $scope.leave.status;
				obj.oldLeaveDays = $scope.leave.leaveDays;
				obj.leaveStatus = $scope.leaveOptStatus;
				obj.leaveAppDeclineReason = $scope.leaveAppDeclineReason;
				obj.leaveId = $scope.leave._id;
				BackendService.leaveApproveOrDecline('?id=' + $scope.leave.userId._id, obj).then(function (response) {
					console.log(response)
					if (response.status == 200) {
						$scope.refreshLeave(response);
						message('Leave Status successfully changed.', ngToast);
					} else {
						message(response.message, ngToast);
					}
				})
			}
		}

		$scope.applyLeave = function () {
			if (!$scope.leaveType || $scope.leaveType == '' || ['Casual', 'Station'].indexOf($scope.leaveType) == -1)
				message('Please enter leave type...Casual or Station', ngToast);
			else if (!$scope.departDate || $scope.departDate == '')
				message('Please select departure date', ngToast);
			else if ($('#timepicker').val() == '')
				message('Please select departure time', ngToast);
			else if (!$scope.arrivalDate || $scope.arrivalDate == '')
				message('Please select arrival date', ngToast);
			else if ($('#timepicker1').val() == '')
				message('Please select arrival time', ngToast);
			else if (!$scope.reason || $scope.reason == '')
				message('Please enter reason for leave', ngToast);
			else if (!$scope.combiningFlag || $scope.combiningFlag == '')
				message('Please fill Combining with Casual leave/Station leave (Yes/No) ', ngToast);
			else if (!$scope.leaveStayAddress || $scope.leaveStayAddress == '')
				message('Please enter address during leave', ngToast);
			else {
				var leave = {};
				leave.userId = $scope.user._id;
				leave.leaveType = $scope.leaveType;
				leave.departDate = $scope.departDate;
				leave.departTime = $('#timepicker').val();
				leave.arrivalDate = $scope.arrivalDate;
				leave.arrivalTime = $('#timepicker1').val();
				leave.reason = $scope.reason;
				leave.combiningWithCusualStation = $scope.combiningFlag;
				leave.addressDuringLeave = $scope.leaveStayAddress;
				leave.userName = $scope.user.name;
				BackendService.applyForLeave('?email=' + $scope.user.email, leave).then(function (response) {
					console.log(response)
					if (response.status == 200) {
						$scope.leaveType = '';
						$scope.departDate = '';
						$scope.departTime = '';
						$scope.arrivalDate = '';
						$scope.arrivalTime = '';
						$scope.reason = '';
						$scope.combiningFlag = '';
						$scope.leaveStayAddress = '';
					}
					message(response.message, ngToast);
				});
			}
		}
		$(function () {
			$("#datepicker").datepicker({
				minDate: new Date()
			});
			$("#datepicker1").datepicker({
				minDate: new Date()
			});
			$('#timepicker').mdtimepicker();
			$('#timepicker1').mdtimepicker();
		});
	})



function message(message, ngToast, call) {
	ngToast.create(message);
	if (call)
		call();
}
