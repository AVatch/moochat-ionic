/**
* moo.controllers.threads Module
*
* Description
*/
angular.module('moo.controllers.threads', [])

.controller('ThreadsController', ['$scope', '$rootScope', '$state', '$timeout', 
  '$ionicModal', '$ionicSlideBoxDelegate', 'Authentication', 'Account', 'AccountManager',
  'Thread', 'ThreadManager',
  function($scope, $rootScope, $state, $timeout, $ionicModal, $ionicSlideBoxDelegate, 
    Authentication, Account, AccountManager, Thread, ThreadManager){
    
    /*
     * Initialize Variables
     */
    var poll;
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
      return Account.me()
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
    $scope.sync = function(){ 
      // cancel the polling on manual refresh
      $timeout.cancel() 
      sync()
        .then(function(s){
            $scope.$broadcast('scroll.refreshComplete');
          }, function(e){});
    };



    /*
     * Initialize Application
     */
    var init = function(){
      sync();
    }; init();

    var syncDone = function(){
      /*
       * Logic for when sync is done
       */ 
       console.log("threadS sync done");
      // update the scope
      var friends = AccountManager.getAccounts();
      if($scope.friends.length!=friends.length){
        $scope.friends = friends;
      }

      var threads = ThreadManager.getThreads();
      if($scope.threads.length!=threads.length){
        $scope.threads = threads;

        console.log($scope.threads)
      }

      // issue signals that sync is done
      $scope.loading = false;

      poll = $timeout(function(){sync();}, 10000);
    };

    $rootScope.$on('$stateChangeStart', 
    function(event, toState, toParams, fromState, fromParams){ 
      $timeout.cancel(poll);
    });


    /*
     * API Calls
     */
    $scope.searchAccounts = function(q){
      /*
       * Search for accounts
       * only by username for now
       */ 
      q = {"username": q}
      Account.searchAccount(q)
        .then(function(s){
          if(s.status==200){
          
            $scope.friendsResults = s.data;
          }
        }, function(e){
          if(e.status==404){
            $scope.friendsResults = [];
          }
        });
    };

    $scope.nextSlide = function() {
      $ionicSlideBoxDelegate.next();
    }

    $scope.addFriend = function(account){
      /*
       * Add a friend       
       */
      Account.friendAccount(account.id)
        .then(function(s){
          if(s.status==200){
            
            AccountManager.pushAccount(s.data)

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


    $scope.logout = function(){
      Authentication.logout();
      $state.go('authentication');
    }


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






.controller('ThreadController', ['$scope', '$rootScope', '$ionicPopover', '$window', 
  '$stateParams', '$timeout', '$ionicModal', '$ionicScrollDelegate',
  'Account', 'AccountManager', 'Thread', 'Note', 'NoteManager', 'Gif', 'GifManager', 'COLORS',
  function($scope, $rootScope, $ionicPopover, $window, $stateParams, $timeout, $ionicModal,
    $ionicScrollDelegate, Account, AccountManager, Thread, Note, NoteManager, Gif, GifManager, COLORS){
    
    /*
     * Initialize Variables
     */
    var scroll = true;
    var poll;
    $scope.loading = true;
    $scope.warning = false;
    $scope.noteSending = false;
    $scope.me = {};
    $scope.thread = {};
    $scope.q = "";
    $scope.msg = "";

    // clear accounts
    AccountManager.clearAccounts();
    NoteManager.clearNotes();

    /*
     * Sync
     */
    var sync = function(){
      return Account.me()
              .then(function(s){
                $scope.me = s.data;
                return $scope.me;
              }, function(e){raiseWarning(e);})
              .then(function(s){
                Thread.getThread($stateParams.pk)
                  .then(function(s){
                    // get the thread object
                    var thread = s.data;
                    for(var i=0; i<thread.participants.length; i++){
                      AccountManager.pushAccount(thread.participants[i]);
                    }
                    $scope.thread = thread
                    return thread;
                  }, function(e){raiseWarning(e);})
                  .then(function(s){
                    // get the notes in the thread
                    Thread.getNotes(s.id)
                      .then(function(s){
                        NoteManager.setNextPageURL(s.data.next);
                        NoteManager.setPrevPageURL(s.data.previous);
                        var notes = s.data.results;
                        for(var i=0; i<notes.length; i++){
                          NoteManager.pushNote(notes[i]);
                          if(i==notes.length-1){
                            if(NoteManager.areThereNewElements(notes[i].id)){
                              scroll = true;
                            }
                          }
                        }
                      }, function(e){raiseWarning(e);})
                      .then(function(s){
                        // finish sync
                        syncDone();
                      }, function(e){raiseWarning(e);});
                  }, function(e){raiseWarning(s);});
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
          var gifResults = s.data.results;
          $scope.gifResults = gifResults;
          updateWidth($scope.gifResults);
          $scope.searchingForGifs = false;
        }, function(e){console.log(e);});
    };

    
    $scope.getMore = function(){
      /*
       * Load more notes by paginating
       */
      NoteManager.getMoreNotes().then(function(s){

        var notes = s.data.results;
        NoteManager.setNextPageURL(s.data.next);
        NoteManager.setPrevPageURL(s.data.previous);
        for(var i=0; i<notes.length; i++){
          NoteManager.pushNote(notes[i]);
        }
        $scope.notes = NoteManager.getNotes();
        $scope.$broadcast('scroll.refreshComplete');
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
      note.gif = null;
      note.content = msg;
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

    $scope.sendGif = function(gif){
      /*
       * Create a gif note
       */
      // clear the popover and input
      $scope.closeGifSearch();
      
      $scope.q = "";
      $scope.msg = "";
      
      var note = {}
      note.gif = {"url": gif.url,
                  "webp": gif.webp,
                  "mp4": gif.mp4};
      note.content = "";
      note.thread = $scope.thread.id;
      // start loading
      $scope.noteSending = true;
      // scroll down
      $ionicScrollDelegate.scrollBottom(true);
      
      Note.createNote(note).then(function(s){
        if(s.status==201){
          var note = s.data;
          NoteManager.pushNote(note);

          console.log(note);

          // finish loading
          $scope.noteSending = false;
          $ionicScrollDelegate.scrollBottom(true);
        }        
      }, function(e){console.log(e);});
    };

    $scope.like = function($event, note){
      /*
       * Like a gif
       */
      var amplitude = 10;
      var x_noise = Math.random()*amplitude;
      var y_noise = Math.random()*amplitude;

      if(Math.random()*10<5.0){
        x_noise=x_noise*-1;
      }
      if(Math.random()*10<5.0){
        y_noise=y_noise*-1;
      }


      var x = ($event.gesture.center.pageX - 25 + x_noise).toString();
      var y = ($event.gesture.center.pageY - 55 + y_noise).toString()
      var content = angular.element( document.querySelector( '#threadContentContainer' ) );
      var heart = '<div id="heart" class="heart animated bounceOut" style="position:fixed; left:'+x+'px; top:'+y+'px;"></div>';
      content.append(heart);
    };

    /*
     * Initialize Application
     */

    var init = function(){
      sync()
        .then(function(s){
        }, function(e){raiseWarning(e);});
    }; init();

    var syncDone = function(){
      /*
       * Logic for when sync is done
       */ 
      $scope.notes = NoteManager.getNotes();
      $scope.loading = false;

      if(scroll){ $ionicScrollDelegate.scrollBottom(true); scroll=false; }
      poll = $timeout(function(){sync();}, 5000);
    };

    /*
     * Helpers
     */

    $scope.getAccount = function(id){
      return AccountManager.getAccount(id);
    };
    $scope.getRandomColor = function(id){
      return NoteManager.randomColor();
    }

    var searchPaneWidth = 370;
    var updateWidth = function(arr){
      searchPaneWidth = (arr.length / 2) * 100;
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

    $scope.back = function(){
      /*
       * Go back in history stack
       */ 
      $window.history.back();
    }; 

    $rootScope.$on('$stateChangeStart', 
    function(event, toState, toParams, fromState, fromParams){ 
      $timeout.cancel(poll);
    });

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
