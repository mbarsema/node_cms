Weather.controller('CurrentsController', ['$scope','$http', function($scope,$http) {
  
	$scope.currents = null;
		
	$http({
		url: "http://localhost:1337/request/weather/zipcode/61265/conditions",
		method: "GET"
	}).success(function(data, status, headers, config) {
    	$scope.currents = data;
	}).error(function(data, status, headers, config) {
    	$scope.status = status;
	});	
}]);