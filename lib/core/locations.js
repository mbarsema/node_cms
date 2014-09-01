exports.request = function( res, params, callback ){
	var location = null;
	
	if( typeof( params['zipcode'] ) != 'undefined' ){
		switch( params['zipcode'] ){
			case '61265':
				location = {'name' : 'Moline, IL','metar' : 'KMLI','lat' : 41.50,'long' : 90.52,'alerts' : 'ILC161','zipcode':61265};
			break;
			case '52001':
				location = {'name' : 'Dubuque, IA','metar' : 'KDBQ','lat' : 42.50,'long' : 90.66,'alerts' : 'IAC061'};
			break;
			case '68110':
				location = {'name': 'Omaha, NE','metar' : 'KOMA','lat' : 41.30,'long' : 95.90,'alerts' : 'NEC055'};
			break;
			case '60656':
				location = {'name' : 'Chicago, IL','metar' : 'KORD','lat' : 41.98,'long' : 87.90,'alerts' : 'ILC031'};
			break;
			case '11372':
				location = {'name' : 'New York City, NY','metar' : 'KLGA','lat' : 40.78,'long' : 73.87,'alerts' : 'NYC061'};
			break;
			case '94128':
				location = {'name' : 'San Francisco, CA','metar' : 'KSFO','lat' : 37.62,'long' : 122.38,'alerts' : 'CAC013'};
			break;
			case '78719':
				location = {'name' : 'Austin, TX','metar' : 'KAUS','lat' : 30.19,'long' : 97.67,'alerts' : 'TXC453'};
			break;
		}
	}else if( typeof( params['city'] ) != 'undefined' ){
		switch( oConfig['city'] ){
			case 'Moline':
				location = {'name' : 'Moline, IL','metar' : 'KMLI','lat' : 41.50,'long' : 90.52,'alerts' : 'ILC161','zipcode':61265};
			break;
			case 'Dubuque':
				location = {'name' : 'Dubuque, IA','metar' : 'KDBQ','lat' : 42.50,'long' : 90.66,'alerts' : 'IAC061'};
			break;
			case 'Omaha':
				location = {'name': 'Omaha, NE','metar' : 'KOMA','lat' : 41.30,'long' : 95.90,'alerts' : 'NEC055'};
			break;
			case 'Chicago':
				location = {'name' : 'Chicago, IL','metar' : 'KORD','lat' : 41.98,'long' : 87.90,'alerts' : 'ILC031'};
			break;
			case 'New York City':
				location = {'name' : 'New York City, NY','metar' : 'KLGA','lat' : 40.78,'long' : 73.87,'alerts' : 'NYC061'};
			break;
			case 'San Francisco':
				location = {'name' : 'San Francisco, CA','metar' : 'KSFO','lat' : 37.62,'long' : 122.38,'alerts' : 'CAC013'};
			break;
			case 'Austin':
				location = {'name' : 'Austin, TX','metar' : 'KAUS','lat' : 30.19,'long' : 97.67,'alerts' : 'TXC453'};
			break;
		}
	}else if( typeof( params['lat'] ) != 'undefined' ){
		return null;
	}
	callback( res, location );
};