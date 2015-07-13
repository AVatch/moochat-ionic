/**
* moo.services.threads Module
*
* Description
*/
angular.module('moo.services.threads', [])

.factory('Thread', ['$http', 'Authentication', 'DOMAIN', 'VERSION',
  function($http, Authentication, DOMAIN, VERSION){
    
    var startThread = function(thread){
      var token = Authentication.getToken();
      var response = $http({
                        url: DOMAIN + '/api/'+VERSION+'/threads/create/',
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
                        url: DOMAIN + '/api/'+VERSION+'/threads/' + pk + '/',
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
                        url: DOMAIN + '/api/'+VERSION+'/threads/' + pk + '/notes/',
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


  var setNextPageURL = function(url){
    nextPageURL = url;
  };

  var setPrevPageURL = function(url){
    prevPageURL = url;
  };

  var getThreads = function(){
    return threads;
  };

  var pushThread = function(t){
    threads[t.id] = t;
  };

  var getThread = function(id){
    return threads[id];
  };

  var removeThread = function(id){
    delete threads[id];
  };

  var clearThreads = function(){
    threads = {};
  };

  return {
    setNextPageURL: setNextPageURL,
    setPrevPageURL: setPrevPageURL,
    getThreads: getThreads,
    pushThread: pushThread,
    getThread: getThread,
    removeThread: removeThread,
    clearThreads: clearThreads,
  };
}]);
