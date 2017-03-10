(function(){
    var app = angular.module('wt-main',['ui.router','ngNotify']);

    app.config(['$stateProvider','$urlRouterProvider','$provide','$httpProvider',
        function($stateProvider, $urlRouterProvider, $provide, $httpProvider){
          $stateProvider
            .state('template',{
              abstract: true,
              templateUrl: 'index.html'
            })
            .state('profile',{
              url: '/profile',
              templateUrl: 'profile.html',
              active: 'profile'
            })
            .state('main',{
              url: '/',
              templateUrl: 'main.html',
              active: 'main'
            });

            $urlRouterProvider.otherwise('/');

            $provide.factory('myHttpInterceptor', ['$injector', function($injector) {
                return {
                  // optional method
                    'request': function(config) {
                        if(config.url != 'main.html'){
                            if(localStorage.getItem("apiId") == null){
                                $injector.get("$state").go('main');
                                $injector.get("ngNotify").set('You are not logged in.','error');
                            }
                        }
                        return config;
                    }
                };
              }]);

              $httpProvider.interceptors.push('myHttpInterceptor');
        }
    ]);
    // Nav controller used to know which tab should be active.
    app.controller('Nav-Controller', function($state){
        this.isActive = function(state){
            return $state.current.active == state;
        }
    });

    app.controller('LoginController', ['$http',function($http){
      this.isLogged = function(){
        return localStorage.getItem("apiId") != null;
      };
      this.login = function(){
        if(localStorage.getItem("apiId") == null){
            var id = Math.floor(Math.random() * 1000000000000000);
            localStorage.setItem("apiId", id);
        }
        newwindow=window.open("http://192.168.1.2:3000/request_token?apiId="+localStorage.getItem("apiId"),"wt-twitter-login",'height=400,width=350');
        if (window.focus) {newwindow.focus()}
      };
    }]);

    app.controller('ProfileController',  ['$http','$rootScope','ngNotify', function($http,$rootScope,ngNotify){
        this.profileFetched = false;
        var ctrl = this;
        this.screenName;
        this.getUserProfile = function(){
            this.screenName = document.getElementById("userProfileInput").value;
            toggleLoading();
            $http.get("http://192.168.1.2:3000/profile?user="+this.screenName+"&apiId="+localStorage.getItem("apiId")).then(
                function(response){ // Success
                    ctrl.profile = response.data;
                    console.log(JSON.stringify(response.data));
                    $rootScope.userId = ctrl.profile.userId;
                    ctrl.profileFetched = true;
                    toggleLoading();
                    document.getElementById("user-main").style.background = "url("+ctrl.profile.backgroundImageUrl+")"
                }, function(error){ // Error
                    if(error.data.exception == "org.springframework.social.connect.NotConnectedException"){
                        ngNotify.set("Please log in first.",'error');
                    } else if (error.data.exception == "org.springframework.social.ResourceNotFoundException"){
                        ngNotify.set("User not found.",'error');
                    }
                    toggleLoading();
                }
            );
        };
    }]);

    app.controller("StatisticsController", ['$http','$rootScope','ngNotify', function($http,$rootScope,ngNotify){
        this.statsFetched = false;
        var ctrl = this;
        this.userStatistics;
        this.getTweetStats = function(){
            toggleLoading();
            $http.get("http://192.168.1.2:3000/statistics?userId="+$rootScope.userId+"&apiId="+localStorage.getItem("apiId")).then(
                function(response){ // Success
                    toggleLoading();
                    ctrl.userStatistics = response.data;
                    var mostReplied = ctrl.userStatistics.userFollowerStatistics.mostRepliedTo;
                    ctrl.userStatistics.userFollowerStatistics.mostRepliedTo = buildMostRepliedObj(mostReplied);
                    ctrl.statsFetched = true;
                }, function(data){ // Error
                    toggleLoading();
                    ngNotify.set('There was an error retrieving the statistics.', 'error');
                }
            );
            function buildMostRepliedObj(mostReplied){
                var mostRepliedObj = [];
                for(i=0; i<mostReplied.length; i++){
                    var str = mostReplied[i];
                    var name = mostReplied[i].split(",")[0];
                    var count = mostReplied[i].split(",")[1];
                    mostRepliedObj.push({name: name, count: count});
                }
                return mostRepliedObj;
            }
        };
    }]);
})();

var loading = false;
function toggleLoading(){
  var spinner = document.getElementById("main-spinner");
  if(loading){
    spinner.style.display = "none";
    loading = false;
  } else {
    spinner.style.display = "block";
    loading = true;
  }
}

$(document).on('click','.navbar-collapse.in',function(e) {
    if( $(e.target).is('a') && $(e.target).attr('class') != 'dropdown-toggle' ) {
        $(this).collapse('hide');
    }
});

var logging = false;
function toggleModal(){
    var modal = document.createElement("div");
    modal.style.height = window.innerHeight + "px";
    modal.style.width = window.innerWidth + "px";
}
