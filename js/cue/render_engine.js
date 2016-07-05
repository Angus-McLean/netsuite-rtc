(function () {

	var cache = {};

	function fetchTemplateString(templateName, cb) {
		if(cache[templateName])	return cb(null,cache[templateName]);

		var xhr = new XMLHttpRequest();
		xhr.open('GET', templateName + '?_=' + new Date().getTime());
		xhr.send();
		xhr.onload = function () {
			cache[templateName] = xhr.responseText;
			cb(null, xhr.responseText);
		};
	}

	function process(htmlStr, obj) {
		return htmlStr.replace(new RegExp('{{(\\w+)}}', 'g'), function (keyName) {
			return obj[keyName.replace(/{|}/g,'')] || '';
		});
	}

	function fillInNode(str, parentNode) {
		parentNode.innerHTML = str;
	}

	function prependToNode(str, parentNode) {
		parentNode.innerHTML = str + parentNode.innerHTML;
	}

	function appendToNode(str, parentNode) {
		parentNode.innerHTML = parentNode.innerHTML + str;
	}

	function builder(domOp) {
		var domOpInner = domOp;
		return function render(templateName, values, parentNode) {
			fetchTemplateString(templateName, function (err, str) {
				var processedStr = process(str, values);
				domOpInner(processedStr, parentNode);
			});
		};
	}

	var render_engine = {
		prepend : builder(prependToNode),
		append : builder(appendToNode),
		replace : builder(fillInNode)
	};

	window.render_engine = render_engine;
	return render_engine;

})();
