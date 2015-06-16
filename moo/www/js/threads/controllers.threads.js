/**
* moo.controllers.threads Module
*
* Description
*/
angular.module('moo.controllers.threads', [])

.controller('ThreadsController', ['$scope', '$state', '$timeout', 
  '$ionicModal', 'Account', 'Thread',
  function($scope, $state, $timeout, $ionicModal, Account, Thread){
    
    //
    //
    // Initialize Variables
    $scope.loading = true;
    $scope.warning = false;
    $scope.me = {};
    $scope.threadsCount = 0;
    $scope.threadsNextPage = "";
    $scope.threadsPreviousPage = "";
    $scope.threads = [];
    $scope.friendsResults = [];
    $scope.friends = [];

    //
    //
    // Sync
    var sync = function(){
      Account.me()
        // pull latest me object
        .then(function(s){
          $scope.me = s.data;
          return $scope.me;
        }, function(e){raiseWarning(e);})
        // cache it
        .then(function(s){
          Account.cacheMe(s);
          return s;
        }, function(e){raiseWarning(e);})
        // pull account threads
        .then(function(s){
          Account.getThreadList(s.id)
            .then(function(s){
              // update threads
              $scope.threadsCount = s.data.count;
              $scope.threadsNextPage = s.data.next;
              $scope.threadsPreviousPage = s.data.previous;
              $scope.threads = s.data.results;

              $scope.threads = applyColorsToThreadAuthors($scope.threads);
              console.log($scope.threads);

            }, function(e){raiseWarning(e);});
            return s;
        }, function(e){raiseWarning(e);})
        // pull account friends
        .then(function(s){
          Account.getFriendList(s.id)
            .then(function(s){
              $scope.friends = s.data.results;
            }, function(e){raiseWarning(e);});
        }, function(e){raiseWarning(e);})
        // sync done
        .then(function(s){
          syncDone();
        }, function(e){raiseWarning(e);});
    };


    //
    //
    // API Calls
    $scope.searchAccounts = function(q){
      /*
       * Search for accounts
       * only by username for now
       */ 
      q = {"query": q}
      Account.searchAccount(q)
        .then(function(s){
          if(s.status==200){
            $scope.friendsResults = [s.data];
          }
        }, function(e){
          if(e.status==404){
            $scope.friendsResults = [];
          }
        });
    };

    $scope.addFriend = function(account){
      /*
       * Add a friend       
       */
      Account.friendAccount(account.id)
        .then(function(s){
          if(s.status==200){
            $scope.friends.push(s.data);
          }
        }, function(e){console.log(e);});
    };

    $scope.startNewThread = function(){
      /*
       * Start a new thread
       */
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

    //
    //
    // Helpers
    $scope.dateFormatter = function(d){
      /*
       * Format the time stamp to be readable
       */ 
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

    var randomColor = function(){
      /*
       * Pick a random color for avators
       */ 
      var colors = ["#39B38A", "#2374B7", "#D3473D", "#F8E588"];
      var color = colors[Math.floor(Math.random()*colors.length)];
      return {'background-color': color};
    };

    var applyColorsToThreadAuthors = function(arr){
      /*
       * Apply a random color style to each thread
       * participant
       */ 
      for(var i=0; i<arr.length; i++){
        for(var j=0; j<arr[i].participants.length; j++){
          arr[i].participants[j].background = randomColor();
        }
      }
      return arr;
    };

    $scope.getInitials = function(a){
      /*
       * Parse capitalized initials from first and last name
       */ 
      return a.first_name.charAt(0).toUpperCase() + a.last_name.charAt(0).toUpperCase()
    };

    var raiseWarning = function(err){
      /*
       * Raise a warning flag and print it out
       */ 
      $scope.warning = true;
      console.log(err);
    };

    var syncDone = function(){
      /*
       * Logic for when sync is done
       */ 
      $scope.loading = false;
    };



    //
    //
    // initialize application
    var init = function(){
      sync()
    }; init();

    //
    //
    // View Components
    // Accounts modal
    $ionicModal.fromTemplateUrl('js/accounts/templates/profile.modal.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.AccountModal = modal;
    });
    $scope.openAccountModal = function() {
      $scope.AccountModal.show();
    };
    $scope.closeAccountModal = function() {
      $scope.AccountModal.hide();
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

           for(var i=0; i<$scope.notes.length; i++){
              $scope.notes[i].author.background = randomColor()
           }

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

    var randomColor = function(){
      var colors = ["#39B38A", "#2374B7", "#D3473D", "#F8E588"];
      var color = colors[Math.floor(Math.random()*colors.length)];
      return {'background-color': color};
    };

    $scope.getInitials = function(a){
      return a.first_name.charAt(0).toUpperCase() + a.last_name.charAt(0).toUpperCase()
    };

}]);
