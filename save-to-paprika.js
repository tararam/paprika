var d = document,
	withConfirmation = true,
	timeID = (new Date().getTime());

//*
var paprikaOfficialBookmarkletURL = 'https://www.paprikaapp.com/bookmarklet/v1/?token=eb6ec5bd28776f47&timestamp=' + timeID;
/*/
var paprikaOfficialBookmarkletURL = //'https://stage.sandbox.internal.rba.gov.au' +
	//'http://localhost' +
	'http://marat.rba.gov.au' +
	'/bookmarklets/paprika/bookmarklet-save-to-paprika.js?timestamp=' + timeID;
/**/

function cleanUp(str) {
	return str.replace(/<!--[\w\W]+?-->/g,'')
		.replace(/<(\w+)[^>]*?><\/\1>/g,'')
		.replace(/\sclass="[^"]*"/g,'')
		.replace(/<span>\s*([\w\W]+?)\s*<\/span>/g, '$1')
		.replace(/\s+/g,' ')
		.replace(/\s+([;,.])/g,'$1')
		.replace(/(\d+)\s+(min|sec|g)/g, '$1&nbsp;$2')
		.replace(/(speed)\s+(\d+)/g, '$1&nbsp;$2')
		//.replace(/(<(span)[^>]*>)\s*([^<]+?)\s*(<\/\2)/g,'$1$3$4')
}

function upHeadings(str) {
	return str.replace(/(<(h\d)[^>]*>\s*)([^<]+?)(\s*<\/\2>)/g, function () {
		return /*'<br/><br/>' +*/ arguments[1] + arguments[3].toUpperCase() + arguments[4];
	})
}

function PrepareAndSaveToPaprika() {


	if (!d.body) return;
	try {

		if(d.location.href.indexOf('cookidoo') >= 0) {

			var
				HTML = document.documentElement.innerHTML,// d.body.innerHTML,
				newHTML = HTML;

			newHTML = newHTML
				.replace(/®/g, '')
				.replace(/<(nobr|strong)>([^<]+)<\/\1>/g, function () {
					return '<nobr>' + arguments[2].replace(/./g, function () {

						var code = arguments[0].charCodeAt(0);

						switch(code) {
							case 57347:
								return 'REVERSE';
							case 57346:
								return 'STIRRING';
							default:
								if(code > 10000) {
									console.log(arguments[0] + ": " + code);
									return '&#' + code + ';';
								}
								return arguments[0];
						}
					})
					+ '</nobr>'	;
				})
				.replace(/(<div id="hints-and-tricks")([\w\W]+?)(<\/div>)/, function () {
					return arguments[1] + ' itemprop="notes"'
						+ arguments[2].replace(/<\/ul>\s*<ul>/g,'')
						+ arguments[3]

				})
				.replace(/<h3 id="hints-and-tricks-title">[^<]+<\/h3>/,'<h3>Notes</h3>')
			;

			if(withConfirmation) {
				newHTML = newHTML.replace(/<\/body>/, '<input style="    background: #006699;\n' +
					'    color: #fff;\n' +
					'    padding: 8px;\n' +
					'    position: fixed;\n' +
					'    right: 5px;\n' +
					'    top: 5px;\n' +
					'    box-shadow: 3px 3px 3px rgba(0,0,0,.2);\n' +
					'    border: none;\n' +
					'    z-index: 10000;\n' +
					'    border-radius: 5px;" onclick="callPaprikaBookmarklet(true); removeTheButton(this); return false;" value="Run Paprika Bookmarklet?"/>');

				newHTML += '</body>';
			}

			d.documentElement.innerHTML = newHTML;

			if(!withConfirmation) {
				callPaprikaBookmarklet(true);
			}

		}
		else {
			callPaprikaBookmarklet();
		}

	} catch (e) {
		//alert('Something went wrong!');
		console.log(e);
	}

}

function removeTheButton(button) {
	if(button) {
		if(!button.id) {
			button.id = 'paprika-bookmarklet-button';
		}

		var b = d.getElementById(button.id);
		b.parentNode.removeChild(b);
	}
}

var iFrameCheckerCounter = 0;

function checkIfiFrameDestroyed(frame) {

	var intervalDestroyed = setInterval(function () {

		if (iFrameCheckerCounter > 200 || document.getElementById('prm_iframe_' + timeID) === null) {
			console.log('Reload');
			clearInterval(intervalDestroyed);
			history.back();
			setTimeout(function () {
				location.reload();
			}, 100);
		}

		iFrameCheckerCounter++;
	}, 200)

}

function callPaprikaBookmarklet(reloadPageAfterFinished) {

	var s = d.createElement('scr' + 'ipt');
	if(reloadPageAfterFinished) s.setAttribute('onload','checkIfiFrameDestroyed(this)')
	s.setAttribute('src', paprikaOfficialBookmarkletURL);

	d.body.appendChild(s);

	return false;
}

PrepareAndSaveToPaprika();
void(0);
