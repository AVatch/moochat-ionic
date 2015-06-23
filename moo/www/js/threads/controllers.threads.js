/**
* moo.controllers.threads Module
*
* Description
*/
angular.module('moo.controllers.threads', [])

.controller('ThreadsController', ['$scope', '$state', '$timeout', 
  '$ionicModal', '$ionicSlideBoxDelegate', 'Account', 'AccountManager', 'Thread',
  function($scope, $state, $timeout, $ionicModal, $ionicSlideBoxDelegate, 
    Account, AccountManager, Thread){
    
    /*
     * Initialize Variables
     */
    $scope.loading = true;
    $scope.warning = false;
    $scope.me = {};
    $scope.threadsCount = 0;
    $scope.threadsNextPage = "";
    $scope.threadsPreviousPage = "";
    $scope.threads = [];
    $scope.friendsResults = [];
    $scope.friends = [];

    /*
     * Sync
     */
    $scope.sync = function(){
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

            }, function(e){raiseWarning(e);});
            return s;
        }, function(e){raiseWarning(e);})
        // pull account friends
        .then(function(s){
          Account.getFriendList(s.id)
            .then(function(s){
              // process the accounts with the AccountManager
              var accounts = s.data.results;
              for(var i=0; i<accounts.length; i++){
                AccountManager.pushAccount(accounts[i]);
              }
              console.log(AccountManager.getAccounts());
              $scope.friends = AccountManager.getAccounts();
            }, function(e){raiseWarning(e);});
        }, function(e){raiseWarning(e);})
        // sync done
        .then(function(s){
          syncDone();
        }, function(e){raiseWarning(e);});
    };


    /*
     * API Calls
     */
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
            $ionicSlideBoxDelegate.previous();
            $scope.friendsResults = [];
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

      if(recipients.length == 0){
        console.log("not enough recipients");
        return;
      }

      var thread = {};
      thread.participants = recipients;
      Thread.startThread(thread).then(function(s){
        if(s.status==201){
          $state.go('thread', {'pk': s.data.id});
        }
      }, function(e){console.log(e);});
    };

    /*
     * Initialize Application
     */
    var init = function(){
      $scope.sync();
    }; init();


    /*
     * Helpers
     */

    $scope.getAccount = function(id){
      return AccountManager.getAccount(id);
    };

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
      $scope.$broadcast('scroll.refreshComplete');
    };


    //
    //
    // View Components
    // Account modal
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



.controller('ThreadController', ['$scope', '$ionicPopover', '$window', 
  '$stateParams', '$timeout', '$ionicModal', '$ionicScrollDelegate',
  'Account', 'AccountManager', 'Thread', 'Note', 'Gif',
  function($scope, $ionicPopover, $window, $stateParams, $timeout, $ionicModal,
    $ionicScrollDelegate, Account, AccountManager, Thread, Note, Gif){
    
    /*
     * Initialize Variables
     */
    $scope.loading = true;
    $scope.warning = false;
    $scope.me = {};
    $scope.thread = {};
    $scope.notesCount = 0;
    $scope.notesNextPage = "";
    $scope.notesPreviousPage = "";
    $scope.notes = [];

    /*
     * Sync
     */
    var sync = function(){
      $scope.me = Account.getMe();
      AccountManager.clearAccounts();
      Thread.getThread($stateParams.pk)
        // get the thread object with the participants
        .then(function(s){
          $scope.thread = s.data;
          for(var i=0; i<$scope.thread.participants.length; i++){
            AccountManager.pushAccount($scope.thread.participants[i]);
          }
          return $scope.thread;
        }, function(e){raiseWarning(e);})
        // pull the notes in the thread object
        .then(function(s){
          Thread.getNotes(s.id)
            .then(function(s){
              $scope.notesCount = s.data.count;
              $scope.notesNextPage = s.data.next;
              $scope.notesPreviousPage = s.data.previous;
              $scope.notes = s.data.results.reverse();
            }, function(e){raiseWarning(e);});
        }, function(e){raiseWarning(s);})
        // sync done
        .then(function(s){
          syncDone();
        }, function(e){raiseWarning(e);});
    };

    /*
     * API Calls
     */

    $scope.searchGifs = function(q){
      /*
       * Search for gifs
       */
      $scope.searchingForGifs = true;
      $scope.results = [];
      q = {"query": q};
      Gif.searchGif(q)
        .then(function(s){
          $scope.results = s.data.results;
          updateWidth($scope.results);
        }, function(e){console.log(e);})
        .finally(function(){
          $scope.searchingForGifs = false;
        });
    };

    $scope.createNote = function(msg){
      /*
       * Create a text note
       */
      var note = {};
      note.content = msg;
      note.is_gif = false;
      note.thread = $scope.thread.id;

      Note.createNote(note).then(function(s){
        if(s.status==201){
          s.data.author.background = $scope.me.background;
          $scope.notes.push(s.data);
          $scope.msg = "";
          $ionicScrollDelegate.scrollBottom(true);  
        }        
      }, function(e){console.log(e);});
    };

    $scope.sendGif = function(msg){
      /*
       * Create a gif note
       */
      var gif = {};
      gif.content = msg;
      gif.is_gif = true;
      gif.thread = $scope.thread.id;
      
      Note.createNote(gif).then(function(s){
        if(s.status==201){
          s.data.author.background = $scope.me.background;
          $scope.notes.push(s.data);
          $scope.msg = "";  
          $scope.closeGifSearch();
          $ionicScrollDelegate.scrollBottom(true);
        }        
      }, function(e){console.log(e);});
    }

    /*
     * Initialize Application
     */

    var init = function(){
      sync();
    }; init();

    /*
     * Helpers
     */

    $scope.getAccount = function(id){
      return AccountManager.getAccount(id);
    };

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

    var searchPaneWidth = 370;
    var updateWidth = function(arr){
      searchPaneWidth = (arr.length / 2) * 120;
      searchPaneWidth = searchPaneWidth + 'px';
    };

    $scope.getWidth = function(){
      return {'width': searchPaneWidth};
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
      $timeout(function(){$ionicScrollDelegate.scrollBottom(true);}, 500);
    };

    $scope.back = function(){
      /*
       * Go back in history stack
       */ 
      $window.history.back();
    }; 

    //
    //
    // Thread components
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


    // Thread participants
    $ionicModal.fromTemplateUrl('js/threads/templates/threadParticipants.modal.tmpl.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modal = modal;
    });
    $scope.openModal = function() {
      $scope.modal.show();
    };
    $scope.closeModal = function() {
      $scope.modal.hide();
    };  

}]);
