"use strict";

$(document).ready(function () {
  // TOOD: implement swipe gesture for navigation

  $.touch.preventDefault = false;
  //$.touch.triggerMouseEvents = true;

  var navigated = false;

  //$.touch.ready(function () {
  $(document).ready(function () {
    $('header').touchable({
      gesture: function (e, touchHistory) {
        if (navigated) return;
        // simple gesture handler
        if (touchHistory.match({ finger: 0, deltaX: '<-100', time: '1..100' })) {
          console.log('simpleSwipeLeftHandler');
          $.touch.history.empty();
          navigated = true;
        } else if (touchHistory.match({ finger: 0, deltaX: '>100', time: '1..100' })) {
          console.log('simpleSwipeRightHandler');
          $.touch.history.empty();
          navigated = true;
        }
      }
    });
  });


});
