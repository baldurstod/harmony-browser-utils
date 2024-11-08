function SaveFile(file) {
    var link = document.createElement('a');
    link.setAttribute('href', URL.createObjectURL(file));
    link.setAttribute('download', file.name);
    link.click();
}

const closeSVG = '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" fill="currentColor"><path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"/></svg>';

const contentCopySVG = '<svg height="24" viewBox="0 -960 960 960" width="24" fill="currentColor"><path d="M360-240q-33 0-56.5-23.5T280-320v-480q0-33 23.5-56.5T360-880h360q33 0 56.5 23.5T800-800v480q0 33-23.5 56.5T720-240H360Zm0-80h360v-480H360v480ZM200-80q-33 0-56.5-23.5T120-160v-560h80v560h440v80H200Zm160-240v-480 480Z"/></svg>';

function createElement(tagName, options) {
    const element = document.createElement(tagName);
    createElementOptions(element, options);
    return element;
}
function createShadowRoot(tagName, options, mode = 'closed') {
    const element = document.createElement(tagName);
    const shadowRoot = element.attachShadow({ mode: mode });
    createElementOptions(element, options, shadowRoot);
    return shadowRoot;
}
function append(element, child) {
    if (child === null || child === undefined) {
        return;
    }
    if (child instanceof ShadowRoot) {
        element.append(child.host);
    }
    else {
        element.append(child);
    }
}
function createElementOptions(element, options, shadowRoot) {
    if (options) {
        for (const optionName in options) {
            const optionValue = options[optionName];
            switch (optionName) {
                case 'class':
                    element.classList.add(...optionValue.split(' '));
                    break;
                case 'i18n':
                    element.setAttribute('data-i18n', optionValue);
                    element.innerHTML = optionValue;
                    element.classList.add('i18n');
                    break;
                case 'i18n-title':
                    element.setAttribute('data-i18n-title', optionValue);
                    element.classList.add('i18n-title');
                    break;
                case 'i18n-placeholder':
                    element.setAttribute('data-i18n-placeholder', optionValue);
                    element.classList.add('i18n-placeholder');
                    break;
                case 'i18n-label':
                    element.setAttribute('data-i18n-label', optionValue);
                    element.classList.add('i18n-label');
                    break;
                case 'i18n-json':
                    element.setAttribute('data-i18n-json', JSON.stringify(optionValue));
                    element.classList.add('i18n');
                    break;
                case 'i18n-values':
                    element.setAttribute('data-i18n-values', JSON.stringify(optionValue));
                    element.classList.add('i18n');
                    break;
                case 'parent':
                    optionValue.append(element);
                    break;
                case 'child':
                    append(shadowRoot ?? element, optionValue);
                    break;
                case 'childs':
                    optionValue.forEach((entry) => append(shadowRoot ?? element, entry));
                    break;
                case 'events':
                    for (let eventType in optionValue) {
                        let eventParams = optionValue[eventType];
                        if (typeof eventParams === 'function') {
                            element.addEventListener(eventType, eventParams);
                        }
                        else {
                            element.addEventListener(eventType, eventParams.listener, eventParams.options);
                        }
                    }
                    break;
                case 'hidden':
                    if (optionValue) {
                        hide(element);
                    }
                    break;
                case 'attributes':
                    for (let attributeName in optionValue) {
                        element.setAttribute(attributeName, optionValue[attributeName]);
                    }
                    break;
                case 'list':
                    element.setAttribute(optionName, optionValue);
                    break;
                case 'adoptStyle':
                    adoptStyleSheet(shadowRoot ?? element, optionValue);
                    break;
                case 'adoptStyles':
                    optionValue.forEach((entry) => {
                        adoptStyleSheet(shadowRoot ?? element, entry);
                    });
                    break;
                default:
                    if (optionName.startsWith('data-')) {
                        element.setAttribute(optionName, optionValue);
                    }
                    else {
                        element[optionName] = optionValue;
                    }
                    break;
            }
        }
        options.elementCreated?.(element, shadowRoot);
    }
}
async function adoptStyleSheet(element, cssText) {
    const sheet = new CSSStyleSheet;
    await sheet.replace(cssText);
    if (element.adoptStyleSheet) {
        element.adoptStyleSheet(sheet);
    }
    else {
        if (element.adoptedStyleSheets) {
            element.adoptedStyleSheets.push(sheet);
        }
    }
}
function display(htmlElement, visible) {
    if (htmlElement == undefined) {
        return;
    }
    if (htmlElement instanceof ShadowRoot) {
        htmlElement = htmlElement.host;
    }
    if (visible) {
        htmlElement.style.display = '';
    }
    else {
        htmlElement.style.display = 'none';
    }
}
function show(htmlElement) {
    display(htmlElement, true);
}
function hide(htmlElement) {
    display(htmlElement, false);
}

const I18N_DELAY_BEFORE_REFRESH = 100;
class I18n {
    static #lang = 'english';
    static #translations = new Map();
    static #executing = false;
    static #refreshTimeout;
    static #observerConfig = { childList: true, subtree: true, attributeFilter: ['i18n', 'data-i18n-json', 'data-i18n-values'] };
    static #observer;
    static #observed = new Set();
    static start() {
        this.observeElement(document.body);
    }
    static setOptions(options) {
        if (options.translations) {
            for (let translation of options.translations) {
                this.addTranslation(translation);
            }
        }
        this.i18n();
    }
    static addTranslation(translation) {
        this.#translations.set(translation.lang, translation);
    }
    static #initObserver() {
        if (this.#observer) {
            return;
        }
        const callback = async (mutationsList, observer) => {
            for (let mutation of mutationsList) {
                if (mutation.type === 'childList') {
                    for (let node of mutation.addedNodes) {
                        if (node instanceof HTMLElement) {
                            this.updateElement(node);
                        }
                    }
                }
                else if (mutation.type === 'attributes') {
                    this.updateElement(mutation.target);
                }
            }
        };
        this.#observer = new MutationObserver(callback);
    }
    static observeElement(element) {
        this.#observed.add(element);
        this.#initObserver();
        this.#observer?.observe(element, this.#observerConfig);
        this.updateElement(element);
    }
    static #processList(parentNode, className, attribute, subElement) {
        const elements = parentNode.querySelectorAll('.' + className);
        if (parentNode.classList?.contains(className)) {
            this.#processElement(parentNode, attribute, subElement);
        }
        for (let element of elements) {
            this.#processElement(element, attribute, subElement);
        }
    }
    static #processJSON(parentNode) {
        const className = 'i18n';
        const elements = parentNode.querySelectorAll('.' + className);
        if (parentNode.classList?.contains(className)) {
            this.#processElementJSON(parentNode);
        }
        for (let element of elements) {
            this.#processElementJSON(element);
        }
    }
    static #processElement(htmlElement, attribute, subElement) {
        let dataLabel = htmlElement.getAttribute(attribute);
        if (dataLabel) {
            htmlElement[subElement] = this.getString(dataLabel);
        }
    }
    static #processElementJSON(htmlElement) {
        const str = htmlElement.getAttribute('data-i18n-json');
        if (!str) {
            return;
        }
        const dataJSON = JSON.parse(str);
        if (!dataJSON) {
            return;
        }
        let valuesJSON;
        const values = htmlElement.getAttribute('data-i18n-values');
        if (values) {
            valuesJSON = JSON.parse(values);
        }
        else {
            valuesJSON = dataJSON.values;
        }
        const innerHTML = dataJSON.innerHTML;
        if (innerHTML) {
            htmlElement.innerHTML = this.formatString(innerHTML, valuesJSON);
        }
    }
    static i18n() {
        if (!this.#refreshTimeout) {
            this.#refreshTimeout = setTimeout(() => this.#i18n(), I18N_DELAY_BEFORE_REFRESH);
        }
    }
    static #i18n() {
        this.#refreshTimeout = null;
        if (this.#executing) {
            return;
        }
        this.#executing = true;
        for (const element of this.#observed) {
            this.#processList(element, 'i18n', 'data-i18n', 'innerHTML');
            this.#processList(element, 'i18n-title', 'data-i18n-title', 'title');
            this.#processList(element, 'i18n-placeholder', 'data-i18n-placeholder', 'placeholder');
            this.#processList(element, 'i18n-label', 'data-i18n-label', 'label');
            this.#processJSON(element);
        }
        this.#executing = false;
        return;
    }
    static updateElement(htmlElement) {
        this.#processList(htmlElement, 'i18n', 'data-i18n', 'innerHTML');
        this.#processList(htmlElement, 'i18n-title', 'data-i18n-title', 'title');
        this.#processList(htmlElement, 'i18n-placeholder', 'data-i18n-placeholder', 'placeholder');
        this.#processList(htmlElement, 'i18n-label', 'data-i18n-label', 'label');
        this.#processJSON(htmlElement);
    }
    static set lang(lang) {
        throw 'Deprecated, use setLang() instead';
    }
    static setLang(lang) {
        if (this.#lang != lang) {
            this.#lang = lang;
            this.i18n();
        }
    }
    static getString(s) {
        const strings = this.#translations.get(this.#lang)?.strings;
        if (strings) {
            let s2 = strings[s];
            if (typeof s2 == 'string') {
                return s2;
            }
            else {
                console.warn('Missing translation for key ' + s);
                return s;
            }
        }
        return s;
    }
    static formatString(s, values) {
        let str = this.getString(s);
        for (let key in values) {
            str = str.replace(new RegExp("\\\${" + key + "\\}", "gi"), values[key]);
        }
        return str;
    }
    static get authors() {
        throw 'Deprecated, use getAuthors() instead';
    }
    static getAuthors() {
        return this.#translations.get(this.#lang)?.authors ?? [];
    }
}

var ManipulatorDirection;
(function (ManipulatorDirection) {
    ManipulatorDirection["All"] = "all";
    ManipulatorDirection["X"] = "x";
    ManipulatorDirection["Y"] = "y";
    ManipulatorDirection["None"] = "none";
})(ManipulatorDirection || (ManipulatorDirection = {}));
var ManipulatorCorner;
(function (ManipulatorCorner) {
    ManipulatorCorner[ManipulatorCorner["None"] = -1] = "None";
    ManipulatorCorner[ManipulatorCorner["TopLeft"] = 0] = "TopLeft";
    ManipulatorCorner[ManipulatorCorner["TopRight"] = 1] = "TopRight";
    ManipulatorCorner[ManipulatorCorner["BottomLeft"] = 2] = "BottomLeft";
    ManipulatorCorner[ManipulatorCorner["BottomRight"] = 3] = "BottomRight";
})(ManipulatorCorner || (ManipulatorCorner = {}));
var ManipulatorSide;
(function (ManipulatorSide) {
    ManipulatorSide[ManipulatorSide["None"] = -1] = "None";
    ManipulatorSide[ManipulatorSide["Top"] = 0] = "Top";
    ManipulatorSide[ManipulatorSide["Bottom"] = 1] = "Bottom";
    ManipulatorSide[ManipulatorSide["Left"] = 2] = "Left";
    ManipulatorSide[ManipulatorSide["Right"] = 3] = "Right";
})(ManipulatorSide || (ManipulatorSide = {}));

var notificationManagerCSS = ":host, .notification-manager{\r\n\tposition: absolute;\r\n\tz-index: 100;\r\n\tbottom: 0px;\r\n\twidth: 100%;\r\n\tdisplay: flex;\r\n\tflex-direction: column-reverse;\r\n\tmax-height: 50%;\r\n\toverflow-y: auto;\r\n}\r\n.notification-manager-notification{\r\n\tbackground-color: var(--theme-popup-bg-color);\r\n\tcolor: var(--theme-text-color);\r\n\tfont-size: 1.5em;\r\n\tpadding: 4px;\r\n\tdisplay: flex;\r\n\talign-items: center;\r\n}\r\n.notification-manager-notification-content{\r\n\toverflow: auto;\r\n\tflex: 1;\r\n\tmax-width: calc(100% - 20px);\r\n}\r\n.notification-manager-notification-close{\r\n\tfill: currentColor;\r\n\tcursor: pointer;\r\n}\r\n.notification-manager-notification-copy{\r\n\tfill: currentColor;\r\n\tcursor: pointer;\r\n\ttransition: all 0.3s ease-in 0s;\r\n}\r\n.notification-manager-notification-copy-success{\r\n\ttransform: rotate(1turn);\r\n}\r\n.notification-manager-notification-close > svg{\r\n\twidth: 20px;\r\n\tmargin: 5px;\r\n}\r\n.notification-manager-notification-success{\r\n\tbackground-color: #5aa822ff;\r\n}\r\n.notification-manager-notification-warning{\r\n\tbackground-color: #c78a17ff;\r\n}\r\n.notification-manager-notification-error{\r\n\tbackground-color: #c71717ff;\r\n}\r\n.notification-manager-notification-info{\r\n\tbackground-color: #2e88e8ff;\r\n}\r\n";

const NOTIFICATION_CLASSNAME = 'notification-manager-notification';
class Notification {
    #htmlElement;
    timeout = 0;
    content;
    type;
    constructor(content, type, ttl) {
        this.content = content;
        this.type = type;
        this.setTtl(ttl);
    }
    setTtl(ttl) {
        if (ttl) {
            clearTimeout(this.timeout);
            this.timeout = setTimeout(() => NotificationManager.closeNofication(this), ttl * 1000);
        }
    }
    get view() {
        if (!this.#htmlElement) {
            let htmlElementContent;
            this.#htmlElement = createElement('div', {
                className: NOTIFICATION_CLASSNAME,
                childs: [
                    htmlElementContent = createElement('div', {
                        className: NOTIFICATION_CLASSNAME + '-content',
                    }),
                    createElement('div', {
                        className: NOTIFICATION_CLASSNAME + '-copy',
                        innerHTML: contentCopySVG,
                        events: {
                            click: async (event) => {
                                try {
                                    if (this.#htmlElement) {
                                        await navigator.clipboard.writeText(this.#htmlElement.innerText);
                                        event.target.parentElement?.classList.toggle(NOTIFICATION_CLASSNAME + '-copy-success');
                                    }
                                }
                                catch (e) {
                                    console.error(e);
                                }
                            },
                        }
                    }),
                    createElement('div', {
                        className: NOTIFICATION_CLASSNAME + '-close',
                        innerHTML: closeSVG,
                        events: {
                            click: () => NotificationManager.closeNofication(this),
                        }
                    }),
                ]
            });
            if (this.type) {
                this.#htmlElement.classList.add(NOTIFICATION_CLASSNAME + '-' + this.type);
            }
            if (this.content instanceof HTMLElement) {
                htmlElementContent.append(this.content);
            }
            else {
                htmlElementContent.innerHTML = this.content;
            }
        }
        return this.#htmlElement;
    }
}
class NotificationManager {
    //static #htmlElement: HTMLElement;
    static #htmlParent = document.body;
    static #shadowRoot;
    static #nofifications = new Set();
    static {
        this.#createHtml();
    }
    static setParent(htmlParent) {
        this.#htmlParent = htmlParent;
        this.#htmlParent.append(this.#shadowRoot.host);
    }
    static #createHtml() {
        this.#shadowRoot = createShadowRoot('div', {
            class: 'notification-manager',
            parent: this.#htmlParent,
            adoptStyle: notificationManagerCSS,
        });
        //this.#shadowRoot = this.#htmlElement.attachShadow({ mode: 'closed' });
        //shadowRootStyle(this.#shadowRoot, notificationManagerCSS);
        I18n.observeElement(this.#shadowRoot);
    }
    static #getNotification(content, type, ttl) {
        for (let notification of this.#nofifications) {
            if ((notification.content == content) && (notification.type == type)) {
                notification.setTtl(ttl);
                return notification;
            }
        }
        return new Notification(content, type, ttl);
    }
    static addNotification(content, type, ttl) {
        let notification = this.#getNotification(content, type, ttl);
        this.#nofifications.add(notification);
        this.#shadowRoot.append(notification.view);
    }
    static closeNofication(notification) {
        this.#nofifications.delete(notification);
        notification.view.remove();
    }
}

/**
 * Common utilities
 * @module glMatrix
 */
var ARRAY_TYPE = typeof Float32Array !== 'undefined' ? Float32Array : Array;
if (!Math.hypot) Math.hypot = function () {
  var y = 0,
      i = arguments.length;

  while (i--) {
    y += arguments[i] * arguments[i];
  }

  return Math.sqrt(y);
};

/**
 * 2 Dimensional Vector
 * @module vec2
 */

/**
 * Creates a new, empty vec2
 *
 * @returns {vec2} a new 2D vector
 */

function create() {
  var out = new ARRAY_TYPE(2);

  if (ARRAY_TYPE != Float32Array) {
    out[0] = 0;
    out[1] = 0;
  }

  return out;
}
/**
 * Creates a new vec2 initialized with the given values
 *
 * @param {Number} x X component
 * @param {Number} y Y component
 * @returns {vec2} a new 2D vector
 */

function fromValues(x, y) {
  var out = new ARRAY_TYPE(2);
  out[0] = x;
  out[1] = y;
  return out;
}
/**
 * Perform some operation over an array of vec2s.
 *
 * @param {Array} a the array of vectors to iterate over
 * @param {Number} stride Number of elements between the start of each vec2. If 0 assumes tightly packed
 * @param {Number} offset Number of elements to skip at the beginning of the array
 * @param {Number} count Number of vec2s to iterate over. If 0 iterates over entire array
 * @param {Function} fn Function to call for each vector in the array
 * @param {Object} [arg] additional argument to pass to fn
 * @returns {Array} a
 * @function
 */

(function () {
  var vec = create();
  return function (a, stride, offset, count, fn, arg) {
    var i, l;

    if (!stride) {
      stride = 2;
    }

    if (!offset) {
      offset = 0;
    }

    if (count) {
      l = Math.min(count * stride + offset, a.length);
    } else {
      l = a.length;
    }

    for (i = offset; i < l; i += stride) {
      vec[0] = a[i];
      vec[1] = a[i + 1];
      fn(vec, vec, arg);
      a[i] = vec[0];
      a[i + 1] = vec[1];
    }

    return a;
  };
})();

var optionsManagerCSS = ":host{\r\n\tposition: absolute;\r\n\twidth: 100%;\r\n\theight: 100%;\r\n\toverflow: auto;\r\n\tz-index: 10000;\r\n\tdisplay: flex;\r\n\talign-items: center;\r\n\tjustify-content: center;\r\n\ttop:0px;\r\n\tleft: 0px;\r\n}\r\n\r\n#options-manager-inner{\r\n\tposition: relative;\r\n\t/*background-color: rgba(255, 255, 255, 1.0);*/\r\n\tbackground-color: var(--theme-popup-bg-color);\r\n\tcolor: var(--main-text-color-dark2);\r\n\tpadding:10px;\r\n\toverflow: hidden;\r\n\tmax-height: 70%;\r\n\tmax-width: 75%;\r\n\tdisplay: flex;\r\n\tflex-direction: column;\r\n\topacity: 0.9;\r\n}\r\n\r\n#options-manager-inner h1{\r\n\ttext-transform: capitalize;\r\n\ttext-align: center;\r\n}\r\n\r\n#options-manager-inner-filter{\r\n\twidth:100%;\r\n}\r\n\r\n.options-manager-button{\r\n\tcursor:pointer;\r\n\twhite-space: nowrap;\r\n\ttext-transform: capitalize;\r\n}\r\n\r\n#options-manager-inner table{\r\n\ttext-align: left;\r\n\toverflow: hidden auto;\r\n\tdisplay: block;\r\n\theight: 100%;\r\n}\r\n\r\n#options-manager-inner thead{\r\n\tposition: sticky;\r\n\t/*display: block;*/\r\n\ttop: 0px;\r\n\tbackground-color: var(--theme-popup-bg-color);\r\n}\r\n\r\n#options-manager-inner thead th{\r\n\tposition: sticky;\r\n\ttop: 0px;\r\n\tbackground-color: var(--theme-popup-bg-color);\r\n}\r\n\r\n#options-manager-inner th{\r\n\ttext-transform: capitalize;\r\n}\r\n\r\n#options-manager-inner th button, #options-manager-inner td button{\r\n\twidth: 100%;\r\n}\r\n\r\n#options-manager-title{\r\n\tcursor:move;\r\n}\r\n\r\n[draggable=true] {\r\n\tcursor: move;\r\n}\r\n\r\n[draggable=true] *{\r\n\tcursor: initial;\r\n}\r\n\r\n#options-manager-outer kbd{\r\n\tbackground-color: #eee;\r\n\tborder-radius: 0.25rem;\r\n\tborder: 0.1rem solid #b4b4b4;\r\n\tbox-shadow: 0 0.06rem 0.06rem rgba(0, 0, 0, .2), 0 0.1rem 0 0 rgba(255, 255, 255, .7) inset;\r\n\tcolor: #333;\r\n\tdisplay: inline-block;\r\n\tline-height: 1;\r\n\tpadding: 0.15rem;\r\n\twhite-space: nowrap;\r\n\tfont-weight: 1000;\r\n\tfont-size: 1.3rem;\r\n}\r\n";

class OptionsManager extends EventTarget {
    static #instance;
    #defaultValues = new Map();
    #currentValues = new Map();
    #categories = new Map();
    #dirtyCategories = true;
    #initPromiseResolve;
    #initPromise = new Promise((resolve) => this.#initPromiseResolve = resolve);
    #currentFilter = '';
    #optionsManagerRows = new Set();
    #htmlOptionsTable;
    #htmlOptionsManagerContentThead;
    #uniqueId = 0;
    #shadowRoot;
    logException = false;
    constructor() {
        if (OptionsManager.#instance) {
            return OptionsManager.#instance;
        }
        super();
        OptionsManager.#instance = this;
        this.#defaultValues[Symbol.iterator] = function* () {
            yield* [...this.entries()].sort((a, b) => { return a[0] < b[0] ? -1 : 1; });
        };
    }
    async init(parameters) {
        if (parameters.url) {
            await this.#initFromURL(parameters.url);
        }
        else if (parameters.json) {
            this.#initFromJSON(parameters.json);
        }
    }
    async #initFromURL(url) {
        let response = await fetch(url);
        this.#initFromJSON(await response.json());
    }
    #initFromJSON(json) {
        if (json) {
            if (json.categories) {
                json.categories.forEach((category) => this.#addCategory(category));
            }
            this.#addCategory('');
            if (json.options) {
                json.options.forEach((option /*TODO:better type*/) => this.addOption(option));
            }
            if (this.#initPromiseResolve) {
                this.#initPromiseResolve();
            }
        }
    }
    #addCategory(name) {
        this.#categories.set(name.toLowerCase(), []);
        this.#dirtyCategories = true;
    }
    #refreshCategories() {
        if (this.#dirtyCategories) {
            for (let [categoryName, category] of this.#categories) {
                category.length = 0;
            }
            for (let [optionName, option] of this.#defaultValues) {
                let maxLength = -1;
                let cat = null;
                for (let [categoryName, category] of this.#categories) {
                    if (categoryName.length > maxLength) {
                        if (optionName.startsWith(categoryName) || categoryName === '') {
                            maxLength = categoryName.length;
                            cat = category;
                        }
                    }
                }
                if (cat !== null) {
                    cat.push(option);
                }
            }
        }
        this.#dirtyCategories = false;
    }
    addOption(option /*TODO:better type*/) {
        if (!option) {
            return;
        }
        let name = option.name.toLowerCase();
        let type = option.type;
        let defaultValue = option.default;
        let datalist = option.datalist;
        let editable = option.editable;
        let dv = this.#defaultValues.get(name) || { name: '', editable: false, type: '', dv: '' };
        this.#defaultValues.set(name, dv);
        dv.name = name;
        if (type !== undefined) {
            dv.type = type;
        }
        if (defaultValue !== undefined) {
            dv.dv = defaultValue;
        }
        if (datalist !== undefined) {
            dv.datalist = datalist;
        }
        if (editable !== undefined) {
            dv.editable = editable;
        }
        try {
            if (typeof localStorage != 'undefined') {
                let value = this.getItem(name);
                if (value === undefined) {
                    this.setItem(name, defaultValue);
                }
                else {
                    this.setItem(name, value);
                }
            }
        }
        catch (exception) {
            if (this.logException) {
                console.error(exception);
            }
        }
    }
    setItem(name, value) {
        try {
            if (typeof localStorage != 'undefined') {
                localStorage.setItem(name, JSON.stringify(value));
                if (this.#currentValues.has(name)) {
                    if (value == this.#currentValues.get(name)) {
                        return;
                    }
                }
                this.#currentValues.set(name, value);
                this.#valueChanged(name, value);
            }
        }
        catch (exception) {
            if (this.logException) {
                console.error(exception);
            }
        }
    }
    getSubItem(name, subName) {
        try {
            let map = this.#currentValues.get(name) ?? {};
            if (map && (typeof map == 'object')) {
                return map[subName];
            }
        }
        catch (exception) {
            if (this.logException) {
                console.error(exception);
            }
        }
    }
    async setSubItem(name, subName, value) {
        try {
            let option = await this.getOption(name);
            if (option && option.type == 'map') {
                let map = this.#currentValues.get(name) ?? {};
                if (map[subName] == value) {
                    return;
                }
                map[subName] = value;
                this.#valueChanged(name, map);
                localStorage.setItem(name, JSON.stringify(map));
            }
        }
        catch (exception) {
            if (this.logException) {
                console.error(exception);
            }
        }
    }
    removeSubItem(name, subName) {
        try {
            let map = this.#currentValues.get(name) ?? {};
            if (map && (typeof map == 'object')) {
                delete map[subName];
                this.#valueChanged(name, map);
                localStorage.setItem(name, JSON.stringify(map));
            }
        }
        catch (exception) {
            if (this.logException) {
                console.error(exception);
            }
        }
    }
    #valueChanged(name, value) {
        this.dispatchEvent(new CustomEvent(name, { detail: { name: name, value: value } }));
        let lastIndex = name.lastIndexOf('.');
        while (lastIndex != -1) {
            let wildCardName = name.slice(0, lastIndex);
            this.dispatchEvent(new CustomEvent(wildCardName + '.*', { detail: { name: name, value: value } }));
            lastIndex = name.lastIndexOf('.', lastIndex - 1);
        }
        this.dispatchEvent(new CustomEvent('*', { detail: { name: name, value: value } }));
    }
    getItem(name) {
        try {
            if (typeof localStorage != 'undefined') {
                let value = localStorage.getItem(name);
                if (value) {
                    let parsedValue = JSON.parse(value);
                    return parsedValue;
                }
            }
        }
        catch (exception) {
            if (this.logException) {
                console.error(exception);
            }
        }
        if (this.#defaultValues.get(name)) {
            return this.#defaultValues.get(name)?.dv;
        }
    }
    removeItem(name) {
        this.#defaultValues.delete(name);
        try {
            if (typeof localStorage != 'undefined') {
                localStorage.removeItem(name);
            }
            this.#currentValues.delete(name);
        }
        catch (exception) {
            if (this.logException) {
                console.error(exception);
            }
        }
    }
    resetItem(name) {
        let item = this.#defaultValues.get(name);
        if (item) {
            let defaultValue = item.dv;
            if (defaultValue !== undefined) {
                this.#currentValues.delete(name);
                this.setItem(name, defaultValue);
            }
        }
    }
    resetItems(names) {
        for (let name of names) {
            this.resetItem(name);
        }
    }
    resetAllItems() {
        for (let item of this.#defaultValues.keys()) {
            this.resetItem(item);
        }
    }
    clear() {
        this.#defaultValues.clear();
        try {
            if (typeof localStorage != 'undefined') {
                localStorage.clear();
            }
            this.#currentValues.clear();
        }
        catch (exception) {
            if (this.logException) {
                console.error(exception);
            }
        }
    }
    #filter(filter) {
        this.#currentFilter = String(filter).toLowerCase();
        this.#applyFilter();
    }
    #applyFilter() {
        for (let row of this.#optionsManagerRows) {
            //let row = i[0];
            let optionName = row.getAttribute('user-data-option-name')?.toLowerCase();
            if (!optionName) {
                continue;
            }
            if (!this.#currentFilter || optionName.indexOf(this.#currentFilter) != -1) {
                row.style.display = '';
            }
            else {
                row.style.display = 'none';
            }
        }
    }
    #initPanel() {
        this.#shadowRoot = createShadowRoot('options-manager', {
            parent: document.body,
            adoptStyle: optionsManagerCSS,
            events: {
                click: () => hide(this.#shadowRoot?.host)
            }
        });
        I18n.observeElement(this.#shadowRoot);
        const optionsManagerInner = createElement('div', {
            id: 'options-manager-inner',
            draggable: true,
            'data-left': 0,
            'data-top': 0,
            parent: this.#shadowRoot,
            events: {
                click: (event) => event.stopPropagation(),
                dragstart: (event) => handleDragStart(event),
                dragend: (event) => handleDragEnd(event),
            }
        });
        let handleDragStart = function (event) {
            let target = event.target;
            target?.setAttribute('data-drag-start-layerx', String(event.layerX));
            target?.setAttribute('data-drag-start-layery', String(event.layerY));
        };
        let handleDragEnd = function (event) {
            let target = event.target;
            let startEventX = Number(target.getAttribute('data-drag-start-layerx'));
            let startEventY = Number(target.getAttribute('data-drag-start-layery'));
            target.style.left = (event.layerX - startEventX) + 'px';
            target.style.top = (event.layerY - startEventY) + 'px';
            let dataTop = Number(target.getAttribute('data-top')) + (event.layerY - startEventY);
            let dataLeft = Number(target.getAttribute('data-left')) + (event.layerX - startEventX);
            target.style.left = dataLeft + 'px';
            target.style.top = dataTop + 'px';
            optionsManagerInner.setAttribute('data-left', String(dataLeft));
            optionsManagerInner.setAttribute('data-top', String(dataTop));
        };
        createElement('h1', { id: 'options-manager-title', i18n: '#manage_options', parent: optionsManagerInner });
        createElement('input', {
            id: 'options-manager-inner-filter',
            'i18n-placeholder': '#filter',
            parent: optionsManagerInner,
            events: {
                input: (event) => this.#filter(event.target.value)
            }
        });
        this.#htmlOptionsTable = createElement('table', { parent: optionsManagerInner });
        this.#htmlOptionsManagerContentThead = createElement('thead', { parent: this.#htmlOptionsTable });
    }
    #populateOptionRow(option) {
        let htmlRow = createElement('tr');
        let htmlResetButtonCell = createElement('td');
        let htmlOptionNameCell = createElement('td', { innerHTML: option.name });
        let htmlDefaultValueCell = createElement('td');
        let htmlUserValueCell = createElement('td');
        let myValue = this.getItem(option.name);
        this.#fillCell(htmlDefaultValueCell, option.type, option.dv);
        createElement('button', {
            class: 'options-manager-button',
            i18n: '#reset',
            parent: htmlResetButtonCell,
            events: {
                click: () => { this.resetItem(option.name); this.#refreshPanel(); }
            }
        });
        let valueEdit = this.#createInput(option.name, this.#defaultValues.get(option.name), myValue, htmlResetButtonCell);
        if (valueEdit) {
            htmlUserValueCell.appendChild(valueEdit);
            htmlRow.append(htmlResetButtonCell, htmlOptionNameCell, htmlDefaultValueCell, htmlUserValueCell);
        }
        return htmlRow;
    }
    #populateMapOptionRow(option) {
        let htmlRow = createElement('tbody', { innerHTML: `<td></td><td colspan="3">${option.name}</td>` });
        let userValue = this.getItem(option.name);
        if (userValue && typeof userValue === 'object') {
            for (let key in userValue) {
                let htmlSubRow = createElement('tr', { parent: htmlRow });
                let value = userValue[key];
                let htmlRemoveButtonCell = createElement('td');
                let htmlSubNameCell = createElement('td', { innerHTML: key });
                let htmlSubValueCell = createElement('td');
                htmlSubRow.append(htmlRemoveButtonCell, htmlSubNameCell, htmlSubValueCell);
                createElement('input', { value: value, parent: htmlSubValueCell });
            }
        }
        return htmlRow;
    }
    #addOptionRow(option) {
        if (option.editable === false) {
            return;
        }
        let htmlRow;
        if (option.type == 'map') {
            htmlRow = this.#populateMapOptionRow(option);
        }
        else {
            htmlRow = this.#populateOptionRow(option);
        }
        htmlRow.setAttribute('user-data-option-name', option.name);
        return htmlRow;
    }
    #refreshPanel() {
        this.#refreshCategories();
        if (this.#htmlOptionsManagerContentThead) {
            this.#htmlOptionsManagerContentThead.innerText = '';
            this.#htmlOptionsManagerContentThead.append(createElement('th', {
                child: createElement('button', {
                    class: 'options-manager-button',
                    i18n: '#reset_all',
                    events: {
                        click: () => { this.resetAllItems(); this.#refreshPanel(); }
                    }
                })
            }), createElement('th', { i18n: '#option_name' }), createElement('th', { i18n: '#option_default_value' }), createElement('th', { i18n: '#option_user_value' }));
        }
        for (let row of this.#optionsManagerRows) {
            row.remove();
        }
        this.#optionsManagerRows.clear();
        for (let [categoryName, category] of this.#categories) {
            for (let option of category) {
                let htmlRow = this.#addOptionRow(option);
                if (htmlRow) {
                    this.#optionsManagerRows.add(htmlRow);
                    this.#htmlOptionsTable?.append(htmlRow);
                }
            }
        }
        I18n.i18n();
        this.#applyFilter();
    }
    #fillCell(cell, type, value) {
        switch (type) {
            case 'string':
                cell.innerHTML = value;
                break;
            case 'shortcut':
                let arr = value.split('+');
                for (let key of arr) {
                    createElement('kbd', {
                        innerHTML: key,
                        parent: cell,
                    });
                }
                //cell.innerHTML = value;
                break;
            default:
                cell.innerHTML = value;
        }
    }
    #getUniqueId() {
        return 'options-manager-' + (this.#uniqueId++);
    }
    #createInput(optionName, option, value, resetButton) {
        if (!option) {
            return;
        }
        let showHideResetButton = () => {
            let defaultValue = this.#defaultValues.get(optionName)?.dv;
            defaultValue = defaultValue === undefined ? undefined : JSON.stringify(defaultValue);
            let optionValue = this.getItem(optionName);
            optionValue = optionValue === null ? null : JSON.stringify(optionValue);
            if ((optionValue) != defaultValue) {
                resetButton.style.opacity = '';
            }
            else {
                resetButton.style.opacity = '0';
            }
        };
        let htmlElement;
        switch (option.type) {
            case 'number':
            case 'integer':
                htmlElement = createElement('input', {
                    value: value,
                    events: {
                        change: (event) => {
                            let value = event.target.value.trim();
                            this.setItem(optionName, value === '' ? null : Number(value));
                            showHideResetButton();
                        }
                    }
                });
                break;
            case 'object':
                htmlElement = createElement('input', {
                    value: JSON.stringify(value),
                    events: {
                        change: (event) => { this.setItem(optionName, JSON.parse(event.target.value)); showHideResetButton(); }
                    }
                });
                break;
            case 'boolean':
                htmlElement = createElement('input', {
                    type: 'checkbox',
                    checked: value,
                    events: {
                        change: (event) => { this.setItem(optionName, event.target.checked); showHideResetButton(); }
                    }
                });
                break;
            case 'ternary':
                htmlElement = createElement('select', {
                    events: {
                        change: (event) => {
                            let value;
                            switch (event.target.value) {
                                case '0':
                                    value = false;
                                    break;
                                case '1':
                                    value = true;
                                    break;
                            }
                            this.setItem(optionName, value);
                            showHideResetButton();
                        }
                    }
                });
                for (let o of ['', 0, 1]) {
                    createElement('option', { innerHTML: o, parent: htmlElement });
                }
                let v = '';
                switch (value) {
                    case undefined:
                        v = '';
                        break;
                    case false:
                        v = '0';
                        break;
                    case true:
                        v = '1';
                        break;
                }
                htmlElement.value = v;
                break;
            case 'list':
                this.#getUniqueId();
                htmlElement = createElement('select', {
                    value: value,
                    events: {
                        change: (event) => { this.setItem(optionName, event.target.value); showHideResetButton(); }
                    }
                });
                if (option.datalist) {
                    for (let o of option.datalist) {
                        createElement('option', { innerHTML: o, parent: htmlElement });
                    }
                }
                htmlElement.value = value;
                break;
            case 'vec2':
                htmlElement = createElement('input', {
                    value: value,
                    events: {
                        change: (event) => { this.setItem(optionName, (readVec2Value(event.target.value))); showHideResetButton(); }
                    }
                });
                break;
            /*case 'editablelist':
                let dataListId = OptionsManager.#getUniqueId();
                htmlElement = createElement('input');
                let datalist = createElement('datalist');
                datalist.id = dataListId;
                htmlElement.setAttribute('list', dataListId);
                document.body.appendChild(datalist);
                if (option.datalist) {
                    for(let o of option.datalist) {
                        let htmlOption = createElement('option');
                        datalist.appendChild(htmlOption);
                        htmlOption.innerHTML = o;
                    }
                }
                htmlElement.addEventListener('change', event => {this.setItem(optionName, event.target.value);showHideResetButton();});
                break;*/
            /*			case 'vec4':
                            htmlElement = createElement('input');
                            htmlElement.value = value;//value.join(',');
                            function readValue(value) {
                                let v = value.split(',');
                                if (v.length == 4) {
                                    return quat.fromValues(v[0] * 1, v[1] * 1, v[2] * 1, v[3] * 1);
                                }
                                return null;
                            }
                            htmlElement.addEventListener('change', event => {this.setItem(optionName, (readValue(event.target.value)));showHideResetButton();});
                            break;*/
            case 'string':
            case 'color':
            default:
                htmlElement = createElement('input', {
                    value: value,
                    events: {
                        change: (event) => { this.setItem(optionName, (event.target.value)); showHideResetButton(); }
                    }
                });
                break;
        }
        showHideResetButton();
        return htmlElement;
    }
    showOptionsManager() {
        if (!this.#shadowRoot) {
            this.#initPanel();
        }
        this.#refreshPanel();
        show(this.#shadowRoot?.host);
    }
    async getOptionsPerType(type) {
        await this.#initPromise;
        let ret = new Set();
        for (let option of this.#defaultValues.values()) {
            if (option.type == type) {
                let optionName = option.name;
                ret.add([optionName, this.#currentValues.get(optionName)]);
            }
        }
        return ret;
    }
    async getOption(name) {
        await this.#initPromise;
        return this.#defaultValues.get(name);
    }
    async getOptionType(name) {
        await this.#initPromise;
        return this.#defaultValues.get(name)?.type;
    }
    async getList(name) {
        await this.#initPromise;
        let option = this.#defaultValues.get(name);
        if (option && option.type == 'list') {
            return option.datalist;
        }
    }
}
function readVec2Value(value) {
    let v = value.split(',');
    if (v.length == 2) {
        return fromValues(Number(v[0]), Number(v[1]));
    }
    return null;
}

class Shortcut {
    #contexts;
    #key;
    #alt = false;
    #ctrl = false;
    #meta = false;
    #shift = false;
    constructor(context, shortcut) {
        this.#contexts = context.split(',');
        const keys = shortcut.toUpperCase().split('+');
        for (let key of keys) {
            switch (key) {
                case 'ALT':
                    this.#alt = true;
                    break;
                case 'CTRL':
                    this.#ctrl = true;
                    break;
                case 'META':
                    this.#meta = true;
                    break;
                case 'SHIFT':
                    this.#shift = true;
                    break;
                case 'PLUS':
                    this.#key = '+';
                    break;
                default:
                    this.#key = key;
            }
        }
    }
    match(context, keyBoardEvent) {
        return (this.#contexts.indexOf(context) > -1) &&
            (keyBoardEvent.altKey == this.#alt) &&
            (keyBoardEvent.ctrlKey == this.#ctrl) &&
            (keyBoardEvent.metaKey == this.#meta) &&
            (keyBoardEvent.shiftKey == this.#shift) &&
            (keyBoardEvent.key.toUpperCase() == this.#key);
    }
}
class ShortcutHandlerClass extends EventTarget {
    static #instance;
    #shortcuts = new Map();
    #contexts = new Map();
    constructor() {
        if (ShortcutHandlerClass.#instance) {
            return ShortcutHandlerClass.#instance;
        }
        super();
        ShortcutHandlerClass.#instance = this;
        this.addContext('window', window);
    }
    #handleKeyDown(contextName, event) {
        const contexts = contextName.split(',');
        for (let [name, shortcuts] of this.#shortcuts) {
            for (let shortcut of shortcuts) {
                for (let context of contexts) {
                    if (shortcut.match(context, event)) {
                        this.dispatchEvent(new CustomEvent(name, { detail: event }));
                        event.preventDefault();
                        event.stopPropagation();
                    }
                }
            }
        }
    }
    addContext(name, element) {
        element.addEventListener('keydown', event => this.#handleKeyDown(name, event));
    }
    setShortcuts(contextName, shortcutMap) {
        if (!shortcutMap) {
            return;
        }
        this.#shortcuts.clear();
        for (let [name, shortcut] of shortcutMap) {
            this.addShortcut(contextName, name, shortcut);
        }
    }
    setShortcut(contextName, name, shortcut) {
        this.#shortcuts.delete(name);
        this.addShortcut(contextName, name, shortcut);
    }
    addShortcut(contextName, name, shortcut) {
        if (!shortcut) {
            return;
        }
        let shortcuts = shortcut.split(';');
        let shortcutSet = this.#shortcuts.get(name);
        if (!shortcutSet) {
            shortcutSet = new Set();
            this.#shortcuts.set(name, shortcutSet);
        }
        for (let shortcut of shortcuts) {
            shortcutSet.add(new Shortcut(contextName, shortcut));
        }
    }
}
const ShortcutHandler = new ShortcutHandlerClass();

function supportsPopover() {
    return HTMLElement.prototype.hasOwnProperty('popover');
}

export { NotificationManager, OptionsManager, SaveFile, ShortcutHandler, supportsPopover };