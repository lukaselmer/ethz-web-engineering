"use strict";

$(document).ready(function () {
  function Navigation() {
    var navigated = false;

    this.next = function () {
      if(navigated) return;
      navigated = true;
      // TODO: implement this
    }

    this.previous = function () {
      if(navigated) return;
      navigated = true;
      // TODO: implement this
    }
  }

  var navigation = new Navigation();

  $.touch.preventDefault = false;

  $(document).ready(function () {
    $('header').touchable({
      gesture: function (e, touchHistory) {
        if (touchHistory.match({ finger: 0, deltaX: '<-100', time: '1..100' })) {
          navigation.next();
        } else if (touchHistory.match({ finger: 0, deltaX: '>100', time: '1..100' })) {
          navigation.previous();
        }
      }
    });
  });


});
