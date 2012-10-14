/*
* Copyright (c) 2011 Róbert Pataki
* 
* Permission is hereby granted, free of charge, to any person obtaining a copy
* of this software and associated documentation files (the "Software"), to deal
* in the Software without restriction, including without limitation the rights
* to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
* copies of the Software, and to permit persons to whom the Software is
* furnished to do so, subject to the following conditions:
* 
* The above copyright notice and this permission notice shall be included in
* all copies or substantial portions of the Software.
* 
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
* IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
* AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
* LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
* OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
* THE SOFTWARE.
* 
* ----------------------------------------------------------------------------------------
* 
* Check out my GitHub:  http://github.com/heartcode/
* Send me an email:   heartcode@robertpataki.com
* Follow me on Twitter: http://twitter.com/#iHeartcode
* Blog:         http://heartcode.robertpataki.com
*/

/**
* CanvasLoader uses the HTML5 canvas element in modern browsers and VML in IE6/7/8 to create and animate the most popular preloader shapes (oval, spiral, rectangle, square and rounded rectangle).<br/><br/>
* It is important to note that CanvasLoader doesn't show up and starts rendering automatically on instantiation. To start rendering and display the loader use the <code>show()</code> method.
* @module CanvasLoader
**/
(function (window) {
  "use strict";
  /**
  * CanvasLoader is a JavaScript UI library that draws and animates circular preloaders using the Canvas HTML object.<br/><br/>
  * A CanvasLoader instance creates two canvas elements which are placed into a placeholder div (the id of the div has to be passed in the constructor). The second canvas is invisible and used for caching purposes only.<br/><br/>
  * If no id is passed in the constructor, the canvas objects are paced in the document directly.
  * @class CanvasLoader
  * @constructor
  * @param id {String} The id of the placeholder div
  * @param opt {Object} Optional parameters<br/><br/>
  * <strong>Possible values of optional parameters:</strong><br/>
  * <ul>
  * <li><strong>id (String):</strong> The id of the CanvasLoader instance</li>
  * <li><strong>safeVML (Boolean):</strong> If set to true, the amount of CanvasLoader shapes are limited in VML mode. It prevents CPU overkilling when rendering loaders with high density. The default value is true.</li>
  **/
  var CanvasLoader = function (parentElm, opt) {
    if (typeof(opt) == "undefined") { opt = {}; }
    this.init(parentElm, opt);
  }, p = CanvasLoader.prototype, engine, engines = ["canvas", "vml"], shapes = ["oval", "spiral", "square", "rect", "roundRect"], cRX = /^\#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/, ie8 = navigator.appVersion.indexOf("MSIE") !== -1 && parseFloat(navigator.appVersion.split("MSIE")[1]) === 8 ? true : false, canSup = !!document.createElement('canvas').getContext, safeDensity = 40, safeVML = true,
  /**
  * Creates a new element with the tag and applies the passed properties on it
  * @method addEl
  * @protected
  * @param tag {String} The tag to be created
  * @param par {String} The DOM element the new element will be appended to
  * @param opt {Object} Additional properties passed to the new DOM element
  * @return {Object} The DOM element
  */
    addEl = function (tag, par, opt) {
      var el = document.createElement(tag), n;
      for (n in opt) { el[n] = opt[n]; }
      if(typeof(par) !== "undefined") {
        par.appendChild(el);
      }
      return el;
    },
  /**
  * Sets the css properties on the element
  * @method setCSS
  * @protected
  * @param el {Object} The DOM element to be styled
  * @param opt {Object} The style properties
  * @return {Object} The DOM element
  */
    setCSS = function (el, opt) {
      for (var n in opt) { el.style[n] = opt[n]; }
      return el;
    },
  /**
  * Sets the attributes on the element
  * @method setAttr
  * @protected
  * @param el {Object} The DOM element to add the attributes to
  * @param opt {Object} The attributes
  * @return {Object} The DOM element
  */
    setAttr = function (el, opt) {
      for (var n in opt) { el.setAttribute(n, opt[n]); }
      return el;
    },
  /**
  * Transforms the cache canvas before drawing
  * @method transCon
  * @protected
  * @param  x {Object} The canvas context to be transformed
  * @param  x {Number} x translation
  * @param  y {Number} y translation
  * @param  r {Number} Rotation radians
  */
    transCon = function(c, x, y, r) {
      c.save();
      c.translate(x, y);
      c.rotate(r);
      c.translate(-x, -y);
      c.beginPath();
    };
  /** 
  * Initialization method
  * @method init
  * @protected
  * @param id {String} The id of the placeholder div, where the loader will be nested into
  * @param opt {Object} Optional parameters<br/><br/>
  * <strong>Possible values of optional parameters:</strong><br/>
  * <ul>
  * <li><strong>id (String):</strong> The id of the CanvasLoader instance</li>
  * <li><strong>safeVML (Boolean):</strong> If set to true, the amount of CanvasLoader shapes are limited in VML mode. It prevents CPU overkilling when rendering loaders with high density. The default value is true.</li>
  **/
  p.init = function (parentElm, opt) {
    
    if (typeof(opt.safeVML) === "boolean") { safeVML = opt.safeVML; }
    
    /*
    * Find the containing div by id
    * If the container element cannot be found we use the document body itself
    */
    try {
      // Look for the parent element
      if (parentElm !== undefined) {
        this.mum = parentElm;
      } else {
        this.mum = document.body;
      }
    } catch (error) {
      this.mum = document.body;
    }
    // Creates the parent div of the loader instance
    opt.id = typeof (opt.id) !== "undefined" ? opt.id : "canvasLoader";
    this.cont = addEl("span", this.mum, {id: opt.id});
    this.cont.setAttribute("class","canvas-loader");
    if (canSup) {
    // For browsers with Canvas support...
      engine = engines[0];
      // Create the canvas element
      this.can = addEl("canvas", this.cont);
      this.con = this.can.getContext("2d");
      // Create the cache canvas element
      this.cCan = setCSS(addEl("canvas", this.cont), { display: "none" });
      this.cCon = this.cCan.getContext("2d");
    } else {
    // For browsers without Canvas support...
      engine = engines[1];
      // Adds the VML stylesheet
      if (typeof (CanvasLoader.vmlSheet) === "undefined") {
        document.getElementsByTagName("head")[0].appendChild(addEl("style"));
        CanvasLoader.vmlSheet = document.styleSheets[document.styleSheets.length - 1];
        var a = ["group", "oval", "roundrect", "fill"], n;
        for (n in a) { CanvasLoader.vmlSheet.addRule(a[n], "behavior:url(#default#VML); position:absolute;"); }
      }
      this.vml = addEl("group", this.cont);
    }
    // Set the RGB color object
    this.setColor(this.color);
    // Draws the shapes on the canvas
    this.draw();
    //Hides the preloader
    setCSS(this.cont, {display: "none"});
  };
/////////////////////////////////////////////////////////////////////////////////////////////
// Property declarations
  /**
  * The div we place the canvas object into
  * @property cont
  * @protected
  * @type Object
  **/
  p.cont = {};
  /**
  * The div we draw the shapes into
  * @property can
  * @protected
  * @type Object
  **/
  p.can = {};
  /**
  * The canvas context
  * @property con
  * @protected
  * @type Object
  **/
  p.con = {};
  /**
  * The canvas we use for caching
  * @property cCan
  * @protected
  * @type Object
  **/
  p.cCan = {};
  /**
  * The context of the cache canvas
  * @property cCon
  * @protected
  * @type Object
  **/
  p.cCon = {};
  /**
  * Adds a timer for the rendering
  * @property timer
  * @protected
  * @type Boolean
  **/
  p.timer = {};
  /**
  * The active shape id for rendering
  * @property activeId
  * @protected
  * @type Number
  **/
  p.activeId = 0;
  /**
  * The diameter of the loader
  * @property diameter
  * @protected
  * @type Number
  * @default 40
  **/
  p.diameter = 40;
  /**
  * Sets the diameter of the loader
  * @method setDiameter
  * @public
  * @param diameter {Number} The default value is 40
  **/
  p.setDiameter = function (diameter) { this.diameter = Math.round(Math.abs(diameter)); this.redraw(); };
  /**
  * Returns the diameter of the loader.
  * @method getDiameter
  * @public
  * @return {Number}
  **/
  p.getDiameter = function () { return this.diameter; };
  /**
  * The color of the loader shapes in RGB
  * @property cRGB
  * @protected
  * @type Object
  **/
  p.cRGB = {};
  /**
  * The color of the loader shapes in HEX
  * @property color
  * @protected
  * @type String
  * @default "#000000"
  **/
  p.color = "#000000";
  /**
  * Sets hexadecimal color of the loader
  * @method setColor
  * @public
  * @param color {String} The default value is '#000000'
  **/
  p.setColor = function (color) { this.color = cRX.test(color) ? color : "#000000"; this.cRGB = this.getRGB(this.color); this.redraw(); };
  /**
  * Returns the loader color in a hexadecimal form
  * @method getColor
  * @public
  * @return {String}
  **/
  p.getColor = function () { return this.color; };
  /**
  * The type of the loader shapes
  * @property shape
  * @protected
  * @type String
  * @default "oval"
  **/
  p.shape = shapes[0];
  /**
  * Sets the type of the loader shapes.<br/>
  * <br/><b>The acceptable values are:</b>
  * <ul>
  * <li>'oval'</li>
  * <li>'spiral'</li>
  * <li>'square'</li>
  * <li>'rect'</li>
  * <li>'roundRect'</li>
  * </ul>
  * @method setShape
  * @public
  * @param shape {String} The default value is 'oval'
  **/
  p.setShape = function (shape) {
    var n;
    for (n in shapes) {
      if (shape === shapes[n]) { this.shape = shape; this.redraw(); break; }
    }
  };
  /**
  * Returns the type of the loader shapes
  * @method getShape
  * @public
  * @return {String}
  **/
  p.getShape = function () { return this.shape; };
  /**
  * The number of shapes drawn on the loader canvas
  * @property density
  * @protected
  * @type Number
  * @default 40
  **/
  p.density = 40;
  /**
  * Sets the number of shapes drawn on the loader canvas
  * @method setDensity
  * @public
  * @param density {Number} The default value is 40
  **/
  p.setDensity = function (density) { 
    if (safeVML && engine === engines[1]) {
      this.density = Math.round(Math.abs(density)) <= safeDensity ? Math.round(Math.abs(density)) : safeDensity;
    } else {
      this.density = Math.round(Math.abs(density));
    }
    if (this.density > 360) { this.density = 360; }
    this.activeId = 0;
    this.redraw();
  };
  /**
  * Returns the number of shapes drawn on the loader canvas
  * @method getDensity
  * @public
  * @return {Number}
  **/
  p.getDensity = function () { return this.density; };
  /**
  * The amount of the modified shapes in percent.
  * @property range
  * @protected
  * @type Number
  **/
  p.range = 1.3;
  /**
  * Sets the amount of the modified shapes in percent.<br/>
  * With this value the user can set what range of the shapes should be scaled and/or faded. The shapes that are out of this range will be scaled and/or faded with a minimum amount only.<br/>
  * This minimum amount is 0.1 which means every shape which is out of the range is scaled and/or faded to 10% of the original values.<br/>
  * The visually acceptable range value should be between 0.4 and 1.5.
  * @method setRange
  * @public
  * @param range {Number} The default value is 1.3
  **/
  p.setRange = function (range) { this.range = Math.abs(range); this.redraw(); };
  /**
  * Returns the modified shape range in percent
  * @method getRange
  * @public
  * @return {Number}
  **/
  p.getRange = function () { return this.range; };
  /**
  * The speed of the loader animation
  * @property speed
  * @protected
  * @type Number
  **/
  p.speed = 2;
  /**
  * Sets the speed of the loader animation.<br/>
  * This value tells the loader how many shapes to skip by each tick.<br/>
  * Using the right combination of the <code>setFPS</code> and the <code>setSpeed</code> methods allows the users to optimize the CPU usage of the loader whilst keeping the animation on a visually pleasing level.
  * @method setSpeed
  * @public
  * @param speed {Number} The default value is 2
  **/
  p.setSpeed = function (speed) { this.speed = Math.round(Math.abs(speed)); };
  /**
  * Returns the speed of the loader animation
  * @method getSpeed
  * @public
  * @return {Number}
  **/
  p.getSpeed = function () { return this.speed; };
  /**
  * The FPS value of the loader animation rendering
  * @property fps
  * @protected
  * @type Number
  **/
  p.fps = 24;
  /**
  * Sets the rendering frequency.<br/>
  * This value tells the loader how many times to refresh and modify the canvas in 1 second.<br/>
  * Using the right combination of the <code>setSpeed</code> and the <code>setFPS</code> methods allows the users to optimize the CPU usage of the loader whilst keeping the animation on a visually pleasing level.
  * @method setFPS
  * @public
  * @param fps {Number} The default value is 24
  **/
  p.setFPS = function (fps) { this.fps = Math.round(Math.abs(fps)); this.reset(); };
  /**
  * Returns the fps of the loader
  * @method getFPS
  * @public
  * @return {Number}
  **/
  p.getFPS = function () { return this.fps; };
// End of Property declarations
///////////////////////////////////////////////////////////////////////////////////////////// 
  /**
  * Return the RGB values of the passed color
  * @method getRGB
  * @protected
  * @param color {String} The HEX color value to be converted to RGB
  */
  p.getRGB = function (c) {
    c = c.charAt(0) === "#" ? c.substring(1, 7) : c;
    return {r: parseInt(c.substring(0, 2), 16), g: parseInt(c.substring(2, 4), 16), b: parseInt(c.substring(4, 6), 16) };
  };
  /**
  * Draw the shapes on the canvas
  * @method draw
  * @protected
  */
  p.draw = function () {
    var i = 0, size, w, h, x, y, ang, rads, rad, de = this.density, animBits = Math.round(de * this.range), bitMod, minBitMod = 0, s, g, sh, f, d = 1000, arc = 0, c = this.cCon, di = this.diameter, e = 0.47;
    if (engine === engines[0]) {
      c.clearRect(0, 0, d, d);
      setAttr(this.can, {width: di, height: di});
      setAttr(this.cCan, {width: di, height: di});
      while (i < de) {
        bitMod = i <= animBits ? 1 - ((1 - minBitMod) / animBits * i) : bitMod = minBitMod;
        ang = 270 - 360 / de * i;
        rads = ang / 180 * Math.PI;
        c.fillStyle = "rgba(" + this.cRGB.r + "," + this.cRGB.g + "," + this.cRGB.b + "," + bitMod.toString() + ")";
        switch (this.shape) {
        case shapes[0]:
        case shapes[1]:
          size = di * 0.07;
          x = di * e + Math.cos(rads) * (di * e - size) - di * e;
          y = di * e + Math.sin(rads) * (di * e - size) - di * e;
          c.beginPath();
          if (this.shape === shapes[1]) { c.arc(di * 0.5 + x, di * 0.5 + y, size * bitMod, 0, Math.PI * 2, false); } else { c.arc(di * 0.5 + x, di * 0.5 + y, size, 0, Math.PI * 2, false); }
          break;
        case shapes[2]:
          size = di * 0.12;
          x = Math.cos(rads) * (di * e - size) + di * 0.5;
          y = Math.sin(rads) * (di * e - size) + di * 0.5;
          transCon(c, x, y, rads);
          c.fillRect(x, y - size * 0.5, size, size);
          break;
        case shapes[3]:
        case shapes[4]:
          w = di * 0.3;
          h = w * 0.27;
          x = Math.cos(rads) * (h + (di - h) * 0.13) + di * 0.5;
          y = Math.sin(rads) * (h + (di - h) * 0.13) + di * 0.5;
          transCon(c, x, y, rads);
          if(this.shape === shapes[3]) {
            c.fillRect(x, y - h * 0.5, w, h);
          } else {
            rad = h * 0.55;
            c.moveTo(x + rad, y - h * 0.5);
            c.lineTo(x + w - rad, y - h * 0.5);
            c.quadraticCurveTo(x + w, y - h * 0.5, x + w, y - h * 0.5 + rad);
            c.lineTo(x + w, y - h * 0.5 + h - rad);
            c.quadraticCurveTo(x + w, y - h * 0.5 + h, x + w - rad, y - h * 0.5 + h);
            c.lineTo(x + rad, y - h * 0.5 + h);
            c.quadraticCurveTo(x, y - h * 0.5 + h, x, y - h * 0.5 + h - rad);
            c.lineTo(x, y - h * 0.5 + rad);
            c.quadraticCurveTo(x, y - h * 0.5, x + rad, y - h * 0.5);
          }
          break;
        }
        c.closePath();
        c.fill();
        c.restore();
        ++i;
      }
    } else {
      setCSS(this.cont, {width: di, height: di});
      setCSS(this.vml, {width: di, height: di});
      switch (this.shape) {
      case shapes[0]:
      case shapes[1]:
        sh = "oval";
        size = d * 0.14;
        break;
      case shapes[2]:
        sh = "roundrect";
        size = d * 0.12;
        break;
      case shapes[3]:
      case shapes[4]:
        sh = "roundrect";
        size = d * 0.3;
        break;
      }
      w = h = size;
      x = d * 0.5 - h;
      y = -h * 0.5;   
      while (i < de) {
        bitMod = i <= animBits ? 1 - ((1 - minBitMod) / animBits * i) : bitMod = minBitMod;
        ang = 270 - 360 / de * i;
        switch (this.shape) {
        case shapes[1]:
          w = h = size * bitMod;
          x = d * 0.5 - size * 0.5 - size * bitMod * 0.5;
          y = (size - size * bitMod) * 0.5;
          break;
        case shapes[0]:
        case shapes[2]:
          if (ie8) {
            y = 0;
            if(this.shape === shapes[2]) {
              x = d * 0.5 -h * 0.5;
            }
          }
          break;
        case shapes[3]:
        case shapes[4]:
          w = size * 0.95;
          h = w * 0.28;
          if (ie8) {
            x = 0;
            y = d * 0.5 - h * 0.5;
          } else {
            x = d * 0.5 - w;
            y = -h * 0.5;
          }
          arc = this.shape === shapes[4] ? 0.6 : 0; 
          break;
        }
        g = setAttr(setCSS(addEl("group", this.vml), {width: d, height: d, rotation: ang}), {coordsize: d + "," + d, coordorigin: -d * 0.5 + "," + (-d * 0.5)});
        s = setCSS(addEl(sh, g, {stroked: false, arcSize: arc}), { width: w, height: h, top: y, left: x});
        f = addEl("fill", s, {color: this.color, opacity: bitMod});
        ++i;
      }
    }
    this.tick(true);
  };
  /**
  * Cleans the canvas
  * @method clean
  * @protected
  */
  p.clean = function () {
    if (engine === engines[0]) {
      this.con.clearRect(0, 0, 1000, 1000);
    } else {
      var v = this.vml;
      if (v.hasChildNodes()) {
        while (v.childNodes.length >= 1) {
          v.removeChild(v.firstChild);
        }
      }
    }
  };
  /**
  * Redraws the canvas
  * @method redraw
  * @protected
  */
  p.redraw = function () {
      this.clean();
      this.draw();
  };
  /**
    * Resets the timer
    * @method reset
    * @protected
    */
    p.reset = function () {
      if (typeof (this.timer) === "number") {
        this.hide();
        this.show();
      }
    };
  /**
  * Renders the loader animation
  * @method tick
  * @protected
  */
  p.tick = function (init) {
    var c = this.con, di = this.diameter;
    if (!init) { this.activeId += 360 / this.density * this.speed; }
    if (engine === engines[0]) {
      c.clearRect(0, 0, di, di);
      transCon(c, di * 0.5, di * 0.5, this.activeId / 180 * Math.PI);
      c.drawImage(this.cCan, 0, 0, di, di);
      c.restore();
    } else {
      if (this.activeId >= 360) { this.activeId -= 360; }
      setCSS(this.vml, {rotation:this.activeId});
    }
  };
  /**
  * Shows the rendering of the loader animation
  * @method show
  * @public
  */
  p.show = function () {
    if (typeof (this.timer) !== "number") {
      var t = this;
      this.timer = self.setInterval(function () { t.tick(); }, Math.round(1000 / this.fps));
      setCSS(this.cont, {display: "block"});
    }
  };
  /**
  * Stops the rendering of the loader animation and hides the loader
  * @method hide
  * @public
  */
  p.hide = function () {
    if (typeof (this.timer) === "number") {
      clearInterval(this.timer);      
      delete this.timer;
      setCSS(this.cont, {display: "none"});
    }
  };
  /**
  * Removes the CanvasLoader instance and all its references
  * @method kill
  * @public
  */
  p.kill = function () {
    var c = this.cont;
    if (typeof (this.timer) === "number") { this.hide(); }
    if (engine === engines[0]) {
      c.removeChild(this.can);
      c.removeChild(this.cCan);
    } else {
      c.removeChild(this.vml);
    }
    var n;
    for (n in this) { delete this[n]; }
  };
  window.CanvasLoader = CanvasLoader;
}(window));

var KD = {};
KD.config = {"suppressLogs":false,"version":"0.0.1","mainUri":"http://localhost:3000","broker":{"apiKey":"a19c8bf6d2cad6c7a006","sockJS":"http://zb.koding.com:8008/subscribe","auth":"http://localhost:3000/auth","vhost":"sinan"},"apiUri":"https://dev-api.koding.com","appsUri":"https://dev-app.koding.com"};
var __utils,
  __slice = [].slice,
  __hasProp = {}.hasOwnProperty;

__utils = {
  idCounter: 0,
  formatPlural: function(count, noun) {
    return "" + (count || 0) + " " + (count === 1 ? noun : Inflector.pluralize(noun));
  },
  selectText: function(element, selectionStart, selectionEnd) {
    var doc, range, selection;
    doc = document;
    if (doc.body.createTextRange) {
      range = document.body.createTextRange();
      range.moveToElementText(element);
      return range.select();
    } else if (window.getSelection) {
      selection = window.getSelection();
      range = document.createRange();
      range.selectNodeContents(element);
      selection.removeAllRanges();
      return selection.addRange(range);
    }
  },
  getCallerChain: function(args, depth) {
    var caller, chain;
    caller = args.callee.caller;
    chain = [caller];
    while (depth-- && (caller = caller != null ? caller.caller : void 0)) {
      chain.push(caller);
    }
    return chain;
  },
  getUniqueId: function() {
    return "" + (__utils.getRandomNumber(100000)) + "_" + (Date.now());
  },
  getRandomNumber: function(range) {
    range = range || 1000000;
    return Math.floor(Math.random() * range + 1);
  },
  uniqueId: function(prefix) {
    var id;
    id = __utils.idCounter++;
    if (prefix != null) {
      return "" + prefix + id;
    } else {
      return id;
    }
  },
  getRandomRGB: function() {
    return "rgb(" + (this.getRandomNumber(255)) + "," + (this.getRandomNumber(255)) + "," + (this.getRandomNumber(255)) + ")";
  },
  getRandomHex: function() {
    var hex;
    hex = (Math.random() * 0x999999 << 0).toString(16);
    while (hex.length < 6) {
      hex += "0";
    }
    return "#" + hex;
  },
  trimIllegalChars: function(word) {},
  curryCssClass: function(obligatoryClass, optionalClass) {
    return obligatoryClass + (optionalClass ? ' ' + optionalClass : '');
  },
  getUrlParams: function(tag) {
    var a, d, e, hashParams, q, r;
    if (tag == null) {
      tag = window.location.search;
    }
    hashParams = {};
    a = /\+/g;
    r = /([^&;=]+)=?([^&;]*)/g;
    d = function(s) {
      return decodeURIComponent(s.replace(a, " "));
    };
    q = tag.substring(1);
    while (e = r.exec(q)) {
      hashParams[d(e[1])] = d(e[2]);
    }
    return hashParams;
  },
  capAndRemovePeriods: function(path) {
    var arg, newPath;
    newPath = (function() {
      var _i, _len, _ref, _results;
      _ref = path.split(".");
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        arg = _ref[_i];
        _results.push(arg.capitalize());
      }
      return _results;
    })();
    return newPath.join("");
  },
  slugify: function(title) {
    var url;
    if (title == null) {
      title = "";
    }
    return url = title.toLowerCase().replace(/^\s+|\s+$/g, "").replace(/[_|\s]+/g, "-").replace(/[^a-z0-9-]+/g, "").replace(/[-]+/g, "-").replace(/^-+|-+$/g, "");
  },
  stripTags: function(value) {
    return value.replace(/<(?:.|\n)*?>/gm, '');
  },
  applyMarkdown: function(text) {
    if (!text) {
      return null;
    }
    marked.setOptions({
      gfm: true,
      pedantic: false,
      sanitize: true,
      highlight: function(text) {
        return text;
      }
    });
    text = Encoder.htmlDecode(text);
    return text = marked(text);
  },
  applyLineBreaks: function(text) {
    if (!text) {
      return null;
    }
    return text.replace(/\n/g, "<br />");
  },
  applyTextExpansions: function(text, shorten) {
    if (!text) {
      return null;
    }
    text = text.replace(/&#10;/g, ' ');
    if (shorten) {
      text = __utils.putShowMore(text);
    }
    return this.expandWwwDotDomains(this.expandUrls(this.expandUsernames(text)));
  },
  expandWwwDotDomains: function(text) {
    if (!text) {
      return null;
    }
    return text.replace(/(^|\s)(www\.[A-Za-z0-9-_]+.[A-Za-z0-9-_:%&\?\/.=]+)/g, function(_, whitespace, www) {
      return "" + whitespace + "<a href='http://" + www + "' target='_blank'>" + www + "</a>";
    });
  },
  expandUsernames: function(text) {
    if (!text) {
      return null;
    }
    return text.replace(/\B\@([\w\-]+)/gim, function(u) {
      var username;
      username = u.replace("@", "");
      return u.link("#!/member/" + username);
    });
  },
  expandTags: function(text) {
    if (!text) {
      return null;
    }
    return text.replace(/[#]+[A-Za-z0-9-_]+/g, function(t) {
      var tag;
      tag = t.replace("#", "");
      return "<a href='#!/topic/" + tag + "' class='ttag'><span>" + tag + "</span></a>";
    });
  },
  expandUrls: function(text) {
    if (!text) {
      return null;
    }
    return text.replace(/[A-Za-z]+:\/\/[A-Za-z0-9-_]+\.[A-Za-z0-9-_:%&#\+\?\/.=]+/g, function(url) {
      return "<a href='" + url + "' target='_blank'>" + url + "</a>";
    });
  },
  putShowMore: function(text, l) {
    var morePart, shortenedText;
    if (l == null) {
      l = 500;
    }
    shortenedText = __utils.shortenText(text, {
      minLength: l,
      maxLength: l + Math.floor(l / 10),
      suffix: ' '
    });
    return text = text.length > 500 ? (morePart = "<span class='collapsedtext hide'>", morePart += "<a href='#' class='more-link' title='Show more...'>···</a>", morePart += text.substr(500), morePart += "<a href='#' class='less-link' title='Show less...'>···</a>", morePart += "</span>", shortenedText + morePart) : shortenedText;
  },
  shortenText: (function() {
    var tryToShorten;
    tryToShorten = function(longText, optimalBreak, suffix) {
      if (!~longText.indexOf(optimalBreak)) {
        return false;
      } else {
        return longText.split(optimalBreak).slice(0, -1).join(optimalBreak) + (suffix != null ? suffix : optimalBreak);
      }
    };
    return function(longText, options) {
      var candidate, longTextLength, maxLength, minLength, suffix, _ref;
      if (options == null) {
        options = {};
      }
      if (!longText) {
        return;
      }
      minLength = options.minLength || 450;
      maxLength = options.maxLength || 600;
      suffix = (_ref = options.suffix) != null ? _ref : '...';
      longTextLength = Encoder.htmlDecode(longText).length;
      if (longTextLength < minLength || longTextLength < maxLength) {
        return longText;
      }
      longText = Encoder.htmlDecode(longText);
      longText = longText.substr(0, maxLength);
      candidate = tryToShorten(longText, '. ', suffix) || tryToShorten(longText, ' ', suffix);
      if ((candidate != null ? candidate.length : void 0) > minLength) {
        return Encoder.htmlEncode(candidate);
      } else {
        return Encoder.htmlEncode(longText);
      }
    };
  })(),
  getMonthOptions: function() {
    var i, _i, _results;
    _results = [];
    for (i = _i = 1; _i <= 12; i = ++_i) {
      _results.push(i > 9 ? {
        title: "" + i,
        value: i
      } : {
        title: "0" + i,
        value: i
      });
    }
    return _results;
  },
  getYearOptions: function(min, max) {
    var i, _i, _results;
    if (min == null) {
      min = 1900;
    }
    if (max == null) {
      max = Date.prototype.getFullYear();
    }
    _results = [];
    for (i = _i = min; min <= max ? _i <= max : _i >= max; i = min <= max ? ++_i : --_i) {
      _results.push({
        title: "" + i,
        value: i
      });
    }
    return _results;
  },
  getFileExtension: function(path) {
    var extension, fileName, name, _ref;
    fileName = path || '';
    _ref = fileName.split('.'), name = _ref[0], extension = 2 <= _ref.length ? __slice.call(_ref, 1) : [];
    return extension = extension.length === 0 ? '' : extension[extension.length - 1];
  },
  getFileType: function(extension) {
    var ext, fileType, set, type, _extension_sets, _i, _len;
    fileType = "unknown";
    _extension_sets = {
      code: ["php", "pl", "py", "jsp", "asp", "htm", "html", "phtml", "shtml", "sh", "cgi", "htaccess", "fcgi", "wsgi", "mvc", "xml", "sql", "rhtml", "js", "json", "coffee", "css", "styl", "sass"],
      text: ["txt", "doc", "rtf", "csv", "docx", "pdf"],
      archive: ["zip", "gz", "bz2", "tar", "7zip", "rar", "gzip", "bzip2", "arj", "cab", "chm", "cpio", "deb", "dmg", "hfs", "iso", "lzh", "lzma", "msi", "nsis", "rpm", "udf", "wim", "xar", "z", "jar", "ace", "7z", "uue"],
      image: ["png", "gif", "jpg", "jpeg", "bmp", "svg", "psd", "qt", "qtif", "qif", "qti", "tif", "tiff", "aif", "aiff"],
      video: ["avi", "mp4", "h264", "mov", "mpg", "ra", "ram", "mpg", "mpeg", "m4a", "3gp", "wmv", "flv", "swf", "wma", "rm", "rpm", "rv"],
      sound: ["aac", "au", "gsm", "mid", "midi", "snd", "wav", "3g2", "mp3", "asx", "asf"],
      app: ["kdapp"]
    };
    for (type in _extension_sets) {
      if (!__hasProp.call(_extension_sets, type)) continue;
      set = _extension_sets[type];
      for (_i = 0, _len = set.length; _i < _len; _i++) {
        ext = set[_i];
        if (extension === ext) {
          fileType = type;
        }
      }
    }
    return fileType;
  },
  _permissionMap: function() {
    var map;
    return map = {
      '---': 0,
      '--x': 1,
      '-w-': 2,
      '-wx': 3,
      'r--': 4,
      'r-x': 5,
      'rw-': 6,
      'rwx': 7
    };
  },
  symbolsPermissionToOctal: function(permissions) {
    var group, octal, other, user;
    permissions = permissions.substr(1);
    user = permissions.substr(0, 3);
    group = permissions.substr(3, 3);
    other = permissions.substr(6, 3);
    return octal = '' + this._permissionMap()[user] + this._permissionMap()[group] + this._permissionMap()[other];
  },
  getNameFromFullname: function(fullname) {
    return fullname.split(' ')[0];
  },
  getParentPath: function(path) {
    var parentPath;
    if (path.substr(-1) === "/") {
      path = path.substr(0, path.length - 1);
    }
    parentPath = path.split('/');
    parentPath.pop();
    return parentPath.join('/');
  },
  wait: function(duration, fn) {
    if ("function" === typeof duration) {
      fn = duration;
      duration = 0;
    }
    return setTimeout(fn, duration);
  },
  killWait: function(id) {
    return clearTimeout(id);
  },
  getCancellableCallback: function(callback) {
    var cancelled, kallback;
    cancelled = false;
    kallback = function() {
      var rest;
      rest = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      if (!cancelled) {
        return callback.apply(null, rest);
      }
    };
    kallback.cancel = function() {
      return cancelled = true;
    };
    return kallback;
  },
  /*
    password-generator
    Copyright(c) 2011 Bermi Ferrer <bermi@bermilabs.com>
    MIT Licensed
  */

  generatePassword: (function() {
    var consonant, letter, vowel;
    letter = /[a-zA-Z]$/;
    vowel = /[aeiouAEIOU]$      /;
    consonant = /[bcdfghjklmnpqrstvwxyzBCDFGHJKLMNPQRSTVWXYZ]$/;
    return function(length, memorable, pattern, prefix) {
      var chr, n;
      if (length == null) {
        length = 10;
      }
      if (memorable == null) {
        memorable = true;
      }
      if (pattern == null) {
        pattern = /\w/;
      }
      if (prefix == null) {
        prefix = '';
      }
      if (prefix.length >= length) {
        return prefix;
      }
      if (memorable) {
        pattern = consonant.test(prefix) ? vowel : consonant;
      }
      n = (Math.floor(Math.random() * 100) % 94) + 33;
      chr = String.fromCharCode(n);
      if (memorable) {
        chr = chr.toLowerCase();
      }
      if (!pattern.test(chr)) {
        return __utils.generatePassword(length, memorable, pattern, prefix);
      }
      return __utils.generatePassword(length, memorable, pattern, "" + prefix + chr);
    };
  })()
  /*
    //     Underscore.js 1.3.1
    //     (c) 2009-2012 Jeremy Ashkenas, DocumentCloud Inc.
    //     Underscore is freely distributable under the MIT license.
    //     Portions of Underscore are inspired or borrowed from Prototype,
    //     Oliver Steele's Functional, and John Resig's Micro-Templating.
    //     For all details and documentation:
    //     http://documentcloud.github.com/underscore
  */

};


__utils.throttle = function(func, wait) {
  var context, args, timeout, throttling, more;
  var whenDone = __utils.debounce(function(){ more = throttling = false; }, wait);
  return function() {
    context = this; args = arguments;
    var later = function() {
      timeout = null;
      if (more) func.apply(context, args);
      whenDone();
    };
    if (!timeout) timeout = setTimeout(later, wait);
    if (throttling) {
      more = true;
    } else {
      func.apply(context, args);
    }
    whenDone();
    throttling = true;
  };
};

// Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The function will be called after it stops being called for
// N milliseconds.
__utils.debounce = function(func, wait) {
  var timeout;
  return function() {
    var context = this, args = arguments;
    var later = function() {
      timeout = null;
      func.apply(context, args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};
;


var KD, error, log, noop, prettyPrint, warn, _base, _ref, _ref1, _ref10, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9,
  __slice = [].slice,
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

(_base = Function.prototype).bind || (_base.bind = (function() {
  var slice;
  slice = [].slice;
  return function(context) {
    var args, func;
    func = this;
    if (1 < arguments.length) {
      args = slice.call(arguments, 1);
      return function() {
        return func.apply(context, arguments.length ? args.concat(slice.call(arguments)) : args);
      };
    }
    return function() {
      if (arguments.z) {
        return func.apply(context, arguments);
      } else {
        return func.call(context);
      }
    };
  };
})());

Function.prototype.swiss = function() {
  var name, names, parent, _i, _len;
  parent = arguments[0], names = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
  for (_i = 0, _len = names.length; _i < _len; _i++) {
    name = names[_i];
    this.prototype[name] = parent.prototype[name];
  }
  return this;
};

window.URL = (_ref = (_ref1 = window.URL) != null ? _ref1 : window.webkitURL) != null ? _ref : null;

window.BlobBuilder = (_ref2 = (_ref3 = (_ref4 = window.BlobBuilder) != null ? _ref4 : window.WebKitBlobBuilder) != null ? _ref3 : window.MozBlobBuilder) != null ? _ref2 : null;

window.requestFileSystem = (_ref5 = (_ref6 = window.requestFileSystem) != null ? _ref6 : window.webkitRequestFileSystem) != null ? _ref5 : null;

window.requestAnimationFrame = (_ref7 = (_ref8 = (_ref9 = window.requestAnimationFrame) != null ? _ref9 : window.webkitRequestAnimationFrame) != null ? _ref8 : window.mozRequestAnimationFrame) != null ? _ref7 : null;

String.prototype.capitalize = function() {
  return this.charAt(0).toUpperCase() + this.slice(1);
};

String.prototype.decapitalize = function() {
  return this.charAt(0).toLowerCase() + this.slice(1);
};

String.prototype.trim = function() {
  return this.replace(/^\s+|\s+$/g, "");
};

KD = this.KD || {};

this.KD = $.extend(KD, (function() {
  var zIndexContexts;
  zIndexContexts = {};
  return {
    debugStates: {},
    instances: {},
    singletons: {},
    subscriptions: [],
    classes: {},
    apiUri: KD.config.apiUri,
    appsUri: KD.config.appsUri,
    whoami: function() {
      return KD.getSingleton('mainController').userAccount;
    },
    isLoggedIn: function() {
      return this.whoami() instanceof KD.remote.api.JAccount;
    },
    isMine: function(account) {
      return this.whoami().profile.nickname === account.profile.nickname;
    },
    checkFlag: function(flag, account) {
      if (account == null) {
        account = KD.whoami();
      }
      return account.globalFlags && __indexOf.call(account.globalFlags, flag) >= 0;
    },
    requireLogin: function(errMsg, callback) {
      var _ref10;
      if (!callback) {
        _ref10 = [errMsg, callback], callback = _ref10[0], errMsg = _ref10[1];
      }
      if (KD.whoami() instanceof KD.remote.api.JGuest) {
        return new KDNotificationView({
          type: 'growl',
          title: 'Access denied!',
          content: errMsg || 'You must log in to perform this action!',
          duration: 3000
        });
      } else {
        return typeof callback === "function" ? callback() : void 0;
      }
    },
    socketConnected: function() {
      this.backendIsConnected = true;
      return KDObject.emit("KDBackendConnectedEvent");
    },
    setApplicationPartials: function(partials) {
      return this.appPartials = partials;
    },
    subscribe: function(subscription) {
      return this.subscriptions.push(subscription);
    },
    removeSubscriptions: function(aKDViewInstance) {
      var i, newSubscriptions, subscription;
      newSubscriptions = (function() {
        var _i, _len, _ref10, _results;
        _ref10 = this.subscriptions;
        _results = [];
        for (i = _i = 0, _len = _ref10.length; _i < _len; i = ++_i) {
          subscription = _ref10[i];
          if (subscription.subscribingInstance !== aKDViewInstance) {
            _results.push(subscription);
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      }).call(this);
      return this.recreateSubscriptions(newSubscriptions);
    },
    recreateSubscriptions: function(newSubscriptions) {
      var subscription, _i, _len, _results;
      this.subscriptions = [];
      _results = [];
      for (_i = 0, _len = newSubscriptions.length; _i < _len; _i++) {
        subscription = newSubscriptions[_i];
        if (subscription != null) {
          _results.push(this.subscriptions.push(subscription));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    },
    getAllSubscriptions: function() {
      return this.subscriptions;
    },
    registerInstance: function(anInstance) {
      var _base1, _name, _ref10;
      if (this.instances[anInstance.id]) {
        warn("Instance being overwritten!!", anInstance);
      }
      this.instances[anInstance.id] = anInstance;
      return (_ref10 = (_base1 = this.classes)[_name = anInstance.constructor.name]) != null ? _ref10 : _base1[_name] = anInstance.constructor;
    },
    unregisterInstance: function(anInstanceId) {
      return delete this.instances[anInstanceId];
    },
    deleteInstance: function(anInstanceId) {
      return this.unregisterInstance(anInstanceId);
    },
    registerSingleton: function(singletonName, object, override) {
      var existingSingleton;
      if (override == null) {
        override = false;
      }
      if ((existingSingleton = KD.singletons[singletonName]) != null) {
        if (override) {
          warn("singleton overriden! KD.singletons[\"" + singletonName + "\"]");
          if (typeof existingSingleton.destroy === "function") {
            existingSingleton.destroy();
          }
          KD.singletons[singletonName] = object;
        } else {
          error("KD.singletons[\"" + singletonName + "\"] singleton exists! if you want to override set override param to true]");
          KD.singletons[singletonName];
        }
        return KDObject.emit("singleton." + singletonName + ".registered");
      } else {
        return KD.singletons[singletonName] = object;
      }
    },
    getSingleton: function(singletonName) {
      if (KD.singletons[singletonName] != null) {
        return KD.singletons[singletonName];
      } else {
        warn("\"" + singletonName + "\" singleton doesn't exist!");
        return null;
      }
    },
    getAllKDInstances: function() {
      return KD.instances;
    },
    getKDViewInstanceFromDomElement: function(domElement) {
      return this.instances[$(domElement).data("data-id")];
    },
    propagateEvent: function(KDEventType, publishingInstance, value) {
      var subscription, _i, _len, _ref10, _results;
      _ref10 = this.subscriptions;
      _results = [];
      for (_i = 0, _len = _ref10.length; _i < _len; _i++) {
        subscription = _ref10[_i];
        if (!(KDEventType != null) || !(subscription.KDEventType != null) || !!KDEventType.match(subscription.KDEventType.capitalize())) {
          _results.push(subscription.callback.call(subscription.subscribingInstance, publishingInstance, value, {
            subscription: subscription
          }));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    },
    getNextHighestZIndex: function(context) {
      var uniqid;
      uniqid = context.data('data-id');
      if (isNaN(zIndexContexts[uniqid])) {
        return zIndexContexts[uniqid] = 0;
      } else {
        return zIndexContexts[uniqid]++;
      }
    },
    jsonhTest: function() {
      var method, start, testData;
      method = 'fetchQuestionTeasers';
      testData = {
        foo: 10,
        bar: 11
      };
      start = Date.now();
      return $.ajax("/" + method + ".jsonh", {
        data: testData,
        dataType: 'jsonp',
        success: function(data) {
          var inflated;
          inflated = JSONH.unpack(data);
          console.log('success', inflated);
          return console.log(Date.now() - start);
        }
      });
    }
  };
})());

noop = function() {};

if ((_ref10 = KD.config) != null ? _ref10.suppressLogs : void 0) {
  console.log = console.error = console.warn = console.trace = noop;
}

KD.log = log = (typeof console !== "undefined" && console !== null ? console.log : void 0) ? console.log.bind(console) : noop;

KD.warn = warn = (typeof console !== "undefined" && console !== null ? console.warn : void 0) ? console.warn.bind(console) : noop;

KD.error = error = (typeof console !== "undefined" && console !== null ? console.error : void 0) ? console.error.bind(console) : noop;

prettyPrint = noop;

var KDEventEmitter,
  __slice = [].slice,
  __hasProp = {}.hasOwnProperty;

KDEventEmitter = (function() {
  var getEventParser, _e;

  KDEventEmitter.KDEventEmitterEvents = {};

  _e = KDEventEmitter.KDEventEmitterEvents[KDEventEmitter.name] = {};

  getEventParser = function(event) {
    return RegExp("^" + (event.replace(/\./g, '\\.').replace(/\*/g, '((?:\\w+\\.?)*)')) + "$");
  };

  KDEventEmitter.emit = function() {
    var args, event, listener, _i, _len, _ref, _ref1, _ref2, _results;
    _ref = [].slice.call(arguments), event = _ref[0], args = 2 <= _ref.length ? __slice.call(_ref, 1) : [];
    if ((_ref1 = _e[event]) == null) {
      _e[event] = [];
    }
    if (_e[event] != null) {
      _ref2 = _e[event];
      _results = [];
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        listener = _ref2[_i];
        _results.push(listener.apply(null, args));
      }
      return _results;
    }
  };

  KDEventEmitter.on = function(event, callback) {
    var _ref;
    if ((_ref = _e[event]) == null) {
      _e[event] = [];
    }
    return _e[event].push(callback);
  };

  KDEventEmitter.off = function(event) {
    if (event === "*") {
      return _e = {};
    } else {
      return _e[event] = [];
    }
  };

  function KDEventEmitter() {
    this.KDEventEmitterEvents = {};
    this._e = this.KDEventEmitterEvents[this.constructor.name] = {};
  }

  KDEventEmitter.prototype.emit = function() {
    var args, event, eventName, listenerStack, parser, _base, _ref, _ref1,
      _this = this;
    event = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    if ((_ref = (_base = this._e)[event]) == null) {
      _base[event] = [];
    }
    listenerStack = [];
    _ref1 = this._e;
    for (eventName in _ref1) {
      if (!__hasProp.call(_ref1, eventName)) continue;
      if (eventName === event) {
        continue;
      }
      parser = getEventParser(eventName);
      if (parser.test(event)) {
        listenerStack = listenerStack.concat(this._e[eventName].slice(0));
      }
    }
    listenerStack = listenerStack.concat(this._e[event].slice(0));
    return listenerStack.forEach(function(listener) {
      return listener.apply(_this, args);
    });
  };

  KDEventEmitter.prototype.on = function(event, callback) {
    var _base, _ref;
    if ((_ref = (_base = this._e)[event]) == null) {
      _base[event] = [];
    }
    return this._e[event].push(callback);
  };

  KDEventEmitter.prototype.off = function(event) {
    if (event === "*") {
      return this._e = {};
    } else {
      return this._e[event] = [];
    }
  };

  KDEventEmitter.prototype.unsubscribe = function(event, callback) {
    var index;
    if (this._e[event]) {
      index = this._e[event].indexOf(callback);
      if (index > -1) {
        return this._e[event].splice(index, 1);
      }
    }
  };

  KDEventEmitter.prototype.once = function(event, callback) {
    var _callback,
      _this = this;
    _callback = function() {
      var args;
      args = [].slice.call(arguments);
      _this.unsubscribe(event, _callback);
      return callback.apply(null, args);
    };
    return this.on(event, _callback);
  };

  return KDEventEmitter;

})();

var KDObject,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

KDObject = (function(_super) {

  __extends(KDObject, _super);

  KDObject.prototype.utils = __utils;

  function KDObject(options, data) {
    if (options == null) {
      options = {};
    }
    this.id || (this.id = options.id || __utils.getUniqueId());
    this.setOptions(options);
    this.setData(data);
    if (options.delegate) {
      this.setDelegate(options.delegate);
    }
    this.registerKDObjectInstance();
    this.subscriptionsByEvent = {};
    this.subscriptionCountByListenerId = {};
    this.listeningTo = [];
    KDObject.__super__.constructor.apply(this, arguments);
  }

  if (KD.MODE === 'development') {
    KDObject.prototype.interfere = function(o) {
      return o;
    };
    KDObject.prototype.o = function(o) {
      return this.interfere(o);
    };
  } else {
    KDObject.prototype.o = function(o) {
      return o;
    };
  }

  KDObject.prototype.inheritanceChain = function(options) {
    var chain, method, methodArray, newChain, proto, _i, _j, _len, _len1;
    methodArray = options.method.split(".");
    options.callback;
    proto = this.__proto__;
    chain = this;
    for (_i = 0, _len = methodArray.length; _i < _len; _i++) {
      method = methodArray[_i];
      chain = chain[method];
    }
    while (proto = proto.__proto__) {
      newChain = proto;
      for (_j = 0, _len1 = methodArray.length; _j < _len1; _j++) {
        method = methodArray[_j];
        newChain = newChain[method];
      }
      chain = options.callback({
        chain: chain,
        newLink: newChain
      });
    }
    return chain;
  };

  KDObject.prototype.chainNames = function(options) {
    options.chain;
    options.newLink;
    return options.chain + ("." + options.newLink);
  };

  KDObject.prototype.listenToOnce = function(KDEventTypes, callback, obj) {
    var onceCallback, options;
    options = this._listenToAdapter(KDEventTypes, callback, obj);
    if ((obj = options.obj) != null) {
      options.listener = this;
      return obj.registerListenOncer(options);
    } else {
      if (callback == null) {
        return error("you should pass at least a callback for KDObject.listenToOnce() method to work.");
      }
      onceCallback = function(source, data, _arg) {
        var subscription;
        subscription = _arg.subscription;
        options.callback(arguments);
        return KD.getAllSubscriptions().splice(KD.getAllSubscriptions().indexOf(subscription), 1);
      };
      options.callback = onceCallback;
      return this._listenTo(options);
    }
  };

  KDObject.prototype.listenTo = function(KDEventTypes, callback, obj) {
    var options;
    options = this._listenToAdapter(KDEventTypes, callback, obj);
    return this._listenTo(options);
  };

  KDObject.prototype._listenToAdapter = function(KDEventTypes, callback, obj) {
    var callbacks, event, options;
    if (KDEventTypes.KDEventTypes != null) {
      options = KDEventTypes;
      if (options.KDEventTypes) {
        if (!$.isArray(options.KDEventTypes)) {
          options.KDEventTypes = [options.KDEventTypes];
        }
      }
      KDEventTypes = (function() {
        var _i, _len, _ref, _ref1, _results;
        _ref = options.KDEventTypes;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          event = _ref[_i];
          if (!((event.className != null) || (event.eventType != null))) {
            event = {
              eventType: event
            };
          }
          _results.push((event.className === "KDData" ? "Data" : event.className || "") + (((_ref1 = event.eventType) != null ? _ref1.capitalize() : void 0) || (event.property != null ? "." + event.property : void 0) || ""));
        }
        return _results;
      })();
      obj = options.listenedToInstance;
      callback = options.callback;
      callbacks = options.callbacks;
    }
    return {
      KDEventTypes: KDEventTypes,
      callback: callback,
      callbacks: callbacks,
      obj: obj
    };
  };

  KDObject.prototype._listenTo = function(_arg) {
    var KDEventType, KDEventTypes, callback, callbacks, obj, _i, _len, _results;
    KDEventTypes = _arg.KDEventTypes, callback = _arg.callback, callbacks = _arg.callbacks, obj = _arg.obj;
    if (!((callback != null) || (callbacks != null))) {
      return error("you should pass at least a callback for KDObject.listenTo() method to work. (" + KDEventTypes + ")");
    }
    if (obj == null) {
      if (KDEventTypes) {
        if (!$.isArray(KDEventTypes)) {
          KDEventTypes = [KDEventTypes];
        }
        _results = [];
        for (_i = 0, _len = KDEventTypes.length; _i < _len; _i++) {
          KDEventType = KDEventTypes[_i];
          _results.push(KD.subscribe({
            subscribingInstance: this,
            KDEventType: KDEventType.capitalize(),
            callback: callback
          }));
        }
        return _results;
      } else {
        return KD.subscribe({
          subscribingInstance: this,
          KDEventType: null,
          callback: callback
        });
      }
    } else {
      return KDEventTypes = obj.registerListener({
        KDEventTypes: KDEventTypes,
        callback: callback,
        callbacks: callbacks,
        listener: this
      });
    }
  };

  KDObject.prototype.registerListener = function(_arg) {
    var KDEventType, KDEventTypes, callback, count, listener, _base, _base1, _base2, _base3, _base4, _base5, _i, _len, _name, _name1;
    KDEventTypes = _arg.KDEventTypes, callback = _arg.callback, listener = _arg.listener;
    KDEventTypes = KDEventTypes;
    if (KDEventTypes) {
      if (!$.isArray(KDEventTypes)) {
        KDEventTypes = [KDEventTypes];
      }
      for (_i = 0, _len = KDEventTypes.length; _i < _len; _i++) {
        KDEventType = KDEventTypes[_i];
        KDEventType = KDEventType.capitalize();
        ((_base = this.subscriptionsByEvent)[KDEventType] || (_base[KDEventType] = [])).push({
          KDEventType: KDEventType,
          listener: listener,
          callback: callback
        });
        count = ((_base1 = ((_base2 = this.subscriptionCountByListenerId)[_name = listener.id] || (_base2[_name] = {})))[KDEventType] || (_base1[KDEventType] = 0));
        count++;
      }
    } else {
      ((_base3 = this.subscriptionsByEvent).KDAnyEvent || (_base3.KDAnyEvent = [])).push({
        KDEventType: 'KDAnyEvent',
        listener: listener,
        callback: callback
      });
      count = ((_base4 = ((_base5 = this.subscriptionCountByListenerId)[_name1 = listener.id] || (_base5[_name1] = {}))).KDAnyEvent || (_base4.KDAnyEvent = 0));
      count++;
    }
    return listener != null ? listener.setListeningTo(this) : void 0;
  };

  KDObject.prototype.registerListenOncer = function(_arg) {
    var KDEventTypes, callback, listener, onceCallback, self;
    KDEventTypes = _arg.KDEventTypes, callback = _arg.callback, listener = _arg.listener;
    self = this;
    onceCallback = function(source, data, _arg1) {
      var subscription, subscriptionList;
      subscription = _arg1.subscription;
      callback.apply(listener, arguments);
      (subscriptionList = self.subscriptionsByEvent[subscription.KDEventType]).splice(subscriptionList.indexOf(subscription), 1);
      return self.subscriptionCountByListenerId[listener.id][subscription.KDEventType]--;
    };
    return this.registerListener({
      KDEventTypes: KDEventTypes,
      callback: onceCallback,
      listener: listener
    });
  };

  KDObject.prototype.setListeningTo = function(obj) {
    return this.listeningTo.push(obj);
  };

  KDObject.prototype.registerSingleton = KD.registerSingleton;

  KDObject.prototype.getSingleton = KD.getSingleton;

  KDObject.prototype.getInstance = function(instanceId) {
    var _ref;
    return (_ref = KD.getAllKDInstances()[instanceId]) != null ? _ref : null;
  };

  KDObject.prototype.propagateEvent = function(_arg, data) {
    var KDEventType, globalEvent, subscription, _i, _j, _len, _len1, _ref, _ref1;
    KDEventType = _arg.KDEventType, globalEvent = _arg.globalEvent;
    globalEvent || (globalEvent = false);
    KDEventType = KDEventType.capitalize();
    if (KDEventType in this.subscriptionsByEvent) {
      _ref = this.subscriptionsByEvent[KDEventType];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        subscription = _ref[_i];
        subscription.callback.call(subscription.listener, this, data, {
          subscription: subscription
        });
      }
    }
    if ('KDAnyEvent' in this.subscriptionsByEvent) {
      _ref1 = this.subscriptionsByEvent.KDAnyEvent;
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        subscription = _ref1[_j];
        subscription.callback.call(subscription.listener, this, data, {
          subscription: subscription
        });
      }
    }
    if (globalEvent) {
      return KD.propagateEvent(KDEventType, this, data);
    }
  };

  KDObject.prototype.removeListener = function(_arg) {
    var count, eventType, listener, subscriptionList, subscriptionListCopy, _i, _len, _ref, _results;
    listener = _arg.listener;
    _ref = this.subscriptionCountByListenerId[listener];
    _results = [];
    for (eventType in _ref) {
      count = _ref[eventType];
      subscriptionList = this.subscriptionsByEvent[eventType];
      _i = 0;
      subscriptionListCopy = subscriptionList.slice(0);
      _len = subscriptionListCopy.length;
      while (count > 0 && _i < _len) {
        if (subscriptionListCopy[_i].listener === listener) {
          subscriptionList.splice(_i, 1);
          count--;
        }
        _i++;
      }
      _results.push(subscriptionCountByListenerId[listener][eventType] = 0);
    }
    return _results;
  };

  KDObject.prototype.requireLogin = KD.requireLogin;

  KDObject.prototype.registerKDObjectInstance = function() {
    return KD.registerInstance(this);
  };

  KDObject.prototype.setData = function(data) {
    if (data != null) {
      return this.data = data;
    }
  };

  KDObject.prototype.getData = function() {
    return this.data;
  };

  KDObject.prototype.setOptions = function(options) {
    return this.options = options != null ? options : {};
  };

  KDObject.prototype.setOption = function(option, value) {
    return this.options[option] = value;
  };

  KDObject.prototype.unsetOption = function(option) {
    if (this.options[option]) {
      return delete this.options[option];
    }
  };

  KDObject.prototype.getOptions = function() {
    return this.options;
  };

  KDObject.prototype.changeId = function(id) {
    KD.deleteInstance(this);
    this.id = id;
    return KD.registerInstance(this);
  };

  KDObject.prototype.getId = function() {
    return this.id;
  };

  KDObject.prototype.setDelegate = function(anInstance) {
    return this.delegate = anInstance;
  };

  KDObject.prototype.getDelegate = function() {
    return this.delegate;
  };

  KDObject.prototype.destroy = function() {
    var id, obj, _i, _len, _ref;
    this.emit('KDObjectWillBeDestroyed');
    KD.removeSubscriptions(this);
    _ref = this.listeningTo;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      obj = _ref[_i];
      obj.removeListener({
        listener: this
      });
    }
    id = this.id;
    return KD.deleteInstance(id);
  };

  return KDObject;

})(KDEventEmitter);

var KDView,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

KDView = (function(_super) {
  var defineProperty, deprecated, eventNames, eventToMethodMap, overrideAndMergeObjects;

  __extends(KDView, _super);

  defineProperty = Object.defineProperty;

  deprecated = function(methodName) {
    return warn("" + methodName + " is deprecated from KDView if you need it override in your subclass");
  };

  eventNames = /^((dbl)?click|key(up|down|press)|mouse(up|down|over|enter|leave|move)|drag(start|end|enter|leave|over)|blur|change|focus|drop|contextmenu|scroll|paste|error)$/;

  eventToMethodMap = function() {
    return {
      dblclick: "dblClick",
      keyup: "keyUp",
      keydown: "keyDown",
      keypress: "keyPress",
      mouseup: "mouseUp",
      mousedown: "mouseDown",
      mouseenter: "mouseEnter",
      mouseleave: "mouseLeave",
      mousemove: "mouseMove",
      contextmenu: "contextMenu",
      dragstart: "dragStart",
      dragenter: "dragEnter",
      dragleave: "dragLeave",
      dragover: "dragOver"
    };
  };

  overrideAndMergeObjects = function(objects) {
    var item, title, _ref;
    _ref = objects.overridden;
    for (title in _ref) {
      if (!__hasProp.call(_ref, title)) continue;
      item = _ref[title];
      if (objects.overrider[title]) {
        continue;
      }
      objects.overrider[title] = item;
    }
    return objects.overrider;
  };

  KDView.appendToDOMBody = function(view) {
    $("body").append(view.$());
    view.parentIsInDom = true;
    return view.emit("viewAppended", view);
  };

  function KDView(options, data) {
    var o,
      _this = this;
    if (options == null) {
      options = {};
    }
    o = options;
    o.tagName || (o.tagName = "div");
    o.domId || (o.domId = null);
    o.cssClass || (o.cssClass = "");
    o.parent || (o.parent = null);
    o.partial || (o.partial = null);
    o.pistachio || (o.pistachio = null);
    o.delegate || (o.delegate = null);
    o.bind || (o.bind = "");
    o.draggable || (o.draggable = null);
    o.droppable || (o.droppable = null);
    o.size || (o.size = null);
    o.position || (o.position = null);
    o.attributes || (o.attributes = null);
    o.prefix || (o.prefix = "");
    o.suffix || (o.suffix = "");
    o.tooltip || (o.tooltip = null);
    o.resizable || (o.resizable = null);
    KDView.__super__.constructor.call(this, o, data);
    if (data != null) {
      if (typeof data.on === "function") {
        data.on('update', function() {
          return _this.render();
        });
      }
    }
    this.setInstanceVariables(options);
    this.defaultInit(options, data);
    if (location.hostname === "localhost") {
      this.listenTo({
        KDEventTypes: "click",
        listenedToInstance: this,
        callback: function(publishingInstance, event) {
          if (event.metaKey && event.altKey && event.ctrlKey) {
            log(_this.getData());
            if (typeof event.stopPropagation === "function") {
              event.stopPropagation();
            }
            if (typeof event.preventDefault === "function") {
              event.preventDefault();
            }
            return false;
          } else if (event.altKey && (event.metaKey || event.ctrlKey)) {
            log(_this);
            return false;
          }
        }
      });
    }
    this.on('childAppended', this.childAppended.bind(this));
    this.on('viewAppended', function() {
      var child, key, subViews, type, _i, _len, _results, _results1;
      _this.setViewReady();
      _this.viewAppended();
      _this.childAppended(_this);
      _this.parentIsInDom = true;
      subViews = _this.getSubViews();
      type = $.type(subViews);
      if (type === "array") {
        _results = [];
        for (_i = 0, _len = subViews.length; _i < _len; _i++) {
          child = subViews[_i];
          if (!child.parentIsInDom) {
            child.parentIsInDom = true;
            _results.push(child.emit('viewAppended', child));
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      } else if (type === "object") {
        _results1 = [];
        for (key in subViews) {
          child = subViews[key];
          if (!child.parentIsInDom) {
            child.parentIsInDom = true;
            _results1.push(child.emit('viewAppended', child));
          } else {
            _results1.push(void 0);
          }
        }
        return _results1;
      }
    });
  }

  KDView.prototype.setTemplate = function(tmpl) {
    this.template = new Pistachio(this, tmpl);
    this.updatePartial(this.template.html);
    return this.template.embedSubViews();
  };

  KDView.prototype.pistachio = function(tmpl) {
    return "" + this.options.prefix + tmpl + this.options.suffix;
  };

  KDView.prototype.setParent = function(parent) {
    if (this.parent != null) {
      console.log("view:", this, "parent:", this.parent);
      return error('View already has a parent');
    } else {
      if (defineProperty) {
        return defineProperty(this, 'parent', {
          value: parent,
          configurable: true
        });
      } else {
        return this.parent = parent;
      }
    }
  };

  KDView.prototype.unsetParent = function() {
    return delete this.parent;
  };

  KDView.prototype.embedChild = function(placeholderId, child, isCustom) {
    var $child;
    if (!isCustom) {
      $child = child.$().attr('id', child.id);
      this.$('#' + placeholderId).replaceWith($child);
    } else {
      this.$('#' + placeholderId).append(child.$());
    }
    child.setParent(this);
    this.subViews.push(child);
    return child.emit('viewAppended', child);
  };

  KDView.prototype.getTagName = function() {
    return this.options.tagName || 'div';
  };

  KDView.prototype.render = function() {
    if (this.template != null) {
      return this.template.update();
    }
  };

  KDView.prototype.setInstanceVariables = function(options) {
    this.domId = options.domId, this.parent = options.parent;
    return this.subViews = [];
  };

  KDView.prototype.defaultInit = function(options, data) {
    this.setDomElement(options.cssClass);
    this.setDataId();
    if (options.domId) {
      this.setDomId(options.domId);
    }
    if (options.attributes) {
      this.setDomAttributes(options.attributes);
    }
    if (options.size) {
      this.setSize(options.size);
    }
    if (options.position) {
      this.setPosition(options.position);
    }
    if (options.partial) {
      this.setPartial(options.partial);
    }
    this.addEventHandlers(options);
    if (options.pistachio) {
      this.setTemplate(options.pistachio);
      this.template.update();
    }
    if (options.lazyLoadThreshold) {
      this.setLazyLoader(options.lazyLoadThreshold);
    }
    if (options.tooltip) {
      this.setTooltip(options.tooltip);
    }
    if (options.draggable) {
      this.setDraggable(options.draggable);
    }
    return this.bindEvents();
  };

  KDView.prototype.getDomId = function() {
    return this.domElement.attr("id");
  };

  KDView.prototype.setDomElement = function(cssClass) {
    cssClass = cssClass ? " " + cssClass : "";
    return this.domElement = $("<" + this.options.tagName + " class='kdview" + cssClass + "'></" + this.options.tagName + " >");
  };

  KDView.prototype.setDomId = function(id) {
    return this.domElement.attr("id", id);
  };

  KDView.prototype.setDataId = function() {
    return this.domElement.data("data-id", this.getId());
  };

  KDView.prototype.setDomAttributes = function(attributes) {
    return this.domElement.attr(attributes);
  };

  KDView.prototype.isInDom = (function() {
    var findUltimateAncestor;
    findUltimateAncestor = function(el) {
      var ancestor;
      ancestor = el;
      while (ancestor.parentNode) {
        ancestor = ancestor.parentNode;
      }
      return ancestor;
    };
    return function() {
      return findUltimateAncestor(this.$()[0]).body != null;
    };
  })();

  KDView.prototype.getDomElement = function() {
    return this.domElement;
  };

  KDView.prototype.getElement = function() {
    return this.getDomElement()[0];
  };

  KDView.prototype.$ = function(selector) {
    if (selector != null) {
      return this.getDomElement().find(selector);
    } else {
      return this.getDomElement();
    }
  };

  KDView.prototype.append = function(child, selector) {
    this.$(selector).append(child.$());
    if (this.parentIsInDom) {
      child.emit('viewAppended', child);
    }
    return this;
  };

  KDView.prototype.appendTo = function(parent, selector) {
    this.$().appendTo(parent.$(selector));
    if (this.parentIsInDom) {
      this.emit('viewAppended', this);
    }
    return this;
  };

  KDView.prototype.prepend = function(child, selector) {
    this.$(selector).prepend(child.$());
    if (this.parentIsInDom) {
      child.emit('viewAppended', child);
    }
    return this;
  };

  KDView.prototype.prependTo = function(parent, selector) {
    this.$().prependTo(parent.$(selector));
    if (this.parentIsInDom) {
      this.emit('viewAppended', this);
    }
    return this;
  };

  KDView.prototype.setPartial = function(partial, selector) {
    this.$(selector).append(partial);
    return this;
  };

  KDView.prototype.updatePartial = function(partial, selector) {
    return this.$(selector).html(partial);
  };

  KDView.prototype.setClass = function(cssClass) {
    this.$().addClass(cssClass);
    return this;
  };

  KDView.prototype.unsetClass = function(cssClass) {
    this.$().removeClass(cssClass);
    return this;
  };

  KDView.prototype.toggleClass = function(cssClass) {
    this.$().toggleClass(cssClass);
    return this;
  };

  KDView.prototype.getBounds = function() {
    var bounds;
    return bounds = {
      x: this.getX(),
      y: this.getY(),
      w: this.getWidth(),
      h: this.getHeight(),
      n: this.constructor.name
    };
  };

  KDView.prototype.setRandomBG = function() {
    return this.getDomElement().css("background-color", __utils.getRandomRGB());
  };

  KDView.prototype.hide = function(duration) {
    return this.setClass('hidden');
  };

  KDView.prototype.show = function(duration) {
    return this.unsetClass('hidden');
  };

  KDView.prototype.setSize = function(sizes) {
    if (sizes.width != null) {
      this.setWidth(sizes.width);
    }
    if (sizes.height != null) {
      return this.setHeight(sizes.height);
    }
  };

  KDView.prototype.setPosition = function() {
    var positionOptions;
    positionOptions = this.getOptions().position;
    positionOptions.position = "absolute";
    return this.$().css(positionOptions);
  };

  KDView.prototype.getWidth = function() {
    var w;
    return w = this.getDomElement().width();
  };

  KDView.prototype.setWidth = function(w) {
    this.getDomElement()[0].style.width = "" + w + "px";
    return this.emit("ViewResized", {
      newWidth: w
    });
  };

  KDView.prototype.getHeight = function() {
    return this.getDomElement().outerHeight(false);
  };

  KDView.prototype.setHeight = function(h) {
    this.getDomElement()[0].style.height = "" + h + "px";
    return this.emit("ViewResized", {
      newHeight: h
    });
  };

  KDView.prototype.getX = function() {
    return this.getDomElement().offset().left;
  };

  KDView.prototype.getRelativeX = function() {
    return this.$().position().left;
  };

  KDView.prototype.setX = function(x) {
    return this.$().css({
      left: x
    });
  };

  KDView.prototype.getY = function() {
    return this.getDomElement().offset().top;
  };

  KDView.prototype.getRelativeY = function() {
    return this.getDomElement().position().top;
  };

  KDView.prototype.setY = function(y) {
    return this.$().css({
      top: y
    });
  };

  KDView.prototype.destroy = function() {
    if (this.getSubViews().length > 0) {
      this.destroySubViews();
    }
    if (this.parent && (this.parent.subViews != null)) {
      this.parent.removeSubView(this);
    }
    this.getDomElement().remove();
    if (this.$overlay != null) {
      this.removeOverlay();
    }
    return KDView.__super__.destroy.call(this);
  };

  KDView.prototype.destroySubViews = function() {
    var subView, _i, _len, _ref, _results;
    _ref = this.getSubViews().slice();
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      subView = _ref[_i];
      if (subView instanceof KDView) {
        _results.push(subView != null ? typeof subView.destroy === "function" ? subView.destroy() : void 0 : void 0);
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };

  KDView.prototype.addSubView = function(subView, selector, shouldPrepend) {
    var index, _base, _name,
      _this = this;
    if (subView == null) {
      throw new Error('no subview was specified');
    }
    if (subView.parent && subView.parent instanceof KDView) {
      index = subView.parent.subViews.indexOf(subView);
      if (index > -1) {
        subView.parent.subViews.splice(index, 1);
      }
    }
    this.subViews.push(subView);
    subView.setParent(this);
    subView.parentIsInDom = this.parentIsInDom;
    if (shouldPrepend) {
      this.prepend(subView, selector);
    } else {
      this.append(subView, selector);
    }
    subView.on("ViewResized", function() {
      return subView.parentDidResize();
    });
    if (this.template != null) {
      if (typeof (_base = this.template)[_name = "" + (shouldPrepend ? 'prepend' : 'append') + "Child"] === "function") {
        _base[_name](subView);
      }
    }
    return subView;
  };

  KDView.prototype.getSubViews = function() {
    /*
        FIX: NEEDS REFACTORING
        used in @destroy
        not always sub views stored in @subviews but in @items, @itemsOrdered etc
        see KDListView KDTreeView etc. and fix it.
    */

    var subViews;
    subViews = this.subViews;
    if (this.items != null) {
      subViews = subViews.concat([].slice.call(this.items));
    }
    return subViews;
  };

  KDView.prototype.removeSubView = function(subViewInstance) {
    var i, subView, _i, _len, _ref, _results;
    _ref = this.subViews;
    _results = [];
    for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
      subView = _ref[i];
      if (subViewInstance === subView) {
        this.subViews.splice(i, 1);
        subViewInstance.getDomElement().detach();
        subViewInstance.unsetParent();
        _results.push(subViewInstance.handleEvent({
          type: "viewRemoved"
        }));
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };

  KDView.prototype.parentDidResize = function(parent, event) {
    var subView, _i, _len, _ref, _results;
    if (this.getSubViews()) {
      _ref = this.getSubViews();
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        subView = _ref[_i];
        _results.push(subView.parentDidResize(parent, event));
      }
      return _results;
    }
  };

  KDView.prototype.setLazyLoader = function(threshold) {
    if (threshold == null) {
      threshold = .75;
    }
    if (!/\bscroll\b/.test(this.getOptions().bind)) {
      this.getOptions().bind += ' scroll';
    }
    return this.listenTo({
      KDEventTypes: 'scroll',
      listenedToInstance: this,
      callback: (function() {
        var lastRatio;
        lastRatio = 0;
        return function(publishingInstance, event) {
          var el, ratio;
          el = this.$()[0];
          ratio = (el.scrollTop + this.getHeight()) / el.scrollHeight;
          if (ratio > lastRatio && ratio > threshold) {
            this.handleEvent({
              type: 'LazyLoadThresholdReached',
              ratio: ratio
            });
          }
          return lastRatio = ratio;
        };
      })()
    });
  };

  KDView.prototype.bindEvents = function($elm) {
    var defaultEvents, event, eventsToBeBound, instanceEvents,
      _this = this;
    $elm || ($elm = this.getDomElement());
    defaultEvents = "mousedown mouseup click dblclick";
    instanceEvents = this.getOptions().bind;
    eventsToBeBound = (function() {
      var _i, _len;
      if (instanceEvents) {
        eventsToBeBound = defaultEvents.trim().split(" ");
        instanceEvents = instanceEvents.trim().split(" ");
        for (_i = 0, _len = instanceEvents.length; _i < _len; _i++) {
          event = instanceEvents[_i];
          if (__indexOf.call(eventsToBeBound, event) < 0) {
            eventsToBeBound.push(event);
          }
        }
        return eventsToBeBound.join(" ");
      } else {
        return defaultEvents;
      }
    })();
    $elm.bind(eventsToBeBound, function(event) {
      var willPropagateToDOM;
      willPropagateToDOM = _this.handleEvent(event);
      if (!willPropagateToDOM) {
        event.stopPropagation();
      }
      return true;
    });
    return eventsToBeBound;
  };

  KDView.prototype.handleEvent = function(event) {
    var methodName, result, willPropagateToDOM;
    methodName = eventToMethodMap()[event.type] || event.type;
    result = this[methodName] != null ? this[methodName](event) : true;
    if (result !== false) {
      this.emit(event.type, event);
      this.propagateEvent({
        KDEventType: event.type.capitalize()
      }, event);
      this.propagateEvent({
        KDEventType: (this.inheritanceChain({
          method: "constructor.name",
          callback: this.chainNames
        })).replace(/\.|$/g, "" + (event.type.capitalize()) + "."),
        globalEvent: true
      }, event);
    }
    return willPropagateToDOM = result;
  };

  KDView.prototype.scroll = function(event) {
    return true;
  };

  KDView.prototype.error = function(event) {
    return true;
  };

  KDView.prototype.keyUp = function(event) {
    return true;
  };

  KDView.prototype.keyDown = function(event) {
    return true;
  };

  KDView.prototype.keyPress = function(event) {
    return true;
  };

  KDView.prototype.dblClick = function(event) {
    return true;
  };

  KDView.prototype.click = function(event) {
    return true;
  };

  KDView.prototype.contextMenu = function(event) {
    return true;
  };

  KDView.prototype.mouseMove = function(event) {
    return true;
  };

  KDView.prototype.mouseEnter = function(event) {
    return true;
  };

  KDView.prototype.mouseLeave = function(event) {
    return true;
  };

  KDView.prototype.mouseUp = function(event) {
    return true;
  };

  KDView.prototype.mouseDown = function(event) {
    (this.getSingleton("windowController")).setKeyView(null);
    return true;
  };

  KDView.prototype.dragEnter = function(e) {
    e.preventDefault();
    return e.stopPropagation();
  };

  KDView.prototype.dragOver = function(e) {
    e.preventDefault();
    return e.stopPropagation();
  };

  KDView.prototype.dragLeave = function(e) {
    e.preventDefault();
    return e.stopPropagation();
  };

  KDView.prototype.drop = function(event) {
    event.preventDefault();
    return event.stopPropagation();
  };

  KDView.prototype.submit = function(event) {
    return false;
  };

  KDView.prototype.addEventHandlers = function(options) {
    var key, value, _results;
    _results = [];
    for (key in options) {
      value = options[key];
      if (eventNames.test(key)) {
        _results.push(this.listenTo({
          KDEventTypes: key,
          listenedToInstance: this,
          callback: value
        }));
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };

  KDView.prototype.setDraggable = function(options) {
    var handle,
      _this = this;
    if (options == null) {
      options = {};
    }
    if (options === true) {
      options = {};
    }
    this.dragState = {
      containment: options.containment,
      handle: options.handle,
      axis: options.axis
    };
    handle = options.handle && options.handle instanceof KDView ? handle : this;
    return handle.on("mousedown", function(event) {
      var bottom, left, right, top;
      if ("string" === typeof options.handle) {
        if ($(event.target).closest(options.handle).length === 0) {
          return;
        }
      }
      _this.dragIsAllowed = true;
      top = parseInt(_this.$()[0].style.top, 10);
      right = parseInt(_this.$()[0].style.right, 10);
      bottom = parseInt(_this.$()[0].style.bottom, 10);
      left = parseInt(_this.$()[0].style.left, 10);
      _this.dragState.startX = event.pageX;
      _this.dragState.startY = event.pageY;
      _this.dragState.top = top;
      _this.dragState.right = right;
      _this.dragState.bottom = bottom;
      _this.dragState.left = left;
      _this.dragState.directionX = !isNaN(left) ? "left" : "right";
      _this.dragState.directionY = !isNaN(top) ? "top" : "bottom";
      _this.getSingleton('windowController').setDragView(_this);
      _this.emit("DragStarted", event, _this.dragState);
      event.stopPropagation();
      event.preventDefault();
      return false;
    });
  };

  KDView.prototype.drag = function(event, delta) {
    var axis, directionX, directionY, posX, posY, x, y, _ref;
    _ref = this.dragState, directionX = _ref.directionX, directionY = _ref.directionY, axis = _ref.axis;
    x = delta.x, y = delta.y;
    if (directionY === "bottom") {
      y = -y;
    }
    if (directionX === "right") {
      x = -x;
    }
    posY = this.dragState[directionY] + y;
    posX = this.dragState[directionX] + x;
    if (this.dragIsAllowed) {
      if (axis !== 'y') {
        this.$().css(directionX, posX);
      }
      if (axis !== 'x') {
        this.$().css(directionY, posY);
      }
    }
    return this.emit("DragInAction", x, y);
  };

  KDView.prototype.viewAppended = function() {};

  KDView.prototype.childAppended = function(child) {
    var _ref;
    return (_ref = this.parent) != null ? _ref.emit('childAppended', child) : void 0;
  };

  KDView.prototype.setViewReady = function() {
    return this.viewIsReady = true;
  };

  KDView.prototype.isViewReady = function() {
    return this.viewIsReady || false;
  };

  KDView.prototype.putOverlay = function(options) {
    var animated, color, cssClass, isRemovable, parent,
      _this = this;
    if (options == null) {
      options = {};
    }
    isRemovable = options.isRemovable, cssClass = options.cssClass, parent = options.parent, animated = options.animated, color = options.color;
    if (isRemovable == null) {
      isRemovable = true;
    }
    if (cssClass == null) {
      cssClass = "transparent";
    }
    if (parent == null) {
      parent = "body";
    }
    this.$overlay = $("<div />", {
      "class": "kdoverlay " + cssClass + " " + (animated ? "animated" : void 0)
    });
    if (color) {
      this.$overlay.css({
        "background-color": color
      });
    }
    if ("string" === typeof parent) {
      this.$overlay.appendTo($(parent));
    } else if (parent instanceof KDView) {
      this.__zIndex = parseInt(this.$().css("z-index"), 10) || 0;
      this.$overlay.css("z-index", this.__zIndex + 1);
      this.$overlay.appendTo(parent.$());
    }
    if (animated) {
      this.utils.wait(function() {
        return _this.$overlay.addClass("in");
      });
      this.utils.wait(300, function() {
        return _this.emit("OverlayAdded", _this);
      });
    } else {
      this.emit("OverlayAdded", this);
    }
    if (isRemovable) {
      return this.$overlay.on("click.overlay", this.removeOverlay.bind(this));
    }
  };

  KDView.prototype.removeOverlay = function() {
    var kallback,
      _this = this;
    if (!this.$overlay) {
      return;
    }
    this.emit("OverlayWillBeRemoved");
    kallback = function() {
      _this.$overlay.off("click.overlay");
      _this.$overlay.remove();
      delete _this.__zIndex;
      delete _this.$overlay;
      return _this.emit("OverlayRemoved", _this);
    };
    if (this.$overlay.hasClass("animated")) {
      this.$overlay.removeClass("in");
      return this.utils.wait(300, function() {
        return kallback();
      });
    } else {
      return kallback();
    }
  };

  KDView.prototype.setTooltip = function(o) {
    var placementMap,
      _this = this;
    if (o == null) {
      o = {};
    }
    placementMap = {
      above: "s",
      below: "n",
      left: "e",
      right: "w"
    };
    o.title || (o.title = "");
    o.placement || (o.placement = "above");
    o.offset || (o.offset = 0);
    o.delayIn || (o.delayIn = 300);
    o.html || (o.html = true);
    o.animate || (o.animate = false);
    o.opacity || (o.opacity = 0.9);
    o.selector || (o.selector = null);
    o.engine || (o.engine = "tipsy");
    o.gravity || (o.gravity = placementMap[o.placement]);
    o.fade || (o.fade = o.animate);
    o.fallback || (o.fallback = o.title);
    return this.on("viewAppended", function() {
      return _this.utils.wait(function() {
        return _this.$(o.selector)[o.engine](o);
      });
    });
  };

  KDView.prototype.getTooltip = function(o) {
    if (o == null) {
      o = {};
    }
    o.selector || (o.selector = null);
    return this.$(o.selector)[0].getAttribute("original-title" || this.$(o.selector)[0].getAttribute("title"));
  };

  KDView.prototype.updateTooltip = function(o) {
    if (o == null) {
      o = {};
    }
    o.selector || (o.selector = null);
    o.title || (o.title = "");
    this.$(o.selector)[0].setAttribute("original-title", o.title);
    return this.$(o.selector).tipsy("update");
  };

  KDView.prototype.hideTooltip = function(o) {
    if (o == null) {
      o = {};
    }
    o.selector || (o.selector = null);
    return this.$(o.selector).tipsy("hide");
  };

  KDView.prototype.listenWindowResize = function() {
    return this.getSingleton('windowController').registerWindowResizeListener(this);
  };

  KDView.prototype.notifyResizeListeners = function() {
    return this.getSingleton('windowController').notifyWindowResizeListeners();
  };

  KDView.prototype.setKeyView = function() {
    return this.getSingleton("windowController").setKeyView(this);
  };

  KDView.prototype.getParentDomElement = function() {
    return deprecated("KDView::getParentDomElement");
  };

  return KDView;

})(KDObject);

var JView,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

JView = (function(_super) {

  __extends(JView, _super);

  function JView() {
    return JView.__super__.constructor.apply(this, arguments);
  }

  JView.prototype.viewAppended = function() {
    this.setTemplate(this.pistachio());
    return this.template.update();
  };

  JView.prototype.pistachio = function() {
    return "";
  };

  return JView;

})(KDView);

var KDCustomHTMLView,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

KDCustomHTMLView = (function(_super) {

  __extends(KDCustomHTMLView, _super);

  function KDCustomHTMLView(options, data) {
    var _ref, _ref1, _ref2;
    if (options == null) {
      options = {};
    }
    if (typeof options === "string") {
      this.tagName = options;
    }
    if ((_ref = this.tagName) == null) {
      this.tagName = (_ref1 = options.tagName) != null ? _ref1 : "div";
    }
    if (this.tagName === "a" && !(((_ref2 = options.attributes) != null ? _ref2.href : void 0) != null)) {
      options.attributes = {
        href: "#"
      };
    }
    KDCustomHTMLView.__super__.constructor.apply(this, arguments);
  }

  KDCustomHTMLView.prototype.setDomElement = function(cssClass) {
    return this.domElement = $("<" + this.tagName + "/>", {
      "class": cssClass
    });
  };

  return KDCustomHTMLView;

})(KDView);

var KDScrollThumb, KDScrollView,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

KDScrollView = (function(_super) {

  __extends(KDScrollView, _super);

  function KDScrollView(options, data) {
    options = $.extend({
      ownScrollBars: false,
      bind: "mouseenter"
    }, options);
    KDScrollView.__super__.constructor.call(this, options, data);
    this.setClass("kdscrollview");
  }

  KDScrollView.prototype.bindEvents = function() {
    var _this = this;
    this.getDomElement().bind("scroll mousewheel", function(event, delta, deltaX, deltaY) {
      if (delta) {
        event._delta = {
          delta: delta,
          deltaX: deltaX,
          deltaY: deltaY
        };
      }
      return _this.handleEvent(event);
    });
    return KDScrollView.__super__.bindEvents.apply(this, arguments);
  };

  KDScrollView.prototype.viewAppended = function() {
    return KDScrollView.__super__.viewAppended.apply(this, arguments);
  };

  KDScrollView.prototype.handleEvent = function(event) {
    var superResponse, thisEvent, willPropagateToDOM;
    switch (event.type) {
      case "scroll":
        thisEvent = this.scroll(event);
        break;
      case "mousewheel":
        thisEvent = this.mouseWheel(event);
    }
    superResponse = KDScrollView.__super__.handleEvent.call(this, event);
    thisEvent = thisEvent != null ? thisEvent : superResponse;
    return willPropagateToDOM = thisEvent;
  };

  KDScrollView.prototype.hasScrollBars = function() {
    return this.getScrollHeight() > this.getHeight();
  };

  KDScrollView.prototype.getScrollHeight = function() {
    return this.$()[0].scrollHeight;
  };

  KDScrollView.prototype.getScrollWidth = function() {
    return this.$()[0].scrollWidth;
  };

  KDScrollView.prototype.getScrollTop = function() {
    return this.$().scrollTop();
  };

  KDScrollView.prototype.getScrollLeft = function() {
    return this.$().scrollLeft();
  };

  KDScrollView.prototype.scrollTo = function(_arg, callback) {
    var duration, left, top;
    top = _arg.top, left = _arg.left, duration = _arg.duration;
    top || (top = 0);
    left || (left = 0);
    duration || (duration = null);
    if (duration) {
      return this.$().animate({
        scrollTop: top,
        scrollLeft: left
      }, duration, function() {
        return typeof callback === "function" ? callback() : void 0;
      });
    } else {
      this.$().scrollTop(top);
      this.$().scrollLeft(left);
      return typeof callback === "function" ? callback() : void 0;
    }
  };

  KDScrollView.prototype.scrollToSubView = function(subView) {
    var subViewHeight, subViewRelTop, subViewTop, viewHeight, viewScrollTop, viewTop;
    viewTop = this.getY();
    viewHeight = this.getHeight();
    viewScrollTop = this.getScrollTop();
    subViewTop = subView.getY();
    subViewHeight = subView.getHeight();
    subViewRelTop = subViewTop - viewTop + viewScrollTop;
    if (subViewTop - viewTop + subViewHeight < viewHeight && subViewTop - viewTop >= 0) {

    } else if (subViewTop - viewTop < 0) {
      return this.scrollTo({
        top: subViewRelTop
      });
    } else if (subViewTop - viewTop + subViewHeight > viewHeight) {
      return this.scrollTo({
        top: subViewRelTop - viewHeight + subViewHeight
      });
    }
  };

  KDScrollView.prototype.fractionOfHeightBelowFold = function(_arg) {
    var scrollViewGlobalOffset, view, viewGlobalOffset, viewHeight, viewOffsetFromScrollView;
    view = _arg.view;
    viewHeight = view.getHeight();
    viewGlobalOffset = view.$().offset().top;
    scrollViewGlobalOffset = this.$().offset().top;
    viewOffsetFromScrollView = viewGlobalOffset - scrollViewGlobalOffset;
    return (viewHeight + viewOffsetFromScrollView - this.getHeight()) / this.getHeight();
  };

  KDScrollView.prototype.mouseWheel = function(event) {
    var direction;
    if ($(event.target).attr("data-id") === this.getId() && this.ownScrollBars) {
      direction = event._delta.delta > 0 ? "up" : "down";
      this._scrollUponVelocity(event._delta.delta, direction);
      return false;
    }
    return (this.getSingleton("windowController")).scrollingEnabled;
  };

  KDScrollView.prototype._scrollUponVelocity = function(velocity, direction) {
    var actInnerPosition, newInnerPosition, stepInPixels;
    log(direction, velocity, this.getScrollHeight());
    stepInPixels = velocity * 50;
    actInnerPosition = this.$().scrollTop();
    newInnerPosition = stepInPixels + actInnerPosition;
    log(stepInPixels, actInnerPosition, newInnerPosition);
    return this.$().scrollTop(newInnerPosition);
  };

  KDScrollView.prototype._createScrollBars = function() {
    log("has-own-scrollbars");
    this.setClass("has-own-scrollbars");
    this.addSubView(this._vTrack = new KDView({
      cssClass: 'kdscrolltrack ver',
      delegate: this
    }));
    this._vTrack.setRandomBG();
    this._vTrack.addSubView(this._vThumb = new KDScrollThumb({
      cssClass: 'kdscrollthumb',
      type: "vertical",
      delegate: this._vTrack
    }));
    this.scrollBarsCreated = true;
    return this.ownScrollBars = true;
  };

  return KDScrollView;

})(KDView);

KDScrollThumb = (function(_super) {

  __extends(KDScrollThumb, _super);

  function KDScrollThumb(options, data) {
    this._calculatePosition = __bind(this._calculatePosition, this);
    options = $.extend({
      type: "vertical"
    }, options);
    KDScrollThumb.__super__.constructor.call(this, options, data);
    this._track = this.getDelegate();
    this._view = this._track.getDelegate();
    this.on("viewAppended", this._calculateSize.bind(this));
    this.listenTo({
      KDEventTypes: "scroll",
      listenedToInstance: this._view,
      callback: this._calculatePosition
    });
  }

  KDScrollThumb.prototype.isDraggable = function() {
    return true;
  };

  KDScrollThumb.prototype.dragOptions = function() {
    var dragOptions, o;
    o = this.getOptions();
    dragOptions = {
      drag: this._drag,
      containment: "parent"
    };
    if (o.type = "vertical") {
      dragOptions.axis = "y";
    } else {
      dragOptions.axis = "x";
    }
    return dragOptions;
  };

  KDScrollThumb.prototype._drag = function() {
    return log("dragged");
  };

  KDScrollThumb.prototype._setSize = function(size) {
    var o;
    o = this.getOptions();
    if (o.type = "vertical") {
      return this.setHeight(size);
    } else {
      return this.setWidth(size);
    }
  };

  KDScrollThumb.prototype._setOffset = function(offset) {
    var o;
    o = this.getOptions();
    if (o.type = "vertical") {
      return this.$().css({
        "marginTop": offset
      });
    } else {
      return this.$().css({
        "marginLeft": offset
      });
    }
  };

  KDScrollThumb.prototype._calculateSize = function() {
    var o;
    o = this.getOptions();
    if (o.type = "vertical") {
      this._trackSize = this._view.getHeight();
      this._scrollSize = this._view.getScrollHeight();
      this._thumbMargin = this.getY() - this._track.getY();
    } else {
      this._scrollSize = this.parent.parent.getScrollWidth();
      this._thumbMargin = this.getX() - this._track.getX();
      this._trackSize = this.parent.getWidth();
    }
    log(this._trackSize, this._scrollSize);
    if (this._trackSize >= this._scrollSize) {
      this._track.hide();
    }
    this._thumbRatio = this._trackSize / this._scrollSize;
    this._thumbSize = this._trackSize * this._thumbRatio - 2 * this._thumbMargin;
    return this._setSize(this._thumbSize);
  };

  KDScrollThumb.prototype._calculatePosition = function() {
    var thumbTopOffset, viewScrollTop;
    viewScrollTop = this._view.$().scrollTop();
    thumbTopOffset = viewScrollTop * this._thumbRatio + this._thumbMargin;
    return this._setOffset(thumbTopOffset);
  };

  return KDScrollThumb;

})(KDView);

var KDRouter,
  __hasProp = {}.hasOwnProperty;

KDRouter = (function() {
  var changeRoute, getHashFragment, handleNotFound, listenerKey, tree;

  function KDRouter() {}

  listenerKey = 'ಠ_ಠ';

  tree = {};

  getHashFragment = function(url) {
    return url.substr(url.indexOf('#'));
  };

  handleNotFound = function(route) {
    return typeof this.handleNotFound === "function" ? this.handleNotFound(route) : void 0;
  };

  changeRoute = function(frag) {
    var edge, listener, listeners, node, param, params, _i, _j, _len, _len1, _results;
    node = tree;
    params = {};
    frag = frag.split('/');
    frag.shift();
    for (_i = 0, _len = frag.length; _i < _len; _i++) {
      edge = frag[_i];
      if (node[edge]) {
        node = node[edge];
      } else {
        param = node[':'];
        if (param != null) {
          params[param.name] = edge;
          node = param;
        } else {
          handleNotFound(frag.join('/'));
        }
      }
    }
    listeners = node[listenerKey];
    if (listeners != null ? listeners.length : void 0) {
      _results = [];
      for (_j = 0, _len1 = listeners.length; _j < _len1; _j++) {
        listener = listeners[_j];
        _results.push(listener.call(null, params));
      }
      return _results;
    }
  };

  window.addEventListener('hashchange', function(event) {
    return changeRoute(getHashFragment(event.newURL));
  });

  KDRouter.init = function() {
    if (location.hash.length) {
      return changeRoute(location.hash.substr(1));
    }
  };

  KDRouter.handleNotFound = function() {
    return console.log("The route " + route + " was not found!");
  };

  KDRouter.addRoutes = function(routes) {
    var listener, route, _results;
    _results = [];
    for (route in routes) {
      if (!__hasProp.call(routes, route)) continue;
      listener = routes[route];
      _results.push(this.addRoute(route, listener));
    }
    return _results;
  };

  KDRouter.addRoute = function(route, listener) {
    var edge, node, _i, _len;
    node = tree;
    route = route.split('/');
    route.shift();
    for (_i = 0, _len = route.length; _i < _len; _i++) {
      edge = route[_i];
      if (/^:/.test(edge)) {
        node[':'] || (node[':'] = {
          name: edge.substr(1)
        });
        node = node[':'];
      } else {
        node[edge] || (node[edge] = {});
        node = node[edge];
      }
    }
    node[listenerKey] || (node[listenerKey] = []);
    return node[listenerKey].push(listener);
  };

  return KDRouter;

})();

var KDController,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

KDController = (function(_super) {

  __extends(KDController, _super);

  function KDController() {
    return KDController.__super__.constructor.apply(this, arguments);
  }

  return KDController;

})(KDObject);

/*
todo:

  - make addLayer implementation more clear, by default adding a layer
    should set a listener for next ReceivedClickElsewhere and remove the layer automatically
    2012/5/21 Sinan
*/

var KDWindowController,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

KDWindowController = (function(_super) {

  __extends(KDWindowController, _super);

  KDWindowController.keyViewHistory = [];

  function KDWindowController(options, data) {
    this.key = __bind(this.key, this);
    this.windowResizeListeners = {};
    this.keyView;
    this.dragView;
    this.scrollingEnabled = true;
    this.bindEvents();
    this.setWindowProperties();
    KDWindowController.__super__.constructor.apply(this, arguments);
  }

  KDWindowController.prototype.addLayer = function(layer) {
    var _this = this;
    if (__indexOf.call(this.layers, layer) < 0) {
      this.layers.push(layer);
      return layer.on('KDObjectWillBeDestroyed', function() {
        return _this.removeLayer(layer);
      });
    }
  };

  KDWindowController.prototype.removeLayer = function(layer) {
    var index;
    if (__indexOf.call(this.layers, layer) >= 0) {
      index = this.layers.indexOf(layer);
      return this.layers.splice(index, 1);
    }
  };

  KDWindowController.prototype.bindEvents = function() {
    var layers,
      _this = this;
    $(window).bind("keydown keyup keypress", this.key);
    $(window).bind("resize", function(event) {
      _this.setWindowProperties(event);
      return _this.notifyWindowResizeListeners(event);
    });
    document.body.addEventListener("dragenter", function(event) {
      if (!_this.dragInAction) {
        _this.propagateEvent({
          KDEventType: 'DragEnterOnWindow'
        }, event);
        return _this.setDragInAction(true);
      }
    }, true);
    document.body.addEventListener("dragleave", function(event) {
      var _ref, _ref1;
      if (!((0 < (_ref = event.clientX) && _ref < _this.winWidth) && (0 < (_ref1 = event.clientY) && _ref1 < _this.winHeight))) {
        _this.propagateEvent({
          KDEventType: 'DragExitOnWindow'
        }, event);
        return _this.setDragInAction(false);
      }
    }, true);
    document.body.addEventListener("drop", function(event) {
      _this.propagateEvent({
        KDEventType: 'DragExitOnWindow'
      }, event);
      _this.propagateEvent({
        KDEventType: 'DropOnWindow'
      }, event);
      return _this.setDragInAction(false);
    }, true);
    this.layers = layers = [];
    document.body.addEventListener('mousedown', function(e) {
      var lastLayer;
      $('.twipsy').remove();
      lastLayer = layers[layers.length - 1];
      if (lastLayer && $(e.target).closest(lastLayer != null ? lastLayer.$() : void 0).length === 0) {
        lastLayer.emit('ReceivedClickElsewhere', e);
        return _this.removeLayer(lastLayer);
      }
    }, true);
    document.body.addEventListener('mouseup', function(e) {
      if (_this.dragView) {
        _this.unsetDragView(e);
      }
      return _this.emit('ReceivedMouseUpElsewhere', e);
    }, true);
    document.body.addEventListener('mousemove', function(e) {
      if (_this.dragView) {
        return _this.redirectMouseMoveEvent(e);
      }
    }, true);
    return window.onbeforeunload = function(event) {
      var msg, pane, _i, _len, _ref, _ref1, _ref2;
      if ((_ref = _this.getSingleton('mainView')) != null ? (_ref1 = _ref.mainTabView) != null ? _ref1.panes : void 0 : void 0) {
        _ref2 = _this.getSingleton('mainView').mainTabView.panes;
        for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
          pane = _ref2[_i];
          if (pane.getOptions().type === "application" && pane.getOptions().name !== "New Tab") {
            event || (event = window.event);
            msg = "Please make sure that you saved all your work.";
            if (event) {
              event.returnValue = msg;
            }
            return msg;
          }
        }
      }
    };
  };

  KDWindowController.prototype.setDragInAction = function(action) {
    if (action == null) {
      action = false;
    }
    $('body')[action ? "addClass" : "removeClass"]("dragInAction");
    return this.dragInAction = action;
  };

  KDWindowController.prototype.setMainView = function(view) {
    return this.mainView = view;
  };

  KDWindowController.prototype.getMainView = function(view) {
    return this.mainView;
  };

  KDWindowController.prototype.revertKeyView = function(view) {
    if (!view) {
      warn("you must pass the view as a param, which doesn't want to be keyview anymore!");
      return;
    }
    if (view === this.keyView && this.keyView !== this.oldKeyView) {
      return this.setKeyView(this.oldKeyView);
    }
  };

  KDWindowController.prototype.setKeyView = function(newKeyView) {
    if (newKeyView === this.keyView) {
      return;
    }
    this.oldKeyView = this.keyView;
    this.keyView = newKeyView;
    this.constructor.keyViewHistory.push(newKeyView);
    if (newKeyView != null) {
      newKeyView.emit('KDViewBecameKeyView');
    }
    return this.emit('WindowChangeKeyView', newKeyView);
  };

  KDWindowController.prototype.setDragView = function(dragView) {
    this.setDragInAction(true);
    return this.dragView = dragView;
  };

  KDWindowController.prototype.unsetDragView = function(e) {
    this.setDragInAction(false);
    this.dragView.emit("DragFinished", e, this.dragState);
    return this.dragView = null;
  };

  KDWindowController.prototype.redirectMouseMoveEvent = function(event) {
    var delta, pageX, pageY, startX, startY, view, _ref;
    view = this.dragView;
    pageX = event.pageX, pageY = event.pageY;
    _ref = view.dragState, startX = _ref.startX, startY = _ref.startY;
    delta = {
      x: pageX - startX,
      y: pageY - startY
    };
    return view.drag(event, delta);
  };

  KDWindowController.prototype.getKeyView = function() {
    return this.keyView;
  };

  KDWindowController.prototype.key = function(event) {
    var _ref;
    return (_ref = this.keyView) != null ? _ref.handleEvent(event) : void 0;
  };

  KDWindowController.prototype.allowScrolling = function(shouldAllowScrolling) {
    return this.scrollingEnabled = shouldAllowScrolling;
  };

  KDWindowController.prototype.registerWindowResizeListener = function(instance) {
    var _this = this;
    this.windowResizeListeners[instance.id] = instance;
    return instance.on("KDObjectWillBeDestroyed", function() {
      return delete _this.windowResizeListeners[instance.id];
    });
  };

  KDWindowController.prototype.setWindowProperties = function(event) {
    this.winWidth = $(window).width();
    return this.winHeight = $(window).height();
  };

  KDWindowController.prototype.notifyWindowResizeListeners = function(event, throttle, duration) {
    var instance, key, _ref, _results,
      _this = this;
    if (throttle == null) {
      throttle = false;
    }
    if (duration == null) {
      duration = 17;
    }
    event || (event = {
      type: "resize"
    });
    if (throttle) {
      if (this.resizeNotifiersTimer) {
        clearTimeout(this.resizeNotifiersTimer);
      }
      return this.resizeNotifiersTimer = setTimeout(function() {
        var instance, key, _ref, _results;
        _ref = _this.windowResizeListeners;
        _results = [];
        for (key in _ref) {
          instance = _ref[key];
          _results.push(typeof instance._windowDidResize === "function" ? instance._windowDidResize(event) : void 0);
        }
        return _results;
      }, duration);
    } else {
      _ref = this.windowResizeListeners;
      _results = [];
      for (key in _ref) {
        instance = _ref[key];
        _results.push(typeof instance._windowDidResize === "function" ? instance._windowDidResize(event) : void 0);
      }
      return _results;
    }
  };

  return KDWindowController;

})(KDController);

var KDViewController,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

KDViewController = (function(_super) {

  __extends(KDViewController, _super);

  function KDViewController() {
    KDViewController.__super__.constructor.apply(this, arguments);
    if (this.getOptions().view != null) {
      this.setView(this.getOptions().view);
    }
  }

  KDViewController.prototype.loadView = function(mainView) {};

  KDViewController.prototype.getView = function() {
    return this.mainView;
  };

  KDViewController.prototype.setView = function(aViewInstance) {
    var cb,
      _this = this;
    this.mainView = aViewInstance;
    cb = this.loadView.bind(this, aViewInstance);
    if (aViewInstance.isViewReady()) {
      return cb();
    } else {
      aViewInstance.on('viewAppended', cb);
      return aViewInstance.on('KDObjectWillBeDestroyed', function() {
        return _this.destroy();
      });
    }
  };

  return KDViewController;

})(KDController);

var KDImage;

KDImage = (function() {
  var daisy, round;

  round = Math.round;

  daisy = function(args, fn) {
    return setTimeout(args.next = function() {
      var f;
      if ((f = args.shift())) {
        return !!f(args) || true;
      } else {
        return false;
      }
    }, 0);
  };

  KDImage.dataURItoBlob = function(dataURI) {
    var ab, bb, byteString, i, ia, mimeString;
    byteString = atob(dataURI.split(",")[1]);
    mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0];
    ab = new ArrayBuffer(byteString.length);
    ia = new Uint8Array(ab);
    i = 0;
    while (i < byteString.length) {
      ia[i] = byteString.charCodeAt(i);
      i++;
    }
    bb = new BlobBuilder;
    bb.append(ab);
    return bb.getBlob(mimeString);
  };

  function KDImage(data, format) {
    this.data = data;
    this.format = format != null ? format : 'image/png';
    this.queue = [];
  }

  KDImage.process = function(action, algorithm) {
    return this.prototype[action] = function(options, callback) {
      var kallback,
        _this = this;
      kallback = function(data) {
        _this.data = data;
        return callback(data);
      };
      if ('string' === typeof this.data) {
        return this.load(this.data, function(data) {
          return algorithm.call(_this, data, options, kallback);
        });
      } else {
        return algorithm.call(this, this.data, options, kallback);
      }
    };
  };

  KDImage.prototype.load = function(src, callback) {
    var img;
    img = new Image;
    img.src = src;
    return img.onload = function() {
      return callback(img);
    };
  };

  KDImage.prototype.toBlob = function() {
    return KDImage.dataURItoBlob(this.data);
  };

  KDImage.prototype.processAll = function(action, callback) {
    var i, img, process, queue, steps;
    img = this;
    steps = (function() {
      var _i, _len, _results;
      _results = [];
      for (i = _i = 0, _len = action.length; _i < _len; i = ++_i) {
        process = action[i];
        if (i % 2 === 0) {
          _results.push(process);
        }
      }
      return _results;
    })();
    queue = steps.map(function(process, i) {
      var options;
      options = action[i * 2 + 1];
      return function() {
        return img[process](options, queue.next);
      };
    });
    queue.push(function() {
      return callback(img);
    });
    return daisy(queue);
  };

  KDImage.process('scale', function(data, _arg, callback) {
    var canvas, height, shortest, width;
    shortest = _arg.shortest, width = _arg.width, height = _arg.height;
    if (shortest != null) {
      if (data.width < data.height) {
        width = shortest;
      } else {
        height = shortest;
      }
    }
    if (width == null) {
      width = round(data.width * height / data.height);
    }
    if (height == null) {
      height = round(data.height * width / data.width);
    }
    canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    canvas.getContext('2d').drawImage(data, 0, 0, data.width, data.height, 0, 0, width, height);
    return callback(canvas.toDataURL(this.format));
  });

  KDImage.process('crop', function(data, _arg, callback) {
    var canvas, height, left, top, width;
    top = _arg.top, left = _arg.left, width = _arg.width, height = _arg.height;
    if (top == null) {
      top = round((height - data.height) / 2);
    }
    if (left == null) {
      left = round((width - data.width) / 2);
    }
    canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    canvas.getContext('2d').drawImage(data, 0, 0, data.width, data.height, left, top, data.width, data.height);
    return callback(canvas.toDataURL(this.format));
  });

  KDImage.prototype.createView = function() {
    return new KDCustomHTMLView({
      tagName: 'img',
      attributes: {
        src: 'string' === typeof this.data ? this.data : this.data.src
      }
    });
  };

  return KDImage;

})();

var KDSplitView,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

KDSplitView = (function(_super) {

  __extends(KDSplitView, _super);

  function KDSplitView(options, data) {
    var _ref, _ref1, _ref2;
    if (options == null) {
      options = {};
    }
    this.resizePanel = __bind(this.resizePanel, this);

    this.showPanel = __bind(this.showPanel, this);

    this.hidePanel = __bind(this.hidePanel, this);

    this._resizeDidStop = __bind(this._resizeDidStop, this);

    this._resizeDidStart = __bind(this._resizeDidStart, this);

    this._windowDidResize = __bind(this._windowDidResize, this);

    options.type || (options.type = "vertical");
    if ((_ref = options.resizable) == null) {
      options.resizable = true;
    }
    options.sizes || (options.sizes = ["50%", "50%"]);
    options.minimums || (options.minimums = null);
    options.maximums || (options.maximums = null);
    options.views || (options.views = null);
    options.fixed || (options.fixed = []);
    options.duration || (options.duration = 200);
    options.separator || (options.separator = null);
    if ((_ref1 = options.colored) == null) {
      options.colored = false;
    }
    if ((_ref2 = options.animated) == null) {
      options.animated = true;
    }
    options.type = options.type.toLowerCase();
    KDSplitView.__super__.constructor.call(this, options, data);
    this.setClass("kdsplitview kdsplitview-" + (this.getOptions().type) + " " + (this.getOptions().cssClass));
    this.panels = [];
    this.panelsBounds = [];
    this.resizers = [];
    this.sizes = [];
  }

  KDSplitView.prototype.viewAppended = function() {
    this._sanitizeSizes();
    this._createPanels();
    this._calculatePanelBounds();
    this._putPanels();
    this._setPanelPositions();
    this._putViews();
    if (this.getOptions().resizable && this.panels.length) {
      this._createResizers();
    }
    return this.listenWindowResize();
  };

  KDSplitView.prototype._createPanels = function() {
    var i, panelCount;
    panelCount = this.getOptions().sizes.length;
    return this.panels = (function() {
      var _i, _results;
      _results = [];
      for (i = _i = 0; 0 <= panelCount ? _i < panelCount : _i > panelCount; i = 0 <= panelCount ? ++_i : --_i) {
        _results.push(this._createPanel(i));
      }
      return _results;
    }).call(this);
  };

  KDSplitView.prototype._createPanel = function(index) {
    var fixed, maximums, minimums, panel, type, _ref,
      _this = this;
    _ref = this.getOptions(), type = _ref.type, fixed = _ref.fixed, minimums = _ref.minimums, maximums = _ref.maximums;
    panel = new KDSplitViewPanel({
      cssClass: "kdsplitview-panel panel-" + index,
      index: index,
      type: type,
      size: this._sanitizeSize(this.sizes[index]),
      fixed: fixed[index] ? true : void 0,
      minimum: minimums ? this._sanitizeSize(minimums[index]) : void 0,
      maximum: maximums ? this._sanitizeSize(maximums[index]) : void 0
    });
    panel.on("KDObjectWillBeDestroyed", function() {
      return _this._panelIsBeingDestroyed(panel);
    });
    this.emit("SplitPanelCreated", panel);
    return panel;
  };

  KDSplitView.prototype._calculatePanelBounds = function() {
    var i, offset, prevSize, size;
    return this.panelsBounds = (function() {
      var _i, _j, _len, _ref, _results;
      _ref = this.sizes;
      _results = [];
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        size = _ref[i];
        if (i === 0) {
          _results.push(0);
        } else {
          offset = 0;
          for (prevSize = _j = 0; 0 <= i ? _j < i : _j > i; prevSize = 0 <= i ? ++_j : --_j) {
            offset += this.sizes[prevSize];
          }
          _results.push(offset);
        }
      }
      return _results;
    }).call(this);
  };

  KDSplitView.prototype._putPanels = function() {
    var panel, _i, _len, _ref, _results;
    _ref = this.panels;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      panel = _ref[_i];
      this.addSubView(panel);
      if (this.getOptions().colored) {
        _results.push(panel.$().css({
          backgroundColor: __utils.getRandomRGB()
        }));
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };

  KDSplitView.prototype._setPanelPositions = function() {
    var i, panel, _i, _len, _ref;
    _ref = this.panels;
    for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
      panel = _ref[i];
      panel._setSize(this.sizes[i]);
      panel._setOffset(this.panelsBounds[i]);
    }
    return false;
  };

  KDSplitView.prototype._panelIsBeingDestroyed = function(panel) {
    var index, o;
    index = this.getPanelIndex(panel);
    o = this.getOptions();
    this.panels = this.panels.slice(0, index).concat(this.panels.slice(index + 1));
    this.sizes = this.sizes.slice(0, index).concat(this.sizes.slice(index + 1));
    this.panelsBounds = this.panelsBounds.slice(0, index).concat(this.panelsBounds.slice(index + 1));
    o.minimums.splice(index, 1);
    o.maximums.splice(index, 1);
    if (o.views[index] != null) {
      return o.views.splice(index, 1);
    }
  };

  KDSplitView.prototype._createResizers = function() {
    var i;
    this.resizers = (function() {
      var _i, _ref, _results;
      _results = [];
      for (i = _i = 1, _ref = this.sizes.length; 1 <= _ref ? _i < _ref : _i > _ref; i = 1 <= _ref ? ++_i : --_i) {
        _results.push(this._createResizer(i));
      }
      return _results;
    }).call(this);
    return this._repositionResizers();
  };

  KDSplitView.prototype._createResizer = function(index) {
    var resizer;
    this.addSubView(resizer = new KDSplitResizer({
      cssClass: "kdsplitview-resizer " + (this.getOptions().type),
      type: this.getOptions().type,
      panel0: this.panels[index - 1],
      panel1: this.panels[index]
    }));
    return resizer;
  };

  KDSplitView.prototype._repositionResizers = function() {
    var i, resizer, _i, _len, _ref, _results;
    _ref = this.resizers;
    _results = [];
    for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
      resizer = _ref[i];
      _results.push(resizer._setOffset(this.panelsBounds[i + 1]));
    }
    return _results;
  };

  KDSplitView.prototype._putViews = function() {
    var i, view, _base, _i, _len, _ref, _ref1, _results;
    if ((_ref = (_base = this.getOptions()).views) == null) {
      _base.views = [];
    }
    _ref1 = this.getOptions().views;
    _results = [];
    for (i = _i = 0, _len = _ref1.length; _i < _len; i = ++_i) {
      view = _ref1[i];
      if (view instanceof KDView) {
        _results.push(this.setView(view, i));
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };

  KDSplitView.prototype._sanitizeSizes = function() {
    var i, newSizes, nullCount, nullSize, o, panelSize, size, splitSize, totalOccupied;
    this._setMinsAndMaxs();
    o = this.getOptions();
    nullCount = 0;
    totalOccupied = 0;
    splitSize = this._getSize();
    newSizes = (function() {
      var _i, _len, _ref, _results;
      _ref = o.sizes;
      _results = [];
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        size = _ref[i];
        if (size === null) {
          nullCount++;
          _results.push(null);
        } else {
          panelSize = this._sanitizeSize(size);
          this._getLegitPanelSize(size, i);
          totalOccupied += panelSize;
          _results.push(panelSize);
        }
      }
      return _results;
    }).call(this);
    this.sizes = (function() {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = newSizes.length; _i < _len; _i++) {
        size = newSizes[_i];
        if (size === null) {
          nullSize = (splitSize - totalOccupied) / nullCount;
          _results.push(Math.round(nullSize));
        } else {
          _results.push(Math.round(size));
        }
      }
      return _results;
    })();
    return this.sizes;
  };

  KDSplitView.prototype._sanitizeSize = function(size) {
    var splitSize;
    if ("number" === typeof size || /px$/.test(size)) {
      return parseInt(size, 10);
    } else if (/%$/.test(size)) {
      splitSize = this._getSize();
      return splitSize / 100 * parseInt(size, 10);
    }
  };

  KDSplitView.prototype._setMinsAndMaxs = function() {
    var i, panelAmount, _base, _base1, _i, _ref, _ref1, _results;
    if ((_ref = (_base = this.getOptions()).minimums) == null) {
      _base.minimums = [];
    }
    if ((_ref1 = (_base1 = this.getOptions()).maximums) == null) {
      _base1.maximums = [];
    }
    panelAmount = this.getOptions().sizes.length || 2;
    _results = [];
    for (i = _i = 0; 0 <= panelAmount ? _i < panelAmount : _i > panelAmount; i = 0 <= panelAmount ? ++_i : --_i) {
      this.getOptions().minimums[i] = this.getOptions().minimums[i] ? this._sanitizeSize(this.getOptions().minimums[i]) : -1;
      _results.push(this.getOptions().maximums[i] = this.getOptions().maximums[i] ? this._sanitizeSize(this.getOptions().maximums[i]) : 99999);
    }
    return _results;
  };

  KDSplitView.prototype._getSize = function() {
    if (this.getOptions().type === "vertical") {
      return this.getWidth();
    } else {
      return this.getHeight();
    }
  };

  KDSplitView.prototype._setSize = function(size) {
    if (this.getOptions().type === "vertical") {
      return this.setWidth(size);
    } else {
      return this.setHeight(size);
    }
  };

  KDSplitView.prototype._getParentSize = function() {
    var $parent, type;
    type = this.getOptions().type;
    $parent = this.$().parent();
    if (type === "vertical") {
      return $parent.width();
    } else {
      return $parent.height();
    }
  };

  KDSplitView.prototype._getLegitPanelSize = function(size, index) {
    return size = this.getOptions().minimums[index] > size ? this.getOptions().minimums[index] : this.getOptions().maximums[index] < size ? this.getOptions().maximums[index] : size;
  };

  KDSplitView.prototype._resizePanels = function() {
    return this._sanitizeSizes();
  };

  KDSplitView.prototype._repositionPanels = function() {
    this._calculatePanelBounds();
    return this._setPanelPositions();
  };

  KDSplitView.prototype._windowDidResize = function(event) {
    this._setSize(this._getParentSize());
    this._resizePanels();
    this._repositionPanels();
    this._setPanelPositions();
    if (this.getOptions().resizable) {
      return this._repositionResizers();
    }
  };

  KDSplitView.prototype.mouseUp = function(event) {
    this.$().unbind("mousemove.resizeHandle");
    return this._resizeDidStop(event);
  };

  KDSplitView.prototype._panelReachedMinimum = function(panelIndex) {
    this.panels[panelIndex].emit("PanelReachedMinimum");
    return this.emit("PanelReachedMinimum", {
      panel: this.panels[panelIndex]
    });
  };

  KDSplitView.prototype._panelReachedMaximum = function(panelIndex) {
    this.panels[panelIndex].emit("PanelReachedMaximum");
    return this.emit("PanelReachedMaximum", {
      panel: this.panels[panelIndex]
    });
  };

  KDSplitView.prototype._resizeDidStart = function(event) {
    $('body').addClass("resize-in-action");
    return this.emit("ResizeDidStart", {
      orgEvent: event
    });
  };

  KDSplitView.prototype._resizeDidStop = function(event) {
    this.emit("ResizeDidStop", {
      orgEvent: event
    });
    return this.utils.wait(300, function() {
      return $('body').removeClass("resize-in-action");
    });
  };

  /* PUBLIC METHODS
  */


  KDSplitView.prototype.isVertical = function() {
    return this.getOptions().type === "vertical";
  };

  KDSplitView.prototype.getPanelIndex = function(panel) {
    var i, p, _i, _len, _ref;
    _ref = this.panels;
    for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
      p = _ref[i];
      if (p.getId() === panel.getId()) {
        return i;
      }
    }
  };

  KDSplitView.prototype.hidePanel = function(panelIndex, callback) {
    var panel,
      _this = this;
    if (callback == null) {
      callback = noop;
    }
    panel = this.panels[panelIndex];
    panel._lastSize = panel._getSize();
    return this.resizePanel(0, panelIndex, function() {
      return callback.call(_this, {
        panel: panel,
        index: panelIndex
      });
    });
  };

  KDSplitView.prototype.showPanel = function(panelIndex, callback) {
    var newSize, panel;
    if (callback == null) {
      callback = noop;
    }
    panel = this.panels[panelIndex];
    newSize = panel._lastSize || this.getOptions().sizes[panelIndex] || 200;
    panel._lastSize = null;
    return this.resizePanel(newSize, panelIndex, function() {
      return callback.call(this, {
        panel: panel,
        index: panelIndex
      });
    });
  };

  KDSplitView.prototype.resizePanel = function(value, panelIndex, callback) {
    var isReverse, p0offset, p0size, p1index, p1newSize, p1offset, p1size, panel0, panel1, race, raceCounter, resizer, surplus, totalActionArea,
      _this = this;
    if (value == null) {
      value = 0;
    }
    if (panelIndex == null) {
      panelIndex = 0;
    }
    if (callback == null) {
      callback = noop;
    }
    this._resizeDidStart();
    value = this._sanitizeSize(value);
    panel0 = this.panels[panelIndex];
    isReverse = false;
    if (panel0.size === value) {
      this._resizeDidStop();
      callback();
      return;
    }
    panel1 = this.panels.length - 1 !== panelIndex ? (p1index = panelIndex + 1, this.getOptions().resizable ? resizer = this.resizers[panelIndex] : void 0, this.panels[p1index]) : (isReverse = true, p1index = panelIndex - 1, this.getOptions().resizable ? resizer = this.resizers[p1index] : void 0, this.panels[p1index]);
    totalActionArea = panel0.size + panel1.size;
    if (value > totalActionArea) {
      return false;
    }
    p0size = this._getLegitPanelSize(value, panelIndex);
    surplus = panel0.size - p0size;
    p1newSize = panel1.size + surplus;
    p1size = this._getLegitPanelSize(p1newSize, p1index);
    raceCounter = 0;
    race = function() {
      raceCounter++;
      if (raceCounter === 2) {
        _this._resizeDidStop();
        return callback();
      }
    };
    if (!isReverse) {
      p1offset = panel1._getOffset() - surplus;
      if (this.getOptions().animated) {
        panel0._animateTo(p0size, race);
        panel1._animateTo(p1size, p1offset, race);
        if (resizer) {
          return resizer._animateTo(p1offset);
        }
      } else {
        panel0._setSize(p0size);
        race();
        panel1._setSize(p1size, panel1._setOffset(p1offset));
        race();
        if (resizer) {
          return resizer._setOffset(p1offset);
        }
      }
    } else {
      p0offset = panel0._getOffset() + surplus;
      if (this.getOptions().animated) {
        panel0._animateTo(p0size, p0offset, race);
        panel1._animateTo(p1size, race);
        if (resizer) {
          return resizer._animateTo(p0offset);
        }
      } else {
        panel0._setSize(p0size);
        panel0._setOffset(p0offset);
        race();
        panel1._setSize(p1size);
        race();
        if (resizer) {
          return resizer._setOffset(p0offset);
        }
      }
    }
  };

  KDSplitView.prototype.splitPanel = function(index, options) {
    var i, isLastPanel, newIndex, newPanel, newPanelOptions, newResizer, newSize, o, oldResizer, panel, panelToBeSplitted, _i, _len, _ref;
    newPanelOptions = {};
    o = this.getOptions();
    isLastPanel = this.resizers[index] ? false : true;
    panelToBeSplitted = this.panels[index];
    this.panels.splice(index + 1, 0, newPanel = this._createPanel(index));
    this.sizes.splice(index + 1, 0, this.sizes[index] / 2);
    this.sizes[index] = this.sizes[index] / 2;
    o.minimums.splice(index + 1, 0, newPanelOptions.minimum);
    o.maximums.splice(index + 1, 0, newPanelOptions.maximum);
    o.views.splice(index + 1, 0, newPanelOptions.view);
    o.sizes = this.sizes;
    this.subViews.push(newPanel);
    newPanel.setParent(this);
    panelToBeSplitted.$().after(newPanel.$());
    newPanel.emit('viewAppended');
    newSize = panelToBeSplitted._getSize() / 2;
    panelToBeSplitted._setSize(newSize);
    newPanel._setSize(newSize);
    newPanel._setOffset(panelToBeSplitted._getOffset() + newSize);
    this._calculatePanelBounds();
    _ref = this.panels.slice(index + 1, this.panels.length);
    for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
      panel = _ref[i];
      panel.index = newIndex = index + 1 + i;
      panel.unsetClass("panel-" + (index + i)).setClass("panel-" + newIndex);
    }
    if (this.getOptions().resizable) {
      if (!isLastPanel) {
        oldResizer = this.resizers[index];
        oldResizer._setOffset(this.panelsBounds[index + 1]);
        oldResizer.panel0 = panelToBeSplitted;
        oldResizer.panel1 = newPanel;
        this.resizers.splice(index + 1, 0, newResizer = this._createResizer(index + 2));
        newResizer._setOffset(this.panelsBounds[index + 2]);
      } else {
        this.resizers.push(newResizer = this._createResizer(index + 1));
        newResizer._setOffset(this.panelsBounds[index + 1]);
      }
    }
    this.emit("panelSplitted", newPanel);
    return newPanel;
  };

  KDSplitView.prototype.removePanel = function(index) {
    var l, panel, r, res;
    l = this.panels.length;
    if (l === 1) {
      warn("this is the only panel left");
      return false;
    }
    panel = this.panels[index];
    panel.destroy();
    if (index === 0) {
      r = this.resizers.shift();
      r.destroy();
      if (res = this.resizers[0]) {
        res.panel0 = this.panels[0];
        res.panel1 = this.panels[1];
      }
    } else if (index === l - 1) {
      r = this.resizers.pop();
      r.destroy();
      if (res = this.resizers[l - 2]) {
        res.panel0 = this.panels[l - 2];
        res.panel1 = this.panels[l - 1];
      }
    } else {
      r = this.resizers.splice(index - 1, 1)[0];
      r.destroy();
      this.resizers[index - 1].panel0 = this.panels[index - 1];
      this.resizers[index - 1].panel1 = this.panels[index];
    }
    return true;
  };

  KDSplitView.prototype.setView = function(view, index) {
    if (index > this.panels.length || !view) {
      warn("Either 'view' or 'index' is missing at KDSplitView::setView!");
      return;
    }
    return this.panels[index].addSubView(view);
  };

  return KDSplitView;

})(KDView);

var KDSplitResizer,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

KDSplitResizer = (function(_super) {

  __extends(KDSplitResizer, _super);

  function KDSplitResizer(options, data) {
    var _ref, _ref1;
    if (options == null) {
      options = {};
    }
    if ((_ref = options.draggable) == null) {
      options.draggable = true;
    }
    KDSplitResizer.__super__.constructor.call(this, options, data);
    _ref1 = this.getOptions(), this.panel0 = _ref1.panel0, this.panel1 = _ref1.panel1;
    this.isVertical = this.options.type.toLowerCase() === "vertical";
    this.on("DragFinished", this.dragFinished);
    this.on("DragInAction", this.dragInAction);
    this.on("DragStarted", this.dragStarted);
  }

  KDSplitResizer.prototype._setOffset = function(offset) {
    if (offset < 0) {
      offset = 0;
    }
    if (this.isVertical) {
      return this.$().css({
        left: offset - 5
      });
    } else {
      return this.$().css({
        top: offset - 5
      });
    }
  };

  KDSplitResizer.prototype._getOffset = function(offset) {
    if (this.isVertical) {
      return this.getRelativeX();
    } else {
      return this.getRelativeY();
    }
  };

  KDSplitResizer.prototype._animateTo = function(offset) {
    var d;
    offset -= this.getWidth() / 2;
    d = this.parent.options.duration;
    if (this.isVertical) {
      return this.$().animate({
        left: offset
      }, d);
    } else {
      return this.$().animate({
        top: offset
      }, d);
    }
  };

  KDSplitResizer.prototype.dragFinished = function(event, dragState) {
    return this.parent._resizeDidStop(event);
  };

  KDSplitResizer.prototype.dragStarted = function(event, dragState) {
    this.parent._resizeDidStart();
    this.rOffset = this._getOffset();
    this.p0Size = this.panel0._getSize();
    this.p1Size = this.panel1._getSize();
    return this.p1Offset = this.panel1._getOffset();
  };

  KDSplitResizer.prototype.dragInAction = function(x, y) {
    var p0DidResize, p0WouldResize, p1DidResize, p1WouldResize;
    if (this.isVertical) {
      p0WouldResize = this.panel0._wouldResize(x + this.p0Size);
      if (p0WouldResize) {
        p1WouldResize = this.panel1._wouldResize(-x + this.p1Size);
      }
      this.dragIsAllowed = p1WouldResize ? (this.panel0._setSize(x + this.p0Size), this.panel1._setSize(-x + this.p1Size), true) : (this._setOffset(this.panel1._getOffset()), false);
      if (this.dragIsAllowed) {
        return this.panel1._setOffset(x + this.p1Offset);
      }
    } else {
      p0WouldResize = this.panel0._wouldResize(y + this.p0Size);
      p1WouldResize = this.panel1._wouldResize(-y + this.p1Size);
      p0DidResize = p0WouldResize && p1WouldResize ? this.panel0._setSize(y + this.p0Size) : false;
      p1DidResize = p0WouldResize && p1WouldResize ? this.panel1._setSize(-y + this.p1Size) : false;
      if (p0DidResize && p1DidResize) {
        return this.panel1._setOffset(y + this.p1Offset);
      }
    }
  };

  return KDSplitResizer;

})(KDView);

var KDSplitViewPanel,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

KDSplitViewPanel = (function(_super) {

  __extends(KDSplitViewPanel, _super);

  function KDSplitViewPanel(options, data) {
    var _ref, _ref1;
    if (options == null) {
      options = {};
    }
    this._animateTo = __bind(this._animateTo, this);

    if ((_ref = options.fixed) == null) {
      options.fixed = false;
    }
    options.minimum || (options.minimum = null);
    options.maximum || (options.maximum = null);
    options.view || (options.view = null);
    KDSplitViewPanel.__super__.constructor.call(this, options, data);
    this.isVertical = this.getOptions().type.toLowerCase() === "vertical";
    this.isFixed = this.getOptions().fixed;
    _ref1 = this.options, this.size = _ref1.size, this.minimum = _ref1.minimum, this.maximum = _ref1.maximum;
  }

  KDSplitViewPanel.prototype._getIndex = function() {
    return this.parent.getPanelIndex(this);
  };

  KDSplitViewPanel.prototype._getSize = function() {
    if (this.isVertical) {
      return this.getWidth();
    } else {
      return this.getHeight();
    }
  };

  KDSplitViewPanel.prototype._setSize = function(size) {
    if (this._wouldResize(size)) {
      if (size < 0) {
        size = 0;
      }
      if (this.isVertical) {
        this.setWidth(size);
      } else {
        this.setHeight(size);
      }
      this.parent.sizes[this._getIndex()] = this.size = size;
      this.parent.emit("PanelDidResize", {
        panel: this
      });
      this.emit("PanelDidResize", {
        newSize: size
      });
      return size;
    } else {
      return false;
    }
  };

  KDSplitViewPanel.prototype._wouldResize = function(size) {
    var _ref, _ref1;
    if ((_ref = this.minimum) == null) {
      this.minimum = -1;
    }
    if ((_ref1 = this.maximum) == null) {
      this.maximum = 99999;
    }
    if (size > this.minimum && size < this.maximum) {
      return true;
    } else {
      if (size < this.minimum) {
        this.parent._panelReachedMinimum(this._getIndex());
      } else if (size > this.maximum) {
        this.parent._panelReachedMaximum(this._getIndex());
      }
      return false;
    }
  };

  KDSplitViewPanel.prototype._setOffset = function(offset) {
    if (offset < 0) {
      offset = 0;
    }
    if (this.isVertical) {
      this.$().css({
        left: offset
      });
    } else {
      this.$().css({
        top: offset
      });
    }
    return this.parent.panelsBounds[this._getIndex()] = offset;
  };

  KDSplitViewPanel.prototype._getOffset = function() {
    if (this.isVertical) {
      return this.getRelativeX();
    } else {
      return this.getRelativeY();
    }
  };

  KDSplitViewPanel.prototype._animateTo = function(size, offset, callback) {
    var cb, d, options, panel, properties;
    if ("undefined" === typeof callback && "function" === typeof offset) {
      callback = offset;
    }
    callback || (callback = noop);
    panel = this;
    d = panel.parent.options.duration;
    cb = function() {
      var newSize;
      newSize = panel._getSize();
      panel.parent.sizes[panel.index] = panel.size = newSize;
      panel.parent.emit("PanelDidResize", {
        panel: panel
      });
      panel.emit("PanelDidResize", {
        newSize: newSize
      });
      return callback.call(panel);
    };
    properties = {};
    if (size < 0) {
      size = 0;
    }
    if (panel.isVertical) {
      properties.width = size;
      if (offset != null) {
        properties.left = offset;
      }
    } else {
      properties.height = size;
      if (offset != null) {
        properties.top = offset;
      }
    }
    options = {
      duration: d,
      complete: cb
    };
    panel.$().stop();
    return panel.$().animate(properties, options);
  };

  return KDSplitViewPanel;

})(KDScrollView);

var KDHeaderView,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

KDHeaderView = (function(_super) {

  __extends(KDHeaderView, _super);

  function KDHeaderView(options, data) {
    var _ref;
    options = options != null ? options : {};
    options.type = (_ref = options.type) != null ? _ref : "default";
    KDHeaderView.__super__.constructor.call(this, options, data);
    if (options.title != null) {
      this.setTitle(options.title);
    }
  }

  KDHeaderView.prototype.setTitle = function(title) {
    return this.getDomElement().append("<span>" + title + "</span>");
  };

  KDHeaderView.prototype.updateTitle = function(title) {
    return this.$().find('span').html(title);
  };

  KDHeaderView.prototype.setDomElement = function(cssClass) {
    var tag, type;
    if (cssClass == null) {
      cssClass = "";
    }
    type = this.getOptions().type;
    switch (type) {
      case "big":
        tag = "h1";
        break;
      case "medium":
        tag = "h2";
        break;
      case "small":
        tag = "h3";
        break;
      default:
        tag = "h4";
    }
    return this.domElement = $("<" + tag + " class='kdview kdheaderview " + cssClass + "'></" + tag + ">");
  };

  return KDHeaderView;

})(KDView);

var KDLoaderView,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

KDLoaderView = (function(_super) {

  __extends(KDLoaderView, _super);

  function KDLoaderView(options, data) {
    var o;
    o = options || {};
    o.loaderOptions || (o.loaderOptions = {});
    o.size || (o.size = {});
    options = {
      tagName: o.tagName || "span",
      bind: o.bind || "mouseenter mouseleave",
      size: {
        width: o.size.width || 12,
        height: o.size.height || 12
      },
      loaderOptions: {
        color: o.loaderOptions.color || "#000000",
        shape: o.loaderOptions.shape || "spiral",
        diameter: o.loaderOptions.diameter || 12,
        density: o.loaderOptions.density || 30,
        range: o.loaderOptions.range || 0.4,
        speed: o.loaderOptions.speed || 1.5,
        FPS: o.loaderOptions.FPS || 24
      }
    };
    options.loaderOptions.diameter = options.size.height = options.size.width;
    options.cssClass = o.cssClass ? "" + o.cssClass + " kdloader" : "kdloader";
    KDLoaderView.__super__.constructor.call(this, options, data);
  }

  KDLoaderView.prototype.viewAppended = function() {
    var loaderOptions, option, value, _results;
    this.canvas = new CanvasLoader(this.getElement(), {
      id: "cl_" + this.id
    });
    loaderOptions = this.getOptions().loaderOptions;
    _results = [];
    for (option in loaderOptions) {
      value = loaderOptions[option];
      _results.push(this.canvas["set" + (option.capitalize())](value));
    }
    return _results;
  };

  KDLoaderView.prototype.show = function() {
    KDLoaderView.__super__.show.apply(this, arguments);
    this.active = true;
    if (this.canvas) {
      return this.canvas.show();
    }
  };

  KDLoaderView.prototype.hide = function() {
    KDLoaderView.__super__.hide.apply(this, arguments);
    this.active = false;
    if (this.canvas) {
      return this.canvas.hide();
    }
  };

  KDLoaderView.prototype.mouseEnter = function() {
    this.canvas.setColor(this.utils.getRandomHex());
    return this.canvas.setSpeed(1);
  };

  KDLoaderView.prototype.mouseLeave = function() {
    this.canvas.setColor(this.getOptions().loaderOptions.color);
    return this.canvas.setSpeed(this.getOptions().loaderOptions.speed);
  };

  KDLoaderView.prototype.mouseMove = function() {
    return this.canvas.setColor(this.utils.getRandomHex());
  };

  return KDLoaderView;

})(KDView);

var KDListViewController,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

KDListViewController = (function(_super) {

  __extends(KDListViewController, _super);

  function KDListViewController(options, data) {
    var listView, viewOptions, _ref, _ref1, _ref2, _ref3, _ref4, _ref5,
      _this = this;
    if (options == null) {
      options = {};
    }
    if ((_ref = options.wrapper) == null) {
      options.wrapper = true;
    }
    if ((_ref1 = options.scrollView) == null) {
      options.scrollView = true;
    }
    if ((_ref2 = options.keyNav) == null) {
      options.keyNav = false;
    }
    if ((_ref3 = options.multipleSelection) == null) {
      options.multipleSelection = false;
    }
    if ((_ref4 = options.selection) == null) {
      options.selection = true;
    }
    if ((_ref5 = options.startWithLazyLoader) == null) {
      options.startWithLazyLoader = false;
    }
    options.itemChildClass || (options.itemChildClass = null);
    options.itemChildOptions || (options.itemChildOptions = {});
    if (!this.itemsOrdered) {
      this.itemsOrdered = [];
    }
    this.itemsIndexed = {};
    this.selectedItems = [];
    this.lazyLoader = null;
    if (options.view) {
      this.setListView(listView = options.view);
    } else {
      viewOptions = options.viewOptions || {};
      viewOptions.lastToFirst || (viewOptions.lastToFirst = options.lastToFirst);
      viewOptions.itemClass || (viewOptions.itemClass = options.itemClass);
      viewOptions.itemChildClass || (viewOptions.itemChildClass = options.itemChildClass);
      viewOptions.itemChildOptions || (viewOptions.itemChildOptions = options.itemChildOptions);
      this.setListView(listView = new KDListView(viewOptions));
    }
    if (options.scrollView) {
      this.scrollView = new KDScrollView({
        lazyLoadThreshold: options.lazyLoadThreshold,
        ownScrollBars: options.ownScrollBars
      });
    }
    if (options.wrapper) {
      options.view = new KDView({
        cssClass: "listview-wrapper"
      });
    } else {
      options.view = listView;
    }
    KDListViewController.__super__.constructor.call(this, options, data);
    listView.on('ItemWasAdded', function(view, index) {
      return _this.registerItem(view, index);
    });
    listView.on('ItemIsBeingDestroyed', function(itemInfo) {
      return _this.unregisterItem(itemInfo);
    });
    if (options.keyNav) {
      listView.on('KeyDownOnList', function(event) {
        return _this.keyDownPerformed(listView, event);
      });
    }
  }

  KDListViewController.prototype.loadView = function(mainView) {
    var options, scrollView, _ref,
      _this = this;
    options = this.getOptions();
    if (options.scrollView) {
      scrollView = this.scrollView;
      mainView.addSubView(scrollView);
      scrollView.addSubView(this.getListView());
      if (options.startWithLazyLoader) {
        this.showLazyLoader(false);
      }
      scrollView.registerListener({
        KDEventTypes: 'LazyLoadThresholdReached',
        listener: this,
        callback: this.showLazyLoader
      });
    }
    this.instantiateListItems(((_ref = this.getData()) != null ? _ref.items : void 0) || []);
    return this.getSingleton("windowController").on("ReceivedMouseUpElsewhere", function(event) {
      return _this.mouseUpHappened(event);
    });
  };

  KDListViewController.prototype.instantiateListItems = function(items) {
    var itemData, newItems;
    newItems = (function() {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = items.length; _i < _len; _i++) {
        itemData = items[_i];
        _results.push(this.getListView().addItem(itemData));
      }
      return _results;
    }).call(this);
    this.emit("AllItemsAddedToList");
    return newItems;
  };

  /*
    HELPERS
  */


  KDListViewController.prototype.itemForId = function(id) {
    return this.itemsIndexed[id];
  };

  KDListViewController.prototype.getItemsOrdered = function() {
    return this.itemsOrdered;
  };

  KDListViewController.prototype.getItemCount = function() {
    return this.itemsOrdered.length;
  };

  KDListViewController.prototype.setListView = function(listView) {
    return this.listView = listView;
  };

  KDListViewController.prototype.getListView = function() {
    return this.listView;
  };

  /*
    ITEM OPERATIONS
  */


  KDListViewController.prototype.addItem = function(itemData, index, animation) {
    return this.getListView().addItem(itemData, index, animation);
  };

  KDListViewController.prototype.removeItem = function(itemInstance, itemData, index) {
    return this.getListView().removeItem(itemInstance, itemData, index);
  };

  KDListViewController.prototype.registerItem = function(view, index) {
    var actualIndex, options,
      _this = this;
    options = this.getOptions();
    if (index != null) {
      actualIndex = this.getOptions().lastToFirst ? this.getListView().items.length - index - 1 : index;
      this.itemsOrdered.splice(actualIndex, 0, view);
    } else {
      this.itemsOrdered[this.getOptions().lastToFirst ? 'unshift' : 'push'](view);
    }
    if (view.getData() != null) {
      this.itemsIndexed[view.getItemDataId()] = view;
    }
    if (options.selection) {
      this.listenTo({
        KDEventTypes: 'click',
        listenedToInstance: view,
        callback: function(view, event) {
          return _this.selectItem(view, event);
        }
      });
    }
    if (options.keyNav || options.multipleSelection) {
      return this.listenTo({
        KDEventTypes: ["mousedown", "mouseenter"],
        listenedToInstance: view,
        callback: function(view, event) {
          switch (event.type) {
            case "mousedown":
              return _this.mouseDownHappenedOnItem(view, event);
            case "mouseenter":
              return _this.mouseEnterHappenedOnItem(view, event);
          }
        }
      });
    }
  };

  KDListViewController.prototype.unregisterItem = function(itemInfo) {
    var actualIndex, index, view;
    this.emit("UnregisteringItem", itemInfo);
    index = itemInfo.index, view = itemInfo.view;
    actualIndex = this.getOptions().lastToFirst ? this.getListView().items.length - index - 1 : index;
    this.itemsOrdered.splice(actualIndex, 1);
    if (view.getData() != null) {
      return delete this.itemsIndexed[view.getItemDataId()];
    }
  };

  KDListViewController.prototype.replaceAllItems = function(items) {
    this.removeAllItems();
    return this.instantiateListItems(items);
  };

  KDListViewController.prototype.removeAllItems = function() {
    var itemsOrdered, listView;
    itemsOrdered = this.itemsOrdered;
    this.itemsOrdered = [];
    this.itemsIndexed = {};
    listView = this.getListView();
    if (listView.items.length) {
      listView.empty();
    }
    return itemsOrdered;
  };

  /*
    HANDLING MOUSE EVENTS
  */


  KDListViewController.prototype.mouseDownHappenedOnItem = function(item, event) {
    var _this = this;
    if (this.getOptions().keyNav) {
      this.getSingleton("windowController").setKeyView(this.getListView());
    }
    this.lastEvent = event;
    if (__indexOf.call(this.selectedItems, item) < 0) {
      this.mouseDown = true;
      this.mouseDownTempItem = item;
      return this.mouseDownTimer = setTimeout(function() {
        _this.mouseDown = false;
        _this.mouseDownTempItem = null;
        return _this.selectItem(item, event);
      }, 300);
    } else {
      this.mouseDown = false;
      return this.mouseDownTempItem = null;
    }
  };

  KDListViewController.prototype.mouseUpHappened = function(event) {
    clearTimeout(this.mouseDownTimer);
    this.mouseDown = false;
    return this.mouseDownTempItem = null;
  };

  KDListViewController.prototype.mouseEnterHappenedOnItem = function(item, event) {
    clearTimeout(this.mouseDownTimer);
    if (this.mouseDown) {
      if (!(event.metaKey || event.ctrlKey || event.shiftKey)) {
        this.deselectAllItems();
      }
      return this.selectItemsByRange(this.mouseDownTempItem, item);
    } else {
      return this.propagateEvent({
        KDEventType: "MouseEnterHappenedOnItem"
      }, item);
    }
  };

  /*
    HANDLING KEY EVENTS
  */


  KDListViewController.prototype.keyDownPerformed = function(mainView, event) {
    switch (event.which) {
      case 40:
      case 38:
        this.selectItemBelowOrAbove(event);
        return this.propagateEvent({
          KDEventType: "KeyDownOnListHandled"
        }, this.selectedItems);
    }
  };

  /*
    ITEM SELECTION
  */


  KDListViewController.prototype.selectItem = function(item, event) {
    if (event == null) {
      event = {};
    }
    this.lastEvent = event;
    if (!(event.metaKey || event.ctrlKey || event.shiftKey)) {
      this.deselectAllItems();
    }
    if (item != null) {
      if (event.shiftKey && this.selectedItems.length > 0) {
        this.selectItemsByRange(this.selectedItems[0], item);
      } else {
        if (__indexOf.call(this.selectedItems, item) < 0) {
          this.selectSingleItem(item);
        } else {
          this.deselectSingleItem(item);
        }
      }
    }
    return this.selectedItems;
  };

  KDListViewController.prototype.selectItemBelowOrAbove = function(event) {
    var addend, direction, lastSelectedIndex, selectedIndex;
    direction = event.which === 40 ? "down" : "up";
    addend = event.which === 40 ? 1 : -1;
    selectedIndex = this.itemsOrdered.indexOf(this.selectedItems[0]);
    lastSelectedIndex = this.itemsOrdered.indexOf(this.selectedItems[this.selectedItems.length - 1]);
    if (this.itemsOrdered[selectedIndex + addend]) {
      if (!(event.metaKey || event.ctrlKey || event.shiftKey)) {
        return this.selectItem(this.itemsOrdered[selectedIndex + addend]);
      } else {
        if (this.selectedItems.indexOf(this.itemsOrdered[lastSelectedIndex + addend]) !== -1) {
          if (this.itemsOrdered[lastSelectedIndex]) {
            return this.deselectSingleItem(this.itemsOrdered[lastSelectedIndex]);
          }
        } else {
          if (this.itemsOrdered[lastSelectedIndex + addend]) {
            return this.selectSingleItem(this.itemsOrdered[lastSelectedIndex + addend]);
          }
        }
      }
    }
  };

  KDListViewController.prototype.selectNextItem = function(item, event) {
    var selectedIndex;
    if (!item) {
      item = this.selectedItems[0];
    }
    selectedIndex = this.itemsOrdered.indexOf(item);
    return this.selectItem(this.itemsOrdered[selectedIndex + 1]);
  };

  KDListViewController.prototype.selectPrevItem = function(item, event) {
    var selectedIndex;
    if (!item) {
      item = this.selectedItems[0];
    }
    selectedIndex = this.itemsOrdered.indexOf(item);
    return this.selectItem(this.itemsOrdered[selectedIndex + -1]);
  };

  KDListViewController.prototype.deselectAllItems = function() {
    var deselectedItems, selectedItem, _i, _len, _ref, _results;
    _ref = this.selectedItems;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      selectedItem = _ref[_i];
      selectedItem.removeHighlight();
      deselectedItems = this.selectedItems.concat([]);
      this.selectedItems = [];
      this.getListView().unsetClass("last-item-selected");
      _results.push(this.itemDeselectionPerformed(deselectedItems));
    }
    return _results;
  };

  KDListViewController.prototype.deselectSingleItem = function(item) {
    item.removeHighlight();
    this.selectedItems.splice(this.selectedItems.indexOf(item), 1);
    if (item === this.itemsOrdered[this.itemsOrdered.length - 1]) {
      this.getListView().unsetClass("last-item-selected");
    }
    return this.itemDeselectionPerformed([item]);
  };

  KDListViewController.prototype.selectSingleItem = function(item) {
    if (__indexOf.call(this.selectedItems, item) < 0) {
      item.highlight();
      this.selectedItems.push(item);
      if (item === this.itemsOrdered[this.itemsOrdered.length - 1]) {
        this.getListView().setClass("last-item-selected");
      }
      return this.itemSelectionPerformed();
    }
  };

  KDListViewController.prototype.selectAllItems = function() {
    var item, _i, _len, _ref, _results;
    _ref = this.itemsOrdered;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      item = _ref[_i];
      _results.push(this.selectSingleItem(item));
    }
    return _results;
  };

  KDListViewController.prototype.selectItemsByRange = function(item1, item2) {
    var indicesToBeSliced, item, itemsToBeSelected, _i, _len;
    indicesToBeSliced = [this.itemsOrdered.indexOf(item1), this.itemsOrdered.indexOf(item2)];
    indicesToBeSliced.sort(function(a, b) {
      return a - b;
    });
    itemsToBeSelected = this.itemsOrdered.slice(indicesToBeSliced[0], indicesToBeSliced[1] + 1);
    for (_i = 0, _len = itemsToBeSelected.length; _i < _len; _i++) {
      item = itemsToBeSelected[_i];
      this.selectSingleItem(item);
    }
    return this.itemSelectionPerformed();
  };

  KDListViewController.prototype.itemSelectionPerformed = function() {
    return this.propagateEvent({
      KDEventType: "ItemSelectionPerformed"
    }, {
      event: this.lastEvent,
      items: this.selectedItems
    });
  };

  KDListViewController.prototype.itemDeselectionPerformed = function(deselectedItems) {
    return this.propagateEvent({
      KDEventType: "ItemDeselectionPerformed"
    }, {
      event: this.lastEvent,
      items: deselectedItems
    });
  };

  /*
    LAZY LOADER
  */


  KDListViewController.prototype.showLazyLoader = function(emitWhenReached) {
    if (emitWhenReached == null) {
      emitWhenReached = true;
    }
    if (!this.lazyLoader) {
      this.scrollView.addSubView(this.lazyLoader = new KDCustomHTMLView({
        cssClass: "lazy-loader",
        partial: "Loading..."
      }));
      this.lazyLoader.addSubView(this.lazyLoader.canvas = new KDLoaderView({
        size: {
          width: 16
        },
        loaderOptions: {
          color: "#5f5f5f",
          diameter: 16,
          density: 60,
          range: 0.4,
          speed: 3,
          FPS: 24
        }
      }));
      this.lazyLoader.canvas.show();
      if (emitWhenReached) {
        return this.propagateEvent({
          KDEventType: 'LazyLoadThresholdReached'
        });
      }
    }
  };

  KDListViewController.prototype.hideLazyLoader = function() {
    if (this.lazyLoader) {
      this.lazyLoader.canvas.hide();
      this.lazyLoader.destroy();
      return this.lazyLoader = null;
    }
  };

  return KDListViewController;

})(KDViewController);

var KDListView,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

KDListView = (function(_super) {

  __extends(KDListView, _super);

  function KDListView(options, data) {
    var _ref;
    if (options == null) {
      options = {};
    }
    options.type || (options.type = "default");
    if ((_ref = options.lastToFirst) == null) {
      options.lastToFirst = false;
    }
    options.cssClass = options.cssClass != null ? "kdlistview kdlistview-" + options.type + " " + options.cssClass : "kdlistview kdlistview-" + options.type;
    if (!this.items) {
      this.items = [];
    }
    KDListView.__super__.constructor.call(this, options, data);
  }

  KDListView.prototype.empty = function() {
    var i, item, _i, _len, _ref;
    _ref = this.items;
    for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
      item = _ref[i];
      if (item != null) {
        item.destroy();
      }
    }
    return this.items = [];
  };

  KDListView.prototype.keyDown = function(event) {
    event.stopPropagation();
    event.preventDefault();
    return this.emit("KeyDownOnList", event);
  };

  KDListView.prototype._addItemHelper = function(itemData, options) {
    var animation, index, itemChildClass, itemChildOptions, itemInstance, viewOptions, _ref, _ref1, _ref2;
    index = options.index, animation = options.animation, viewOptions = options.viewOptions;
    _ref = this.getOptions(), itemChildClass = _ref.itemChildClass, itemChildOptions = _ref.itemChildOptions;
    viewOptions || (viewOptions = (typeof this.customizeItemOptions === "function" ? this.customizeItemOptions(options, itemData) : void 0) || {});
    viewOptions.delegate = this;
    viewOptions.childClass || (viewOptions.childClass = itemChildClass);
    viewOptions.childOptions = itemChildOptions;
    itemInstance = new ((_ref1 = (_ref2 = viewOptions.itemClass) != null ? _ref2 : this.getOptions().itemClass) != null ? _ref1 : KDListItemView)(viewOptions, itemData);
    this.addItemView(itemInstance, index, animation);
    return itemInstance;
  };

  KDListView.prototype.addHiddenItem = function(item, index, animation) {
    return this._addItemHelper(item, {
      viewOptions: {
        isHidden: true,
        cssClass: 'hidden-item'
      },
      index: index,
      animation: animation
    });
  };

  KDListView.prototype.addItem = function(itemData, index, animation) {
    return this._addItemHelper(itemData, {
      index: index,
      animation: animation
    });
  };

  KDListView.prototype.removeItem = function(itemInstance, itemData, index) {
    var i, item, _i, _len, _ref;
    if (index) {
      this.emit('ItemIsBeingDestroyed', {
        view: this.items[index],
        index: index
      });
      this.items.splice(index, 1);
      item.destroy();
    } else {
      _ref = this.items;
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        item = _ref[i];
        if (itemInstance && itemInstance === item || itemData && itemData === item.getData()) {
          this.emit('ItemIsBeingDestroyed', {
            view: item,
            index: i
          });
          this.items.splice(i, 1);
          item.destroy();
          return;
        }
      }
    }
  };

  KDListView.prototype.destroy = function(animated, animationType, duration) {
    var item, _i, _len, _ref;
    if (animated == null) {
      animated = false;
    }
    if (animationType == null) {
      animationType = "slideUp";
    }
    if (duration == null) {
      duration = 100;
    }
    _ref = this.items;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      item = _ref[_i];
      item.destroy();
    }
    return KDListView.__super__.destroy.call(this);
  };

  KDListView.prototype.addItemView = function(itemInstance, index, animation) {
    var actualIndex;
    this.emit('ItemWasAdded', itemInstance, index);
    if (index != null) {
      actualIndex = this.getOptions().lastToFirst ? this.items.length - index - 1 : index;
      this.items.splice(actualIndex, 0, itemInstance);
      this.appendItemAtIndex(itemInstance, index, animation);
    } else {
      this.items[this.getOptions().lastToFirst ? 'unshift' : 'push'](itemInstance);
      this.appendItem(itemInstance, animation);
    }
    return itemInstance;
  };

  KDListView.prototype.appendItem = function(itemInstance, animation) {
    var scroll,
      _this = this;
    itemInstance.setParent(this);
    scroll = this.doIHaveToScroll();
    if (animation != null) {
      itemInstance.getDomElement().hide();
      this.getDomElement()[this.getOptions().lastToFirst ? 'prepend' : 'append'](itemInstance.getDomElement());
      itemInstance.getDomElement()[animation.type](animation.duration, function() {
        return itemInstance.propagateEvent({
          KDEventType: 'introEffectCompleted'
        });
      });
    } else {
      this.getDomElement()[this.getOptions().lastToFirst ? 'prepend' : 'append'](itemInstance.getDomElement());
    }
    if (scroll) {
      this.scrollDown();
    }
    if (this.parentIsInDom) {
      itemInstance.emit('viewAppended');
    }
    return null;
  };

  KDListView.prototype.appendItemAtIndex = function(itemInstance, index, animation) {
    var actualIndex,
      _this = this;
    itemInstance.setParent(this);
    actualIndex = this.getOptions().lastToFirst ? this.items.length - index - 1 : index;
    if (animation != null) {
      itemInstance.getDomElement().hide();
      if (index === 0) {
        this.getDomElement()[this.getOptions().lastToFirst ? 'append' : 'prepend'](itemInstance.getDomElement());
      }
      if (index > 0) {
        this.items[actualIndex - 1].getDomElement()[this.getOptions().lastToFirst ? 'before' : 'after'](itemInstance.getDomElement());
      }
      itemInstance.getDomElement()[animation.type](animation.duration, function() {
        return itemInstance.propagateEvent({
          KDEventType: 'introEffectCompleted'
        });
      });
    } else {
      if (index === 0) {
        this.getDomElement()[this.getOptions().lastToFirst ? 'append' : 'prepend'](itemInstance.getDomElement());
      }
      if (index > 0) {
        this.items[actualIndex - 1].getDomElement()[this.getOptions().lastToFirst ? 'before' : 'after'](itemInstance.getDomElement());
      }
    }
    if (this.parentIsInDom) {
      itemInstance.emit('viewAppended');
    }
    return null;
  };

  KDListView.prototype.scrollDown = function() {
    var _this = this;
    clearTimeout(this._scrollDownTimeout);
    return this._scrollDownTimeout = setTimeout(function() {
      var scrollView, slidingHeight, slidingView;
      scrollView = _this.$().closest(".kdscrollview");
      slidingView = scrollView.find('> .kdview');
      slidingHeight = slidingView.height();
      return scrollView.animate({
        scrollTop: slidingHeight
      }, {
        duration: 200,
        queue: false
      });
    }, 50);
  };

  KDListView.prototype.doIHaveToScroll = function() {
    var scrollView;
    scrollView = this.$().closest(".kdscrollview");
    if (this.getOptions().autoScroll) {
      if (scrollView.length && scrollView[0].scrollHeight <= scrollView.height()) {
        return true;
      } else {
        return this.isScrollAtBottom();
      }
    } else {
      return false;
    }
  };

  KDListView.prototype.isScrollAtBottom = function() {
    var scrollTop, scrollView, scrollViewheight, slidingHeight, slidingView;
    scrollView = this.$().closest(".kdscrollview");
    slidingView = scrollView.find('> .kdview');
    scrollTop = scrollView.scrollTop();
    slidingHeight = slidingView.height();
    scrollViewheight = scrollView.height();
    if (slidingHeight - scrollViewheight === scrollTop) {
      return true;
    } else {
      return false;
    }
  };

  return KDListView;

})(KDView);

var KDListItemView,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

KDListItemView = (function(_super) {

  __extends(KDListItemView, _super);

  function KDListItemView(options, data) {
    var _ref, _ref1;
    if (options == null) {
      options = {};
    }
    options.type = (_ref = options.type) != null ? _ref : "default";
    options.cssClass = "kdlistitemview kdlistitemview-" + options.type + " " + ((_ref1 = options.cssClass) != null ? _ref1 : '');
    options.bind || (options.bind = "mouseenter mouseleave");
    options.childClass || (options.childClass = null);
    options.childOptions || (options.childOptions = {});
    KDListItemView.__super__.constructor.call(this, options, data);
    this.content = {};
  }

  KDListItemView.prototype.viewAppended = function() {
    var childClass, childOptions, _ref;
    _ref = this.getOptions(), childClass = _ref.childClass, childOptions = _ref.childOptions;
    if (childClass) {
      return this.addSubView(this.child = new childClass(childOptions, this.getData()));
    } else {
      return this.setPartial(this.partial(this.data));
    }
  };

  KDListItemView.prototype.partial = function() {
    return "<div class='kdlistitemview-default-content'>      <p>This is a default partial of <b>KDListItemView</b>,      you need to override this partial to have your custom content here.</p>    </div>";
  };

  KDListItemView.prototype.dim = function() {
    return this.getDomElement().addClass("dimmed");
  };

  KDListItemView.prototype.undim = function() {
    return this.getDomElement().removeClass("dimmed");
  };

  KDListItemView.prototype.highlight = function() {
    this.setClass("selected");
    return this.unsetClass("dimmed");
  };

  KDListItemView.prototype.removeHighlight = function() {
    this.unsetClass("selected");
    return this.unsetClass("dimmed");
  };

  KDListItemView.prototype.getItemDataId = function() {
    var _base;
    return typeof (_base = this.getData()).getId === "function" ? _base.getId() : void 0;
  };

  return KDListItemView;

})(KDView);

var KDTreeViewController,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

KDTreeViewController = (function(_super) {

  __extends(KDTreeViewController, _super);

  function KDTreeViewController(options, data) {
    this.makeItemSelected = __bind(this.makeItemSelected, this);
    this.itemsIndexed = {};
    this.itemsStructured = {};
    this.archivedItems || (this.archivedItems = {});
    this.itemsOrdered = [];
    this.selectedItems = [];
    this.lists = {};
    this.defaultExpandCollapseEvent = "dblClick";
    KDTreeViewController.__super__.constructor.call(this, options, data);
  }

  KDTreeViewController.prototype.loadView = function(mainView) {
    var _ref;
    if (((_ref = this.data) != null ? _ref.items : void 0) != null) {
      return this.instantiateItems(this.data.items, true);
    }
  };

  KDTreeViewController.prototype.addToIndexedItems = function(item) {
    return this.itemsIndexed[item.getItemDataId()] = item;
  };

  KDTreeViewController.prototype.removeFromIndexedItems = function(item) {
    return delete this.itemsIndexed[item.getItemDataId()];
  };

  KDTreeViewController.prototype.getIndexedItems = function() {
    return this.itemsIndexed;
  };

  KDTreeViewController.prototype.itemForId = function(id) {
    return this.itemsIndexed[id];
  };

  KDTreeViewController.prototype.itemForData = function(dataItem) {
    return this.itemForId(dataItem.id);
  };

  KDTreeViewController.prototype.addItemsToStructureAndOrder = function(items) {
    var baseChanges, changedTree, id, item, parentItem, subItems, _i, _j, _len, _len1, _name;
    for (_i = 0, _len = items.length; _i < _len; _i++) {
      item = items[_i];
      this.addToIndexedItems(item);
    }
    changedTree = {};
    baseChanges = [];
    for (_j = 0, _len1 = items.length; _j < _len1; _j++) {
      item = items[_j];
      parentItem = (this.itemForId([item.getParentNodeId()])) || this.itemsStructured;
      (parentItem.items || (parentItem.items = {}))[item.getItemDataId()] = item;
      if (parentItem.getData != null) {
        (changedTree[_name = parentItem.getItemDataId()] || (changedTree[_name] = [])).push(item);
      } else {
        baseChanges.push(item);
      }
    }
    this.addOrderedSubItems(baseChanges);
    for (id in changedTree) {
      if (!__hasProp.call(changedTree, id)) continue;
      subItems = changedTree[id];
      this.addOrderedSubItems(subItems, this.itemForId(id));
    }
    return {
      baseChanges: baseChanges,
      changedTree: changedTree
    };
  };

  KDTreeViewController.prototype.attachListeners = function(itemInstance) {
    var _this = this;
    this.listenTo({
      KDEventTypes: [
        {
          eventType: 'mousedown'
        }
      ],
      listenedToInstance: itemInstance,
      callback: this.itemClicked
    });
    this.listenTo({
      KDEventTypes: [
        {
          eventType: 'mouseup'
        }
      ],
      listenedToInstance: itemInstance,
      callback: this.itemMouseUp
    });
    return this.listenTo({
      KDEventTypes: [
        {
          eventType: 'ContextMenuFunction'
        }
      ],
      listenedToInstance: itemInstance,
      callback: function(publishingInstance, data) {
        var contextMenuDelegate, functionName;
        functionName = data.functionName, contextMenuDelegate = data.contextMenuDelegate;
        return typeof _this[functionName] === "function" ? _this[functionName](contextMenuDelegate, data) : void 0;
      }
    });
  };

  KDTreeViewController.prototype.instantiateItems = function(dataItems, reloadAll) {
    var itemData, newItems;
    newItems = (function() {
      var _i, _len, _results,
        _this = this;
      _results = [];
      for (_i = 0, _len = dataItems.length; _i < _len; _i++) {
        itemData = dataItems[_i];
        _results.push((function() {
          var itemInstance, _ref;
          if (!reloadAll) {
            itemInstance = (_this.itemForData(itemData)) || _this.archivedItems[itemData.path];
          }
          if (itemInstance == null) {
            itemInstance = new ((_ref = _this.getOptions().itemClass) != null ? _ref : KDTreeItemView)({
              delegate: _this.getView()
            }, itemData);
          }
          _this.attachListeners(itemInstance);
          return itemInstance;
        })());
      }
      return _results;
    }).call(this);
    if (reloadAll) {
      this.recreateAndAppendTreeStructure(newItems);
    }
    return newItems;
  };

  KDTreeViewController.prototype.removeAllItems = function() {
    var id, item, _ref;
    _ref = this.itemsIndexed;
    for (id in _ref) {
      if (!__hasProp.call(_ref, id)) continue;
      item = _ref[id];
      this.removeItem(item);
    }
    this.emptyArchive();
    return this.itemsStructured = {};
  };

  KDTreeViewController.prototype.recreateAndAppendTreeStructure = function(items) {
    var baseChanges, changedTree, id, item, parentItem, _i, _len, _ref, _results;
    _ref = this.addItemsToStructureAndOrder(items), baseChanges = _ref.baseChanges, changedTree = _ref.changedTree;
    for (_i = 0, _len = baseChanges.length; _i < _len; _i++) {
      item = baseChanges[_i];
      this.getView().appendTreeItem(item);
    }
    _results = [];
    for (id in changedTree) {
      if (!__hasProp.call(changedTree, id)) continue;
      _results.push(this.getView().addToSubTree((parentItem = this.itemForId(id)), this.getOrderedSubItems(parentItem)));
    }
    return _results;
  };

  KDTreeViewController.prototype.addTreeItem = function(treeItem) {
    if (treeItem instanceof KDTreeItemView) {
      return treeItem;
    } else {
      return log("you can't add non-KDTreeItemView type as a list item to KDTreeView");
    }
  };

  KDTreeViewController.prototype.refreshSubItemsOfItems = function(parentItems, subDataItems) {
    var baseChanges, changedTree, id, item, parentItem, subItems, _i, _len, _ref, _results;
    subItems = this.instantiateItems(subDataItems);
    _ref = this.addItemsToStructureAndOrder(subItems), baseChanges = _ref.baseChanges, changedTree = _ref.changedTree;
    for (_i = 0, _len = baseChanges.length; _i < _len; _i++) {
      item = baseChanges[_i];
      this.getView().appendTreeItem(item);
    }
    _results = [];
    for (id in changedTree) {
      if (!__hasProp.call(changedTree, id)) continue;
      _results.push(this.getView().addToSubTree((parentItem = this.itemForId(id)), this.getOrderedSubItems(parentItem)));
    }
    return _results;
  };

  KDTreeViewController.prototype.addSubItemsOfItems = function(parentItems, subDataItems) {
    var baseChanges, changedTree, id, item, items, parentItem, subItems, _i, _len, _ref, _results;
    subItems = this.instantiateItems(subDataItems);
    _ref = this.addItemsToStructureAndOrder(subItems), baseChanges = _ref.baseChanges, changedTree = _ref.changedTree;
    for (_i = 0, _len = baseChanges.length; _i < _len; _i++) {
      item = baseChanges[_i];
      this.getView().appendTreeItem(item);
    }
    _results = [];
    for (id in changedTree) {
      if (!__hasProp.call(changedTree, id)) continue;
      items = changedTree[id];
      parentItem = this.itemForId(id);
      _results.push(this.getView().addToSubTree(parentItem, items));
    }
    return _results;
  };

  KDTreeViewController.prototype.refreshSubItemsOfItem = function(parentItem, subDataItems, reloadAll) {
    if (!!reloadAll) {
      this.removeSubItemsOfItem(parentItem);
      return this.addSubItemsOfItem(parentItem, subDataItems, true);
    } else {
      this.archiveSubItemsOfItem(parentItem);
      this.addSubItemsOfItem(parentItem, subDataItems, false);
      return this.emptyArchive();
    }
  };

  KDTreeViewController.prototype.addSubItemsOfItem = function(parentItem, subDataItems, reloadAll) {
    var item, newItems, newItemsData, _base, _i, _j, _len, _len1;
    if (!!reloadAll) {
      if (!parentItem) {
        if (this.data.items == null) {
          this.data.items = [];
        }
        this.data.items = this.data.items.concat(subDataItems);
        return this.instantiateItems(subDataItems, true);
      }
      if (parentItem.getData().items == null) {
        parentItem.getData().items = {};
      }
      for (_i = 0, _len = subDataItems.length; _i < _len; _i++) {
        item = subDataItems[_i];
        parentItem.getData().items[item.title] = item;
      }
      newItems = this.instantiateItems(subDataItems, false);
      newItemsData = (function() {
        var _j, _len1, _results;
        _results = [];
        for (_j = 0, _len1 = newItems.length; _j < _len1; _j++) {
          item = newItems[_j];
          _results.push(item.getData());
        }
        return _results;
      })();
      this.addItemsToStructureAndOrder(newItems, newItemsData, parentItem.getData().id, parentItem.getData());
      this.getView().createSubTrees([parentItem].concat(newItems), this);
    } else {
      (_base = parentItem.getData()).items || (_base.items = {});
      for (_j = 0, _len1 = subDataItems.length; _j < _len1; _j++) {
        item = subDataItems[_j];
        parentItem.getData().items[item.title] = item;
      }
      newItems = this.instantiateItems(subDataItems, false);
      this.addItemsToStructureAndOrder(newItems, subDataItems, parentItem.getData().id, parentItem.getData());
      this.getView().createAndUnarchiveSubTrees([parentItem].concat(newItems), this);
    }
    return newItems;
  };

  KDTreeViewController.prototype.archiveItems = function(items) {
    var item, _i, _len, _results;
    _results = [];
    for (_i = 0, _len = items.length; _i < _len; _i++) {
      item = items[_i];
      _results.push(this.archivedItems[item.getData().id] = item);
    }
    return _results;
  };

  KDTreeViewController.prototype.archiveSubItemsOfItem = function(parentItem) {
    var orderedIndex, parentIndex;
    this.getView().archiveSubTree(parentItem, this);
    parentIndex = this.orderedIndex(parentItem.getData().id);
    orderedIndex = (this.orderedIndexOfLastSubItem(parentIndex)) || parentIndex;
    return this.removeItemsAtOrderedIndex(parentIndex + 1, orderedIndex - parentIndex);
  };

  KDTreeViewController.prototype.emptyArchive = function() {
    var id, item, _ref;
    _ref = this.archivedItems;
    for (id in _ref) {
      if (!__hasProp.call(_ref, id)) continue;
      item = _ref[id];
      item.isArchived = false;
    }
    return this.archivedItems = {};
  };

  KDTreeViewController.prototype.removeSubItemsOfItem = function(parentItem) {
    var id, item, _ref;
    this.getView().removeSubTree(parentItem, this);
    _ref = parentItem.items;
    for (id in _ref) {
      if (!__hasProp.call(_ref, id)) continue;
      item = _ref[id];
      this.removeItem(item);
    }
    return parentItem.items = {};
  };

  KDTreeViewController.prototype.removeItem = function(item) {
    var index, parentItem;
    this.removeSubItemsOfItem(item);
    this.getView().removeTreeItem(item);
    parentItem = this.getParentItem({
      forItem: item
    });
    if (parentItem != null) {
      delete parentItem.items[item.getData().id];
      if (item.isSelected()) {
        this.makeItemSelected(parentItem);
      }
    }
    index = this.orderedIndex(item.getData().id);
    if (index != null) {
      this.removeItemsAtOrderedIndex(index, 1);
    }
    return this.removeFromIndexedItems(item);
  };

  KDTreeViewController.prototype.registerItemType = function(treeItem) {
    return this.addedItemTypes[treeItem.constructor.name] = true;
  };

  KDTreeViewController.prototype.itemClicked = function(publishingInstance, event) {
    return this.itemMouseDown(publishingInstance, event);
  };

  KDTreeViewController.prototype.itemMouseDown = function(publishingInstance, event) {
    return this.itemMouseDownIsReceived(publishingInstance, event);
  };

  KDTreeViewController.prototype.itemMouseUp = function(publishingInstance, event) {
    return this.makeItemSelected(publishingInstance, event);
  };

  KDTreeViewController.prototype.makeItemSelected = function(publishingInstance) {
    if (publishingInstance == null) {
      return;
    }
    if (publishingInstance instanceof KDTreeItemView) {
      this.propagateEvent({
        KDEventType: "ItemSelectedEvent"
      }, publishingInstance);
      this.selectedItems = [publishingInstance];
      publishingInstance.setSelected();
      publishingInstance.highlight();
      this.undimSelection();
      return this.unselectAllExceptJustSelected();
    } else {
      return warn("FIX: ", publishingInstance, "is not a KDTreeItemView, check event listeners!");
    }
  };

  KDTreeViewController.prototype.makeAllItemsUnselected = function() {
    var item, _i, _len, _ref, _results;
    this.selectedItems = [];
    _ref = this.itemsOrdered;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      item = _ref[_i];
      item.setUnselected();
      _results.push(item.removeHighlight());
    }
    return _results;
  };

  KDTreeViewController.prototype.mouseDownOnKDView = function(publishingInstance, event) {
    if (publishingInstance.getDomElement().closest(".kdtreeview").length < 1) {
      return this.dimSelection();
    }
  };

  KDTreeViewController.prototype.dimSelection = function() {
    var selectedItem, _i, _len, _ref, _results;
    _ref = this.selectedItems;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      selectedItem = _ref[_i];
      _results.push(selectedItem.dim());
    }
    return _results;
  };

  KDTreeViewController.prototype.undimSelection = function() {
    var selectedItem, _i, _len, _ref, _results;
    _ref = this.selectedItems;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      selectedItem = _ref[_i];
      _results.push(selectedItem.undim());
    }
    return _results;
  };

  KDTreeViewController.prototype.goLeft = function() {
    var item;
    item = this.selectedItems[0];
    if (item.type !== "file") {
      return this.getView().collapseItem(item);
    }
  };

  KDTreeViewController.prototype.goUp = function() {
    var currentOrderedIndex;
    currentOrderedIndex = this.orderedIndex(this.selectedItems[0].getData().id);
    this.selectNextVisibleItem(currentOrderedIndex, -1);
    return this.getView().makeScrollIfNecessary(this.selectedItems[0]);
  };

  KDTreeViewController.prototype.goRight = function() {
    var item;
    item = this.selectedItems[0];
    if (item.type !== "file") {
      return this.getView().expandItem(item);
    }
  };

  KDTreeViewController.prototype.goDown = function() {
    var currentOrderedIndex;
    currentOrderedIndex = this.orderedIndex(this.selectedItems[0].getData().id);
    this.selectNextVisibleItem(currentOrderedIndex, 1);
    return this.getView().makeScrollIfNecessary(this.selectedItems[0]);
  };

  KDTreeViewController.prototype.isVisible = function(item) {
    var parentItem;
    if ((parentItem = this.itemForId(item.getParentNodeId())) == null) {
      return true;
    }
    if (!parentItem.expanded) {
      return false;
    }
    return this.isVisible(parentItem);
  };

  KDTreeViewController.prototype.unselectAllExceptJustSelected = function() {
    var item, justSelected, selectedItem, _i, _j, _len, _len1, _ref, _ref1, _results;
    _ref = this.itemsOrdered.slice(0);
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      item = _ref[_i];
      justSelected = false;
      _ref1 = this.selectedItems;
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        selectedItem = _ref1[_j];
        if (selectedItem === item) {
          justSelected = true;
        }
      }
      if (!justSelected) {
        item.setUnselected();
        if (!justSelected) {
          _results.push(item.removeHighlight());
        } else {
          _results.push(void 0);
        }
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };

  KDTreeViewController.prototype.selectItemAtIndex = function(index) {
    return this.selectNextVisibleItem(index - 1, 1);
  };

  KDTreeViewController.prototype.selectNextVisibleItem = function(startIndex, increment, event) {
    var nextItem;
    if ((nextItem = this.itemsOrdered[startIndex + increment]) == null) {
      return;
    }
    if (this.isVisible(nextItem)) {
      if (!(event != null ? event.shiftKey : void 0)) {
        this.makeAllItemsUnselected();
      }
      if ((this.selectedItems.indexOf(nextItem)) === -1 || (this.lastSelected.indexOf(nextItem)) !== -1) {
        return this.makeItemSelected(this.itemsOrdered[startIndex + increment], event);
      }
    }
    return this.selectNextVisibleItem(startIndex + increment, increment, event);
  };

  KDTreeViewController.prototype.getParentItem = function(_arg) {
    var forItem, forItemData, _ref;
    forItemData = _arg.forItemData, forItem = _arg.forItem;
    if (forItem) {
      forItemData = forItem.getData();
    }
    return (_ref = this.itemForId(forItemData != null ? forItemData.parentId : void 0)) != null ? _ref : null;
  };

  KDTreeViewController.prototype.baseItem = function(itemData) {
    if (itemData.parentId == null) {
      return itemData;
    }
    return this.baseItem((this.itemForId(itemData.parentId)).data);
  };

  KDTreeViewController.prototype.orderedIndex = function(itemId) {
    var index, item, _i, _len, _ref;
    _ref = this.itemsOrdered;
    for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
      item = _ref[index];
      if (item.getData().id === itemId) {
        return index;
      }
    }
  };

  KDTreeViewController.prototype.orderedIndexOfFirstSubItem = function(parentOrderedIndex) {
    var parentId, _ref, _ref1;
    parentId = (_ref = this.itemsOrdered[parentOrderedIndex]) != null ? _ref.getData().id : void 0;
    if (((_ref1 = this.itemsOrdered[parentOrderedIndex + 1]) != null ? _ref1.getData().parentId : void 0) === parentId) {
      return parentOrderedIndex + 1;
    }
    return void 0;
  };

  KDTreeViewController.prototype.orderedIndexOfLastSubItem = function(parentOrderedIndex) {
    var index, item, itemsFromParent, parentId, _i, _len, _ref, _ref1, _ref2;
    parentId = (_ref = this.itemsOrdered[parentOrderedIndex]) != null ? _ref.getData().id : void 0;
    if (parentId == null) {
      return this.itemsOrdered.length;
    }
    itemsFromParent = [];
    if (this.itemHasAncestor((_ref1 = this.itemsOrdered[parentOrderedIndex + 1]) != null ? _ref1.getItemDataId() : void 0, parentId)) {
      itemsFromParent = this.itemsOrdered.slice(parentOrderedIndex + 1, (this.itemsOrdered.length - 1) + 1 || 9e9);
    }
    for (index = _i = 0, _len = itemsFromParent.length; _i < _len; index = ++_i) {
      item = itemsFromParent[index];
      if (!this.itemHasAncestor((_ref2 = itemsFromParent[index + 1]) != null ? _ref2.getData().id : void 0, parentId)) {
        return this.orderedIndex(item.getData().id);
      }
    }
    return void 0;
  };

  KDTreeViewController.prototype.itemHasAncestor = function(itemId, ancestorId) {
    var parentId, _ref;
    if ((parentId = (_ref = this.itemsOrdered[this.orderedIndex(itemId)]) != null ? _ref.getParentNodeId() : void 0) == null) {
      return false;
    }
    if (parentId === ancestorId) {
      return true;
    }
    return this.itemHasAncestor(parentId, ancestorId);
  };

  KDTreeViewController.prototype.numberOfSubItems = function(parentOrderedIndex) {
    return ((this.orderedIndexOfLastSubItem(parentOrderedIndex)) || parentOrderedIndex) - parentOrderedIndex;
  };

  KDTreeViewController.prototype.insertOrderedItemsAtIndex = function(items, insertionIndex) {
    return this.itemsOrdered = [].concat(this.itemsOrdered.slice(0, insertionIndex), items, this.itemsOrdered.slice(insertionIndex, this.itemsOrdered.length + 1 || 9e9));
  };

  KDTreeViewController.prototype.removeItemsAtOrderedIndex = function(itemIndex, numberToRemove) {
    if (numberToRemove == null) {
      numberToRemove = 1;
    }
    if (itemIndex != null) {
      return this.itemsOrdered.splice(itemIndex, numberToRemove);
    }
  };

  KDTreeViewController.prototype.addOrderedSubItems = function(items, parentItem) {
    var insertionIndex, parentOrderedIndex;
    parentOrderedIndex = this.orderedIndex(parentItem != null ? parentItem.getData().id : void 0);
    insertionIndex = ((this.orderedIndexOfLastSubItem(parentOrderedIndex)) || parentOrderedIndex) + 1;
    return this.insertOrderedItemsAtIndex(items, insertionIndex);
  };

  KDTreeViewController.prototype.getOrderedSubItems = function(parentItem) {
    var firstSubItemIndex, lastSubItemIndex, parentOrderedIndex;
    parentOrderedIndex = this.orderedIndex(parentItem.getItemDataId());
    firstSubItemIndex = this.orderedIndexOfFirstSubItem(parentOrderedIndex);
    lastSubItemIndex = this.orderedIndexOfLastSubItem(parentOrderedIndex);
    if (!firstSubItemIndex || !lastSubItemIndex) {
      return [];
    }
    return this.itemsOrdered.slice(firstSubItemIndex, lastSubItemIndex + 1 || 9e9) || [];
  };

  KDTreeViewController.prototype.getOrderedItemsData = function(items) {
    var item, _i, _len, _results;
    if (items == null) {
      items = this.itemsOrdered;
    }
    _results = [];
    for (_i = 0, _len = items.length; _i < _len; _i++) {
      item = items[_i];
      _results.push(item.getData());
    }
    return _results;
  };

  KDTreeViewController.prototype.traverseTreeByProperty = function(property, pathArray) {
    var id, recursiveSelectNextNode,
      _this = this;
    recursiveSelectNextNode = function(children) {
      var child, id, nextNodePropertyValue;
      if (children == null) {
        children = _this.itemsStructured.items;
      }
      nextNodePropertyValue = pathArray.shift();
      for (id in children) {
        if (!__hasProp.call(children, id)) continue;
        child = children[id];
        if (child.getData()[property] === nextNodePropertyValue) {
          if (pathArray.length < 1) {
            return id;
          } else {
            return recursiveSelectNextNode(child.items);
          }
        }
      }
    };
    id = recursiveSelectNextNode();
    if (!$.isArray(id)) {
      return id;
    }
    return id = null;
  };

  KDTreeViewController.prototype.treePathArrayForId = function(property, id) {
    var pathArray, recursivePushParentPropertyValue,
      _this = this;
    pathArray = [];
    recursivePushParentPropertyValue = function(itemData) {
      var parentData, parentId, _ref;
      pathArray.unshift(itemData[property]);
      if (((parentId = itemData.parentId) != null) && (parentData = (_ref = _this.itemForId(parentId)) != null ? _ref.getData() : void 0)) {
        return recursivePushParentPropertyValue(parentData);
      }
    };
    recursivePushParentPropertyValue((this.itemForId(id)).getData());
    return pathArray;
  };

  KDTreeViewController.prototype.itemMouseDownIsReceived = function(publishingInstance, event) {};

  return KDTreeViewController;

})(KDViewController);




var KDTreeItemView,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

KDTreeItemView = (function(_super) {

  __extends(KDTreeItemView, _super);

  function KDTreeItemView(options, data) {
    if (options == null) {
      options = {};
    }
    if (data == null) {
      data = {};
    }
    options.bind || (options.bind = "");
    options.cssClass || (options.cssClass = "");
    data.type || (data.type = "default");
    options.bind = "mousedown mouseup click " + options.bind;
    options.cssClass = "kdtreeitemview " + data.type + " " + options.cssClass;
    KDTreeItemView.__super__.constructor.call(this, options, data);
  }

  KDTreeItemView.prototype.getItemDataId = function() {
    return this.getData().id;
  };

  KDTreeItemView.prototype.getParentNodeId = function() {
    return this.getData().parentId;
  };

  KDTreeItemView.prototype.dim = function() {
    return this.getDomElement().addClass("dimmed");
  };

  KDTreeItemView.prototype.undim = function() {
    return this.getDomElement().removeClass("dimmed");
  };

  KDTreeItemView.prototype.isSelected = function() {
    return this.selected;
  };

  KDTreeItemView.prototype.setSelected = function() {
    return this.selected = true;
  };

  KDTreeItemView.prototype.setUnselected = function() {
    return this.selected = false;
  };

  KDTreeItemView.prototype.highlight = function() {
    this.getDomElement().addClass("selected");
    return this.getDomElement().removeClass("dimmed");
  };

  KDTreeItemView.prototype.removeHighlight = function() {
    this.getDomElement().removeClass("selected");
    return this.getDomElement().removeClass("dimmed");
  };

  KDTreeItemView.prototype.viewAppended = function() {
    this.getDomElement().append(this.partial(this.data));
    return KDTreeItemView.__super__.viewAppended.apply(this, arguments);
  };

  KDTreeItemView.prototype.partial = function(data) {
    return $("<div class='default clearfix'>        <span class='arrow arrow-right'></span>        <span class='title'>" + data.title + "</span>      </div>");
  };

  return KDTreeItemView;

})(KDView);

/*
todo:

  - multipleselection is broken with implementing it as optional
*/

var JTreeViewController,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

JTreeViewController = (function(_super) {
  var cacheDragHelper, dragHelper, keyMap;

  __extends(JTreeViewController, _super);

  keyMap = function() {
    return {
      37: "left",
      38: "up",
      39: "right",
      40: "down",
      8: "backspace",
      9: "tab",
      13: "enter",
      27: "escape"
    };
  };

  dragHelper = null;

  cacheDragHelper = (function() {
    dragHelper = document.createElement('img');
    dragHelper.src = '/images/multiple-item-drag-helper.png';
    return dragHelper.width = 110;
  })();

  function JTreeViewController(options, data) {
    var o, _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6;
    if (options == null) {
      options = {};
    }
    o = options;
    o.view || (o.view = new KDScrollView({
      cssClass: "jtreeview-wrapper"
    }));
    o.listViewControllerClass || (o.listViewControllerClass = KDListViewController);
    o.treeItemClass || (o.treeItemClass = JTreeItemView);
    o.listViewClass || (o.listViewClass = JTreeView);
    o.itemChildClass || (o.itemChildClass = null);
    o.itemChildOptions || (o.itemChildOptions = {});
    o.nodeIdPath || (o.nodeIdPath = "id");
    o.nodeParentIdPath || (o.nodeParentIdPath = "parentId");
    if ((_ref = o.contextMenu) == null) {
      o.contextMenu = false;
    }
    if ((_ref1 = o.multipleSelection) == null) {
      o.multipleSelection = false;
    }
    if ((_ref2 = o.addListsCollapsed) == null) {
      o.addListsCollapsed = false;
    }
    if ((_ref3 = o.sortable) == null) {
      o.sortable = false;
    }
    if ((_ref4 = o.putDepthInfo) == null) {
      o.putDepthInfo = false;
    }
    if ((_ref5 = o.addOrphansToRoot) == null) {
      o.addOrphansToRoot = true;
    }
    if ((_ref6 = o.dragdrop) == null) {
      o.dragdrop = false;
    }
    JTreeViewController.__super__.constructor.call(this, o, data);
    this.listData = {};
    this.listControllers = {};
    this.nodes = {};
    this.indexedNodes = [];
    this.selectedNodes = [];
  }

  JTreeViewController.prototype.loadView = function(treeView) {
    this.initTree(this.getData());
    this.setKeyView();
    this.setMainListeners();
    return this.registerBoundaries();
  };

  JTreeViewController.prototype.registerBoundaries = function() {
    return this.boundaries = {
      top: this.getView().getY(),
      left: this.getView().getX(),
      width: this.getView().getWidth(),
      height: this.getView().getHeight()
    };
  };

  /*
    HELPERS
  */


  JTreeViewController.prototype.initTree = function(nodes) {
    var node, _i, _len, _results;
    this.removeAllNodes();
    _results = [];
    for (_i = 0, _len = nodes.length; _i < _len; _i++) {
      node = nodes[_i];
      _results.push(this.addNode(node));
    }
    return _results;
  };

  JTreeViewController.prototype.logTreeStructure = function() {
    var node, o, _i, _len, _ref, _results;
    o = this.getOptions();
    _ref = this.indexedNodes;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      node = _ref[_i];
      _results.push(log(this.getNodeId(node), this.getNodePId(node), node.depth));
    }
    return _results;
  };

  JTreeViewController.prototype.getNodeId = function(nodeData) {
    return nodeData[this.getOptions().nodeIdPath];
  };

  JTreeViewController.prototype.getNodePId = function(nodeData) {
    return nodeData[this.getOptions().nodeParentIdPath];
  };

  JTreeViewController.prototype.repairIds = function(nodeData) {
    var idPath, options, pIdPath;
    options = this.getOptions();
    idPath = options.nodeIdPath;
    pIdPath = options.nodeParentIdPath;
    nodeData[idPath] || (nodeData[idPath] = this.utils.getUniqueId());
    nodeData[idPath] = "" + (this.getNodeId(nodeData));
    nodeData[pIdPath] = this.getNodePId(nodeData) ? "" + (this.getNodePId(nodeData)) : "0";
    this.nodes[this.getNodeId(nodeData)] = {};
    if (options.putDepthInfo) {
      if (this.nodes[this.getNodePId(nodeData)]) {
        nodeData.depth = this.nodes[this.getNodePId(nodeData)].getData().depth + 1;
      } else {
        nodeData.depth = 0;
      }
    }
    if (this.getNodePId(nodeData) !== "0" && !this.nodes[this.getNodePId(nodeData)]) {
      if (options.addOrphansToRoot) {
        nodeData[pIdPath] = "0";
      } else {
        nodeData = false;
      }
    }
    return nodeData;
  };

  JTreeViewController.prototype.isNodeVisible = function(nodeView) {
    var nodeData, parentNode;
    nodeData = nodeView.getData();
    parentNode = this.nodes[this.getNodePId(nodeData)];
    if (parentNode) {
      if (parentNode.expanded) {
        return this.isNodeVisible(parentNode);
      } else {
        return false;
      }
    } else {
      return true;
    }
  };

  JTreeViewController.prototype.areSibling = function(node1, node2) {
    var node1PId, node2PId;
    node1PId = this.getNodePId(node1.getData());
    node2PId = this.getNodePId(node2.getData());
    return node1PId === node2PId;
  };

  /*
    DECORATORS
  */


  JTreeViewController.prototype.setFocusState = function() {
    var view;
    view = this.getView();
    this.getSingleton("windowController").addLayer(view);
    return view.unsetClass("dim");
  };

  JTreeViewController.prototype.setBlurState = function() {
    var view;
    view = this.getView();
    this.getSingleton("windowController").removeLayer(view);
    return view.setClass("dim");
  };

  /*
    CRUD OPERATIONS FOR NODES
  */


  JTreeViewController.prototype.addNode = function(nodeData, index) {
    var list, parentId;
    if (this.nodes[this.getNodeId(nodeData)]) {
      return;
    }
    nodeData = this.repairIds(nodeData);
    if (!nodeData) {
      return;
    }
    this.getData().push(nodeData);
    this.addIndexedNode(nodeData);
    this.registerListData(nodeData);
    parentId = this.getNodePId(nodeData);
    if (this.listControllers[parentId]) {
      list = this.listControllers[parentId].getListView();
    } else {
      list = this.createList(parentId).getListView();
      this.addSubList(this.nodes[parentId], parentId);
    }
    return list.addItem(nodeData, index);
  };

  JTreeViewController.prototype.addNodes = function(nodes) {
    var node, _i, _len, _results;
    _results = [];
    for (_i = 0, _len = nodes.length; _i < _len; _i++) {
      node = nodes[_i];
      _results.push(this.addNode(node));
    }
    return _results;
  };

  JTreeViewController.prototype.removeNode = function(id) {
    var index, nodeData, nodeIndexToRemove, nodeToRemove, parentId, _i, _len, _ref;
    nodeIndexToRemove = null;
    _ref = this.getData();
    for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
      nodeData = _ref[index];
      if (this.getNodeId(nodeData) === id) {
        this.removeIndexedNode(nodeData);
        nodeIndexToRemove = index;
      }
    }
    if (nodeIndexToRemove != null) {
      nodeToRemove = this.getData().splice(nodeIndexToRemove, 1)[0];
      this.removeChildNodes(id);
      parentId = this.getNodePId(nodeToRemove);
      this.listControllers[parentId].getListView().removeItem(this.nodes[id]);
      return delete this.nodes[id];
    }
  };

  JTreeViewController.prototype.removeNodeView = function(nodeView) {
    return this.removeNode(this.getNodeId(nodeView.getData()));
  };

  JTreeViewController.prototype.removeAllNodes = function() {
    var _this = this;
    if (this.listControllers["0"]) {
      return this.listControllers["0"].itemsOrdered.forEach(function(itemView) {
        return _this.removeNodeView(itemView);
      });
    }
  };

  JTreeViewController.prototype.removeChildNodes = function(id) {
    var childNodeId, childNodeIdsToRemove, index, nodeData, _i, _j, _len, _len1, _ref, _ref1;
    childNodeIdsToRemove = [];
    _ref = this.getData();
    for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
      nodeData = _ref[index];
      if (this.getNodePId(nodeData) === id) {
        childNodeIdsToRemove.push(this.getNodeId(nodeData));
      }
    }
    for (_j = 0, _len1 = childNodeIdsToRemove.length; _j < _len1; _j++) {
      childNodeId = childNodeIdsToRemove[_j];
      this.removeNode(childNodeId);
    }
    if ((_ref1 = this.listControllers[id]) != null) {
      _ref1.getView().destroy();
    }
    delete this.listControllers[id];
    return delete this.listData[id];
  };

  JTreeViewController.prototype.nodeWasAdded = function(nodeView) {
    var id, nodeData, parentId;
    nodeData = nodeView.getData();
    if (this.getOptions().dragdrop) {
      nodeView.$().attr("draggable", "true");
    }
    id = nodeData.id, parentId = nodeData.parentId;
    this.nodes[this.getNodeId(nodeData)] = nodeView;
    if (this.nodes[this.getNodePId(nodeData)]) {
      if (!this.getOptions().addListsCollapsed) {
        this.expand(this.nodes[this.getNodePId(nodeData)]);
      }
      this.nodes[this.getNodePId(nodeData)].decorateSubItemsState();
    }
    if (!this.listControllers[id]) {
      return;
    }
    return this.addSubList(nodeView, id);
  };

  JTreeViewController.prototype.getChildNodes = function(aParentNode) {
    var children,
      _this = this;
    children = [];
    this.indexedNodes.forEach(function(node, index) {
      if (_this.getNodePId(node) === _this.getNodeId(aParentNode)) {
        return children.push({
          node: node,
          index: index
        });
      }
    });
    if (children.length) {
      return children;
    } else {
      return false;
    }
  };

  JTreeViewController.prototype.addIndexedNode = function(nodeData) {
    var getPreviousNeighbor, neighbor, neighborIndex, parentNodeView, prevNeighbor,
      _this = this;
    neighbor = null;
    getPreviousNeighbor = function(aParentNode) {
      var children, lastChild;
      neighbor = aParentNode;
      children = _this.getChildNodes(aParentNode);
      if (children) {
        lastChild = children[children.length - 1];
        neighbor = getPreviousNeighbor(lastChild.node);
      }
      return neighbor;
    };
    parentNodeView = this.nodes[this.getNodePId(nodeData)];
    if (parentNodeView) {
      prevNeighbor = getPreviousNeighbor(parentNodeView.getData());
      neighborIndex = this.indexedNodes.indexOf(prevNeighbor);
      return this.indexedNodes.splice(neighborIndex + 1, 0, nodeData);
    } else {
      return this.indexedNodes.push(nodeData);
    }
  };

  JTreeViewController.prototype.removeIndexedNode = function(nodeData) {
    var index;
    if (__indexOf.call(this.indexedNodes, nodeData) >= 0) {
      index = this.indexedNodes.indexOf(nodeData);
      if (index - 1 >= 0) {
        this.selectNode(this.nodes[this.getNodeId(this.indexedNodes[index - 1])]);
      }
      this.indexedNodes.splice(index, 1);
      if (this.nodes[this.getNodePId(nodeData)] && !this.getChildNodes(this.nodes[this.getNodePId(nodeData)].getData())) {
        return this.nodes[this.getNodePId(nodeData)].decorateSubItemsState(false);
      }
    }
  };

  /*
    CREATING LISTS
  */


  JTreeViewController.prototype.registerListData = function(node) {
    var parentId, _base;
    parentId = this.getNodePId(node);
    (_base = this.listData)[parentId] || (_base[parentId] = []);
    return this.listData[parentId].push(node);
  };

  JTreeViewController.prototype.createList = function(listId, listItems) {
    var options;
    options = this.getOptions();
    this.listControllers[listId] = new options.listViewControllerClass({
      id: "" + (this.getId()) + "_" + listId,
      wrapper: false,
      scrollView: false,
      selection: false,
      view: new options.listViewClass({
        tagName: "ul",
        type: options.type,
        itemClass: options.treeItemClass,
        itemChildClass: options.itemChildClass,
        itemChildOptions: options.itemChildOptions
      })
    }, {
      items: listItems
    });
    this.setListenersForList(listId);
    return this.listControllers[listId];
  };

  JTreeViewController.prototype.addSubList = function(nodeView, id) {
    var listToBeAdded, o;
    o = this.getOptions();
    listToBeAdded = this.listControllers[id].getView();
    if (nodeView) {
      nodeView.$().after(listToBeAdded.$());
      listToBeAdded.parentIsInDom = true;
      listToBeAdded.emit('viewAppended');
      if (o.addListsCollapsed) {
        return this.collapse(nodeView);
      } else {
        return this.expand(nodeView);
      }
    } else {
      return this.getView().addSubView(listToBeAdded);
    }
  };

  /*
    REGISTERING LISTENERS
  */


  JTreeViewController.prototype.setMainListeners = function() {
    var _this = this;
    this.getSingleton("windowController").on("ReceivedMouseUpElsewhere", function(event) {
      return _this.mouseUp(event);
    });
    return this.getView().on("ReceivedClickElsewhere", function() {
      return _this.setBlurState();
    });
  };

  JTreeViewController.prototype.setListenersForList = function(listId) {
    var _this = this;
    this.listControllers[listId].getView().on('ItemWasAdded', function(view, index) {
      return _this.setItemListeners(view, index);
    });
    this.listenTo({
      KDEventTypes: ["ItemSelectionPerformed", "ItemDeselectionPerformed"],
      listenedToInstance: this.listControllers[listId],
      callback: function(listController, _arg, _arg1) {
        var event, items, subscription;
        event = _arg.event, items = _arg.items;
        subscription = _arg1.subscription;
        switch (subscription.KDEventType) {
          case "ItemSelectionPerformed":
            return _this.organizeSelectedNodes(listController, items, event);
          case "ItemDeselectionPerformed":
            return _this.deselectNodes(listController, items, event);
        }
      }
    });
    return this.listenTo({
      KDEventTypes: 'KeyDownOnTreeView',
      listenedToInstance: this.listControllers[listId].getListView(),
      callback: function(treeview, event) {
        return _this.keyEventHappened(event);
      }
    });
  };

  JTreeViewController.prototype.setItemListeners = function(view, index) {
    var mouseEvents,
      _this = this;
    view.on("viewAppended", this.nodeWasAdded.bind(this, view));
    mouseEvents = ["dblclick", "click", "mousedown", "mouseup", "mouseenter", "mousemove"];
    if (this.getOptions().contextMenu) {
      mouseEvents.push("contextmenu");
    }
    if (this.getOptions().dragdrop) {
      mouseEvents = mouseEvents.concat(["dragstart", "dragenter", "dragleave", "dragend", "dragover", "drop"]);
    }
    return this.listenTo({
      KDEventTypes: mouseEvents,
      listenedToInstance: view,
      callback: function(pubInst, event) {
        return _this.mouseEventHappened(pubInst, event);
      }
    });
  };

  /*
    NODE SELECTION
  */


  JTreeViewController.prototype.organizeSelectedNodes = function(listController, nodes, event) {
    var node, _i, _len, _results;
    if (event == null) {
      event = {};
    }
    if (!((event.metaKey || event.ctrlKey || event.shiftKey) && this.getOptions().multipleSelection)) {
      this.deselectAllNodes(listController);
    }
    _results = [];
    for (_i = 0, _len = nodes.length; _i < _len; _i++) {
      node = nodes[_i];
      if (__indexOf.call(this.selectedNodes, node) < 0) {
        _results.push(this.selectedNodes.push(node));
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };

  JTreeViewController.prototype.deselectNodes = function(listController, nodes, event) {
    var node, _i, _len, _results;
    _results = [];
    for (_i = 0, _len = nodes.length; _i < _len; _i++) {
      node = nodes[_i];
      if (__indexOf.call(this.selectedNodes, node) >= 0) {
        _results.push(this.selectedNodes.splice(this.selectedNodes.indexOf(node), 1));
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };

  JTreeViewController.prototype.deselectAllNodes = function(exceptThisController) {
    var id, listController, _ref;
    _ref = this.listControllers;
    for (id in _ref) {
      if (!__hasProp.call(_ref, id)) continue;
      listController = _ref[id];
      if (listController !== exceptThisController) {
        listController.deselectAllItems();
      }
    }
    return this.selectedNodes = [];
  };

  JTreeViewController.prototype.selectNode = function(nodeView, event, setFocus) {
    if (setFocus == null) {
      setFocus = true;
    }
    if (!nodeView) {
      return;
    }
    if (setFocus) {
      this.setFocusState();
    }
    return this.listControllers[this.getNodePId(nodeView.getData())].selectItem(nodeView, event);
  };

  JTreeViewController.prototype.deselectNode = function(nodeView, event) {
    return this.listControllers[this.getNodePId(nodeView.getData())].deselectSingleItem(nodeView, event);
  };

  JTreeViewController.prototype.selectFirstNode = function() {
    return this.selectNode(this.nodes[this.getNodeId(this.indexedNodes[0])]);
  };

  JTreeViewController.prototype.selectNodesByRange = function(node1, node2) {
    var indicesToBeSliced, itemsToBeSelected, node, _i, _len, _results;
    indicesToBeSliced = [this.indexedNodes.indexOf(node1.getData()), this.indexedNodes.indexOf(node2.getData())];
    indicesToBeSliced.sort(function(a, b) {
      return a - b;
    });
    itemsToBeSelected = this.indexedNodes.slice(indicesToBeSliced[0], indicesToBeSliced[1] + 1);
    _results = [];
    for (_i = 0, _len = itemsToBeSelected.length; _i < _len; _i++) {
      node = itemsToBeSelected[_i];
      _results.push(this.selectNode(this.nodes[this.getNodeId(node)], {
        shiftKey: true
      }));
    }
    return _results;
  };

  /*
    COLLAPSE / EXPAND
  */


  JTreeViewController.prototype.toggle = function(nodeView) {
    if (nodeView.expanded) {
      return this.collapse(nodeView);
    } else {
      return this.expand(nodeView);
    }
  };

  JTreeViewController.prototype.expand = function(nodeView) {
    var nodeData, _ref;
    nodeData = nodeView.getData();
    nodeView.expand();
    return (_ref = this.listControllers[this.getNodeId(nodeData)]) != null ? _ref.getView().expand() : void 0;
  };

  JTreeViewController.prototype.collapse = function(nodeView) {
    var nodeData, _ref,
      _this = this;
    nodeData = nodeView.getData();
    return (_ref = this.listControllers[this.getNodeId(nodeData)]) != null ? _ref.getView().collapse(function() {
      return nodeView.collapse();
    }) : void 0;
  };

  /*
    DND UI FEEDBACKS
  */


  JTreeViewController.prototype.showDragOverFeedback = (function() {
    return __utils.throttle(function(nodeView, event) {
      var nodeData, _ref, _ref1;
      nodeData = nodeView.getData();
      if (nodeData.type !== "file") {
        nodeView.setClass("drop-target");
      } else {
        if ((_ref = this.nodes[nodeData.parentPath]) != null) {
          _ref.setClass("drop-target");
        }
        if ((_ref1 = this.listControllers[nodeData.parentPath]) != null) {
          _ref1.getListView().setClass("drop-target");
        }
      }
      return nodeView.setClass("items-hovering");
    }, 100);
  })();

  JTreeViewController.prototype.clearDragOverFeedback = (function() {
    return __utils.throttle(function(nodeView, event) {
      var nodeData, _ref, _ref1;
      nodeData = nodeView.getData();
      if (nodeData.type !== "file") {
        nodeView.unsetClass("drop-target");
      } else {
        if ((_ref = this.nodes[nodeData.parentPath]) != null) {
          _ref.unsetClass("drop-target");
        }
        if ((_ref1 = this.listControllers[nodeData.parentPath]) != null) {
          _ref1.getListView().unsetClass("drop-target");
        }
      }
      return nodeView.unsetClass("items-hovering");
    }, 100);
  })();

  JTreeViewController.prototype.clearAllDragFeedback = function() {
    var _this = this;
    return this.utils.wait(101, function() {
      var listController, nodeView, path, _ref, _ref1, _results;
      _this.getView().$('.drop-target').removeClass("drop-target");
      _this.getView().$('.items-hovering').removeClass("items-hovering");
      _ref = _this.listControllers;
      for (path in _ref) {
        listController = _ref[path];
        listController.getListView().unsetClass("drop-target");
      }
      _ref1 = _this.nodes;
      _results = [];
      for (path in _ref1) {
        nodeView = _ref1[path];
        _results.push(nodeView.unsetClass("items-hovering drop-target"));
      }
      return _results;
    });
  };

  /*
    HANDLING MOUSE EVENTS
  */


  JTreeViewController.prototype.mouseEventHappened = function(nodeView, event) {
    switch (event.type) {
      case "mouseenter":
        return this.mouseEnter(nodeView, event);
      case "dblclick":
        return this.dblClick(nodeView, event);
      case "click":
        return this.click(nodeView, event);
      case "mousedown":
        return this.mouseDown(nodeView, event);
      case "mouseup":
        return this.mouseUp(nodeView, event);
      case "mousemove":
        return this.mouseMove(nodeView, event);
      case "contextmenu":
        return this.contextMenu(nodeView, event);
      case "dragstart":
        return this.dragStart(nodeView, event);
      case "dragenter":
        return this.dragEnter(nodeView, event);
      case "dragleave":
        return this.dragLeave(nodeView, event);
      case "dragover":
        return this.dragOver(nodeView, event);
      case "dragend":
        return this.dragEnd(nodeView, event);
      case "drop":
        return this.drop(nodeView, event);
    }
  };

  JTreeViewController.prototype.dblClick = function(nodeView, event) {
    return this.toggle(nodeView);
  };

  JTreeViewController.prototype.click = function(nodeView, event) {
    if (/arrow/.test(event.target.className)) {
      this.toggle(nodeView);
      return this.selectedItems;
    }
    this.lastEvent = event;
    if (!((event.metaKey || event.ctrlKey || event.shiftKey) && this.getOptions().multipleSelection)) {
      this.deselectAllNodes();
    }
    if (nodeView != null) {
      if (event.shiftKey && this.selectedNodes.length > 0 && this.getOptions().multipleSelection) {
        this.selectNodesByRange(this.selectedNodes[0], nodeView);
      } else {
        this.selectNode(nodeView, event);
      }
    }
    return this.selectedItems;
  };

  JTreeViewController.prototype.contextMenu = function(nodeView, event) {};

  JTreeViewController.prototype.mouseDown = function(nodeView, event) {
    var _this = this;
    this.lastEvent = event;
    if (__indexOf.call(this.selectedNodes, nodeView) < 0) {
      this.mouseIsDown = true;
      this.cancelDrag = true;
      this.mouseDownTempItem = nodeView;
      return this.mouseDownTimer = setTimeout(function() {
        _this.mouseIsDown = false;
        _this.cancelDrag = false;
        _this.mouseDownTempItem = null;
        return _this.selectNode(nodeView, event);
      }, 1000);
    } else {
      this.mouseIsDown = false;
      return this.mouseDownTempItem = null;
    }
  };

  JTreeViewController.prototype.mouseUp = function(event) {
    clearTimeout(this.mouseDownTimer);
    this.mouseIsDown = false;
    this.cancelDrag = false;
    return this.mouseDownTempItem = null;
  };

  JTreeViewController.prototype.mouseEnter = function(nodeView, event) {
    clearTimeout(this.mouseDownTimer);
    if (this.mouseIsDown && this.getOptions().multipleSelection) {
      this.cancelDrag = true;
      if (!((event.metaKey || event.ctrlKey || event.shiftKey) && this.getOptions().multipleSelection)) {
        this.deselectAllNodes();
      }
      return this.selectNodesByRange(this.mouseDownTempItem, nodeView);
    }
  };

  /*
    HANDLING DND
  */


  JTreeViewController.prototype.dragStart = function(nodeView, event) {
    var e, node, transferredData;
    if (this.cancelDrag) {
      event.preventDefault();
      event.stopPropagation();
      return false;
    }
    this.dragIsActive = true;
    e = event.originalEvent;
    e.dataTransfer.effectAllowed = 'copyMove';
    transferredData = (function() {
      var _i, _len, _ref, _results;
      _ref = this.selectedNodes;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        node = _ref[_i];
        _results.push(this.getNodeId(node.getData()));
      }
      return _results;
    }).call(this);
    e.dataTransfer.setData('Text', transferredData.join());
    if (this.selectedNodes.length > 1) {
      e.dataTransfer.setDragImage(dragHelper, -10, 0);
    }
    return nodeView.setClass("drag-started");
  };

  JTreeViewController.prototype.dragEnter = function(nodeView, event) {};

  JTreeViewController.prototype.dragLeave = function(nodeView, event) {};

  JTreeViewController.prototype.dragOver = function(nodeView, event) {
    return false;
  };

  JTreeViewController.prototype.dragEnd = function(nodeView, event) {
    this.dragIsActive = false;
    return nodeView.unsetClass("drag-started");
  };

  JTreeViewController.prototype.drop = function(nodeView, event) {
    this.dragIsActive = false;
    event.preventDefault();
    event.stopPropagation();
    return false;
  };

  /*
    HANDLING KEY EVENTS
  */


  JTreeViewController.prototype.setKeyView = function() {
    if (this.listControllers[0]) {
      return this.getSingleton("windowController").setKeyView(this.listControllers[0].getListView());
    }
  };

  JTreeViewController.prototype.keyEventHappened = function(event) {
    var key, nodeView, _base;
    key = keyMap()[event.which];
    nodeView = this.selectedNodes[0];
    this.emit("keyEventPerformedOnTreeView", event);
    if (!nodeView) {
      return;
    }
    switch (key) {
      case "down":
        this.performDownKey(nodeView, event);
        break;
      case "up":
        this.performUpKey(nodeView, event);
        break;
      case "left":
        this.performLeftKey(nodeView, event);
        break;
      case "right":
        this.performRightKey(nodeView, event);
        break;
      case "backspace":
        this.performBackspaceKey(nodeView, event);
        break;
      case "enter":
        this.performEnterKey(nodeView, event);
        break;
      case "escape":
        this.performEscapeKey(nodeView, event);
        break;
      case "tab":
        return false;
    }
    switch (key) {
      case "down":
      case "up":
        event.preventDefault();
        return typeof (_base = this.getView()).scrollToSubView === "function" ? _base.scrollToSubView(nodeView) : void 0;
    }
  };

  JTreeViewController.prototype.performDownKey = function(nodeView, event) {
    var nextIndex, nextNode, nodeData;
    if (this.selectedNodes.length > 1) {
      nodeView = this.selectedNodes[this.selectedNodes.length - 1];
      if (!((event.metaKey || event.ctrlKey || event.shiftKey) && this.getOptions().multipleSelection)) {
        this.deselectAllNodes();
        this.selectNode(nodeView);
      }
    }
    nodeData = nodeView.getData();
    nextIndex = this.indexedNodes.indexOf(nodeData) + 1;
    if (this.indexedNodes[nextIndex]) {
      nextNode = this.nodes[this.getNodeId(this.indexedNodes[nextIndex])];
      if (this.isNodeVisible(nextNode)) {
        if (__indexOf.call(this.selectedNodes, nextNode) >= 0) {
          return this.deselectNode(this.nodes[this.getNodeId(nodeData)]);
        } else {
          this.selectNode(nextNode, event);
          return nextNode;
        }
      } else {
        return this.performDownKey(nextNode, event);
      }
    }
  };

  JTreeViewController.prototype.performUpKey = function(nodeView, event) {
    var nextIndex, nextNode, nodeData;
    if (this.selectedNodes.length > 1) {
      nodeView = this.selectedNodes[this.selectedNodes.length - 1];
      if (!((event.metaKey || event.ctrlKey || event.shiftKey) && this.getOptions().multipleSelection)) {
        this.deselectAllNodes();
        this.selectNode(nodeView);
      }
    }
    nodeData = nodeView.getData();
    nextIndex = this.indexedNodes.indexOf(nodeData) - 1;
    if (this.indexedNodes[nextIndex]) {
      nextNode = this.nodes[this.getNodeId(this.indexedNodes[nextIndex])];
      if (this.isNodeVisible(nextNode)) {
        if (__indexOf.call(this.selectedNodes, nextNode) >= 0) {
          this.deselectNode(this.nodes[this.getNodeId(nodeData)]);
        } else {
          this.selectNode(nextNode, event);
        }
      } else {
        this.performUpKey(nextNode, event);
      }
    }
    return nextNode;
  };

  JTreeViewController.prototype.performRightKey = function(nodeView, event) {
    return this.expand(nodeView);
  };

  JTreeViewController.prototype.performLeftKey = function(nodeView, event) {
    var nodeData, parentNode;
    nodeData = nodeView.getData();
    if (this.nodes[this.getNodePId(nodeData)]) {
      parentNode = this.nodes[this.getNodePId(nodeData)];
      this.selectNode(parentNode);
    }
    return parentNode;
  };

  JTreeViewController.prototype.performBackspaceKey = function(nodeView, event) {};

  JTreeViewController.prototype.performEnterKey = function(nodeView, event) {};

  JTreeViewController.prototype.performEscapeKey = function(nodeView, event) {};

  return JTreeViewController;

})(KDViewController);

var JTreeView,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

JTreeView = (function(_super) {

  __extends(JTreeView, _super);

  function JTreeView(options, data) {
    if (options == null) {
      options = {};
    }
    options.animated || (options.animated = false);
    JTreeView.__super__.constructor.call(this, options, data);
    this.setClass("jtreeview expanded");
  }

  JTreeView.prototype.toggle = function(callback) {
    if (this.expanded) {
      return this.collapse(callback);
    } else {
      return this.expand(callback);
    }
  };

  JTreeView.prototype.expand = function(callback) {
    var _this = this;
    if (this.getOptions().animated) {
      return this.$().slideDown(150, function() {
        _this.setClass("expanded");
        return typeof callback === "function" ? callback() : void 0;
      });
    } else {
      this.show();
      this.setClass("expanded");
      return typeof callback === "function" ? callback() : void 0;
    }
  };

  JTreeView.prototype.collapse = function(callback) {
    var _this = this;
    if (this.getOptions().animated) {
      return this.$().slideUp(100, function() {
        _this.unsetClass("expanded");
        return typeof callback === "function" ? callback() : void 0;
      });
    } else {
      this.hide();
      this.unsetClass("expanded");
      return typeof callback === "function" ? callback() : void 0;
    }
  };

  JTreeView.prototype.mouseDown = function() {
    this.getSingleton("windowController").setKeyView(this);
    return false;
  };

  JTreeView.prototype.keyDown = function(event) {
    return this.propagateEvent({
      KDEventType: "KeyDownOnTreeView"
    }, event);
  };

  JTreeView.prototype.destroy = function() {
    return this.getSingleton("windowController").revertKeyView(this);
  };

  return JTreeView;

})(KDListView);

var JTreeItemView,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

JTreeItemView = (function(_super) {

  __extends(JTreeItemView, _super);

  function JTreeItemView(options, data) {
    var childClass, childOptions, _ref;
    if (options == null) {
      options = {};
    }
    if (data == null) {
      data = {};
    }
    options.tagName || (options.tagName = "li");
    options.type || (options.type = "jtreeitem");
    options.bind || (options.bind = "mouseenter contextmenu dragstart dragenter dragleave dragend dragover drop");
    options.childClass || (options.childClass = null);
    options.childOptions || (options.childOptions = {});
    JTreeItemView.__super__.constructor.call(this, options, data);
    this.setClass("jtreeitem");
    this.expanded = false;
    _ref = this.getOptions(), childClass = _ref.childClass, childOptions = _ref.childOptions;
    if (childClass) {
      this.child = new childClass(childOptions, this.getData());
    }
  }

  JTreeItemView.prototype.viewAppended = function() {
    this.setTemplate(this.pistachio());
    return this.template.update();
  };

  JTreeItemView.prototype.pistachio = function() {
    if (this.getOptions().childClass) {
      return "{{> @child}}";
    } else {
      return "<span class='arrow'></span>\n{{#(title)}}";
    }
  };

  JTreeItemView.prototype.toggle = function(callback) {
    if (this.expanded) {
      return this.collapse();
    } else {
      return this.expand();
    }
  };

  JTreeItemView.prototype.expand = function(callback) {
    this.expanded = true;
    return this.setClass("expanded");
  };

  JTreeItemView.prototype.collapse = function(callback) {
    this.expanded = false;
    return this.unsetClass("expanded");
  };

  JTreeItemView.prototype.decorateSubItemsState = function(state) {
    if (state == null) {
      state = true;
    }
    if (state) {
      return this.setClass("has-sub-items");
    } else {
      return this.unsetClass("has-sub-items");
    }
  };

  return JTreeItemView;

})(KDListItemView);

var KDTabViewController,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

KDTabViewController = (function(_super) {

  __extends(KDTabViewController, _super);

  function KDTabViewController(options, data) {
    this._windowDidResize = __bind(this._windowDidResize, this);

    this.handleClicked = __bind(this.handleClicked, this);

    var _ref, _ref1,
      _this = this;
    this.handles = [];
    this.panes = [];
    this.selectedIndex = [];
    this.tabConstructor = (_ref = options.tabClass) != null ? _ref : KDTabPaneView;
    KDTabViewController.__super__.constructor.call(this, options, data);
    this.setTabHandleContainer((_ref1 = options.tabHandleContainer) != null ? _ref1 : null);
    this.listenWindowResize();
    this.on("PaneRemoved", function() {
      return _this.resizeTabHandles({
        type: "PaneRemoved"
      });
    });
    this.on("PaneAdded", function(pane) {
      return _this.resizeTabHandles({
        type: "PaneAdded",
        pane: pane
      });
    });
    if (options.tabNames != null) {
      this.on("viewAppended", this.createPanes.bind(this));
    }
  }

  KDTabViewController.prototype.handleMouseDownDefaultAction = function(clickedTabHandle, event) {
    var handle, index, _i, _len, _ref, _results;
    _ref = this.handles;
    _results = [];
    for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
      handle = _ref[index];
      if (clickedTabHandle === handle) {
        _results.push(this.handleClicked(index, event));
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };

  KDTabViewController.prototype.handleClicked = function(index, event) {
    var pane;
    pane = this.getPaneByIndex(index);
    if ($(event.target).hasClass("close-tab")) {
      this.removePane(pane);
      return false;
    }
    return this.showPane(pane);
  };

  KDTabViewController.prototype.setTabHandleContainer = function(aViewInstance) {
    if (aViewInstance != null) {
      if (this.tabHandleContainer != null) {
        this.tabHandleContainer.destroy();
      }
      this.tabHandleContainer = aViewInstance;
    } else {
      this.tabHandleContainer = new KDView();
      this.appendHandleContainer();
    }
    return this.tabHandleContainer.setClass("kdtabhandlecontainer");
  };

  KDTabViewController.prototype.getTabHandleContainer = function() {
    return this.tabHandleContainer;
  };

  KDTabViewController.prototype.createPanes = function(paneTitlesArray) {
    var pane, title, _i, _len, _results;
    if (paneTitlesArray == null) {
      paneTitlesArray = this.getOptions().tabNames;
    }
    _results = [];
    for (_i = 0, _len = paneTitlesArray.length; _i < _len; _i++) {
      title = paneTitlesArray[_i];
      this.addPane(pane = new this.tabConstructor({
        title: title
      }, null));
      _results.push(pane.setTitle(title));
    }
    return _results;
  };

  KDTabViewController.prototype.addPane = function(paneInstance) {
    var newTabHandle, tabHandleClass, _ref, _ref1;
    if (paneInstance instanceof KDTabPaneView) {
      this.panes.push(paneInstance);
      tabHandleClass = (_ref = this.getOptions().tabHandleView) != null ? _ref : KDTabHandleView;
      this.addHandle(newTabHandle = new tabHandleClass({
        pane: paneInstance,
        title: paneInstance.options.name,
        hidden: paneInstance.options.hiddenHandle,
        view: paneInstance.options.tabHandleView
      }));
      paneInstance.tabHandle = newTabHandle;
      this.listenTo({
        KDEventTypes: "click",
        listenedToInstance: newTabHandle,
        callback: this.handleMouseDownDefaultAction
      });
      this.appendPane(paneInstance);
      this.showPane(paneInstance);
      this.emit("PaneAdded", paneInstance);
      return paneInstance;
    } else {
      warn("You can't add " + ((paneInstance != null ? (_ref1 = paneInstance.constructor) != null ? _ref1.name : void 0 : void 0) != null ? paneInstance.constructor.name : void 0) + " as a pane, use KDTabPaneView instead.");
      return false;
    }
  };

  KDTabViewController.prototype.removePane = function(pane) {
    var handle, index, isActivePane, newIndex;
    pane.handleEvent({
      type: "KDTabPaneDestroy"
    });
    index = this.getPaneIndex(pane);
    isActivePane = this.getActivePane() === pane;
    this.panes.splice(index, 1);
    pane.destroy();
    handle = this.getHandleByIndex(index);
    this.handles.splice(index, 1);
    handle.destroy();
    if (isActivePane) {
      newIndex = this.getPaneByIndex(index - 1) != null ? index - 1 : 0;
      if (this.getPaneByIndex(newIndex) != null) {
        this.showPane(this.getPaneByIndex(newIndex));
      }
    }
    return this.emit("PaneRemoved");
  };

  KDTabViewController.prototype.addHandle = function(handle) {
    var _ref;
    if (handle instanceof KDTabHandleView) {
      this.handles.push(handle);
      this.appendHandle(handle);
      if (handle.getOptions().hidden) {
        handle.setClass("hidden");
      }
      return handle;
    } else {
      return warn("You can't add " + ((handle != null ? (_ref = handle.constructor) != null ? _ref.name : void 0 : void 0) != null ? handle.constructor.name : void 0) + " as a pane, use KDTabHandleView instead.");
    }
  };

  KDTabViewController.prototype.removeHandle = function() {};

  KDTabViewController.prototype.checkPaneExistenceById = function(id) {
    var pane, result, _i, _len, _ref;
    result = false;
    _ref = this.panes;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      pane = _ref[_i];
      if (pane.id === id) {
        result = true;
      }
    }
    return result;
  };

  KDTabViewController.prototype.getPaneByName = function(name) {
    var pane, result, _i, _len, _ref;
    result = false;
    _ref = this.panes;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      pane = _ref[_i];
      if (pane.name === name) {
        result = pane;
      }
    }
    return result;
  };

  KDTabViewController.prototype.getPaneById = function(id) {
    var pane, paneInstance, _i, _len, _ref;
    paneInstance = null;
    _ref = this.panes;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      pane = _ref[_i];
      if (pane.id === id) {
        paneInstance = pane;
      }
    }
    return paneInstance;
  };

  KDTabViewController.prototype.getActivePane = function() {
    var pane, _i, _len, _ref;
    if (this.panes.length === 0) {
      this.activePane = void 0;
    }
    _ref = this.panes;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      pane = _ref[_i];
      if (pane.active) {
        this.activePane = pane;
      }
    }
    return this.activePane;
  };

  KDTabViewController.prototype.getPaneByIndex = function(index) {
    return this.panes[index];
  };

  KDTabViewController.prototype.getHandleByIndex = function(index) {
    return this.handles[index];
  };

  KDTabViewController.prototype.getPaneIndex = function(aPane) {
    var index, pane, result, _i, _len, _ref;
    result = 0;
    _ref = this.panes;
    for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
      pane = _ref[index];
      if (pane === aPane) {
        result = index;
      }
    }
    return result;
  };

  KDTabViewController.prototype.showPaneByIndex = function(index) {
    return this.showPane(this.getPaneByIndex(index));
  };

  KDTabViewController.prototype.showPaneByName = function(name) {
    return this.showPane(this.getPaneByName(name));
  };

  KDTabViewController.prototype.showNextPane = function() {
    var activeIndex, activePane;
    activePane = this.getActivePane();
    activeIndex = this.getPaneIndex(activePane);
    return this.showPane(this.getPaneByIndex(activeIndex + 1));
  };

  KDTabViewController.prototype.showPreviousPane = function() {
    var activeIndex, activePane;
    activePane = this.getActivePane();
    activeIndex = this.getPaneIndex(activePane);
    return this.showPane(this.getPaneByIndex(activeIndex - 1));
  };

  KDTabViewController.prototype.setPaneTitle = function(pane, title) {
    var handle;
    handle = this.getHandleByPane(pane);
    return handle.getDomElement().find("b").html(title);
  };

  KDTabViewController.prototype.getHandleByPane = function(pane) {
    var handle, index;
    index = this.getPaneIndex(pane);
    return handle = this.getHandleByIndex(index);
  };

  KDTabViewController.prototype.hideCloseIcon = function(pane) {
    var handle, index;
    index = this.getPaneIndex(pane);
    handle = this.getHandleByIndex(index);
    return handle.getDomElement().addClass("hide-close-icon");
  };

  KDTabViewController.prototype.resizeTabHandles = function() {
    if (this._tabHandleContainerHidden) {

    }
  };

  KDTabViewController.prototype._windowDidResize = function(event) {
    return this.resizeTabHandles(event);
  };

  return KDTabViewController;

})(KDScrollView);

var KDTabView,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

KDTabView = (function(_super) {

  __extends(KDTabView, _super);

  function KDTabView(options) {
    if (options == null) {
      options = {};
    }
    this.showPane = __bind(this.showPane, this);

    KDTabView.__super__.constructor.call(this, options);
    this.setClass("kdtabview");
    this.handlesHidden = false;
    if (options.hideHandleCloseIcons) {
      this.hideHandleCloseIcons();
    }
    if (options.hideHandleContainer) {
      this.hideHandleContainer();
    }
  }

  KDTabView.prototype.appendHandleContainer = function() {
    return this.addSubView(this.tabHandleContainer);
  };

  KDTabView.prototype.appendPane = function(pane) {
    pane.setDelegate(this);
    return this.addSubView(pane);
  };

  KDTabView.prototype.appendHandle = function(tabHandle) {
    this.handleHeight || (this.handleHeight = this.tabHandleContainer.getHeight());
    tabHandle.setDelegate(this);
    return this.tabHandleContainer.addSubView(tabHandle);
  };

  KDTabView.prototype.showPane = function(pane) {
    var handle, index;
    if (!pane) {
      return;
    }
    this.hideAllPanes();
    pane.show();
    index = this.getPaneIndex(pane);
    handle = this.getHandleByIndex(index);
    handle.makeActive();
    pane.emit("PaneDidShow");
    this.emit("PaneDidShow", pane);
    return pane;
  };

  KDTabView.prototype.hideAllPanes = function() {
    var handle, pane, _i, _j, _len, _len1, _ref, _ref1, _results;
    _ref = this.panes;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      pane = _ref[_i];
      pane.hide();
    }
    _ref1 = this.handles;
    _results = [];
    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
      handle = _ref1[_j];
      _results.push(handle.makeInactive());
    }
    return _results;
  };

  KDTabView.prototype.hideHandleContainer = function() {
    this.tabHandleContainer.hide();
    return this.handlesHidden = true;
  };

  KDTabView.prototype.showHandleContainer = function() {
    this.tabHandleContainer.show();
    return this.handlesHidden = false;
  };

  KDTabView.prototype.toggleHandleContainer = function(duration) {
    if (duration == null) {
      duration = 0;
    }
    return this.tabHandleContainer.$().toggle(duration);
  };

  KDTabView.prototype.hideHandleCloseIcons = function() {
    return this.tabHandleContainer.$().addClass("hide-close-icons");
  };

  KDTabView.prototype.showHandleCloseIcons = function() {
    return this.tabHandleContainer.$().removeClass("hide-close-icons");
  };

  return KDTabView;

})(KDTabViewController);

var KDTabHandleView, KDTabPaneView,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

KDTabPaneView = (function(_super) {

  __extends(KDTabPaneView, _super);

  function KDTabPaneView(options, data) {
    options = $.extend({
      hiddenHandle: false,
      name: false
    }, options);
    KDTabPaneView.__super__.constructor.call(this, options, data);
    this.name = options.name;
    this.setClass("clearfix");
    this.setHeight(this.$().parent().height());
    this.listenTo({
      KDEventTypes: [
        {
          eventType: "KDTabPaneActive"
        }
      ],
      listenedToInstance: this,
      callback: this.becameActive
    });
    this.listenTo({
      KDEventTypes: [
        {
          eventType: "KDTabPaneInactive"
        }
      ],
      listenedToInstance: this,
      callback: this.becameInactive
    });
    this.listenTo({
      KDEventTypes: [
        {
          eventType: "KDTabPaneDestroy"
        }
      ],
      listenedToInstance: this,
      callback: this.aboutToBeDestroyed
    });
  }

  KDTabPaneView.prototype.becameActive = noop;

  KDTabPaneView.prototype.becameInactive = noop;

  KDTabPaneView.prototype.aboutToBeDestroyed = noop;

  KDTabPaneView.prototype.show = function() {
    this.getDomElement().removeClass("kdhiddentab").addClass("active");
    this.active = true;
    return this.handleEvent({
      type: "KDTabPaneActive"
    });
  };

  KDTabPaneView.prototype.hide = function() {
    this.getDomElement().removeClass("active").addClass("kdhiddentab");
    this.active = false;
    return this.handleEvent({
      type: "KDTabPaneInactive"
    });
  };

  KDTabPaneView.prototype.viewAppended = function() {
    var name;
    name = this.getOptions().name;
    this.setClass("kdtabpaneview");
    return KDTabPaneView.__super__.viewAppended.apply(this, arguments);
  };

  KDTabPaneView.prototype.setTitle = function(title) {
    this.getDelegate().setPaneTitle(this, title);
    this.setOption("name", name);
    return this.name = title;
  };

  KDTabPaneView.prototype.getHandle = function() {
    return this.getDelegate().getHandleByPane(this);
  };

  KDTabPaneView.prototype.hideTabCloseIcon = function() {
    return this.getDelegate().hideCloseIcon(this);
  };

  return KDTabPaneView;

})(KDView);

KDTabHandleView = (function(_super) {

  __extends(KDTabHandleView, _super);

  function KDTabHandleView(options) {
    options = $.extend({
      hidden: false,
      title: "Title",
      pane: null,
      view: null
    }, options);
    KDTabHandleView.__super__.constructor.call(this, options);
  }

  KDTabHandleView.prototype.setDomElement = function() {
    var c;
    c = this.getOptions().hidden ? "hidden" : "";
    return this.domElement = $("<div class='kdtabhandle " + c + "'>                      <span class='close-tab'></span>                    </div>");
  };

  KDTabHandleView.prototype.viewAppended = function() {
    var view;
    if ((view = this.getOptions().view) != null) {
      return this.addSubView(view);
    } else {
      return this.setPartial(this.partial());
    }
  };

  KDTabHandleView.prototype.partial = function() {
    return $("<b>" + (this.getOptions().title || 'Default Title') + "</b>");
  };

  KDTabHandleView.prototype.makeActive = function() {
    return this.getDomElement().addClass("active");
  };

  KDTabHandleView.prototype.makeInactive = function() {
    return this.getDomElement().removeClass("active");
  };

  KDTabHandleView.prototype.setTitle = function(title) {};

  return KDTabHandleView;

})(KDView);

var KDTabViewWithForms,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

KDTabViewWithForms = (function(_super) {

  __extends(KDTabViewWithForms, _super);

  function KDTabViewWithForms(options, data) {
    this.handleClicked = __bind(this.handleClicked, this);

    var forms;
    options = $.extend({
      navigable: true,
      goToNextFormOnSubmit: true
    }, options);
    KDTabViewWithForms.__super__.constructor.call(this, options, data);
    this.forms = {};
    this.hideHandleCloseIcons();
    forms = this.getOptions().forms;
    if (forms) {
      this.createTabs(forms = this.sanitizeOptions(forms));
      this.showPane(this.panes[0]);
    }
    if (forms.length === 1) {
      this.hideHandleContainer();
    }
  }

  KDTabViewWithForms.prototype.sanitizeOptions = function(options) {
    var key, option, _results;
    _results = [];
    for (key in options) {
      option = options[key];
      option.title = key;
      _results.push(option);
    }
    return _results;
  };

  KDTabViewWithForms.prototype.handleClicked = function(index, event) {
    if (this.getOptions().navigable) {
      return KDTabViewWithForms.__super__.handleClicked.apply(this, arguments);
    }
  };

  KDTabViewWithForms.prototype.createTabs = function(forms) {
    var _this = this;
    return forms.forEach(function(formData, index) {
      var oldCallback, tab;
      _this.addPane(tab = new KDTabPaneView({
        name: formData.title
      }));
      oldCallback = formData.callback;
      formData.callback = function(formData) {
        if (_this.getOptions().goToNextFormOnSubmit) {
          _this.showNextPane();
        }
        if (typeof oldCallback === "function") {
          oldCallback(formData);
        }
        if (index === forms.length - 1) {
          return _this.fireFinalCallback();
        }
      };
      return _this.createForm(formData, tab);
    });
  };

  KDTabViewWithForms.prototype.createForm = function(formData, parentTab) {
    var form;
    parentTab.addSubView(form = new KDFormViewWithFields(formData));
    this.forms[formData.title] = parentTab.form = form;
    return form;
  };

  KDTabViewWithForms.prototype.getFinalData = function() {
    var finalData, pane, _i, _len, _ref;
    finalData = {};
    _ref = this.panes;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      pane = _ref[_i];
      finalData = $.extend(pane.form.getData(), finalData);
    }
    return finalData;
  };

  KDTabViewWithForms.prototype.fireFinalCallback = function() {
    var finalData, _base;
    finalData = this.getFinalData();
    return typeof (_base = this.getOptions()).callback === "function" ? _base.callback(finalData) : void 0;
  };

  return KDTabViewWithForms;

})(KDTabView);




var JContextMenu,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

JContextMenu = (function(_super) {

  __extends(JContextMenu, _super);

  function JContextMenu(options, data) {
    var o,
      _this = this;
    if (options == null) {
      options = {};
    }
    options.cssClass = this.utils.curryCssClass("jcontextmenu", options.cssClass);
    JContextMenu.__super__.constructor.call(this, options, data);
    o = this.getOptions();
    this.getSingleton("windowController").addLayer(this);
    this.on('ReceivedClickElsewhere', function() {
      return _this.destroy();
    });
    if (data) {
      this.treeController = new JContextMenuTreeViewController({
        type: o.type,
        view: o.view,
        delegate: this,
        treeItemClass: o.treeItemClass,
        listViewClass: o.listViewClass,
        itemChildClass: o.itemChildClass,
        itemChildOptions: o.itemChildOptions,
        addListsCollapsed: o.addListsCollapsed,
        putDepthInfo: o.putDepthInfo
      }, data);
      this.addSubView(this.treeController.getView());
      this.treeController.getView().on('ReceivedClickElsewhere', function() {
        return _this.destroy();
      });
    }
    KDView.appendToDOMBody(this);
  }

  JContextMenu.prototype.childAppended = function() {
    this.positionContextMenu();
    return JContextMenu.__super__.childAppended.apply(this, arguments);
  };

  JContextMenu.prototype.positionContextMenu = function() {
    var event, mainHeight, menuHeight, top;
    event = this.getOptions().event || {};
    mainHeight = this.getSingleton('mainView').getHeight();
    top = this.getOptions().y || event.pageY || 0;
    menuHeight = this.getHeight();
    if (top + menuHeight > mainHeight) {
      top = mainHeight - menuHeight - 15;
    }
    return this.getDomElement().css({
      width: "172px",
      top: top,
      left: this.getOptions().x || event.pageX || 0
    });
  };

  return JContextMenu;

})(KDView);

var JContextMenuTreeViewController,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

JContextMenuTreeViewController = (function(_super) {
  var convertToArray, getUId, uId;

  __extends(JContextMenuTreeViewController, _super);

  /*
    STATIC CONTEXT
  */


  uId = 0;

  getUId = function() {
    return ++uId;
  };

  convertToArray = function(items, pId) {
    var childrenArr, divider, id, newItem, options, results, title;
    if (pId == null) {
      pId = null;
    }
    results = [];
    for (title in items) {
      options = items[title];
      id = null;
      if (title === "customView") {
        newItem = {
          type: 'customView',
          parentId: pId,
          view: options
        };
        results.push(newItem);
        continue;
      }
      if (options.children) {
        id = getUId();
        options.title = title;
        options.id = id;
        options.parentId = pId;
        results.push(options);
        childrenArr = convertToArray(options.children, id);
        results = results.concat(childrenArr);
        if (options.separator) {
          divider = {
            type: 'separator',
            parentId: pId
          };
          results.push(divider);
        }
        continue;
      }
      options.title = title;
      options.parentId = pId;
      results.push(options);
      if (options.separator) {
        divider = {
          type: 'separator',
          parentId: pId
        };
        results.push(divider);
      }
    }
    return results;
  };

  /*
    INSTANCE LEVEL
  */


  function JContextMenuTreeViewController(options, data) {
    var o;
    if (options == null) {
      options = {};
    }
    o = options;
    o.view || (o.view = new KDView({
      cssClass: "context-list-wrapper"
    }));
    o.type || (o.type = "contextmenu");
    o.treeItemClass || (o.treeItemClass = JContextMenuItem);
    o.listViewClass || (o.listViewClass = JContextMenuTreeView);
    o.addListsCollapsed || (o.addListsCollapsed = true);
    o.putDepthInfo || (o.putDepthInfo = true);
    JContextMenuTreeViewController.__super__.constructor.call(this, o, data);
    this.expandedNodes = [];
  }

  JContextMenuTreeViewController.prototype.loadView = function() {
    JContextMenuTreeViewController.__super__.loadView.apply(this, arguments);
    return this.selectFirstNode();
  };

  JContextMenuTreeViewController.prototype.initTree = function(nodes) {
    if (!nodes.length) {
      this.setData(nodes = convertToArray(nodes));
    }
    return JContextMenuTreeViewController.__super__.initTree.call(this, nodes);
  };

  /*
    Helpers
  */


  JContextMenuTreeViewController.prototype.repairIds = function(nodeData) {
    if (nodeData.type === "divider") {
      nodeData.type = "separator";
    }
    return JContextMenuTreeViewController.__super__.repairIds.apply(this, arguments);
  };

  /*
    EXPAND / COLLAPSE
  */


  JContextMenuTreeViewController.prototype.expand = function(nodeView) {
    JContextMenuTreeViewController.__super__.expand.apply(this, arguments);
    if (nodeView.expanded) {
      return this.expandedNodes.push(nodeView);
    }
  };

  /*
    NODE SELECTION
  */


  JContextMenuTreeViewController.prototype.organizeSelectedNodes = function(listController, nodes, event) {
    var depth1, nodeView,
      _this = this;
    if (event == null) {
      event = {};
    }
    nodeView = nodes[0];
    if (this.expandedNodes.length) {
      depth1 = nodeView.getData().depth;
      this.expandedNodes.forEach(function(expandedNode) {
        var depth2;
        depth2 = expandedNode.getData().depth;
        if (depth1 <= depth2) {
          return _this.collapse(expandedNode);
        }
      });
    }
    return JContextMenuTreeViewController.__super__.organizeSelectedNodes.apply(this, arguments);
  };

  /*
    re-HANDLING MOUSE EVENTS
  */


  JContextMenuTreeViewController.prototype.dblClick = function(nodeView, event) {};

  JContextMenuTreeViewController.prototype.mouseEnter = function(nodeView, event) {
    var nodeData,
      _this = this;
    if (this.mouseEnterTimeOut) {
      clearTimeout(this.mouseEnterTimeOut);
    }
    nodeData = nodeView.getData();
    if (nodeData.type !== "separator") {
      this.selectNode(nodeView, event);
      return this.mouseEnterTimeOut = setTimeout(function() {
        return _this.expand(nodeView);
      }, 150);
    }
  };

  JContextMenuTreeViewController.prototype.click = function(nodeView, event) {
    var contextMenu, nodeData;
    nodeData = nodeView.getData();
    if (nodeData.type === "separator" || nodeData.disabled) {
      return;
    }
    this.toggle(nodeView);
    contextMenu = this.getDelegate();
    if (nodeData.callback && "function" === typeof nodeData.callback) {
      nodeData.callback.call(contextMenu, nodeView, event);
    }
    contextMenu.emit("ContextMenuItemReceivedClick", nodeView);
    event.stopPropagation();
    return false;
  };

  /*
    re-HANDLING KEY EVENTS
  */


  JContextMenuTreeViewController.prototype.performDownKey = function(nodeView, event) {
    var nextNode, nodeData;
    nextNode = JContextMenuTreeViewController.__super__.performDownKey.call(this, nodeView, event);
    if (nextNode) {
      nodeData = nextNode.getData();
      if (nodeData.type === "separator") {
        return this.performDownKey(nextNode, event);
      }
    }
  };

  JContextMenuTreeViewController.prototype.performUpKey = function(nodeView, event) {
    var nextNode, nodeData;
    nextNode = JContextMenuTreeViewController.__super__.performUpKey.call(this, nodeView, event);
    if (nextNode) {
      nodeData = nextNode.getData();
      if (nodeData.type === "separator") {
        this.performUpKey(nextNode, event);
      }
    }
    return nextNode;
  };

  JContextMenuTreeViewController.prototype.performRightKey = function(nodeView, event) {
    JContextMenuTreeViewController.__super__.performRightKey.apply(this, arguments);
    return this.performDownKey(nodeView, event);
  };

  JContextMenuTreeViewController.prototype.performLeftKey = function(nodeView, event) {
    var parentNode;
    parentNode = JContextMenuTreeViewController.__super__.performLeftKey.call(this, nodeView, event);
    if (parentNode) {
      this.collapse(parentNode);
    }
    return parentNode;
    return nextNode;
  };

  JContextMenuTreeViewController.prototype.performEscapeKey = function(nodeView, event) {
    this.getSingleton("windowController").revertKeyView();
    return this.getDelegate().destroy();
  };

  JContextMenuTreeViewController.prototype.performEnterKey = function(nodeView, event) {
    var contextMenu;
    this.getSingleton("windowController").revertKeyView();
    contextMenu = this.getDelegate();
    contextMenu.emit("ContextMenuItemReceivedClick", nodeView);
    contextMenu.destroy();
    return false;
  };

  return JContextMenuTreeViewController;

})(JTreeViewController);

var JContextMenuTreeView,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

JContextMenuTreeView = (function(_super) {

  __extends(JContextMenuTreeView, _super);

  function JContextMenuTreeView(options, data) {
    if (options == null) {
      options = {};
    }
    if (data == null) {
      data = {};
    }
    options.type || (options.type = "contextmenu");
    options.animated || (options.animated = false);
    options.cssClass || (options.cssClass = "default");
    JContextMenuTreeView.__super__.constructor.call(this, options, data);
    this.unsetClass("jtreeview");
  }

  return JContextMenuTreeView;

})(JTreeView);

var JContextMenuItem,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

JContextMenuItem = (function(_super) {

  __extends(JContextMenuItem, _super);

  function JContextMenuItem(options, data) {
    if (options == null) {
      options = {};
    }
    if (data == null) {
      data = {};
    }
    options.type = "contextitem";
    options.cssClass || (options.cssClass = "default");
    JContextMenuItem.__super__.constructor.call(this, options, data);
    this.unsetClass("jtreeitem");
    if (data) {
      if (data.type === "divider" || data.type === "separator") {
        this.setClass("separator");
      }
      if (data.type === "customView") {
        this.setTemplate("");
        this.addCustomView(data);
      }
      if (data.disabled) {
        this.setClass("disabled");
      }
    }
  }

  JContextMenuItem.prototype.viewAppended = function() {
    if (!this.customView) {
      this.setTemplate(this.pistachio());
      return this.template.update();
    }
  };

  JContextMenuItem.prototype.mouseDown = function() {
    return true;
  };

  JContextMenuItem.prototype.addCustomView = function(data) {
    this.setClass("custom-view");
    this.unsetClass("default");
    this.customView = data.view || new KDView;
    delete data.view;
    return this.addSubView(this.customView);
  };

  return JContextMenuItem;

})(JTreeItemView);

var KDInputValidator;

KDInputValidator = (function() {

  function KDInputValidator() {}

  KDInputValidator.ruleRequired = function(input, event) {
    var doesValidate, ruleSet, value, _ref;
    if ((event != null ? event.which : void 0) === 9) {
      return;
    }
    value = $.trim(input.getValue());
    ruleSet = input.getOptions().validate;
    doesValidate = value.length > 0;
    if (doesValidate) {
      return null;
    } else {
      return ((_ref = ruleSet.messages) != null ? _ref.required : void 0) || "Field is required!";
    }
  };

  KDInputValidator.ruleEmail = function(input, event) {
    var doesValidate, ruleSet, value, _ref;
    if ((event != null ? event.which : void 0) === 9) {
      return;
    }
    value = $.trim(input.getValue());
    ruleSet = input.getOptions().validate;
    doesValidate = /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i.test(value);
    if (doesValidate) {
      return null;
    } else {
      return ((_ref = ruleSet.messages) != null ? _ref.email : void 0) || "Please enter a valid email address!";
    }
  };

  KDInputValidator.ruleMinLength = function(input, event) {
    var doesValidate, minLength, ruleSet, value, _ref;
    if ((event != null ? event.which : void 0) === 9) {
      return;
    }
    value = $.trim(input.getValue());
    ruleSet = input.getOptions().validate;
    minLength = ruleSet.rules.minLength;
    doesValidate = value.length >= minLength;
    if (doesValidate) {
      return null;
    } else {
      return ((_ref = ruleSet.messages) != null ? _ref.minLength : void 0) || ("Please enter a value that includes more than " + minLength + " characters!");
    }
  };

  KDInputValidator.ruleMaxLength = function(input, event) {
    var doesValidate, maxLength, ruleSet, value, _ref;
    if ((event != null ? event.which : void 0) === 9) {
      return;
    }
    value = $.trim(input.getValue());
    ruleSet = input.getOptions().validate;
    maxLength = ruleSet.rules.maxLength;
    doesValidate = value.length <= maxLength;
    if (doesValidate) {
      return null;
    } else {
      return ((_ref = ruleSet.messages) != null ? _ref.maxLength : void 0) || ("Please enter a value that includes less than " + maxLength + " characters!");
    }
  };

  KDInputValidator.ruleRangeLength = function(input, event) {
    var doesValidate, rangeLength, ruleSet, value, _ref;
    if ((event != null ? event.which : void 0) === 9) {
      return;
    }
    value = $.trim(input.getValue());
    ruleSet = input.getOptions().validate;
    rangeLength = ruleSet.rules.rangeLength;
    doesValidate = value.length <= rangeLength[1] && value.length >= rangeLength[0];
    if (doesValidate) {
      return null;
    } else {
      return ((_ref = ruleSet.messages) != null ? _ref.rangeLength : void 0) || ("Please enter a value that includes more than " + rangeLength[0] + " and less than " + rangeLength[1] + " characters!");
    }
  };

  KDInputValidator.ruleMatch = function(input, event) {
    var doesValidate, matchView, matchViewVal, ruleSet, value, _ref;
    if ((event != null ? event.which : void 0) === 9) {
      return;
    }
    value = $.trim(input.getValue());
    ruleSet = input.getOptions().validate;
    matchView = ruleSet.rules.match;
    matchViewVal = $.trim(matchView.getValue());
    doesValidate = value === matchViewVal;
    if (doesValidate) {
      return null;
    } else {
      return ((_ref = ruleSet.messages) != null ? _ref.match : void 0) || "Values do not match!";
    }
  };

  KDInputValidator.ruleCreditCard = function(input, event) {
    /*
        Visa:             start with a 4. New cards have 16 digits. Old cards have 13.
        MasterCard:       start with the numbers 51 through 55. All have 16 digits.
        American Express: start with 34 or 37 and have 15 digits.
        Diners Club:      start with 300 through 305, 36 or 38. All have 14 digits. There are Diners Club cards that begin with 5 and have 16 digits. These are a joint venture between Diners Club and MasterCard, and should be processed like a MasterCard.
        Discover:         start with 6011 or 65. All have 16 digits.
        JCB:              start with 2131 or 1800 have 15 digits. JCB cards beginning with 35 have 16 digits.
    */

    var doesValidate, ruleSet, type, value, _ref;
    if ((event != null ? event.which : void 0) === 9) {
      return;
    }
    value = $.trim(input.getValue().replace(/-|\s/g, ""));
    ruleSet = input.getOptions().validate;
    doesValidate = /(^4[0-9]{12}(?:[0-9]{3})?$)|(^5[1-5][0-9]{14}$)|(^3[47][0-9]{13}$)|(^3(?:0[0-5]|[68][0-9])[0-9]{11}$)|(^6(?:011|5[0-9]{2})[0-9]{12}$)|(^(?:2131|1800|35\d{3})\d{11}$)/.test(value);
    if (doesValidate) {
      type = /^4[0-9]{12}(?:[0-9]{3})?$/.test(value) ? "Visa" : /^5[1-5][0-9]{14}$/.test(value) ? "MasterCard" : /^3[47][0-9]{13}$/.test(value) ? "Amex" : /^3(?:0[0-5]|[68][0-9])[0-9]{11}$/.test(value) ? "Diners" : /^6(?:011|5[0-9]{2})[0-9]{12}$/.test(value) ? "Discover" : /^(?:2131|1800|35\d{3})\d{11}$/.test(value) ? "JCB" : false;
      input.emit("CreditCardTypeIdentified", type);
      return null;
    } else {
      return ((_ref = ruleSet.messages) != null ? _ref.creditCard : void 0) || "Please enter a valid credit card number!";
    }
  };

  KDInputValidator.ruleJSON = function(input, event) {
    var doesValidate, ruleSet, value, _ref;
    if ((event != null ? event.which : void 0) === 9) {
      return;
    }
    value = $.trim(input.getValue());
    ruleSet = input.getOptions().validate;
    doesValidate = true;
    try {
      if (value) {
        JSON.parse(value);
      }
    } catch (err) {
      error(err, doesValidate);
      doesValidate = false;
    }
    if (doesValidate) {
      return null;
    } else {
      return ((_ref = ruleSet.messages) != null ? _ref.JSON : void 0) || "a valid JSON is required!";
    }
  };

  KDInputValidator.ruleRegExp = function(input, event) {
    var doesValidate, regExp, ruleSet, value, _ref;
    if ((event != null ? event.which : void 0) === 9) {
      return;
    }
    value = $.trim(input.getValue());
    ruleSet = input.getOptions().validate;
    regExp = ruleSet.rules.regExp;
    doesValidate = regExp.test(value);
    if (doesValidate) {
      return null;
    } else {
      return ((_ref = ruleSet.messages) != null ? _ref.regExp : void 0) || "Validation failed!";
    }
  };

  KDInputValidator.ruleUri = function(input, event) {
    var doesValidate, regExp, ruleSet, value, _ref;
    if ((event != null ? event.which : void 0) === 9) {
      return;
    }
    regExp = /^([a-z0-9+.-]+):(?:\/\/(?:((?:[a-z0-9-._~!$&'()*+,;=:]|%[0-9A-F]{2})*)@)?((?:[a-z0-9-._~!$&'()*+,;=]|%[0-9A-F]{2})*)(?::(\d*))?(\/(?:[a-z0-9-._~!$&'()*+,;=:@\/]|%[0-9A-F]{2})*)?|(\/?(?:[a-z0-9-._~!$&'()*+,;=:@]|%[0-9A-F]{2})+(?:[a-z0-9-._~!$&'()*+,;=:@\/]|%[0-9A-F]{2})*)?)(?:\?((?:[a-z0-9-._~!$&'()*+,;=:\/?@]|%[0-9A-F]{2})*))?(?:)?$/i;
    value = $.trim(input.getValue());
    ruleSet = input.getOptions().validate;
    doesValidate = regExp.test(value);
    if (doesValidate) {
      return null;
    } else {
      return ((_ref = ruleSet.messages) != null ? _ref.uri : void 0) || "Not a valid uri!";
    }
  };

  return KDInputValidator;

})();

/*
Credits
  email check regex:
  by Scott Gonzalez: http://projects.scottsplayground.com/email_address_validation/
*/


var KDLabelView,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

KDLabelView = (function(_super) {

  __extends(KDLabelView, _super);

  function KDLabelView(options) {
    if ((options != null ? options.title : void 0) != null) {
      this.setTitle(options.title);
    }
    KDLabelView.__super__.constructor.call(this, options);
  }

  KDLabelView.prototype.setDomElement = function(cssClass) {
    return this.domElement = $("<label for='' class='kdlabel " + cssClass + "'>" + (this.getTitle()) + "</label>");
  };

  KDLabelView.prototype.setTitle = function(title) {
    return this.labelTitle = title;
  };

  KDLabelView.prototype.updateTitle = function(title) {
    this.setTitle(title);
    return this.$().html(title);
  };

  KDLabelView.prototype.getTitle = function() {
    return this.labelTitle;
  };

  return KDLabelView;

})(KDView);

var KDInputView,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

KDInputView = (function(_super) {
  var _prevVal;

  __extends(KDInputView, _super);

  function KDInputView(o, data) {
    var options, _base, _base1, _base10, _base11, _base12, _base13, _base14, _base15, _base16, _base2, _base3, _base4, _base5, _base6, _base7, _base8, _base9, _ref, _ref1, _ref2, _ref3,
      _this = this;
    if (o == null) {
      o = {};
    }
    this.mouseDown = __bind(this.mouseDown, this);

    o.type || (o.type = "text");
    o.name || (o.name = "");
    o.label || (o.label = null);
    o.cssClass || (o.cssClass = "");
    o.callback || (o.callback = null);
    o.defaultValue || (o.defaultValue = "");
    o.placeholder || (o.placeholder = "");
    if ((_ref = o.disabled) == null) {
      o.disabled = false;
    }
    o.selectOptions || (o.selectOptions = null);
    o.validate || (o.validate = null);
    if ((_ref1 = o.validationNotifications) == null) {
      o.validationNotifications = true;
    }
    o.hint || (o.hint = null);
    if ((_ref2 = o.autogrow) == null) {
      o.autogrow = false;
    }
    if ((_ref3 = o.enableTabKey) == null) {
      o.enableTabKey = false;
    }
    o.bind || (o.bind = "");
    o.forceCase || (o.forceCase = null);
    o.attributes || (o.attributes = {});
    (_base = o.attributes).autocomplete || (_base.autocomplete = null);
    (_base1 = o.attributes).dirname || (_base1.dirname = null);
    (_base2 = o.attributes).list || (_base2.list = null);
    (_base3 = o.attributes).maxlength || (_base3.maxlength = null);
    (_base4 = o.attributes).pattern || (_base4.pattern = null);
    (_base5 = o.attributes).readonly || (_base5.readonly = null);
    (_base6 = o.attributes).required || (_base6.required = null);
    (_base7 = o.attributes).size || (_base7.size = null);
    (_base8 = o.attributes).list || (_base8.list = null);
    (_base9 = o.attributes).selectionStart || (_base9.selectionStart = null);
    (_base10 = o.attributes).selectionEnd || (_base10.selectionEnd = null);
    (_base11 = o.attributes).selectionDirection || (_base11.selectionDirection = null);
    (_base12 = o.attributes).multiple || (_base12.multiple = null);
    (_base13 = o.attributes).min || (_base13.min = null);
    (_base14 = o.attributes).max || (_base14.max = null);
    (_base15 = o.attributes).step || (_base15.step = null);
    (_base16 = o.attributes).valueAsNumber || (_base16.valueAsNumber = null);
    o.bind += " blur change focus";
    this.setType(o.type);
    KDInputView.__super__.constructor.call(this, o, data);
    options = this.getOptions();
    this.inputValidationNotifications = {};
    this.valid = true;
    this.inputCallback = null;
    this.setLabel();
    this.setCallback();
    this.setDefaultValue(options.defaultValue);
    this.setPlaceHolder(options.placeholder);
    if (options.disabled) {
      this.makeDisabled();
    }
    if (options.selectOptions != null) {
      this.setSelectOptions(options.selectOptions);
    }
    if (options.autogrow) {
      this.setAutoGrow();
    }
    if (options.enableTabKey) {
      this.enableTabKey();
    }
    if (options.forceCase) {
      this.setCase(options.forceCase);
    }
    if (options.validate != null) {
      this.setValidation(options.validate);
      this.on("ValidationError", function(err) {
        return _this.giveValidationFeedback(err);
      });
      this.on("ValidationPassed", function() {
        return _this.giveValidationFeedback();
      });
      this.listenTo({
        KDEventTypes: "focus",
        listenedToInstance: this,
        callback: function() {
          return _this.clearValidationFeedback();
        }
      });
    }
    if (options.type === "select" && options.selectOptions) {
      this.on("viewAppended", function() {
        o = _this.getOptions();
        if (!o.selectOptions.length) {
          if (!o.defaultValue) {
            return _this.setValue(o.selectOptions[Object.keys(o.selectOptions)[0]][0].value);
          }
        } else {
          if (!o.defaultValue) {
            return _this.setValue(o.selectOptions[0].value);
          }
        }
      });
    }
  }

  KDInputView.prototype.setDomElement = function(cssClass) {
    var name;
    if (cssClass == null) {
      cssClass = "";
    }
    this.inputName = this.options.name;
    name = "name='" + this.options.name + "'";
    return this.domElement = (function() {
      switch (this.getType()) {
        case "text":
          return $("<input " + name + " type='text' class='kdinput text " + cssClass + "'/>");
        case "password":
          return $("<input " + name + " type='password' class='kdinput text " + cssClass + "'/>");
        case "hidden":
          return $("<input " + name + " type='hidden' class='kdinput hidden " + cssClass + "'/>");
        case "checkbox":
          return $("<input " + name + " type='checkbox' class='kdinput checkbox " + cssClass + "'/>");
        case "textarea":
          return $("<textarea " + name + " class='kdinput text " + cssClass + "'></textarea>");
        case "select":
          return $("<select " + name + " class='kdinput select " + cssClass + "'/>");
        case "range":
          return $("<input " + name + " type='range' class='kdinput range " + cssClass + "'/>");
        default:
          return $("<input " + name + " type='" + (this.getType()) + "' class='kdinput " + (this.getType()) + " " + cssClass + "'/>");
      }
    }).call(this);
  };

  KDInputView.prototype.setLabel = function(label) {
    var _this = this;
    if (label == null) {
      label = this.options.label;
    }
    if (this.options.label == null) {
      return false;
    }
    this.inputLabel = label;
    this.inputLabel.getDomElement().attr("for", this.getName());
    return this.inputLabel.getDomElement().bind("click", function() {
      _this.getDomElement().trigger("focus");
      return _this.getDomElement().trigger("click");
    });
  };

  KDInputView.prototype.getLabel = function() {
    return this.inputLabel;
  };

  KDInputView.prototype.setCallback = function() {
    return this.inputCallback = this.options.callback;
  };

  KDInputView.prototype.getCallback = function() {
    return this.inputCallback;
  };

  KDInputView.prototype.setType = function(type) {
    if (type == null) {
      type = "text";
    }
    return this.inputType = type;
  };

  KDInputView.prototype.getType = function() {
    return this.inputType;
  };

  KDInputView.prototype.getName = function() {
    return this.inputName;
  };

  KDInputView.prototype.setFocus = function() {
    (this.getSingleton("windowController")).setKeyView(this);
    return this.$().trigger("focus");
  };

  KDInputView.prototype.setBlur = function() {
    (this.getSingleton("windowController")).setKeyView(null);
    return this.$().trigger("blur");
  };

  KDInputView.prototype.setSelectOptions = function(options) {
    var $optGroup, optGroup, option, subOptions, _i, _j, _len, _len1;
    if (!options.length) {
      for (optGroup in options) {
        subOptions = options[optGroup];
        $optGroup = $("<optgroup label='" + optGroup + "'/>");
        this.$().append($optGroup);
        for (_i = 0, _len = subOptions.length; _i < _len; _i++) {
          option = subOptions[_i];
          $optGroup.append("<option value='" + option.value + "'>" + option.title + "</option>");
        }
      }
    } else if (options.length) {
      for (_j = 0, _len1 = options.length; _j < _len1; _j++) {
        option = options[_j];
        this.$().append("<option value='" + option.value + "'>" + option.title + "</option>");
      }
    } else {
      warn("no valid options specified for the input:", this);
    }
    return this.$().val(this.getDefaultValue());
  };

  KDInputView.prototype.setDefaultValue = function(value) {
    if (value !== "") {
      this.getDomElement().val(value);
    }
    return this.inputDefaultValue = value;
  };

  KDInputView.prototype.getDefaultValue = function() {
    return this.inputDefaultValue;
  };

  KDInputView.prototype.setPlaceHolder = function(value) {
    if (this.$().is("input") || this.$().is("textarea")) {
      this.$().attr("placeholder", value);
      return this.options.placeholder = value;
    }
  };

  KDInputView.prototype.makeDisabled = function() {
    return this.getDomElement().attr("disabled", "disabled");
  };

  KDInputView.prototype.makeEnabled = function() {
    return this.getDomElement().removeAttr("disabled");
  };

  KDInputView.prototype.getValue = function() {
    var forceCase, value;
    value = this.getDomElement().val();
    forceCase = this.getOptions().forceCase;
    if (forceCase) {
      value = /uppercase/i.test(forceCase) ? value.toUpperCase() : value.toLowerCase();
    }
    return value;
  };

  KDInputView.prototype.setValue = function(value) {
    if (value != null) {
      return this.getDomElement().val(value);
    }
  };

  _prevVal = null;

  KDInputView.prototype.setCase = function(forceCase) {
    var _this = this;
    return this.listenTo({
      KDEventTypes: ["keyup", "blur"],
      listenedToInstance: this,
      callback: function() {
        var val;
        val = _this.getValue();
        if (val === _prevVal) {
          return;
        }
        _this.setValue(val);
        return _prevVal = val;
      }
    });
  };

  KDInputView.prototype.setValidation = function(ruleSet) {
    var _this = this;
    this.valid = false;
    this.createRuleChain(ruleSet);
    return this.ruleChain.forEach(function(rule) {
      var eventName;
      eventName = ruleSet.events ? ruleSet.events[rule] ? ruleSet.events[rule] : ruleSet.event ? ruleSet.event : void 0 : ruleSet.event ? ruleSet.event : void 0;
      if (eventName) {
        return _this.listenTo({
          KDEventTypes: eventName,
          listenedToInstance: _this,
          callback: function(input, event) {
            if (__indexOf.call(_this.ruleChain, rule) >= 0) {
              return _this.validate(rule, event);
            }
          }
        });
      }
    });
  };

  KDInputView.prototype.validate = function(rule, event) {
    var allClear, errMsg, result, ruleSet, rulesToBeValidated, _ref,
      _this = this;
    if (event == null) {
      event = {};
    }
    this.ruleChain || (this.ruleChain = []);
    this.validationResults || (this.validationResults = {});
    rulesToBeValidated = rule ? [rule] : this.ruleChain;
    ruleSet = this.getOptions().validate;
    if (this.ruleChain.length > 0) {
      rulesToBeValidated.forEach(function(rule) {
        var result;
        if (KDInputValidator["rule" + (rule.capitalize())] != null) {
          result = KDInputValidator["rule" + (rule.capitalize())](_this, event);
          return _this.setValidationResult(rule, result);
        } else if ("function" === typeof ruleSet.rules[rule]) {
          return ruleSet.rules[rule](_this, event);
        }
      });
    } else {
      this.valid = true;
    }
    allClear = true;
    _ref = this.validationResults;
    for (result in _ref) {
      errMsg = _ref[result];
      if (errMsg) {
        allClear = false;
      }
    }
    if (allClear) {
      this.emit("ValidationPassed");
      this.emit("ValidationResult", true);
      return this.valid = true;
    } else {
      return this.emit("ValidationResult", false);
    }
  };

  KDInputView.prototype.createRuleChain = function(ruleSet) {
    var rule, rules, value, _i, _len, _ref, _results;
    rules = ruleSet.rules;
    this.validationResults || (this.validationResults = {});
    this.ruleChain = typeof rules === "object" ? (function() {
      var _results;
      _results = [];
      for (rule in rules) {
        value = rules[rule];
        _results.push(rule);
      }
      return _results;
    })() : [rules];
    _ref = this.ruleChain;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      rule = _ref[_i];
      _results.push(this.validationResults[rule] = null);
    }
    return _results;
  };

  KDInputView.prototype.setValidationResult = function(rule, err) {
    if (err) {
      this.validationResults[rule] = err;
      if (this.getOptions().validationNotifications) {
        this.showValidationError(err);
      }
      this.emit("ValidationError", err);
      return this.valid = false;
    } else {
      return this.validationResults[rule] = null;
    }
  };

  KDInputView.prototype.showValidationError = function(message) {
    var notice,
      _this = this;
    if (this.inputValidationNotifications[message]) {
      this.inputValidationNotifications[message].destroy();
    }
    this.inputValidationNotifications[message] = notice = new KDNotificationView({
      title: message,
      type: 'growl',
      cssClass: 'mini',
      duration: 2500
    });
    return notice.on("KDObjectWillBeDestroyed", function() {
      message = notice.getOptions().title;
      return delete _this.inputValidationNotifications[message];
    });
  };

  KDInputView.prototype.clearValidationFeedback = function() {
    this.unsetClass("validation-error validation-passed");
    return this.emit("ValidationFeedbackCleared");
  };

  KDInputView.prototype.giveValidationFeedback = function(err) {
    if (err) {
      return this.setClass("validation-error");
    } else {
      this.setClass("validation-passed");
      return this.unsetClass("validation-error");
    }
  };

  KDInputView.prototype.setCaretPosition = function(pos) {
    return this.selectRange(pos, pos);
  };

  KDInputView.prototype.getCaretPosition = function() {
    var el, r, rc, re;
    el = this.$()[0];
    if (el.selectionStart) {
      return el.selectionStart;
    } else if (document.selection) {
      el.focus();
      r = document.selection.createRange();
      if (!r) {
        return 0;
      }
      re = el.createTextRange();
      rc = re.duplicate();
      re.moveToBookmark(r.getBookmark());
      rc.setEndPoint('EndToStart', re);
      return rc.text.length;
    }
    return 0;
  };

  KDInputView.prototype.selectAll = function() {
    return this.getDomElement().select();
  };

  KDInputView.prototype.selectRange = function(selectionStart, selectionEnd) {
    var input, range;
    input = this.$()[0];
    if (input.setSelectionRange) {
      input.focus();
      return input.setSelectionRange(selectionStart, selectionEnd);
    } else if (input.createTextRange) {
      range = input.createTextRange();
      range.collapse(true);
      range.moveEnd('character', selectionEnd);
      range.moveStart('character', selectionStart);
      return range.select();
    }
  };

  KDInputView.prototype.setAutoGrow = function() {
    var $growCalculator;
    this.setClass("autogrow");
    $growCalculator = $("<div/>", {
      "class": "invisible"
    });
    this.listenTo({
      KDEventTypes: "focus",
      listenedToInstance: this,
      callback: function() {
        var _this = this;
        return this.utils.wait(10, function() {
          $growCalculator.appendTo('body');
          return $growCalculator.css({
            height: "auto",
            "z-index": 100000,
            width: _this.$().width(),
            padding: _this.$().css('padding'),
            "word-break": _this.$().css('word-break'),
            "font-size": _this.$().css('font-size'),
            "line-height": _this.$().css('line-height')
          });
        });
      }
    });
    this.listenTo({
      KDEventTypes: "blur",
      listenedToInstance: this,
      callback: function() {
        $growCalculator.detach();
        return this.$()[0].style.height = "none";
      }
    });
    return this.listenTo({
      KDEventTypes: "keyup",
      listenedToInstance: this,
      callback: function() {
        var border, height, padding;
        $growCalculator.text(this.getValue());
        height = $growCalculator.height();
        if (this.$().css('box-sizing') === "border-box") {
          padding = parseInt(this.$().css('padding-top'), 10) + parseInt(this.$().css('padding-bottom'), 10);
          border = parseInt(this.$().css('border-top-width'), 10) + parseInt(this.$().css('border-bottom-width'), 10);
          height = height + border + padding;
        }
        return this.setHeight(height);
      }
    });
  };

  KDInputView.prototype.enableTabKey = function() {
    return this.inputTabKeyEnabled = true;
  };

  KDInputView.prototype.disableTabKey = function() {
    return this.inputTabKeyEnabled = false;
  };

  KDInputView.prototype.change = function() {};

  KDInputView.prototype.keyUp = function() {
    return true;
  };

  KDInputView.prototype.keyDown = function(event) {
    if (this.inputTabKeyEnabled) {
      this.checkTabKey(event);
    }
    return true;
  };

  KDInputView.prototype.focus = function() {
    this.setKeyView(this);
    return true;
  };

  KDInputView.prototype.blur = function() {
    this.getSingleton("windowController").revertKeyView(this);
    return true;
  };

  KDInputView.prototype.mouseDown = function() {
    this.setFocus();
    return false;
  };

  KDInputView.prototype.checkTabKey = function(event) {
    var post, pre, se, sel, ss, t, tab, tabLength;
    tab = "  ";
    tabLength = tab.length;
    t = event.target;
    ss = t.selectionStart;
    se = t.selectionEnd;
    if (event.which === 9) {
      event.preventDefault();
      if (ss !== se && t.value.slice(ss, se).indexOf("n") !== -1) {
        pre = t.value.slice(0, ss);
        sel = t.value.slice(ss, se).replace(/n/g, "n" + tab);
        post = t.value.slice(se, t.value.length);
        t.value = pre.concat(tab).concat(sel).concat(post);
        t.selectionStart = ss + tab.length;
        return t.selectionEnd = se + tab.length;
      } else {
        t.value = t.value.slice(0, ss).concat(tab).concat(t.value.slice(ss, t.value.length));
        if (ss === se) {
          return t.selectionStart = t.selectionEnd = ss + tab.length;
        } else {
          t.selectionStart = ss + tab.length;
          return t.selectionEnd = se + tab.length;
        }
      }
    } else if (event.which === 8 && t.value.slice(ss - tabLength, ss) === tab) {
      event.preventDefault();
      t.value = t.value.slice(0, ss - tabLength).concat(t.value.slice(ss, t.value.length));
      return t.selectionStart = t.selectionEnd = ss - tab.length;
    } else if (event.which === 46 && t.value.slice(se, se + tabLength) === tab) {
      event.preventDefault();
      t.value = t.value.slice(0, ss).concat(t.value.slice(ss + tabLength, t.value.length));
      return t.selectionStart = t.selectionEnd = ss;
    } else if (event.which === 37 && t.value.slice(ss - tabLength, ss) === tab) {
      event.preventDefault();
      return t.selectionStart = t.selectionEnd = ss - tabLength;
    } else if (event.which === 39 && t.value.slice(ss, ss + tabLength) === tab) {
      event.preventDefault();
      return t.selectionStart = t.selectionEnd = ss + tabLength;
    }
  };

  return KDInputView;

})(KDView);

/*
todo:

  - on enter should validation fire by default??? Sinan - 6/6/2012
*/

var KDHitEnterInputView,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

KDHitEnterInputView = (function(_super) {

  __extends(KDHitEnterInputView, _super);

  function KDHitEnterInputView(options, data) {
    var _ref, _ref1,
      _this = this;
    if (options == null) {
      options = {};
    }
    options.type || (options.type = "textarea");
    options.button || (options.button = null);
    if ((_ref = options.showButton) == null) {
      options.showButton = false;
    }
    options.label || (options.label = null);
    options.placeholder || (options.placeholder = "");
    options.callback || (options.callback = null);
    options.togglerPartials || (options.togglerPartials = ["quick update disabled", "quick update enabled"]);
    KDHitEnterInputView.__super__.constructor.call(this, options, data);
    this.setClass("hitenterview");
    this.button = (_ref1 = this.getOptions().button) != null ? _ref1 : null;
    this.enableEnterKey();
    if (options.label != null) {
      this.setToggler();
    }
    if (this.getOptions().showButton) {
      this.disableEnterKey();
    }
    this.on("ValidationPassed", function() {
      var _ref2;
      _this.blur();
      return (_ref2 = _this.getOptions().callback) != null ? _ref2.call(_this, _this.getValue()) : void 0;
    });
  }

  KDHitEnterInputView.prototype.enableEnterKey = function() {
    this.setClass("active");
    if (this.button) {
      this.hideButton();
    }
    if (this.inputEnterToggler != null) {
      this.inputEnterToggler.$().html(this.getOptions().togglerPartials[1]);
    }
    return this.enterKeyEnabled = true;
  };

  KDHitEnterInputView.prototype.disableEnterKey = function() {
    this.unsetClass("active");
    if (this.button) {
      this.showButton();
    }
    if (this.inputEnterToggler != null) {
      this.inputEnterToggler.$().html(this.getOptions().togglerPartials[0]);
    }
    return this.enterKeyEnabled = false;
  };

  KDHitEnterInputView.prototype.setToggler = function() {
    var o;
    o = this.getOptions();
    this.inputEnterToggler = new KDCustomHTMLView({
      tagName: "a",
      cssClass: "hitenterview-toggle",
      partial: o.showButton ? o.togglerPartials[0] : o.togglerPartials[1]
    });
    this.inputLabel.addSubView(this.inputEnterToggler);
    return this.listenTo({
      KDEventTypes: "click",
      listenedToInstance: this.inputEnterToggler,
      callback: this.toggleEnterKey
    });
  };

  KDHitEnterInputView.prototype.hideButton = function() {
    return this.button.hide();
  };

  KDHitEnterInputView.prototype.showButton = function() {
    return this.button.show();
  };

  KDHitEnterInputView.prototype.toggleEnterKey = function() {
    if (this.enterKeyEnabled) {
      return this.disableEnterKey();
    } else {
      return this.enableEnterKey();
    }
  };

  KDHitEnterInputView.prototype.keyDown = function(event) {
    if (event.which === 13 && (event.altKey || event.shiftKey) !== true && this.enterKeyEnabled) {
      this.handleEvent({
        type: "EnterPerformed"
      });
      this.validate();
      return false;
    }
  };

  return KDHitEnterInputView;

})(KDInputView);

var KDInputRadioGroup,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

KDInputRadioGroup = (function(_super) {

  __extends(KDInputRadioGroup, _super);

  function KDInputRadioGroup(options) {
    this.setType("radio");
    KDInputRadioGroup.__super__.constructor.call(this, options);
  }

  KDInputRadioGroup.prototype.setDomElement = function() {
    var $div, $label, $radio, i, options, radio, _i, _len, _ref;
    options = this.getOptions();
    this.domElement = $("<fieldset class='radiogroup kdinput'></fieldset>");
    _ref = options.radios;
    for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
      radio = _ref[i];
      $div = $("<div/>", {
        "class": "kd-radio-holder"
      });
      $radio = $("<input/>", {
        type: "radio",
        name: options.name,
        value: radio.value,
        "class": "no-kdinput",
        id: "" + (this.getId()) + "_radio_" + i
      });
      $label = $("<label/>", {
        "for": "" + (this.getId()) + "_radio_" + i,
        html: radio.title
      });
      $div.append($radio);
      $div.append($label);
      this.domElement.append($div);
    }
    return this.domElement;
  };

  KDInputRadioGroup.prototype.setDefaultValue = function(value) {
    this.inputDefaultValue = value;
    return this.setValue(value);
  };

  KDInputRadioGroup.prototype.getValue = function() {
    return this.getDomElement().find("input:checked").val();
  };

  KDInputRadioGroup.prototype.setValue = function(value) {
    return this.getDomElement().find("input[value='" + value + "']").attr("checked", "checked");
  };

  return KDInputRadioGroup;

})(KDInputView);

var KDInputSwitch,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

KDInputSwitch = (function(_super) {

  __extends(KDInputSwitch, _super);

  function KDInputSwitch(options) {
    if (options == null) {
      options = {};
    }
    options.type = "switch";
    KDInputSwitch.__super__.constructor.call(this, options);
    this.setPartial("<input class='checkbox hidden no-kdinput' type='checkbox' name='" + (this.getName()) + "'/>");
  }

  KDInputSwitch.prototype.setDomElement = function() {
    return this.domElement = $("<span class='kdinput kdinputswitch off'></span>");
  };

  KDInputSwitch.prototype.setDefaultValue = function(value) {
    switch (value) {
      case true:
      case "on":
      case "true":
      case "yes":
      case 1:
        return this._setDefaultValue(true);
      default:
        return this._setDefaultValue(false);
    }
  };

  KDInputSwitch.prototype.getDefaultValue = function() {
    return this.inputDefaultValue;
  };

  KDInputSwitch.prototype.getValue = function() {
    return this.getDomElement().find("input").eq(0).is(":checked");
  };

  KDInputSwitch.prototype.setValue = function(value) {
    switch (value) {
      case true:
        return this.switchAnimateOn();
      case false:
        return this.switchAnimateOff();
    }
  };

  KDInputSwitch.prototype._setDefaultValue = function(val) {
    var _this = this;
    return setTimeout(function() {
      val = !!val;
      if (val) {
        _this.inputDefaultValue = true;
        _this.getDomElement().find("input").eq(0).attr("checked", true);
        return _this.getDomElement().removeClass("off").addClass("on");
      } else {
        _this.inputDefaultValue = false;
        _this.getDomElement().find("input").eq(0).attr("checked", false);
        return _this.getDomElement().removeClass("on").addClass("off");
      }
    }, 0);
  };

  KDInputSwitch.prototype.switchAnimateOff = function() {
    var counter, timer,
      _this = this;
    if (!this.getValue()) {
      return;
    }
    counter = 0;
    return timer = setInterval(function() {
      _this.getDomElement().css("background-position", "left -" + (counter * 20) + "px");
      if (counter === 6) {
        clearInterval(timer);
        _this.getDomElement().find("input").eq(0).attr("checked", false);
        _this.getDomElement().removeClass("on").addClass("off");
        _this.switchStateChanged();
      }
      return counter++;
    }, 20);
  };

  KDInputSwitch.prototype.switchAnimateOn = function() {
    var counter, timer,
      _this = this;
    if (this.getValue()) {
      return;
    }
    counter = 6;
    return timer = setInterval(function() {
      _this.getDomElement().css("background-position", "left -" + (counter * 20) + "px");
      if (counter === 0) {
        clearInterval(timer);
        _this.getDomElement().find("input").eq(0).attr("checked", true);
        _this.getDomElement().removeClass("off").addClass("on");
        _this.switchStateChanged();
      }
      return counter--;
    }, 20);
  };

  KDInputSwitch.prototype.switchStateChanged = function() {
    if (this.getCallback() != null) {
      return this.getCallback().call(this, this.getValue());
    }
  };

  KDInputSwitch.prototype.mouseDown = function() {
    switch (this.getValue()) {
      case true:
        this.setValue(false);
        break;
      case false:
        this.setValue(true);
    }
    return false;
  };

  return KDInputSwitch;

})(KDInputView);

var KDOnOffSwitch,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

KDOnOffSwitch = (function(_super) {

  __extends(KDOnOffSwitch, _super);

  function KDOnOffSwitch(options, data) {
    if (options == null) {
      options = {};
    }
    options.type || (options.type = "switch");
    options.size || (options.size = "small");
    options.labels || (options.labels = ["ON", "OFF"]);
    KDOnOffSwitch.__super__.constructor.call(this, options, data);
    this.setClass(options.size);
    this.setPartial("<input class='checkbox hidden no-kdinput' type='checkbox' name='" + (this.getName()) + "'/>");
  }

  KDOnOffSwitch.prototype.setDomElement = function(cssClass) {
    var labels, name, title, _ref;
    _ref = this.getOptions(), title = _ref.title, labels = _ref.labels, name = _ref.name;
    this.inputName = name;
    title || (title = "");
    return this.domElement = $("<div class='kdinput on-off off " + cssClass + "'>\n  <span>" + title + "</span>\n  <a href='#' class='on' title='turn on'>" + labels[0] + "</a><a href='#' class='off' title='turn off'>" + labels[1] + "</a>\n</div> ");
  };

  KDOnOffSwitch.prototype.setDefaultValue = function(value) {
    switch (value) {
      case true:
      case "on":
      case "true":
      case "yes":
      case 1:
        return this._setDefaultValue(true);
      default:
        return this._setDefaultValue(false);
    }
  };

  KDOnOffSwitch.prototype.getDefaultValue = function() {
    return this.inputDefaultValue;
  };

  KDOnOffSwitch.prototype.getValue = function() {
    return this.getDomElement().find("input").eq(0).is(":checked");
  };

  KDOnOffSwitch.prototype.setValue = function(value) {
    switch (value) {
      case true:
        return this._setOn();
      case false:
        return this._setOff();
    }
  };

  KDOnOffSwitch.prototype._setDefaultValue = function(val) {
    var _this = this;
    return setTimeout(function() {
      val = !!val;
      if (val) {
        return _this._setOn(false);
      } else {
        return _this._setOff(false);
      }
    }, 0);
  };

  KDOnOffSwitch.prototype._setOff = function(wCallback) {
    if (wCallback == null) {
      wCallback = true;
    }
    if (!this.getValue() && wCallback) {
      return;
    }
    this.inputDefaultValue = false;
    this.getDomElement().find("input").eq(0).attr("checked", false);
    this.$('a.on').removeClass('active');
    this.$('a.off').addClass('active');
    if (wCallback) {
      return this.switchStateChanged();
    }
  };

  KDOnOffSwitch.prototype._setOn = function(wCallback) {
    if (wCallback == null) {
      wCallback = true;
    }
    if (this.getValue() && wCallback) {
      return;
    }
    this.inputDefaultValue = true;
    this.getDomElement().find("input").eq(0).attr("checked", true);
    this.$('a.off').removeClass('active');
    this.$('a.on').addClass('active');
    if (wCallback) {
      return this.switchStateChanged();
    }
  };

  KDOnOffSwitch.prototype.switchStateChanged = function() {
    if (this.getCallback() != null) {
      return this.getCallback().call(this, this.getValue());
    }
  };

  KDOnOffSwitch.prototype.mouseDown = function(event) {
    if ($(event.target).is('a.on')) {
      return this.setValue(true);
    } else if ($(event.target).is('a.off')) {
      return this.setValue(false);
    }
  };

  return KDOnOffSwitch;

})(KDInputView);

var KDSelectBox,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

KDSelectBox = (function(_super) {

  __extends(KDSelectBox, _super);

  function KDSelectBox(options) {
    options = $.extend({
      type: "select",
      cssClass: ""
    }, options);
    KDSelectBox.__super__.constructor.call(this, options);
  }

  KDSelectBox.prototype.setDomElement = function(cssClass) {
    var name;
    this.inputName = this.options.name;
    name = "name='" + this.options.name + "'";
    this.domElement = $("<div class='kdselectbox " + cssClass + "'>\n  <select " + name + "></select>\n  <span class='title'></span>\n  <span class='arrows'></span>\n</div>\"");
    this._$select = this.$().find("select").eq(0);
    this._$title = this.$().find("span.title").eq(0);
    return this.domElement;
  };

  KDSelectBox.prototype.bindEvents = function() {
    var _this = this;
    this._$select.bind("blur change focus", function(event) {
      var _base;
      if (event.type === "change") {
        if (typeof (_base = _this.getCallback()) === "function") {
          _base(_this.getValue());
        }
      }
      _this.emit(event.type, event, _this.getValue());
      return _this.handleEvent(event);
    });
    return KDSelectBox.__super__.bindEvents.apply(this, arguments);
  };

  KDSelectBox.prototype.setDefaultValue = function(value) {
    if (value !== "") {
      this.getDomElement().val(value);
    }
    this._$select.val(value);
    this._$title.text(this._$select.find("option[value=\"" + value + "\"]").text());
    return this.inputDefaultValue = value;
  };

  KDSelectBox.prototype.getDefaultValue = function() {
    return this.inputDefaultValue;
  };

  KDSelectBox.prototype.getValue = function() {
    return this._$select.val();
  };

  KDSelectBox.prototype.setValue = function(value) {
    this._$select.val(value);
    return this.change();
  };

  KDSelectBox.prototype.makeDisabled = function() {
    this.setClass("disabled");
    return this._$select.attr("disabled", "disabled");
  };

  KDSelectBox.prototype.makeEnabled = function() {
    this.unsetClass("disabled");
    return this._$select.removeAttr("disabled");
  };

  KDSelectBox.prototype.setSelectOptions = function(options) {
    var $optGroup, optGroup, option, subOptions, value, _i, _j, _len, _len1;
    if (!options.length) {
      for (optGroup in options) {
        subOptions = options[optGroup];
        $optGroup = $("<optgroup label='" + optGroup + "'/>");
        this._$select.append($optGroup);
        for (_i = 0, _len = subOptions.length; _i < _len; _i++) {
          option = subOptions[_i];
          $optGroup.append("<option value='" + option.value + "'>" + option.title + "</option>");
        }
      }
    } else if (options.length) {
      for (_j = 0, _len1 = options.length; _j < _len1; _j++) {
        option = options[_j];
        this._$select.append("<option value='" + option.value + "'>" + option.title + "</option>");
      }
    } else {
      warn("no valid options specified for the input:", this);
    }
    this._$select.val(this.getDefaultValue());
    value = this.getDefaultValue() + "";
    return this._$title.text(this._$select.find("option[value=\"" + value + "\"]").text());
  };

  KDSelectBox.prototype.change = function() {
    return this._$title.text(this._$select.find("option[value=\"" + (this.getValue()) + "\"]").text());
  };

  KDSelectBox.prototype.focus = function() {
    return this.setClass('focus');
  };

  KDSelectBox.prototype.blur = function() {
    return this.unsetClass('focus');
  };

  return KDSelectBox;

})(KDInputView);

var KDSliderView, KDSliderViewHandle,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

KDSliderView = (function(_super) {

  __extends(KDSliderView, _super);

  function KDSliderView(options) {
    var inputViewOptions;
    this.setType("slider");
    KDSliderView.__super__.constructor.call(this, options);
    inputViewOptions = $.extend({
      type: "hidden"
    }, options);
    this.addSubView(this.hiddenInput = new KDInputView(inputViewOptions));
    this.addSubView(this.sliderHandle = new KDSliderViewHandle());
  }

  KDSliderView.prototype.setDomElement = function(cssClass) {
    return this.domElement = $("<div class='kdinput kdinputslider " + cssClass + "'></div>");
  };

  KDSliderView.prototype.setDefaultValue = function(value) {};

  KDSliderView.prototype.getValue = function() {
    return this;
  };

  KDSliderView.prototype.setValue = function(value) {};

  return KDSliderView;

})(KDInputView);

KDSliderViewHandle = (function(_super) {

  __extends(KDSliderViewHandle, _super);

  function KDSliderViewHandle() {
    return KDSliderViewHandle.__super__.constructor.apply(this, arguments);
  }

  return KDSliderViewHandle;

})(KDView);

var KDWmdInput,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

KDWmdInput = (function(_super) {

  __extends(KDWmdInput, _super);

  function KDWmdInput(options, data) {
    var _ref;
    options = options != null ? options : {};
    options.type = "textarea";
    options.preview = (_ref = options.preview) != null ? _ref : false;
    KDWmdInput.__super__.constructor.call(this, options, data);
    this.setClass("monospace");
  }

  KDWmdInput.prototype.setWMD = function() {
    var preview;
    preview = this.getOptions().preview;
    this.getDomElement().wmd({
      preview: preview
    });
    if (preview) {
      return this.getDomElement().after("<h3 class='wmd-preview-title'>Preview:</h3>");
    }
  };

  return KDWmdInput;

})(KDInputView);

var KDTokenizedMenu,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

KDTokenizedMenu = (function(_super) {

  __extends(KDTokenizedMenu, _super);

  function KDTokenizedMenu(options, data) {
    if (options == null) {
      options = {};
    }
    options.treeItemClass || (options.treeItemClass = null);
    options.listViewClass || (options.listViewClass = null);
    options.addListsCollapsed || (options.addListsCollapsed = null);
    options.putDepthInfo || (options.putDepthInfo = null);
    KDTokenizedMenu.__super__.constructor.call(this, options, data);
  }

  return KDTokenizedMenu;

})(JContextMenu);

var KDTokenizedInput,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

KDTokenizedInput = (function(_super) {

  __extends(KDTokenizedInput, _super);

  function KDTokenizedInput(options, data) {
    var o, rule, _base, _base1, _base2, _base3;
    if (options == null) {
      options = {};
    }
    options.cssClass = "kdtokenizedinput" + (options.cssClass ? ' ' + options.cssClass : '');
    options.match || (options.match = null);
    options.input || (options.input = {});
    options.layer || (options.layer = {});
    KDTokenizedInput.__super__.constructor.call(this, options, data);
    o = this.getOptions();
    (_base = o.input).type || (_base.type = "textarea");
    (_base1 = o.input).bind || (_base1.bind = "change");
    (_base2 = o.input).cssClass || (_base2.cssClass = "input layer" + (o.input.cssClass ? ' ' + o.input.cssClass : ''));
    (_base3 = o.layer).cssClass || (_base3.cssClass = "presentation layer" + (o.layer.cssClass ? ' ' + o.layer.cssClass : ''));
    this.input = new KDInputView(o.input);
    this.layer = new KDCustomHTMLView(o.layer);
    this.menu = null;
    this.input.unsetClass('kdinput');
    this.registeredTokens = {};
    this._oldMatches = [];
    for (rule in o.match) {
      this.registeredTokens[rule] = [];
    }
    this.input.on("keydown", this.keyDownOnInput.bind(this));
    this.input.on("keyup", this.keyUpOnInput.bind(this));
  }

  KDTokenizedInput.prototype.keyDownOnInput = function(event) {
    return this.decorateLayer();
  };

  KDTokenizedInput.prototype.keyUpOnInput = function(event) {
    var input, matchRules, matches, rule, ruleSet, val, _oldMatches, _results;
    _oldMatches = this._oldMatches;
    matchRules = this.getOptions().match;
    val = this.input.getValue();
    this.decorateLayer();
    input = this.input;
    log(_oldMatches);
    if (matchRules) {
      _results = [];
      for (rule in matchRules) {
        ruleSet = matchRules[rule];
        val = val.slice(0, input.getCaretPosition());
        matches = val.match(ruleSet.regex);
        if (matches) {
          _results.push(matches.forEach(function(match, i) {
            if (_oldMatches[i] !== match) {
              _oldMatches[i] = match;
              if (ruleSet.throttle) {
                return __utils.throttle(function() {
                  return ruleSet.dataSource(match);
                }, ruleSet.throttle)();
              } else {
                return ruleSet.dataSource(match);
              }
            }
          }));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    }
  };

  KDTokenizedInput.prototype.showMenu = function(options, data) {
    var o, rule, token,
      _this = this;
    token = options.token, rule = options.rule;
    if (this.menu) {
      this.menu.destroy();
    }
    o = {
      x: this.getX(),
      y: this.input.getY() + this.input.getHeight(),
      itemChildClass: options.itemChildClass,
      itemChildOptions: options.itemChildOptions,
      treeItemClass: options.treeItemClass,
      listViewClass: options.listViewClass,
      addListsCollapsed: options.addListsCollapsed,
      putDepthInfo: options.putDepthInfo
    };
    this.input.setBlur();
    this.menu = new KDTokenizedMenu(o, data);
    return this.menu.on("ContextMenuItemReceivedClick", function(menuItem) {
      return _this.registerSelectedToken({
        rule: rule,
        token: token
      }, menuItem.getData());
    });
  };

  KDTokenizedInput.prototype.registerSelectedToken = function(_arg, data) {
    var dataSet, replacedText, rule, token, val,
      _this = this;
    rule = _arg.rule, token = _arg.token;
    replacedText = this.parseReplacer(rule, data);
    dataSet = {
      replacedText: replacedText,
      data: data,
      token: token
    };
    this.registeredTokens[rule].push(dataSet);
    val = this.input.getValue();
    val = val.replace(token, replacedText);
    this.input.setValue(val);
    this.menu.destroy();
    return this.utils.wait(function() {
      var _base;
      _this.input.setFocus();
      _this.input.setCaretPosition(val.indexOf(replacedText) + replacedText.length);
      _this.decorateLayer();
      return typeof (_base = _this.getOptions().match[rule]).added === "function" ? _base.added(data) : void 0;
    });
  };

  KDTokenizedInput.prototype.decorateLayer = function() {
    var $input, $layer, c, dataSet, i, inner, replacedText, replacedTextHash, rule, tokenSet, tokens, value, _base, _i, _len, _ref, _results;
    value = this.input.getValue();
    $layer = this.layer.$();
    $input = this.input.$();
    $layer.text(value);
    replacedTextHash = {};
    $layer.scrollTop($input.scrollTop());
    _ref = this.registeredTokens;
    for (rule in _ref) {
      tokens = _ref[rule];
      for (_i = 0, _len = tokens.length; _i < _len; _i++) {
        dataSet = tokens[_i];
        replacedTextHash[dataSet.replacedText] = dataSet;
        replacedTextHash[dataSet.replacedText].rule = rule;
        inner = $layer.html();
        inner = inner.replace(dataSet.replacedText, "<b" + ((c = this.getOptions().match[rule].wrapperClass) ? ' class=\"' + c + '\"' : '') + ">" + dataSet.replacedText + "</b>");
        $layer.html(inner);
      }
    }
    _results = [];
    for (replacedText in replacedTextHash) {
      dataSet = replacedTextHash[replacedText];
      if (this.input.getValue().indexOf(replacedText) === -1) {
        if (typeof (_base = this.getOptions().match[dataSet.rule]).removed === "function") {
          _base.removed(dataSet.data);
        }
        _results.push((function() {
          var _j, _len1, _ref1, _results1;
          _ref1 = this.registeredTokens[dataSet.rule];
          _results1 = [];
          for (i = _j = 0, _len1 = _ref1.length; _j < _len1; i = ++_j) {
            tokenSet = _ref1[i];
            if (tokenSet.replacedText === replacedText) {
              this.registeredTokens[dataSet.rule].splice(i, 1);
              log("remove token");
              break;
            } else {
              _results1.push(void 0);
            }
          }
          return _results1;
        }).call(this));
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };

  KDTokenizedInput.prototype.parseReplacer = function(rule, data) {
    var arr, hash, match, mustache, path, tmpl, value, _i, _len;
    tmpl = this.getOptions().match[rule].replaceSignature || "{{#(title)}}";
    arr = tmpl.match(/\{\{#\([\w|\.]+\)\}\}/g);
    hash = {};
    for (_i = 0, _len = arr.length; _i < _len; _i++) {
      match = arr[_i];
      path = match.replace('{{#(', '').replace(')}}', '');
      hash[match] = JsPath.getAt(data, path);
    }
    for (mustache in hash) {
      value = hash[mustache];
      tmpl = tmpl.replace(mustache, value);
    }
    return tmpl;
  };

  KDTokenizedInput.prototype.pistachio = function() {
    return "<div class='kdtokenizedinput-inner-wrapper'>\n  {{> @layer}}\n  {{> @input}}\n</div>";
  };

  return KDTokenizedInput;

})(JView);

var KDFileUploadArea, KDFileUploadListView, KDFileUploadThumbItemView, KDFileUploadThumbListView, KDFileUploadView, KDKDFileUploadListItemView,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

KDFileUploadView = (function(_super) {

  __extends(KDFileUploadView, _super);

  function KDFileUploadView(options, data) {
    var _ref, _ref1, _ref2, _ref3, _ref4, _ref5;
    if (window.FileReader != null) {
      if ((_ref = options.limit) == null) {
        options.limit = 20;
      }
      if ((_ref1 = options.fileMaxSize) == null) {
        options.fileMaxSize = 4096;
      }
      if ((_ref2 = options.filetotalSize) == null) {
        options.filetotalSize = 4096;
      }
      if ((_ref3 = options.extensions) == null) {
        options.extensions = null;
      }
      if ((_ref4 = options.preview) == null) {
        options.preview = "list";
      }
      if ((_ref5 = options.title) == null) {
        options.title = "Drop your files here!";
      }
      KDFileUploadView.__super__.constructor.call(this, options, data);
      this.listController = null;
      this.addDropArea();
      this.addList();
      this.files = {};
      this.listenTo({
        KDEventTypes: "FileReadComplete",
        listenedToInstance: this,
        callback: this.fileReadComplete
      });
      this.totalSizeToUpload = 0;
      this.setClass("kdfileupload");
    } else {
      KDFileUploadView.__super__.constructor.call(this, options, data);
      this.setPartial("<p class='warning info'><strong>Oops sorry,</strong> file upload is only working on Chrome, Firefox and Opera at the moment. We're working on a fix.</p>");
    }
  }

  KDFileUploadView.prototype.addDropArea = function() {
    this.dropArea = new KDFileUploadArea({
      title: this.getOptions().title,
      cssClass: "kdfileuploadarea",
      delegate: this
    });
    return this.addSubView(this.dropArea);
  };

  KDFileUploadView.prototype.addList = function() {
    this.fileList = (function() {
      switch (this.getOptions().preview) {
        case "thumbs":
          return this.addThumbnailList();
        default:
          return this.addFileList();
      }
    }).call(this);
    this.listController = new KDListViewController({
      view: this.fileList
    });
    return this.addSubView(this.listController.getView());
  };

  KDFileUploadView.prototype.addFileList = function() {
    return new KDFileUploadListView({
      delegate: this
    });
  };

  KDFileUploadView.prototype.addThumbnailList = function() {
    return new KDFileUploadThumbListView({
      delegate: this
    });
  };

  KDFileUploadView.prototype.fileDropped = function(file) {
    var reader,
      _this = this;
    reader = new FileReader();
    reader.onload = function(event) {
      return _this.propagateEvent({
        KDEventType: "FileReadComplete"
      }, {
        progressEvent: event,
        file: file
      });
    };
    return reader.readAsDataURL(file);
  };

  KDFileUploadView.prototype.fileReadComplete = function(pubInst, event) {
    var file;
    file = event.file;
    file.data = event.progressEvent.target.result;
    return this.putFileInQueue(file);
  };

  KDFileUploadView.prototype.putFileInQueue = function(file) {
    if (!this.isDuplicate(file) && this.checkLimits(file)) {
      this.files[file.name] = file;
      this.fileList.addItem(file);
      return true;
    } else {
      return false;
    }
  };

  KDFileUploadView.prototype.removeFile = function(pubInst, event) {
    var file;
    file = pubInst.getData();
    delete this.files[file.name];
    return this.fileList.removeItem(pubInst);
  };

  KDFileUploadView.prototype.isDuplicate = function(file) {
    if (this.files[file.name] != null) {
      this.notify("File is already in queue!");
      return true;
    } else {
      return false;
    }
  };

  KDFileUploadView.prototype.checkLimits = function(file) {
    return this.checkFileAmount() && this.checkFileSize(file) && this.checkTotalSize(file);
  };

  KDFileUploadView.prototype.checkFileAmount = function() {
    var amount, file, maxAmount, name, _ref;
    maxAmount = this.getOptions().limit;
    amount = 1;
    _ref = this.files;
    for (name in _ref) {
      if (!__hasProp.call(_ref, name)) continue;
      file = _ref[name];
      amount++;
    }
    if (amount > maxAmount) {
      this.notify("Total number of allowed file is " + maxAmount);
      return false;
    } else {
      return true;
    }
  };

  KDFileUploadView.prototype.checkTotalSize = function(file) {
    var name, totalMaxSize, totalSize, _ref;
    totalMaxSize = this.getOptions().totalMaxSize;
    totalSize = file.size;
    _ref = this.files;
    for (name in _ref) {
      if (!__hasProp.call(_ref, name)) continue;
      file = _ref[name];
      totalSize += file.size;
    }
    if (totalSize / 1024 > totalMaxSize) {
      this.notify("Total allowed filesize is " + totalMaxSize + " kilobytes");
      return false;
    } else {
      return true;
    }
  };

  KDFileUploadView.prototype.checkFileSize = function(file) {
    var fileMaxSize;
    fileMaxSize = this.getOptions().fileMaxSize;
    if (file.size / 1024 > fileMaxSize) {
      this.notify("Maximum allowed filesize is " + fileMaxSize + " kilobytes");
      return false;
    } else {
      return true;
    }
  };

  KDFileUploadView.prototype.notify = function(title) {
    return new KDNotificationView({
      title: title,
      duration: 2000,
      type: "tray"
    });
  };

  return KDFileUploadView;

})(KDView);

KDFileUploadArea = (function(_super) {

  __extends(KDFileUploadArea, _super);

  function KDFileUploadArea() {
    return KDFileUploadArea.__super__.constructor.apply(this, arguments);
  }

  KDFileUploadArea.prototype.dragEnter = function(e) {
    e.preventDefault();
    e.stopPropagation();
    return this.setClass("hover");
  };

  KDFileUploadArea.prototype.dragOver = function(e) {
    e.preventDefault();
    e.stopPropagation();
    return this.setClass("hover");
  };

  KDFileUploadArea.prototype.dragLeave = function(e) {
    e.preventDefault();
    e.stopPropagation();
    return this.unsetClass("hover");
  };

  KDFileUploadArea.prototype.drop = function(jQueryEvent) {
    var file, files, orgEvent, _i, _len;
    jQueryEvent.preventDefault();
    jQueryEvent.stopPropagation();
    this.unsetClass("hover");
    orgEvent = jQueryEvent.originalEvent;
    files = orgEvent.dataTransfer.files;
    for (_i = 0, _len = files.length; _i < _len; _i++) {
      file = files[_i];
      this.getDelegate().fileDropped(file);
    }
    return false;
  };

  KDFileUploadArea.prototype.viewAppended = function() {
    var o, title;
    title = this.getOptions().title;
    o = this.getDelegate().getOptions();
    this.setPartial("<span>" + title + "</span>");
    return this.addSubView(new KDCustomHTMLView({
      cssClass: "info",
      tagName: "span",
      tooltip: {
        title: "Max. File Amount: <b>" + o.limit + "</b> files<br/>Max. File Size: <b>" + o.fileMaxSize + "</b> kbytes<br/>Max. Total Size: <b>" + o.totalMaxSize + "</b> kbytes",
        placement: "above",
        offset: 0,
        delayIn: 300,
        html: true,
        animate: true,
        selector: null,
        partial: "i"
      }
    }));
  };

  return KDFileUploadArea;

})(KDView);

KDFileUploadListView = (function(_super) {

  __extends(KDFileUploadListView, _super);

  function KDFileUploadListView(options, data) {
    KDFileUploadListView.__super__.constructor.call(this, options, data);
    this.setClass("kdfileuploadlist");
  }

  KDFileUploadListView.prototype.addItem = function(file) {
    var itemInstance;
    itemInstance = new KDKDFileUploadListItemView({
      delegate: this
    }, file);
    this.getDelegate().listenTo({
      KDEventTypes: {
        eventType: "removeFile"
      },
      listenedToInstance: itemInstance,
      callback: this.getDelegate().removeFile
    });
    return this.addItemView(itemInstance);
  };

  return KDFileUploadListView;

})(KDListView);

KDKDFileUploadListItemView = (function(_super) {

  __extends(KDKDFileUploadListItemView, _super);

  function KDKDFileUploadListItemView(options, data) {
    KDKDFileUploadListItemView.__super__.constructor.call(this, options, data);
    this.setClass("kdfileuploadlistitem clearfix");
    this.active = false;
  }

  KDKDFileUploadListItemView.prototype.click = function(e) {
    if ($(e.target).is("span.iconic.x")) {
      return this.handleEvent({
        type: "removeFile",
        orgEvent: e
      });
    }
  };

  KDKDFileUploadListItemView.prototype.viewAppended = function() {
    return this.$().append(this.partial(this.data));
  };

  KDKDFileUploadListItemView.prototype.partial = function(file) {
    return $("<span class='file-title'>" + file.name + "</span>       <span class='file-size'>" + ((file.size / 1024).toFixed(2)) + "kb</span>       <span class='x'></span>");
  };

  return KDKDFileUploadListItemView;

})(KDListItemView);

KDFileUploadThumbListView = (function(_super) {

  __extends(KDFileUploadThumbListView, _super);

  function KDFileUploadThumbListView(options, data) {
    KDFileUploadThumbListView.__super__.constructor.call(this, options, data);
    this.setClass("kdfileuploadthumblist");
  }

  KDFileUploadThumbListView.prototype.addItem = function(file) {
    var itemInstance;
    itemInstance = new KDFileUploadThumbItemView({
      delegate: this
    }, file);
    this.getDelegate().listenTo({
      KDEventTypes: {
        eventType: "removeFile"
      },
      listenedToInstance: itemInstance,
      callback: this.getDelegate().removeFile
    });
    return this.addItemView(itemInstance);
  };

  return KDFileUploadThumbListView;

})(KDListView);

KDFileUploadThumbItemView = (function(_super) {

  __extends(KDFileUploadThumbItemView, _super);

  function KDFileUploadThumbItemView(options, data) {
    KDFileUploadThumbItemView.__super__.constructor.call(this, options, data);
    this.setClass("kdfileuploadthumbitem clearfix");
    this.active = false;
  }

  KDFileUploadThumbItemView.prototype.click = function(e) {
    if ($(e.target).is("span.close-icon")) {
      return this.handleEvent({
        type: "removeFile",
        orgEvent: e
      });
    }
  };

  KDFileUploadThumbItemView.prototype.viewAppended = function() {
    return this.$().append(this.partial(this.data));
  };

  KDFileUploadThumbItemView.prototype.partial = function(file) {
    var fileUrl, imageType;
    log(file);
    imageType = /image.*/;
    fileUrl = file.type.match(imageType) ? window.URL.createObjectURL(file) : "./images/icon.file.png";
    return $("<img class='thumb' src='" + fileUrl + "'/>       <p class='meta'>        <span class='file-title'>" + file.name + "</span>        <span class='file-size'>" + ((file.size / 1024).toFixed(2)) + "kb</span>        <span class='close-icon'></span>       </p>");
  };

  return KDFileUploadThumbItemView;

})(KDListItemView);

var KDImageUploadView,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

KDImageUploadView = (function(_super) {

  __extends(KDImageUploadView, _super);

  KDImageUploadView.prototype.associateForm = function(form) {
    var options,
      _this = this;
    options = this.getOptions();
    form.addCustomData(options.fieldName, []);
    this.registerListener({
      KDEventTypes: 'ImageWasResampled',
      listener: this,
      callback: function(pubInst, _arg) {
        var img, index, name;
        name = _arg.name, img = _arg.img, index = _arg.index;
        return form.addCustomData("" + options.fieldName + "." + index + "." + name, img.data);
      }
    });
    return this.listController.on('UnregisteringItem', function(_arg) {
      var index, view;
      view = _arg.view, index = _arg.index;
      return form.removeCustomData("" + options.fieldName + "." + index);
    });
  };

  function KDImageUploadView(options) {
    if (options == null) {
      options = {};
    }
    options.actions || (options.actions = []);
    options.allowedTypes || (options.allowedTypes = ['image/jpeg', 'image/gif', 'image/png']);
    options.fieldName || (options.fieldName = 'images');
    KDImageUploadView.__super__.constructor.apply(this, arguments);
    this.count = 0;
  }

  KDImageUploadView.prototype.fileReadComplete = function(pubInst, _arg) {
    var action, file, index, name, options, progressEvent, _ref, _ref1, _results,
      _this = this;
    file = _arg.file, progressEvent = _arg.progressEvent;
    options = this.getOptions();
    if (_ref = file.type, __indexOf.call(options.allowedTypes, _ref) < 0) {
      return new KDNotificationView({
        title: 'Not an image!',
        duration: 1500
      });
    } else {
      index = this.count++;
      file.data = progressEvent.target.result;
      if (this.putFileInQueue(file)) {
        _ref1 = options.actions;
        _results = [];
        for (name in _ref1) {
          if (!__hasProp.call(_ref1, name)) continue;
          action = _ref1[name];
          _results.push((function(name, action, index) {
            var img;
            img = new KDImage(file.data);
            return img.processAll(action, function() {
              return _this.propagateEvent({
                KDEventType: 'ImageWasResampled'
              }, {
                name: name,
                img: img,
                index: index
              });
            });
          })(name, action, index));
        }
        return _results;
      }
    }
  };

  return KDImageUploadView;

})(KDFileUploadView);

var KDButtonView, KDToggleButton,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

KDButtonView = (function(_super) {

  __extends(KDButtonView, _super);

  function KDButtonView(options, data) {
    if (options == null) {
      options = {};
    }
    options.callback || (options.callback = noop);
    options.title || (options.title = "");
    options.type || (options.type = "button");
    options.cssClass || (options.cssClass = options.style || (options.style = "clean-gray"));
    options.icon || (options.icon = false);
    options.iconOnly || (options.iconOnly = false);
    options.iconClass || (options.iconClass = "");
    options.disabled || (options.disabled = false);
    options.hint || (options.hint = null);
    options.loader || (options.loader = false);
    KDButtonView.__super__.constructor.call(this, options, data);
    this.setClass(options.style);
    this.setCallback(options.callback);
    this.setTitle(options.title);
    if (options.iconClass) {
      this.setIconClass(options.iconClass);
    }
    if (options.icon) {
      this.unhideIcon();
    }
    if (options.iconOnly) {
      this.setIconOnly(options.iconOnly);
    }
    if (options.disabled) {
      this.disable();
    }
    if (options.loader) {
      this.on("viewAppended", this.setLoader.bind(this));
    }
  }

  KDButtonView.prototype.setDomElement = function(cssClass) {
    return this.domElement = $("<button type='" + (this.getOptions().type) + "' class='kdbutton " + cssClass + "' id='" + (this.getId()) + "'>\n  <span class='icon hidden'></span>\n  <span class='button-title'>Title</span>\n</button>");
  };

  KDButtonView.prototype.setTitle = function(title) {
    return this.$('.button-title').html(title);
  };

  KDButtonView.prototype.getTitle = function() {
    return this.buttonTitle;
  };

  KDButtonView.prototype.setCallback = function(callback) {
    return this.buttonCallback = callback;
  };

  KDButtonView.prototype.getCallback = function() {
    return this.buttonCallback;
  };

  KDButtonView.prototype.unhideIcon = function() {
    this.setClass("with-icon");
    return this.$('span.icon').removeClass('hidden');
  };

  KDButtonView.prototype.setIconClass = function(iconClass) {
    this.$('.icon').attr('class', 'icon');
    return this.$('.icon').addClass(iconClass);
  };

  KDButtonView.prototype.setIconOnly = function() {
    var $icon;
    this.unsetClass("with-icon");
    this.$().addClass('icon-only');
    $icon = this.$('span.icon');
    return this.$().html($icon);
  };

  KDButtonView.prototype.setLoader = function() {
    var loader, loaderSize;
    this.setClass("w-loader");
    loader = this.getOptions().loader;
    loaderSize = this.getHeight();
    this.loader = new KDLoaderView({
      size: {
        width: loader.diameter || loaderSize
      },
      loaderOptions: {
        color: loader.color || "#222222",
        shape: loader.shape || "spiral",
        diameter: loader.diameter || loaderSize,
        density: loader.density || 30,
        range: loader.range || 0.4,
        speed: loader.speed || 1.5,
        FPS: loader.FPS || 24
      }
    });
    this.addSubView(this.loader, null, true);
    this.loader.$().css({
      position: "absolute",
      left: loader.left || "50%",
      top: loader.top || "50%",
      marginTop: -(loader.diameter / 2),
      marginLeft: -(loader.diameter / 2)
    });
    return this.loader.hide();
  };

  KDButtonView.prototype.showLoader = function() {
    this.setClass("loading");
    return this.loader.show();
  };

  KDButtonView.prototype.hideLoader = function() {
    this.unsetClass("loading");
    return this.loader.hide();
  };

  KDButtonView.prototype.disable = function() {
    return this.$().attr("disabled", true);
  };

  KDButtonView.prototype.enable = function() {
    return this.$().attr("disabled", false);
  };

  KDButtonView.prototype.focus = function() {
    return this.$().trigger("focus");
  };

  KDButtonView.prototype.click = function(event) {
    var type;
    if (this.loader && this.loader.active) {
      event.stopPropagation();
      event.preventDefault();
      return false;
    }
    if (this.loader && !this.loader.active) {
      this.showLoader();
    }
    type = this.getOptions().type;
    if (type === "button") {
      event.stopPropagation();
      event.preventDefault();
    }
    this.getCallback().call(this, event);
    return false;
  };

  KDButtonView.prototype.triggerClick = function() {
    return this.doOnSubmit();
  };

  return KDButtonView;

})(KDView);

KDToggleButton = (function(_super) {

  __extends(KDToggleButton, _super);

  function KDToggleButton(options, data) {
    if (options == null) {
      options = {};
    }
    options = $.extend({
      dataPath: null,
      defaultState: null,
      states: []
    }, options);
    KDToggleButton.__super__.constructor.call(this, options, data);
    this.setState(options.defaultState);
  }

  KDToggleButton.prototype.getStateIndex = function(name) {
    var index, state, states, _i, _len;
    states = this.getOptions().states;
    if (!name) {
      return 0;
    } else {
      for (index = _i = 0, _len = states.length; _i < _len; index = ++_i) {
        state = states[index];
        if (name === state) {
          return index;
        }
      }
    }
  };

  KDToggleButton.prototype.decorateState = function(name) {
    return this.setTitle(this.state);
  };

  KDToggleButton.prototype.getState = function() {
    return this.state;
  };

  KDToggleButton.prototype.setState = function(name) {
    var index, states;
    states = this.getOptions().states;
    this.stateIndex = index = this.getStateIndex(name);
    this.state = states[index];
    this.decorateState(name);
    return this.setCallback(states[this.stateIndex + 1].bind(this, this.toggleState.bind(this)));
  };

  KDToggleButton.prototype.toggleState = function(err) {
    var nextState, states;
    states = this.getOptions().states;
    nextState = states[this.stateIndex + 2] || states[0];
    if (!err) {
      return this.setState(nextState);
    } else {
      return warn(err.msg || ("there was an error, couldn't switch to " + nextState + " state!"));
    }
  };

  return KDToggleButton;

})(KDButtonView);

var KDButtonViewWithMenu,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

KDButtonViewWithMenu = (function(_super) {

  __extends(KDButtonViewWithMenu, _super);

  function KDButtonViewWithMenu() {
    return KDButtonViewWithMenu.__super__.constructor.apply(this, arguments);
  }

  KDButtonViewWithMenu.prototype.setDomElement = function(cssClass) {
    if (cssClass == null) {
      cssClass = '';
    }
    this.domElement = $("<div class='kdbuttonwithmenu-wrapper " + cssClass + "'>\n  <button class='kdbutton " + cssClass + " with-icon with-menu' id='" + (this.getId()) + "'>\n    <span class='icon hidden'></span>\n  </button>\n  <span class='chevron-separator'></span>\n  <span class='chevron'></span>\n</div>");
    this.$button = this.$('button').first();
    return this.domElement;
  };

  KDButtonViewWithMenu.prototype.setIconOnly = function() {
    var $icons;
    this.$().addClass('icon-only').removeClass('with-icon');
    $icons = this.$('span.icon,span.chevron');
    return this.$().html($icons);
  };

  KDButtonViewWithMenu.prototype.click = function(event) {
    if ($(event.target).is(".chevron")) {
      this.contextMenu(event);
      return false;
    }
    return this.getCallback().call(this, event);
  };

  KDButtonViewWithMenu.prototype.contextMenu = function(event) {
    this.createContextMenu(event);
    return false;
  };

  KDButtonViewWithMenu.prototype.createContextMenu = function(event) {
    var o,
      _this = this;
    o = this.getOptions();
    this.buttonMenu = new (o.buttonMenuClass || JButtonMenu)({
      cssClass: o.style,
      ghost: this.$('.chevron').clone(),
      event: event,
      delegate: this,
      treeItemClass: o.treeItemClass,
      itemChildClass: o.itemChildClass,
      itemChildOptions: o.itemChildOptions
    }, "function" === typeof o.menu ? o.menu() : o.menu);
    return this.buttonMenu.on("ContextMenuItemReceivedClick", function() {
      return _this.buttonMenu.destroy();
    });
  };

  KDButtonViewWithMenu.prototype.setTitle = function(title) {
    return this.$button.append(title);
  };

  KDButtonViewWithMenu.prototype.setButtonStyle = function(newStyle) {
    var style, styles, _i, _len;
    styles = this.constructor.styles;
    for (_i = 0, _len = styles.length; _i < _len; _i++) {
      style = styles[_i];
      this.$().removeClass(style);
      this.$button.removeClass(style);
    }
    this.$button.addClass(newStyle);
    return this.$().addClass(newStyle);
  };

  KDButtonViewWithMenu.prototype.setIconOnly = function() {
    var $icon;
    this.$button.addClass('icon-only').removeClass('with-icon');
    $icon = this.$('span.icon');
    return this.$button.html($icon);
  };

  KDButtonViewWithMenu.prototype.disable = function() {
    return this.$button.attr("disabled", true);
  };

  KDButtonViewWithMenu.prototype.enable = function() {
    return this.$button.attr("disabled", false);
  };

  return KDButtonViewWithMenu;

})(KDButtonView);

var JButtonMenu,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

JButtonMenu = (function(_super) {

  __extends(JButtonMenu, _super);

  function JButtonMenu(options, data) {
    if (options == null) {
      options = {};
    }
    options.cssClass = this.utils.curryCssClass("kdbuttonmenu", options.cssClass);
    options.listViewClass || (options.listViewClass = JContextMenuTreeView);
    JButtonMenu.__super__.constructor.call(this, options, data);
  }

  JButtonMenu.prototype.viewAppended = function() {
    JButtonMenu.__super__.viewAppended.apply(this, arguments);
    this.setPartial("<div class='chevron-ghost-wrapper'><span class='chevron-ghost'></span></div>");
    return this.positionContextMenu();
  };

  JButtonMenu.prototype.positionContextMenu = function() {
    var button, buttonHeight, buttonWidth, ghostCss, mainHeight, menuHeight, menuWidth, top;
    button = this.getDelegate();
    mainHeight = $(window).height();
    buttonHeight = button.getHeight();
    buttonWidth = button.getWidth();
    top = button.getY() + buttonHeight;
    menuHeight = this.getHeight();
    menuWidth = this.getWidth();
    ghostCss = top + menuHeight > mainHeight ? (top = button.getY() - menuHeight, this.setClass("top-menu"), {
      top: "100%",
      height: buttonHeight
    }) : {
      top: -(buttonHeight + 1),
      height: buttonHeight
    };
    this.$(".chevron-ghost-wrapper").css(ghostCss);
    return this.$().css({
      top: top,
      left: button.getX() + buttonWidth - menuWidth
    });
  };

  return JButtonMenu;

})(JContextMenu);

var KDButtonGroupView,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

KDButtonGroupView = (function(_super) {

  __extends(KDButtonGroupView, _super);

  function KDButtonGroupView(options, data) {
    var cssClass;
    if (options == null) {
      options = {};
    }
    cssClass = options.cssClass;
    cssClass = cssClass ? " " + cssClass : "";
    options.cssClass = "kdbuttongroup" + cssClass;
    options.buttons || (options.buttons = {});
    KDButtonGroupView.__super__.constructor.call(this, options, data);
    this.buttons = {};
    this.createButtons(options.buttons);
  }

  KDButtonGroupView.prototype.createButtons = function(allButtonOptions) {
    var buttonClass, buttonOptions, buttonTitle, _results,
      _this = this;
    _results = [];
    for (buttonTitle in allButtonOptions) {
      buttonOptions = allButtonOptions[buttonTitle];
      buttonClass = buttonOptions.buttonClass || KDButtonView;
      buttonOptions.title = buttonTitle;
      buttonOptions.style = "";
      this.addSubView(this.buttons[buttonTitle] = new buttonClass(buttonOptions));
      _results.push(this.listenTo({
        KDEventTypes: "click",
        listenedToInstance: this.buttons[buttonTitle],
        callback: function(pubInst, event) {
          return _this.buttonReceivedClick(pubInst, event);
        }
      }));
    }
    return _results;
  };

  KDButtonGroupView.prototype.buttonReceivedClick = function(button, event) {
    var otherButton, title, _ref;
    _ref = this.buttons;
    for (title in _ref) {
      otherButton = _ref[title];
      otherButton.unsetClass("toggle");
    }
    return button.setClass("toggle");
  };

  return KDButtonGroupView;

})(KDView);

var KDFormView,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  __slice = [].slice;

KDFormView = (function(_super) {

  __extends(KDFormView, _super);

  KDFormView.findChildInputs = function(parent) {
    var inputs, subViews;
    inputs = [];
    subViews = parent.getSubViews();
    if (subViews.length > 0) {
      subViews.forEach(function(subView) {
        if (subView instanceof KDInputView) {
          inputs.push(subView);
        }
        return inputs = inputs.concat(KDFormView.findChildInputs(subView));
      });
    }
    return inputs;
  };

  /*
    INSTANCE LEVEL
  */


  function KDFormView(options, data) {
    this.submit = __bind(this.submit, this);

    this.reset = __bind(this.reset, this);
    options = $.extend({
      callback: noop,
      customData: {}
    }, options);
    KDFormView.__super__.constructor.call(this, options, data);
    this.valid = null;
    this.setCallback(options.callback);
    this.customData = {};
  }

  KDFormView.prototype.childAppended = function(child) {
    if (typeof child.associateForm === "function") {
      child.associateForm(this);
    }
    if (child instanceof KDInputView) {
      this.propagateEvent({
        KDEventType: 'inputWasAdded'
      }, child);
    }
    return KDFormView.__super__.childAppended.apply(this, arguments);
  };

  KDFormView.prototype.bindEvents = function() {
    var _this = this;
    this.getDomElement().bind("submit", function(event) {
      return _this.handleEvent(event);
    });
    return KDFormView.__super__.bindEvents.call(this);
  };

  KDFormView.prototype.setDomElement = function() {
    var cssClass, _ref;
    cssClass = (_ref = this.getOptions().cssClass) != null ? _ref : "";
    return this.domElement = $("<form class='kdformview " + cssClass + "'></form>");
  };

  KDFormView.prototype.getCustomData = function(path) {
    if (path) {
      return JsPath.getAt(this.customData, path);
    } else {
      return this.customData;
    }
  };

  KDFormView.prototype.addCustomData = function(path, value) {
    var key, _results;
    if ('string' === typeof path) {
      return JsPath.setAt(this.customData, path, value);
    } else {
      _results = [];
      for (key in path) {
        if (!__hasProp.call(path, key)) continue;
        value = path[key];
        _results.push(JsPath.setAt(this.customData, key, value));
      }
      return _results;
    }
  };

  KDFormView.prototype.removeCustomData = function(path) {
    var isArrayElement, last, pathUntil, _i;
    if ('string' === typeof path) {
      path = path.split('.');
    }
    pathUntil = 2 <= path.length ? __slice.call(path, 0, _i = path.length - 1) : (_i = 0, []), last = path[_i++];
    isArrayElement = !isNaN(+last);
    if (isArrayElement) {
      return JsPath.spliceAt(this.customData, pathUntil, last);
    } else {
      return JsPath.deleteAt(this.customData, path);
    }
  };

  KDFormView.prototype.serializeFormData = function(data) {
    var inputData, _i, _len, _ref;
    if (data == null) {
      data = {};
    }
    _ref = this.getDomElement().serializeArray();
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      inputData = _ref[_i];
      data[inputData.name] = inputData.value;
    }
    return data;
  };

  KDFormView.prototype.getData = function() {
    var formData;
    formData = $.extend({}, this.getCustomData());
    this.serializeFormData(formData);
    return formData;
  };

  KDFormView.prototype.focusFirstElement = function() {
    return KDFormView.findChildInputs(this)[0].$().trigger("focus");
  };

  KDFormView.prototype.setCallback = function(callback) {
    return this.formCallback = callback;
  };

  KDFormView.prototype.getCallback = function() {
    return this.formCallback;
  };

  KDFormView.prototype.reset = function() {
    return this.$()[0].reset();
  };

  KDFormView.prototype.submit = function(event) {
    var form, formData, inputs, toBeValidatedInputs, validInputs, validationCount;
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    form = this;
    inputs = KDFormView.findChildInputs(this);
    validationCount = 0;
    toBeValidatedInputs = [];
    validInputs = [];
    formData = this.getCustomData() || {};
    this.once("FormValidationFinished", function(isValid) {
      var _ref;
      if (isValid == null) {
        isValid = true;
      }
      form.valid = isValid;
      if (isValid) {
        if ((_ref = form.getCallback()) != null) {
          _ref.call(form, formData, event);
        }
        return form.emit("FormValidationPassed");
      } else {
        return form.emit("FormValidationFailed");
      }
    });
    inputs.forEach(function(input) {
      if (input.getOptions().validate) {
        return toBeValidatedInputs.push(input);
      } else {
        if (input.getName()) {
          return formData[input.getName()] = input.getValue();
        }
      }
    });
    toBeValidatedInputs.forEach(function(inputToBeValidated) {
      (function() {
        return inputToBeValidated.once("ValidationResult", function(result) {
          var input, valid, _i, _len;
          validationCount++;
          if (result) {
            validInputs.push(inputToBeValidated);
          }
          if (toBeValidatedInputs.length === validationCount) {
            if (validInputs.length === toBeValidatedInputs.length) {
              for (_i = 0, _len = validInputs.length; _i < _len; _i++) {
                input = validInputs[_i];
                formData[input.getName()] = input.getValue();
              }
            } else {
              valid = false;
            }
            return form.emit("FormValidationFinished", valid);
          }
        });
      })();
      return inputToBeValidated.validate(null, event);
    });
    if (toBeValidatedInputs.length === 0) {
      return form.emit("FormValidationFinished");
    }
  };

  return KDFormView;

})(KDView);

var KDFormViewWithFields,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

KDFormViewWithFields = (function(_super) {

  __extends(KDFormViewWithFields, _super);

  function KDFormViewWithFields() {
    var buttons, fields, _ref;
    KDFormViewWithFields.__super__.constructor.apply(this, arguments);
    this.setClass("with-fields");
    this.inputs = {};
    this.fields = {};
    this.buttons = {};
    _ref = this.getOptions(), fields = _ref.fields, buttons = _ref.buttons;
    this.createFields(this.sanitizeOptions(fields));
    this.createButtons(this.sanitizeOptions(buttons));
  }

  KDFormViewWithFields.prototype.sanitizeOptions = function(options) {
    var key, option, _results;
    _results = [];
    for (key in options) {
      option = options[key];
      option.title || (option.title = key);
      _results.push(option);
    }
    return _results;
  };

  KDFormViewWithFields.prototype.createFields = function(fields) {
    var fieldData, _i, _len, _results;
    _results = [];
    for (_i = 0, _len = fields.length; _i < _len; _i++) {
      fieldData = fields[_i];
      _results.push(this.addSubView(this.createField(fieldData)));
    }
    return _results;
  };

  KDFormViewWithFields.prototype.createButtons = function(buttons) {
    var _this = this;
    this.addSubView(this.buttonField = new KDView({
      cssClass: "formline button-field clearfix"
    }));
    return buttons.forEach(function(buttonOptions) {
      var button;
      _this.buttonField.addSubView(button = _this.createButton(buttonOptions));
      return _this.buttons[buttonOptions.title] = button;
    });
  };

  KDFormViewWithFields.prototype.createField = function(data, field) {
    var hint, input, inputWrapper, itemClass, key, label, next, title, _ref;
    itemClass = data.itemClass, title = data.title;
    itemClass || (itemClass = KDInputView);
    data.cssClass || (data.cssClass = "");
    field || (field = new KDView({
      cssClass: "formline " + data.name + " " + data.cssClass
    }));
    if (data.label) {
      field.addSubView(label = data.label = this.createLabel(data));
    }
    field.addSubView(inputWrapper = new KDCustomHTMLView({
      cssClass: "input-wrapper"
    }));
    inputWrapper.addSubView(input = this.createInput(itemClass, data));
    if (data.hint) {
      inputWrapper.addSubView(hint = new KDCustomHTMLView({
        partial: data.hint,
        tagName: "cite",
        cssClass: "hint"
      }));
    }
    this.fields[title] = field;
    if (data.nextElement) {
      _ref = data.nextElement;
      for (key in _ref) {
        next = _ref[key];
        next.title || (next.title = key);
        this.createField(next, inputWrapper);
      }
    }
    return field;
  };

  KDFormViewWithFields.prototype.createLabel = function(data) {
    return new KDLabelView({
      title: data.label,
      cssClass: this.utils.slugify(data.label)
    });
  };

  KDFormViewWithFields.prototype.createInput = function(itemClass, options) {
    var input;
    this.inputs[options.title] = input = new itemClass(options);
    return input;
  };

  KDFormViewWithFields.prototype.createButton = function(options) {
    var button, o;
    options.itemClass || (options.itemClass = KDButtonView);
    o = $.extend({}, options);
    delete o.itemClass;
    return button = new options.itemClass(o);
  };

  return KDFormViewWithFields;

})(KDFormView);

var KDModalController,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

KDModalController = (function(_super) {
  var listeningTo, modalViewTypes, systemModals;

  __extends(KDModalController, _super);

  function KDModalController() {
    return KDModalController.__super__.constructor.apply(this, arguments);
  }

  modalViewTypes = {
    blocking: KDBlockingModalView,
    loading: KDModalViewLoad
  };

  listeningTo = [];

  systemModals = {};

  KDModalController.createAndShowNewModal = function(options) {
    var buttons, content, cssClass, draggable, fx, height, id, modalView, overlay, position, resizable, title, type, view, width,
      _this = this;
    type = options.type, view = options.view, overlay = options.overlay, height = options.height, width = options.width, position = options.position, title = options.title, content = options.content, cssClass = options.cssClass, buttons = options.buttons, fx = options.fx, draggable = options.draggable, resizable = options.resizable;
    modalView = (typeof type === "function" ? new type(options) : void 0) || (typeof modalViewTypes[type] === "function" ? new modalViewTypes[type](options) : void 0) || new KDModalView(options);
    modalView.registerListener({
      KDEventTypes: 'KDModalViewDestroyed',
      listener: this,
      callback: function(modalView) {
        return delete systemModals[modalView.getId()];
      }
    });
    systemModals[id = modalView.getId()] = modalView;
    (view || modalView).registerListener({
      KDEventTypes: 'KDModalShouldClose',
      listener: this,
      callback: (function(modalView) {
        return function() {
          return modalView.destroy();
        };
      })(modalView)
    });
    return id;
  };

  KDModalController.getModalById = function(id) {
    return systemModals[id];
  };

  KDModalController.setListeningTo = function(obj) {
    return listeningTo.push(obj);
  };

  return KDModalController;

})(KDViewController);

var KDModalView,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

KDModalView = (function(_super) {

  __extends(KDModalView, _super);

  function KDModalView(options, data) {
    var modalButtonsInnerWidth,
      _this = this;
    if (options == null) {
      options = {};
    }
    options.overlay || (options.overlay = false);
    options.overlayClick || (options.overlayClick = true);
    options.height || (options.height = "auto");
    options.width || (options.width = 400);
    options.position || (options.position = {});
    options.title || (options.title = null);
    options.content || (options.content = null);
    options.cssClass || (options.cssClass = "");
    options.buttons || (options.buttons = null);
    options.fx || (options.fx = false);
    options.view || (options.view = null);
    options.draggable || (options.draggable = {
      handle: ".kdmodal-title"
    });
    options.resizable || (options.resizable = false);
    KDModalView.__super__.constructor.call(this, options, data);
    if (options.overlay) {
      this.putOverlay(options.overlay);
    }
    if (options.fx) {
      this.setClass("fx");
    }
    if (options.title) {
      this.setTitle(options.title);
    }
    if (options.content) {
      this.setContent(options.content);
    }
    if (options.view) {
      this.addSubView(options.view, ".kdmodal-content");
    }
    KDView.appendToDOMBody(this);
    this.setModalWidth(options.width);
    if (options.height) {
      this.setModalHeight(options.height);
    }
    if (options.buttons) {
      this.buttonHolder = new KDView({
        cssClass: "kdmodal-buttons clearfix"
      });
      this.addSubView(this.buttonHolder, ".kdmodal-inner");
      this.setButtons(options.buttons);
      modalButtonsInnerWidth = this.$(".kdmodal-inner").width();
      this.buttonHolder.setWidth(modalButtonsInnerWidth);
    }
    this.display();
    this._windowDidResize();
    $(window).on("keydown.modal", function(e) {
      if (e.which === 27) {
        return _this.destroy();
      }
    });
    this.on("childAppended", this.setPositions.bind(this));
    this.listenWindowResize();
  }

  KDModalView.prototype.setDomElement = function(cssClass) {
    return this.domElement = $("    <div class='kdmodal initial " + cssClass + "'>      <div class='kdmodal-shadow'>        <div class='kdmodal-inner'>          <span class='close-icon closeModal'></span>          <div class='kdmodal-title hidden'></div>          <div class='kdmodal-content'></div>        </div>      </div>    </div>");
  };

  KDModalView.prototype.addSubView = function(view, selector) {
    if (selector == null) {
      selector = ".kdmodal-content";
    }
    if (this.$(selector).length === 0) {
      selector = null;
    }
    return KDModalView.__super__.addSubView.call(this, view, selector);
  };

  KDModalView.prototype.setButtons = function(buttonDataSet) {
    var button, buttonOptions, buttonTitle, focused;
    this.buttons || (this.buttons = {});
    this.setClass("with-buttons");
    for (buttonTitle in buttonDataSet) {
      if (!__hasProp.call(buttonDataSet, buttonTitle)) continue;
      buttonOptions = buttonDataSet[buttonTitle];
      button = this.createButton(buttonTitle, buttonOptions);
      this.buttons[buttonTitle] = button;
      if (buttonOptions.focus) {
        focused = true;
        button.$().trigger("focus");
      }
    }
    if (!focused) {
      return this.$("button").eq(0).trigger("focus");
    }
  };

  KDModalView.prototype.click = function(e) {
    if ($(e.target).is(".closeModal")) {
      return this.destroy();
    }
  };

  KDModalView.prototype.keyUp = function(e) {
    if (e.which === 27) {
      return this.destroy();
    }
  };

  KDModalView.prototype.setTitle = function(title) {
    this.$().find(".kdmodal-title").removeClass('hidden').html("<span class='title'>" + title + "</span>");
    return this.modalTitle = title;
  };

  KDModalView.prototype.setModalHeight = function(value) {
    if (value === "auto") {
      this.$().css("height", "auto");
      return this.modalHeight = this.getHeight();
    } else {
      this.$().height(value);
      return this.modalHeight = value;
    }
  };

  KDModalView.prototype.setModalWidth = function(value) {
    this.modalWidth = value;
    return this.$().width(value);
  };

  KDModalView.prototype.setPositions = function() {
    var _this = this;
    return this.utils.wait(function() {
      var newPosition, position;
      position = _this.getOptions().position;
      newPosition = {};
      newPosition.top = (position.top != null) ? position.top : ($(window).height() / 2) - (_this.getHeight() / 2);
      newPosition.left = (position.left != null) ? position.left : ($(window).width() / 2) - (_this.modalWidth / 2);
      if (position.right) {
        newPosition.left = $(window).width() - _this.modalWidth - position.right - 20;
      }
      _this.$().css(newPosition);
      _this.$().css({
        opacity: 1
      });
      return _this.utils.wait(500, function() {
        return _this.unsetClass("initial");
      });
    });
  };

  KDModalView.prototype._windowDidResize = function() {
    var winHeight;
    this.setPositions();
    winHeight = this.getSingleton('windowController').winHeight;
    this.$('.kdmodal-content').css('max-height', winHeight - 200);
    return this.setY((winHeight - this.getHeight()) / 2);
  };

  KDModalView.prototype.putOverlay = function() {
    var _this = this;
    this.$overlay = $("<div/>", {
      "class": "kdoverlay"
    });
    this.$overlay.hide();
    this.$overlay.appendTo("body");
    this.$overlay.fadeIn(200);
    if (this.getOptions().overlayClick) {
      return this.$overlay.bind("click", function() {
        return _this.destroy();
      });
    }
  };

  KDModalView.prototype.createButton = function(title, buttonOptions) {
    var button;
    buttonOptions.title = title;
    this.buttonHolder.addSubView(button = new KDButtonView(buttonOptions));
    button.registerListener({
      KDEventTypes: 'KDModalShouldClose',
      listener: this,
      callback: function() {
        return this.propagateEvent({
          KDEventType: 'KDModalShouldClose'
        });
      }
    });
    return button;
  };

  KDModalView.prototype.setContent = function(content) {
    this.modalContent = content;
    return this.getDomElement().find(".kdmodal-content").html(content);
  };

  KDModalView.prototype.display = function() {
    var _this = this;
    if (this.getOptions().fx) {
      return this.utils.wait(function() {
        return _this.setClass("active");
      });
    }
  };

  KDModalView.prototype.destroy = function() {
    var uber;
    $(window).off("keydown.modal");
    uber = KDView.prototype.destroy.bind(this);
    if (this.options.fx) {
      this.unsetClass("active");
      setTimeout(uber, 300);
      return this.propagateEvent({
        KDEventType: 'KDModalViewDestroyed'
      });
    } else {
      this.getDomElement().hide();
      uber();
      return this.propagateEvent({
        KDEventType: 'KDModalViewDestroyed'
      });
    }
  };

  return KDModalView;

})(KDView);

var KDModalViewLoad,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

KDModalViewLoad = (function(_super) {

  __extends(KDModalViewLoad, _super);

  function KDModalViewLoad(options) {
    KDModalViewLoad.__super__.constructor.call(this, options);
    if (typeof options.onLoad === "function") {
      options.onLoad();
    }
    if (options.onBeforeDestroy != null) {
      this.onBeforeDestroy = options.onBeforeDestroy;
    }
  }

  KDModalViewLoad.prototype.destroy = function() {
    if (typeof this.onBeforeDestroy === "function") {
      this.onBeforeDestroy();
    }
    return KDModalViewLoad.__super__.destroy.apply(this, arguments);
  };

  return KDModalViewLoad;

})(KDModalView);

var KDBlockingModalView,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

KDBlockingModalView = (function(_super) {

  __extends(KDBlockingModalView, _super);

  function KDBlockingModalView() {
    KDBlockingModalView.__super__.constructor.apply(this, arguments);
    $(window).off("keydown.modal");
  }

  KDBlockingModalView.prototype.putOverlay = function() {
    this.$overlay = $("<div/>", {
      "class": "kdoverlay"
    });
    this.$overlay.hide();
    this.$overlay.appendTo("body");
    return this.$overlay.fadeIn(200);
  };

  KDBlockingModalView.prototype.setDomElement = function(cssClass) {
    return this.domElement = $("    <div class='kdmodal " + cssClass + "'>      <div class='kdmodal-shadow'>        <div class='kdmodal-inner'>          <div class='kdmodal-title'></div>          <div class='kdmodal-content'></div>        </div>      </div>    </div>");
  };

  KDBlockingModalView.prototype.click = function(e) {};

  return KDBlockingModalView;

})(KDModalView);

var KDModalViewWithForms,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

KDModalViewWithForms = (function(_super) {

  __extends(KDModalViewWithForms, _super);

  function KDModalViewWithForms(options, data) {
    this.modalButtons = [];
    KDModalViewWithForms.__super__.constructor.call(this, options, data);
    this.addSubView(this.modalTabs = new KDTabViewWithForms(options.tabs));
  }

  return KDModalViewWithForms;

})(KDModalView);

var KDNotificationView,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

KDNotificationView = (function(_super) {

  __extends(KDNotificationView, _super);

  function KDNotificationView(options) {
    KDNotificationView.__super__.constructor.call(this, options);
    options = this.notificationSetDefaults(options);
    this.notificationSetType(options.type);
    if (options.title != null) {
      this.notificationSetTitle(options.title);
    }
    if (options.content != null) {
      this.notificationSetContent(options.content);
    }
    if (options.duration != null) {
      this.notificationSetTimer(options.duration);
    }
    if ((options.overlay != null) && options.overlay) {
      this.notificationSetOverlay(options.overlay);
    }
    if ((options.showTimer != null) && options.showTimer) {
      this.notificationShowTimer();
    }
    this.notificationSetCloseHandle(options.closeManually);
    this.notificationDisplay();
  }

  KDNotificationView.prototype.setDomElement = function(cssClass) {
    if (cssClass == null) {
      cssClass = '';
    }
    return this.domElement = $("<div class='kdnotification " + cssClass + "'>        <a class='kdnotification-close hidden'></a>        <div class='kdnotification-timer hidden'></div>        <div class='kdnotification-title'></div>        <div class='kdnotification-content hidden'></div>      </div>");
  };

  KDNotificationView.prototype.destroy = function() {
    this.notificationCloseHandle.unbind(".notification");
    if (this.notificationOverlay != null) {
      this.notificationOverlay.remove();
    }
    KDNotificationView.__super__.destroy.call(this);
    this.notificationStopTimer();
    return this.notificationRepositionOtherNotifications();
  };

  KDNotificationView.prototype.viewAppended = function() {
    return this.notificationSetPositions();
  };

  KDNotificationView.prototype.notificationSetDefaults = function(options) {
    var _ref, _ref1;
    if ((_ref = options.duration) == null) {
      options.duration = 1500;
    }
    if (options.duration > 2999 || options.duration === 0) {
      if ((_ref1 = options.closeManually) == null) {
        options.closeManually = true;
      }
    }
    return options;
  };

  KDNotificationView.prototype.notificationSetTitle = function(title) {
    if (!(title instanceof KDView)) {
      this.$().find(".kdnotification-title").html(title);
    } else {
      if (this.notificationTitle && this.notificationTitle instanceof KDView) {
        this.notificationTitle.destroy();
      }
      this.addSubView(title, ".kdnotification-title");
    }
    return this.notificationTitle = title;
  };

  KDNotificationView.prototype.notificationSetType = function(type) {
    if (type == null) {
      type = "main";
    }
    return this.notificationType = type;
  };

  KDNotificationView.prototype.notificationSetPositions = function() {
    var bottomMargin, i, notification, sameTypeNotifications, styles, topMargin, winHeight, winWidth, _i, _j, _len, _len1, _ref;
    this.setClass(this.notificationType);
    sameTypeNotifications = $("body").find(".kdnotification." + this.notificationType);
    if (this.getOptions().container) {
      winHeight = this.getOptions().container.getHeight();
      winWidth = this.getOptions().container.getWidth();
    } else {
      _ref = this.getSingleton('windowController'), winWidth = _ref.winWidth, winHeight = _ref.winHeight;
    }
    switch (this.notificationType) {
      case "tray":
        bottomMargin = 8;
        for (i = _i = 0, _len = sameTypeNotifications.length; _i < _len; i = ++_i) {
          notification = sameTypeNotifications[i];
          if (i !== 0) {
            bottomMargin += $(notification).outerHeight(false) + 8;
          }
        }
        styles = {
          bottom: bottomMargin,
          right: 8
        };
        break;
      case "growl":
        topMargin = 8;
        for (i = _j = 0, _len1 = sameTypeNotifications.length; _j < _len1; i = ++_j) {
          notification = sameTypeNotifications[i];
          if (i !== 0) {
            topMargin += $(notification).outerHeight(false) + 8;
          }
        }
        styles = {
          top: topMargin,
          right: 8
        };
        break;
      case "mini":
        styles = {
          top: 0,
          left: winWidth / 2 - this.getDomElement().width() / 2
        };
        break;
      default:
        styles = {
          top: winHeight / 2 - this.getDomElement().height() / 2,
          left: winWidth / 2 - this.getDomElement().width() / 2
        };
    }
    return this.getDomElement().css(styles);
  };

  KDNotificationView.prototype.notificationRepositionOtherNotifications = function() {
    var elm, h, heights, i, j, newValue, options, position, sameTypeNotifications, _i, _j, _len, _len1, _ref, _results;
    sameTypeNotifications = $("body").find(".kdnotification." + this.notificationType);
    heights = (function() {
      var _i, _len, _results;
      _results = [];
      for (i = _i = 0, _len = sameTypeNotifications.length; _i < _len; i = ++_i) {
        elm = sameTypeNotifications[i];
        _results.push($(elm).outerHeight(false));
      }
      return _results;
    })();
    _results = [];
    for (i = _i = 0, _len = sameTypeNotifications.length; _i < _len; i = ++_i) {
      elm = sameTypeNotifications[i];
      switch (this.notificationType) {
        case "tray":
        case "growl":
          newValue = 0;
          position = this.notificationType === "tray" ? "bottom" : "top";
          _ref = heights.slice(0, i + 1 || 9e9);
          for (j = _j = 0, _len1 = _ref.length; _j < _len1; j = ++_j) {
            h = _ref[j];
            if (j !== 0) {
              newValue += h;
            } else {
              newValue = 8;
            }
          }
          options = {};
          options[position] = newValue + i * 8;
          _results.push($(elm).css(options));
          break;
        default:
          _results.push(void 0);
      }
    }
    return _results;
  };

  KDNotificationView.prototype.notificationSetCloseHandle = function(closeManually) {
    var _this = this;
    if (closeManually == null) {
      closeManually = false;
    }
    this.notificationCloseHandle = this.getDomElement().find(".kdnotification-close");
    if (closeManually) {
      this.notificationCloseHandle.removeClass("hidden");
    }
    this.notificationCloseHandle.bind("click.notification", function(e) {
      return _this.destroy();
    });
    return $(window).bind("keydown.notification", function(e) {
      if (e.which === 27) {
        return _this.destroy();
      }
    });
  };

  KDNotificationView.prototype.notificationSetTimer = function(duration) {
    var _this = this;
    if (duration === 0) {
      return;
    }
    this.notificationTimerDiv = this.getDomElement().find(".kdnotification-timer");
    this.notificationTimerDiv.text(Math.floor(duration / 1000));
    this.notificationTimeout = setTimeout(function() {
      return _this.getDomElement().fadeOut(200, function() {
        return _this.destroy();
      });
    }, duration);
    return this.notificationInterval = setInterval(function() {
      var next;
      next = parseInt(_this.notificationTimerDiv.text(), 10) - 1;
      return _this.notificationTimerDiv.text(next);
    }, 1000);
  };

  KDNotificationView.prototype.notificationShowTimer = function() {
    var _this = this;
    this.notificationTimerDiv.removeClass("hidden");
    this.getDomElement().bind("mouseenter", function() {
      return _this.notificationStopTimer();
    });
    return this.getDomElement().bind("mouseleave", function() {
      var newDuration;
      newDuration = parseInt(_this.notificationTimerDiv.text(), 10) * 1000;
      return _this.notificationSetTimer(newDuration);
    });
  };

  KDNotificationView.prototype.notificationStopTimer = function() {
    clearTimeout(this.notificationTimeout);
    return clearInterval(this.notificationInterval);
  };

  KDNotificationView.prototype.notificationSetOverlay = function() {
    var _this = this;
    this.notificationOverlay = $("<div/>", {
      "class": "kdoverlay transparent"
    });
    this.notificationOverlay.hide();
    this.notificationOverlay.appendTo("body");
    this.notificationOverlay.fadeIn(200);
    return this.notificationOverlay.bind("click", function() {
      return _this.destroy();
    });
  };

  KDNotificationView.prototype.notificationGetOverlay = function() {
    return this.notificationOverlay;
  };

  KDNotificationView.prototype.notificationSetContent = function(content) {
    this.notificationContent = content;
    return this.getDomElement().find(".kdnotification-content").removeClass("hidden").html(content);
  };

  KDNotificationView.prototype.notificationDisplay = function() {
    if (this.getOptions().container) {
      return this.getOptions().container.addSubView(this);
    } else {
      return KDView.appendToDOMBody(this);
    }
  };

  return KDNotificationView;

})(KDView);

var KDDialogView,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

KDDialogView = (function(_super) {

  __extends(KDDialogView, _super);

  function KDDialogView(options, data) {
    var defaultOptions,
      _this = this;
    defaultOptions = {
      duration: 200,
      topOffset: 0,
      overlay: true,
      buttons: {
        Cancel: {
          style: "clean-red",
          callback: function() {
            return _this.hide();
          }
        }
      }
    };
    options = $.extend(defaultOptions, options);
    KDDialogView.__super__.constructor.apply(this, arguments);
    this.setClass("kddialogview");
    this.$().hide();
    this.setButtons();
    this.setTopOffset();
  }

  KDDialogView.prototype.show = function() {
    var duration, overlay, _ref;
    _ref = this.getOptions(), duration = _ref.duration, overlay = _ref.overlay;
    if (overlay) {
      this.putOverlay();
    }
    return this.$().slideDown(duration);
  };

  KDDialogView.prototype.hide = function() {
    var duration,
      _this = this;
    duration = this.getOptions().duration;
    this.$overlay.fadeOut(duration, function() {
      return _this.$overlay.remove();
    });
    return this.$().slideUp(duration, function() {
      return _this.destroy();
    });
  };

  KDDialogView.prototype.setButtons = function() {
    var buttonOptions, buttonTitle, buttons, _results;
    buttons = this.getOptions().buttons;
    this.buttonHolder = new KDView({
      cssClass: "kddialog-buttons clearfix"
    });
    this.addSubView(this.buttonHolder);
    _results = [];
    for (buttonTitle in buttons) {
      if (!__hasProp.call(buttons, buttonTitle)) continue;
      buttonOptions = buttons[buttonTitle];
      _results.push(this.createButton(buttonTitle, buttonOptions));
    }
    return _results;
  };

  KDDialogView.prototype.createButton = function(title, buttonOptions) {
    return this.buttonHolder.addSubView(new KDButtonView({
      title: title,
      style: buttonOptions.style != null ? buttonOptions.style : void 0,
      callback: buttonOptions.callback != null ? buttonOptions.callback : void 0
    }));
  };

  KDDialogView.prototype.setTopOffset = function() {
    var topOffset;
    topOffset = this.getOptions().topOffset;
    return this.$().css("top", topOffset);
  };

  KDDialogView.prototype.putOverlay = function() {
    var topOffset,
      _this = this;
    topOffset = this.getOptions().topOffset;
    this.$overlay = $("<div/>", {
      "class": "kdoverlay",
      css: {
        height: this.$().parent().height() - topOffset,
        top: topOffset
      }
    });
    this.$overlay.hide();
    this.$overlay.appendTo(this.$().parent());
    this.$overlay.fadeIn(200);
    return this.$overlay.bind("click", function() {
      return _this.hide();
    });
  };

  return KDDialogView;

})(KDView);




var KDAutoCompleteController,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  __slice = [].slice;

KDAutoCompleteController = (function(_super) {

  __extends(KDAutoCompleteController, _super);

  function KDAutoCompleteController(options, data) {
    var mainView,
      _this = this;
    if (options == null) {
      options = {};
    }
    this.keyUpOnInputView = __bind(this.keyUpOnInputView, this);

    this.keyDownOnInputView = __bind(this.keyDownOnInputView, this);

    options = $.extend({
      view: mainView = options.view || new KDAutoComplete({
        name: options.name,
        label: options.label || new KDLabelView({
          title: options.name
        })
      }),
      itemClass: KDAutoCompleteListItemView,
      selectedItemClass: KDAutoCompletedItem,
      nothingFoundItemClass: KDAutoCompleteNothingFoundItem,
      fetchingItemClass: KDAutoCompleteFetchingItem,
      listWrapperCssClass: '',
      minSuggestionLength: 2,
      selectedItemsLimit: null,
      itemDataPath: '',
      separator: ',',
      wrapper: 'parent',
      submitValuesAsText: false,
      defaultValue: []
    }, options);
    KDAutoCompleteController.__super__.constructor.call(this, options, data);
    mainView.registerListener({
      KDEventTypes: 'focus',
      listener: this,
      callback: function(event) {
        return _this.updateDropdownContents();
      }
    });
    this.lastPrefix = null;
    this.selectedItemData = [];
    this.hiddenInputs = {};
    this.selectedItemCounter = 0;
  }

  KDAutoCompleteController.prototype.reset = function() {
    var item, subViews, _i, _len, _results;
    subViews = this.itemWrapper.getSubViews().slice();
    _results = [];
    for (_i = 0, _len = subViews.length; _i < _len; _i++) {
      item = subViews[_i];
      _results.push(this.removeFromSubmitQueue(item));
    }
    return _results;
  };

  KDAutoCompleteController.prototype.loadView = function(mainView) {
    var _this = this;
    this.createDropDown();
    this.getAutoCompletedItemParent();
    this.setDefaultValue();
    mainView.registerListener({
      KDEventTypes: 'keyup',
      callback: __utils.throttle(this.keyUpOnInputView, 300),
      listener: this
    });
    return mainView.on('keydown', function(event) {
      return _this.keyDownOnInputView(event);
    });
  };

  KDAutoCompleteController.prototype.setDefaultValue = function(defaultItems) {
    var defaultValue, item, itemDataPath, _i, _len, _ref, _results;
    _ref = this.getOptions(), defaultValue = _ref.defaultValue, itemDataPath = _ref.itemDataPath;
    defaultItems || (defaultItems = defaultValue);
    _results = [];
    for (_i = 0, _len = defaultItems.length; _i < _len; _i++) {
      item = defaultItems[_i];
      _results.push(this.addItemToSubmitQueue(this.getView(), item));
    }
    return _results;
  };

  KDAutoCompleteController.prototype.keyDownOnInputView = function(event) {
    var autoCompleteView;
    autoCompleteView = this.getView();
    switch (event.which) {
      case 13:
      case 9:
        if (autoCompleteView.getValue() !== "" && event.shiftKey !== true) {
          this.submitAutoComplete(autoCompleteView.getValue());
          event.stopPropagation();
          event.preventDefault();
          return false;
        } else {
          return true;
        }
        break;
      case 27:
        this.hideDropdown();
        break;
      case 38:
        if (this.dropdown.getView().$().is(":visible")) {
          this.dropdown.getListView().goUp();
          event.stopPropagation();
          event.preventDefault();
          return false;
        } else {

        }
        break;
      case 40:
        if (this.dropdown.getView().$().is(":visible")) {
          this.dropdown.getListView().goDown();
          event.stopPropagation();
          event.preventDefault();
          return false;
        }
    }
    return false;
  };

  KDAutoCompleteController.prototype.getPrefix = function() {
    var items, prefix, separator;
    separator = this.getOptions().separator;
    items = this.getView().getValue().split(separator);
    prefix = items[items.length - 1];
    return prefix;
  };

  KDAutoCompleteController.prototype.createDropDown = function(data) {
    var dropdownListView, dropdownWrapper, windowController,
      _this = this;
    if (data == null) {
      data = [];
    }
    this.dropdownPrefix = "";
    this.dropdownListView = dropdownListView = new KDAutoCompleteListView({
      itemClass: this.getOptions().itemClass
    }, {
      items: data
    });
    dropdownListView.registerListener({
      KDEventTypes: 'ItemsDeselected',
      listener: this,
      callback: function() {
        var view;
        view = _this.getView();
        return view.$input().trigger('focus');
      }
    });
    dropdownListView.on('ItemWasAdded', function(view, index) {
      return view.registerListener({
        KDEventTypes: 'KDAutoCompleteSubmit',
        listener: _this,
        callback: _this.submitAutoComplete
      });
    });
    windowController = this.getSingleton('windowController');
    this.dropdown = new KDListViewController({
      view: dropdownListView
    });
    dropdownWrapper = this.dropdown.getView();
    dropdownWrapper.on('ReceivedClickElsewhere', function() {
      return _this.hideDropdown();
    });
    dropdownWrapper.setClass("kdautocomplete hidden " + (this.getOptions().listWrapperCssClass));
    return KDView.appendToDOMBody(dropdownWrapper);
  };

  KDAutoCompleteController.prototype.hideDropdown = function() {
    var dropdownWrapper;
    dropdownWrapper = this.dropdown.getView();
    return dropdownWrapper.$().fadeOut(75);
  };

  KDAutoCompleteController.prototype.showDropdown = function() {
    var dropdownWrapper, input, offset, windowController;
    windowController = this.getSingleton('windowController');
    dropdownWrapper = this.dropdown.getView();
    dropdownWrapper.unsetClass("hidden");
    input = this.getView();
    offset = input.$().offset();
    offset.top += input.getHeight();
    dropdownWrapper.$().css(offset);
    dropdownWrapper.$().fadeIn(75);
    return windowController.addLayer(dropdownWrapper);
  };

  KDAutoCompleteController.prototype.refreshDropDown = function(data) {
    var allowNewSuggestions, exactMatches, exactPattern, inexactMatches, itemDataPath, listView, minSuggestionLength, _ref,
      _this = this;
    if (data == null) {
      data = [];
    }
    listView = this.dropdown.getListView();
    this.dropdown.removeAllItems();
    listView.userInput = this.dropdownPrefix;
    exactPattern = RegExp('^' + this.dropdownPrefix.replace(/[^\s\w]/, '') + '$', 'i');
    exactMatches = [];
    inexactMatches = [];
    _ref = this.getOptions(), itemDataPath = _ref.itemDataPath, allowNewSuggestions = _ref.allowNewSuggestions, minSuggestionLength = _ref.minSuggestionLength;
    data.forEach(function(datum) {
      var match;
      if (!_this.isItemAlreadySelected(datum)) {
        match = JsPath.getAt(datum, itemDataPath);
        if (exactPattern.test(match)) {
          return exactMatches.push(datum);
        } else {
          return inexactMatches.push(datum);
        }
      }
    });
    if ((this.dropdownPrefix.length >= minSuggestionLength) && allowNewSuggestions && !exactMatches.length) {
      this.dropdown.getListView().addItemView(this.getNoItemFoundView());
    }
    data = exactMatches.concat(inexactMatches);
    this.dropdown.instantiateListItems(data);
    return this.dropdown.getListView().goDown();
  };

  KDAutoCompleteController.prototype.submitAutoComplete = function(publishingInstance, data) {
    var activeItem, inputView;
    inputView = this.getView();
    if (this.getOptions().selectedItemsLimit === null || this.getOptions().selectedItemsLimit > this.selectedItemCounter) {
      activeItem = this.dropdown.getListView().getActiveItem();
      if (activeItem.item) {
        this.appendAutoCompletedItem();
      }
      this.addItemToSubmitQueue(activeItem.item);
      this.rearrangeInputWidth();
      this.emit('ItemListChanged');
    } else {
      inputView.setValue('');
      this.getSingleton("windowController").setKeyView(null);
      new KDNotificationView({
        type: "mini",
        title: "You can add up to " + (this.getOptions().selectedItemsLimit) + " items!",
        duration: 4000
      });
    }
    return this.hideDropdown();
  };

  KDAutoCompleteController.prototype.getAutoCompletedItemParent = function() {
    var outputWrapper;
    outputWrapper = this.getOptions().outputWrapper;
    if (outputWrapper instanceof KDView) {
      return this.itemWrapper = outputWrapper;
    } else {
      return this.itemWrapper = this.getView();
    }
  };

  KDAutoCompleteController.prototype.isItemAlreadySelected = function(data) {
    var alreadySelected, customCompare, isCaseSensitive, itemDataPath, selected, selectedData, suggested, _i, _len, _ref, _ref1;
    _ref = this.getOptions(), itemDataPath = _ref.itemDataPath, customCompare = _ref.customCompare, isCaseSensitive = _ref.isCaseSensitive;
    suggested = JsPath.getAt(data, itemDataPath);
    _ref1 = this.getSelectedItemData();
    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
      selectedData = _ref1[_i];
      if (typeof compare !== "undefined" && compare !== null) {
        alreadySelected = customCompare(data, selectedData);
        if (alreadySelected) {
          return true;
        }
      } else {
        selected = JsPath.getAt(selectedData, itemDataPath);
        if (!isCaseSensitive) {
          suggested = suggested.toLowerCase();
          selected = selected.toLowerCase();
        }
        if (suggested === selected) {
          return true;
        }
      }
    }
    return false;
  };

  KDAutoCompleteController.prototype.addHiddenInputItem = function(name, value) {
    return this.itemWrapper.addSubView(this.hiddenInputs[name] = new KDInputView({
      type: "hidden",
      name: name,
      defaultValue: value
    }));
  };

  KDAutoCompleteController.prototype.removeHiddenInputItem = function(name) {
    return this.hiddenInputs[name].remove();
  };

  KDAutoCompleteController.prototype.addSelectedItem = function(name, data) {
    var itemView, selectedItemClass;
    selectedItemClass = this.getOptions().selectedItemClass;
    this.itemWrapper.addSubView(itemView = new selectedItemClass({
      cssClass: "kdautocompletedlistitem",
      delegate: this,
      name: name
    }, data));
    return itemView.setPartial("<span class='close-icon'></span>");
  };

  KDAutoCompleteController.prototype.getSelectedItemData = function() {
    return this.selectedItemData;
  };

  KDAutoCompleteController.prototype.addSelectedItemData = function(data) {
    return this.getSelectedItemData().push(data);
  };

  KDAutoCompleteController.prototype.removeSelectedItemData = function(data) {
    var i, selectedData, selectedItemData, _i, _len;
    selectedItemData = this.getSelectedItemData();
    for (i = _i = 0, _len = selectedItemData.length; _i < _len; i = ++_i) {
      selectedData = selectedItemData[i];
      if (selectedData === data) {
        selectedItemData.splice(i, 1);
        return;
      }
    }
  };

  KDAutoCompleteController.prototype.getCollectionPath = function() {
    var collectionName, leaf, name, path, _i, _ref;
    name = this.getOptions().name;
    if (!name) {
      throw new Error('No name!');
    }
    _ref = name.split('.'), path = 2 <= _ref.length ? __slice.call(_ref, 0, _i = _ref.length - 1) : (_i = 0, []), leaf = _ref[_i++];
    collectionName = Inflector.pluralize(leaf);
    path.push(collectionName);
    return path.join('.');
  };

  KDAutoCompleteController.prototype.addSuggestion = function(title) {
    return this.emit('AutocompleteSuggestionWasAdded', title);
  };

  KDAutoCompleteController.prototype.addItemToSubmitQueue = function(item, data) {
    var collection, form, id, itemDataPath, itemName, itemValue, path, submitValuesAsText, _ref;
    data || (data = item.getData());
    _ref = this.getOptions(), itemDataPath = _ref.itemDataPath, form = _ref.form, submitValuesAsText = _ref.submitValuesAsText;
    if (data) {
      itemValue = submitValuesAsText ? JsPath.getAt(data, itemDataPath) : data;
    } else {
      itemValue = item.getOptions().userInput;
      data = JsPath(itemDataPath, itemValue);
    }
    if (this.isItemAlreadySelected(data)) {
      return false;
    }
    path = this.getCollectionPath();
    itemName = "" + name + "-" + (this.selectedItemCounter++);
    if (form) {
      collection = form.getCustomData(path);
      if (collection == null) {
        collection = [];
      }
      form.addCustomData(path, collection);
      id = typeof itemValue.getId === "function" ? itemValue.getId() : void 0;
      collection.push(submitValuesAsText ? itemValue : id != null ? {
        constructorName: itemValue.constructor.name,
        id: id,
        title: itemValue.title
      } : {
        $suggest: itemValue
      });
      if (item.getOptions().userInput === !"") {
        this.selectedItemCounter++;
      }
    } else {
      this.addHiddenInputItem(path.join('.'), itemValue);
    }
    this.addSelectedItemData(data);
    this.addSelectedItem(itemName, data);
    return this.getView().setValue(this.dropdownPrefix = "");
  };

  KDAutoCompleteController.prototype.removeFromSubmitQueue = function(item, data) {
    var collection, form, itemDataPath, path, _ref;
    _ref = this.getOptions(), itemDataPath = _ref.itemDataPath, form = _ref.form;
    data || (data = item.getData());
    path = this.getCollectionPath();
    if (form) {
      collection = JsPath.getAt(form.getCustomData(), path);
      collection = collection.filter(function(sibling) {
        var id;
        id = typeof data.getId === "function" ? data.getId() : void 0;
        if (id == null) {
          return sibling.$suggest !== data.title;
        } else {
          return sibling.id !== id;
        }
      });
      JsPath.setAt(form.getCustomData(), path, collection);
    } else {
      this.removeHiddenInputItem(path.join('.'));
    }
    this.removeSelectedItemData(data);
    this.selectedItemCounter--;
    item.destroy();
    return this.emit('ItemListChanged');
  };

  KDAutoCompleteController.prototype.rearrangeInputWidth = function() {};

  KDAutoCompleteController.prototype.appendAutoCompletedItem = function() {
    this.getView().setValue("");
    return this.getView().$input().trigger("focus");
  };

  KDAutoCompleteController.prototype.updateDropdownContents = function() {
    var inputView,
      _this = this;
    inputView = this.getView();
    if (inputView.getValue() === "") {
      this.hideDropdown();
    }
    if (inputView.getValue() !== "" && this.dropdownPrefix !== inputView.getValue() && this.dropdown.getView().$().not(":visible")) {
      this.dropdownPrefix = inputView.getValue();
      return this.fetch(function(data) {
        _this.refreshDropDown(data);
        return _this.showDropdown();
      });
    }
  };

  KDAutoCompleteController.prototype.keyUpOnInputView = function(inputView, event) {
    var _ref;
    if ((_ref = event.keyCode) === 9 || _ref === 38 || _ref === 40) {
      return;
    }
    this.updateDropdownContents();
    return false;
  };

  KDAutoCompleteController.prototype.fetch = function(callback) {
    var args, source;
    args = {};
    if (this.getOptions().fetchInputName) {
      args[this.getOptions().fetchInputName] = this.getView().getValue();
    } else {
      args = {
        inputValue: this.getView().getValue()
      };
    }
    this.dropdownPrefix = this.getView().getValue();
    source = this.getOptions().dataSource;
    return source(args, callback);
  };

  KDAutoCompleteController.prototype.showFetching = function() {
    var fetchingItemClass, view, _ref;
    fetchingItemClass = this.getOptions().fetchingItemClass;
    if (!(((_ref = this.dropdown.getListView().items) != null ? _ref[0] : void 0) instanceof KDAutoCompleteFetchingItem)) {
      view = new fetchingItemClass;
      if (this.dropdown.getListView().items.length) {
        return this.dropdown.getListView().addItemView(view, 0);
      } else {
        return this.dropdown.getListView().addItemView(view);
      }
    }
  };

  KDAutoCompleteController.prototype.getNoItemFoundView = function(suggestion) {
    var nothingFoundItemClass, view;
    nothingFoundItemClass = this.getOptions().nothingFoundItemClass;
    return view = new nothingFoundItemClass({
      delegate: this.dropdown.getListView(),
      userInput: suggestion || this.getView().getValue()
    });
  };

  KDAutoCompleteController.prototype.showNoDataFound = function() {
    var noItemFoundView;
    noItemFoundView = this.getNoItemFoundView();
    this.dropdown.removeAllItems();
    this.dropdown.getListView().addItemView(noItemFoundView);
    return this.showDropdown();
  };

  KDAutoCompleteController.prototype.destroy = function() {
    this.dropdown.getView().destroy();
    return KDAutoCompleteController.__super__.destroy.apply(this, arguments);
  };

  return KDAutoCompleteController;

})(KDViewController);

var KDAutoComplete,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

KDAutoComplete = (function(_super) {

  __extends(KDAutoComplete, _super);

  function KDAutoComplete() {
    return KDAutoComplete.__super__.constructor.apply(this, arguments);
  }

  KDAutoComplete.prototype.mouseDown = function() {
    return this.focus();
  };

  KDAutoComplete.prototype.setDomElement = function() {
    return this.domElement = $("<div class='kdautocompletewrapper clearfix'><input type='text' class='kdinput text'/></div>");
  };

  KDAutoComplete.prototype.setDomId = function() {
    this.$input().attr("id", this.getDomId());
    this.$input().attr("name", this.getName());
    return this.$input().data("data-id", this.getId());
  };

  KDAutoComplete.prototype.setDefaultValue = function(value) {
    this.inputDefaultValue = value;
    return this.setValue(value);
  };

  KDAutoComplete.prototype.$input = function() {
    return this.$().find("input").eq(0);
  };

  KDAutoComplete.prototype.getValue = function() {
    return this.$input().val();
  };

  KDAutoComplete.prototype.setValue = function(value) {
    return this.$input().val(value);
  };

  KDAutoComplete.prototype.bindEvents = function() {
    return KDAutoComplete.__super__.bindEvents.call(this, this.$input());
  };

  KDAutoComplete.prototype.blur = function(pubInst, event) {
    this.unsetClass("focus");
    return true;
  };

  KDAutoComplete.prototype.focus = function(pubInst, event) {
    this.setClass("focus");
    (this.getSingleton("windowController")).setKeyView(this);
    return true;
  };

  KDAutoComplete.prototype.keyDown = function(event) {
    (this.getSingleton("windowController")).setKeyView(this);
    return true;
  };

  KDAutoComplete.prototype.getLeftOffset = function() {
    return this.$input().prev().width();
  };

  KDAutoComplete.prototype.destroyDropdown = function() {
    if (this.dropdown != null) {
      this.removeSubView(this.dropdown);
    }
    this.dropdownPrefix = "";
    return this.dropdown = null;
  };

  return KDAutoComplete;

})(KDInputView);

var KDAutoCompleteListView,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

KDAutoCompleteListView = (function(_super) {

  __extends(KDAutoCompleteListView, _super);

  function KDAutoCompleteListView(options, data) {
    KDAutoCompleteListView.__super__.constructor.call(this, options, data);
    this.setClass("kdautocompletelist");
  }

  KDAutoCompleteListView.prototype.goDown = function() {
    var activeItem, nextItem, _ref;
    activeItem = this.getActiveItem();
    if (activeItem.index != null) {
      nextItem = this.items[activeItem.index + 1];
      if (nextItem != null) {
        return nextItem.makeItemActive();
      }
    } else {
      return (_ref = this.items[0]) != null ? _ref.makeItemActive() : void 0;
    }
  };

  KDAutoCompleteListView.prototype.goUp = function() {
    var activeItem;
    activeItem = this.getActiveItem();
    if (activeItem.index != null) {
      if (this.items[activeItem.index - 1] != null) {
        return this.items[activeItem.index - 1].makeItemActive();
      } else {
        return this.propagateEvent({
          KDEventType: 'ItemsDeselected'
        });
      }
    } else {
      return this.items[0].makeItemActive();
    }
  };

  KDAutoCompleteListView.prototype.getActiveItem = function() {
    var active, i, item, _i, _len, _ref;
    active = {
      index: null,
      item: null
    };
    _ref = this.items;
    for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
      item = _ref[i];
      if (item.active) {
        active.item = item;
        active.index = i;
        break;
      }
    }
    return active;
  };

  return KDAutoCompleteListView;

})(KDListView);

var KDAutoCompleteListItemView,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

KDAutoCompleteListItemView = (function(_super) {

  __extends(KDAutoCompleteListItemView, _super);

  function KDAutoCompleteListItemView(options, data) {
    KDAutoCompleteListItemView.__super__.constructor.call(this, options, data);
    this.setClass("kdautocompletelistitem");
    this.active = false;
  }

  KDAutoCompleteListItemView.prototype.viewAppended = function() {
    return this.$().append(this.partial(this.data));
  };

  KDAutoCompleteListItemView.prototype.bindEvents = function() {
    var _this = this;
    this.getDomElement().bind("mouseenter mouseleave", function(event) {
      return _this.handleEvent(event);
    });
    return KDAutoCompleteListItemView.__super__.bindEvents.apply(this, arguments);
  };

  KDAutoCompleteListItemView.prototype.mouseEnter = function() {
    return this.makeItemActive();
  };

  KDAutoCompleteListItemView.prototype.destroy = function() {
    return KDAutoCompleteListItemView.__super__.destroy.call(this, false);
  };

  KDAutoCompleteListItemView.prototype.mouseLeave = function() {
    return this.makeItemInactive();
  };

  KDAutoCompleteListItemView.prototype.makeItemActive = function() {
    var item, _i, _len, _ref;
    _ref = this.getDelegate().items;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      item = _ref[_i];
      item.makeItemInactive();
    }
    this.active = true;
    return this.setClass("active");
  };

  KDAutoCompleteListItemView.prototype.makeItemInactive = function() {
    this.active = false;
    return this.unsetClass("active");
  };

  KDAutoCompleteListItemView.prototype.click = function() {
    this.propagateEvent({
      KDEventType: 'KDAutoCompleteSubmit',
      globalEvent: true
    }, this.data);
    return false;
  };

  KDAutoCompleteListItemView.prototype.partial = function() {
    return "<div class='autocomplete-item clearfix'>Default item</div>";
  };

  return KDAutoCompleteListItemView;

})(KDListItemView);

var KDMultipleInputView, KDSimpleAutocomplete,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

KDSimpleAutocomplete = (function(_super) {

  __extends(KDSimpleAutocomplete, _super);

  function KDSimpleAutocomplete() {
    return KDSimpleAutocomplete.__super__.constructor.apply(this, arguments);
  }

  KDSimpleAutocomplete.prototype.addItemToSubmitQueue = function(item) {
    var itemValue;
    itemValue = JsPath.getAt(item.getData(), this.getOptions().itemDataPath);
    return this.setValue(itemValue);
  };

  KDSimpleAutocomplete.prototype.keyUp = function(event) {
    if (event.keyCode === 13) {
      return;
    }
    return KDSimpleAutocomplete.__super__.keyUp.apply(this, arguments);
  };

  KDSimpleAutocomplete.prototype.showNoDataFound = function() {
    this.dropdown.removeAllItems();
    return this.hideDropdown();
  };

  return KDSimpleAutocomplete;

})(KDAutoComplete);

KDMultipleInputView = (function(_super) {

  __extends(KDMultipleInputView, _super);

  function KDMultipleInputView(options) {
    this._values = [];
    options = $.extend({
      icon: 'noicon',
      title: ''
    }, options);
    KDMultipleInputView.__super__.constructor.call(this, options);
  }

  KDMultipleInputView.prototype.focus = function(pubInst, event) {
    return (this.getSingleton("windowController")).setKeyView(this);
  };

  KDMultipleInputView.prototype.viewAppended = function() {
    this.list = new MultipleInputListView({
      delegate: this
    });
    return this.addSubView(this.list);
  };

  KDMultipleInputView.prototype.$input = function() {
    return this.$().find("input.main").eq(0);
  };

  KDMultipleInputView.prototype.getValues = function() {
    return this._values;
  };

  KDMultipleInputView.prototype.rearrangeInputWidth = function() {
    return false;
  };

  KDMultipleInputView.prototype.addItemToSubmitQueue = function() {
    KDMultipleInputView.__super__.addItemToSubmitQueue.apply(this, arguments);
    return this.inputAddCurrentValue();
  };

  KDMultipleInputView.prototype.keyUp = function(event) {
    if (event.keyCode === 13) {
      this.inputAddCurrentValue();
    }
    return KDMultipleInputView.__super__.keyUp.apply(this, arguments);
  };

  KDMultipleInputView.prototype.inputRemoveValue = function(value) {
    var index;
    index = this._values.indexOf(value);
    if (index > -1) {
      this._values.splice(index, 1);
    }
    return this._inputChanged();
  };

  KDMultipleInputView.prototype.clear = function() {
    this._values = [];
    this.removeAllItems();
    return this._inputChanged();
  };

  KDMultipleInputView.prototype.inputAddCurrentValue = function() {
    var value;
    value = this.$input().val();
    value = $.trim(value);
    if (__indexOf.call(this._values, value) >= 0 || value === '') {
      return;
    }
    this._values.push(value);
    this.$input().val('');
    this.list.addItems([value]);
    return this._inputChanged();
  };

  KDMultipleInputView.prototype._inputChanged = function() {
    var index, input, inputName, newInput, value, _i, _j, _len, _len1, _ref, _ref1;
    if (!this._hiddenInputs) {
      this._hiddenInputs = [];
    }
    _ref = this._hiddenInputs;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      input = _ref[_i];
      input.destroy();
    }
    inputName = this.getOptions().name;
    _ref1 = this._values;
    for (index = _j = 0, _len1 = _ref1.length; _j < _len1; index = ++_j) {
      value = _ref1[index];
      newInput = new KDInputView({
        type: 'hidden',
        name: inputName + ("[" + index + "]"),
        defaultValue: value
      });
      this._hiddenInputs.push(newInput);
      this.addSubView(newInput);
    }
    return this.handleEvent({
      type: 'MultipleInputChanged',
      values: this.getValue()
    });
  };

  KDMultipleInputView.prototype.click = function(event) {
    if ($(event.target).hasClass('addNewItem')) {
      return this.inputAddCurrentValue();
    }
  };

  KDMultipleInputView.prototype.setDomId = function() {
    this.$input().attr("id", this.getDomId());
    return this.$input().data("data-id", this.getId());
  };

  KDMultipleInputView.prototype.setDomElement = function() {
    return this.domElement = $("<div class='filter kdview'>      <h2>" + (this.getOptions().title) + "</h2>      <div class='clearfix'>        <span class='" + (this.getOptions().icon) + "'></span>        <input type='text' class='main'>        <a href='#' class='addNewItem'>+</a>      </div>    </div>");
  };

  return KDMultipleInputView;

})(KDSimpleAutocomplete);

var MultipleInputListView, MultipleListItemView, NoAutocompleteMultipleListView,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

NoAutocompleteMultipleListView = (function(_super) {

  __extends(NoAutocompleteMultipleListView, _super);

  function NoAutocompleteMultipleListView(options, data) {
    var defaults;
    if (options == null) {
      options = {};
    }
    defaults = {
      cssClass: 'common-view input-with-extras'
    };
    options = $.extend(defaults, options);
    NoAutocompleteMultipleListView.__super__.constructor.call(this, options, data);
  }

  NoAutocompleteMultipleListView.prototype.viewAppended = function() {
    var button, defaults, icon, input, options, _ref,
      _this = this;
    _ref = this.options, icon = _ref.icon, input = _ref.input, button = _ref.button;
    if (icon) {
      this.setClass("with-icon");
      options = {
        tagName: "span",
        cssClass: "icon " + icon
      };
      this.addSubView(this.icon = new KDCustomHTMLView(options));
    }
    if (input) {
      this.addSubView(this.input = new NoAutocompleteInputView(input));
    }
    if (button) {
      defaults = {
        callback: function(event) {
          event.preventDefault();
          event.stopPropagation();
          return _this.input.inputAddCurrentValue();
        }
      };
      button = $.extend(defaults, button);
      return this.addSubView(this.button = new KDButtonView(button));
    }
  };

  return NoAutocompleteMultipleListView;

})(KDView);

MultipleInputListView = (function(_super) {

  __extends(MultipleInputListView, _super);

  function MultipleInputListView() {
    return MultipleInputListView.__super__.constructor.apply(this, arguments);
  }

  MultipleInputListView.prototype.setDomElement = function() {
    return this.domElement = $("<p class='search-tags clearfix'></p>");
  };

  MultipleInputListView.prototype.addItems = function(items) {
    var item, newItem, _i, _len, _results;
    _results = [];
    for (_i = 0, _len = items.length; _i < _len; _i++) {
      item = items[_i];
      newItem = new MultipleListItemView({
        delegate: this
      }, item);
      _results.push(this.addItemView(newItem));
    }
    return _results;
  };

  MultipleInputListView.prototype.removeListItem = function(instance) {
    MultipleInputListView.__super__.removeListItem.call(this, instance);
    return this.getDelegate().inputRemoveValue(instance.getData());
  };

  return MultipleInputListView;

})(KDListView);

MultipleListItemView = (function(_super) {

  __extends(MultipleListItemView, _super);

  function MultipleListItemView() {
    return MultipleListItemView.__super__.constructor.apply(this, arguments);
  }

  MultipleListItemView.prototype.click = function(event) {
    if ($(event.target).hasClass('removeIcon')) {
      return this.getDelegate().removeListItem(this);
    }
  };

  MultipleListItemView.prototype.setDomElement = function() {
    return this.domElement = $('<span />');
  };

  MultipleListItemView.prototype.partial = function() {
    return "" + (this.getData()) + " <cite class='removeIcon'>x</cite>";
  };

  return MultipleListItemView;

})(KDListItemView);

var KDAutoCompleteFetchingItem, KDAutoCompleteNothingFoundItem, KDAutoCompletedItem, KDAutocompleteUnselecteableItem, NoAutocompleteInputView,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

KDAutoCompletedItem = (function(_super) {

  __extends(KDAutoCompletedItem, _super);

  function KDAutoCompletedItem(options, data) {
    if (options == null) {
      options = {};
    }
    options.cssClass = this.utils.curryCssClass("kdautocompletedlistitem", options.cssClass);
    KDAutoCompletedItem.__super__.constructor.apply(this, arguments);
  }

  KDAutoCompletedItem.prototype.click = function(event) {
    if ($(event.target).is('span.close-icon')) {
      this.getDelegate().removeFromSubmitQueue(this);
    }
    return this.getDelegate().getView().$input().trigger("focus");
  };

  KDAutoCompletedItem.prototype.viewAppended = function() {
    return this.setPartial(this.partial());
  };

  KDAutoCompletedItem.prototype.partial = function(data) {
    return this.getDelegate().getOptions().itemClass.prototype.partial(this.getData());
  };

  return KDAutoCompletedItem;

})(KDView);

KDAutocompleteUnselecteableItem = (function(_super) {

  __extends(KDAutocompleteUnselecteableItem, _super);

  function KDAutocompleteUnselecteableItem() {
    return KDAutocompleteUnselecteableItem.__super__.constructor.apply(this, arguments);
  }

  KDAutocompleteUnselecteableItem.prototype.click = function() {
    return false;
  };

  KDAutocompleteUnselecteableItem.prototype.keyUp = function() {
    return false;
  };

  KDAutocompleteUnselecteableItem.prototype.keyDown = function() {
    return false;
  };

  KDAutocompleteUnselecteableItem.prototype.makeItemActive = function() {};

  KDAutocompleteUnselecteableItem.prototype.destroy = function() {
    return KDAutocompleteUnselecteableItem.__super__.destroy.call(this, false);
  };

  return KDAutocompleteUnselecteableItem;

})(KDListItemView);

KDAutoCompleteNothingFoundItem = (function(_super) {

  __extends(KDAutoCompleteNothingFoundItem, _super);

  function KDAutoCompleteNothingFoundItem(options, data) {
    if (options == null) {
      options = {};
    }
    options.cssClass = this.utils.curryCssClass("kdautocompletelistitem no-result", options.cssClass);
    KDAutoCompleteNothingFoundItem.__super__.constructor.apply(this, arguments);
  }

  KDAutoCompleteNothingFoundItem.prototype.partial = function(data) {
    return "Nothing found";
  };

  return KDAutoCompleteNothingFoundItem;

})(KDAutocompleteUnselecteableItem);

KDAutoCompleteFetchingItem = (function(_super) {

  __extends(KDAutoCompleteFetchingItem, _super);

  function KDAutoCompleteFetchingItem(options, data) {
    if (options == null) {
      options = {};
    }
    options.cssClass = this.utils.curryCssClass("kdautocompletelistitem fetching", options.cssClass);
    KDAutoCompleteFetchingItem.__super__.constructor.apply(this, arguments);
  }

  KDAutoCompleteFetchingItem.prototype.partial = function() {
    return "Fetching in process...";
  };

  return KDAutoCompleteFetchingItem;

})(KDAutocompleteUnselecteableItem);

NoAutocompleteInputView = (function(_super) {

  __extends(NoAutocompleteInputView, _super);

  function NoAutocompleteInputView() {
    return NoAutocompleteInputView.__super__.constructor.apply(this, arguments);
  }

  NoAutocompleteInputView.prototype.keyUp = function(event) {
    if (event.keyCode === 13) {
      return this.inputAddCurrentValue();
    }
  };

  NoAutocompleteInputView.prototype.setDomElement = function(cssClass) {
    var placeholder;
    placeholder = this.getOptions().placeholder;
    return this.domElement = $("<div class='" + cssClass + "'><input type='text' class='main' placeholder='" + (placeholder || '') + "' /></div>");
  };

  NoAutocompleteInputView.prototype.addItemToSubmitQueue = function(item) {
    return false;
  };

  return NoAutocompleteInputView;

})(KDMultipleInputView);
