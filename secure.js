//var http = require('https');
var http = require('http');
var qs = require('querystring');
var site = require('./lib/core/site.js');

http.createServer(function(oRequest, oResponse){
	if( oRequest.method === 'POST' ){
		var postData = '';
		oRequest.on('data', function( chunk ){
			postData += chunk;
		}).on('end', function(){
			postData = qs.parse( postData );
			delete postData['submit'];
			site.render( oRequest, oResponse, postData );
		});
		return;
	}
	site.render( oRequest, oResponse );
}).listen(1443, '127.0.0.1');