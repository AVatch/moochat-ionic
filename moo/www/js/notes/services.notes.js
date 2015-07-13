/**
* moo.services.notes Module
*
* Description
*/
angular.module('moo.services.notes', [])

.factory('Note', ['$http', 'Authentication', 'DOMAIN', 'VERSION',
  function($http, Authentication, DOMAIN, VERSION){
    
    var createNote = function(note){
      var token = Authentication.getToken();
      var response = $http({
                        url: DOMAIN + '/api/'+VERSION+'/notes/',
                        method: 'POST',
                        headers: { 
                          'Content-Type': 'application/json',
                          'Authorization': 'Token ' + token.token },
                        contentType: "application/json; charset=UTF-8",
                        data: note
                      });
      return response;
    };

    return{
      createNote: createNote
    };
}])

.factory('NoteManager', ['$http', 'Authentication', 'Note',
  function($http, Authentication, Note){
  
  var notes = [];
  var nextPageURL;
  var prevPageURL;
  var lastElementID = -1;

  function compareTime(a,b) {
    var a = new Date(a.time_created);
    var b = new Date(b.time_created)
    if (a < b)
      return -1;
    if (a > b)
      return 1;
    return 0;
  }

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

  var areThereNewElements = function(id){
    /*
     * determine if there are new elements
     */ 
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

  var getMoreNotes = function(){
    var token = Authentication.getToken();
    var response = $http({
                      url: nextPageURL,
                      method: 'GET',
                      headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': 'Token ' + token.token },
                      contentType: "application/json; charset=UTF-8",
                    });
    return response;
  };

  var getNotes = function(){
    /*
     * Return all the cached notes
     */
    return notes;
  };

  var pushNote = function(n){
    for(var i=0; i<notes.length; i++){
      if(notes[i].id==n.id){
        return false;
      }
    }
    
    notes.push(n);
    notes.sort(compareTime);
  };

  var getNote = function(id){
    /*
     * Get a note
     */ 
    for(var i=0; i<notes.length; i++){
      if(notes[i].id==id){
        return notes[i];
      }
    }
    return null;
  };

  var clearNotes = function(){
    /*
     * Clear all notes
     */ 
    notes = [];
  };  


  return{
    setNextPageURL: setNextPageURL,
    setPrevPageURL: setPrevPageURL, 
    getMoreNotes: getMoreNotes,
    getNotes: getNotes, 
    pushNote: pushNote, 
    getNote: getNote,
    clearNotes: clearNotes,
    areThereNewElements: areThereNewElements
  };
}]);
