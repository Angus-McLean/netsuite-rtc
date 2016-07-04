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
	
	function loadChatRecordObject(id) {
		return recordToObject(nlapiLoadRecord(RECORD_TYPE,id));
	}
	
	function searchResultToObj(searchRes) {
		return searchRes && searchRes.map(function (row) {
			
			var retObj = a.valuesByKey;
			retObj.id = row.id;
			retObj.type = row.type;
			
			return retObj;
		});
	}
	
	function recordToObject(record) {
		return FIELDS.reduce(function (obj, f) {
			obj[f] = record.getFieldValue(f);
		}, {
			id : record.getId(),
			type : record.getRecordType()
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