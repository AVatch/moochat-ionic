/**
* moo.directives.gifs Module
*
* Description
*/
angular.module('moo.directives.gifs', [])

.directive('gif', ['GifManager', function(GifManager){
  return {
    scope: {
      content: '='
    },
    restrict: 'E',
    templateUrl: 'js/gifs/templates/gif.directive.html',
    controller: function($scope, $element, $attrs, $transclude) {
      
      $scope.$watch("content",function(newValue, OldValue, scope){
        $scope.content = newValue;
      });
    }
  };
}]);