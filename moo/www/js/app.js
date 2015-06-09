// MooChat

angular.module('moo', ['ionic', 'LocalStorageModule'])

// Setup Constants

//.constant('DOMAIN', 'http://127.0.0.1:8000')
.constant('DOMAIN', 'https://6c35ae39.ngrok.com')

// Setup Initialization Logic

.run(function($ionicPlatform, $rootScope, $state, $urlRouter, Authentication, Account) {

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

.config(['$stateProvider', '$urlRouterProvider',
  function($stateProvider, $urlRouterProvider) {

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
  
  
// Setup Filters
.filter('reverse', function() {
  return function(items) {
    return items.slice().reverse();
  };
})
  
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

.factory('Account', ['$http', 'Authentication', 'localStorageService', 'DOMAIN',
  function($http, Authentication, localStorageService, DOMAIN){
    
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
    
    var getAccountist = function(){
      var token = Authentication.getToken();
      var response = $http({
                        url: DOMAIN + '/api/v1/accounts/',
                        method: 'GET',
                        headers: { 
                          'Content-Type': 'application/json',
                          'Authorization': 'Token ' + token.token },
                        data: ''
                      });
      return response;
    };
    
    var getThreadList = function(pk){
      var token = Authentication.getToken();
      var response = $http({
                        url: DOMAIN + '/api/v1/accounts/' + pk + '/threads/',
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
    
    var cacheMe = function(me){
      return localStorageService.set('me', me);
    };
    
    var getMe = function(){
      return localStorageService.get('me');
    };

    return{
      me: me,
      getFriendList: getFriendList,
      friendAccount: friendAccount,
      getAccountist: getAccountist,
      getThreadList: getThreadList,
      cacheMe: cacheMe,
      getMe: getMe    
    };
}])

.factory('Thread', ['$http', 'Authentication', 'DOMAIN',
  function($http, Authentication, DOMAIN){
    
    var pullThreadList = function(pk){
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
                        url: DOMAIN + '/api/v1/threads/create/',
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

.factory('Note', ['$http', 'Authentication', 'DOMAIN',
  function($http, Authentication, DOMAIN){
    
    var createNote = function(note){
      var token = Authentication.getToken();
      var response = $http({
                        url: DOMAIN + '/api/v1/notes/',
                        method: 'POST',
                        headers: { 
                          'Content-Type': 'application/json',
                          'Authorization': 'Token ' + token.token },
                        contentType: "application/json; charset=UTF-8",
                        data: note
                      });
      return response;
    };

    return{
      createNote: createNote
    };
}])

.factory('Gif', ['$http', 'Authentication', 'DOMAIN',
  function($http, Authentication, DOMAIN){
    
    var searchGif = function(q){
      var token = Authentication.getToken();
      var response = $http({
                        url: DOMAIN + '/api/v1/gif/search/',
                        method: 'POST',
                        headers: { 
                          'Content-Type': 'application/json',
                          'Authorization': 'Token ' + token.token },
                        contentType: "application/json; charset=UTF-8",
                        data: q
                      });
      return response;
    };
    
    var randomGif = function(){
      var response = $http({
                        url: DOMAIN + '/api/v1/gif/random/',
                        method: 'GET',
                        headers: { 
                          'Content-Type': 'application/json'},
                        contentType: "application/json; charset=UTF-8",
                      });
      return response;
    };

    return{
      searchGif: searchGif,
      randomGif: randomGif
    };
}])
  
// Setup Controllers

.controller('AuthenticationController', ['$scope', '$state', '$ionicModal', 'Authentication', 'Gif',
  function($scope, $state, $ionicModal, Authentication, Gif){
  	
    // Init Auth Modals + Handle Event Triggers
    $ionicModal.fromTemplateUrl('js/authentication/templates/login.modal.tmpl.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.loginModal = modal;
    });
    $scope.openLoginModal = function() {
      $scope.loginModal.show();
    };
    $scope.closeLoginModal = function() {
      $scope.loginModal.hide();
    };
    
    $ionicModal.fromTemplateUrl('js/authentication/templates/signup.modal.tmpl.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.signupModal = modal;
    });
    $scope.openSignupModal = function() {
      $scope.signupModal.show();
    };
    $scope.closeSignupModal = function() {
      $scope.signupModal.hide();
    };


    // Pull Random Gif
    Gif.randomGif().then(function(s){
      if(s.status==200){
        console.log(s.data)
        $scope.randomGif = s.data.results;  
      }
    }, function(e){console.log(e);});

  
  // Handle Authentication
        
    $scope.login = function(user){
      Authentication.authenticateUser(user).then(function(s){
        if(s.status == 200){
          Authentication.cacheToken(s.data);
          $scope.closeLoginModal();
          $state.go('threads');
        }else if(s.status == 400){
          console.log("Bad Credentials");
          $scope.authError = true;
        }else{
          console.log("Unkown Error");
        }
      }, function(e){console.log(e);$scope.authError = true;});
    };
    
    $scope.register = function(user){
      
      if(user.password == user.confirm_password){
        user.is_admin = false;
        user.is_manager = false;
        user.friends = [];
        user.phonenumber = "";
        
        Authentication.registerUser(user).then(function(s){
          if(s.status==201){
            var auth = {};
            auth.username = user.username;
            auth.password = user.password;
            $scope.login(auth);
          }
        }, function(e){console.log(e);});
      }else{
        console.log("Passwords did not match");
        $scope.authError = true;
      };  
    };
      
      

}])

.controller('ThreadsController', ['$scope', '$state', '$ionicModal', 'Account', 'Thread',
  function($scope, $state, $ionicModal, Account, Thread){
    
    // Get me
    Account.me().then(function(s){
      Account.cacheMe(s.data);
      $scope.me = s.data;
      pullThreads($scope.me.id);
      pullFriendList($scope.me.id);
    }, function(e){console.log(e);});
    
    // Pull the threads
    $scope.threads = []; 
    $scope.loading = true;
    var pullThreads = function(pk){
      Account.getThreadList(pk).then(function(s){
        $scope.loading = false;
        if(s.status == 200){
          $scope.threads = s.data.results; 
        }else if(s.status == 400){
          
        }else{
          console.log("Unkown Error");
        }
      }, function(e){console.log(e);});
    };
    
    // Pull the friend list
    $scope.friends = [];
    var pullFriendList = function(pk){
      Account.getAccountist().then(function(s){
        if(s.status==200){
          console.log(s.data);
          $scope.friends = s.data.results;
        }
      }, function(e){console.log(e);});
    }; 
    
    // Accounts modal
    $ionicModal.fromTemplateUrl('js/accounts/templates/profile.modal.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.AccountModal = modal;
    });
    $scope.openAccountModal = function() {
      console.log('opening account modal');
      $scope.AccountModal.show();
    };
    $scope.closeAccountModal = function() {
      $scope.AccountModal.hide();
    };
    
    // Start a new thread
    $scope.startNewThread = function(){
      var recipients = [];
      for(var i=0; i<$scope.friends.length; i++){
        if($scope.friends[i].sendTo){
          recipients.push($scope.friends[i].id);
        }
      }
     
     var thread = {};
     thread.participants = recipients;
     Thread.startThread(thread).then(function(s){
       if(s.status==201){
         $state.go('thread', {'pk': s.data.id});
       }
     }, function(e){console.log(e);});
     
    };
    
    // Start a thread modal
    $ionicModal.fromTemplateUrl('js/accounts/templates/newthread.modal.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.NewThreadModal = modal;
    });
    $scope.openNewThreadModal = function() {
      $scope.NewThreadModal.show();
    };
    $scope.closeNewThreadModal = function() {
      $scope.NewThreadModal.hide();
    };
    
    //Cleanup the modal when we're done with it!
    $scope.$on('$destroy', function() {
      $scope.NewThreadModal.remove();
      $scope.AccountModal.remove();
    });
}])

.controller('ThreadController', ['$scope', '$ionicPopover', '$window', '$stateParams', '$timeout', '$ionicScrollDelegate', 'Account', 'Thread', 'Note', 'Gif',
  function($scope, $ionicPopover, $window, $stateParams, $timeout, $ionicScrollDelegate, Account, Thread, Note, Gif){
    
    // Get me
    $scope.me = Account.getMe();
    
    // pull the notes in the thread
    $scope.notes = [];
    var threadID = $stateParams.pk;
    
    Thread.getNotes(threadID).then(function(s){
      if(s.status == 200){
           $scope.notes = s.data.results;
           $ionicScrollDelegate.scrollBottom();
        }else if(s.status == 400){
        }else{
          console.log("Unkown Error");
        }
    }, function(e){console.log(e);});
    
    // send note to thread
    $scope.createNote = function(msg){
      var note = {};
      note.content = msg;
      note.is_gif = false;
      note.thread = threadID;
      
      Note.createNote(note).then(function(s){
        if(s.status==201){
          $scope.notes.unshift(s.data);
          $scope.msg = "";
          $ionicScrollDelegate.scrollBottom(true);  
        }        
      }, function(e){console.log(e);});
    };
    
    $scope.sendGif = function(msg){
      var gif = {};
      gif.content = msg;
      gif.is_gif = true;
      gif.thread = threadID;
      
      Note.createNote(gif).then(function(s){
        if(s.status==201){
          $scope.notes.unshift(s.data);
          $scope.msg = "";  
          $scope.closeGifSearch();
        }        
      }, function(e){console.log(e);});
    }
    
    
    // Search gif
    $scope.searchGifs = function(q){
      $scope.results = [];
      q = {"query": q};
      Gif.searchGif(q).then(function(s){
        console.log(s);
        $scope.results = s.data.results;
      }, function(e){console.log(e);});
    };
    
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
