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
}]);
