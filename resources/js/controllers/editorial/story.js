Editorial.controller('StoryController', ['$scope','$http', function($scope,$http) {
  
	$scope.story = null;
	
	// obtain uuid
	var url = document.URL;
	var parts = url.split('/');
	var uuid = parts.pop();
	uuid = uuid.split('.')[0];
	$http({
		url: "http://localhost:1337/request/editorial/" + uuid + ".html",
		method: "GET"
	}).success(function(data, status, headers, config) {
    	$scope.story = JSON.parse( data );
	}).error(function(data, status, headers, config) {
    	$scope.status = status;
	});	
}]);