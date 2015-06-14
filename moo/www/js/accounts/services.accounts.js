/**
* moo.services.accounts Module
*
* Description
*/
angular.module('moo.services.accounts', [])

.factory('Account', ['$http', 'Authentication', 'localStorageService', 'DOMAIN',
  function($http, Authentication, localStorageService, DOMAIN){
    
    var me = function(){
      var token = Authentication.getToken();
      var response = $http({
                        url: DOMAIN + '/api/v1/me/',
                        method: 'GET',
                        headers: { 
                          'Content-Type': 'application/json',
                          'Authorization': 'Token ' + token.token },
                        data: ''
                      });
      return response;
    };

    var getFriendList = function(pk){
      var token = Authentication.getToken();
      var response = $http({
                        url: DOMAIN + '/api/v1/accounts/' + pk + '/friends/',
                        method: 'GET',
                        headers: { 
                          'Content-Type': 'application/json',
                          'Authorization': 'Token ' + token.token },
                        data: ''
                      });
      return response;
    };
    
    var getAccountist = function(){
      var token = Authentication.getToken();
      var response = $http({
                        url: DOMAIN + '/api/v1/accounts/',
                        method: 'GET',
                        headers: { 
                          'Content-Type': 'application/json',
                          'Authorization': 'Token ' + token.token },
                        data: ''
                      });
      return response;
    };
    
    var getThreadList = function(pk){
      var token = Authentication.getToken();
      var response = $http({
                        url: DOMAIN + '/api/v1/accounts/' + pk + '/threads/',
                        method: 'GET',
                        headers: { 
                          'Content-Type': 'application/json',
                          'Authorization': 'Token ' + token.token },
                        data: ''
                      });
      return response;
    };
    
    var friendAccount = function(pk){
      var token = Authentication.getToken();
      var response = $http({
                        url: DOMAIN + '/api/v1/accounts/' + pk + '/friends/',
                        method: 'POST',
                        headers: { 
                          'Content-Type': 'application/json',
                          'Authorization': 'Token ' + token.token },
                        data: ''
                      });
      return response;
    };
    
    var cacheMe = function(me){
      return localStorageService.set('me', me);
    };
    
    var getMe = function(){
      return localStorageService.get('me');
    };

    return{
      me: me,
      getFriendList: getFriendList,
      friendAccount: friendAccount,
      getAccountist: getAccountist,
      getThreadList: getThreadList,
      cacheMe: cacheMe,
      getMe: getMe    
    };
}]);
