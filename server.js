var http = require('http');
var site = require('./lib/core/site.js');

http.createServer(function(oRequest, oResponse){
	if( oRequest.method !== 'GET' ){
		oResponse.writeHead(500, {'Content-Type': 'text/html'});
		oResponse.end((function( ){
			return  '<!doctype html>' +
					'<html><head><title>An Error Has Occurred</title></head>' +
					'<body><h1>Invalid Operation</h1><p>An illegal post operation has occurred. '+
					'This means that a form was submitted on a non-secure server. '+
					'Contact the site administrator with details of this error!</p></body>' +
					'</html>';
		}));
	}
	site.render( oRequest, oResponse );
}).listen(1337, '127.0.0.1');