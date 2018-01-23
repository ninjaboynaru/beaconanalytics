import BeaconController from './beacon-controller.js';


document.addEventListener('DOMContentLoaded', function(){
	const beacon = new BeaconController('js-root');
	beacon.initialize();
})


