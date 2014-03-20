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

    this.drag = function (pageX, pageY) {
      var diffX = lastPageX - pageX;
      var diffY = lastPageY - pageY;

      this.moveX(diffX);
      this.moveY(diffY);

      lastPageX = pageX;
      lastPageY = pageY;
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
      return this.fullImageWidth() - cropped.width();
    }

    this.widthVisibleRatio = function () {
      return cropped.width() / this.fullImageWidth();
    }

    this.marginLeftRatio = function () {
      return parseFloat(croppedImg.css("margin-left")) / croppedImg.width();
    }

    this.fullImageWidth = function () {
      return croppedImg.width();
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
      rectangle.css("margin-left", -marginLeftRatio * thumbnailImg.width() + "px")
    }

    this.calculateMovementToNewCenter = function (newCenter) {
      var w = rectangle.width();
      var l = parseFloat(rectangle.css("margin-left"));
      var currentRectangleCenter = l + w / 2;
      return newCenter - currentRectangleCenter;
    }
  }

  function AutoDrag(_bigImage, _thumbnail) {
    var _this = this;

    var bigImage = _bigImage;
    var thumbnail = _thumbnail;

    var autoDragEnabled = true;
    var autoDragSpeed = 0.1;

    this.stopAutoDrag = function () {
      autoDragEnabled = false;
    }

    this.autoDrag = function (time) {
      if (!autoDragEnabled) return;
      var max = bigImage.maxMarginLeft();
      var t = (time * autoDragSpeed) % (max * 2);
      if (t > max) t = 2 * max - t;
      var newPosition = Math.abs(t);
      bigImage.moveTo("margin-left", newPosition, max);
      thumbnail.updateRectangle(bigImage);
    }

    this.initAutoDrag = function () {
      var drag = function (time) {
        if (autoDragEnabled) requestAnimationFrame(drag);
        _this.autoDrag(time);
      }

      requestAnimationFrame(drag);
    }

    this.play = function () {
      if (autoDragEnabled) return;
      autoDragEnabled = true;
      this.initAutoDrag();
    }

    this.increaseSpeed = function () {
      autoDragSpeed *= 1.5;
    }

    this.decreaseSpeed = function () {
      autoDragSpeed /= 1.5;
    }
  }

  function PanoramaWidget() {
    var widget = this;
    var firstDrag = true;

    var body = $("body");

    var slider = $(".image-slider");

    var cropped = slider.children(".cropped");
    var bigImage = new BigImage(cropped);

    var thumbnailOuterDiv = slider.children(".thumbnail");
    var thumbnailDiv = thumbnailOuterDiv.children(".thumbnail-inner");
    var thumbnailImg = thumbnailDiv.children("img");
    var rectangle = thumbnailDiv.children(".rectangle");
    var thumbnail = new Thumbnail(thumbnailDiv);

    var autoDrag = new AutoDrag(bigImage, thumbnail);

    this.convertTouchEvent = function (event) {
      if (event.originalEvent && event.originalEvent.touches && event.originalEvent.touches[0])
        return event.originalEvent.touches[0];
      return event;
    }

    this.registerEvents = function () {
      var manualDragBig = function (_event) {
        var event = widget.convertTouchEvent(_event);

        if (firstDrag) {
          bigImage.initDrag(event.pageX, event.pageY);
          firstDrag = false;
        }
        bigImage.drag(event.pageX, event.pageY);
        thumbnail.updateRectangle(bigImage);
      }

      var manualDragThumbnail = function (_event) {
        var event = widget.convertTouchEvent(_event);
        var pageX = event.pageX;
        pageX *= -bigImage.fullImageWidth() / thumbnailImg.width();
        // fullImageWidth
        if (firstDrag) {
          bigImage.initDrag(pageX, 0);
          firstDrag = false;
        }
        bigImage.drag(pageX, 0);
        thumbnail.updateRectangle(bigImage);
      }

      slider.on("dragstart", function (e) {
        e.preventDefault();
      });

      cropped.on("mousedown touchstart", function (e) {
        e.preventDefault();
        $("body").on("mousemove touchmove", manualDragBig);
        cropped.addClass("grabbing");
        firstDrag = true;
        autoDrag.stopAutoDrag();
      });

      // could also use mouseout, then we wouldn't need to register the body events
      body.on("mouseup touchend", function (e) {
        e.preventDefault();
        body.off("mousemove touchmove", manualDragBig);
        cropped.removeClass("grabbing");
        firstDrag = false;
      });

      rectangle.on("mousedown touchstart", function (e) {
        e.preventDefault();
        body.on("mousemove touchmove", manualDragThumbnail);
        rectangle.addClass("grabbing");
        firstDrag = true;
        autoDrag.stopAutoDrag();
      });

      // could also use mouseout, then we wouldn't need to register the body events
      body.on("mouseup touchend", function (e) {
        e.preventDefault();
        body.off("mousemove touchmove", manualDragThumbnail);
        rectangle.removeClass("grabbing");
        firstDrag = false;
      });

      thumbnailImg.on("click", function (e) {
        e.preventDefault();

        autoDrag.stopAutoDrag();

        var newCenter = thumbnail.calculateMovementToNewCenter(e.offsetX);
        newCenter *= -bigImage.fullImageWidth() / thumbnailImg.width();

        bigImage.initDrag(0, 0);
        bigImage.drag(newCenter, 0);

        thumbnail.updateRectangle(bigImage);
      });

      $(window).on("resize", function () {
        thumbnail.updateRectangle(bigImage);
      });
    }

    this.registerControls = function () {
      $("a[href=#play]").click(function (e) {
        e.preventDefault();
        autoDrag.play();
      });

      $("a[href=#stop]").click(function (e) {
        e.preventDefault();
        autoDrag.stopAutoDrag();
      });

      $("a[href=#faster]").click(function (e) {
        e.preventDefault();
        autoDrag.increaseSpeed();
      });

      $("a[href=#slower]").click(function (e) {
        e.preventDefault();
        autoDrag.decreaseSpeed();
      });
    }

    this.initAutoDrag = function () {
      autoDrag.initAutoDrag();
    }

  }

  var w = new PanoramaWidget();
  w.registerEvents();
  w.registerControls();
  w.initAutoDrag();

});
