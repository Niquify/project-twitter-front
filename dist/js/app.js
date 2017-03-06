(function(){
    var app = angular.module('wt-main',['ui.router']);

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

            $urlRouterProvider.otherwise('/profile');

            $provide.factory('myHttpInterceptor', function($q,$location) {
                return {
                  // optional method
                  'request': function(config) {

                    console.log('intercepted');
                    if(config.url != 'main.html'){
                      if(localStorage.getItem("userId") != null){
                        return config;
                      } else {
                        $state.go("main");
                      }
                    }
                   return config;
                  },

                  // optional method
                 'requestError': function(rejection) {
                    // do something on error
                    if (canRecover(rejection)) {
                      return responseOrNewPromise
                    }
                    return $q.reject(rejection);
                  },



                  // optional method
                  'response': function(response) {
                    // do something on success
                    return response;
                  },

                  // optional method
                 'responseError': function(rejection) {
                    // do something on error
                    if (canRecover(rejection)) {
                      return responseOrNewPromise
                    }
                    return $q.reject(rejection);
                  }
                };
              });

              $httpProvider.interceptors.push('myHttpInterceptor');
        }
    ]);
    // Nav controller used to know which tab should be active.
    app.controller('Nav-Controller', function($state){
        this.isActive = function(state){
            return $state.current.active == state;
        }
    });

    app.controller('LoginController', function(){
      this.isLogged = function(){
        return localStorage.getItem("userId") != null;
      };
      this.login = function(){
        var id = Math.floor(Math.random() * 1000000000000000);
        localStorage.setItem("userId", id);
        newwindow=window.open("http://localhost:8081/request_token  ","wt-twitter-login",'height=400,width=350');
        if (window.focus) {newwindow.focus()}
      }
    });

    app.directive('userProfile', function(){
        return {
            restrict: 'E',
            templateUrl: 'templates/user-profile.html',
            controller: ['$http', function($http){
                this.isFetched = false;
                var ctrl = this;
                this.userId;
                this.screenName;
                this.getUserProfile = function(){
                    this.screenName = document.getElementById("userProfileInput").value;
                    toggleLoading();
                    $http.get("http://localhost:3000/profile?user="+this.screenName).then(function(response){
                       ctrl.profile = response.data;
                       ctrl.isFetched = true;
                       toggleLoading();
                    });
                    //this.profile = {"userId":29873662,"screenName":"MKBHD","userName":"Marques Brownlee","description":"Web Video Producer | ⋈","location":"NYC","createdDate":1239238200000,"tweetCount":36939,"friendsCount":202,"followersCount":1217116,"favoritesCount":21908,"verified":true,"timeZone":"Eastern Time (US & Canada)","utcOffset":-18000,"sidebarBorderColor":"000000","sidebarFillColor":"C0DFEC","backgroundColor":"EDECE9","textColor":"333333","linkColor":"6C4585","backgroundImageUrl":"http://pbs.twimg.com/profile_background_images/378800000061582783/2a5ada827f010eeaeda7916e800bc394.png","backgroundImageTiled":true,"profileImageUrl":"http://pbs.twimg.com/profile_images/818557354123870208/QRDP8wcd.jpg","protected":false};
                    //ctrl.isFetched = true;
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
//                    $http.get("http://localhost:8888/statistics?userId="+).then(function(response){
//                        ctrl.stats = response.data;
//                        ctrl.isFetched = true;
//                    });
                    this.stats = {"ratio":{"userId":29873662,"retweetRatio":1.0,"favoriteRatio":0.1155248},"mostRetweeted":{"tweetId":830894885603536898,"text":"Carrier logic:\n\nDiscontinue unlimited data\n\nKick everyone off those plans\n\nBring unlimited data back\n\nUp-charge cus… https://t.co/boAsc11Teg","createdAt":1486935752000,"fromUserName":"MKBHD","fromUserId":29873662,"toUserId":0,"inReplyToStatusId":0,"inReplyToUserId":0,"inReplyToScreenName":"null","languageCode":"en","retweetCount":1678,"favoriteCount":6376,"userProfile":{"userId":29873662,"screenName":"MKBHD","userName":"Marques Brownlee","description":"Web Video Producer | ⋈","location":"NYC","createdDate":1239238200000,"tweetCount":36939,"friendsCount":202,"followersCount":1217116,"favoritesCount":21908,"verified":true,"timeZone":"Eastern Time (US & Canada)","utcOffset":-18000,"sidebarBorderColor":"000000","sidebarFillColor":"C0DFEC","backgroundColor":"EDECE9","textColor":"333333","linkColor":"6C4585","backgroundImageUrl":"http://pbs.twimg.com/profile_background_images/378800000061582783/2a5ada827f010eeaeda7916e800bc394.png","backgroundImageTiled":true,"profileImageUrl":"http://pbs.twimg.com/profile_images/818557354123870208/QRDP8wcd.jpg","protected":false},"retweet":false},"mostFavorited":{"tweetId":829717696799453187,"text":"How I'm measuring our snowfall so far https://t.co/C8EbgVKM5h","createdAt":1486655088000,"fromUserName":"MKBHD","fromUserId":29873662,"toUserId":0,"inReplyToStatusId":0,"inReplyToUserId":0,"inReplyToScreenName":"null","languageCode":"en","retweetCount":909,"favoriteCount":8471,"userProfile":{"userId":29873662,"screenName":"MKBHD","userName":"Marques Brownlee","description":"Web Video Producer | ⋈","location":"NYC","createdDate":1239238200000,"tweetCount":36939,"friendsCount":202,"followersCount":1217116,"favoritesCount":21908,"verified":true,"timeZone":"Eastern Time (US & Canada)","utcOffset":-18000,"sidebarBorderColor":"000000","sidebarFillColor":"C0DFEC","backgroundColor":"EDECE9","textColor":"333333","linkColor":"6C4585","backgroundImageUrl":"http://pbs.twimg.com/profile_background_images/378800000061582783/2a5ada827f010eeaeda7916e800bc394.png","backgroundImageTiled":true,"profileImageUrl":"http://pbs.twimg.com/profile_images/818557354123870208/QRDP8wcd.jpg","protected":false},"retweet":false},"bestTweet":{"tweetId":828067155249922048,"text":"An airplane ticket… is like overnight shipping… but for people","createdAt":1486261569000,"fromUserName":"MKBHD","fromUserId":29873662,"toUserId":0,"inReplyToStatusId":0,"inReplyToUserId":0,"inReplyToScreenName":"null","languageCode":"en","retweetCount":1473,"favoriteCount":8291,"userProfile":{"userId":29873662,"screenName":"MKBHD","userName":"Marques Brownlee","description":"Web Video Producer | ⋈","location":"NYC","createdDate":1239238200000,"tweetCount":36939,"friendsCount":202,"followersCount":1217116,"favoritesCount":21908,"verified":true,"timeZone":"Eastern Time (US & Canada)","utcOffset":-18000,"sidebarBorderColor":"000000","sidebarFillColor":"C0DFEC","backgroundColor":"EDECE9","textColor":"333333","linkColor":"6C4585","backgroundImageUrl":"http://pbs.twimg.com/profile_background_images/378800000061582783/2a5ada827f010eeaeda7916e800bc394.png","backgroundImageTiled":true,"profileImageUrl":"http://pbs.twimg.com/profile_images/818557354123870208/QRDP8wcd.jpg","protected":false},"retweet":false}} ;
                    this.followerStats = {"userId":29873662,"mostRepliedTo":["MKBHD,8","austinnotduncan,5","Dave2Dtv,4","SnazzyQ,4","tldtoday,4"],"tweetCount":200}
                    var mostReplied = this.followerStats.mostRepliedTo;
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
                    this.followerStats.mostRepliedTo = buildMostRepliedObj(mostReplied);
                    ctrl.isFetched = true;
                };
            }],
            controllerAs: 'statsCtrl'
        };
    });
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

var userInput = document.getElementById("userProfileInput");
userInput.addEventListener("keyup", function(event){
  
});
