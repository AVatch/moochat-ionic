/**
* moo.services.authentication Module
*
* Description
*/
angular.module('moo.services.authentication', [])

.factory('Authentication', ['$http', 'localStorageService','DOMAIN', 'VERSION',
  function($http, localStorageService, DOMAIN, VERSION){
  
    var authenticateUser = function(credentials){
      var response = $http({
        url: DOMAIN + '/api/'+VERSION+'/api-token-auth/',
        method: 'POST',
        contentType: "application/json; charset=UTF-8",
        data: credentials
      });
      return response;
    };

    var registerUser = function(user){
      var response = $http({
        url: DOMAIN + '/api/'+VERSION+'/accounts/create/',
        method: 'POST',
        contentType: "application/json; charset=UTF-8",
        data: user
      });
      return response;
    };

    var getToken = function(){
      return localStorageService.get('token');
    };

    var cacheToken = function(token){
      return localStorageService.set('token', token);
    };

    var logout = function(){
      localStorageService.remove('token');
      localStorageService.remove('me');
    };

    return{
      authenticateUser: authenticateUser,
      registerUser: registerUser,

      getToken: getToken,
      cacheToken: cacheToken,
      logout: logout
    };
}]);
