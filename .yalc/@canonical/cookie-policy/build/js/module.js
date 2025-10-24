function _classCallCheck(a, n) {
  if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function");
}
function _defineProperties(e, r) {
  for (var t = 0; t < r.length; t++) {
    var o = r[t];
    o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o);
  }
}
function _createClass(e, r, t) {
  return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", {
    writable: !1
  }), e;
}
function _defineProperty(e, r, t) {
  return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, {
    value: t,
    enumerable: !0,
    configurable: !0,
    writable: !0
  }) : e[r] = t, e;
}
function ownKeys(e, r) {
  var t = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    r && (o = o.filter(function (r) {
      return Object.getOwnPropertyDescriptor(e, r).enumerable;
    })), t.push.apply(t, o);
  }
  return t;
}
function _objectSpread2(e) {
  for (var r = 1; r < arguments.length; r++) {
    var t = null != arguments[r] ? arguments[r] : {};
    r % 2 ? ownKeys(Object(t), !0).forEach(function (r) {
      _defineProperty(e, r, t[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r));
    });
  }
  return e;
}
function _toPrimitive(t, r) {
  if ("object" != typeof t || !t) return t;
  var e = t[Symbol.toPrimitive];
  if (void 0 !== e) {
    var i = e.call(t, r || "default");
    if ("object" != typeof i) return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return ("string" === r ? String : Number)(t);
}
function _toPropertyKey(t) {
  var i = _toPrimitive(t, "string");
  return "symbol" == typeof i ? i : i + "";
}
function _typeof(o) {
  "@babel/helpers - typeof";

  return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) {
    return typeof o;
  } : function (o) {
    return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
  }, _typeof(o);
}

var controlsContent = [{
  id: 'essential',
  enableSwitcher: false,
  content: {
    default: {
      title: 'Strictly necessary',
      description: "These are cookies that are required to properly operate our website or provide necessary functions relating to the services you request. They include, for example, cookies enabling you to securely log into our website, subscribe to our services or make use of e-billing services. These cookies cannot be disabled."
    },
    zh: {
      title: '必要性',
      description: '启用网站核心功能，例如导航，访问安全区域，视频播放器和支付。没有这些cookie网站不能正常工作；它们仅可通过修改浏览器偏好设置禁用。'
    },
    ja: {
      title: 'エッセンシャル',
      description: '移動、保護されている情報へのアクセス、動画再生、支払など、サイトの基本的な機能が有効になります。これらのクッキーが有効になっていない（お使いのブラウザの設定を変更することによってクッキーが無効化されている）場合、サイトは正しく表示されません。'
    }
  }
}, {
  id: 'functionality',
  enableSwitcher: true,
  content: {
    default: {
      title: 'Functional',
      description: 'Recognises you when you return to our site. This enables us to personalise content, greet you by name, remember your preferences, and helps you share pages on social networks.'
    },
    zh: {
      title: '功能性',
      description: '当你返回到我们网站时能识别您。这使得我们能个性化内容，欢迎您，记住您的偏好设置，以及帮助您分享网页到社交媒体。'
    },
    ja: {
      title: '機能性',
      description: 'お客様がサイトを再訪問したときに、お客様であることを認識します。この設定では、お客様に合わせたコンテンツの表示、お客様のお名前を用いたあいさつメッセージの表示、お客様の傾向の記録を当社が行えるようになります。また、お客様がソーシャルネットワークでページをシェアできるようになります。'
    }
  }
}, {
  id: 'performance',
  enableSwitcher: true,
  content: {
    default: {
      title: 'Performance',
      description: 'Collects information on site usage, for example, which pages are most frequently visited.'
    },
    zh: {
      title: '表现性',
      description: '网站使用信息收集，例如哪些网页被频繁访问。'
    },
    ja: {
      title: 'パフォーマンス',
      description: 'サイトの利用状況に関する情報を収集します。例として、どのページの訪問頻度が高いかのような情報です。'
    }
  }
}];
var content = {
  default: {
    notification: {
      title: 'Privacy choices',
      body1: 'Our websites use cookies to enhance your user experience, remember your preferences, personalize content and ads, measure campaign effectiveness, and analyze site traffic. Some of these cookies transmit information to third parties. Our <a href="https://canonical.com/legal/data-privacy?cp=hide#cookies">Privacy Policy</a> provides more information about our cookie use and how you can update your choices.',
      body2: 'You can choose not to allow some types of cookies, by managing your preferences at any time:',
      buttonAccept: 'Accept all',
      buttonSave: 'Save preferences'
    },
    manager: {
      title: 'Tracking choices',
      body1: 'We use cookies to recognise visitors and remember your preferences.',
      body2: 'They enhance user experience, personalise content and ads, provide social media features, measure campaign effectiveness, and analyse site traffic.',
      body3: 'Select the types of trackers you consent to, both by us, and third parties.',
      body4: 'Learn more at <a href="https://ubuntu.com/legal/data-privacy?cp=hide#cookies">data privacy: cookie policy</a> - you can change your choices at any time from the footer of the site.',
      acceptAll: 'Accept all',
      acceptAllHelp: 'This will switch all toggles "ON".',
      SavePreferences: 'Save preferences'
    }
  },
  zh: {
    notification: {
      title: '您的追踪器设置',
      body1: '我们使用cookie和相似的方法来识别访问者和记住偏好设置。我们也用它们来衡量活动的效果和网站流量分析。',
      body2: '选择”接受“，您同意我们和受信的第三方来使用这些方式。',
      body3: '更多内容或者随时地变更您的同意选择，请点击我们的 <a href="https://ubuntu.com/legal/data-privacy?cp=hide#cookies">cookie策略</a>.',
      buttonAccept: '接受全部和访问网站',
      buttonSave: '管理您的追踪器设置'
    },
    manager: {
      title: '追踪选项',
      body1: '我们使用cookie来识别访问者和记住您的偏好设置',
      body2: '它们增强用户体验，使内容和广告个性化，提供社交媒体功能，衡量活动效果和网站流量分析。',
      body3: '选择您同意授予我们和受信的第三方的追踪类型。',
      body4: '点击<a href="https://ubuntu.com/legal/data-privacy?cp=hide#cookies">数据隐私：cookie策略</a>了解更多，您可以在网站底部随时更改您的选择。',
      acceptAll: '接受全部',
      acceptAllHelp: '这将把全部开关变为”开启“。',
      SavePreferences: '保存偏好设置'
    }
  },
  ja: {
    notification: {
      title: 'トラッキング機能の設定',
      body1: '当社は、当社のウェブサイトを訪問された方の識別や傾向の記録を行うために、クッキーおよび類似の手法を利用します。また、キャンペーンの効果の測定やサイトのトラフィックの分析にもクッキーを利用します。',
      body2: '「同意」を選択すると、当社および信頼できる第三者による上記の手法の利用に同意したものとみなされます。',
      body3: '詳細または同意の変更については、いつでも当社の<a href="https://ubuntu.com/legal/data-privacy?cp=hide#cookies">クッキーに関するポリシー</a>をご覧になることができます。',
      buttonAccept: 'すべて同意してサイトにアクセス',
      buttonSave: 'トラッキング機能の設定の管理'
    },
    manager: {
      title: 'トラッキング機能の選択',
      body1: '当社は、当社のウェブサイトを訪問された方の識別や傾向の記録を行うために、クッキーを利用します。',
      body2: 'クッキーは、お客様の利便性の向上、お客様に合わせたコンテンツや広告の表示、ソーシャルメディア機能の提供、キャンペーンの効果の測定、サイトのトラフィックの分析に役立ちます。',
      body3: '当社および第三者によるトラッキング機能のタイプから、お客様が同意されるものをお選びください。',
      body4: '詳細は、<a href="https://ubuntu.com/legal/data-privacy?cp=hide#cookies">データプライバシー：クッキーに関するポリシー</a>をご覧ください。お客様が選んだ設定は、本サイトの下部からいつでも変更できます。',
      acceptAll: 'すべて同意',
      acceptAllHelp: '同意されるとすべての設定が「ON」に切り替わります。',
      SavePreferences: '設定を保存'
    }
  }
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
var setCookie = function setCookie(value) {
  var d = new Date();
  d.setTime(d.getTime() + 365 * 24 * 60 * 60 * 1000);
  var expires = "expires=" + d.toUTCString();
  var samesite = "samesite=lax;";
  var path = "path=/;";
  document.cookie = "_cookies_accepted=" + value + "; " + expires + "; " + samesite + path;
  if (enabledTracking(value)) {
    pushPageview();
  }
};
var getCookie = function getCookie() {
  var toMatch = "_cookies_accepted=";
  var splitArray = document.cookie.split(";");
  var cookieValue = "";
  var currentCookieValue = "";
  for (var i = 0; i < splitArray.length; i++) {
    var cookie = splitArray[i];
    while (cookie.charAt(0) == " ") {
      cookie = cookie.substring(1);
    }
    currentCookieValue = cookie.substring(toMatch.length, cookie.length);
    if (cookie.indexOf(toMatch) === 0 && currentCookieValue !== "true") {
      cookieValue = currentCookieValue;
    }
  }
  return cookieValue;
};
var preferenceNotSelected = function preferenceNotSelected() {
  var cookieValue = getCookie();
  // Skip a value of "true" to override old existing cookies
  if (cookieValue && cookieValue != "true") {
    return false;
  } else {
    return true;
  }
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
  var cookieValue = getCookie();
  cookieValue && setGoogleConsentPreferences(cookieValue);
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
var pushPageview = function pushPageview() {
  if ((typeof dataLayer === "undefined" ? "undefined" : _typeof(dataLayer)) === "object") {
    dataLayer.push({
      event: "pageview"
    });
  }
};
var enabledTracking = function enabledTracking(selectedPreference) {
  if (selectedPreference == "all" || selectedPreference == "performance") {
    return true;
  } else {
    return false;
  }
};

/**
  Toggles the necessary aria- attributes' values on the accordion panels
  and handles to show or hide them.
  @param {HTMLElement} element The tab that acts as the handles.
  @param {Boolean} show Whether to show or hide the accordion panel.
*/
function toggleExpanded(element, show) {
  var target = document.getElementById(element.getAttribute('aria-controls'));
  if (target) {
    element.setAttribute('aria-expanded', show);
    target.setAttribute('aria-hidden', !show);
  }
}

/**
  Attaches event listeners for the accordion open and close click events.
  @param {HTMLElement} accordionContainer The accordion container element.
*/
var setupAccordion = function setupAccordion(accordionContainer) {

  // Set up an event listener on the container so that panels can be added
  // and removed and events do not need to be managed separately.
  accordionContainer.addEventListener('click', function (event) {
    var target = event.target;
    if (target.closest) {
      target = target.closest('[class*="p-accordion__tab"]');
    }
    if (target) {
      var isTargetOpen = target.getAttribute('aria-expanded') === 'true';

      // Toggle visibility of the target panel.
      toggleExpanded(target, !isTargetOpen);
    }
  });
};

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
  return _createClass(Control, [{
    key: "render",
    value: function render() {
      var isChecked = this.cookieIsTrue();
      var control = document.createElement("div");
      control.innerHTML = "\n    <li class=\"controls p-accordion__group\">                \n      <div role=\"heading\" aria-level=\"3\" class=\"p-accordion__heading\">\n        <button type=\"button\" class=\"p-accordion__tab\" id=\"".concat(this.id, "-tab\" aria-controls=\"").concat(this.id, "-section\" aria-expanded=\"false\">\n          <span class=\"p-heading--5\">").concat(this.title, "</span>\n          ").concat(!this.enableSwitcher ? "<p class=\"u-text--muted u-float-right u-no-margin--bottom u-no-padding--top\">Always active</p>" : "\n            ".concat("<label class=\"u-float-right u-no-margin--bottom p-switch\">\n              <input type=\"checkbox\" class=\"p-switch__input js-".concat(this.id, "-switch\" ").concat((isChecked || !this.enableSwitcher) && 'checked="" ', "\n                ").concat(!this.enableSwitcher && "disabled=\"disabled\"", ">            \n              <span class=\"p-switch__slider\"></span>\n            </label>\n            "), "\n        "), "\n        </button>\n        \n      </div>\n      <section class=\"p-accordion__panel\" id=\"").concat(this.id, "-section\" aria-hidden=\"true\" aria-labelledby=\"").concat(this.id, "-tab\">\n        <p>").concat(this.description, "</p>\n      </section>\n    </li>\n    <hr class=\"p-rule--muted\"/>\n    ");
      this.container.appendChild(control);
      this.element = control.querySelector(".js-".concat(this.id, "-switch"));
    }
  }, {
    key: "cookieIsTrue",
    value: function cookieIsTrue() {
      var cookieValue = getCookie();

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
}();

var Notification = /*#__PURE__*/function () {
  function Notification(container, destroyComponent) {
    _classCallCheck(this, Notification);
    this.container = container;
    this.destroyComponent = destroyComponent;
    this.controlsStore = [];
  }
  return _createClass(Notification, [{
    key: "getNotificationMarkup",
    value: function getNotificationMarkup(language) {
      var notificationContent = getContent(language);
      var notification = "\n      <div class=\"p-modal\" id=\"modal\">\n        <section class=\"p-modal__dialog\" role=\"dialog\" aria-labelledby=\"cookie-policy-title\" aria-describedby=\"cookie-policy-content\">\n          <header class=\"p-modal__header\">\n            <h2 class=\"p-modal__title p-heading--4\" id=\"cookie-policy-title\">".concat(notificationContent.notification.title, "</h2>\n          </header>\n          <div id=\"cookie-policy-content\">\n            <p>").concat(notificationContent.notification.body1, "</p>\n            <p>").concat(notificationContent.notification.body2, "</p>\n            ").concat(notificationContent.body3 ? "<p>".concat(notificationContent.body3, "</p>") : '', "\n            <aside class=\"p-accordion\">\n              <ul class=\"p-accordion__list controls\">\n              </ul>\n            </aside>\n            <p class=\"u-no-margin--bottom u-float-right\">\n              <button class=\"p-button--positive js-close\" id=\"cookie-policy-button-accept\">").concat(notificationContent.notification.buttonAccept, "</button>\n              <button class=\"p-button js-save-preferences\">").concat(notificationContent.notification.buttonSave, "</button>\n            </p>\n          </div>\n        </section>\n      </div>");
      return notification;
    }
  }, {
    key: "render",
    value: function render(language) {
      var _this = this;
      this.container.innerHTML = this.getNotificationMarkup(language);
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
      this.container.querySelector(".js-close").addEventListener("click", function (e) {
        setCookie("all");
        setGoogleConsentPreferences("all");
        _this2.destroyComponent();
      });

      // Setup all accordions on the page
      var accordions = document.querySelectorAll('.p-accordion');
      for (var i = 0, l = accordions.length; i < l; i++) {
        setupAccordion(accordions[i]);
      }
      this.container.querySelector(".js-save-preferences").addEventListener("click", function () {
        _this2.savePreferences();
        _this2.destroyComponent();
      });
    }
  }, {
    key: "savePreferences",
    value: function savePreferences() {
      var checkedControls = this.controlsStore.filter(function (control) {
        return control.isChecked();
      });

      // "essential" is the default value for only essential cookies
      if (this.controlsStore.length - 1 === checkedControls.length) {
        setCookie("all");
      } else if (checkedControls.length === 0) {
        setCookie("essential");
      } else {
        this.controlsStore.forEach(function (control) {
          if (control.isChecked()) {
            // Note: this overwrites the previous cookie
            setCookie(control.getId());
          }
        });
      }
      setGoogleConsentFromControls(this.controlsStore);
    }
  }]);
}();

// Add Google Consent Mode as soon as the script is loaded
addGoogleConsentMode();
var cookiePolicy = function cookiePolicy() {
  var callback = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
  var cookiePolicyContainer = null;
  var language = document.documentElement.lang;
  var initialised = false;
  var renderNotification = function renderNotification(e) {
    if (e) {
      e.preventDefault();
    }
    if (cookiePolicyContainer === null) {
      cookiePolicyContainer = document.createElement("dialog");
      cookiePolicyContainer.classList.add("cookie-policy");
      cookiePolicyContainer.setAttribute("open", true);
      document.body.appendChild(cookiePolicyContainer);
      var notification = new Notification(cookiePolicyContainer, close);
      notification.render(language);
      document.getElementById("cookie-policy-button-accept").focus();
    }
  };
  var close = function close() {
    if (typeof callback === "function") {
      callback();
    }
    document.body.removeChild(cookiePolicyContainer);
    cookiePolicyContainer = null;
  };
  var init = function init() {
    if (initialised) return;
    initialised = true;

    // Load the consent from the cookie, if available
    loadConsentFromCookie();
    var revokeButton = document.querySelector(".js-revoke-cookie-manager");
    if (revokeButton) {
      revokeButton.addEventListener("click", renderNotification);
    }
    if (preferenceNotSelected() && !hideSpecified()) {
      renderNotification();
    }
  };
  if (document.readyState === "loading") {
    // If the document is still loading, listen for DOMContentLoaded
    document.addEventListener("DOMContentLoaded", init, false);
  } else {
    // Otherwise the script was triggered after the document was loaded, so we can run it immediately
    init();
  }
};

export { cookiePolicy };
//# sourceMappingURL=module.js.map
