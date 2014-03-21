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
		/** default draggable options */
		draggable: {
			grid: [1, 1],			// drag according to x/y grid by flooring target coordinates
			constrainParent: false,	// constrain drag operation to parent
			dragBefore: function(e) { return true },
			dragDuring: function(e) { return true },
			dragAfter: function(e) { return true },
			draggableHandler: function(touchEvent, touchHistory) {
				var $this = $(this),
					touchData = $this.data('touch'),
					touches = $this.touches();

				if (touchEvent.type == 'touchdown') {
					// handle dragging if it was not initated by another touch
					if (touchData.draggable && !touchData.dragging &&
						touchData.dragBefore.call(this, touchEvent) !== false) {
						
						// FIXME: need to adjust dragging position after scale
						touchData.dragging = {
							touch: touchEvent.touch,
							startOffset: {
								left: (touchEvent.clientX - touchEvent.clientX % touchData.grid[0]),
								top: (touchEvent.clientY - touchEvent.clientY % touchData.grid[1]),
							},
							startPos: $this.offset(),
						};

						$this.addClass('dragging');
					}
				} else if (touchEvent.type == 'touchmove') {
					if (touchData.dragging && (touchData.dragging.touch == touchEvent.touch) &&
						touchData.dragDuring.call(this, touchEvent) !== false) { // only do the following unless dragDuring returns false
							// get the distance we moved
							var drag_distance_x = touchEvent.touch.clientX - touchData.dragging.startOffset.left,
								drag_distance_y = touchEvent.touch.clientY - touchData.dragging.startOffset.top,
								left = touchData.dragging.startPos.left + drag_distance_x,
								top = touchData.dragging.startPos.top + drag_distance_y;

							// TODO constrain within parent offset
							if (touchData.constrainParent) {
								left = Math.max(0, left);
								top = Math.max(0, top);
								// FIXME calculate parent values on touch down to improve performance?
								var parent = $this.offsetParent();
								top = Math.min(parseFloat(parent.css('height')) - $this.outerHeight(true), top);
								left = Math.min(parseFloat( parent.css('width')) - $this.outerWidth(true), left);
						   }

							// FIXME: doesn't work properly with scale != 1.0
							// adjust coordinates to grid
							left -= left % touchData.grid[0];
							top -= top % touchData.grid[1];

							// move the element
							$this.css({
								left: left + 'px',
								top: top + 'px',
								position: 'absolute',
							});
					}
				} else if (touchEvent.type == 'touchup') {
					if (touchData.dragging && (touchData.dragging.touch == touchEvent.touch)) {
						if (touchData.dragAfter.call(this, touchEvent) !== false) {
							// only do the following unless dragAfter returns false
							$this.removeClass('dragging');

							touchData.dragging = false;
						}
					}
				}

				$this.data('touch', touchData);
			},
		},
	});

    $.fn.draggable = function(o) {
        return this.each(function() {
			var $this = $(this).touchable(), // make sure that the element is touchable
				touchData = $this.data('touch') || {};

			if (!touchData.draggable) {
				// set draggable defaults and custom options
				$.extend(touchData, $.touch.draggable, o);

				// add draggable handler
				$this.on('touchdown touchmove touchup', touchData.draggableHandler);

				// indicate that element is now draggable
				$this.addClass('draggable');
				touchData.draggable = true;
			} else {
				// just set new options
				$.extend(touchData, o);
			}

			// update touch data
            $this.data('touch', touchData);
		});
    }

	$(function() {
		// attach draggable behaviour
		$('.draggable').draggable();
	});

})(jQuery);