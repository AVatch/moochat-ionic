/**
* moo.services.threads Module
*
* Description
*/
angular.module('moo.services.threads', [])

.factory('Thread', ['$http', 'Authentication', 'DOMAIN',
  function($http, Authentication, DOMAIN){
    
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
      startThread: startThread,
      getThread: getThread,
      getNotes: getNotes
    };
}])

.factory('ThreadManager', ['$timeout', 'Account', 'Thread', 
  function($timeout, Account, Thread){
  
  var threads = {};
  var numThreads = 0;
  var nextPageURL;
  var prevPageURL;


  var formatDate = function(t){
    /*
     * Format the time stamp to be readable
     */ 
    var d = new Date(t.time_updated);
    var now = new Date();

    var diff = now.getTime() - d.getTime();
    var day = 1000*60*60*24;
    if(diff > day){
      return d.toLocaleDateString();
    }else{
      return d.toLocaleTimeString();
    }
  };

  var setNextPageURL = function(url){
    /*
     * Set the url to the next page url
     */ 
    nextPageURL = url;
  };

  var setPrevPageURL = function(url){
    /*
     * Set the url to the prev page url
     */ 
    prevPageURL = url;
  };  

  var getMoreThreads = function(){
    /*
     * Pull the next page of threads and update
     * the threads and page pointers
     */ 

  };

  var getThreads = function(){
    /*
     * Return all the cached threads
     */ 
    return threads;
  };

  var pushThread = function(t){
    /*
     * Add a new thread object
     */ 
    // process thread
    t.formattedDate = formatDate(t);
    t.time_created = new Date(t.time_created);
    t.time_updated = new Date(t.time_updated);
    // add it to the threads
    threads[t.id] = t;
  };

  var getThread = function(id){
    /*
     * Get a thread
     */ 
    return threads[id];
  };

  var removeThread = function(id){
    /*
     * Remove a thread
     */ 
    delete threads[id];
  };

  var clearThreads = function(){
    /*
     * Clear all threads
     */ 
    threads = {};
  };

  var pollThreads = function(){
    /*
     * Poll threads
     */
     Account.getThreadList(Account.getMe().id)
      .then(function(s){});

    $timeout(function(){pollThreads()}, 5000);
  };

  return {
    setNextPageURL: setNextPageURL,
    setPrevPageURL: setPrevPageURL,
    getMoreThreads: getMoreThreads,
    getThreads: getThreads,
    pushThread: pushThread,
    getThread: getThread,
    removeThread: removeThread,
    clearThreads: clearThreads,
    pollThreads: pollThreads
  };
}]);
