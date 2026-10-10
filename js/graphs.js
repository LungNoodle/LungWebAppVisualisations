const graphs = [];
function loadGraph(id, url) {
	if (!SVG.supported) {
		console.error('SVGs not supported');
		return;
	}

	const req = new XMLHttpRequest();
	req.addEventListener('load', function() {
		const data = JSON.parse(req.responseText);
		if (data.length == 0) {
			console.log('Warning: no plot data in ' + url);
			return;
		}

		let xmin = Infinity;
		let ymin = Infinity;
		let xmax = -Infinity;
		let ymax = -Infinity;
		for (let i = 0; i < data.length; i++) {
			if (data[i].x < xmin) {
				xmin = data[i].x;
			}
			if (data[i].x > xmax) {
				xmax = data[i].x;
			}
			if (data[i].y < ymin) {
				ymin = data[i].y;
			}
			if (data[i].y > ymax) {
				ymax = data[i].y;
			}
		}

		let xscale = GRAPH_WIDTH/(xmax-xmin);
		let yscale = -GRAPH_HEIGHT/(ymax-ymin);
		for (let i = 0; i < data.length; i++) {
			data[i].x = (data[i].x-xmin)*xscale;
			data[i].y = (data[i].y-ymin)*yscale+GRAPH_HEIGHT;
		}
		
		const svg = SVG(id).size(GRAPH_WIDTH+2*GRAPH_PADDING, GRAPH_HEIGHT+2*GRAPH_PADDING);
		svg.viewbox({x:-GRAPH_PADDING-GRAPH_TEXT_HEIGHT, y:-GRAPH_PADDING, width:GRAPH_WIDTH+2*GRAPH_PADDING+GRAPH_TEXT_HEIGHT, height:GRAPH_HEIGHT+2*GRAPH_PADDING+GRAPH_TEXT_HEIGHT});

		// plot background
		svg.rect(GRAPH_WIDTH, GRAPH_HEIGHT).addClass('background');	

		// plot axes and labels
		axes = svg.polyline([GRAPH_WIDTH, GRAPH_HEIGHT, 0, GRAPH_HEIGHT, 0, 0]).addClass('axes');
		xlabel = svg.text('').move(GRAPH_WIDTH/2, GRAPH_HEIGHT).addClass('xlabel');
        xlabel.tspan("Time");
		ylabel = svg.text('').move(-GRAPH_HEIGHT/2, 0).rotate(-90).addClass('ylabel');
        ylabel.tspan("Lung volume");

		// smooth and plot data
		let d = 'M' + data[0].x + ' ' + data[0].y;
		for (let i = 1; i < data.length; i++) {
			let A = data[i-1];
			if (i > 1) {
				A = data[i-2];
			}
			let B = data[i-1];
			let C = data[i];
			let D = data[i];
			if (i+1 < data.length) {
				D = data[i+1];
			}

			let BC = {x: C.x-B.x, y: C.y-B.y};
			let AB = {x: B.x-A.x, y: B.y-A.y};
			let CD = {x: D.x-C.x, y: D.y-C.y};
			let lenBC = Math.sqrt(BC.x*BC.x + BC.y*BC.y);
			let lenAB = Math.sqrt(AB.x*AB.x + AB.y*AB.y);
			let lenCD = Math.sqrt(CD.x*CD.x + CD.y*CD.y);

			let c1 = B;
			if (lenAB > 0) {
				let normAB = GRAPH_SMOOTHING*lenBC/lenAB;
				c1 = {x: B.x+AB.x*normAB, y: B.y+AB.y*normAB};
			}
			let c2 = C;
			if (lenCD > 0) {
				let normCD = GRAPH_SMOOTHING*lenBC/lenCD;
				c2 = {x: C.x-CD.x*normCD, y: C.y-CD.y*normCD};
			}
			d += 'C' + c1.x + ' ' + c1.y + ' ' + c2.x + ' ' + c2.y + ' ' + C.x + ' ' + C.y;
		}
		svg.path(d).addClass('data');
	
		let marker = svg.circle(MARKER_RADIUS).addClass('marker')
      .move(data[0].x-MARKER_RADIUS/2, data[0].y-MARKER_RADIUS/2);
		graphs.push({marker: marker, data: data, xmin: xmin, xmax: xmax, xscale: xscale});
	});
	req.open('GET', url);
	req.send();
}

function updateMarkers(t) {
	for (let j = 0; j < graphs.length; j++) {
		let marker = graphs[j].marker;
		let data = graphs[j].data;
		let xmin = graphs[j].xmin;
		let xmax = graphs[j].xmax;
		let xscale = graphs[j].xscale;

		let x = xmin + (xmax-xmin)*t;
		x *= xscale;
		let i = 0;
		while (i < data.length && data[i].x < x) {
			i++;	
		}

		let pos = {x: data[0].x, y: data[0].y};
		if (i > 0) {
			let dx = data[i].x-data[i-1].x;
			let fa = (data[i].x-x)/dx;
			let fb = (x-data[i-1].x)/dx;
			pos = {x: x, y: data[i-1].y*fa + data[i].y*fb};
		}
		pos.x -= MARKER_RADIUS/2;
		pos.y -= MARKER_RADIUS/2;
		marker.move(pos.x, pos.y);
	}
}
