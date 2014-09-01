/*Weather.controller('LocationsController', ['$scope','$http', function($scope,$http) {
  
	$scope.locations = null;
		
	$http({
		url: "http://localhost:1337/request/weather/zipcode/61265/locations",
		method: "GET"
	}).success(function(data, status, headers, config) {
    	$scope.location = data;
	}).error(function(data, status, headers, config) {
    	$scope.status = status;
	});
}]);*/