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

.factory('ThreadManager', ['', function(){
  
  var threads = {};

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

  var getThreads = function(){
    return threads;
  };

  var pushThread = function(t){
    // process thread
    t.formattedDate = formatDate(t);
    // add it to the threads
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

  };
}]);
