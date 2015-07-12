/**
* moo.controllers.authentication Module
*
* Description
*/
angular.module('moo.controllers.authentication', [])

.controller('AuthenticationController', ['$scope', '$state', '$ionicModal', '$ionicSlideBoxDelegate', '$ionicUser', 'Authentication', 'Gif',
  function($scope, $state, $ionicModal, $ionicSlideBoxDelegate, $ionicUser, Authentication, Gif){
    
    $scope.loading = false;

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

    $scope.nextPage = function(){
      console.log('fhih');
      $ionicSlideBoxDelegate.next();
    };

    // Handle Authentication
    $scope.login = function(user){
      $scope.loading = true;
      Authentication.authenticateUser(user).then(function(s){
        if(s.status == 200){
          Authentication.cacheToken(s.data);
          var d = new Date();
          // push the user to ionic
           $ionicUser.identify({
            user_id: s.data,
            name: user.username
          });
          $scope.loading = false; 
          $scope.closeLoginModal();
          $scope.closeSignupModal();
          $state.go('threads');
        }else if(s.status == 400){
          console.log("Bad Credentials");
          $scope.authError = true;
          $scope.loading = false;
        }else{
          console.log("Unkown Error");
          $scope.loading = false;
        }
      }, function(e){console.log(e);$scope.authError = true;});
    };
    
    $scope.register = function(user){
      if(user.password == user.confirm_password){
        $scope.loading = true;
        
        user.is_admin = false;
        user.is_manager = false;
        user.friends = [];
        user.liked_gifs = [];
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
}]);
