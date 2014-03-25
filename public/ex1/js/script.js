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
  function Vector(_x, _y) {
    var x = _x, y = _y;

    this.getX = function () {
      return x;
    }
    this.getY = function () {
      return y;
    }
    this.multiply = function (v) {
      return new Vector(x * v.getX(), y * v.getY());
    }
    this.multiplyScalar = function (scalar) {
      return new Vector(x * scalar, y * scalar);
    }
    this.plus = function (v) {
      return new Vector(x + v.getX(), y + v.getY());
    }
    this.minus = function (v) {
      return new Vector(x - v.getX(), y - v.getY());
    }
    this.len = function () {
      return Math.sqrt(x * x + y * y);
    }
    this.distance = function (v) {
      return this.len() - v.len();
    }
    this.abs = function () {
      return new Vector(Math.abs(x), Math.abs(y));
    }
    this.toString = function () {
      return "" + x + "/" + y;
    }
  }

  function BigImage(_cropped) {
    var cropped = _cropped,
      croppedImg = cropped.children("img"),
      lastPageX = 0,
      lastPageY = 0,
      moveCallback = null,
      originalWidth = parseFloat(croppedImg.css("max-width"));

    this.onMove = function (callback) {
      moveCallback = callback;
    }

    this.initDrag = function (pageX, pageY) {
      lastPageX = pageX;
      lastPageY = pageY;
    }

    this.drag = function (pageX, pageY) {
      var diffX = lastPageX - pageX;
      var diffY = lastPageY - pageY;

      this.moveX(diffX);
      this.moveY(diffY);

      if (moveCallback !== null) moveCallback(new Vector(diffX, diffY));

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

    this.setZoomFactor = function (zoomFactor) {
      croppedImg.css("max-width", (originalWidth * zoomFactor) + "px");
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

  function AutoDrag(_bigImage, _thumbnail, _accelerator) {
    var _this = this;

    var bigImage = _bigImage;
    var thumbnail = _thumbnail;
    var accelerator = _accelerator;

    var autoDragEnabled = true;
    var autoDragSpeed = 0.1;

    var marginOffset = 0, timeOffset = 0, lastTime = 0, manualDrag = true;

    var randomEnabled = false, nextRandom = new Date();

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
      if (randomEnabled) {
        if (nextRandom > new Date()) return;

        nextRandom = new Date(+new Date() + 400. + 1000. * Math.random());
        accelerator.startRecording();
        accelerator.manualPushMove(new Vector(Math.random() - .5, Math.random() - .5).multiplyScalar(5.25 * Math.random()));
        accelerator.play();
      } else {
        var newPosition = this.calculateMarginLeft(time, max);
        bigImage.moveTo("margin-left", newPosition, max);
        thumbnail.updateRectangle(bigImage);
      }
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

    this.playRandom = function () {
      randomEnabled = !randomEnabled;
    }
  }

  function Record(_time, _diff) {
    var time = _time, diff = _diff;

    this.getTime = function () {
      return time;
    }
    this.getDiff = function () {
      return diff;
    }
  }

  function Accelerator(_moveImage) {
    var moveImage = _moveImage;
    var recording;
    var records;
    var maxRecordLength = 100;

    // only movements in the last 500 milliseconds are important
    var relevantMovementsTimeAgo = 500;

    this.clear = function () {
      records = [new Record(new Date(), new Vector(0., 0.))];
      recording = false;
    };

    this.recordMove = function (movementVector) {
      if (!recording) return;

      records.push(new Record(new Date(), movementVector));
      if (records.length > maxRecordLength) records.shift();
    };

    this.manualPushMove = function (movementVector) {
      var d = new Date();
      records.push(new Record(new Date(+d - 1000), new Vector(0., 0.)));
      records.push(new Record(new Date(+d), movementVector));
    }

    this.calculateMovement = function () {
      var d = new Date();
      var v = new Vector(0, 0);
      var oldest = d;

      // could make this faster...
      records.forEach(function (el) {
        if (d - el.getTime() <= relevantMovementsTimeAgo) {
          v = v.plus(el.getDiff());
          if (el.getTime() < oldest) oldest = el.getTime();
        }
      });

      var quotient = d - oldest;

      if (quotient == 0) return v;

      // multiply to normalize => movement in pixels per millisecond
      return v.multiplyScalar(1. / quotient);
    }

    this.startRecording = function () {
      this.clear();
      recording = true;
    };

    this.play = function () {
      if (recording === false) return;

      recording = false;

      var epsilon = .03;
      var friction = 1 - 1 / 25;
      var acceleration = this.calculateMovement();
      var lastMove = new Date();

      var calcSpeed = function (vector) {
        return Math.sqrt(vector.getX() * vector.getX() + vector.getY() * vector.getY());
      };

      var updateLocation = function (vector) {
        var d = new Date();
        var diff = d - lastMove;

        moveImage(vector.getX() * diff, vector.getY() * diff);
        lastMove = d;
      };

      var tick = function () {
        if (calcSpeed(acceleration) > epsilon && !recording) requestAnimationFrame(tick);
        updateLocation(acceleration);
        acceleration = acceleration.multiplyScalar(friction);
      };
      tick();
    };

    this.clear();
  }

  function Zoom(_bigImage, _thumbnail) {
    var bigImage = _bigImage, thumbnail = _thumbnail;
    var lastZoomPoint = null, totalZoomFactor = 1.;

    this.setZoomedIn = function () {
      bigImage.setZoomFactor(totalZoomFactor * 2.);
    }

    this.resetLastZoomPoint = function () {
      lastZoomPoint = null;
    }

    this.convertZoomVector = function (touches) {
      return new Vector(touches[0].pageX - touches[1].pageX,
        touches[0].pageY - touches[1].pageY);
      //return [new Vector(touches[0].pageX, touches[0].pageY),
      //  new Vector(touches[1].pageX, touches[1].pageY)];
    }

    this.calculateZoomFactor = function (v1, v2) {
      var v1Len = v1.len();
      var v2Len = v2.len();
      if (v1Len == 0 || v2Len == 0) return 1;
      return v2Len / v1Len;
    }

    this.zoomFunction = function (touches) {
      var currentZoomPoint = this.convertZoomVector(touches);

      if (lastZoomPoint === null) {
        lastZoomPoint = currentZoomPoint;
        return;
      }

      var zoomFactor = this.calculateZoomFactor(lastZoomPoint, currentZoomPoint);
      lastZoomPoint = currentZoomPoint;

      this.zoom(zoomFactor);
    };

    this.zoomIn = function () {
      this.zoom(1.1);
    };

    this.zoomOut = function () {
      this.zoom(1. / 1.1);
    };

    this.zoom = function (zoomFactor) {
      totalZoomFactor *= zoomFactor;

      var maxZoomFactor = 3., minZoomFactor = 0.9;

      if (totalZoomFactor > maxZoomFactor) totalZoomFactor = maxZoomFactor;
      if (totalZoomFactor < minZoomFactor) totalZoomFactor = minZoomFactor;

      bigImage.setZoomFactor(totalZoomFactor);
      thumbnail.updateRectangle(bigImage);
    };
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

    var zoom = new Zoom(bigImage, thumbnail);

    var accelerator = new Accelerator(function (x, y) {
      bigImage.moveX(x);
      bigImage.moveY(y);
      thumbnail.updateRectangle(bigImage);
    });
    bigImage.onMove(function (vector) {
      accelerator.recordMove(vector);
    });

    var autoDrag = new AutoDrag(bigImage, thumbnail, accelerator);

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


        if (!widget.isTouchEvent(event)) dragFunction(event);
        else if (widget.isSingleTouchEvent(event)) {
          dragFunction(widget.convertSingleTouchEvent(event));
        }
        else if (widget.isDoubleTouchEvent(event)) zoom.zoomFunction(event.originalEvent.touches);
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

      var registerDrawEvent = function (element, f, startEvent, moveEvent) {
        element.on(startEvent, function () {
          body.on(moveEvent, f);
          element.addClass("grabbing");
          firstDrag = true;
          autoDrag.stopAutoDrag();
          accelerator.startRecording();
        });
      }

      var registerStopDrag = function (element, f, startEvent, moveEvent) {
        // could also use mouseout, then we wouldn't need to register the body events
        body.on(startEvent, function () {
          //if (!element.hasClass("grabbing")) return;
          body.off(moveEvent, f);
          element.removeClass("grabbing");
          firstDrag = false;
          accelerator.play();
          zoom.resetLastZoomPoint();
        });
      }

      registerDrawEvent(cropped, manualDragBig, "mousedown", "mousemove");
      registerDrawEvent(cropped, manualDragBig, "touchstart", "touchmove");
      registerDrawEvent(rectangle, manualDragThumbnail, "mousedown", "mousemove");
      registerDrawEvent(rectangle, manualDragThumbnail, "touchstart", "touchmove");

      registerStopDrag(cropped, manualDragBig, "mouseup", "mousemove");
      registerStopDrag(cropped, manualDragBig, "touchend", "touchmove");
      registerStopDrag(rectangle, manualDragThumbnail, "mouseup", "mousemove");
      registerStopDrag(rectangle, manualDragThumbnail, "touchend", "touchmove");

      var clickFunction = function (offsetX) {
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

      $("a[href=#random]").on("click touchstart", function (e) {
        e.preventDefault();
        zoom.setZoomedIn();
        autoDrag.playRandom();
      });

      $("a[href=#zoomIn]").on("click touchstart", function (e) {
        e.preventDefault();
        zoom.zoomIn();
      });

      $("a[href=#zoomOut]").on("click touchstart", function (e) {
        e.preventDefault();
        zoom.zoomOut();
      });


    }

    this.initAutoDrag = function () {
      autoDrag.initAutoDrag();
    }

  }

  function DiceAnimator() {
    var animate = function () {
      var dice = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];
      var die = dice[Math.floor(Math.random() * dice.length)];
      $("a[href=#random]").html(die);
    }

    animate();
    setInterval(animate, 500);
  }

  var w = new PanoramaWidget();
  w.registerEvents();
  w.registerControls();
  w.initAutoDrag();

  new DiceAnimator();


});
