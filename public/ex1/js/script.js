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
      return this.marginLeft() / croppedImg.width();
    }

    this.fullImageWidth = function () {
      return croppedImg.width();
    }

    this.marginLeft = function () {
      return parseFloat(croppedImg.css("margin-left"))
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

    var marginOffset = 0, timeOffset = 0, lastTime = 0, manualDrag = true;

    this.stopAutoDrag = function () {
      autoDragEnabled = false;
    }

    this.setManuallyDragged = function () {
      manualDrag = true;
    }

    this.initAutoDrag = function () {
      this.setStartParameters();
      if (manualDrag) {
        manualDrag = false;
        marginOffset = -bigImage.marginLeft();
      }

      var drag = function (time) {
        if (autoDragEnabled) requestAnimationFrame(drag);
        _this.autoDrag(time);
      }

      requestAnimationFrame(drag);
    }

    this.setStartParameters = function () {
      var max = bigImage.maxMarginLeft();
      marginOffset = _this.calcT(lastTime, max);
      timeOffset = lastTime;

      var setParams = function (time) {
        timeOffset = time;
      }
      requestAnimationFrame(setParams);
    }

    this.calcT = function (time, max) {
      lastTime = time;
      return (((time - timeOffset) * autoDragSpeed) + marginOffset) % (max * 2);
    }

    this.calculateMarginLeft = function (time, max) {
      var t = this.calcT(time, max);
      if (t > max) t = 2 * max - t;
      var newPosition = Math.abs(t);
      return newPosition;
    }

    this.autoDrag = function (time) {
      if (!autoDragEnabled) return;
      var max = bigImage.maxMarginLeft();
      var newPosition = this.calculateMarginLeft(time, max);
      bigImage.moveTo("margin-left", newPosition, max);
      thumbnail.updateRectangle(bigImage);
    }

    this.play = function () {
      if (autoDragEnabled) return;
      autoDragEnabled = true;
      this.initAutoDrag();
    }

    this.increaseSpeed = function () {
      this.setStartParameters();
      autoDragSpeed *= 1.5;
    }

    this.decreaseSpeed = function () {
      this.setStartParameters();
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

    this.isTouchEvent = function (event) {
      return event.originalEvent && event.originalEvent.touches && event.originalEvent.touches.length > 0;
    }
    this.isSingleTouchEvent = function (event) {
      return event.originalEvent && event.originalEvent.touches && event.originalEvent.touches.length == 1;
    }
    this.isDoubleTouchEvent = function (event) {
      return event.originalEvent && event.originalEvent.touches && event.originalEvent.touches.length == 2;
    }
    this.convertSingleTouchEvent = function (event) {
      return event.originalEvent.touches[0];
      /*if (event.originalEvent && event.originalEvent.touches && event.originalEvent.touches[0]) {
       var touches = event.originalEvent.touches;
       return touches.length == 1 ? touches[0] : null;
       }
       return event;*/
    }

    this.registerEvents = function () {
      var manualDragBig = function (event) {
        var dragFunction = function (e) {
          if (firstDrag) {
            bigImage.initDrag(e.pageX, e.pageY);
            firstDrag = false;
          }
          bigImage.drag(e.pageX, e.pageY);
          thumbnail.updateRectangle(bigImage);

          autoDrag.setManuallyDragged();
        };

        var zoomFunction = function (event) {

        };

        if (!widget.isTouchEvent(event)) dragFunction(event);
        else if (widget.isSingleTouchEvent(event)) {
          dragFunction(widget.convertSingleTouchEvent(event));
        }
        else if (widget.isDoubleTouchEvent(event)) zoomFunction(event);
        else return;

        event.preventDefault();
      };

      var manualDragThumbnail = function (_event) {
        var event = _event;

        if (widget.isSingleTouchEvent(event)) event = widget.convertSingleTouchEvent(event);
        else if (widget.isTouchEvent(event)) return;

        _event.preventDefault();

        var pageX = event.pageX;
        pageX *= -bigImage.fullImageWidth() / thumbnailImg.width();
        // fullImageWidth
        if (firstDrag) {
          bigImage.initDrag(pageX, 0);
          firstDrag = false;
        }
        bigImage.drag(pageX, 0);
        thumbnail.updateRectangle(bigImage);

        autoDrag.setManuallyDragged();
      }

      slider.on("dragstart", function (e) {
        e.preventDefault();
      });

      cropped.on("mousedown touchstart", function (e) {
        $("body").on("mousemove touchmove", manualDragBig);
        cropped.addClass("grabbing");
        firstDrag = true;
        autoDrag.stopAutoDrag();
      });

      // could also use mouseout, then we wouldn't need to register the body events
      body.on("mouseup touchend", function (e) {
        body.off("mousemove touchmove", manualDragBig);
        cropped.removeClass("grabbing");
        firstDrag = false;
      });

      rectangle.on("mousedown touchstart", function (e) {
        body.on("mousemove touchmove", manualDragThumbnail);
        rectangle.addClass("grabbing");
        firstDrag = true;
        autoDrag.stopAutoDrag();
      });

      // could also use mouseout, then we wouldn't need to register the body events
      body.on("mouseup touchend", function (e) {
        body.off("mousemove touchmove", manualDragThumbnail);
        rectangle.removeClass("grabbing");
        firstDrag = false;
      });

      var clickFunction = function(offsetX){
        autoDrag.stopAutoDrag();

        var newCenter = thumbnail.calculateMovementToNewCenter(offsetX);
        newCenter *= -bigImage.fullImageWidth() / thumbnailImg.width();

        bigImage.initDrag(0, 0);
        bigImage.drag(newCenter, 0);

        thumbnail.updateRectangle(bigImage);

        autoDrag.setManuallyDragged();
      }

      thumbnailImg.on("click ", function (event) {
        event.preventDefault();
        clickFunction(event.offsetX);
      });

      thumbnailImg.on("touchstart ", function (_event) {
        var event = _event;

        if (!widget.isSingleTouchEvent(event)) return;

        _event.preventDefault();
        event = widget.convertSingleTouchEvent(event);

        var offsetX = event.pageX - event.target.x;
        clickFunction(offsetX);
      });

      $(window).on("resize", function () {
        thumbnail.updateRectangle(bigImage);
      });
    }

    this.registerControls = function () {
      $("a[href=#play]").on("click touchstart", function (e) {
        e.preventDefault();
        autoDrag.play();
      });

      $("a[href=#stop]").on("click touchstart", function (e) {
        e.preventDefault();
        autoDrag.stopAutoDrag();
      });

      $("a[href=#faster]").on("click touchstart", function (e) {
        e.preventDefault();
        autoDrag.increaseSpeed();
      });

      $("a[href=#slower]").on("click touchstart", function (e) {
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

})
;
