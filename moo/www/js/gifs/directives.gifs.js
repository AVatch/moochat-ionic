/**
* moo.directives.gifs Module
*
* Description
*/
angular.module('moo.directives.gifs', [])

.directive('gif', ['GifManager', function(GifManager){
  return {
    scope: {
      gif: '=',
      width: '=',
      height: '='
    },
    restrict: 'E',
    templateUrl: 'js/gifs/templates/gif.directive.html',
    controller: function($scope, $element, $attrs, $transclude, COLORS) {

      var randomColor = function(){
        var colors = COLORS;
        var color = colors[Math.floor(Math.random()*colors.length)];
        return color;
      };

      $scope.$watch("gif",function(newValue, OldValue, scope){
        $scope.gif["backgroundColor"] = randomColor();
        $scope.gif = newValue;
      });

      $scope.$watch("width",function(newValue, OldValue, scope){
        $scope.width = newValue;
      });

      $scope.$watch("height",function(newValue, OldValue, scope){
        $scope.height = newValue;
      });
    }
  };
}]);