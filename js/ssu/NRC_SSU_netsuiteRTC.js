


function entry(req, res) {
	if(req.getMethod() === 'GET') {
		var indRes = nlapiRequestURL('https://raw.githubusercontent.com/Angus-McLean/netsuite-rtc/master/index.html?nocachepara='+(''+Math.random()).slice(2));
		res.write(indRes.getBody());
	}
}