/**
* moo.services.notes Module
*
* Description
*/
angular.module('moo.services.notes', [])

.factory('Note', ['$http', 'Authentication', 'DOMAIN',
  function($http, Authentication, DOMAIN){
    
    var createNote = function(note){
      var token = Authentication.getToken();
      var response = $http({
                        url: DOMAIN + '/api/v1/notes/',
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

.factory('NoteManager', ['Note', function(Noet){
  
  var notes = {};
  var nextPageURL;
  var prevPageURL;

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

  var getMoreNotes = function(){
    /*
     * Pull the next page of notes and update
     * the notes and page pointers
     */ 

  };

  var getNotes = function(){
    /*
     * Return all the cached notes
     */ 
    return notes;
  };

  var pushNote = function(n){
    /*
     * Add a new note object
     */ 
    
    // add it to the notes
    notes[n.id] = n;
  };

  var getNote = function(id){
    /*
     * Get a note
     */ 
    return notes[id];
  };

  var removeNote = function(id){
    /*
     * Remove a note
     */ 
    delete notes[id];
  };

  var clearNotes = function(){
    /*
     * Clear all notes
     */ 
    notes = {};
  };  


  return{
    setNextPageURL: setNextPageURL,
    setPrevPageURL: setPrevPageURL, 
    getMoreNotes: getMoreNotes,
    getNotes: getNotes, 
    pushNote: pushNote, 
    getNote: getNote,
    removeNote: removeNote, 
    clearNotes: clearNotes
  };
}]);
