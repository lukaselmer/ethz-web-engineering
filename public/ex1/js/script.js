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
  function BigImage(_cropped) {
    var cropped = _cropped,
      croppedImg = cropped.children("img"),
      lastPageX = 0,
      lastPageY = 0;

    this.initDrag = function (pageX, pageY) {
      lastPageX = pageX;
      lastPageY = pageY;
    }

    this.drag = function (event) {
      var diffX = lastPageX - event.pageX;
      var diffY = lastPageY - event.pageY;

      this.moveX(diffX);
      this.moveY(diffY);

      lastPageX = event.pageX;
      lastPageY = event.pageY;
    }

    this.moveX = function (delta) {
      var max = this.maxMarginLeft();
      this.move("margin-left", delta, max);
    }

    this.moveY = function (delta) {
      var max = this.maxMarginTop();
      this.move("margin-top", delta, max);
    }

    this.move = function (direction, delta, max) {
      var mt = -parseFloat(croppedImg.css(direction));
      var position = mt + delta;
      this.moveTo(direction, position, max);
    }

    this.moveTo = function (direction, position, max) {
      if (position < 0) position = 0;
      if (position > max) position = max;
      croppedImg.css(direction, -position + "px");
    }

    this.maxMarginTop = function () {
      return croppedImg.height() - cropped.height();
    }

    this.maxMarginLeft = function () {
      return croppedImg.width() - cropped.width();
    }

    this.widthVisibleRatio = function () {
      return cropped.width() / croppedImg.width();
    }

    this.marginLeftRatio = function () {
      return parseFloat(croppedImg.css("margin-left")) / croppedImg.width(); //this.maxMarginLeft();
    }
  }

  function Thumbnail(_thumbnail) {
    var thumbnail = _thumbnail;
    var thumbnailImg = thumbnail.children("img");
    var rectangle = thumbnail.children(".rectangle");

    this.updateRectangle = function (bigImage) {
      var widthRatio = bigImage.widthVisibleRatio();
      rectangle.css("height", parseFloat(thumbnailImg.height()) + "px");
      rectangle.css("width", (thumbnailImg.width() * widthRatio) + "px");

      var marginLeftRatio = bigImage.marginLeftRatio();
      rectangle.css("margin-left", -marginLeftRatio * thumbnail.width() + "px")
    }
  }

  function PanoramaWidget() {
    var widget = this;
    var slider = $(".image-slider");
    var cropped = slider.children(".cropped");

    var firstDrag = true;

    var autodragEnabled = true;

    var bigImage = new BigImage(cropped);
    var thumbnail = new Thumbnail(slider.children(".thumbnail"));

    this.registerEvents = function () {
      var manualDragBig = function (event) {
        if (firstDrag) {
          bigImage.initDrag(event.pageX, event.pageY);
          firstDrag = false;
        }
        bigImage.drag(event);
        thumbnail.updateRectangle(bigImage);
      }

      slider.on("dragstart", function () {
        return false;
      });

      cropped.on("mousedown", function () {
        cropped.on("mousemove", manualDragBig);
        firstDrag = true;
        widget.stopAutoDrag();
        return false;
      });

      cropped.on("mouseup mouseout", function () {
        cropped.off("mousemove", manualDragBig);
        firstDrag = false;
      });
    }

    this.stopAutoDrag = function () {
      autodragEnabled = false;
    }

    this.autoDrag = function (time) {
      var max = bigImage.maxMarginLeft();
      var speed = 0.1;
      var t = (time * speed) % (max * 2);
      if (t > max) t = 2 * max - t;
      var newPosition = Math.abs(t);
      bigImage.moveTo("margin-left", newPosition, max);
      thumbnail.updateRectangle(bigImage);
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
