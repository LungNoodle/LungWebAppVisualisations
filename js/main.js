const MIN_RATIO = 2.1;//16/9; // minimum ratio of width/height

/* Pages */
let pageInits = {};
function addPageInit(id, f) {
	pageInits[id] = f;
}

function initPage(page) {
	let id = 'page-' + page;
	if (page !== document.body.dataset.page && pageInits.hasOwnProperty(id)) {
		document.body.dataset.page = page;

		let pages = document.querySelector('#pages > section');
		for (let i = 0; i < pages.length; i++) {
			pages[i].classList.remove('active');
		}
		document.getElementById(id).classList.add('active');
		pageInits[id]();
	}
}

const eventLoadPage = new CustomEvent('load-page', {});
function loadPage(page) {
	if (page !== document.body.dataset.page) {
		const req = new XMLHttpRequest();
		req.addEventListener('load', function() {
      resetUniforms();

			document.body.dataset.page = page;

			let pages = document.getElementById('pages');
			let node = document.createElement('div');
			node.innerHTML = req.responseText;
			
			while (pages.hasChildNodes()) {
				pages.removeChild(pages.lastChild);
			}

			let sections = node.querySelectorAll('section');
			for (let i = 0; i < sections.length; i++) {
				pages.appendChild(sections[i]);
			}
			
			let scripts = node.querySelectorAll('script');
			for (let i = 0; i < scripts.length; i++) {
				// Isolate code from other pages
				let jsContent = '';
				jsContent += '(function(){';
				jsContent += scripts[i].textContent;
				jsContent += '})();';

				let script = document.createElement('script');
				script.textContent = jsContent;
				pages.appendChild(script);
			}
			document.body.dispatchEvent(eventLoadPage);
		});
		req.open('GET', 'pages/' + page + '.html');
		req.send();
	}
}

function getURLSegment(i) {
	const segments = window.location.hash.substr(2).split('/');
	if (i < segments.length) {
		return segments[i];
	}
	return '';
}

/* Navigation */
function updateRoute() {
	const url = window.location.hash.substr(1);
	if (url.length == 0) {
		window.location.hash = '/';
	} else if (url[0] == '/') {
		let page = getURLSegment(0);
		if (!page) {
			page = 'index';
		}
		loadPage(page);
	}
}
updateRoute();

window.addEventListener('hashchange', function(e) {
	updateRoute();
});

// Scale down when height too small
function resize() {
  const h = window.innerHeight;
  const minHeight = window.innerWidth / MIN_RATIO;
  if (h < minHeight) {
    const scale = h / minHeight;
    document.body.style.transform = 'scale(' + scale + ',' + scale + ')';
	document.body.style.height = (100/scale).toString() + '%';
	document.body.style.top = ((100-100/scale)/2).toString() + '%';
  } else if (document.body.style.transform != '') {
    document.body.style.transform = '';
	document.body.style.height = '';
	document.body.style.top = '';
  }
}
window.onresize = function(e) {
  resize();
};
resize();

// Dragging of model
document.getElementById('renderer').addEventListener('mousedown', function(e){
    const links = document.querySelectorAll('a, .clickable');
    for (let i = 0; i < links.length; i++) {
        links[i].style.pointerEvents = 'none';
    }
});

document.getElementById('renderer').addEventListener('mouseup', function(e){
    const links = document.querySelectorAll('a, .clickable');
    for (let i = 0; i < links.length; i++) {
        links[i].style.pointerEvents = 'auto';
    }
});
