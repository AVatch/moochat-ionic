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
                        url: DOMAIN + '/api/v1/accounts/' + pk + '/add/friend/',
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
                        url: DOMAIN + '/api/v1/accounts/search/',
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

.factory('AccountManager', ['Account', function(Account){
  
    var accounts = [];

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
      var colors = ["#39B38A", "#2374B7", "#D3473D", "#F8E588", 
      "#35d7dc", "#48babb", "#4627a2", "#4f616c", "#dc7a6d", 
      "#da4368", "#fcc569"];
      var color = colors[Math.floor(Math.random()*colors.length)];
      return {'background-color': color};
    };

    var applyColor = function(a){
      /*
       * Assigns a random color to a user
       */
      a.avatarColor = randomColor();
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

      // process account object
      a.me = isMe(a);
      applyColor(a);
      applyInitials(a);

      // push it
      accounts.push(a);

    };

    var getAccount = function(id){
      /*
       * Get an account
       */
      for(var i=0; i<accounts.length; i++){
        if(accounts[i].id==id){
          return accounts[i];
        }
      }
      return {};
    };

    return{
      getAccounts: getAccounts,
      pushAccount: pushAccount,
      getAccount: getAccount
    };
}]);
