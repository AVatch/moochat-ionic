// MooChat

angular.module('moo', ['ionic', 'LocalStorageModule'])

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

.factory('Authentication', ['$http', 'localStorageService','DOMAIN',
  function($http, localStorageService, DOMAIN){
    
    var authenticateUser = function(credentials){
      var response = $http({
        url: DOMAIN + '/api/v1/api-token-auth/',
        method: 'POST',
        contentType: "application/json; charset=UTF-8",
        data: credentials
      });
      return response;
    };

    var registerUser = function(user){
      var response = $http({
        url: DOMAIN + '/api/v1/accounts/create/',
        method: 'POST',
        contentType: "application/json; charset=UTF-8",
        data: user
      });
      return response;
    };

    var getToken = function(){
      return localStorageService.get('token');
    };

    var cacheToken = function(token){
      return localStorageService.set('token', token);
    };

    return{
      authenticateUser: authenticateUser,
      registerUser: registerUser,

      getToken: getToken,
      cacheToken: cacheToken
    };
}])

.factory('Account', ['$http', 'Authentication', 'DOMAIN',
  function($http, Authentication, DOMAIN){
    
    var me = function(){
      var token = Authentication.getToken();
      var response = $http({
                        url: DOMAIN + '/api/v1/me/',
                        method: 'GET',
                        headers: { 
                          'Content-Type': 'application/json',
                          'Authorization': 'Token ' + token.token },
                        data: ''
                      });
      return response;
    };

    var getFriendList = function(pk){
      var token = Authentication.getToken();
      var response = $http({
                        url: DOMAIN + '/api/v1/accounts/' + pk + '/friends/',
                        method: 'GET',
                        headers: { 
                          'Content-Type': 'application/json',
                          'Authorization': 'Token ' + token.token },
                        data: ''
                      });
      return response;
    };
    
    var friendAccount = function(pk){
      var token = Authentication.getToken();
      var response = $http({
                        url: DOMAIN + '/api/v1/accounts/' + pk + '/friends/',
                        method: 'POST',
                        headers: { 
                          'Content-Type': 'application/json',
                          'Authorization': 'Token ' + token.token },
                        data: ''
                      });
      return response;
    };

    return{
      me: me,
      getFriendList: getFriendList,
      friendAccount: friendAccount    
    };
}])

.factory('Thread', ['$http', 'Authentication', 'DOMAIN',
  function($http, Authentication, DOMAIN){
    
    var pullThreadList = function(){
      var token = Authentication.getToken();
      var response = $http({
                        url: DOMAIN + '/api/v1/threads/',
                        method: 'GET',
                        headers: { 
                          'Content-Type': 'application/json',
                          'Authorization': 'Token ' + token.token },
                        data: ''
                      });
      return response;
    };

    var startThread = function(thread){
      var token = Authentication.getToken();
      var response = $http({
                        url: DOMAIN + '/api/v1/threads/',
                        method: 'POST',
                        headers: { 
                          'Content-Type': 'application/json',
                          'Authorization': 'Token ' + token.token },
                        contentType: "application/json; charset=UTF-8",
                        data: thread
                      });
      return response;
    };

    var getThread = function(pk){
      var token = Authentication.getToken();
      var response = $http({
                        url: DOMAIN + '/api/v1/threads/' + pk + '/',
                        method: 'GET',
                        headers: { 
                          'Content-Type': 'application/json',
                          'Authorization': 'Token ' + token.token },
                      });
      return response;
    };

    var getNotes = function(pk){
      var token = Authentication.getToken();
      var response = $http({
                        url: DOMAIN + '/api/v1/threads/' + pk + '/notes/',
                        method: 'GET',
                        headers: { 
                          'Content-Type': 'application/json',
                          'Authorization': 'Token ' + token.token },
                      });
      return response;
    };

    return{
      pullThreadList: pullThreadList,
      startThread: startThread,
      getThread: getThread,
      getNotes: getNotes
    };
}])
  
// Setup Controllers

.controller('AuthenticationController', ['$scope',
  function($scope){
    console.log("I am in the authentication");
}])

.controller('ThreadsController', ['$scope', '$ionicModal',
  function($scope, $ionicModal){
    console.log("I am in the threads");
    
    // Accounts modal
    $ionicModal.fromTemplateUrl('js/accounts/templates/profile.modal.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modal = modal;
    });
    $scope.openAccountModal = function() {
      $scope.modal.show();
    };
    $scope.closeAccountModal = function() {
      $scope.modal.hide();
    };
    
    // Start a thread modal
    $ionicModal.fromTemplateUrl('js/accounts/templates/newthread.modal.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modal = modal;
    });
    $scope.openNewThreadModal = function() {
      $scope.modal.show();
    };
    $scope.closeNewThreadModal = function() {
      $scope.modal.hide();
    };
    
    //Cleanup the modal when we're done with it!
    $scope.$on('$destroy', function() {
      $scope.modal.remove();
    });
    // Execute action on hide modal
    $scope.$on('modal.hidden', function() {
      // Execute action
    });
    // Execute action on remove modal
    $scope.$on('modal.removed', function() {
      // Execute action
    });
}])

.controller('ThreadController', ['$scope', '$ionicPopover', '$window',
  function($scope, $ionicPopover, $window){
    console.log("I am in the thread");
    
    
    // Gif-search popover
    
    $ionicPopover.fromTemplateUrl('js/gifs/templates/gif-search.pop.html', {
      scope: $scope
    }).then(function(popover) {
      $scope.popover = popover;
    });
    
    $scope.openGifSearch = function($event) {
      $scope.popover.show($event);
    };
    $scope.closeGifSearch = function() {
      $scope.popover.hide();
    };
    //Cleanup the popover when we're done with it!
    $scope.$on('$destroy', function() {
      $scope.popover.remove();
    });
    // Execute action on hide popover
    $scope.$on('popover.hidden', function() {
      // Execute action
    });
    // Execute action on remove popover
    $scope.$on('popover.removed', function() {
      // Execute action
    });

    // Helper functions
    
    $scope.back = function(){
      $window.history.back();
    }; 

}]);
