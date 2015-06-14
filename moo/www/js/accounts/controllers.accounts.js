/**
* moo.controllers.accounts Module
*
* Description
*/
angular.module('moo.controllers.accounts', [])

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
          $scope.closeSignupModal();
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
        
        delete user.confirm_password
        
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
}]);
