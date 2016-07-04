


function entry(req, res) {
	if(req.getMethod() === 'GET') {
		var indRes = nlapiRequestURL('https://raw.githubusercontent.com/Angus-McLean/netsuite-rtc/master/index.html?nocachepara='+(''+Math.random()).slice(2));
		
		var form = nlapiCreateForm('NetSuite RTC', false);
		form.addField('custpage_content','inlinehtml',null);
		//var htmlStr = '<iframe>' + indRes.getBody() + '</iframe>';
		form.setFieldValues({'custpage_content' : indRes.getBody()});
		res.writePage(form);
	}
}