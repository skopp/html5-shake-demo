// Generated by CoffeeScript 1.3.3
var ShakePlatform,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

ShakePlatform = (function(_super) {

  __extends(ShakePlatform, _super);

  function ShakePlatform() {
    var _this = this;
    ShakePlatform.__super__.constructor.apply(this, arguments);
    this.bars = [];
    this.setKeyView();
    this.createPlaceholders();
    this.on("ThereIsAWinner", function(winner) {
      return alert("And the winner is:" + winner.name);
    });
  }

  ShakePlatform.prototype.click = function() {
    return this.setKeyView();
  };

  ShakePlatform.prototype.keyDown = function(event) {
    switch (event.which) {
      case 37:
      case 39:
        return this.addBar();
    }
  };

  ShakePlatform.prototype.createPlaceholders = function() {
    var i, _i, _results;
    _results = [];
    for (i = _i = 0; _i <= 9; i = ++_i) {
      _results.push(this.addBar());
    }
    return _results;
  };

  ShakePlatform.prototype.addBar = function(data) {
    var bar, newBar, _i, _len, _ref;
    if (data) {
      _ref = this.bars;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        bar = _ref[_i];
        if (!bar.getData()) {
          bar.setData(data);
          bar.setName(data.name);
          return;
        }
      }
    }
    this.addSubView(newBar = new ShakeBar({}, data));
    this.bars.push(newBar);
    return this.repositionBars();
  };

  ShakePlatform.prototype.removeBar = function(data) {};

  ShakePlatform.prototype.repositionBars = function() {
    var amount, areaWidth, bar, barWidth, i, _i, _len, _ref, _results;
    amount = this.bars.length;
    if (amount > 10) {
      areaWidth = this.getWidth();
      barWidth = areaWidth / amount;
      _ref = this.bars;
      _results = [];
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        bar = _ref[i];
        _results.push(bar.$().css({
          width: "" + (89 / amount) + "%",
          marginRight: "" + (10 / (amount - 1)) + "%"
        }));
      }
      return _results;
    }
  };

  return ShakePlatform;

})(KDView);
