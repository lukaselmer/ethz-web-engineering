"use strict";

$(document).ready(function () {
  function PanoramaWidget() {
    var widget = this;
    var slider = $(".image-slider");
    var cropped = slider.children(".cropped");
    var img = cropped.children("img");
    var lastPageX = 0, lastPageY = 0, firstDrag = true;

    this.drag = function (event) {
      if (firstDrag) {
        lastPageX = event.pageX;
        lastPageY = event.pageY;
        firstDrag = false;
      }

      var diffX = lastPageX - event.pageX;
      var diffY = lastPageY - event.pageY;

      this.moveX(diffX);
      this.moveY(diffY);

      lastPageX = event.pageX;
      lastPageY = event.pageY;
    }

    this.moveX = function (delta) {
      var max = cropped.width() - img.width();
      this.move("margin-left", delta, max);
    }

    this.moveY = function (delta) {
      var max = cropped.height() - img.height();
      this.move("margin-top", delta, max);
    }

    this.move = function (direction, delta, max) {
      var mt = parseInt(img.css(direction));
      var val = mt - delta;
      if (val > 0) val = 0;
      if (val < max) val = max;
      img.css(direction, val + "px");
    }

    this.registerEvents = function () {
      var drag = function (event) {
        widget.drag(event);
      }

      slider.on("dragstart", function () {
        return false;
      });

      slider.on("mousedown", function () {
        slider.on("mousemove", drag);
        firstDrag = true;
        return false;
      });

      slider.on("mouseup", function () {
        slider.off("mousemove", drag);
        firstDrag = false;
      });

      slider.on("mouseout", function () {
        slider.off("mousemove", drag);
        firstDrag = false;
      });
    }
  }

  var w = new PanoramaWidget();
  w.registerEvents();

});
