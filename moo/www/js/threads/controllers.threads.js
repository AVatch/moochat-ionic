/**
* moo.controllers.threads Module
*
* Description
*/
angular.module('moo.controllers.threads', [])

.controller('ThreadsController', ['$scope', '$state', '$timeout', '$ionicModal', 'Account', 'Thread',
  function($scope, $state, $timeout, $ionicModal, Account, Thread){
    
    // Pull the threads
    $scope.threads = []; 
    $scope.loading = true;

    // Get me
    Account.me().then(function(s){
      Account.cacheMe(s.data);
      $scope.me = s.data;
      pullThreads($scope.me.id);
      pullFriendList($scope.me.id);
      
      // done loading
      $timeout(function() {
        $scope.loading = false;
      }, 1000);
      
    }, function(e){
      $scope.error = "Something went wrong :(";
      $scope.loading = false;  
    });
    
    var pullThreads = function(pk){
      Account.getThreadList(pk).then(function(s){
        if(s.status == 200){
          $scope.threads = s.data.results; 
          console.log($scope.threads);
        }else if(s.status == 400){
          
        }else{
          console.log("Unkown Error");
        }
      }, function(e){console.log(e);});
    };
    
    // Pull the friend list
    $scope.friends = [];
    var pullFriendList = function(pk){
      Account.getFriendList(pk).then(function(s){
        if(s.status==200){
          console.log(s.data);
          $scope.friends = s.data.results;
        }
      }, function(e){console.log(e);});
    }; 

    // Search for a friend
    $scope.searchAccounts = function(q){
      q = {"query": q}
      Account.searchAccount(q)
        .then(function(s){
          if(s.status==200){
            $scope.results = [s.data];
          }
        }, function(e){
          if(e.status==404){
            $scope.results = [];
          }
        });
    };

    // Add a friend
    $scope.addFriend = function(account){
      Account.friendAccount(account.id)
        .then(function(s){
          if(s.status==200){
            console.log(s)
            $scope.friends.push(s.data)  
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

    $scope.dateFormatter = function(d){
      var d = new Date(d);
      var now = new Date();

      var diff = now.getTime() - d.getTime();
      var day = 1000*60*60*24;
      if(diff > day){
        return d.toLocaleDateString();
      }else{
        return d.toLocaleTimeString();
      }      
    };
}])




.controller('ThreadController', ['$scope', '$ionicPopover', '$window', '$stateParams', '$timeout', '$ionicScrollDelegate', 'Account', 'Thread', 'Note', 'Gif',
  function($scope, $ionicPopover, $window, $stateParams, $timeout, $ionicScrollDelegate, Account, Thread, Note, Gif){
    
    // Get me
    $scope.me = Account.getMe();
    
    // pull the notes in the thread
    $scope.notes = [];
    var initPoll = false;
    var threadID = $stateParams.pk;
    
    var pullNotes = function(){
      Thread.getNotes(threadID).then(function(s){
        if(s.status == 200){
          // if($scope.notes.length!=0 && s.data.results[s.data.results.length-1].id == $scope.notes[$scope.notes.length-1].id){
          //   $ionicScrollDelegate.scrollBottom();
          // }
            if(!initPoll){
              $ionicScrollDelegate.scrollBottom();
              initPoll = true;
            }
            $scope.notes = s.data.results;

          }else if(s.status == 400){
          }else{
            console.log("Unkown Error");
          }
      }, function(e){console.log(e);});
    };

    // poll the server for notes
    var poll = function() {
      pullNotes();
      $timeout(poll, 5000);
    }; poll();

    

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

    $scope.dateFormatter = function(d){
      var d = new Date(d);
      var now = new Date();

      var diff = now.getTime() - d.getTime();
      var day = 1000*60*60*24;
      if(diff > day){
        return d.toLocaleDateString();
      }else{
        return d.toLocaleTimeString();
      }      
    };

}]);
