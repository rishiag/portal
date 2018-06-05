'use strict';

/**
 * @ngdoc function
 * @name testApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the testApp
 */
angular.module('testApp')
.directive('carousel', function($timeout) {
	return {
	   restrict: 'E',
	   scope: {
		 links: '='
	   },
	   templateUrl: 'views/carousel.html',
	   link: function(scope, element) {
		 $timeout(function() {
		   $('.carousel-indicators li',element).first().addClass('active');
		   $('.carousel-inner .item',element).first().addClass('active');
		 });
	   }
	}
 })
.directive('player', ['$sce', '$compile',function ($sce,$compile) {
    'use strict';
    return {
        restrict: 'E',
        link: function (scope, element, attrs) {
			var video = element.find('video');
			element.addClass('player');
			//video[0].controls = false;
            scope.playing = false;
            scope.trustSrc = function(src) {
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

			
			
			scope.$watch('videos', function(newVal, oldVal) {
				if (newVal && newVal !== oldVal) {
				  $compile(element)(scope);
				}
			  });
			  if(video)
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
	.controller('HomeCtrl', function ($scope, $uibModal,BackendService,ngToast,Upload,$filter,$rootScope,$location,$timeout,$compile) {
		$('.header-class').removeClass("top-two-header");
		// $scope.trainingArr = [];
		// 						{fileName : 'Minute to minute program of Mr bipin rawat'},
		// 						{fileName : 'Minute to minute program of Mr bipin rawat'}];
								
		// $scope.notices = [];
		// 						{fileName : 'Minute to minute program of Mr bipin rawat'},
		// 						{fileName : 'Minute to minute program of Mr bipin rawat'}];

		$scope.fileAvailable = false;
		$scope.videoAvailable = false;

		BackendService.getNotifications().then(function(response){
			var folderName = 'notice-files/';
			if(response.status == 200){
				$scope.notices = response.data;
				$scope.unread = 0;
				$scope.notices.forEach(function(item){
					if(item.status == 'unread')
					$scope.unread = $scope.unread+1;
					item.time = new Date(item.createdAt).setHours(0,0,0,0) == new Date().setHours(0,0,0,0) ? new Date(item.createdAt).toLocaleTimeString().replace(/:\d{2}\s/,' ') : ($filter('date')(item.createdAt)).split(',')[0];
					item.subjectToShow = item.subject ? (item.subject.length > 50 ? item.subject.substring(0,50)+'...' : item.subject) : item.subject.substring(0,50)+'...';
					if(item.fileName)
						item.fileName = folderName+item.fileName;
					//$scope.notices.push(item);
				});

				

				$scope.noNoticeAvailableMeassage = 'No Official Notice Available.';
			}
		})

		BackendService.getTrainingMaterialHome().then(function(response){
			if(response.status == 200){
				$scope.trainingArr = response.data;
			}
		});

		$("#myModal").on('hidden.bs.modal', function () {
			// /clearCanvas();
			$scope.fileAvailable = false;
			$scope.videoAvailable = false;
			$scope.pdfUrl = '';
			$scope.title = '';
			$scope.videoAvailable = false;
			$("#myModal").data('bs.modal', null);

			
		});

		// $(document).on('hidden.bs.modal', function () {
			
		// 	$('#myModal').modal('remove')
		// });

		$scope.onLoad = function() {
			//$scope.zoomIn();
			//$scope.pageNum = 1;
		}

		$scope.onError = function(error) {
			// handle the error
			 console.log('from error',error);
		}

		$scope.onProgress = function(progress) {
			// handle a progress bar
			var progress1 = progress.loaded / progress.total
			 console.log(progress1,$scope.pageNum,$scope.pageCount);
			 
			//   if(progress1 >= 1){
			// 	 try{
			// 		$scope.zoomIn();
				
			// 	 }catch(e){
			// 		$scope.zoomOut();
			// 	 }
			//   }
			 	
		}

		$scope.openModal = function(obj){
			$scope.loadingPdf = true;
			var filePart = obj.fileName.split('.');
			$scope.title = obj.title;
			if(filePart[filePart.length-1] == 'pdf' || filePart[filePart.length-1] == 'ppt'){
				$scope.fileAvailable = true;
				$scope.videoAvailable = false;
				$scope.pdfUrl = obj.fileName.split('app/')[1];
				//$('#pdfdiv').html($compile('<ng-pdf template-url="views/viewer.html" canvasid="pdf" scale="page-fit" page=1 style="width: 90%;padding: 5%;"></ng-pdf>')($scope))
			//	$scope.pdfUrl = 'http://docs.google.com/gview?url='+$scope.pdfUrl+'&embedded=true'
				//$scope.zoomIn();
			}else{
				$scope.fileAvailable = false;
				$scope.videoAvailable = true;
				var link = obj.fileName.split('app/')[1];
				$scope.videos = [{"type":"mp4","src":link,"poster":"http://www.videojs.com/img/poster.jpg","captions":"http://www.videojs.com/vtt/captions.vtt"}];	
						
			}
			
			
				$('#myModal').modal('show');
		}

		$scope.callFromHome = function(obj,url){
			$rootScope[url] = obj;
			$('.ul-sub-menu li.active').removeClass('active');
			$('#'+url).addClass('active');
			$location.url('/'+url);
		}
	})
	.controller('LoginCtrl', function ($scope,ngToast,$location,BackendService,$rootScope) {
		$('.header-class').addClass("top-two-header");
		sessionStorage.clear();
		$rootScope.loggedin = false;
		$scope.links =[
			{ src:"http://www.conceptcarz.com/images/Suzuki/suzuki-concept-kizashi-3-2008-01-800.jpg", alt:"", caption:""},
			{ src:"http://www.conceptcarz.com/images/Volvo/2009_Volvo_S60_Concept-Image-01-800.jpg", alt:"", caption:""},
			{ src:"http://www.sleepzone.ie/uploads/images/PanelImages800x400/TheBurren/General/sleepzone_hostels_burren_800x400_14.jpg", alt:"", caption:""},
		 ];

		$scope.displayPopup = function(f,b){
			
			 $('#pwd').popover('toggle');
		}

		$scope.displayPopup1 = function(f,b){
			 $('#pwd').popover('hide');
		}
		$scope.loginF = function(){
			if(!$scope.email || $scope.email == '')
				return message('Please enter email',ngToast);
			else if(!$scope.passwd || $scope.passwd == '')
				return message('Please enter password',ngToast)
			else
				BackendService.login({email : $scope.email,passwd:$scope.passwd}).then(function(response){
					if(response.status == 200){
						window.sessionStorage.user = JSON.stringify(response.data);
						$rootScope.loggedin = true;	
						$rootScope.userName = response.data.name;
						$location.url('/home');
					}
					else
						return message(response.message,ngToast);
				})
		}
	})
	.controller('ForgotCntrl', function ($scope,ngToast,$location,BackendService) {
		$('.header-class').addClass("top-two-header");
		$scope.forgotP = function(){
			if(!$scope.email || $scope.email == '')
				return message('Please enter email',ngToast);
			else
				BackendService.forgot({email : $scope.email}).then(function(response){
					if(response.status == 200){
						message('Password sent to your mail');
						$location.path('/login');
					}
					else
						return message(response.message,ngToast);
				})
		}
	})
	.controller('LogoutCntrl', function ($scope, $location,$rootScope) {
		$('.header-class').addClass("top-two-header");
		sessionStorage.clear();
		$rootScope.loggedin = false;
		$location.path("/login");
	})
	.controller('RegisterCtrl', function ($scope, $location,$rootScope,BackendService,ngToast) {
		$('.header-class').addClass("top-two-header");
		sessionStorage.clear();
		$rootScope.loggedin = false;
		$scope.signup = function(){
			if(!$scope.name || $scope.name == '')
				return message('Please enter name',ngToast);
			if(!$scope.email || $scope.email == '')
					return message('Please enter email',ngToast);
			else if(!$scope.passwd || $scope.passwd == '')
				return message('Please enter password',ngToast)
			else
				BackendService.register({email : $scope.email,passwd:$scope.passwd,name:$scope.name}).then(function(response){
					if(response.status == 200){
						message('You are successfully registerd',ngToast,$location.url('/login'))
					}
					else
						return message(response.message,ngToast);
				})
		}
		
	})
	.controller('Dashboard', function ($scope, $location) {
		$('.header-class').removeClass("top-two-header");
		$('.ul-sub-menu').click(function(evt) {
			$('.ul-sub-menu li.active').removeClass('active');
			$('#'+evt.target.id).addClass('active');
		})
		$scope.callOption = function(path,event){
			$location.url('/'+path)
		}
	})
	.controller('Notice', function ($scope,BackendService ,$location,ngToast,Upload,$filter,$timeout,$rootScope) {
		$('.header-class').removeClass("top-two-header");
		BackendService.getTags().then(function(response){
			if(response.status == 200){
				$scope.allTags = response.data;
			}
		});

		BackendService.getNotifications($rootScope.notice?('&notificationHash='+$rootScope.notice._id):null).then(function(response){
			var folderName = 'notice-files/';
			$scope.personal = [];
			$scope.official = [];
			console.log(response)
			if(response.status == 200){
				$scope.notices = response.data;
				$scope.notices.forEach(function(item){
					item.time = new Date(item.createdAt).setHours(0,0,0,0) == new Date().setHours(0,0,0,0) ? new Date(item.createdAt).toLocaleTimeString().replace(/:\d{2}\s/,' ') : $filter('date')(item.createdAt);
				//	item.fileNameToShow = item.subject.substring(0,20)+'...'// ? item.fileName.substring(0,20)+'......' : +'......';
					item.subjectToShow = item.subject ? (item.subject.length > 40 ? item.subject.substring(0,40)+'...' : item.subject) : item.subject.substring(0,40)+'...';
					if(item.fileName)
						item.fileName = folderName+item.fileName;
					if(item.notificationType == 'personal')
						$scope.personal.push(item);
					else
						$scope.official.push(item);
				});
				$scope.commonArr = $scope.official;	

				if($rootScope.notice){
					console.log('notice from home....',$rootScope.notice);
					$scope.activateNotice($rootScope.notice.notificationType,$rootScope.notice);
				}else{
				 if($scope.commonArr.length > 0)
					if($scope.commonArr[0].content.length >= 1){
						$scope.fileAvailable = false;
						$scope.textToShow = $scope.commonArr[0].content;
						$scope.sender = $scope.commonArr[0].creator;
						$scope.subject = $scope.commonArr[0].subject;
						$scope.fileAttached =  $scope.commonArr[0].fileName ?  $scope.commonArr[0].fileName:null;
					}else{
						$scope.fileAvailable = true;
						$scope.pdfUrl = $scope.commonArr[0].fileName;
					}
				else
					$scope.noNoticeAvailableMeassage = 'No Official Notice Available.';
					$scope.officialTotal = $scope.official.length;
					$scope.personalTotal = $scope.personal.length;
				$timeout(function(){
					if($scope.commonArr.length > 0)
					$('#'+$scope.commonArr[0]._id).addClass('notice-active');
				})
				}
			}
		})

		$scope.publishOptions = ['Immediately','Later'];
		$scope.selectedPublish = $scope.publishOptions[0];

		$scope.tags = [];
		var creator =JSON.parse( window.sessionStorage.user).email;

		$scope.loadTags = function(query) {
			 return $scope.allTags.filter(o => o.text.toLowerCase().indexOf(query.toLowerCase()) > -1);
		};

		$scope.sendEmail = function(){
			
		    if($scope.subject == '' || !$scope.subject)
					return message('Please enter notice heading',ngToast);
			if($scope.tags.length == 0)
					return message('Please enter address',ngToast);
			else if($scope.content == '' || !$scope.content)
					return message('Please write some content',ngToast);
			else{

				var to = [];
					$scope.tags.forEach(function(tag){
						to.push(tag.text);
					})
				Upload.upload({
					url: '/api/notification',
					data: {
								to : to,
								subject : $scope.subject,
								content : $scope.content,
								file : $scope.file ? $scope.file : null,
								publishOn : $scope.selectedPublish,
								creator : creator
							}
				}).then(function (resp) {
					$scope.file = null;
					$scope.tags = [];
					$scope.subject = '';
					$scope.content = '';
					$scope.fileName = '';
					if(resp.status == 200)
						return message('Mail successfully sent....',ngToast);
					else
						return message(response.message,ngToast);
				}, function (resp) {
					console.log('Error status: ' + resp.status);
				}, function (evt) {
					var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
					console.log('progress: ' + progressPercentage + '% ');
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

		

		$('.ul-sub-menu1').click(function(evt) {
			$('.ul-sub-menu1 li.active-bottom').removeClass('active-bottom');
			$('#'+evt.target.id).addClass('active-bottom');
		});

		$scope.activateNotice = function(type,notice){
			console.log(type,notice)
			//$scope.fileAttached = null;
			if(notice){
				$scope.commonArr = notice.notificationType == 'official' ? $scope.official : $scope.personal;
				$('.ul-sub-menu1 li.active-bottom').removeClass('active-bottom');
				$('#'+type).addClass('active-bottom');
				$scope.openNotice(notice,notice.content.length >= 1 ? true : false,notice._id)
			}else{
				if(type == 'personal')
					$scope.commonArr = $scope.personal;
				else
					$scope.commonArr = $scope.official;
				if($scope.commonArr.length > 0 && $scope.commonArr[0].content.length >= 1){
					$scope.fileAvailable = false;
					$scope.textToShow = $scope.commonArr[0].content;
					$scope.sender = $scope.commonArr[0].creator;
					$scope.subject = $scope.commonArr[0].subject;
					$scope.fileAttached =  $scope.commonArr[0].fileName ?  $scope.commonArr[0].fileName:null;
				}else if($scope.commonArr.length > 0 && $scope.commonArr[0].fileName){
					$scope.fileAvailable = true;
					$scope.pdfUrl = $scope.commonArr[0].fileName;
					//$('#'+$scope.commonArr[0]._id).addClass('notice-active');
				}else{
					$scope.noNoticeAvailableMeassage = 'No '+type+' Notice Available.';
				}
			}

			
			

		//	console.log($scope.commonArr[0]._id)
			$timeout(function(){
				if($scope.commonArr.length > 0 && !$rootScope.notice)
					$('#'+$scope.commonArr[0]._id).addClass('notice-active');
				else
				$rootScope.notice = null;
			})
		}

		$scope.openNotice = function(link,fileOrText,id){
			console.log('hhhhh',link,fileOrText,id)
			$timeout(function(){
				$('.notice-link').removeClass('notice-active');
				$('#'+id).addClass('notice-active');
			})
			if(fileOrText){
				$scope.fileAvailable = false;
				$scope.textToShow = link.content;
				$scope.sender = link.creator;
				$scope.subject = link.subject;
				$scope.fileAttached =  link.fileName ?  link.fileName:null;
			}else{
				$scope.fileAvailable = true;
				$scope.pdfUrl = link.fileName;
			}
		}
	})
	.controller('ClassroomCntrl', function ($scope, $location,$window,$sce,BackendService,$rootScope,$timeout) {
		$('.header-class').removeClass("top-two-header");
		$scope.fileAvailable = false;
		$scope.videoAvailable = false;
		$scope.displayAreaFlag = true;
		$('.ul-sub-menu1').click(function(evt) {
			$('.ul-sub-menu1 li.active-bottom').removeClass('active-bottom');
			$('#'+evt.target.id).addClass('active-bottom');
		});

		//getTrainingMaterial
		BackendService.getTraining($rootScope.classroom ? $rootScope.classroom.subject : null).then(function(response){
			if(response.status == 200){
				$scope.activeTab = 'training';
				$scope.training = response.data.training ?response.data.training:[];
				$scope.session = response.data.session ?response.data.session:[];
				$scope.sessionSubjects = response.data.sessionSubjects;
				$scope.trainingSubjects = response.data.trainingSubjects;
				if($rootScope.classroom){
					console.log($rootScope.classroom)
					$scope.weeks = ($scope.training.find(o => o.name === $rootScope.classroom.subject)).children;
					//$scope.weeks = $scope.training[0].children;
					$scope.subjectOptions = $scope.trainingSubjects;
					$scope.selectedSubject = $rootScope.classroom.subject;
					$scope.toggleWeek(null,null,null,$rootScope.classroom);
					
				}else{
					$scope.weeks = $scope.training[0].children;
					$scope.subjectOptions = $scope.trainingSubjects;
					$scope.selectedSubject = $scope.training[0].name;
				}
			}
		});

		$scope.subjectChanged = function(){
			$('.load-wait').removeClass('.loading');

			$scope.displayAreaFlag = true;
			$scope.fileAvailable = false;
			$scope.pdfUrl = null;
			$scope.videoAvailable = false;

			if($scope.activeTab == 'training')
				$scope.training.forEach(function(subject){
					if(subject.name == $scope.selectedSubject){
						$scope.weeks = subject.children;
					}
				});
			else
			$scope.session.forEach(function(subject){
				if(subject.name == $scope.selectedSubject){
					$scope.weeks = subject.children;
				}
			});	
		}

		$scope.activateTrainingOrSession = function(tab){
			$scope.displayAreaFlag = true;
			$scope.fileAvailable = false;
			$scope.pdfUrl = null;
			$scope.videoAvailable = false;
			$scope.activeTab = tab;
			if(tab == 'training'){
				$scope.weeks = $scope.training && $scope.training.length > 0 ? $scope.training[0].children :[];
				$scope.activeTab = 'training';
				$scope.subjectOptions = $scope.trainingSubjects;
				$scope.selectedSubject = $scope.training[0].name;
			}else{
				$scope.weeks = $scope.session && $scope.session.length > 0 ? $scope.session[0].children :[];
				$scope.activeTab = 'session';
				$scope.subjectOptions = $scope.sessionSubjects;
				$scope.selectedSubject = $scope.session[0].name;
			}
			if($scope.weeks.length > 0){
				$scope.disableSelectSubject = false;
			}else{
				//console.log('from no week')
				$scope.disableSelectSubject = true
				$scope.selectedSubject = 'No subject Available';
				$scope.subjectOptions = ['No subject Available'];
			}
			
		}
		

		$scope.callOption = function(path,event){
			$location.url('/'+path)
		}

		
		//$scope.selectedSubject = $scope.subjectOptions[0];
		$scope.toggleWeek = function(id,titleFromRoot,obj,objFromHome){
			$rootScope.classroom = null;
			var toggleForWeek = function(id){
				
				$timeout(function(){
					var x = document.getElementById(id);
					console.log(x)
					if (x.style.display === "none") {
						x.style.display = "block";
					} else {
						x.style.display = "none";
					}
					var y = document.getElementsByClassName(id);
					if(y[0].className.indexOf('up') > -1){
						console.log("from uup")
						$('.'+id).removeClass('fas fa-chevron-up')
						$('.'+id).addClass('fas fa-chevron-down')
					}else{
						$('.'+id).removeClass('fas fa-chevron-down')
						$('.'+id).addClass('fas fa-chevron-up')
					}
				},10)
			}

			if(objFromHome && objFromHome.listOfFolders){
				for(var i = 0; i < objFromHome.listOfFolders.length; i++){
					(function(i){
						console.log('from foreach',objFromHome.listOfFolders)
						toggleForWeek(objFromHome.listOfFolders[i]);
						if(i == objFromHome.listOfFolders.length - 1){
							$scope.openMaterial({link:objFromHome.path,title:objFromHome.title})
						}
							
					}(i))
				}
			}else{
				toggleForWeek(id)
			}

		}
		

		
			$scope.onLoad = function() {
				$scope.loadingPdf = false;
			}

		$scope.openMaterial = function(obj){
			$rootScope.classroom = null;
			$scope.displayAreaFlag = false;
			var extArr = obj.link.split('.');
			console.log('extArr',extArr)
			if(extArr[extArr.length-1] == 'pdf'){
				$scope.loadingPdf = true;
				$scope.videos = [];
				$scope.fileAvailable = true;
				$scope.videoAvailable = false;
				$scope.pdfUrl = obj.link;
			}
			else if(extArr[extArr.length-1] == 'ppt')
				console.log('ppt');
			else{
				$scope.fileAvailable = false;
				$scope.videoAvailable = true;
				$scope.videos = [{"type":"mp4","src":obj.link,"poster":"http://www.videojs.com/img/poster.jpg","captions":"http://www.videojs.com/vtt/captions.vtt"}];				
			}

			$timeout(function(){
				$('.material-link').removeClass('training-material-active');
		   		 $('#'+obj.id).addClass('training-material-active');
			})
		}


	});

		


	function message(message,ngToast,call){
		ngToast.create(message);
		if(call)
			call();
	}
	