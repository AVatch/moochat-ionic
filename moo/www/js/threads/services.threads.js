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
  
  var threads = [];
  var numThreads = 0;
  var nextPageURL;
  var prevPageURL;
  var lastElementID = -1;

  function compareTime(a,b) {
    var a = new Date(a.time_updated);
    var b = new Date(b.time_updated)
    if (a < b)
      return 1;
    if (a > b)
      return -1;
    return 0;
  };

  var setNextPageURL = function(url){
    nextPageURL = url;
  };

  var setPrevPageURL = function(url){
    prevPageURL = url;
  };

  var areThereNewElements = function(id){
    if(lastElementID==-1){
      lastElementID = id;
      return true;
    }else if(id==lastElementID){
      return false;
    }else{
      lastElementID = id;
      return true;
    }
  };

  var getMoreThreads = function(){

  }

  var getThreads = function(){
    return threads;
  };

  var pushThread = function(t){
    for(var i=0; i<threads.length; i++){
      if(threads[i].id==t.id){
        return false;
      }
    }

    threads.push(t);
    threads.sort(compareTime);

    console.log(threads);
  };

  var getThread = function(id){
    for(var i=0; i<threads.length; i++){
      if(threads[i].id==id){
        return threads[i];
      }
    }
    return null;
  };

  var removeThread = function(id){
    for(var i=0; i<threads.length; i++){
      if(threads[i].id==id){
        return threads.splice(i, 1);;
      }
    }
    return null;
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
