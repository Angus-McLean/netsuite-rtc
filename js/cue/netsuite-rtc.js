(function () {
	
	var connectionRecord;
	
	var RECORD_TYPE = 'customrecord_webrtc_connector';
	var FIELDS = {
		OFFER : 'custrecord_rtc_offer',
		ANSWER : 'custrecord_rtc_answer'
	};
	
	function initializeConnection(connectorObj) {
		var conRec = nlapiCreateRecord(RECORD_TYPE, connectorObj);
		connectionRecord = conRec;
		return nlapiSubmitRecord(conRec);
	}
	
	function findOpenConnections() {
		var filters = [
			[FIELDS.OFFER, 'isnotempty', null],
			'AND',
			[FIELDS.ANSWER, 'isempty', null],
		];
		var res = nlapiSearchRecord(RECORD_TYPE, null, filters);
		return searchResultToObj(res);
	}
	
	function searchResultToObj(searchRes) {
		return searchRes && searchRes.map(function (row) {
			
			var retObj = a.valuesByKey;
			retObj.id = row.id;
			retObj.type = row.type;
			
			return retObj;
		});
	}
	
	function updateField(recId, fields, values) {
		nlapiSubmitField(RECORD_TYPE, recId, fields, values);
	}
	
	var netsuiteRtc_module = {
		constants : {
			RECORD_TYPE : RECORD_TYPE,
			FIELDS : FIELDS
		},
		initializeConnection : initializeConnection,
		findOpenConnections : findOpenConnections,
		connectionRecord : connectionRecord,
		updateField : updateField
	};
	window.netsuiteRtc_module = netsuiteRtc_module;
	return netsuiteRtc_module;
	
})();