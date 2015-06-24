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

.factory('NoteManager', ['$http', 'Authentication', 'Note', 
  function($http, Authentication, Note){
  
  var notes = {};
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

  var randomColor = function(){
      /*
       * Pick a random color
       *  @returns style object
       */ 
      var colors = ["#39B38A", "#2374B7", "#D3473D", "#F8E588", 
      "#35d7dc", "#48babb", "#4627a2", "#4f616c", "#dc7a6d", 
      "#da4368", "#fcc569"];
      var color = colors[Math.floor(Math.random()*colors.length)];
      return color;
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
    /*
     * Add a new note object
     */ 
    // process note
    n.formattedDate = formatDate(n);
    n.backgroundColor = randomColor();
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
    clearNotes: clearNotes,
    randomColor: randomColor
  };
}]);
