/**
 * jQMultiTouch -- The jQuery of Multi-touch
 * jQuery plug-in for multi-touch web interface development
 * Version 1.0
 *
 * Copyright (C) 2010-2013 ETH Zurich. All rights reserved.
 *
 * This software is the proprietary information of ETH Zurich.
 * Use is subject to license terms.
 *
 */
(function($) {

	if (!$.touch) return false;

	/** swipe generates a swipe gesture template based on direction (left|up|right|down), distance (short|medium|long) and speed (slow|medium|fast) parameters and attaches it to the selection */
	$.fn.swipe = function(o, c) {
		if (!c || typeof o === 'function') {
			c = o;
			o = {};
		}
		o = $.extend({ direction: 'right', distance: 'short', speed: 'fast' }, o);
		console.log(o);
		var t = { finger: 0, type: 'touchmove' },
			delta;
		switch(o.distance) {
			case 'long':
				delta = 600;
				break;
			case 'medium':
				delta = 300;
				break;
			default: // 'short'
				delta = 100;
		}
		switch(o.speed) {
			case 'slow':
				t.time = '1..600';
				break;
			case 'medium':
				t.time = '1..300';
				break;
			default: // 'fast'
				t.time = '1..100';
		}
		switch(o.direction) {
			case 'left':
				t.deltaX = '<' + (-delta);
				break;
			case 'up':
				t.deltaY = '<' + (-delta);
				break;
			case 'down':
				t.deltaY = '>' + delta;
				break;
			default: // 'right'
				t.deltaX = '>' + delta;
		}
		return this.each(function() {
			var $this = $(this).touchable(),
				touchData = $this.data('touch');

			$.merge(touchData.gestureCallbacks, [{ callback: c, template: t }]);

			// update touch data
			$this.data('touch', touchData);
		});
	};

	// TODO: implement more gestures in the future...

})(jQuery);