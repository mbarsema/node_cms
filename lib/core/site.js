var fs = require('fs');
var qs = require('querystring');
var path = require('path');
var url = require('url');
var mime = require('mime');

exports.render = function( oRequest, oResponse, oPost ){
	var dirs = path.dirname(decodeURI(oRequest.url));
	dirs = dirs.split('/');
	dirs.shift(); // Remove trailing slash
	var filename = './resources/templates/system/404.html';
	var extension = 'html';
	var selectedModule = dirs.shift();
	
	switch( selectedModule ){
		case 'request':
			selectedModule = dirs.shift();
			var module = require('./' + selectedModule + '.js');
			if( typeof(module) != 'undefined' && typeof( module.normalize ) == 'function' ){
				var moduleConfig = module.normalize( decodeURI( oRequest.url) );
				if( typeof( moduleConfig ) == 'object' && typeof(module[moduleConfig['request']]) == 'function' ){
					module[moduleConfig['request']]( oResponse, moduleConfig['params'] );
				}
				return;
			}
			oResponse.writeHead(404, {'Content-Type': 'text/html'});
			oResponse.end('<!doctype html><html><head><title>404 File Not Found!</title></head><body><h1>File Not Found</h1><p>Not Found!</p></body></html>');
			return;
		break;
		case 'resources':
		case 'content':
		case 'data':
			filename = '.' + decodeURI(oRequest.url);
			extension = path.extname(decodeURI(oRequest.url));
		break;
		case 'default':
		case 'index':
		case '':
			filename = './resources/templates/index.html';
			extension = '.html';
		break;
		default:
			if( selectedModule == 'form' || selectedModule == 'admin' ){
				if(oRequest.socket.localPort != 1443){
					oResponse.writeHead(301,{Location: 'https://localhost:1443'+decodeURI(oRequest.url)});
					oResponse.end();
					return;
				}
				if( oPost ){
					console.log('Do processing here');
				}
			}
			try{
				var module = require('./' + selectedModule + '.js');
				if(typeof(module) != 'undefined' && typeof( module.route ) == 'function' ){
					var route = module.route( decodeURI( oRequest.url ), oPost );
					filename = route.filename;
					extension = route.extension;
				}
			}catch(Exception){
				var ext = path.extname(decodeURI(oRequest.url));
				var base = path.basename(decodeURI(oRequest.url), ext);
				filename = './resources/templates/'+selectedModule+'/'+base+ext;	
			}
		break;
	}
	
	fs.exists( filename, function( exists ){
		if( exists ){
			var contentType = mime.lookup(extension);
			var readStream = fs.createReadStream(filename);
			var streamError = false;
			readStream.on('open', function(){
				oResponse.writeHead(200, {'Content-Type': contentType});
				readStream.pipe(oResponse);
			});
			
			readStream.on('error', function(err){
				streamError = true;
			});
			
			readStream.on('close', function(){
				if(streamError){
					oResponse.writeHead(500, {'Content-Type': 'text/html'});
  					oResponse.end('<!doctype html><html><head><title>500 - Server Error!</title></head><body><h1>Error</h1><p>Server error!</p></body></html>');
					return;
				}
				oResponse.end();
			});
		}else{
			oResponse.writeHead(404, {'Content-Type': 'text/html'});
			oResponse.end('<!doctype html><html><head><title>404 File Not Found!</title></head><body><h1>File Not Found</h1><p>Not Found!</p></body></html>');
		}	
	});
};