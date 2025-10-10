function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);
  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    enumerableOnly && (symbols = symbols.filter(function (sym) {
      return Object.getOwnPropertyDescriptor(object, sym).enumerable;
    })), keys.push.apply(keys, symbols);
  }
  return keys;
}
function _objectSpread2(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = null != arguments[i] ? arguments[i] : {};
    i % 2 ? ownKeys(Object(source), !0).forEach(function (key) {
      _defineProperty(target, key, source[key]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) {
      Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
    });
  }
  return target;
}
function _regeneratorRuntime() {
  _regeneratorRuntime = function () {
    return exports;
  };
  var exports = {},
    Op = Object.prototype,
    hasOwn = Op.hasOwnProperty,
    defineProperty = Object.defineProperty || function (obj, key, desc) {
      obj[key] = desc.value;
    },
    $Symbol = "function" == typeof Symbol ? Symbol : {},
    iteratorSymbol = $Symbol.iterator || "@@iterator",
    asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator",
    toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";
  function define(obj, key, value) {
    return Object.defineProperty(obj, key, {
      value: value,
      enumerable: !0,
      configurable: !0,
      writable: !0
    }), obj[key];
  }
  try {
    define({}, "");
  } catch (err) {
    define = function (obj, key, value) {
      return obj[key] = value;
    };
  }
  function wrap(innerFn, outerFn, self, tryLocsList) {
    var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator,
      generator = Object.create(protoGenerator.prototype),
      context = new Context(tryLocsList || []);
    return defineProperty(generator, "_invoke", {
      value: makeInvokeMethod(innerFn, self, context)
    }), generator;
  }
  function tryCatch(fn, obj, arg) {
    try {
      return {
        type: "normal",
        arg: fn.call(obj, arg)
      };
    } catch (err) {
      return {
        type: "throw",
        arg: err
      };
    }
  }
  exports.wrap = wrap;
  var ContinueSentinel = {};
  function Generator() {}
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}
  var IteratorPrototype = {};
  define(IteratorPrototype, iteratorSymbol, function () {
    return this;
  });
  var getProto = Object.getPrototypeOf,
    NativeIteratorPrototype = getProto && getProto(getProto(values([])));
  NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol) && (IteratorPrototype = NativeIteratorPrototype);
  var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype);
  function defineIteratorMethods(prototype) {
    ["next", "throw", "return"].forEach(function (method) {
      define(prototype, method, function (arg) {
        return this._invoke(method, arg);
      });
    });
  }
  function AsyncIterator(generator, PromiseImpl) {
    function invoke(method, arg, resolve, reject) {
      var record = tryCatch(generator[method], generator, arg);
      if ("throw" !== record.type) {
        var result = record.arg,
          value = result.value;
        return value && "object" == typeof value && hasOwn.call(value, "__await") ? PromiseImpl.resolve(value.__await).then(function (value) {
          invoke("next", value, resolve, reject);
        }, function (err) {
          invoke("throw", err, resolve, reject);
        }) : PromiseImpl.resolve(value).then(function (unwrapped) {
          result.value = unwrapped, resolve(result);
        }, function (error) {
          return invoke("throw", error, resolve, reject);
        });
      }
      reject(record.arg);
    }
    var previousPromise;
    defineProperty(this, "_invoke", {
      value: function (method, arg) {
        function callInvokeWithMethodAndArg() {
          return new PromiseImpl(function (resolve, reject) {
            invoke(method, arg, resolve, reject);
          });
        }
        return previousPromise = previousPromise ? previousPromise.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg();
      }
    });
  }
  function makeInvokeMethod(innerFn, self, context) {
    var state = "suspendedStart";
    return function (method, arg) {
      if ("executing" === state) throw new Error("Generator is already running");
      if ("completed" === state) {
        if ("throw" === method) throw arg;
        return doneResult();
      }
      for (context.method = method, context.arg = arg;;) {
        var delegate = context.delegate;
        if (delegate) {
          var delegateResult = maybeInvokeDelegate(delegate, context);
          if (delegateResult) {
            if (delegateResult === ContinueSentinel) continue;
            return delegateResult;
          }
        }
        if ("next" === context.method) context.sent = context._sent = context.arg;else if ("throw" === context.method) {
          if ("suspendedStart" === state) throw state = "completed", context.arg;
          context.dispatchException(context.arg);
        } else "return" === context.method && context.abrupt("return", context.arg);
        state = "executing";
        var record = tryCatch(innerFn, self, context);
        if ("normal" === record.type) {
          if (state = context.done ? "completed" : "suspendedYield", record.arg === ContinueSentinel) continue;
          return {
            value: record.arg,
            done: context.done
          };
        }
        "throw" === record.type && (state = "completed", context.method = "throw", context.arg = record.arg);
      }
    };
  }
  function maybeInvokeDelegate(delegate, context) {
    var methodName = context.method,
      method = delegate.iterator[methodName];
    if (undefined === method) return context.delegate = null, "throw" === methodName && delegate.iterator.return && (context.method = "return", context.arg = undefined, maybeInvokeDelegate(delegate, context), "throw" === context.method) || "return" !== methodName && (context.method = "throw", context.arg = new TypeError("The iterator does not provide a '" + methodName + "' method")), ContinueSentinel;
    var record = tryCatch(method, delegate.iterator, context.arg);
    if ("throw" === record.type) return context.method = "throw", context.arg = record.arg, context.delegate = null, ContinueSentinel;
    var info = record.arg;
    return info ? info.done ? (context[delegate.resultName] = info.value, context.next = delegate.nextLoc, "return" !== context.method && (context.method = "next", context.arg = undefined), context.delegate = null, ContinueSentinel) : info : (context.method = "throw", context.arg = new TypeError("iterator result is not an object"), context.delegate = null, ContinueSentinel);
  }
  function pushTryEntry(locs) {
    var entry = {
      tryLoc: locs[0]
    };
    1 in locs && (entry.catchLoc = locs[1]), 2 in locs && (entry.finallyLoc = locs[2], entry.afterLoc = locs[3]), this.tryEntries.push(entry);
  }
  function resetTryEntry(entry) {
    var record = entry.completion || {};
    record.type = "normal", delete record.arg, entry.completion = record;
  }
  function Context(tryLocsList) {
    this.tryEntries = [{
      tryLoc: "root"
    }], tryLocsList.forEach(pushTryEntry, this), this.reset(!0);
  }
  function values(iterable) {
    if (iterable) {
      var iteratorMethod = iterable[iteratorSymbol];
      if (iteratorMethod) return iteratorMethod.call(iterable);
      if ("function" == typeof iterable.next) return iterable;
      if (!isNaN(iterable.length)) {
        var i = -1,
          next = function next() {
            for (; ++i < iterable.length;) if (hasOwn.call(iterable, i)) return next.value = iterable[i], next.done = !1, next;
            return next.value = undefined, next.done = !0, next;
          };
        return next.next = next;
      }
    }
    return {
      next: doneResult
    };
  }
  function doneResult() {
    return {
      value: undefined,
      done: !0
    };
  }
  return GeneratorFunction.prototype = GeneratorFunctionPrototype, defineProperty(Gp, "constructor", {
    value: GeneratorFunctionPrototype,
    configurable: !0
  }), defineProperty(GeneratorFunctionPrototype, "constructor", {
    value: GeneratorFunction,
    configurable: !0
  }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, toStringTagSymbol, "GeneratorFunction"), exports.isGeneratorFunction = function (genFun) {
    var ctor = "function" == typeof genFun && genFun.constructor;
    return !!ctor && (ctor === GeneratorFunction || "GeneratorFunction" === (ctor.displayName || ctor.name));
  }, exports.mark = function (genFun) {
    return Object.setPrototypeOf ? Object.setPrototypeOf(genFun, GeneratorFunctionPrototype) : (genFun.__proto__ = GeneratorFunctionPrototype, define(genFun, toStringTagSymbol, "GeneratorFunction")), genFun.prototype = Object.create(Gp), genFun;
  }, exports.awrap = function (arg) {
    return {
      __await: arg
    };
  }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, asyncIteratorSymbol, function () {
    return this;
  }), exports.AsyncIterator = AsyncIterator, exports.async = function (innerFn, outerFn, self, tryLocsList, PromiseImpl) {
    void 0 === PromiseImpl && (PromiseImpl = Promise);
    var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList), PromiseImpl);
    return exports.isGeneratorFunction(outerFn) ? iter : iter.next().then(function (result) {
      return result.done ? result.value : iter.next();
    });
  }, defineIteratorMethods(Gp), define(Gp, toStringTagSymbol, "Generator"), define(Gp, iteratorSymbol, function () {
    return this;
  }), define(Gp, "toString", function () {
    return "[object Generator]";
  }), exports.keys = function (val) {
    var object = Object(val),
      keys = [];
    for (var key in object) keys.push(key);
    return keys.reverse(), function next() {
      for (; keys.length;) {
        var key = keys.pop();
        if (key in object) return next.value = key, next.done = !1, next;
      }
      return next.done = !0, next;
    };
  }, exports.values = values, Context.prototype = {
    constructor: Context,
    reset: function (skipTempReset) {
      if (this.prev = 0, this.next = 0, this.sent = this._sent = undefined, this.done = !1, this.delegate = null, this.method = "next", this.arg = undefined, this.tryEntries.forEach(resetTryEntry), !skipTempReset) for (var name in this) "t" === name.charAt(0) && hasOwn.call(this, name) && !isNaN(+name.slice(1)) && (this[name] = undefined);
    },
    stop: function () {
      this.done = !0;
      var rootRecord = this.tryEntries[0].completion;
      if ("throw" === rootRecord.type) throw rootRecord.arg;
      return this.rval;
    },
    dispatchException: function (exception) {
      if (this.done) throw exception;
      var context = this;
      function handle(loc, caught) {
        return record.type = "throw", record.arg = exception, context.next = loc, caught && (context.method = "next", context.arg = undefined), !!caught;
      }
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i],
          record = entry.completion;
        if ("root" === entry.tryLoc) return handle("end");
        if (entry.tryLoc <= this.prev) {
          var hasCatch = hasOwn.call(entry, "catchLoc"),
            hasFinally = hasOwn.call(entry, "finallyLoc");
          if (hasCatch && hasFinally) {
            if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0);
            if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc);
          } else if (hasCatch) {
            if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0);
          } else {
            if (!hasFinally) throw new Error("try statement without catch or finally");
            if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc);
          }
        }
      }
    },
    abrupt: function (type, arg) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) {
          var finallyEntry = entry;
          break;
        }
      }
      finallyEntry && ("break" === type || "continue" === type) && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc && (finallyEntry = null);
      var record = finallyEntry ? finallyEntry.completion : {};
      return record.type = type, record.arg = arg, finallyEntry ? (this.method = "next", this.next = finallyEntry.finallyLoc, ContinueSentinel) : this.complete(record);
    },
    complete: function (record, afterLoc) {
      if ("throw" === record.type) throw record.arg;
      return "break" === record.type || "continue" === record.type ? this.next = record.arg : "return" === record.type ? (this.rval = this.arg = record.arg, this.method = "return", this.next = "end") : "normal" === record.type && afterLoc && (this.next = afterLoc), ContinueSentinel;
    },
    finish: function (finallyLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.finallyLoc === finallyLoc) return this.complete(entry.completion, entry.afterLoc), resetTryEntry(entry), ContinueSentinel;
      }
    },
    catch: function (tryLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc === tryLoc) {
          var record = entry.completion;
          if ("throw" === record.type) {
            var thrown = record.arg;
            resetTryEntry(entry);
          }
          return thrown;
        }
      }
      throw new Error("illegal catch attempt");
    },
    delegateYield: function (iterable, resultName, nextLoc) {
      return this.delegate = {
        iterator: values(iterable),
        resultName: resultName,
        nextLoc: nextLoc
      }, "next" === this.method && (this.arg = undefined), ContinueSentinel;
    }
  }, exports;
}
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
  try {
    var info = gen[key](arg);
    var value = info.value;
  } catch (error) {
    reject(error);
    return;
  }
  if (info.done) {
    resolve(value);
  } else {
    Promise.resolve(value).then(_next, _throw);
  }
}
function _asyncToGenerator(fn) {
  return function () {
    var self = this,
      args = arguments;
    return new Promise(function (resolve, reject) {
      var gen = fn.apply(self, args);
      function _next(value) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
      }
      function _throw(err) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
      }
      _next(undefined);
    });
  };
}
function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}
function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor);
  }
}
function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  Object.defineProperty(Constructor, "prototype", {
    writable: false
  });
  return Constructor;
}
function _defineProperty(obj, key, value) {
  key = _toPropertyKey(key);
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }
  return obj;
}
function _toPrimitive(input, hint) {
  if (typeof input !== "object" || input === null) return input;
  var prim = input[Symbol.toPrimitive];
  if (prim !== undefined) {
    var res = prim.call(input, hint || "default");
    if (typeof res !== "object") return res;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (hint === "string" ? String : Number)(input);
}
function _toPropertyKey(arg) {
  var key = _toPrimitive(arg, "string");
  return typeof key === "symbol" ? key : String(key);
}

var controlsContent = [{
  id: "essential",
  enableSwitcher: false,
  content: {
    default: {
      title: "Essential",
      description: "Enables the site's core functionality, such as navigation, access to secure areas, video players and payments. The site cannot function properly without these cookies; they can only be disabled by changing your browser preferences."
    },
    zh: {
      title: "必要性",
      description: "启用网站核心功能，例如导航，访问安全区域，视频播放器和支付。没有这些cookie网站不能正常工作；它们仅可通过修改浏览器偏好设置禁用。"
    },
    ja: {
      title: "エッセンシャル",
      description: "移動、保護されている情報へのアクセス、動画再生、支払など、サイトの基本的な機能が有効になります。これらのクッキーが有効になっていない（お使いのブラウザの設定を変更することによってクッキーが無効化されている）場合、サイトは正しく表示されません。"
    }
  }
}, {
  id: "performance",
  enableSwitcher: true,
  content: {
    default: {
      title: "Performance",
      description: "Collects information on site usage, for example, which pages are most frequently visited."
    },
    zh: {
      title: "表现性",
      description: "网站使用信息收集，例如哪些网页被频繁访问。"
    },
    ja: {
      title: "パフォーマンス",
      description: "サイトの利用状況に関する情報を収集します。例として、どのページの訪問頻度が高いかのような情報です。"
    }
  }
}, {
  id: "functionality",
  enableSwitcher: true,
  content: {
    default: {
      title: "Functionality",
      description: "Recognises you when you return to our site. This enables us to personalise content, greet you by name, remember your preferences, and helps you share pages on social networks."
    },
    zh: {
      title: "功能性",
      description: "当你返回到我们网站时能识别您。这使得我们能个性化内容，欢迎您，记住您的偏好设置，以及帮助您分享网页到社交媒体。"
    },
    ja: {
      title: "機能性",
      description: "お客様がサイトを再訪問したときに、お客様であることを認識します。この設定では、お客様に合わせたコンテンツの表示、お客様のお名前を用いたあいさつメッセージの表示、お客様の傾向の記録を当社が行えるようになります。また、お客様がソーシャルネットワークでページをシェアできるようになります。"
    }
  }
}];
var content = {
  default: {
    notification: {
      title: "Your tracker settings",
      body1: "We use cookies and similar methods to recognise visitors and remember preferences. We also use them to measure campaign effectiveness and analyse site traffic.",
      body2: "By selecting ‘Accept‘, you consent to the use of these methods by us and trusted third parties.",
      body3: 'For further details or to change your consent choices at any time see our <a href="https://ubuntu.com/legal/data-privacy?cp=hide#cookies">cookie policy</a>.',
      buttonAccept: "Accept all and visit site",
      buttonManage: "Manage your tracker settings"
    },
    manager: {
      title: "Tracking choices",
      body1: "We use cookies to recognise visitors and remember your preferences.",
      body2: "They enhance user experience, personalise content and ads, provide social media features, measure campaign effectiveness, and analyse site traffic.",
      body3: "Select the types of trackers you consent to, both by us, and third parties.",
      body4: 'Learn more at <a href="https://ubuntu.com/legal/data-privacy?cp=hide#cookies">data privacy: cookie policy</a> - you can change your choices at any time from the footer of the site.',
      acceptAll: "Accept all",
      acceptAllHelp: 'This will switch all toggles "ON".',
      savePreferences: "Save preferences"
    }
  },
  zh: {
    notification: {
      title: "您的追踪器设置",
      body1: "我们使用cookie和相似的方法来识别访问者和记住偏好设置。我们也用它们来衡量活动的效果和网站流量分析。",
      body2: "选择”接受“，您同意我们和受信的第三方来使用这些方式。",
      body3: '更多内容或者随时地变更您的同意选择，请点击我们的 <a href="https://ubuntu.com/legal/data-privacy?cp=hide#cookies">cookie策略</a>.',
      buttonAccept: "接受全部和访问网站",
      buttonManage: "管理您的追踪器设置"
    },
    manager: {
      title: "追踪选项",
      body1: "我们使用cookie来识别访问者和记住您的偏好设置",
      body2: "它们增强用户体验，使内容和广告个性化，提供社交媒体功能，衡量活动效果和网站流量分析。",
      body3: "选择您同意授予我们和受信的第三方的追踪类型。",
      body4: '点击<a href="https://ubuntu.com/legal/data-privacy?cp=hide#cookies">数据隐私：cookie策略</a>了解更多，您可以在网站底部随时更改您的选择。',
      acceptAll: "接受全部",
      acceptAllHelp: "这将把全部开关变为”开启“。",
      savePreferences: "保存偏好设置"
    }
  },
  ja: {
    notification: {
      title: "トラッキング機能の設定",
      body1: "当社は、当社のウェブサイトを訪問された方の識別や傾向の記録を行うために、クッキーおよび類似の手法を利用します。また、キャンペーンの効果の測定やサイトのトラフィックの分析にもクッキーを利用します。",
      body2: "「同意」を選択すると、当社および信頼できる第三者による上記の手法の利用に同意したものとみなされます。",
      body3: '詳細または同意の変更については、いつでも当社の<a href="https://ubuntu.com/legal/data-privacy?cp=hide#cookies">クッキーに関するポリシー</a>をご覧になることができます。',
      buttonAccept: "すべて同意してサイトにアクセス",
      buttonManage: "トラッキング機能の設定の管理"
    },
    manager: {
      title: "トラッキング機能の選択",
      body1: "当社は、当社のウェブサイトを訪問された方の識別や傾向の記録を行うために、クッキーを利用します。",
      body2: "クッキーは、お客様の利便性の向上、お客様に合わせたコンテンツや広告の表示、ソーシャルメディア機能の提供、キャンペーンの効果の測定、サイトのトラフィックの分析に役立ちます。",
      body3: "当社および第三者によるトラッキング機能のタイプから、お客様が同意されるものをお選びください。",
      body4: '詳細は、<a href="https://ubuntu.com/legal/data-privacy?cp=hide#cookies">データプライバシー：クッキーに関するポリシー</a>をご覧ください。お客様が選んだ設定は、本サイトの下部からいつでも変更できます。',
      acceptAll: "すべて同意",
      acceptAllHelp: "同意されるとすべての設定が「ON」に切り替わります。",
      savePreferences: "設定を保存"
    }
  }
};

// API Integration Layer for Cookie Policy Session Management

var API_BASE_URL = "http://localhost:8118"; // Change to https://cookies.canonical.com in production

// Build API URL with query parameters
var buildApiUrl = function buildApiUrl(endpoint) {
  var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var url = new URL(endpoint, API_BASE_URL);
  Object.keys(params).forEach(function (key) {
    if (params[key] !== null && params[key] !== undefined) {
      url.searchParams.append(key, params[key]);
    }
  });
  return url.toString();
};

// Handle API errors
var handleApiError = function handleApiError(error) {
  var context = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "";
  console.error("Cookie Policy API Error ".concat(context, ":"), error);
  return {
    success: false,
    error: error.message || "Unknown error occurred"
  };
};

// GET request to retrieve user consent preferences
var getConsentPreferences = /*#__PURE__*/function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee(code, userUuid) {
    var url, response, data;
    return _regeneratorRuntime().wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          url = buildApiUrl("/consent", {
            code: code,
            user_uuid: userUuid
          });
          _context.next = 4;
          return fetch(url, {
            method: "GET",
            headers: {
              "Content-Type": "application/json"
            }
          });
        case 4:
          response = _context.sent;
          if (response.ok) {
            _context.next = 7;
            break;
          }
          throw new Error("HTTP error! status: ".concat(response.status));
        case 7:
          _context.next = 9;
          return response.json();
        case 9:
          data = _context.sent;
          return _context.abrupt("return", {
            success: true,
            data: data
          });
        case 13:
          _context.prev = 13;
          _context.t0 = _context["catch"](0);
          return _context.abrupt("return", handleApiError(_context.t0, "getConsentPreferences"));
        case 16:
        case "end":
          return _context.stop();
      }
    }, _callee, null, [[0, 13]]);
  }));
  return function getConsentPreferences(_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();

// POST request to save user consent preferences
var postConsentPreferences = /*#__PURE__*/function () {
  var _ref2 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2(code, userUuid, preferences) {
    var url, response, data;
    return _regeneratorRuntime().wrap(function _callee2$(_context2) {
      while (1) switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          url = buildApiUrl("/consent", {
            code: code,
            user_uuid: userUuid
          });
          _context2.next = 4;
          return fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              preferences: preferences
            })
          });
        case 4:
          response = _context2.sent;
          if (response.ok) {
            _context2.next = 7;
            break;
          }
          throw new Error("HTTP error! status: ".concat(response.status));
        case 7:
          _context2.next = 9;
          return response.json();
        case 9:
          data = _context2.sent;
          return _context2.abrupt("return", {
            success: true,
            data: data
          });
        case 13:
          _context2.prev = 13;
          _context2.t0 = _context2["catch"](0);
          return _context2.abrupt("return", handleApiError(_context2.t0, "postConsentPreferences"));
        case 16:
        case "end":
          return _context2.stop();
      }
    }, _callee2, null, [[0, 13]]);
  }));
  return function postConsentPreferences(_x3, _x4, _x5) {
    return _ref2.apply(this, arguments);
  };
}();

// Redirect to session endpoint
var redirectToSession = function redirectToSession(_ref3) {
  var manageConsent = _ref3.manageConsent,
    legacyUserId = _ref3.legacyUserId;
  var params = {
    return_url: window.location.href
  };
  if (manageConsent) {
    params.action = "manage-cookies";
  }
  if (legacyUserId) {
    params.previous_uuid = legacyUserId;
  }
  var sessionUrl = buildApiUrl("/cookies/session", params);
  window.location.href = sessionUrl;
};

var DEFAULT_CONSENT = {
  ad_storage: "denied",
  ad_user_data: "denied",
  ad_personalization: "denied",
  analytics_storage: "denied",
  functionality_storage: "denied",
  personalization_storage: "denied",
  security_storage: "denied"
};
var ESSENTIAL_PREFERENCES = ["security_storage"];
var PERFORMANCE_PREFERENCES = ["ad_storage", "ad_user_data", "ad_personalization", "analytics_storage"];
var FUNCTIONALITY_PREFERENCES = ["functionality_storage", "personalization_storage"];
var ALL_PREFERENCES = ["ad_storage", "ad_user_data", "ad_personalization", "analytics_storage", "functionality_storage", "personalization_storage"];
var setSessionCookie = function setSessionCookie(name, value) {
  var expiresInDays = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
  var samesite = "samesite=lax;";
  var path = "path=/;";
  var cookieString = name + "=" + value + "; " + samesite + path;

  // If expiresInDays is provided, add expiration date
  if (expiresInDays !== null) {
    var d = new Date();
    d.setTime(d.getTime() + expiresInDays * 24 * 60 * 60 * 1000);
    var expires = "expires=" + d.toUTCString();
    cookieString = name + "=" + value + "; " + expires + "; " + samesite + path;
  }
  document.cookie = cookieString;
};
var setUserUuidCookie = function setUserUuidCookie(userUuid) {
  // Set user_uuid cookie with 365 days expiration
  setSessionCookie("user_uuid", userUuid, 365);
};
var setCookiesAcceptedCookie = function setCookiesAcceptedCookie(preference) {
  // Set _cookies_acceptedd cookie with 365 days expiration
  setSessionCookie("_cookies_accepted", preference, 365);
};
var storeCookiesPreferences = /*#__PURE__*/function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee(sessionParams, preference, controlsStore) {
    var result;
    return _regeneratorRuntime().wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          if (!(sessionParams && sessionParams.code && sessionParams.user_uuid)) {
            _context.next = 5;
            break;
          }
          _context.next = 3;
          return postConsentPreferences(sessionParams.code, sessionParams.user_uuid, {
            consent: preference
          });
        case 3:
          result = _context.sent;
          if (result.success) {
            setCookiesAcceptedCookie(preference);
            if (controlsStore) {
              setGoogleConsentFromControls(controlsStore);
            } else {
              setGoogleConsentPreferences(preference);
            }
          }
        case 5:
        case "end":
          return _context.stop();
      }
    }, _callee);
  }));
  return function storeCookiesPreferences(_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  };
}();
var getCookieByName = function getCookieByName(name) {
  var toMatch = name + "=";
  var splitArray = document.cookie.split(";");
  for (var i = 0; i < splitArray.length; i++) {
    var cookie = splitArray[i];
    while (cookie.charAt(0) == " ") {
      cookie = cookie.substring(1);
    }
    if (cookie.indexOf(toMatch) === 0) {
      return cookie.substring(toMatch.length, cookie.length);
    }
  }
  return null;
};
var getUserUuidCookie = function getUserUuidCookie() {
  return getCookieByName("user_uuid");
};
var getCookiesAcceptedCookie = function getCookiesAcceptedCookie() {
  return getCookieByName("_cookies_accepted");
};
var preferenceNotSelected = function preferenceNotSelected() {
  var cookieValue = getCookiesAcceptedCookie();
  return !cookieValue || cookieValue === "true" || cookieValue === "unset";
};
var hideSpecified = function hideSpecified() {
  var urlParams = new URLSearchParams(window.location.search);
  var cpQuery = urlParams.get("cp");
  if (cpQuery === "hide") {
    return true;
  } else {
    return false;
  }
};
var getContent = function getContent(language) {
  if (content[language]) {
    return content[language];
  } else {
    return content["default"];
  }
};
var getControlsContent = function getControlsContent(details, language) {
  if (details.content[language]) {
    return details.content[language];
  } else {
    return details.content["default"];
  }
};
var addGoogleConsentMode = function addGoogleConsentMode() {
  // Check for existing gtag before adding the default script
  if (!window.gtag) {
    // Run the script to define gtag
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() {
      dataLayer.push(arguments);
    };

    // Set default consent to 'denied' as a placeholder
    window.gtag("consent", "default", DEFAULT_CONSENT);
  }
};
var loadConsentFromCookie = function loadConsentFromCookie() {
  var cookieValue = getCookiesAcceptedCookie();
  if (cookieValue && cookieValue !== "unset") {
    setGoogleConsentPreferences(cookieValue);
  }
};
var setGoogleConsentFromControls = function setGoogleConsentFromControls(controls) {
  var checkedControls = controls.filter(function (control) {
    return control.isChecked();
  });
  var updatedConsent = _objectSpread2({}, DEFAULT_CONSENT);

  // We combine the preferences into a single object
  checkedControls.forEach(function (item) {
    updatedConsent = updateConsentPreferences(updatedConsent, item.id);
  });

  // Insert the script at the bottom of the head section
  runConsentScript(updatedConsent);
};
var setGoogleConsentPreferences = function setGoogleConsentPreferences(selectedPreference) {
  var updatedConsent = updateConsentPreferences(DEFAULT_CONSENT, selectedPreference);

  // Insert the script at the bottom of the head section
  runConsentScript(updatedConsent);
};
var updateConsentPreferences = function updateConsentPreferences(consentObject, selectedPreference) {
  var updatedConsent = _objectSpread2({}, consentObject);
  ESSENTIAL_PREFERENCES.forEach(function (item) {
    updatedConsent[item] = "granted";
  });
  if (selectedPreference === "performance") {
    PERFORMANCE_PREFERENCES.forEach(function (item) {
      updatedConsent[item] = "granted";
    });
  } else if (selectedPreference === "functionality") {
    FUNCTIONALITY_PREFERENCES.forEach(function (item) {
      updatedConsent[item] = "granted";
    });
  } else if (selectedPreference === "all") {
    ALL_PREFERENCES.forEach(function (item) {
      updatedConsent[item] = "granted";
    });
  }
  return updatedConsent;
};
var runConsentScript = function runConsentScript(consentObject) {
  // Update preferences
  window.gtag("consent", "update", consentObject);
};
var hasValidSession = function hasValidSession() {
  var cookieValue = getCookiesAcceptedCookie();
  var userUuid = getUserUuidCookie();
  // Valid session if cookie exists, is not "unset", and user_uuid exists
  return cookieValue && cookieValue !== "unset" && userUuid;
};

// URL Parameter Extraction Utilities
var getUrlParameter = function getUrlParameter(name) {
  var urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
};
var extractSessionParameters = function extractSessionParameters() {
  return {
    code: getUrlParameter("code"),
    user_uuid: getUrlParameter("user_uuid"),
    preferences_unset: getUrlParameter("preferences_unset"),
    action: getUrlParameter("action")
  };
};
var isReturnFromSession = function isReturnFromSession(sessionParams) {
  var code = sessionParams.code,
    user_uuid = sessionParams.user_uuid;
  return !!(code && user_uuid);
};
var clearUrlParameters = function clearUrlParameters() {
  if (history.replaceState) {
    var url = window.location.pathname + window.location.hash;
    history.replaceState(null, "", url);
  }
};
var redirectNeeded = function redirectNeeded() {
  if (hasValidSession() || hideSpecified()) {
    return false;
  }
  return true;
};
var getLegacyUserId = function getLegacyUserId() {
  return getCookieByName("user_id");
};

var Notification = /*#__PURE__*/function () {
  function Notification(container, renderManager, destroyComponent) {
    var sessionParams = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
    _classCallCheck(this, Notification);
    this.container = container;
    this.renderManager = renderManager;
    this.destroyComponent = destroyComponent;
    this.sessionParams = sessionParams;
  }
  _createClass(Notification, [{
    key: "getNotificationMarkup",
    value: function getNotificationMarkup(language) {
      var notificationContent = getContent(language);
      var notification = "\n      <div class=\"p-modal\" id=\"modal\">\n        <div class=\"p-modal__dialog\" role=\"dialog\" aria-labelledby=\"cookie-policy-title\" aria-describedby=\"cookie-policy-content\">\n        <header class=\"p-modal__header\">\n          <h2 class=\"p-modal__title\" id=\"cookie-policy-title\">".concat(notificationContent.notification.title, "</h2>\n        </header>\n        <div id=\"cookie-policy-content\">\n          <p>").concat(notificationContent.notification.body1, "</p>\n          <p>").concat(notificationContent.notification.body2, "</p>\n          <p>").concat(notificationContent.notification.body3, "</p>\n          <p class=\"u-no-margin--bottom\">\n            <button class=\"p-button--positive js-close\" id=\"cookie-policy-button-accept\">").concat(notificationContent.notification.buttonAccept, "</button>\n            <button class=\"p-button js-manage\">").concat(notificationContent.notification.buttonManage, "</button>\n          </p>\n        </div>\n      </div>");
      return notification;
    }
  }, {
    key: "render",
    value: function render(language) {
      this.container.innerHTML = this.getNotificationMarkup(language);
      this.initaliseListeners();
    }
  }, {
    key: "initaliseListeners",
    value: function initaliseListeners() {
      var _this = this;
      this.container.querySelector(".js-close").addEventListener("click", /*#__PURE__*/function () {
        var _ref = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee(e) {
          return _regeneratorRuntime().wrap(function _callee$(_context) {
            while (1) switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return _this.handleAcceptAll();
              case 2:
              case "end":
                return _context.stop();
            }
          }, _callee);
        }));
        return function (_x) {
          return _ref.apply(this, arguments);
        };
      }());
      this.container.querySelector(".js-manage").addEventListener("click", function (e) {
        _this.renderManager();
      });
    }
  }, {
    key: "handleAcceptAll",
    value: function () {
      var _handleAcceptAll = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2() {
        var preference;
        return _regeneratorRuntime().wrap(function _callee2$(_context2) {
          while (1) switch (_context2.prev = _context2.next) {
            case 0:
              preference = "all"; // If we have session parameters, save to server and session
              storeCookiesPreferences(this.sessionParams, preference);
              this.destroyComponent();
            case 3:
            case "end":
              return _context2.stop();
          }
        }, _callee2, this);
      }));
      function handleAcceptAll() {
        return _handleAcceptAll.apply(this, arguments);
      }
      return handleAcceptAll;
    }()
  }]);
  return Notification;
}();

var Control = /*#__PURE__*/function () {
  function Control(details, container, language) {
    _classCallCheck(this, Control);
    this.language = language;
    this.id = details.id;
    this.title = getControlsContent(details, language).title;
    this.description = getControlsContent(details, language).description;
    this.enableSwitcher = details.enableSwitcher;
    this.container = container;
    this.element;

    // Rendering off the bat here as this is a dumb component.
    // It saves creating a variable and calling .render() on it.
    this.render();
  }
  _createClass(Control, [{
    key: "render",
    value: function render() {
      var isChecked = this.cookieIsTrue();
      var control = document.createElement("div");
      control.classList.add("u-sv3");
      control.innerHTML = "\n      ".concat("<label class=\"u-float-right p-switch\">\n          <input type=\"checkbox\" class=\"p-switch__input js-".concat(this.id, "-switch\" ").concat((isChecked || !this.enableSwitcher) && 'checked="" ', "\n            ").concat(!this.enableSwitcher && "disabled=\"disabled\"", ">\n          <span class=\"p-switch__slider\"></span>\n        </label>"), "\n      <h4>", this.title, "</h4>\n      <p>").concat(this.description, "</p>");
      this.container.appendChild(control);
      this.element = control.querySelector(".js-".concat(this.id, "-switch"));
    }
  }, {
    key: "cookieIsTrue",
    value: function cookieIsTrue() {
      var cookieValue = getCookiesAcceptedCookie();

      // If the cookie value matches the control ID, return true
      if (cookieValue) {
        if (cookieValue === this.id || cookieValue === "all") {
          return true;
        }
      }
      return cookieValue && cookieValue === this.id;
    }

    // The check should be false by default
  }, {
    key: "isChecked",
    value: function isChecked() {
      return this.element ? this.element.checked : false;
    }
  }, {
    key: "getId",
    value: function getId() {
      return this.id;
    }
  }]);
  return Control;
}();

var Manager = /*#__PURE__*/function () {
  function Manager(container, destroyComponent) {
    var sessionParams = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
    _classCallCheck(this, Manager);
    this.container = container;
    this.controlsStore = [];
    this.destroyComponent = destroyComponent;
    this.sessionParams = sessionParams;
  }
  _createClass(Manager, [{
    key: "getManagerMarkup",
    value: function getManagerMarkup(language) {
      var managerContent = getContent(language).manager;
      var manager = "\n    <div class=\"p-modal\" id=\"modal\">\n    <div class=\"p-modal__dialog\" role=\"dialog\" aria-labelledby=\"modal-title\" aria-describedby=\"modal-description\">\n      <header class=\"p-modal__header\">\n        <h2 class=\"p-modal__title\" id=\"modal-title\">".concat(managerContent.title, "</h2>\n      </header>\n      <p id=\"modal-description\">").concat(managerContent.body1, "</p>\n      <p>").concat(managerContent.body2, "</p>\n      <p>").concat(managerContent.body3, "</p>\n      <p>").concat(managerContent.body4, "</p>\n      <p><button class=\"p-button--positive u-no-margin--bottom js-close\">").concat(managerContent.acceptAll, "</button></p>\n      <p>").concat(managerContent.acceptAllHelp, "</p>\n      <hr />\n      <div class=\"controls\"></div>\n      <button class=\"p-button js-save-preferences\">").concat(managerContent.savePreferences, "</button>\n    </div>\n  </div>");
      return manager;
    }
  }, {
    key: "render",
    value: function render(language) {
      var _this = this;
      this.container.innerHTML = this.getManagerMarkup(language);
      var controlsContainer = this.container.querySelector(".controls");
      controlsContent.forEach(function (controlDetails) {
        var control = new Control(controlDetails, controlsContainer, language);
        _this.controlsStore.push(control);
      });
      this.initaliseListeners();
    }
  }, {
    key: "initaliseListeners",
    value: function initaliseListeners() {
      var _this2 = this;
      this.container.querySelector(".js-close").addEventListener("click", /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee() {
        return _regeneratorRuntime().wrap(function _callee$(_context) {
          while (1) switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return _this2.handleAcceptAll();
            case 2:
            case "end":
              return _context.stop();
          }
        }, _callee);
      })));
      this.container.querySelector(".js-save-preferences").addEventListener("click", /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2() {
        return _regeneratorRuntime().wrap(function _callee2$(_context2) {
          while (1) switch (_context2.prev = _context2.next) {
            case 0:
              _context2.next = 2;
              return _this2.handleSavePreferences();
            case 2:
            case "end":
              return _context2.stop();
          }
        }, _callee2);
      })));
    }
  }, {
    key: "handleAcceptAll",
    value: function () {
      var _handleAcceptAll = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee3() {
        var preference;
        return _regeneratorRuntime().wrap(function _callee3$(_context3) {
          while (1) switch (_context3.prev = _context3.next) {
            case 0:
              // And if we don't have a session??
              preference = "all"; // If we have session parameters, save to server and session
              storeCookiesPreferences(this.sessionParams, preference);
              this.destroyComponent();
            case 3:
            case "end":
              return _context3.stop();
          }
        }, _callee3, this);
      }));
      function handleAcceptAll() {
        return _handleAcceptAll.apply(this, arguments);
      }
      return handleAcceptAll;
    }()
  }, {
    key: "handleSavePreferences",
    value: function () {
      var _handleSavePreferences = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee4() {
        var checkedControls, preference, lastCheckedControl;
        return _regeneratorRuntime().wrap(function _callee4$(_context4) {
          while (1) switch (_context4.prev = _context4.next) {
            case 0:
              checkedControls = this.controlsStore.filter(function (control) {
                return control.isChecked();
              });
              if (this.controlsStore.length === checkedControls.length) {
                preference = "all";
              } else {
                // Get the last checked control's preference
                lastCheckedControl = checkedControls[checkedControls.length - 1];
                preference = lastCheckedControl ? lastCheckedControl.getId() : "essential";
              }

              // If we have session parameters, save to server and session
              storeCookiesPreferences(this.sessionParams, preference, this.controlsStore);
              this.destroyComponent();
            case 4:
            case "end":
              return _context4.stop();
          }
        }, _callee4, this);
      }));
      function handleSavePreferences() {
        return _handleSavePreferences.apply(this, arguments);
      }
      return handleSavePreferences;
    }()
  }]);
  return Manager;
}();

// Add Google Consent Mode as soon as the script is loaded
addGoogleConsentMode();
var cookiePolicy = function cookiePolicy() {
  var callback = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
  var cookiePolicyContainer = null;
  var language = document.documentElement.lang;
  var initialised = false;
  var sessionParams = extractSessionParameters();

  // Handle return from session endpoint
  var handleReturnFromSession = /*#__PURE__*/function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee() {
      var code, user_uuid, preferences_unset, action, result;
      return _regeneratorRuntime().wrap(function _callee$(_context) {
        while (1) switch (_context.prev = _context.next) {
          case 0:
            code = sessionParams.code, user_uuid = sessionParams.user_uuid, preferences_unset = sessionParams.preferences_unset, action = sessionParams.action;
            if (!(!code || !user_uuid)) {
              _context.next = 3;
              break;
            }
            return _context.abrupt("return");
          case 3:
            if (!(preferences_unset !== "true" && action !== "manage-cookies")) {
              _context.next = 8;
              break;
            }
            _context.next = 6;
            return getConsentPreferences(code, user_uuid);
          case 6:
            result = _context.sent;
            if (result.success && result.data.preferences.consent) {
              setCookiesAcceptedCookie(result.data.preferences.consent);
            }
          case 8:
            setUserUuidCookie(user_uuid);
            clearUrlParameters();
          case 10:
          case "end":
            return _context.stop();
        }
      }, _callee);
    }));
    return function handleReturnFromSession() {
      return _ref.apply(this, arguments);
    };
  }();
  var renderNotification = function renderNotification(e) {
    var hasCode = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
    if (e) {
      e.preventDefault();
    }
    if (cookiePolicyContainer === null) {
      cookiePolicyContainer = document.createElement("dialog");
      cookiePolicyContainer.classList.add("cookie-policy");
      cookiePolicyContainer.setAttribute("open", true);
      document.body.appendChild(cookiePolicyContainer);
      var notifiation = new Notification(cookiePolicyContainer, renderManager, close, sessionParams, hasCode);
      notifiation.render(language);
      document.getElementById("cookie-policy-button-accept").focus();
    }
  };
  var renderManager = function renderManager() {
    var manager = new Manager(cookiePolicyContainer, close, sessionParams);
    manager.render(language);
  };
  var close = function close() {
    if (typeof callback === "function") {
      callback();
    }
    document.body.removeChild(cookiePolicyContainer);
    cookiePolicyContainer = null;
  };
  var handleRedirects = /*#__PURE__*/function () {
    var _ref2 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2() {
      var legacyUserId;
      return _regeneratorRuntime().wrap(function _callee2$(_context2) {
        while (1) switch (_context2.prev = _context2.next) {
          case 0:
            if (!isReturnFromSession(sessionParams)) {
              _context2.next = 4;
              break;
            }
            _context2.next = 3;
            return handleReturnFromSession();
          case 3:
            return _context2.abrupt("return", false);
          case 4:
            if (!redirectNeeded()) {
              _context2.next = 8;
              break;
            }
            legacyUserId = getLegacyUserId();
            redirectToSession({
              legacyUserId: legacyUserId
            });
            return _context2.abrupt("return", true);
          case 8:
            return _context2.abrupt("return", false);
          case 9:
          case "end":
            return _context2.stop();
        }
      }, _callee2);
    }));
    return function handleRedirects() {
      return _ref2.apply(this, arguments);
    };
  }();
  var init = function init() {
    if (initialised) return;
    initialised = true;

    // Add preferences to gtag from cookie, if available
    loadConsentFromCookie();
    var revokeButton = document.querySelector(".js-revoke-cookie-manager");
    if (revokeButton) {
      revokeButton.addEventListener("click", function (e) {
        e.preventDefault();
        var manageConsent = true;
        redirectToSession({
          manageConsent: manageConsent
        });
      });
    }
    if (preferenceNotSelected() && !hideSpecified() || sessionParams.action === "manage-cookies") {
      renderNotification();
    }
  };

  // INIT: First handle any redirects, then initialise the main logic
  handleRedirects().then(function (redirecting) {
    if (redirecting) {
      return;
    }

    // Check if DOM is already loaded (happens when returning from session)
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", init, false);
    } else {
      // DOM already loaded, call init immediately
      init();
    }
  });
};

export { cookiePolicy };
//# sourceMappingURL=module.js.map
