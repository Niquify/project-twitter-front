(function(){
    var app = angular.module('wt-main',['ui.router']);
    
    app.config(['$stateProvider','$urlRouterProvider',
        function($stateProvider, $urlRouterProvider){
          $stateProvider
            .state('template',{
              abstract: true,
              templateUrl: 'main.html'
            })
            .state('profile',{
              url: '/profile',
              templateUrl: 'profile.html',
              active: 'profile'
            })
            .state('login',{
              url: '',
              templateUrl: 'login.html',
              active: 'login'
            });

            $urlRouterProvider.otherwise('/profile');
        }
      ]);
    
    app.controller('Nav-Controller', function($state){
        this.isActive = function(state){
            return $state.current.active == state;
        }
    });
    
    app.directive('userProfile', function(){
        return {
            restrict: 'E',
            templateUrl: 'templates/user-profile.html',
            controller: ['$http', function($http){
                this.isFetched = false;
                var ctrl = this;
                this.getUserProfile = function(){
//                    $http.get("http://localhost:8888/profile?user="+$("#userProfileInput").val()).then(function(response){
//                        ctrl.profile = response.data;
//                        ctrl.isFetched = true;
//                    });
                    this.profile = {"userId":29873662,"screenName":"MKBHD","userName":"Marques Brownlee","description":"Web Video Producer | ⋈","location":"NYC","createdDate":1239238200000,"tweetCount":36781,"friendsCount":202,"followersCount":1212108,"favoritesCount":21780,"verified":true,"timeZone":"Eastern Time (US & Canada)","utcOffset":-18000,"sidebarBorderColor":"000000","sidebarFillColor":"C0DFEC","backgroundColor":"EDECE9","textColor":"333333","linkColor":"6C4585","backgroundImageUrl":"http://pbs.twimg.com/profile_background_images/378800000061582783/2a5ada827f010eeaeda7916e800bc394.png","backgroundImageTiled":true,"profileImageUrl":"http://pbs.twimg.com/profile_images/818557354123870208/QRDP8wcd.jpg","protected":false};
                    ctrl.isFetched = true;
                };
            }],
            controllerAs: 'profileCtrl'
        };
    });
    
    app.directive('tweetStatistics', function(){
        return {
            restrict: 'E',
            templateUrl: 'templates/tweet-stats.html',
            controller: ['$http', function($http){
                this.isFetched = false;
                var ctrl = this;
                this.getTweetStats = function(){
//                    $http.get("http://localhost:8888/profile?user="+$("#userProfileInput").val()).then(function(response){
//                        ctrl.profile = response.data;
//                        ctrl.isProfileFetched = true;
//                    });
                    this.stats = ;
                    ctrl.isFetched = true;
                };
            }],
            controllerAs: 'statsCtrl'
        };
    });
})();
