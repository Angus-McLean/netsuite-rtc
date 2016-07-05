(function () {

	var RECORD_TYPE = 'customrecord_webrtc_connector';
	var FIELDS = {
		OFFER : 'custrecord_rtc_offer',
		ANSWER : 'custrecord_rtc_answer',
		EMPLOYEE : 'custrecord_rtc_host_employee',
		NAME : 'name'
	};

	function initializeConnection(connectorObj) {
		var conRec = nlapiCreateRecord(RECORD_TYPE);
		for (var i in connectorObj) {
			if (connectorObj.hasOwnProperty(i)) {
				conRec.setFieldValue(i, connectorObj[i])
			}
		}
		return nlapiSubmitRecord(conRec);
	}

	function findOpenConnections() {
		var filters = [
			[FIELDS.OFFER, 'isnotempty', null],
			'AND',
			[FIELDS.ANSWER, 'isempty', null],
		];
		var cols = Object.keys(FIELDS).map(function (prop) {
			return new nlobjSearchColumn(FIELDS[prop]);
		});
		var res = nlapiSearchRecord(RECORD_TYPE, null, filters, cols);
		return searchResultToObj(res);
	}

	function loadChatRecordObject(id) {
		return recordToObject(nlapiLoadRecord(RECORD_TYPE,id));
	}

	function searchResultToObj(searchRes) {
		return searchRes && searchRes.map(function (row) {

			var retObj = row.valuesByKey;
			retObj.id = row.id;
			retObj.type = row.type;

			return retObj;
		});
	}

	function reduceToValues(arrOrObj) {
		function reduceObj(obj){
			return Object.keys(obj).reduce(function (final, key) {
				final[key] = (obj[key] && obj[key].value !== undefined) ? final[key] = obj[key].value : final[key] = obj[key];
				return final;
			});
		}
		return (Array.isArray(arrOrObj)) ? arrOrObj.map(reduceObj) : reduceObj(arrOrObj);
	}

	function recordToObject(record) {
		return Object.keys(FIELDS).reduce(function (obj, f) {
			obj[FIELDS[f]] = record.getFieldValue(FIELDS[f]);
			return obj;
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
		updateField : updateField,
		loadChatRecordObject : loadChatRecordObject,
		recordToObject : recordToObject,
		reduceToValues : reduceToValues
	};
	window.netsuiteRtc_module = netsuiteRtc_module;
	return netsuiteRtc_module;

})();
