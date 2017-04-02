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

            $provide.factory('interceptor', ['$injector', function($injector) {
                return {
                  // optional method
                    'request': function(config) {
                        var url = config.url;
                        // Si és una peticio per comprovar si l'usuari esta connectat, retornam per evitar un bucle infinit.
                        if(url.startsWith("http://localhost:3000/check-login?")) return config;
                        // Si el client té una apiId generada.
                        if(localStorage.getItem("apiId") != null){
                            // Comprovam si esta connectat i assigname una variable loggedStatus segons el resultat.
                          $injector.get('$http').get("http://localhost:3000/check-login?apiId="+localStorage.getItem("apiId")).then(
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
                            if(localStorage.getItem("loggedStatus") == "false" || localStorage.getItem("loggedStatus") == undefined){
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
                        if(rejection.data.exception == "org.springframework.social.OperationNotPermittedException"){
                            $injector.get("ngNotify").set("This account has been suspended.",'error');
                        }
                        return rejection;
                    },
                };
              }]);

              $httpProvider.interceptors.push('interceptor');
        }
    ]);

    // Filtre
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
        var regex = new RegExp("( @[a-zA-Z0-9_]+ )(?![^<]*>|[^<>]*</)");
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
      this.isLogged = function(){
        var loggedStatus = localStorage.getItem("loggedStatus") == "true";
        return loggedStatus;
      };
      this.login = function(){
        if(localStorage.getItem("apiId") == null){
            var id = Math.floor(Math.random() * 1000000000000000);
            localStorage.setItem("apiId", id);
        }
        // Popup cap a l'autorització
        newwindow=window.open("http://localhost:3000/request_token?apiId="+localStorage.getItem("apiId"),"wt-twitter-login",'height=400,width=350');
        // Focus al popup.
        if (window.focus) {newwindow.focus()}
      };
      this.logout = function(){
          if(localStorage.getItem("loggedStatus") == "true"){
              $http.get("http://localhost:3000/logout?apiId="+localStorage.getItem("apiId")).then(
                function(response){
                    window.location.href = "http://localhost:8000/";
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
            this.screenName = document.getElementById("userProfileInput").value;
            toggleLoading("main");
            $http({
              method: 'GET',
              url: 'http://localhost:3000/profile?user='+this.screenName+'&apiId='+localStorage.getItem("apiId"),
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
                    toggleLoading("main");
                    if(response.status == "500") return;
                    ctrl.profile = response.data;
                    // Reemplaçam els links de twitter en la seva biografia.
                    $rootScope.profile = ctrl.profile;
                    ctrl.profileFetched = true;
                    document.getElementById("user-main").style.background = "url("+ctrl.profile.backgroundImageUrl+")";
                    document.getElementById("user-main").style.backgroundSize = "cover";
                    document.getElementById("user-main").style.backgroundPosition = "top center";
                    document.getElementById("user-main").style.backgroundRepeat = "no-repeat";
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
        this.loading = false;
        this.getTweetStats = function(){
            ngNotify.set('Retrieving the statistics, please wait..','info');
            toggleLoading("stats");
            this.loading = true;
            $http.get("http://localhost:3000/statistics?userId="+$rootScope.profile.userId+"&apiId="+localStorage.getItem("apiId")).then(
                function(response){ // Success
                    toggleLoading("stats");
                    ctrl.loading = false;
                    if(response.status == "500") return;
                    ctrl.userStatistics = response.data;
                    var mostReplied = ctrl.userStatistics.userFollowerStatistics.mostRepliedTo;
                    ctrl.userStatistics.userFollowerStatistics.mostRepliedTo = buildMostRepliedObj(mostReplied);
                    ctrl.renderTweetTimeChart();
                    ctrl.statsFetched = true;
                }, function(data){ // Error
                    toggleLoading("stats");
                    this.loading = false;
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
        this.renderTweetTimeChart = function(){
            document.getElementById("tweetTimeChart").remove();
            document.getElementById("chart-cont").innerHTML = "<canvas id=\"tweetTimeChart\"></canvas>";
            var ctx = document.getElementById("tweetTimeChart").getContext("2d");
            var entrySet = this.userStatistics.userTweetTime.entrySet.replace(/[{},]/g, '');
            var entrySet = entrySet.split(" ").sort();
            var data = [];
            var keys = [];
            for(i=0; i<entrySet.length; i++){
                var fields = entrySet[i].split("=");
                keys.push(fields[0]);
                data.push(fields[1]);
            }
            keys.sort();
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
// Mostra o amaga els spinners
function toggleLoading(type){
  var spinner;
  if(type == "main"){
    spinner = document.getElementById("main-spinner");
  } else if(type == "stats"){
    spinner = document.getElementById("stats-spinner");
  }
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
