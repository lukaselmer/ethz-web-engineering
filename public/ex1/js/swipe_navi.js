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

        /*
         // more advanced touch handler
         var touches = $(this).touches();
         if (touches.length > 1) {
         var th = touchHistory.stop({
         type: ['touchdown', 'touchup']
         }).filter({
         type: 'touchmove',
         time: '1..100'
         });
         if (th.match([
         { touch: touches[0], deltaX: '>100'},
         { touch: touches[1], deltaX: '>100'}
         ])) {
         console.log('two swipe right');
         }
         } else {
         var th = touchHistory;
         //console.log(th.size());
         th = th.stop({
         type: ['touchdown', 'touchup']
         });
         //console.log(th.size());
         th = th.filter({
         //touch: touchHistory.get(0).touch,
         type: 'touchmove',
         time: '1..100'
         });
         //console.log(th.size());
         if (th.match({ deltaX: '<-100' })) {
         console.log('swipe left');
         } else if (th.match({ deltaX: '>100' })) {
         console.log('swipe right');
         } /*else if (th.match({ deltaY: '>100' })) {
         console.log('swipe down');
         } else if (th.match({ deltaY: '<-100' })) {
         console.log('swipe up');
         }
         }*/
      }
      /*touchMove: function (e, touchHistory) {
       // draw gesture strokes on the canvas
       /*var ctx = this.getContext('2d');
       ctx.beginPath();
       ctx.moveTo(touchHistory.get(0).clientX, touchHistory.get(0).clientY);
       ctx.lineTo(e.clientX, e.clientY);
       ctx.lineCap = "round";
       ctx.lineWidth = 10;
       ctx.stroke();* /
       },
       touchUp: function (e, touchHistory) {
       // clear canvas
       /*var ctx = this.getContext('2d');
       ctx.fillStyle = 'silver';
       ctx.fillRect(0, 0, this.width, this.height);* /
       //$.touch.history.empty(); // clear touch history
       }*/
    });

  });


});
