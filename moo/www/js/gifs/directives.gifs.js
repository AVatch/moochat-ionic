/**
* moo.directives.gifs Module
*
* Description
*/
angular.module('moo.directives.gifs', [])

.directive('gif', ['GifManager', function(GifManager){
  return {
    scope: {
      gif: '='
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
        $scope.gif.backgroundColor = randomColor();
        $scope.gif = newValue;
      });
    }
  };
}]);