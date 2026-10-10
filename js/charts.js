FEV1 = {
  constructor: function(params){
			dojo.mixin(this, params);
		},
		
		renderPlot: function(){
			if (this._plot != undefined) {
				this._plot.render();
			}
		},
		
		addSeries: function(seriesName, data, colorString) {
			if (this._plot != undefined) {
				this._plot.addSeries(seriesName, data, {stroke: {color: colorString}});
			}
		},
		
		removeSeries: function(seriesName) {
			if (this._plot != undefined) {
				this._plot.removeSeries(seriesName);
			}
		},
		
		createPlot: function(dom, x_axis_name, y_axis_name){
			if (this._plot == undefined) {
				TomTheme.chart.fill="transparent";
				TomTheme.plotarea.fill = "transparent";
				TomTheme.chart.stroke = "transparent";
				var chart = new Chart(dom);
				chart.setTheme(TomTheme);
				chart.addAxis("x", {min: 0, max: 100, title:'Age (years)', titleGap: 5, titleOrientation: 'away', titleFontColor: 'white'});
				chart.addAxis("y", {vertical: true, min: 0, max: 140, title:'Lung function (FEV1)', titleGap: 5, titleFontColor: 'white'});
	
				this._plot = chart;
			}
		}
}

function computedFEV1(gender, age, height) {
	var current_fev1 = 0;
	if (gender == "male") {
		if (age < 19) {
			current_fev1 = -0.7453 - 0.04106*age + 0.004477*age*age+0.00014098*height*height;
		} else {
			current_fev1 = 0.5536 -0.01303*age-0.000172*age*age+0.00014098*height*height;
		}
	} else {
		if (age < 17) {
			current_fev1 = -0.871+0.06537*age+0.00011496*height*height;
		} else {
			current_fev1 = 0.4333-0.00361*age-0.000194*age*age+0.00011496*height*height;
		}
	} 
	
	return current_fev1;
}

function calculateFEVData(age, gender, years, packs, height, fev1_measured, scaling) {
	var fev1_normal_non_smoker = [];
	var fev1_you = [];
	var fev1_you_smoking = [];
	
	
	var current_age = 7;
	// var smoking_decline_male = 7.4, smoking_decline_female = 4.4;
	var smoking_decline_male = 12.4, smoking_decline_female = 7.4;

	var smoking_start = age - years;

	var smoking_decline = smoking_decline_male;
	if  (gender == "F") {
		smoking_decline = smoking_decline_female;
	}

	var previous_fev1_you = 0;
	var last_smoking_reading = 0;

	var fev1_measured_scaling = fev1_measured / computedFEV1(gender, age, height);
	var fev1_measured_offset = fev1_measured - computedFEV1(gender, age, height);
	
	var fev1_at_25 = computedFEV1(gender, 25.0, height);
	var fev1_at_25_you = fev1_at_25;  //+ fev1_measured_offset;
	while (current_age < 100) {
		var current_fev1 = computedFEV1(gender, current_age, height);
		var current_fev1_you = current_fev1 * fev1_measured_scaling;
		fev1_normal_non_smoker.push({x: current_age, y: current_fev1 / fev1_at_25 * 100.0})
		fev1_you.push({x: current_age, y: current_fev1_you / fev1_at_25_you * 100.0});

		var current_fev1_smoke = current_fev1_you;
		if (current_age > 7) {
			current_fev1_smoke = 0;
			var years_of_smoking = (current_age > smoking_start) ? (current_age - smoking_start) : 0;
			if (years_of_smoking > 0 && packs > 0.0) {
				var decline = (current_fev1_you - previous_fev1_you) * 1000;
				var decline_for_smoke = decline - (smoking_decline * packs * years_of_smoking);
				current_fev1_smoke = previous_fev1_you + decline_for_smoke / 1000;
			}
			else {
				current_fev1_smoke = current_fev1_you;
			}
			current_fev1_smoke = current_fev1_smoke * scaling;
			fev1_you_smoking.push({x: current_age, y: current_fev1_smoke / fev1_at_25_you * 100.0})
		}
		
		previous_fev1_you = current_fev1_you;
		current_age = current_age + 2;
	}
	
	return [fev1_normal_non_smoker, fev1_you, fev1_you_smoking];
};
	
function updateFEV1Plot(fev1_plot) {
  let age = document.querySelectorAll('#age-control > .control')[0].dataset.value;
  let gender = document.querySelectorAll('#gender-control > .control')[0].dataset.value;
  let fev1 = document.querySelectorAll('#fev-control > .control')[0].dataset.value;
  let smokingSeverity = airwaysUniforms['smokingSeverity']['value'];
  let packs = 0;
  if (smokingSeverity == 0.5) {
    packs = 1;
  } else if (smokingSeverity == 1.0) {
    packs = 2;
  }
  let ageStartedSmoking = 20;
	let fevData = calculateFEVData(age,
                                 gender,
		                             age - ageStartedSmoking,
                                 packs,
                                 170,
                                 fev1,
                                 1.0);

  fev1_plot.clear()
	addSeriesFEV1Plot(fev1_plot, "normal", fevData[0]);
	addSeriesFEV1Plot(fev1_plot, "you", fevData[1]);
	addSeriesFEV1Plot(fev1_plot, "you-smoking", fevData[2]);
}

let FEV1_xscale = GRAPH_WIDTH/100;
let FEV1_yscale = -GRAPH_HEIGHT/140;

function addSeriesFEV1Plot(fev1_plot, name, data) {
  for (let i = 0; i < data.length; i++) {
    if (data[i].y < 0) {
      data = data.slice(0, i);
      break;
    }
    data[i].x = data[i].x*FEV1_xscale;
    data[i].y = data[i].y*FEV1_yscale+GRAPH_HEIGHT;
  }

  d = 'M' + data[0].x + ' ' + data[0].y;
  for (let i = 1; i < data.length; i++) {
    d += 'L' + data[i].x + ' ' + data[i].y;
  }
  fev1_plot.path(d).addClass(name);
}

function initFEV1Plot(id) {
  const svg = SVG(id).size(GRAPH_WIDTH+2*GRAPH_PADDING, GRAPH_HEIGHT+2*GRAPH_PADDING);
  svg.viewbox({x:-GRAPH_PADDING-GRAPH_TEXT_HEIGHT, y:-GRAPH_PADDING, width:GRAPH_WIDTH+2*GRAPH_PADDING+GRAPH_TEXT_HEIGHT, height:GRAPH_HEIGHT+2*GRAPH_PADDING+GRAPH_TEXT_HEIGHT});

  // plot background
  svg.rect(GRAPH_WIDTH, GRAPH_HEIGHT).addClass('background');	

  // plot axes and labels
  axes = svg.polyline([GRAPH_WIDTH, GRAPH_HEIGHT, 0, GRAPH_HEIGHT, 0, 0]).addClass('axes');
  xlabel = svg.text('').move(GRAPH_WIDTH/2, GRAPH_HEIGHT).addClass('xlabel');
      xlabel.tspan("Age (years)");
  ylabel = svg.text('').move(-GRAPH_HEIGHT/2, 0).rotate(-90).addClass('ylabel');
      ylabel.tspan("Lung function (FEV1)");

  return svg.group();
}
