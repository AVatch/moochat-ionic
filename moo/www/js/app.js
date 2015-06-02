// MooChat

angular.module('moo', ['ionic'])

// Setup Constants

.constant('DOMAIN', 'http://127.0.0.1:8000')

// Setup Initialization Logic

.run(function($ionicPlatform) {

  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})

// Setup Routes

.config(['$stateProvider', '$urlRouterProvider',
  function($stateProvider, $urlRouterProvider) {

    //
    // For any unmatched url, redirect to /stream
    $urlRouterProvider.otherwise('/authentication')
    //
    // Set the states
    $stateProvider
      .state('authentication', {
        url: '/authentication',  
        templateUrl: 'js/authentication/templates/authentication.tmpl.html',
        controller: 'AuthenticationController'
      })

      .state('threads', {
        url: '/threads',  
        templateUrl: 'js/threads/templates/threads.tmpl.html',
        controller: 'ThreadsController'
      })

      .state('thread', {
        url: '/thread/:pk',
        templateUrl: 'js/threads/templates/thread.tmpl.html',
        controller: 'ThreadController' 
      });
  }])
  
// Setup Services
  
// Setup Controllers

.controller('AuthenticationController', ['$scope',
  function($scope){
    console.log("I am in the authentication");
}])

.controller('ThreadsController', ['$scope',
  function($scope){
    console.log("I am in the threads");
}])

.controller('ThreadController', ['$scope',
  function($scope){
    console.log("I am in the thread");
}]);
