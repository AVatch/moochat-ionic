/**
* moo.directives.notes Module
*
* Description
*/
angular.module('moo.directives.notes', [])

.directive('note', ['Account', function(Account){
  return {
    scope: {
      note: '='
    },
    restrict: 'E',
    templateUrl: 'js/notes/templates/note.directive.html',
    controller: function($scope, $element, $attrs, $transclude, $timeout) {
      var me = Account.getMe();

      $scope.like = function($event, note){
        
        $scope.x = $event.gesture.center.pageX;
        $scope.y = $event.gesture.center.pageY;
        
        $scope.liked = true;
        $timeout(function(){
          $scope.liked = false;
        }, 500);

      };

      $scope.$watch("note",function(newValue, OldValue, scope){
        if(me.id==$scope.note.author.id){
          $scope.me = true;
          $scope.direction = "right";
          $scope.margin = "margin-left";
        }else{
          $scope.me = false;
          $scope.direction = "left";
          $scope.margin = "margin-right";
        }
        $scope.note = newValue;
      });
    }
  };
}]);