/**
* moo.directives.components Module
*
* Description
*/
angular.module('moo.directives.components', [])

.directive('timeStamp', [function(){
  return {
    scope: {
      time: '='
    },
    restrict: 'E',
    templateUrl: 'js/components/templates/timestamp.directive.html',
    controller: function($scope, $element, $attrs, $transclude) {

      var formatDate = function(t){
        var d = new Date(t);
        var now = new Date();
        var diff = now.getTime() - d.getTime();
        var day = 1000*60*60*24;
        if(diff > day){
          return d.toLocaleDateString();
        }else{
          return d.toLocaleTimeString();
        }
      };
      
      $scope.$watch("time",function(newValue, OldValue, scope){
        $scope.time = formatDate($scope.time);
      });

    }
  };
}]);