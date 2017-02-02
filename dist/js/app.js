(function(){
  var app = angular.module('wt-profile',[]);
    app.directive('userProfile', function(){
        return {
            restrict: 'E',
            templateUrl: 'templates/user-profile.html',
            controller: ['$http', function($http){
                this.isProfileFetched = false;
                var ctrl = this;
                this.getUserProfile = function(){
//                    $http.get("http://localhost:8888/profile?user="+$("#userProfileInput").val()).then(function(response){
//                        ctrl.profile = response.data;
//                        ctrl.isProfileFetched = true;
//                    });
                    this.profile = {"userId":29873662,"screenName":"MKBHD","userName":"Marques Brownlee","description":"Web Video Producer | ⋈","location":"NYC","createdDate":1239238200000,"tweetCount":36781,"friendsCount":202,"followersCount":1212108,"favoritesCount":21780,"verified":true,"timeZone":"Eastern Time (US & Canada)","utcOffset":-18000,"sidebarBorderColor":"000000","sidebarFillColor":"C0DFEC","backgroundColor":"EDECE9","textColor":"333333","linkColor":"6C4585","backgroundImageUrl":"http://pbs.twimg.com/profile_background_images/378800000061582783/2a5ada827f010eeaeda7916e800bc394.png","backgroundImageTiled":true,"profileImageUrl":"http://pbs.twimg.com/profile_images/818557354123870208/QRDP8wcd.jpg","protected":false};
                    ctrl.isProfileFetched = true;
                };
            }],
            controllerAs: 'profileCtrl'
        };
    });
})();
