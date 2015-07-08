/**
* moo.services.gifs Module
*
* Description
*/
angular.module('moo.services.gifs', [])

.factory('Gif', ['$http', 'Authentication', 'DOMAIN',
  function($http, Authentication, DOMAIN){
    
    var searchGif = function(q){
      var token = Authentication.getToken();
      var response = $http({
                        url: DOMAIN + '/api/v1/gif/search/',
                        method: 'POST',
                        headers: { 
                          'Content-Type': 'application/json',
                          'Authorization': 'Token ' + token.token },
                        contentType: "application/json; charset=UTF-8",
                        data: q
                      });
      return response;
    };
    
    var randomGif = function(){
      var response = $http({
                        url: DOMAIN + '/api/v1/gif/random/',
                        method: 'GET',
                        headers: { 
                          'Content-Type': 'application/json'},
                        contentType: "application/json; charset=UTF-8",
                      });
      return response;
    };

    return{
      searchGif: searchGif,
      randomGif: randomGif
    };
}])

.factory('GifManager', ['Gif', 'COLORS', function(Gif, COLORS){
  
    var gifs = {};

    var randomColor = function(){      
      var colors = COLORS;
      var color = colors[Math.floor(Math.random()*colors.length)];
      return color;
    };

    var applyColor = function(g){
      g.color = randomColor();
    };

    var pushGif = function(g){
      if(gifs[g.id]){
        return;
      }
      applyColor(g);
      gifs[g.id] = g;

    };

    var getGifs = function(){
      return gifs;
    };

    var getGif = function(id){
      return gifs[id];
    };

    var removeGif = function(id){
       delete gifs[id];
    };

    var clearGifs = function(){
      gifs = {};
    };

    return{
      getGifs: getGifs,
      pushGif: pushGif,
      getGif: getGif,
      clearGifs: clearGifs
    };
}]);
