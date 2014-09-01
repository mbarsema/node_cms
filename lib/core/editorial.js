var fs = require('fs');
var mime = require('mime');
var path = require('path');

exports.route = function( url, post ){
	var base = path.basename( url );
	var ext = path.extname( url );
	var type = 'index';
	if(base.match(/[a-z]+_/)){
		type = 'story';
	}
	return {'filename': './resources/templates/editorial/'+type+'.html', 'extension': ext};
};

exports.normalize = function( url ){
	var base = path.basename( url );
	var ext = path.extname( url );
	var parts = base.split('_');
	var type = parts[0];
	var uuid = parts[1].split('.')[0];
	
	return {
		'request': type,
		'params': {'uuid': uuid}
	};
};

exports.story = function( res, params ){
	var filename = './content/editorial/story/'+params['uuid']+'.json';
	fs.exists( filename, function( exists ){
		if( exists ){
			var contentType = mime.lookup('.json');
			res.writeHead(200, {'Content-Type': contentType});
			var readStream = fs.createReadStream(filename);
			var streamError = false;
			readStream.on('open', function(){
				readStream.pipe(res);
			});
			
			readStream.on('error', function(err){
				streamError = true;
			});
			
			readStream.on('close', function(){
				if(streamError){
					res.writeHead(500, {'Content-Type': 'text/html'});
  					res.end('<!doctype html><html><head><title>500 - Server Error!</title></head><body><h1>Error</h1><p>Server error!</p></body></html>');
					return;
				}
				res.end();
			});
		}else{
			res.writeHead(404, {'Content-Type': 'text/html'});
			res.end('<!doctype html><html><head><title>404 File Not Found!</title></head><body><h1>File Not Found</h1><p>Not Found!</p></body></html>');
		}	
	});
};