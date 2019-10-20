// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles

// eslint-disable-next-line no-global-assign
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  for (var i = 0; i < entry.length; i++) {
    newRequire(entry[i]);
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  return newRequire;
})({"node_modules/hyperapp/src/index.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var RECYCLED_NODE = 1;
var LAZY_NODE = 2;
var TEXT_NODE = 3;
var EMPTY_OBJ = {};
var EMPTY_ARR = [];
var map = EMPTY_ARR.map;
var isArray = Array.isArray;
var defer = requestAnimationFrame || setTimeout;

var createClass = function (obj) {
  var out = "";

  if (typeof obj === "string") return obj;

  if (isArray(obj) && obj.length > 0) {
    for (var k = 0, tmp; k < obj.length; k++) {
      if ((tmp = createClass(obj[k])) !== "") {
        out += (out && " ") + tmp;
      }
    }
  } else {
    for (var k in obj) {
      if (obj[k]) {
        out += (out && " ") + k;
      }
    }
  }

  return out;
};

var merge = function (a, b) {
  var out = {};

  for (var k in a) out[k] = a[k];
  for (var k in b) out[k] = b[k];

  return out;
};

var batch = function (list) {
  return list.reduce(function (out, item) {
    return out.concat(!item || item === true ? 0 : typeof item[0] === "function" ? [item] : batch(item));
  }, EMPTY_ARR);
};

var isSameAction = function (a, b) {
  return isArray(a) && isArray(b) && a[0] === b[0] && typeof a[0] === "function";
};

var shouldRestart = function (a, b) {
  if (a !== b) {
    for (var k in merge(a, b)) {
      if (a[k] !== b[k] && !isSameAction(a[k], b[k])) return true;
      b[k] = a[k];
    }
  }
};

var patchSubs = function (oldSubs, newSubs, dispatch) {
  for (var i = 0, oldSub, newSub, subs = []; i < oldSubs.length || i < newSubs.length; i++) {
    oldSub = oldSubs[i];
    newSub = newSubs[i];
    subs.push(newSub ? !oldSub || newSub[0] !== oldSub[0] || shouldRestart(newSub[1], oldSub[1]) ? [newSub[0], newSub[1], newSub[0](dispatch, newSub[1]), oldSub && oldSub[2]()] : oldSub : oldSub && oldSub[2]());
  }
  return subs;
};

var patchProperty = function (node, key, oldValue, newValue, listener, isSvg) {
  if (key === "key") {} else if (key === "style") {
    for (var k in merge(oldValue, newValue)) {
      oldValue = newValue == null || newValue[k] == null ? "" : newValue[k];
      if (k[0] === "-") {
        node[key].setProperty(k, oldValue);
      } else {
        node[key][k] = oldValue;
      }
    }
  } else if (key[0] === "o" && key[1] === "n") {
    if (!((node.actions || (node.actions = {}))[key = key.slice(2).toLowerCase()] = newValue)) {
      node.removeEventListener(key, listener);
    } else if (!oldValue) {
      node.addEventListener(key, listener);
    }
  } else if (!isSvg && key !== "list" && key in node) {
    node[key] = newValue == null ? "" : newValue;
  } else if (newValue == null || newValue === false || key === "class" && !(newValue = createClass(newValue))) {
    node.removeAttribute(key);
  } else {
    node.setAttribute(key, newValue);
  }
};

var createNode = function (vdom, listener, isSvg) {
  var ns = "http://www.w3.org/2000/svg";
  var props = vdom.props;
  var node = vdom.type === TEXT_NODE ? document.createTextNode(vdom.name) : (isSvg = isSvg || vdom.name === "svg") ? document.createElementNS(ns, vdom.name, { is: props.is }) : document.createElement(vdom.name, { is: props.is });

  for (var k in props) {
    patchProperty(node, k, null, props[k], listener, isSvg);
  }

  for (var i = 0, len = vdom.children.length; i < len; i++) {
    node.appendChild(createNode(vdom.children[i] = getVNode(vdom.children[i]), listener, isSvg));
  }

  return vdom.node = node;
};

var getKey = function (vdom) {
  return vdom == null ? null : vdom.key;
};

var patch = function (parent, node, oldVNode, newVNode, listener, isSvg) {
  if (oldVNode === newVNode) {} else if (oldVNode != null && oldVNode.type === TEXT_NODE && newVNode.type === TEXT_NODE) {
    if (oldVNode.name !== newVNode.name) node.nodeValue = newVNode.name;
  } else if (oldVNode == null || oldVNode.name !== newVNode.name) {
    node = parent.insertBefore(createNode(newVNode = getVNode(newVNode), listener, isSvg), node);
    if (oldVNode != null) {
      parent.removeChild(oldVNode.node);
    }
  } else {
    var tmpVKid;
    var oldVKid;

    var oldKey;
    var newKey;

    var oldVProps = oldVNode.props;
    var newVProps = newVNode.props;

    var oldVKids = oldVNode.children;
    var newVKids = newVNode.children;

    var oldHead = 0;
    var newHead = 0;
    var oldTail = oldVKids.length - 1;
    var newTail = newVKids.length - 1;

    isSvg = isSvg || newVNode.name === "svg";

    for (var i in merge(oldVProps, newVProps)) {
      if ((i === "value" || i === "selected" || i === "checked" ? node[i] : oldVProps[i]) !== newVProps[i]) {
        patchProperty(node, i, oldVProps[i], newVProps[i], listener, isSvg);
      }
    }

    while (newHead <= newTail && oldHead <= oldTail) {
      if ((oldKey = getKey(oldVKids[oldHead])) == null || oldKey !== getKey(newVKids[newHead])) {
        break;
      }

      patch(node, oldVKids[oldHead].node, oldVKids[oldHead], newVKids[newHead] = getVNode(newVKids[newHead++], oldVKids[oldHead++]), listener, isSvg);
    }

    while (newHead <= newTail && oldHead <= oldTail) {
      if ((oldKey = getKey(oldVKids[oldTail])) == null || oldKey !== getKey(newVKids[newTail])) {
        break;
      }

      patch(node, oldVKids[oldTail].node, oldVKids[oldTail], newVKids[newTail] = getVNode(newVKids[newTail--], oldVKids[oldTail--]), listener, isSvg);
    }

    if (oldHead > oldTail) {
      while (newHead <= newTail) {
        node.insertBefore(createNode(newVKids[newHead] = getVNode(newVKids[newHead++]), listener, isSvg), (oldVKid = oldVKids[oldHead]) && oldVKid.node);
      }
    } else if (newHead > newTail) {
      while (oldHead <= oldTail) {
        node.removeChild(oldVKids[oldHead++].node);
      }
    } else {
      for (var i = oldHead, keyed = {}, newKeyed = {}; i <= oldTail; i++) {
        if ((oldKey = oldVKids[i].key) != null) {
          keyed[oldKey] = oldVKids[i];
        }
      }

      while (newHead <= newTail) {
        oldKey = getKey(oldVKid = oldVKids[oldHead]);
        newKey = getKey(newVKids[newHead] = getVNode(newVKids[newHead], oldVKid));

        if (newKeyed[oldKey] || newKey != null && newKey === getKey(oldVKids[oldHead + 1])) {
          if (oldKey == null) {
            node.removeChild(oldVKid.node);
          }
          oldHead++;
          continue;
        }

        if (newKey == null || oldVNode.type === RECYCLED_NODE) {
          if (oldKey == null) {
            patch(node, oldVKid && oldVKid.node, oldVKid, newVKids[newHead], listener, isSvg);
            newHead++;
          }
          oldHead++;
        } else {
          if (oldKey === newKey) {
            patch(node, oldVKid.node, oldVKid, newVKids[newHead], listener, isSvg);
            newKeyed[newKey] = true;
            oldHead++;
          } else {
            if ((tmpVKid = keyed[newKey]) != null) {
              patch(node, node.insertBefore(tmpVKid.node, oldVKid && oldVKid.node), tmpVKid, newVKids[newHead], listener, isSvg);
              newKeyed[newKey] = true;
            } else {
              patch(node, oldVKid && oldVKid.node, null, newVKids[newHead], listener, isSvg);
            }
          }
          newHead++;
        }
      }

      while (oldHead <= oldTail) {
        if (getKey(oldVKid = oldVKids[oldHead++]) == null) {
          node.removeChild(oldVKid.node);
        }
      }

      for (var i in keyed) {
        if (newKeyed[i] == null) {
          node.removeChild(keyed[i].node);
        }
      }
    }
  }

  return newVNode.node = node;
};

var propsChanged = function (a, b) {
  for (var k in a) if (a[k] !== b[k]) return true;
  for (var k in b) if (a[k] !== b[k]) return true;
};

var getVNode = function (newVNode, oldVNode) {
  return newVNode.type === LAZY_NODE ? ((!oldVNode || propsChanged(oldVNode.lazy, newVNode.lazy)) && ((oldVNode = newVNode.lazy.view(newVNode.lazy)).lazy = newVNode.lazy), oldVNode) : newVNode;
};

var createVNode = function (name, props, children, node, key, type) {
  return {
    name: name,
    props: props,
    children: children,
    node: node,
    type: type,
    key: key
  };
};

var createTextVNode = function (value, node) {
  return createVNode(value, EMPTY_OBJ, EMPTY_ARR, node, undefined, TEXT_NODE);
};

var recycleNode = function (node) {
  return node.nodeType === TEXT_NODE ? createTextVNode(node.nodeValue, node) : createVNode(node.nodeName.toLowerCase(), EMPTY_OBJ, map.call(node.childNodes, recycleNode), node, undefined, RECYCLED_NODE);
};

var Lazy = exports.Lazy = function (props) {
  return {
    lazy: props,
    type: LAZY_NODE
  };
};

var h = exports.h = function (name, props) {
  for (var vdom, rest = [], children = [], i = arguments.length; i-- > 2;) {
    rest.push(arguments[i]);
  }

  while (rest.length > 0) {
    if (isArray(vdom = rest.pop())) {
      for (var i = vdom.length; i-- > 0;) {
        rest.push(vdom[i]);
      }
    } else if (vdom === false || vdom === true || vdom == null) {} else {
      children.push(typeof vdom === "object" ? vdom : createTextVNode(vdom));
    }
  }

  props = props || EMPTY_OBJ;

  return typeof name === "function" ? name(props, children) : createVNode(name, props, children, undefined, props.key);
};

var app = exports.app = function (props) {
  var state = {};
  var lock = false;
  var view = props.view;
  var node = props.node;
  var vdom = node && recycleNode(node);
  var subscriptions = props.subscriptions;
  var subs = [];

  var listener = function (event) {
    dispatch(this.actions[event.type], event);
  };

  var setState = function (newState) {
    if (state !== newState) {
      state = newState;
      if (subscriptions) {
        subs = patchSubs(subs, batch([subscriptions(state)]), dispatch);
      }
      if (view && !lock) defer(render, lock = true);
    }
    return state;
  };

  var dispatch = (props.middleware || function (obj) {
    return obj;
  })(function (action, props) {
    return typeof action === "function" ? dispatch(action(state, props)) : isArray(action) ? typeof action[0] === "function" ? dispatch(action[0], typeof action[1] === "function" ? action[1](props) : action[1]) : (batch(action.slice(1)).map(function (fx) {
      fx && fx[0](dispatch, fx[1]);
    }, setState(action[0])), state) : setState(action);
  });

  var render = function () {
    lock = false;
    node = patch(node.parentNode, node, vdom, vdom = typeof (vdom = view(state)) === "string" ? createTextVNode(vdom) : vdom, listener);
  };

  dispatch(props.init);
};
},{}],"node_modules/@hyperapp/random/src/index.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var isArray = Array.isArray;

var randomFx = function (fx) {
  return function (action, generator) {
    return [fx, { action: action, generator: generator }];
  };
};

var id = function (any) {
  return any;
};

var resolve = function (obj) {
  if (isArray(obj)) {
    return obj.map(resolve);
  } else if (typeof obj === "function") {
    return obj(Math.random());
  }
};

var number = exports.number = function (map) {
  return map || id;
};

var generate = exports.generate = randomFx(function (dispatch, props) {
  dispatch(props.action, resolve(props.generator));
});
},{}],"node_modules/@hyperapp/html/dist/html.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.a = a;
exports.abbr = abbr;
exports.address = address;
exports.area = area;
exports.article = article;
exports.aside = aside;
exports.audio = audio;
exports.b = b;
exports.bdi = bdi;
exports.bdo = bdo;
exports.blockquote = blockquote;
exports.br = br;
exports.button = button;
exports.canvas = canvas;
exports.caption = caption;
exports.cite = cite;
exports.code = code;
exports.col = col;
exports.colgroup = colgroup;
exports.data = data;
exports.datalist = datalist;
exports.dd = dd;
exports.del = del;
exports.details = details;
exports.dfn = dfn;
exports.dialog = dialog;
exports.div = div;
exports.dl = dl;
exports.dt = dt;
exports.em = em;
exports.embed = embed;
exports.fieldset = fieldset;
exports.figcaption = figcaption;
exports.figure = figure;
exports.footer = footer;
exports.form = form;
exports.h1 = h1;
exports.h2 = h2;
exports.h3 = h3;
exports.h4 = h4;
exports.h5 = h5;
exports.h6 = h6;
exports.header = header;
exports.hr = hr;
exports.i = i;
exports.iframe = iframe;
exports.img = img;
exports.input = input;
exports.ins = ins;
exports.kbd = kbd;
exports.label = label;
exports.legend = legend;
exports.li = li;
exports.main = main;
exports.map = map;
exports.mark = mark;
exports.menu = menu;
exports.menuitem = menuitem;
exports.meter = meter;
exports.nav = nav;
exports.object = object;
exports.ol = ol;
exports.optgroup = optgroup;
exports.option = option;
exports.output = output;
exports.p = p;
exports.param = param;
exports.pre = pre;
exports.progress = progress;
exports.q = q;
exports.rp = rp;
exports.rt = rt;
exports.rtc = rtc;
exports.ruby = ruby;
exports.s = s;
exports.samp = samp;
exports.section = section;
exports.select = select;
exports.small = small;
exports.source = source;
exports.span = span;
exports.strong = strong;
exports.sub = sub;
exports.summary = summary;
exports.sup = sup;
exports.svg = svg;
exports.table = table;
exports.tbody = tbody;
exports.td = td;
exports.textarea = textarea;
exports.tfoot = tfoot;
exports.th = th;
exports.thead = thead;
exports.time = time;
exports.tr = tr;
exports.track = track;
exports.u = u;
exports.ul = ul;
exports.video = video;
exports.wbr = wbr;

var _hyperapp = require("hyperapp");

function vnode(name) {
  return function (attributes, children) {
    return typeof attributes === "object" && !Array.isArray(attributes) ? (0, _hyperapp.h)(name, attributes, children) : (0, _hyperapp.h)(name, {}, attributes);
  };
}

function a(attributes, children) {
  return vnode("a")(attributes, children);
}

function abbr(attributes, children) {
  return vnode("abbr")(attributes, children);
}

function address(attributes, children) {
  return vnode("address")(attributes, children);
}

function area(attributes, children) {
  return vnode("area")(attributes, children);
}

function article(attributes, children) {
  return vnode("article")(attributes, children);
}

function aside(attributes, children) {
  return vnode("aside")(attributes, children);
}

function audio(attributes, children) {
  return vnode("audio")(attributes, children);
}

function b(attributes, children) {
  return vnode("b")(attributes, children);
}

function bdi(attributes, children) {
  return vnode("bdi")(attributes, children);
}

function bdo(attributes, children) {
  return vnode("bdo")(attributes, children);
}

function blockquote(attributes, children) {
  return vnode("blockquote")(attributes, children);
}

function br(attributes, children) {
  return vnode("br")(attributes, children);
}

function button(attributes, children) {
  return vnode("button")(attributes, children);
}

function canvas(attributes, children) {
  return vnode("canvas")(attributes, children);
}

function caption(attributes, children) {
  return vnode("caption")(attributes, children);
}

function cite(attributes, children) {
  return vnode("cite")(attributes, children);
}

function code(attributes, children) {
  return vnode("code")(attributes, children);
}

function col(attributes, children) {
  return vnode("col")(attributes, children);
}

function colgroup(attributes, children) {
  return vnode("colgroup")(attributes, children);
}

function data(attributes, children) {
  return vnode("data")(attributes, children);
}

function datalist(attributes, children) {
  return vnode("datalist")(attributes, children);
}

function dd(attributes, children) {
  return vnode("dd")(attributes, children);
}

function del(attributes, children) {
  return vnode("del")(attributes, children);
}

function details(attributes, children) {
  return vnode("details")(attributes, children);
}

function dfn(attributes, children) {
  return vnode("dfn")(attributes, children);
}

function dialog(attributes, children) {
  return vnode("dialog")(attributes, children);
}

function div(attributes, children) {
  return vnode("div")(attributes, children);
}

function dl(attributes, children) {
  return vnode("dl")(attributes, children);
}

function dt(attributes, children) {
  return vnode("dt")(attributes, children);
}

function em(attributes, children) {
  return vnode("em")(attributes, children);
}

function embed(attributes, children) {
  return vnode("embed")(attributes, children);
}

function fieldset(attributes, children) {
  return vnode("fieldset")(attributes, children);
}

function figcaption(attributes, children) {
  return vnode("figcaption")(attributes, children);
}

function figure(attributes, children) {
  return vnode("figure")(attributes, children);
}

function footer(attributes, children) {
  return vnode("footer")(attributes, children);
}

function form(attributes, children) {
  return vnode("form")(attributes, children);
}

function h1(attributes, children) {
  return vnode("h1")(attributes, children);
}

function h2(attributes, children) {
  return vnode("h2")(attributes, children);
}

function h3(attributes, children) {
  return vnode("h3")(attributes, children);
}

function h4(attributes, children) {
  return vnode("h4")(attributes, children);
}

function h5(attributes, children) {
  return vnode("h5")(attributes, children);
}

function h6(attributes, children) {
  return vnode("h6")(attributes, children);
}

function header(attributes, children) {
  return vnode("header")(attributes, children);
}

function hr(attributes, children) {
  return vnode("hr")(attributes, children);
}

function i(attributes, children) {
  return vnode("i")(attributes, children);
}

function iframe(attributes, children) {
  return vnode("iframe")(attributes, children);
}

function img(attributes, children) {
  return vnode("img")(attributes, children);
}

function input(attributes, children) {
  return vnode("input")(attributes, children);
}

function ins(attributes, children) {
  return vnode("ins")(attributes, children);
}

function kbd(attributes, children) {
  return vnode("kbd")(attributes, children);
}

function label(attributes, children) {
  return vnode("label")(attributes, children);
}

function legend(attributes, children) {
  return vnode("legend")(attributes, children);
}

function li(attributes, children) {
  return vnode("li")(attributes, children);
}

function main(attributes, children) {
  return vnode("main")(attributes, children);
}

function map(attributes, children) {
  return vnode("map")(attributes, children);
}

function mark(attributes, children) {
  return vnode("mark")(attributes, children);
}

function menu(attributes, children) {
  return vnode("menu")(attributes, children);
}

function menuitem(attributes, children) {
  return vnode("menuitem")(attributes, children);
}

function meter(attributes, children) {
  return vnode("meter")(attributes, children);
}

function nav(attributes, children) {
  return vnode("nav")(attributes, children);
}

function object(attributes, children) {
  return vnode("object")(attributes, children);
}

function ol(attributes, children) {
  return vnode("ol")(attributes, children);
}

function optgroup(attributes, children) {
  return vnode("optgroup")(attributes, children);
}

function option(attributes, children) {
  return vnode("option")(attributes, children);
}

function output(attributes, children) {
  return vnode("output")(attributes, children);
}

function p(attributes, children) {
  return vnode("p")(attributes, children);
}

function param(attributes, children) {
  return vnode("param")(attributes, children);
}

function pre(attributes, children) {
  return vnode("pre")(attributes, children);
}

function progress(attributes, children) {
  return vnode("progress")(attributes, children);
}

function q(attributes, children) {
  return vnode("q")(attributes, children);
}

function rp(attributes, children) {
  return vnode("rp")(attributes, children);
}

function rt(attributes, children) {
  return vnode("rt")(attributes, children);
}

function rtc(attributes, children) {
  return vnode("rtc")(attributes, children);
}

function ruby(attributes, children) {
  return vnode("ruby")(attributes, children);
}

function s(attributes, children) {
  return vnode("s")(attributes, children);
}

function samp(attributes, children) {
  return vnode("samp")(attributes, children);
}

function section(attributes, children) {
  return vnode("section")(attributes, children);
}

function select(attributes, children) {
  return vnode("select")(attributes, children);
}

function small(attributes, children) {
  return vnode("small")(attributes, children);
}

function source(attributes, children) {
  return vnode("source")(attributes, children);
}

function span(attributes, children) {
  return vnode("span")(attributes, children);
}

function strong(attributes, children) {
  return vnode("strong")(attributes, children);
}

function sub(attributes, children) {
  return vnode("sub")(attributes, children);
}

function summary(attributes, children) {
  return vnode("summary")(attributes, children);
}

function sup(attributes, children) {
  return vnode("sup")(attributes, children);
}

function svg(attributes, children) {
  return vnode("svg")(attributes, children);
}

function table(attributes, children) {
  return vnode("table")(attributes, children);
}

function tbody(attributes, children) {
  return vnode("tbody")(attributes, children);
}

function td(attributes, children) {
  return vnode("td")(attributes, children);
}

function textarea(attributes, children) {
  return vnode("textarea")(attributes, children);
}

function tfoot(attributes, children) {
  return vnode("tfoot")(attributes, children);
}

function th(attributes, children) {
  return vnode("th")(attributes, children);
}

function thead(attributes, children) {
  return vnode("thead")(attributes, children);
}

function time(attributes, children) {
  return vnode("time")(attributes, children);
}

function tr(attributes, children) {
  return vnode("tr")(attributes, children);
}

function track(attributes, children) {
  return vnode("track")(attributes, children);
}

function u(attributes, children) {
  return vnode("u")(attributes, children);
}

function ul(attributes, children) {
  return vnode("ul")(attributes, children);
}

function video(attributes, children) {
  return vnode("video")(attributes, children);
}

function wbr(attributes, children) {
  return vnode("wbr")(attributes, children);
}
},{"hyperapp":"node_modules/hyperapp/src/index.js"}],"utilities.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
//    range :: (Int, Int) -> [Int]
var range = function range(from, to) {
  var result = [];
  var n = from;

  while (n <= to) {
    result.push(n);
    n++;
  }

  return result;
};

exports.range = range;
},{}],"index.js":[function(require,module,exports) {
"use strict";

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _hyperapp = require("hyperapp");

var _random = require("@hyperapp/random");

var Random = _interopRequireWildcard(_random);

var _html = require("@hyperapp/html");

var _utilities = require("./utilities");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var NUMBERS = (0, _utilities.range)(1, 10);

// HELPERS

// EFFECTS

// ACTIONS
var getRandomNumber = function getRandomNumber(numbers, action) {
  return Random.generate(action, Random.number(function (rand) {
    return numbers[Math.floor(rand * numbers.length)];
  }));
};

var SetChosenNumber = function SetChosenNumber(state, chosenNumber) {
  return _extends({}, state, {
    chosenNumber: chosenNumber
  });
};

var GuessNumber = function GuessNumber(state, number) {
  return _extends({}, state, {
    youWin: number === state.chosenNumber
  });
};

// VIEWS
var NumberButton = function NumberButton(number) {
  return (0, _html.button)({ onclick: [GuessNumber, number] }, number);
};

// THE APP
(0, _hyperapp.app)({
  init: [{
    numbers: NUMBERS,
    youWin: false
  }, getRandomNumber(NUMBERS, SetChosenNumber)],
  view: function view(state) {
    console.log({ state: state });
    if (state.youWin) {
      return (0, _html.h1)("YOU WIN!!!!");
    }

    return (0, _html.div)({}, state.numbers.map(NumberButton));
  },
  node: document.getElementById("app")
});
},{"hyperapp":"node_modules/hyperapp/src/index.js","@hyperapp/random":"node_modules/@hyperapp/random/src/index.js","@hyperapp/html":"node_modules/@hyperapp/html/dist/html.js","./utilities":"utilities.js"}],"../../../../../usr/local/lib/node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';

var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };

  module.bundle.hotData = null;
}

module.bundle.Module = Module;

var parent = module.bundle.parent;
if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = '' || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + '51046' + '/');
  ws.onmessage = function (event) {
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      console.clear();

      data.assets.forEach(function (asset) {
        hmrApply(global.parcelRequire, asset);
      });

      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          hmrAccept(global.parcelRequire, asset.id);
        }
      });
    }

    if (data.type === 'reload') {
      ws.close();
      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');

      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);

      removeErrorOverlay();

      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);
  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID;

  // html encode message and stack trace
  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;

  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';

  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;
  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];
      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;
  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAccept(bundle, id) {
  var modules = bundle.modules;
  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAccept(bundle.parent, id);
  }

  var cached = bundle.cache[id];
  bundle.hotData = {};
  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);

  cached = bundle.cache[id];
  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAccept(global.parcelRequire, id);
  });
}
},{}]},{},["../../../../../usr/local/lib/node_modules/parcel-bundler/src/builtins/hmr-runtime.js","index.js"], null)
//# sourceMappingURL=/zachs-number-guesser.7ce5e0d5.map