/**
* moo.controllers.threads Module
*
* Description
*/
angular.module('moo.controllers.threads', [])

.controller('ThreadsController', ['$scope', '$state', '$timeout', 
  '$ionicModal', '$ionicSlideBoxDelegate', 'Account', 'AccountManager',
  'Thread', 'ThreadManager',
  function($scope, $state, $timeout, $ionicModal, $ionicSlideBoxDelegate, 
    Account, AccountManager, Thread, ThreadManager){
    
    /*
     * Initialize Variables
     */
    $scope.loading = true;
    $scope.warning = false;
    $scope.me = {};
    $scope.threads = [];
    $scope.friendsResults = [];
    $scope.friends = [];

    /*
     * Sync
     */
    var sync = function(){
      Account.me()
        .then(function(s){
          // get the user profile
          $scope.me = s.data;
          return $scope.me;
        }, function(e){raiseWarning(e);})
        .then(function(s){
          // cache the user profile
          Account.cacheMe(s);
          return s;
        }, function(e){raiseWarning(e);})
        .then(function(s){
          // get the user threads
          Account.getThreadList($scope.me.id)
            .then(function(s){
              // initialize the ThreadManager
              ThreadManager.setNextPageURL(s.data.next);
              ThreadManager.setPrevPageURL(s.data.previous);
              var threads = s.data.results;
              for(var i=0; i<threads.length; i++){
                ThreadManager.pushThread(s.data.results[i]);
              }
            }, function(e){raiseWarning(e);})
            .then(function(s){
              Account.getFriendList($scope.me.id)
                .then(function(s){
                  // initialize the AccountManager
                  var accounts = s.data.results;
                  for(var i=0; i<accounts.length; i++){
                    AccountManager.pushAccount(accounts[i]);
                  }
                }, function(e){raiseWarning(e);})
                .then(function(s){
                  // trigger sync complete
                  syncDone();
                }, function(e){raiseWarning(e);});
            }, function(e){raiseWarning(e);});
        }, function(e){raiseWarning(e);})
    };
    $scope.sync = function(){ sync(); };



    /*
     * Initialize Application
     */
    var init = function(){
      sync();
      ThreadManager.pollThreads();
    }; init();

    var syncDone = function(){
      /*
       * Logic for when sync is done
       */ 
      console.log("Sync is done");

      // update the scope
      var friends = AccountManager.getAccounts();
      if($scope.friends.length!=friends.length){
        $scope.friends = friends;
      }
      var threads = ThreadManager.getThreads();
      if($scope.threads.length!=threads.length){
        $scope.threads = threads;
      }

      // issue signals that sync is done
      $scope.loading = false;
      $scope.$broadcast('scroll.refreshComplete');
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
      var accounts = AccountManager.getAccounts();
      for(var id in accounts){
        if(accounts[id].sendTo){
          recipients.push(id);
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

    $scope.leave = function(thread){
      console.log("leaving thread");
      console.log(thread);
    };




    /*
     * Helpers
     */
    $scope.getAccount = function(id){
      /*
       * Return an account from the manager
       */
      return AccountManager.getAccount(id);
    };


    var raiseWarning = function(err){
      /*
       * Raise a warning flag and print it out
       */ 
      $scope.warning = true;
      console.log(err);
    };


    /*
     * View Components
     */
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
  'Account', 'AccountManager', 'Thread', 'Note', 'NoteManager', 'Gif',
  function($scope, $ionicPopover, $window, $stateParams, $timeout, $ionicModal,
    $ionicScrollDelegate, Account, AccountManager, Thread, Note, NoteManager, Gif){
    
    /*
     * Initialize Variables
     */
    $scope.loading = true;
    $scope.warning = false;
    $scope.noteSending = false;
    $scope.me = {};
    $scope.thread = {};
    $scope.q = "";
    $scope.msg = "";

    /*
     * Sync
     */
    var sync = function(){
      $scope.me = Account.getMe();
      
      // clear accounts
      AccountManager.clearAccounts();
      NoteManager.clearNotes();
      
      Thread.getThread($stateParams.pk)
        
        .then(function(s){
          // get the thread object
          $scope.thread = s.data;
          for(var i=0; i<$scope.thread.participants.length; i++){
            AccountManager.pushAccount($scope.thread.participants[i]);
          }
          return $scope.thread;
        }, function(e){raiseWarning(e);})
        
        .then(function(s){
          // get the notes in the thread
          Thread.getNotes(s.id)
            .then(function(s){
              
              NoteManager.setNextPageURL(s.data.next);
              NoteManager.setPrevPageURL(s.data.previous);

              var notes = s.data.results.reverse();
              for(var i=0; i<notes.length; i++){
                NoteManager.pushNote(notes[i]);
              }

              $scope.notes = NoteManager.getNotes();
              console.log($scope.notes);

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
          
          var results = s.data.results;

          for(var i=0; i<results.length; i++){
            var color = NoteManager.randomColor();
            results[i].backgroundColor = color;
          }
          
          $scope.results = results;
          console.log($scope.results);
          updateWidth($scope.results);
        }, function(e){console.log(e);})
        .finally(function(){
          $scope.searchingForGifs = false;
        });
    };

    $scope.getMore = function(){
      NoteManager.getMoreNotes().then(function(s){
        var notes = s.data.results.reverse();
        NoteManager.setNextPageURL(s.data.next);
        NoteManager.setPrevPageURL(s.data.previous);
        for(var i=0; i<notes.length; i++){
          NoteManager.pushNote(notes[i]);
        }
          $scope.notes = NoteManager.getNotes();
      }, function(e){});
    };

    $scope.createNote = function(msg){
      /*
       * Create a text note
       */
      if(!msg){
        return;
      }
      // clear the input
      $scope.msg = "";
      // update the note
      var note = {};
      note.content = msg;
      note.is_gif = false;
      note.thread = $scope.thread.id;
      // start loading
      $scope.noteSending = true;
      // scroll down
      $ionicScrollDelegate.scrollBottom(true);
      // sync with server
      Note.createNote(note).then(function(s){
        console.log(s);
        if(s.status==201){
          var note = s.data;
          NoteManager.pushNote(note);
          // finish loading
          $scope.noteSending = false;
        }        
      }, function(e){console.log(e);});
    };

    $scope.sendGif = function(msg){
      /*
       * Create a gif note
       */
      // clear the popover and input
      $scope.closeGifSearch();
      $scope.q = "";
      $scope.msg = "";
      // update the note
      var gif = {};
      gif.content = msg;
      gif.is_gif = true;
      gif.thread = $scope.thread.id;
      // start loading
      $scope.noteSending = true;
      // scroll down
      $ionicScrollDelegate.scrollBottom(true);
      
      Note.createNote(gif).then(function(s){
        if(s.status==201){
          var note = s.data;
          NoteManager.pushNote(note);
          // finish loading
          $scope.noteSending = false;
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
    $scope.getRandomColor = function(id){
      return NoteManager.randomColor();
    }

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
      if($scope.msg){
        $scope.q = $scope.msg;
        $scope.searchGifs($scope.q);
      }
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
