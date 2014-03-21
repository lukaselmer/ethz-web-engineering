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

	if (!$.touch) return false; // requires jQMultiTouch

	$.extend($.touch, {
		resizable: {
			minWidth: false,
			maxWidth: false,
			minHeight: false,
			maxHeight: false,
			resizeBefore: function(e) {},
			resizeDuring: function(e) {},
			resizeAfter: function(e) {},
			resizableHandler: function(touchEvent, touchHistory) {
				var $this = $(this),
					touchData = $this.data('touch'),
					touches = $this.touches();

				if (touchEvent.type == 'touchdown') {
					// resizing may be enabled when more than two touches occur
					touchData.resizing = (touchData.resizable && touches.length > 1);

					if (touchData.resizing) {
						var dx = touches[1].clientX - touches[0].clientX;
						var dy = touches[1].clientY - touches[0].clientY;
						touchData.distance = Math.sqrt(dx * dx + dy * dy);
						touchData.angle = Math.acos(dx / touchData.distance);
						if (dy < 0) {
							touchData.angle = touchData.angle * -1;
						}
						touchData.dx = dx;
						touchData.dy = dy;

						$this.addClass('resizing');
					}
				} else if (touchEvent.type == 'touchmove') {
					if (touches.length > 1) { // need at least two touches for resizing
						var dx = touches[1].clientX - touches[0].clientX;
						var dy = touches[1].clientY - touches[0].clientY;
						var distance = Math.sqrt(dx * dx + dy * dy);
						var factor = (distance - touchData.distance);

						// resizing
						if (touchData.resizing && factor != 0) {
							// Limit resize factor
							var factorX = Math.max(dx/touchData.dx, 0.8);
							factorX = Math.min(dx/touchData.dx, 1.2);
							var w = Math.round($this.width() * factorX); 
							if (touchData.minWidth) w = Math.max(touchData.minWidth, w); // Minimum value
							if (touchData.maxWidth) w = Math.min(touchData.maxWidth, w); // Maximum value
							w = w + 'px';

							// Limit resize factor
							var factorY = Math.max(dy/touchData.dy, 0.8);
							factorY = Math.min(dy/touchData.dy, 1.2);
							var h = Math.round($this.height() * factorY);
							if (touchData.minHeight) h = Math.max(touchData.minHeight, h); // Minimum value
							if (touchData.maxHeight) h = Math.min(touchData.maxHeight, h); // Maximum value
							h = h +'px';

							$this.css({
								width: w,
								height: h,
							});

							touchData.dx = dx;
							touchData.dy = dy;
						}
					}
				} else if (touchEvent.type == 'touchup') {
					touchData.resizing = touchData.resizing && touches.length > 1;

					if (!touchData.resizing) {
						$this.removeClass('resizing');
					}
				}

				$this.data('touch', touchData);
			},
		},
	});

    $.fn.resizable = function(o) {
        o = $.extend({}, $.touch.resizable, o);
        return this.each(function() {
            var $this = $(this).touchable(),
				touchData = $this.data('touch') || {};

			if (!touchData.resizable) {
				// set resizable defaults and custom options
				$.extend(touchData, $.touch.resizable, o);

				// add resizable handler
				$this.on('touchdown touchmove touchup', touchData.resizableHandler);

				// indicate that $this is now resizable
				$this.addClass('resizable');
				touchData.resizable = true;
			} else {
				// just set new options
				$.extend(touchData, o);
			}

			// update touch data
            $this.data('touch', touchData);
        });
    }

	$(function() {
		// attach resizable behaviour
		$('.resizable').resizable();
	});

})(jQuery);