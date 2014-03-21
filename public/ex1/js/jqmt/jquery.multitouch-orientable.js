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
		orientationHandler: function() {
			var orientation = typeof window.orientation === 'number' ? window.orientation : ($(window).width() >= $(window).height() ? 90 : 0);

			if ($(document).trigger('orientationchanged', [orientation])) {
				switch (orientation) {
					case 90:
						$('.orientable').removeClass('portrait landscape-90').addClass('landscape');
						break;
					case -90:
						$('.orientable').removeClass('portrait').addClass('landscape landscape-90');
						break;
					default:
						$('.orientable').removeClass('landscape landscape-90').addClass('portrait');
				}
			}
		},
		orientationChanged: function(param) {
			if (typeof param === 'function') {
				$(document).on('orientationchanged', param);
				return true;
			}
			return false;
		},
	});

    window.addEventListener(('onorientationchange' in window ? 'orientationchange' : 'resize'), $.touch.orientationHandler, false);
    window.addEventListener('load', $.touch.orientationHandler, false);

})(jQuery);