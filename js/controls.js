const eventChanged = new CustomEvent('changed', {});
function clickButton(button) {
	const controlButton = button.parentNode;
	const min = controlButton.dataset.min;
	const max = controlButton.dataset.max;
	const step = controlButton.dataset.step;
	let precision = 0;
	if (step && step.length > 1) {
		precision = 1;
	}
	let value = controlButton.dataset.value;
	if (button.dataset.value === '+') {
		value = Math.min(max, parseFloat(value)+parseFloat(step)).toFixed(precision);
	} else if (button.dataset.value === '-') {
		value = Math.max(min, parseFloat(value)-parseFloat(step)).toFixed(precision);
	} else {
		value = button.dataset.value;
	}
	controlButton.dataset.value = value;
	controlButton.querySelector('.control-value').innerHTML = value;
	controlButton.dispatchEvent(eventChanged);
}

document.body.addEventListener('load-page', function(e) {
	const controls = document.querySelectorAll('.control');
	for (let i = 0; i < controls.length; i++) {
		controls[i].querySelector('.control-value').innerHTML = controls[i].dataset.value;
		controls[i].dispatchEvent(eventChanged);
	}

	const buttons = document.querySelectorAll('.control .control-button');
	for (let i = 0; i < buttons.length; i++) {
		let button = buttons[i];
		let t;
		let repeat = function () {
			clickButton(button);
			t = setTimeout(repeat, delay);
			delay = 80;
		};
		button.onmousedown = function(e) {
			delay = 500;
			repeat();
		};
		button.onmouseup = function(e) {
			clearTimeout(t);
		};
    button.onmouseleave = function(e) {
      clearTimeout(t);
    };
	}
});
