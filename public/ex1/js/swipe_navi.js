"use strict";

$(document).ready(function () {

  function Navigation() {
    var _this = this;
    var navigated = false;
    var navElements = $("header nav ul li");

    this.findCurrentIndex = function () {
      for (var i = 0; i < navElements.length; ++i) {
        if ($(navElements[i]).hasClass("active")) return i;
      }
      console.error("No active navigation element found!")
    };

    this.findElement = function (offset) {
      return $(navElements[(this.findCurrentIndex() + offset + navElements.length) % navElements.length]).children("a")[0];
    };

    this.next = function () {
      if (navigated) return;
      navigated = true;
      this.deregisterHandlers();
      this.findElement(1).click();
    };

    this.previous = function () {
      if (navigated) return;
      navigated = true;
      this.deregisterHandlers();
      this.findElement(-1).click();
    };

    this.registerHandlers = function () {
      $.touch.preventDefault = false;
      $('header').touchable({
        gesture: function (e, touchHistory) {
          if (touchHistory.match({ finger: 0, deltaX: '<-100', time: '1..100' }))  _this.previous();
          else if (touchHistory.match({ finger: 0, deltaX: '>100', time: '1..100' })) _this.next();
        }
      });
    };

    this.deregisterHandlers = function () {
      // TODO: implement this
    }
  }

  var navigation = new Navigation();
  navigation.registerHandlers();

});
