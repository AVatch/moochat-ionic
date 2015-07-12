/**
* moo.services.accounts Module
*
* Description
*/
angular.module('moo.services.accounts', [])

.factory('Account', ['$http', 'Authentication', 'localStorageService', 'DOMAIN', 'VERSION',
  function($http, Authentication, localStorageService, DOMAIN, VERSION){
    
    var me = function(){
      var token = Authentication.getToken();
      var response = $http({
                        url: DOMAIN + '/api/'+VERSION+'/me/',
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
                        url: DOMAIN + '/api/'+VERSION+'/accounts/' + pk + '/friends/',
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
                        url: DOMAIN + '/api/'+VERSION+'/accounts/' + pk + '/threads/',
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
                        url: DOMAIN + '/api/'+VERSION+'/accounts/' + pk + '/add/friend/',
                        method: 'POST',
                        headers: { 
                          'Content-Type': 'application/json',
                          'Authorization': 'Token ' + token.token },
                        data: ''
                      });
      return response;
    };

    var searchAccount = function(q){
      var token = Authentication.getToken();
      var response = $http({
                        url: DOMAIN + '/api/'+VERSION+'/accounts/search/',
                        method: 'POST',
                        headers: { 
                          'Content-Type': 'application/json',
                          'Authorization': 'Token ' + token.token },
                        data: q
                      });
      return response;
    }
    
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
      getThreadList: getThreadList,
      searchAccount: searchAccount,
      cacheMe: cacheMe,
      getMe: getMe    
    };
}])

.factory('AccountManager', ['Account', 'COLORS', function(Account, COLORS){
  
    var accounts = {};
    var processedMe = {};

    var isMe = function(a){
      /*
       * Check if the account is the signed in user
       *  @returns: Bool
       */
      return (a.id == Account.getMe().id);
    };

    var getInitials = function(a){
      /*
       * Parse capitalized initials from first and last name
       *  @returns: String
       */ 
      return a.first_name.charAt(0).toUpperCase() + a.last_name.charAt(0).toUpperCase();
    };

    var randomColor = function(){
      /*
       * Pick a random color for avators
       *  @returns style object
       */ 
      var colors = COLORS;
      var color = colors[Math.floor(Math.random()*colors.length)];
      return color;
    };

    var applyColor = function(a){
      /*
       * Assigns a random color to a user
       */
      a.color = randomColor();
    };

    var applyInitials = function(a){
      /*
       * Assign user initials
       */
      a.initials = getInitials(a);
    };

    // Account handlers
    var getAccounts = function(){
      /*
       * Returns accounts
       */
      return accounts;
    };

    var pushAccount = function(a){
      /*
       * Add an account to the array
       */

      if(accounts[a.id]){
        return;
      }

      // process account object
      a.me = isMe(a);
      applyColor(a);
      applyInitials(a);

      // push it
      accounts[a.id] = a;

    };

    var getAccount = function(id){
      /*
       * Get an account
       */
      return accounts[id];
    };

    var removeAccount = function(id){
      /*
       * Remove an account
       */
       delete accounts[id];
    };

    var clearAccounts = function(){
      accounts = {};
    };


    return{
      getAccounts: getAccounts,
      pushAccount: pushAccount,
      getAccount: getAccount,
      clearAccounts: clearAccounts
    };
}]);
