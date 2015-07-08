// MooChat

angular.module('moo', ['ionic', 
                       'ionic.service.core', 
                       'ionic.service.analytics',
                       'ngCordova',
                       'LocalStorageModule',

                       'moo.controllers.accounts',
                       'moo.services.accounts',
                       'moo.directives.accounts',

                       'moo.controllers.authentication',
                       'moo.services.authentication',

                       'moo.controllers.gifs',
                       'moo.services.gifs',

                       'moo.controllers.notes',
                       'moo.services.notes',
                       
                       'moo.controllers.threads',
                       'moo.services.threads'])

// Setup Constants

.constant('DOMAIN', 'http://moochat-api-dev.elasticbeanstalk.com')
// .constant('DOMAIN', 'localhost:8000')

.constant('COLORS', ['#F44336', '#E91E63', '#9C27B0', '#673AB7', 
                     '#3F51B5', '#2196F3', '#03A9F4', '#00BCD4', 
                     '#009688', '#4CAF50', '#8BC34A', '#CDDC39',
                     '#FFEB3B', '#FFC107', '#FF9800', '#FF5722',
                     '#795548', '#9E9E9E', '#607D8B'])

// Setup Initialization Logic

.run(function($ionicPlatform, $cordovaStatusbar, $rootScope, 
  $state, $urlRouter, $ionicAnalytics, Authentication, Account) {

  $ionicPlatform.ready(function() {
    $ionicAnalytics.register();
    
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      // StatusBar.styleDefault();
      StatusBar.backgroundColorByHexString('#9C27B0');
    }
  });
  
  // check if the user is authenticated
  $rootScope.$on('$locationChangeSuccess', function(evt) {
     // Halt state change from even starting
     evt.preventDefault();
     // Verify the user has a session token
     var sessionToken = Authentication.getToken();
     // Continue with the update and state transition if logic allows
     if(sessionToken){
        $urlRouter.sync();
     }else{
        $state.go('authentication');
     }
   });
})

// Setup localstorage

.config(['localStorageServiceProvider',
  function(localStorageServiceProvider) {
    localStorageServiceProvider
      .setPrefix('moo');
}])

// Setup Routes

.config(['$stateProvider', '$urlRouterProvider', '$ionicAppProvider',
  function($stateProvider, $urlRouterProvider, $ionicAppProvider) {

    // Identify app
    $ionicAppProvider.identify({
      app_id: 'c1ce80f9',
      api_key: '8a5a069708c38a020b7b686fd611190d5d60ec75ed6bb4a2'
    });

    //
    // For any unmatched url, redirect to /stream
    $urlRouterProvider.otherwise('/threads')
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

.directive('ngEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if(event.which === 13) {
                scope.$apply(function (){
                    scope.$eval(attrs.ngEnter);
                });
 
                event.preventDefault();
            }
        });
    };
});
