"use strict";

$(document).ready(function () {
  function PanoramaWidget() {
    var widget = this;
    var slider = $(".image-slider");
    var img = slider.children(".cropped").children("img");
    var lastPageX = 0, lastPageY = 0, firstDrag = true;

    this.drag = function (event) {
      if (firstDrag) {
        lastPageX = event.pageX;
        lastPageY = event.pageY;
        firstDrag = false;
      }

      var diffX = lastPageX - event.pageX;
      var diffY = lastPageY - event.pageY;

      widget.moveX(diffX);
      widget.moveY(diffY);

      lastPageX = event.pageX;
      lastPageY = event.pageY;
    }

    this.moveX = function (delta) {
      this.move("margin-left", delta);
    }

    this.moveY = function (delta) {
      this.move("margin-top", delta);
    }

    this.move = function (direction, delta) {
      var mt = parseInt(img.css(direction));
      var val = mt - delta;
      if (val > 0) val = 0;
      img.css(direction, val + "px");
    }

    this.registerEvents = function () {
      slider.on("dragstart", function () {
        return false;
      });

      slider.on("mousedown", function () {
        slider.on("mousemove", widget.drag);
        firstDrag = true;
        return false;
      });

      slider.on("mouseup", function () {
        slider.off("mousemove", widget.drag);
        firstDrag = false;
      });

      slider.on("mouseout", function () {
        slider.off("mousemove", widget.drag);
        firstDrag = false;
      });
    }
  }

  var w = new PanoramaWidget();
  w.registerEvents();

});
