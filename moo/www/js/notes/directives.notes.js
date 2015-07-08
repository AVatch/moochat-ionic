/**
* moo.directives.notes Module
*
* Description
*/
angular.module('moo.directives.notes', [])

.directive('note', ['NoteManager', function(NoteManager){
  return {
    scope: {
      note: '='
    },
    restrict: 'E',
    templateUrl: 'js/notes/templates/note.directive.html',
    controller: function($scope, $element, $attrs, $transclude) {
      
    }
  };
}]);