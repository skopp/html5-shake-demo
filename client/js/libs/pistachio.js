(function() {
  var Pistachio;

  Pistachio = (function() {
    var coffee, pistachios,
      _this = this;

    Pistachio.MODE = 'development';

    Pistachio.createId = (function() {
      var counter;
      counter = 0;
      return function(prefix) {
        return "" + prefix + "el-" + (counter++);
      };
    })();

    Pistachio.getAt = function(ref, path) {
      var prop;
      if ('function' === typeof path.split) {
        path = path.split('.');
      } else {
        path = path.slice();
      }
      while ((ref != null) && (prop = path.shift())) {
        ref = ref[prop];
      }
      return ref;
    };

    coffee = typeof window !== "undefined" && window !== null ? window.CoffeeScript : void 0;

    if (coffee == null) {
      if (typeof define !== "undefined" && define !== null ? define.amd : void 0) {
        require(['coffee-script'], function(CoffeeScript) {
          coffee = CoffeeScript;
          return Pistachio.coffeeIsReady = true;
        });
      } else if (require) {
        coffee = require('coffee-script');
      }
    }

    /*
      example pistachios:
      
      header:
      {h3{#(title)}}
      
      date:
      {time.timeago{#(meta.createdAt)}}
      
      id:
      {h1#siteTitle{#(title)}}
      
      subview / partial:
      {{> @subView }}
      
      wrapped subview / partial:
      {div.fixed.widget{> @clock }}
      
      attribute:
      {a[href="#profile"]{ '@'+#(profile.nickname) }}
      
      kitchen sink:
      {div#id.class1.class2[title="Example Attribute"]{> @subView }}
      
      it's important to note that there is a priority.  That is to make the symbol easier for the CPU to parse.
      
      1 tagName
      2 id, #-prefixed
      3 classNames, .-prefixed
      4 custom attributes, bracketed squarely, each ([key=val]) # weird stuff is OK for "val"
      
      #sth is short for [id=sth]
      .sth is short for [class=sth]
      .sth.els is short for [class="sth els"]
      
      we optimize both.
    */

    pistachios = /\{(\w*)?(\#\w*)?((?:\.\w*)*)(\[(?:\b\w*\b)(?:\=[\"|\']?.*[\"|\']?)\])*\{([^{}]*)\}\s*\}/g;

    function Pistachio(view, template, options) {
      this.view = view;
      this.template = template;
      this.options = options != null ? options : {};
      this.prefix = this.options.prefix;
      this.symbols = {};
      this.dataPaths = {};
      this.subViewNames = {};
      this.prefix || (this.prefix = '');
      this.html = this.init();
    }

    Pistachio.prototype.createId = Pistachio.createId;

    Pistachio.prototype.toString = function() {
      return this.template;
    };

    Pistachio.prototype.init = (function() {
      var dataGetter, getEmbedderFn;
      dataGetter = function(prop) {
        var data;
        data = typeof this.getData === "function" ? this.getData() : void 0;
        if (data) {
          return (typeof data.getAt === "function" ? data.getAt(prop) : void 0) || Pistachio.getAt(data, prop);
        }
      };
      getEmbedderFn = function(pistachio, view, id, symbol) {
        return function(childView) {
          view.embedChild(id, childView, symbol.isCustom);
          if (!symbol.isCustom) {
            symbol.id = childView.id;
            symbol.tagName = typeof childView.getTagName === "function" ? childView.getTagName() : void 0;
            delete pistachio.symbols[id];
            return pistachio.symbols[childView.id] = symbol;
          }
        };
      };
      return function() {
        var createId, prefix, view,
          _this = this;
        prefix = this.prefix, view = this.view, createId = this.createId;
        return this.template.replace(pistachios, function(_, tagName, id, classes, attrs, expression) {
          var classAttr, classNames, code, dataPaths, dataPathsAttr, embedChild, isCustom, js, render, subViewNames, subViewNamesAttr, symbol;
          id = id != null ? id.split('#')[1] : void 0;
          classNames = (classes != null ? classes.split('.').slice(1) : void 0) || [];
          attrs = (attrs != null ? attrs.replace(/\]\[/g, ' ').replace(/\[|\]/g, '') : void 0) || '';
          isCustom = tagName || id || classes.length || attrs.length;
          tagName || (tagName = 'span');
          dataPaths = [];
          subViewNames = [];
          expression = expression.replace(/#\(([^)]*)\)/g, function(_, dataPath) {
            dataPaths.push(dataPath);
            return "data('" + dataPath + "')";
          }).replace(/^(?:>\s?|embedChild\s)(\@.+)/, function(_, subViewName) {
            subViewNames.push(subViewName.replace(/\@\.?|this\./, ''));
            return "embedChild(" + subViewName + ")";
          });
          _this.registerDataPaths(dataPaths);
          _this.registerSubViewNames(subViewNames);
          js = 'return ' + (function() {
            if (Pistachio.MODE === 'development') {
              if (Pistachio.coffeeIsReady) {
                return coffee.compile(expression, {
                  bare: true
                }).replace(/\n/g, '');
              } else {
                throw new Error('Developer mode needs coffee; coffee-script not found.');
              }
            } else {
              return expression;
            }
          })();
          try {
            code = Function('data', 'embedChild', js);
          } catch (e) {
            throw new Error("Pistachio encountered an error: " + e + "\nSource: " + js);
          }
          id || (id = createId(prefix));
          render = function() {
            return code.call(view, dataGetter.bind(view), embedChild);
          };
          symbol = _this.symbols[id] = {
            tagName: tagName,
            id: id,
            isCustom: isCustom,
            js: js,
            code: code,
            render: render
          };
          embedChild = getEmbedderFn(_this, view, id, symbol);
          dataPathsAttr = dataPaths.length ? (classNames.push("" + prefix + "data"), " data-" + prefix + "paths='" + (dataPaths.join(' ')) + "'") : "";
          subViewNamesAttr = subViewNames.length ? (classNames.push("" + prefix + "subview"), " data-" + prefix + "subviews='" + (subViewNames.join(' ')) + "'") : "";
          classAttr = classNames.length ? " class='" + (classNames.join(' ')) + "'" : "";
          return "<" + tagName + classAttr + dataPathsAttr + subViewNamesAttr + " " + attrs + " id='" + id + "'></" + tagName + ">";
        });
      };
    })();

    Pistachio.prototype.addSymbol = function(childView) {
      return this.symbols[childView.id] = {
        id: childView.id,
        tagName: typeof childView.getTagName === "function" ? childView.getTagName() : void 0
      };
    };

    Pistachio.prototype.appendChild = function(childView) {
      return this.addSymbol(childView);
    };

    Pistachio.prototype.prependChild = function(childView) {
      return this.addSymbol(childView);
    };

    Pistachio.prototype.registerDataPaths = function(paths) {
      var path, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = paths.length; _i < _len; _i++) {
        path = paths[_i];
        _results.push(this.dataPaths[path] = true);
      }
      return _results;
    };

    Pistachio.prototype.registerSubViewNames = function(subViewNames) {
      var subViewName, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = subViewNames.length; _i < _len; _i++) {
        subViewName = subViewNames[_i];
        _results.push(this.subViewNames[subViewName] = true);
      }
      return _results;
    };

    Pistachio.prototype.getDataPaths = function() {
      return Object.keys(this.dataPaths);
    };

    Pistachio.prototype.getSubViewNames = function() {
      return Object.keys(this.subViewNames);
    };

    Pistachio.prototype.refreshChildren = function(childType, items, forEach) {
      var $els, item, symbols;
      symbols = this.symbols;
      $els = this.view.$(((function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = items.length; _i < _len; _i++) {
          item = items[_i];
          _results.push("[data-" + childType + "s~=\"" + item + "\"]");
        }
        return _results;
      })()).join(','));
      return $els.each(function() {
        var out, _ref;
        out = (_ref = symbols[this.id]) != null ? _ref.render() : void 0;
        if (out != null) return forEach != null ? forEach.call(this, out) : void 0;
      });
    };

    Pistachio.prototype.embedSubViews = function(subviews) {
      if (subviews == null) subviews = this.getSubViewNames();
      return this.refreshChildren('subview', subviews);
    };

    Pistachio.prototype.update = function(paths) {
      if (paths == null) paths = this.getDataPaths();
      return this.refreshChildren('path', paths, function(html) {
        return this.innerHTML = html;
      });
    };

    return Pistachio;

  }).call(this);

  if (typeof module !== "undefined" && module !== null) module.exports = Pistachio;

  if (typeof window !== "undefined" && window !== null) {
    window['Pistachio'] = Pistachio;
  }

}).call(this);
