var servers = {'localhost:11211': 1};
var serverOpts = {
	timeout: 100,
	retries: 1,
	failures: 2,
	idle: 100	
};
var Memcached = require('memcached');
var memcached = new Memcached(servers, serverOpts);

exports.route = function( url, post ){
	return {'filename': './resources/templates/weather/index.html', 'extension': '.html'};
};

exports.normalize = function( url ){
	var path = require('path');
	var dirs = path.dirname(url).split('/');
	var ext = path.extname(url);
	var base = path.basename(url,ext);
	var params = {};
	
	dirs.shift(); // remove slash
	dirs.shift(); // remove request
	dirs.shift(); // remove weather
	var opts = dirs;
	
	switch( opts[0] ){
		case 'zipcode':
			params = {'zipcode': opts[1]};
		break;
		case 'city':
			params = {'country': opts[1], 'region': opts[2], 'city': opts[3]};
		break;
		case 'latlong':
			params = {'lat': opts[1], 'long': opts[2]};
		break;
	}
	return {'request': base, 'params': params};
};

exports.alerts = function(res, params){
	var callback = function(){
		var http = require('http');
		var locs = require('./locations.js');	
		locs.request(res, params, function( res, location ){
			var sXML = '';
			var aValues = [];
			var sPath = (location['alerts'] == 'all') ? '/cap/us.php?x=1' : '/cap/wwaatmget.php?x='+location['alerts']+'&y=1';
			var oConfig = {'port': 80, 'host': 'alerts.weather.gov', 'path': sPath};
			var oRequest = http.request( oConfig, function( oResponse ){
				oResponse.on('data', function( sChunk ){
					sXML += sChunk;
				});
				oResponse.on('end', function(){
					var parseString = require('xml2js').parseString;
					parseString(sXML, function( oError, oData ){
						var aValues = [];
						for( var i in oData['feed']['entry'] ){
							if(!oData['feed']['entry'].hasOwnProperty(i)) continue;
							var tmpData = oData['feed']['entry'][i];
							aValues.push({
								'issued': (typeof(tmpData['published']) != 'undefined') ? tmpData['published'] : null,
								'last_updated': (typeof(tmpData['updated']) != 'undefined') ? tmpData['updated'] : null,
								'title': (typeof(tmpData['title']) != 'undefined') ? tmpData['title'] : null,
								'summary': (typeof(tmpData['summary']) != 'undefined') ? tmpData['summary'] : null,
								'type': (typeof(tmpData['cap:event']) != 'undefined') ? tmpData['cap:event'] : null,
								'effective': (typeof(tmpData['cap:effective']) != 'undefined') ? tmpData['cap:effective'] : null,
								'expires': (typeof(tmpData['cap:expires']) != 'undefined') ? tmpData['cap:expires'] : null,
								'severity': (typeof(tmpData['cap:severity']) != 'undefined') ? tmpData['cap:severity'] : null,
								'areas': (typeof(tmpData['cap:areadesc']) != 'undefined') ? tmpData['cap:areadesc'] : null,
								'area_poly': (typeof(tmpData['cap:polygon']) != 'undefined') ? tmpData['cap:polygon'] : null,
								'geocode': (typeof(tmpData['cap:geocode']) != 'undefined') ? tmpData['cap:geocode'] : null
							});
						}
						if( aValues[0]['title'] == 'There are no active watches, warnings or advisories' ){
							aValues = [];
						}
						var lifetime = 60 * 20 * 20;
						memcached.set('wx:alerts:'+location['zipcode'], aValues, lifetime, function( err, result ){
							if( err ){
								console.log( err );
							}
						});
						res.writeHead(200, {'Content-Type': 'application/json'});
						res.end(JSON.stringify(aValues));
					});
				});
			});
			oRequest.end();
		});
	};
	memcached.get('wx:alerts:'+params['zipcode'], function( err, result ){
		if( err || result === false ){
			callback();
			return;
		}
		res.writeHead(200, {'Content-Type': 'application/json'});
		res.end(JSON.stringify(result));
	});
};

exports.conditions = function(res, params){
	var callback = function(){
		var http = require('http');
		var locs = require('./locations.js');	
		locs.request(res, params, function( res, location ){
			var sXML = '';
			var oValues = {};	
			var oConfig = {'port': 80,'host': 'w1.weather.gov','path': "/xml/current_obs/" + location['metar'] +'.xml'};

			var oRequest = http.request( oConfig, function( oResponse ){
				oResponse.on('data', function( sChunk ){
					sXML += sChunk;
				});
				oResponse.on('end', function(){
					var parseString = require('xml2js').parseString;
					parseString(sXML, function (oError, oData) {
						if( oError ){
							res.writeHead(500, {'Content-Type': 'text/html'});
							res.end('<!doctype html><html><head><title>500 - Server Error</head></title><body><h1>500 - Error</h1><p>Error occured</p></body></html>');
							return;
						}
					
						var oValues = {
								'location' : {
									'name': location['name'],
									'metar' : oData['current_observation']['station_id'][0],
									'lat' : oData['current_observation']['latitude'][0],
									'long' : oData['current_observation']['longitude'][0],
									'last_updated' : oData['current_observation']['observation_time_rfc822'][0]
								},
								'conditions' : oData['current_observation']['weather'][0],
								'temp' : oData['current_observation']['temp_f'][0],
								'relative_humidity' : oData['current_observation']['relative_humidity'][0],
								'wind' : {
									'direction' : oData['current_observation']['wind_dir'][0],		
									'degrees' : oData['current_observation']['wind_degrees'][0],
									'mph' : oData['current_observation']['wind_mph'][0],
								},
								'barometer' : oData['current_observation']['pressure_in'][0],
								'dewpoint' : oData['current_observation']['dewpoint_f'][0],
								'windchill' : (oData['current_observation']['windchill_f']) ? oData['current_observation']['windchill_f'][0] : null,
								'heatindex' : (oData['current_observation']['heatindex_f']) ? oData['current_observation']['heatindex_f'][0] : null,
								'visibility' : oData['current_observation']['visibility_mi'][0],
								'default_icon' : oData['current_observation']['icon_url_base'][0] + oData['current_observation']['icon_url_name'][0]
						};
						
						var lifetime = 20 * 60 * 60; // 20 mins
						memcached.set('wx:conditions:'+location['zipcode'], oValues, lifetime, function( err, result ){
							if( err ){
								console.log( err );
							}
						});
						res.writeHead(200, {'Content-Type': 'application/json'});
						res.end( JSON.stringify( oValues ) );
					});
				});
			});
			oRequest.end();
		});
	}
	
	memcached.get('wx:conditions:'+params['zipcode'], function( err, result ){
		if( err || result === false ){
			callback();
			return;
		}
		res.writeHead(200, {'Content-Type': 'application/json'});
		res.end(JSON.stringify(result));
	});
};


exports.forecasts = function(res, params){
	var callback = function(){
		var http = require('http');
		var locs = require('./locations.js');	
		locs.request(res, params, function( res, location ){
			var sXML = '';
			var aValues = [];
			var oConfig = {
				'port': 80,
				'host': 'graphical.weather.gov',
				'path': '/xml/sample_products/browser_interface/ndfdBrowserClientByDay.php?' +
						'lat=' + location['lat'] + '&lon=-'+ location['long'] + '&format=24+hourly&numDays=7'
			};
	
			var oRequest = http.request( oConfig, function( oResponse ){
				oResponse.on('data', function( sChunk ){
					sXML += sChunk;
				});
	
				oResponse.on('end', function(){
					var parseString = require('xml2js').parseString;
					parseString(sXML, function( oError, oData ){
						var aValues = [];
				
						var oTimes = oData['dwml']['data'][0]['time-layout'];
				
						for( var i in oTimes ){
							if(!oTimes.hasOwnProperty(i)) continue;
							var oTime = oTimes[i];
							if( oTime['$'] && oTime['$']['summarization'] && oTime['$']['summarization'] == '24hourly' ){
								if( oTime['$']['summarization'] == '24hourly' ){
									if( oTime['start-valid-time'].length == 1 || oTime['end-valid-time'].length == 1) continue;
									for( var j in oTime['start-valid-time'] ){
										if(!oTime['start-valid-time'].hasOwnProperty(j)) continue;
										if(typeof(aValues[j]) != 'object') aValues[j] = {};
										aValues[j]['start_time'] = oTime['start-valid-time'][j];
									}
									for( var k in oTime['end-valid-time'] ){
										if(!oTime['end-valid-time'].hasOwnProperty(k)) continue;
										if(typeof(aValues[k]) != 'object') aValues[k] = {};
										aValues[k]['end_time'] = oTime['end-valid-time'][k];
									}
								}else if( oTime['$']['summarization'] == '12hourly' ){
									if( oTime['start-valid-time'].length == 1 || oTime['end-valid-time'].length == 1 ) continue;
									for( var j in oTime['start-valid-time'] ){
										if(!oTime['start-valid-time'].hasOwnProperty(j)) continue;
										var index = Math.floor(j / 2);
										var frameidx = j % 2;
										if(typeof(aValues[index]['time_frame']) != 'object') aValues[index]['time_frame'] = [];
										if(typeof(aValues[index]['time_frame']) == 'undefined') aValues[index]['time_frame'][frameidx] = {};
										aValues[index]['time_frame'][frameidx]['start_time'].push( oTime['start-valid-time'][j] );
									}
							
									for( var k in oTime['end-valid-time'] ){
										if(!oTime['end-valid-time'].hasOwnProperty(k)) continue;
										var index = Math.floor(k / 2);
										var frameidx = k % 2;
										if(typeof(aValues[index]['time_frame']) != 'object') aValues[index]['time_frame'] = [];
										if(typeof(aValues[index]['time_frame']) == 'undefined') aValues[index]['time_frame'][frameidx] = {};
										aValues[index]['time_frame'][frameidx]['end_time'].push( oTime['end-valid-time'][k] );
									}
								}
							}
						}
				
						// Currently our API only delivers one location at a time. In the future we can change this
						// but because there's one location, only one set of params will be returned. 
						// As such we just loop through the individual parameters.
						var oForecast = oData['dwml']['data'][0]['parameters'][0];
						for( var t in oForecast['temperature'] ){
							if( !oForecast['temperature'].hasOwnProperty(t) ) continue;
							var oTemp = oForecast['temperature'][t];
							if( oTemp['$'] && oTemp['$']['type'] && (oTemp['$']['type'] == 'maximum' || oTemp['$']['type'] == 'minimum') ){
								var sTempIdx = ( oTemp['$']['type'] == 'maximum' ) ? 'high_temp' : 'low_temp';
								for( var i in oTemp['value'] ){
									if(!oTemp['value'].hasOwnProperty(i)) continue;
									if(typeof(aValues[i]) != 'object') aValues[i] = {};
									aValues[i][sTempIdx] = (typeof(oTemp['value'][i]) != 'object') ? oTemp['value'][i] : null;
								}
							}
						}
						/*for( var p in oForecast['probability-of-precipitation'] ){
							if(!oForecast['probability-of-precipitation'].hasOwnProperty(p)) continue;
							var percentChance = oForecast['probability-of-precipitation'][p];
							for( var i in percentChance['value'] ){
								if(!percentChance['value'].hasOwnProperty(i)) continue;
								var idx = Math.floor( i / 2 );
								var frameidx = i % 2;
								if(typeof(aValues[idx]['time_frame'][frameidx]) == 'undefined') aValues[idx]['time_frame'][frameidx] = {};
								if( typeof( percentChance['value'][i] ) == 'object' ){
									percentChance['value'][i] = null;
								}
								aValues[idx]['time_frame'][frameidx]['percent_chance'] = percentChance['value'][i];
							}
						}*/
				
						for( var w in oForecast['weather'][0]['weather-conditions'] ){
							if(!oForecast['weather'][0]['weather-conditions'].hasOwnProperty(w)) continue;
							oWeather = oForecast['weather'][0]['weather-conditions'][w];
							aValues[w]['conditions'] = oWeather['$']['weather-summary'];
							/*for( var c in oWeather['value'] ){
								if(!oWeather['value'].hasOwnProperty(c)) continue;
								if( typeof(aValues[w]['time_frame'][c]) == 'undefined') aValues[w]['time_frame'][c] = [];
								aValues[w]['time_frame'][c]['conditions'] = {
									'type': oWeather['value'][c]['$']['weather-type'] || null,
									'coverage': oWeather['value'][c]['$']['coverage'] || null,
									'intensity': oWeather['value'][c]['$']['intensity'] || null,
									'additive': oWeather['value'][c]['$']['additive'] || null,
									'qualifier': oWeather['value'][c]['$']['qualifier'] || null
								};	
							}*/
						}
				
						for( var i in oForecast['conditions-icon'][0]['icon-link'] ){
							if(!oForecast['conditions-icon'][0]['icon-link'].hasOwnProperty(i)) continue;
							aValues[i]['default_icon'] = oForecast['conditions-icon'][0]['icon-link'][i];
						}
						var lifetime = 20 * 60 * 60; // 20 mins
						memcached.set('wx:forecasts:'+location['zipcode'], aValues, lifetime, function( err, result ){
							if( err ){
								console.log( err );
							}
						});
						res.writeHead(200, {'Content-Type': 'application/json'});
						res.end(JSON.stringify(aValues));
					});
				});
			});
			oRequest.end();
		});
	};
	memcached.get('wx:forecasts:'+params['zipcode'], function( err, result ){
		if( err || result === false ){
			callback();
			return;
		}
		res.writeHead(200, {'Content-Type': 'application/json'});
		res.end(JSON.stringify(result));
	});
};