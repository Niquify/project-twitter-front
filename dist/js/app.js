(function(){
    var app = angular.module('wt-main',['ui.router','ngNotify','ngSanitize']);

    app.config(['$stateProvider','$urlRouterProvider','$provide','$httpProvider',
        function($stateProvider, $urlRouterProvider, $provide, $httpProvider){
          $stateProvider
            .state('template',{
              abstract: true,
              templateUrl: 'index.html'
            })
            .state('profile',{
              url: '/profile',
              templateUrl: 'profile.html'
            })
            .state('main',{
              url: '/',
              templateUrl: 'main.html'
            });

            $urlRouterProvider.otherwise('/');

            $provide.factory('loginInterceptor', ['$injector', function($injector) {
                return {
                  // optional method
                    'request': function(config) {
                        var url = config.url;
                        // Si és una peticio per comprovar si l'usuari esta connectat, retornam per evitar un bucle infinit.
                        if(url.startsWith("http://192.168.1.2:3000/check-login?")) return config;
                        // Si el client té una apiId generada.
                        if(localStorage.getItem("apiId") != null){
                            // Comprovam si esta connectat i assigname una variable loggedStatus segons el resultat.
                          $injector.get('$http').get("http://192.168.1.2:3000/check-login?apiId="+localStorage.getItem("apiId")).then(
                            function(response){
                                localStorage.setItem("loggedStatus",response.data);
                            },
                              function(error){
                                localStorage.setItem("loggedStatus",false);
                            }
                          );
                        }
                        // Si la petició es cap a una url que no sigui l'inici.
                        if(config.url != 'main.html'){
                            // Comprovam si el client esta connectat.
                            if(localStorage.getItem("loggedStatus") == "false"){
                                // Si no esta connectat el retornam al inici.
                                $injector.get("$state").go('main');
                                $injector.get("ngNotify").set('You are not logged in.','error');
                            }
                        }
                        return config;
                    },
                    'responseError': function(rejection) {
                        console.log(rejection);
                        if(rejection.data.exception === "org.springframework.social.RateLimitExceededException"){
                            $injector.get("ngNotify").set('Your rate limit has been exceeded, try again in a few minutes.','error');
                        }
                        if(rejection.data.exception === "org.springframework.social.NotAuthorizedException"){
                            $injector.get("ngNotify").set('You are not authorized to access this user\'s data.','error');
                        }
                        if (rejection.data.exception == "org.springframework.social.ResourceNotFoundException"){
                            $injector.get("ngNotify").set("User not found.",'error');
                        }
                        if(rejection.data.exception == "org.springframework.social.connect.NotConnectedException"){
                            $injector.get("ngNotify").set("Please log in first.",'error');
                        }
                    },
                };
              }]);

              $httpProvider.interceptors.push('loginInterceptor');
        }
    ]);
    
    app.filter('twlink', function(){
        return function(input){
            var output = sanitizeTwitterLink(input);
            return output;
        }
    })
    
    // Funció que cerca links cap a twitter.
    function sanitizeTwitterLink(input){
        // Fa match en cas de que trobi una '@' seguida d'una seqüència alfanumèrica, amb un espai a cada banda.
        // A més, comprova que no estigui dins d'un tag HTML, de manera que una vegada s'ha rodejat d'un tag <a> no tornarà a fer match.
        var regex = new RegExp("( @[a-zA-Z0-9]+ )(?![^<]*>|[^<>]*</)");
        while(regex.test(input)){
            // $1 és el contingut del primer grup de la expresió regular, és a dir, el usuari de twitter
            input = input.replace(regex, '<a href="http://twitter.com/'+RegExp.$1.replace('@','').trim()+'">'+RegExp.$1+'</a>');
        }
        return input;
    }
    
    // Controlador que serveix bàsicament per tenir accés al $state desde el html per determinar la classe active.
    app.controller('Nav-Controller', ['$state','$scope', function($state, $scope){
        $scope.$state = $state;
    }]);

    // Controlador que s'encarrega de determinar si l'usuari esta connectat o d'enviarlo cap a l'autorització OAuth1.
    app.controller('LoginController', ['$http','$rootScope','ngNotify',function($http, $rootScope, ngNotify){
      this.profile = JSON.parse(localStorage.getItem("profile"));    
      this.isLogged = function(){
        var loggedStatus = localStorage.getItem("loggedStatus") == "true";
        if(localStorage.getItem("profile") == undefined) this.getProfile();
        return loggedStatus;
      };
      this.getProfile = function(){
        if(this.fetchingProfile) return;
        this.fetchingProfile = true;
        if(localStorage.getItem("loggedStatus") == "true"){
            $http.get("http://192.168.1.2:3000/profile?apiId="+localStorage.getItem("apiId")).then(
                function(response){
                    localStorage.setItem("profile", JSON.stringify(response.data));
                }
            );
        }  
      };    
      this.login = function(){
        if(localStorage.getItem("apiId") == null){
            var id = Math.floor(Math.random() * 1000000000000000);
            localStorage.setItem("apiId", id);
        }
        // Popup cap a l'autorització
        newwindow=window.open("http://192.168.1.2:3000/request_token?apiId="+localStorage.getItem("apiId"),"wt-twitter-login",'height=400,width=350');
        // Focus al popup.
        if (window.focus) {newwindow.focus()}
      };
      this.logout = function(){
          if(localStorage.getItem("loggedStatus") == "true"){
              $http.get("http://192.168.1.2:3000/logout?apiId="+localStorage.getItem("apiId")).then(
                function(response){
                    window.location.href = "http://192.168.1.2:8000/";
                }
              );
          }
      }
    }]);
    
    // Controlador que s'encarrega de fer la petició AJAX per recuperar el perfil de l'usuari.
    app.controller('ProfileController',  ['$http','$rootScope','ngNotify', function($http,$rootScope,ngNotify){
        this.profileFetched = false;
        $rootScope.profileFetched = this.profileFetched;
        // Per poder accedir a this més endavant, guardam en variable.
        var ctrl = this;
        this.screenName;
        this.getUserProfile = function(){
            console.log("Getting user profile...");
            this.screenName = document.getElementById("userProfileInput").value;
            toggleLoading();
            $http({
              method: 'GET',
              url: 'http://192.168.1.2:3000/profile?user='+this.screenName+'&apiId='+localStorage.getItem("apiId"),
              // transformResponse permet parsejar per el meu compte les respostes. 
              // Com els id d'usuari venen en forma de long, cada nombre passat els 16 caràcters sirà reemplaçat per '0'.
              transformResponse: [function(data){
                try{
                  // Quan arribi un perfil, es fa la cridada a fixUserId que pasa el long userId a string.    
                  return fixUserId(data);
                } catch (e){
                  // Si no és un perfil, hi haurà un error a la funció fixUserId, per tant podem retornar la resposta.
                  return JSON.parse(data);
                }
              }]
            }).then(
                function(response){ // Success
                    try{
                        ctrl.profile = response.data;
                        // Reemplaçam els links de twitter en la seva biografia.
                        ctrl.profile.description = sanitizeTwitterLink(ctrl.profile.description);
                        $rootScope.profile = ctrl.profile;
                        ctrl.profileFetched = true;
                        toggleLoading();
                        document.getElementById("user-main").style.background = "url("+ctrl.profile.backgroundImageUrl+")";
                    } catch(err){
                        toggleLoading();
                    } 
                }
            );
        };
        this.cleanProfile = function(){
            this.profileFetched = false;
        }
    }]);

    // Controlador que s'encarrega de fer la petició AJAX per recuperar les estadístiques del usuari.
    app.controller("StatisticsController", ['$http','$rootScope','ngNotify', function($http,$rootScope,ngNotify){
        this.statsFetched = false;
        var ctrl = this;
        this.userStatistics;
        this.getTweetStats = function(){
            toggleLoading();
            $http.get("http://192.168.1.2:3000/statistics?userId="+$rootScope.profile.userId+"&apiId="+localStorage.getItem("apiId")).then(
                function(response){ // Success
                    toggleLoading();
                    ctrl.userStatistics = response.data;
                    var mostReplied = ctrl.userStatistics.userFollowerStatistics.mostRepliedTo;
                    ctrl.userStatistics.userFollowerStatistics.mostRepliedTo = buildMostRepliedObj(mostReplied);
                    ctrl.renderTweetTimeChart();
                    ctrl.statsFetched = true;
                }, function(data){ // Error
                    toggleLoading();
                    console.log(data);
                    ngNotify.set('There was an error retrieving the statistics.', 'error');
                }
            );
            // Funció que crea un objecte que representa una persona amb la que ha interaccionat el usuari i el nombre de vegades que ha interaccionat.
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
        this.cleanProfile = function(){
            this.statsFetched = false;
        };
        this.renderTweetTimeChart = function(){
            document.getElementById("tweetTimeChart").remove();
            document.getElementById("chart-cont").innerHTML = "<canvas id=\"tweetTimeChart\"></canvas>";
            var ctx = document.getElementById("tweetTimeChart").getContext("2d");
            var entrySet = this.userStatistics.userTweetTime.entrySet;
            var data = [];
            var keys = Object.keys(this.userStatistics.userTweetTime.entrySet).sort();
            for(i=0; i<keys.length; i++){
                data.push(entrySet[keys[i]]);
            }
            var chart = new Chart(ctx, {
                type: 'line',
                data: {
                    maintainAspectRatio: false,
                    labels: keys,
                    datasets: [{
                        label: '# of Tweets',
                        data: data,
                        backgroundColor: 'rgba(54, 162, 235, 0.2)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 2
                    }]
                },
                options: {
                    scales: {
                        yAxes: [{
                            ticks: {
                                beginAtZero:true
                            }
                        }],
                    }
                }
            });
        }
    }]);
})();

var loading = false;
// Mostra o amaga el spinner
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

// Event necessari per que el navbar s'amagui al fer clic en un link.
$(document).on('click','.navbar-collapse.in',function(e) {
    if( $(e.target).is('a') && $(e.target).attr('class') != 'dropdown-toggle' ) {
        $(this).collapse('hide');
    }
});

// Funció que cerca el userId i el rodeja de '"'.
function fixUserId(data){
    // Expresió regular que fa match a '"userId":' seguit d'una seqüència de nombres fins una coma.
    var regex = /"userId":\d+,/i;
    var userIdStr = data.match(regex)[0];
    var start = userIdStr.indexOf(":") + 1;
    var end = userIdStr.indexOf(",");
    var slice = userIdStr.slice(start,end);
    var id = "\""+slice+"\"";
    var fixed = data.replace(slice, id);
    return JSON.parse(fixed);
}
