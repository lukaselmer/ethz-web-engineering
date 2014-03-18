"use strict";

/*window.requestAnimationFrame = (function () {
 return  window.requestAnimationFrame ||
 window.webkitRequestAnimationFrame ||
 window.mozRequestAnimationFrame ||
 function (callback) {
 window.setTimeout(callback, 1000 / 60);
 };
 })();*/


$(document).ready(function () {
  function PanoramaWidget() {
    var widget = this;
    var slider = $(".image-slider");
    var cropped = slider.children(".cropped");
    var img = cropped.children("img");
    var lastPageX = 0, lastPageY = 0, firstDrag = true;
    var autodragEnabled = true, autoMoveRight = true;

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
      var max = img.width() - cropped.width();
      this.move("margin-left", delta, max);
    }

    this.moveY = function (delta) {
      var max = img.height() - cropped.height();
      this.move("margin-top", delta, max);
    }

    this.move = function (direction, delta, max) {
      var mt = -parseInt(img.css(direction));
      var position = mt + delta;
      this.moveTo(direction, position, max);
    }

    this.moveTo = function (direction, position, max) {
      if (position < 0) position = 0;
      if (position > max) position = max;
      img.css(direction, -position + "px");
    }

    this.registerEvents = function () {
      var manualDragBig = function (event) {
        widget.drag(event);
      }

      slider.on("dragstart", function () {
        return false;
      });

      slider.on("mousedown", function () {
        slider.on("mousemove", manualDragBig);
        firstDrag = true;
        widget.stopAutoDrag();
        return false;
      });

      slider.on("mouseup", function () {
        slider.off("mousemove", manualDragBig);
        firstDrag = false;
      });

      slider.on("mouseout", function () {
        slider.off("mousemove", manualDragBig);
        firstDrag = false;
      });
    }

    this.stopAutoDrag = function () {
      autodragEnabled = false;
    }

    this.autoDrag = function (time) {
      var max = img.width() - cropped.width();
      var speed = 0.8;
      var t = time % (max * 2);
      if (t > max) t = 2 * max - t;
      var newPosition = speed * Math.abs(t);
      this.moveTo("margin-left", newPosition, max);
      //this.moveTo("margin-left", autoMoveRight ? parseInt(1*time) : -1*time, max);
    }

    this.initAutoDrag = function () {
      var drag = function (time) {
        if (autodragEnabled) requestAnimationFrame(drag);
        widget.autoDrag(time);
      }

      requestAnimationFrame(drag);
    }
  }

  var w = new PanoramaWidget();
  w.registerEvents();
  w.initAutoDrag();

});
