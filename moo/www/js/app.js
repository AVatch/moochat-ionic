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
      .state('app', {
        abstract: true,
        controller: 'BaseController'
      })

      .state('app.authentication', {
        url: '/authentication',  
        templateUrl: '/templates/authentication_partials/authentication.tmpl.html',
        controller: 'AuthenticationController'
      })

      .state('app.threads', {
        url: '/threads',  
        templateUrl: 'threads/templates/threads.tmpl.html',
        controller: 'ThreadsController'
      })

      .state('app.thread', {
        url: '/thread/:pk',
        templateUrl: '/thread/templates/thread.tmpl.html',
        controller: 'ThreadController' 
      });
  }])
  
  // Setup Services
  
  // Setup Controllers

.controller('BaseController', ['$scope',
  function($scope){
    console.log("I am in the core");
}])

.controller('AuthenticationController', ['$scope',
  function($scope){
    console.log("I am in the core");
}])

.controller('ThreadsController', ['$scope',
  function($scope){
    console.log("I am in the core");
}])

.controller('ThreadController', ['$scope',
  function($scope){
    console.log("I am in the core");
}]);
