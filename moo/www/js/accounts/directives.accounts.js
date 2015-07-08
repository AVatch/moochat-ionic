/**
* moo.directives.accounts Module
*
* Description
*/
angular.module('moo.directives.accounts', [])

.directive('avatar', ['AccountManager', function(AccountManager){
  return {
    scope: {
      account: '='
    },
    restrict: 'E',
    templateUrl: 'js/accounts/templates/avatar.directive.html',
    controller: function($scope, $element, $attrs, $transclude) {
      
      $scope.$watch("account",function(newValue, OldValue, scope){
        $scope.account = AccountManager.getAccount($scope.account.id);
      });
      
    }
  };
}]);