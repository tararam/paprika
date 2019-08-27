var d = document,
	withConfirmation = false,
	timeID = (new Date().getTime());

//*
var paprikaOfficialBookmarkletURL = 'https://www.paprikaapp.com/bookmarklet/v1/?token=eb6ec5bd28776f47&timestamp=' + timeID;
/*/
var paprikaOfficialBookmarkletURL = 'http://localhost' +	
	'/bookmarklets/paprika/bookmarklet-save-to-paprika.js?timestamp=' + timeID;
/**/

function cleanUp(str) {
	return str.replace(/<!--[\w\W]+?-->/g,'')
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
		return '<br/><br/>' + arguments[1] + arguments[3].toUpperCase() + arguments[4];
	})
}

function PrepareAndSaveToPaprika() {


	if (!d.body) return;
	try {

		if(d.location.href.indexOf('cookidoo') >= 0) {

			var
				HTML = document.documentElement.innerHTML,// d.body.innerHTML,
				newHTML = '',

				titleTmp = /<h1[^>]*>(?:\s*<span[^>]*>)?\s*([^<]+)\s*</i.exec(HTML),
				recipeImageURL,

				n = {
					title: '',
					image: '',
					info: {},
					nutrition: {},
					ingredients: '',
					instructions: '',
					notes: ''
				}
			;

			if(titleTmp) {
				n.title = titleTmp[1];
			}

			var imgTmp = /<section class="qv-image-section[^>]+?background-image:\s*url\(&quot;(https:[^>]+?)&quot;[\w\W]+?<\/section>/i.exec(HTML);
				//var imgTmp2 = /<!-- Quickview Image section -->[\w\W]+?<img src="([^"]+)"[\w\W]+<!-- .\/ Quickview Image section -->/i.exec(HTML);

			/*if(imgTmp2) {
				recipeImageURL = imgTmp2[1];
			}
			else*/ if (imgTmp) {
				n.image = imgTmp[1];
			}

			HTML = HTML
				.replace(/<html[^>]+>/,'<html>')
				.replace(/<script[\w\W]+?<\/script>/g, '')
				.replace(/\s*(data-|ng-|ui-|cz-|autoscroll|style|id)[\w-]*="[^"]*"/gi, '')
				.replace(/<body[^>]*>[\w\W]+?<!-- START: landscape slide 01 \(Quickview\) -->\s*([\w\W]+?)\s*<!-- END: landscape slide 01 \(Quickview\) -->[\w\W]+?<\/body>/i, '<body>$1</body>')
//				.replace(/\s*<li class="qv-recipe other[\w\W]+?<!-- END: landscape slide 01 \(Quickview\) -->\s*<\/li>/i, '')
				.replace(/<!-- Quickview Image section -->[\w\W]+?<img src="([^"]+)"[\w\W]+<!-- .\/ Quickview Image section -->/i, function () {
					n.image = arguments[1];
					return '';
				})
				.replace(/<\/body>/,'<img src="' + n.image+ '" style="max-width: 300px;"/></body>')
				.replace(/<head[^>]*>[\w\W]+?<\/head>/, '')

				.replace(/<div class="clearfix">[\w\W]+?<!-- .\/ Quickview action panel -->/,'')

				.replace(/<h1 class="qv-recipe-head"><span>([^<]+)<\/span><\/h1>/, '')
				.replace(/<div class="qv-info-[^"]+">\s*<i class="icon icon-(preparation-time|total-time|portion|difficulty)"><\/i>\s*<p>\s*([^<]+)\s*<\/p>/gi, function () {
					var title, prop;
					switch(arguments[1]) {
						case 'preparation-time':
							n.info.prepTime = {name: 'Preparation time', value: arguments[2]};
							break;
						case 'total-time':
							n.info.totalTime = {name: 'Total time', value: arguments[2]};
							break;
						case 'portion':
							n.info.recipeYeild = {name: 'portions', value: arguments[2]};
							break;
						case 'difficulty':
							n.info.difficulty = {name: 'Difficulty', value: arguments[2]};
							break;
					}

					return '';
				})

				.replace(/(<!-- Start Quickview ingredients -->[\w\W]+<!-- .\/ Quickview ingredients -->)/i, function () {
					n.ingredients = cleanUp(upHeadings(arguments[1].replace(/<span class="ingredient-subline">\s*([\w\W]+?)\s*<\/span>/g, '; $1')))
						.replace(/<li/g, '<li itemprop="recipeIngredient"')
					;
					return '';
				})

				.replace(/(<!-- ngRepeat: stepGroup in recipe.recipeStepGroups -->[\w\W]+<!-- end ngRepeat: stepGroup in recipe.recipeStepGroups -->)/i, function () {
					n.instructions = cleanUp(upHeadings(arguments[1].replace(/<i class="icon icon-([^"]+)">[^<]*<\/i>/g, function () {
						return arguments[1].toUpperCase().replace(/-/g,' ');
					})));
					return '';
				})


				.replace(/(<!-- ngRepeat: nutrition in recipe.nutritions[^>]* -->[\w\W]*<!-- end ngRepeat: nutrition in recipe.nutritions[^>]* -->)/i, function () {
					n.nutrition = upHeadings(cleanUp(arguments[1].replace(/<p>([^<]+)<\/p>/,function () {
						n.nutritionPortion = arguments[1];
						return '';
					})).replace(/<div[^>]*>\s*<h5[^>]*>\s*(.+?)\s*<\/h5>\s*(.+?)\s*<\/div>/g, function () {
						return '<li>' +
							'<span class="nutrition-label">' + arguments[1] + ':</span> ' +
							'<span class="nutrition-value">' + arguments[2] + '</span>' +
							'</li>'
						;
					}).replace(/<div>\s*(<li[\w\W]+?)\s*<\/div>/, function () {
						var ret = '<ul itemprop="nutrition">';
						if(n.nutritionPortion) ret += '<li><span class="nutrition-label">' + n.nutritionPortion + '</span></li>';
						ret += arguments[1] + '</ul>';

						return ret;
					}));

					return '';
				})



				.replace(/(<!-- Start Quickview variation -->[\w\W]+<!-- .\/ Quickview variation -->)/i, function () {
					var counter = 0;
					n.notes = cleanUp(upHeadings(arguments[1]))

						.replace(/\s*<\/?(section|div)>/g,'')
										/*;
										console.log(n.notes);
											n.notes = n.notes*/
						.replace(/(<h3[^>]*>\s*(.+?)\s*<\/h3>)/g, function () {
							if(counter++) {
								return '<h4>' + arguments[2] + '</h4>';
							}
							else {
								return arguments[1] + '<div>';
							}
						})
						+ '</div>'
					;
					return '';
				})


//			; 	console.log(HTML); HTML = HTML
;

			// Cook time
			if(n.info.prepTime) {
				var re = /(?:(\d+)h)?\s*(\d+)m/,
					prepTmp,
					totalTmp,
					prepTime = 0,
					totalTime = 0,
					cookTime,
					cookTimeStr = ''
				;

				//console.log(prep);

				function convertStrToMinutes(str) {
					var re = /(?:(\d+)h)?(?:\s*(\d+)m)?/,
						tmp,
						ret = 0
					;

					if(tmp = re.exec(str)) {
						if (tmp[1]) {
							ret += 60 * Number(tmp[1]);
						}
						if (tmp[2]) {
							ret += Number(tmp[2]);
						}
					}

					return ret;
				}

				prepTime = convertStrToMinutes(n.info.prepTime.value);
				totalTime = convertStrToMinutes(n.info.totalTime.value);

				if(totalTime > prepTime) {
					cookTime = totalTime - prepTime;
				}
				else {
					cookTime = 0;
				}

				if(cookTime > 60) {
					cookTimeStr = String(Math.floor(cookTime / 60)) + 'h ' + String(cookTime % 60) + 'm';
				}
				else {
					cookTimeStr = cookTime + 'm';
				}

				n.info.cookTime = {name: 'Cook Time', value: cookTimeStr};
			}


			newHTML = '<head>' +
				'<title>' + n.title + '</title>' +
				'<meta property="og:image" content="' + n.image +'">' +
				'<style>.block {float: left; margin: 0 3% 5% 0; max-width: 30%;}</style>' +
				'</head>';

			newHTML += '<body>' +
				'<div itemscope itemtype="http://schema.org/Recipe">'
			;

			newHTML += '<section class="block">';

			newHTML +=
				'<h1 itemprop="name">' + n.title + '</h1>' +
				'<img style="max-width: 300px; max-height: 300px;" itemprop="" src="' + n.image + '" alt=""/>'

			;


			newHTML += '<h3>INFORMATION</h3>'
			;

			for(var i in n.info) {
				if(n.info.hasOwnProperty(i)) {
					newHTML += '<div itemprop="' + i + '">' + (i !== 'recipeYeild' ? n.info[i].name + ': ' + n.info[i].value :  n.info[i].value + ' ' + n.info[i].name.toLowerCase()) + '</div>';
				}
			}

			newHTML += '</section>';


			newHTML += '<section class="block">'
				+ n.ingredients

			;


			newHTML += n.nutrition
				+ '</section>'
			;

			newHTML += '<section class="block">'
				+ '<h3>INSTRUCTIONS</h3>'
				+ '<div itemprop="recipeInstructions">'
				+ n.instructions
				+ '</div>'
				+ '<div itemprop="notes"> '
				+ n.notes

				+ '</div></section>'
			;

			newHTML += '</div>';

//console.log(HTML);
			if(withConfirmation) {
				newHTML += '<input style="    background: #006699;\n' +
					'    color: #fff;\n' +
					'    padding: 8px;\n' +
					'    position: fixed;\n' +
					'    right: 5px;\n' +
					'    top: 5px;\n' +
					'    box-shadow: 3px 3px 3px rgba(0,0,0,.2);\n' +
					'    border: none;\n' +
					'    border-radius: 5px;" onclick="callPaprikaBookmarklet(true); removeTheButton(this); return false;" value="Run Paprika Bookmarklet?"/>';
			}

			newHTML += '</body>';

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
