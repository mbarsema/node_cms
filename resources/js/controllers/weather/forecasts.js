Weather.controller('ForecastsController', ['$scope','$http', function($scope,$http) {

	$scope.forecasts = null;
	
	$http({
		url: "http://localhost:1337/request/weather/zipcode/61265/forecasts",
		method: "GET"
	}).success(function(data, status, headers, config) {
    	$scope.forecasts = data;
	}).error(function(data, status, headers, config) {
    	$scope.status = status;
	});
}]);