Weather.controller('AlertsController', ['$scope','$http', function($scope,$http) {
	$scope.alerts = null;
		
	$http({
		url: "http://localhost:1337/request/weather/zipcode/61265/alerts",
		method: "GET"
	}).success(function(data, status, headers, config) {
		/*
		var oIssueDate = new Date(aAlerts[i]['issued']);
		var sIssueDate = transformMonth(oIssueDate.getMonth() + 1) + " " + oIssueDate.getDate() + ", " + oIssueDate.getFullYear();
		var sIssueTime = transformHours(oIssueDate.getHours())+":"+transformMinutes(oIssueDate.getMinutes())+" "+translateAMPM(oIssueDate.getHours());
		
		var oExpireDate = new Date( aAlerts[i]['expires'] );
		var sExpireDate = transformMonth(oExpireDate.getMonth() + 1) + " " + oExpireDate.getDate() + ", " + oExpireDate.getFullYear();
		var sExpireTime = transformHours(oExpireDate.getHours())+":"+transformMinutes(oExpireDate.getMinutes())+" "+translateAMPM(oExpireDate.getHours());
		*/	
	
    	$scope.alerts = data;
	}).error(function(data, status, headers, config) {
    	$scope.status = status;
	});
}]);