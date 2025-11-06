import { contentCopySVG, closeSVG, checkCircleSVG, warningSVG, infoSVG, errorSVG } from 'harmony-svg';
import { documentStyle, defineHarmonyCircularProgress, createShadowRoot, createElement, display, I18n, hide, show, defineHarmonyTree, TreeItem } from 'harmony-ui';
import { vec2 } from 'gl-matrix';

function saveFile(file) {
    const link = document.createElement('a');
    link.setAttribute('href', URL.createObjectURL(file));
    link.setAttribute('download', file.name);
    link.click();
}

var theme = "@media (prefers-color-scheme: light){\n\tbody{\n\t\t--theme-background-primary: #fff;\n\t\t--theme-background-secondary: #eee;\n\t\t--theme-background-tertiary: #c8c8c8;\n\t\t--theme-background-quaternary: #b1b1b1;\n\n\t\t--theme-background-primary-invert: #1b1b1b;\n\t\t--theme-background-secondary-invert: #101822;\n\t\t--theme-background-tertiary-invert: #343434;\n\t\t--theme-background-quaternary-invert: #4e4e4e;\n\n\t\t--theme-border-primary:  #cdcdcd;\n\t\t--theme-border-secondary:  #cdcdcd;\n\n\t\t--theme-text-primary: #1b1b1b;\n\t\t--theme-text-secondary: #4e4e4e;\n\t\t--theme-text-inactive: #9e9e9ea6;\n\t\t--theme-text-link: #0069c2;\n\t\t--theme-text-invert: #fff;\n\n\t\t--theme-accent-primary: #0085f2;\n\n\t\t--theme-scrollbar-bg: transparent;\n\t\t--theme-scrollbar-color: rgba(0, 0, 0, 0.25);\n\n\t\t--theme-bg-color: #D7D3CB;\n\t\t--theme-popup-bg-color: #CCCCCC;\n\t\t--theme-text-color: #111111;\n\t\t--theme-text-bg-color: 238 238 238;\n\n\t\t--theme-text-color-warning:#ff6a00;\n\t\t--theme-filter-invert-light:invert(100%);\n\n\t\t--theme-main-bg-color-bright: #D7D3CB;\n\t\t--theme-main-bg-color-dark: #DEDAD4;\n\t}\n}\n@media (prefers-color-scheme: dark){\n\tbody{\n\t\t--theme-background-primary: #1b1b1b;\n\t\t--theme-background-secondary: #101822;\n\t\t--theme-background-tertiary: #343434;\n\t\t--theme-background-quaternary: #4e4e4e;\n\n\t\t--theme-background-primary-invert: #fff;\n\t\t--theme-background-secondary-invert: #eee;\n\t\t--theme-background-tertiary-invert: #c8c8c8;\n\t\t--theme-background-quaternary-invert: #b1b1b1;\n\n\t\t--theme-border-primary:  #858585;\n\t\t--theme-border-secondary:  #696969;\n\n\t\t--theme-text-primary: #fff;\n\t\t--theme-text-secondary: #cdcdcd;\n\t\t--theme-text-inactive: #cdcdcda6;\n\t\t--theme-text-link: #8cb4ff;\n\t\t--theme-text-invert: #1b1b1b;\n\n\t\t--theme-accent-primary: #5e9eff;\n\n\t\t--theme-scrollbar-bg: transparent;\n\t\t--theme-scrollbar-color: rgba(255, 255, 255, 0.25);\n\n\t\t--theme-bg-color: #21252b;\n\t\t--theme-popup-bg-color: #333333;\n\t\t--theme-text-color: #EEEEEE;\n\t\t--theme-text-bg-color: 17 17 17;\n\n\t\t--theme-text-color-warning:orange;\n\t\t--theme-filter-invert-dark:invert(100%);\n\n\t\t--theme-main-bg-color-bright: #41454d;\n\t\t--theme-main-bg-color-dark: #21252b;\n\t}\n}\n";

var notificationsContainerCSS = ":host {\r\n\tposition: fixed;\r\n\tz-index: 10000;\r\n\tdisplay: flex;\r\n\toverflow: hidden;\r\n\twidth: 100%;\r\n\theight: 100%;\r\n\tpointer-events: none;\r\n\ttop: 0;\r\n\tleft: 0;\r\n}\r\n\r\n.inner {\r\n\tposition: absolute;\r\n\tdisplay: flex;\r\n}\r\n\r\n.inner>* {\r\n\tpointer-events: all;\r\n}\r\n\r\n.top {\r\n\twidth: 100%;\r\n\tflex-direction: column;\r\n}\r\n\r\n.bottom {\r\n\twidth: 100%;\r\n\tflex-direction: column-reverse;\r\n\tbottom: 0;\r\n}\r\n\r\n.left,\r\n.right {\r\n\tflex-direction: column;\r\n\tjustify-content: center;\r\n\theight: 100%;\r\n}\r\n\r\n.top-right,\r\n.top-left {\r\n\tpadding: 1rem;\r\n\tflex-direction: column;\r\n}\r\n\r\n.top-right,\r\n.right,\r\n.bottom-right {\r\n\tright: 0;\r\n}\r\n\r\n.bottom-right,\r\n.bottom-left {\r\n\tbottom: 0;\r\n\tpadding: 1rem;\r\n\tflex-direction: column-reverse;\r\n}\r\n\r\n.copy {\r\n\tposition: absolute;\r\n\tcolor: white;\r\n\tbackground-color: blue;\r\n\tborder-radius: 0.5rem;\r\n\tpadding: 0.2rem;\r\n}\r\n";

var notificationsCSS = ":host {\r\n\tbackground-color: var(--theme-popup-bg-color);\r\n\tcolor: var(--theme-text-color);\r\n\tfont-size: 1.5rem;\r\n\tdisplay: flex;\r\n\talign-items: center;\r\n}\r\n\r\n.type {\r\n\t/*\r\n\tpadding: 1rem;\r\n\t*/\r\n\twidth: 4rem;\r\n\theight: 4rem;\r\n\tposition: relative;\r\n}\r\n\r\n.type>* {\r\n\twidth: 100%;\r\n\theight: 100%;\r\n\tposition: absolute;\r\n}\r\n\r\n.type>.svg {\r\n    display: flex;\r\n    align-items: center;\r\n    justify-content: center;\r\n}\r\n\r\n.notification-line1 {\r\n\tdisplay: flex;\r\n\twidth: 100%;\r\n\tbackground-color: black;\r\n}\r\n\r\n.notification-progress {\r\n\theight: 0.2rem;\r\n\twidth: 100%;\r\n\tbackground-color: red;\r\n}\r\n\r\n.notification-error .notification-progress {\r\n\tbackground-color: blue;\r\n}\r\n\r\n.notification-line2 {\r\n\tdisplay: flex;\r\n}\r\n\r\n.notification-content {\r\n\toverflow: auto;\r\n\tflex: 1;\r\n\tmax-width: calc(100% - 20px);\r\n\tpadding: 0.2rem;\r\n\tcursor: copy;\r\n}\r\n\r\n.notification-close {\r\n\tfill: currentColor;\r\n\tcursor: pointer;\r\n}\r\n\r\n.notification-copy {\r\n\tfill: currentColor;\r\n\tcursor: pointer;\r\n\ttransition: all 0.3s ease-in 0s;\r\n\tcursor: copy;\r\n}\r\n\r\n.notification-copy-success {\r\n\ttransform: rotate(1turn);\r\n}\r\n\r\n.notification-close>svg {\r\n\twidth: 20px;\r\n\tmargin: 5px;\r\n}\r\n\r\n.success {\r\n\tbackground-color: #5aa822ff;\r\n}\r\n\r\n.warning {\r\n\tbackground-color: #c78a17ff;\r\n}\r\n\r\n.error {\r\n\tbackground-color: #c71717ff;\r\n}\r\n\r\n.info {\r\n\tbackground-color: #2e88e8ff;\r\n}\r\n";

var NotificationsPlacement;
(function (NotificationsPlacement) {
    NotificationsPlacement["Top"] = "top";
    NotificationsPlacement["Bottom"] = "bottom";
    NotificationsPlacement["Left"] = "left";
    NotificationsPlacement["Right"] = "right";
    NotificationsPlacement["TopLeft"] = "top-left";
    NotificationsPlacement["TopRight"] = "top-right";
    NotificationsPlacement["BottomLeft"] = "bottom-left";
    NotificationsPlacement["BottomRight"] = "bottom-right";
    NotificationsPlacement["Center"] = "center";
    NotificationsPlacement["DockedTop"] = "docked-top";
    NotificationsPlacement["DockedBottom"] = "docked-bottom";
})(NotificationsPlacement || (NotificationsPlacement = {}));
var NotificationType;
(function (NotificationType) {
    NotificationType["Success"] = "success";
    NotificationType["Warning"] = "warning";
    NotificationType["Error"] = "error";
    NotificationType["Info"] = "info";
})(NotificationType || (NotificationType = {}));
var NotificationEvents;
(function (NotificationEvents) {
    NotificationEvents["Added"] = "notificationadded";
    NotificationEvents["Removed"] = "notificationremoved";
})(NotificationEvents || (NotificationEvents = {}));
class Notification {
    #shadowRoot;
    //#htmlElement?: HTMLElement;
    #content;
    #type;
    #id;
    #ttl = 0;
    #htmlType;
    #htmlContent;
    #htmlProgress;
    #parent;
    #start = 0;
    constructor(content, type, ttl, params) {
        this.#content = content;
        this.#type = type;
        //this.#setTtl(ttl);
        this.#ttl = ttl;
        this.#id = ++notificationId;
        this.#parent = params?.parent;
        documentStyle(theme);
    }
    get htmlElement() {
        if (this.#shadowRoot) {
            return this.#shadowRoot.host;
        }
        defineHarmonyCircularProgress();
        let svg = '';
        switch (this.#type) {
            case NotificationType.Error:
                svg = errorSVG;
                break;
            case NotificationType.Info:
                svg = infoSVG;
                break;
            case NotificationType.Warning:
                svg = warningSVG;
                break;
            case NotificationType.Success:
                svg = checkCircleSVG;
                break;
        }
        this.#shadowRoot = createShadowRoot('div', {
            adoptStyle: notificationsCSS,
            childs: [
                this.#htmlType = createElement('div', {
                    class: 'type',
                    childs: [
                        this.#htmlProgress = createElement('h-cp', {
                            class: 'progress',
                            hidden: true,
                        }),
                        createElement('div', {
                            class: 'svg',
                            innerHTML: svg,
                        }),
                    ],
                }),
                this.#htmlContent = createElement('div', {
                    class: 'notification-content',
                    $click: (event) => this.#copyContent(event),
                }),
                createElement('div', {
                    class: 'notification-copy',
                    innerHTML: contentCopySVG,
                    events: {
                        click: async (event) => {
                            if (await this.#copyContent(event)) {
                                event.target.parentElement?.classList.toggle('notification-copy-success');
                            }
                        },
                    }
                }),
                createElement('div', {
                    class: 'notification-close',
                    innerHTML: closeSVG,
                    events: {
                        click: () => closeNotification(this),
                    }
                }),
                /*
                createElement('div', {
                    class: 'notification-line1',
                    child:
                        this.#htmlProgressBar = createElement('div', {
                            class: 'notification-progress',
                        }),
                }),
                createElement('div', {
                    class: 'notification-line2',
                    childs: [
                    ]
                }),
                */
            ],
            $click: () => this.#ttl = 0,
        });
        this.#htmlType.classList.add(this.#type);
        if (this.#content instanceof HTMLElement) {
            this.#htmlContent.append(this.#content);
        }
        else {
            this.#htmlContent.innerHTML = this.#content;
        }
        if (this.#ttl != 0) {
            this.#start = performance.now();
            window.requestAnimationFrame(() => this.#run());
        }
        return this.#shadowRoot.host;
    }
    async #copyContent(event) {
        try {
            if (navigator.clipboard) {
                await navigator.clipboard.writeText(this.#htmlContent.innerText);
                copied(event.clientX, event.clientY);
                return true;
            }
        }
        catch (e) {
            console.error(e);
        }
        return false;
    }
    close() {
        closeNotification(this);
    }
    #run() {
        display(this.#htmlProgress, this.#ttl > 0);
        if (this.#ttl <= 0) {
            return;
        }
        const now = performance.now();
        const elapsed = (now - this.#start);
        const progress = elapsed / this.#ttl / 1000;
        if (progress < 1) {
            this.#htmlProgress?.setProgress(1 - progress);
            window.requestAnimationFrame(() => this.#run());
        }
        else {
            closeNotification(this);
        }
    }
    get id() {
        return this.#id;
    }
}
let htmlInner;
let htmlCopy;
let defaultPlacement = NotificationsPlacement.TopRight;
let notificationId = 0;
const notifications = new Map();
function setNotificationsPlacement(placement) {
    defaultPlacement = placement;
    if (htmlInner) {
        htmlInner.className = `inner ${placement}`;
    }
}
let initialized = false;
function addNotification(content, type, ttl, params) {
    if (!initialized) {
        initialize();
    }
    const notification = new Notification(content, type, ttl, params);
    notifications.set(notification.id, notification);
    htmlInner.append(notification.htmlElement);
    return notification;
}
function closeNotification(notification) {
    if (typeof notification == 'number') {
        notification = notifications.get(notification);
    }
    if (notification && notifications.has(notification.id)) {
        notifications.delete(notification.id);
        notification.htmlElement.remove();
        NotificationController.dispatchEvent(new CustomEvent(NotificationEvents.Removed, { detail: { notification: notification } }));
    }
}
function initialize() {
    initialized = true;
    createShadowRoot('div', {
        parent: document.body,
        adoptStyle: notificationsContainerCSS,
        childs: [
            htmlInner = createElement('div', {
                class: `inner ${defaultPlacement}`,
            }),
            htmlCopy = createElement('div', {
                class: 'copy',
                hidden: true,
                innerHTML: contentCopySVG,
            }),
        ],
    });
    I18n.observeElement(htmlInner);
}
const NotificationController = new EventTarget();
function addNotificationEventListener(type, callback, options) {
    NotificationController.addEventListener(type, callback, options);
}
let startCopy;
let startY;
function copied(x, y) {
    startCopy = performance.now();
    window.requestAnimationFrame(() => runCopy());
    startY = y;
    htmlCopy.style.left = `${String(x)}px`;
}
const displacement = 30;
const delay = 1000;
function runCopy() {
    const now = performance.now();
    const elapsed = (now - startCopy);
    const progress = elapsed / delay;
    display(htmlCopy, progress < 1);
    htmlCopy.style.top = `${String(startY - displacement * progress)}px`;
    if (progress < 1) {
        window.requestAnimationFrame(() => runCopy());
    }
}

var optionsManagerCSS = ":host{\r\n\tposition: absolute;\r\n\twidth: 100%;\r\n\theight: 100%;\r\n\toverflow: auto;\r\n\tz-index: 10000;\r\n\tdisplay: flex;\r\n\talign-items: center;\r\n\tjustify-content: center;\r\n\ttop:0px;\r\n\tleft: 0px;\r\n}\r\n\r\n#options-manager-inner{\r\n\tposition: relative;\r\n\t/*background-color: rgba(255, 255, 255, 1.0);*/\r\n\tbackground-color: var(--theme-popup-bg-color);\r\n\tcolor: var(--main-text-color-dark2);\r\n\tpadding:10px;\r\n\toverflow: hidden;\r\n\tmax-height: 70%;\r\n\tmax-width: 75%;\r\n\tdisplay: flex;\r\n\tflex-direction: column;\r\n\topacity: 0.9;\r\n}\r\n\r\n#options-manager-inner h1{\r\n\ttext-transform: capitalize;\r\n\ttext-align: center;\r\n}\r\n\r\n#options-manager-inner-filter{\r\n\twidth:100%;\r\n}\r\n\r\n.options-manager-button{\r\n\tcursor:pointer;\r\n\twhite-space: nowrap;\r\n\ttext-transform: capitalize;\r\n}\r\n\r\n#options-manager-inner table{\r\n\ttext-align: left;\r\n\toverflow: hidden auto;\r\n\tdisplay: block;\r\n\theight: 100%;\r\n}\r\n\r\n#options-manager-inner thead{\r\n\tposition: sticky;\r\n\t/*display: block;*/\r\n\ttop: 0px;\r\n\tbackground-color: var(--theme-popup-bg-color);\r\n}\r\n\r\n#options-manager-inner thead th{\r\n\tposition: sticky;\r\n\ttop: 0px;\r\n\tbackground-color: var(--theme-popup-bg-color);\r\n}\r\n\r\n#options-manager-inner th{\r\n\ttext-transform: capitalize;\r\n}\r\n\r\n#options-manager-inner th button, #options-manager-inner td button{\r\n\twidth: 100%;\r\n}\r\n\r\n#options-manager-title{\r\n\tcursor:move;\r\n}\r\n\r\n[draggable=true] {\r\n\tcursor: move;\r\n}\r\n\r\n[draggable=true] *{\r\n\tcursor: initial;\r\n}\r\n\r\n#options-manager-outer kbd{\r\n\tbackground-color: #eee;\r\n\tborder-radius: 0.25rem;\r\n\tborder: 0.1rem solid #b4b4b4;\r\n\tbox-shadow: 0 0.06rem 0.06rem rgba(0, 0, 0, .2), 0 0.1rem 0 0 rgba(255, 255, 255, .7) inset;\r\n\tcolor: #333;\r\n\tdisplay: inline-block;\r\n\tline-height: 1;\r\n\tpadding: 0.15rem;\r\n\twhite-space: nowrap;\r\n\tfont-weight: 1000;\r\n\tfont-size: 1.3rem;\r\n}\r\n";

const OptionsManagerEvents = new EventTarget();
class OptionsManager {
    static #defaultValues = new Map();
    static #currentValues = new Map();
    static #categories = new Map();
    static #dirtyCategories = true;
    static #initPromiseResolve;
    static #initPromise = new Promise((resolve) => this.#initPromiseResolve = resolve);
    static #currentFilter = '';
    static #optionsManagerRows = new Set();
    static #htmlOptionsTable;
    static #htmlOptionsManagerContentThead;
    static #uniqueId = 0;
    static #shadowRoot;
    static logException = false;
    static {
        this.#defaultValues[Symbol.iterator] = function* () {
            yield* [...this.entries()].sort((a, b) => { return a[0] < b[0] ? -1 : 1; });
        };
    }
    static async init(parameters) {
        if (parameters.url) {
            await this.#initFromURL(parameters.url);
        }
        else if (parameters.json) {
            this.#initFromJSON(parameters.json);
        }
    }
    static async #initFromURL(url) {
        const response = await fetch(url);
        this.#initFromJSON(await response.json());
    }
    static #initFromJSON(json) {
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
    static #addCategory(name) {
        this.#categories.set(name.toLowerCase(), []);
        this.#dirtyCategories = true;
    }
    static #refreshCategories() {
        if (this.#dirtyCategories) {
            for (const [categoryName, category] of this.#categories) {
                category.length = 0;
            }
            for (const [optionName, option] of this.#defaultValues) {
                let maxLength = -1;
                let cat = null;
                for (const [categoryName, category] of this.#categories) {
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
    static addOption(option /*TODO:better type*/) {
        if (!option) {
            return;
        }
        const name = option.name.toLowerCase();
        const type = option.type;
        const defaultValue = option.default;
        const datalist = option.datalist;
        const editable = option.editable;
        const context = option.context;
        const protec = option.protected;
        const dv = this.#defaultValues.get(name) || { name: '', editable: true, type: '' };
        this.#defaultValues.set(name, dv);
        dv.name = name;
        if (type !== undefined) {
            dv.type = type;
        }
        if (defaultValue !== undefined) {
            dv.defaultValue = defaultValue;
        }
        if (datalist !== undefined) {
            dv.datalist = datalist;
        }
        if (editable !== undefined) {
            dv.editable = editable;
        }
        if (context !== undefined) {
            dv.context = context;
        }
        if (protec !== undefined) {
            dv.protected = protec;
        }
        try {
            if (typeof localStorage != 'undefined') {
                const value = this.getItem(name);
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
    static setItem(name, value) {
        try {
            if (typeof localStorage != 'undefined') {
                // Note: undefined is stored as 'undefined', which is not valid JSON: see getItem()
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
    static async getSubItem(name, subName) {
        try {
            const option = await this.getOption(name);
            if (option && option.type == 'map') {
                const map = this.#currentValues.get(name) ?? {};
                if (map && (typeof map == 'object')) {
                    return map[subName];
                }
            }
        }
        catch (exception) {
            if (this.logException) {
                console.error(exception);
            }
        }
    }
    static async setSubItem(name, subName, value) {
        try {
            const option = await this.getOption(name);
            if (option && option.type == 'map') {
                const map = this.#currentValues.get(name) ?? {};
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
    static removeSubItem(name, subName) {
        try {
            const map = this.#currentValues.get(name) ?? {};
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
    static #valueChanged(name, value) {
        const option = this.#defaultValues.get(name);
        if (!option) {
            return;
        }
        const context = option.context;
        OptionsManagerEvents.dispatchEvent(new CustomEvent(name, { detail: { name: name, value: value, context: context } }));
        let lastIndex = name.lastIndexOf('.');
        while (lastIndex != -1) {
            const wildCardName = name.slice(0, lastIndex);
            OptionsManagerEvents.dispatchEvent(new CustomEvent(wildCardName + '.*', { detail: { name: name, value: value, context: context } }));
            lastIndex = name.lastIndexOf('.', lastIndex - 1);
        }
        OptionsManagerEvents.dispatchEvent(new CustomEvent('*', { detail: { name: name, value: value, context: context } }));
    }
    static getItem(name) {
        try {
            if (typeof localStorage != 'undefined') {
                const value = localStorage.getItem(name);
                if (value) {
                    if (value == 'undefined') {
                        // 'undefined' is not valid JSON
                        return undefined;
                    }
                    const parsedValue = JSON.parse(value);
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
            return this.#defaultValues.get(name)?.defaultValue;
        }
    }
    static removeItem(name) {
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
    static resetItem(name) {
        const item = this.#defaultValues.get(name);
        if (item) {
            const defaultValue = item.defaultValue;
            this.#currentValues.delete(name);
            this.setItem(name, defaultValue);
        }
    }
    static resetItems(names) {
        for (const name of names) {
            this.resetItem(name);
        }
    }
    static resetAllItems() {
        for (const [item, option] of this.#defaultValues) {
            if (option.protected) {
                continue;
            }
            this.resetItem(item);
        }
    }
    static clear() {
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
    static #filter(filter) {
        this.#currentFilter = String(filter).toLowerCase();
        this.#applyFilter();
    }
    static #applyFilter() {
        for (const row of this.#optionsManagerRows) {
            //let row = i[0];
            const optionName = row.getAttribute('user-data-option-name')?.toLowerCase();
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
    static #initPanel() {
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
        const handleDragStart = function (event) {
            const target = event.target;
            target?.setAttribute('data-drag-start-layerx', String(event.layerX));
            target?.setAttribute('data-drag-start-layery', String(event.layerY));
        };
        const handleDragEnd = function (event) {
            const target = event.target;
            const startEventX = Number(target.getAttribute('data-drag-start-layerx'));
            const startEventY = Number(target.getAttribute('data-drag-start-layery'));
            target.style.left = (event.layerX - startEventX) + 'px';
            target.style.top = (event.layerY - startEventY) + 'px';
            const dataTop = Number(target.getAttribute('data-top')) + (event.layerY - startEventY);
            const dataLeft = Number(target.getAttribute('data-left')) + (event.layerX - startEventX);
            target.style.left = dataLeft + 'px';
            target.style.top = dataTop + 'px';
            optionsManagerInner.setAttribute('data-left', String(dataLeft));
            optionsManagerInner.setAttribute('data-top', String(dataTop));
        };
        createElement('h1', { id: 'options-manager-title', i18n: '#manage_options', parent: optionsManagerInner });
        createElement('input', {
            id: 'options-manager-inner-filter',
            i18n: { placeholder: '#filter', },
            parent: optionsManagerInner,
            events: {
                input: (event) => this.#filter(event.target.value)
            }
        });
        this.#htmlOptionsTable = createElement('table', { parent: optionsManagerInner });
        this.#htmlOptionsManagerContentThead = createElement('thead', { parent: this.#htmlOptionsTable });
    }
    static #populateOptionRow(option) {
        const htmlRow = createElement('tr');
        const htmlResetButtonCell = createElement('td');
        const htmlOptionNameCell = createElement('td', { innerHTML: option.name });
        const htmlDefaultValueCell = createElement('td');
        const htmlUserValueCell = createElement('td');
        const myValue = this.getItem(option.name);
        this.#fillCell(htmlDefaultValueCell, option.type, option.defaultValue);
        createElement('button', {
            class: 'options-manager-button',
            i18n: '#reset',
            parent: htmlResetButtonCell,
            events: {
                click: () => { this.resetItem(option.name); this.#refreshPanel(); }
            }
        });
        const valueEdit = this.#createInput(option.name, this.#defaultValues.get(option.name), myValue, htmlResetButtonCell);
        if (valueEdit) {
            htmlUserValueCell.appendChild(valueEdit);
            htmlRow.append(htmlResetButtonCell, htmlOptionNameCell, htmlDefaultValueCell, htmlUserValueCell);
        }
        return htmlRow;
    }
    static #populateMapOptionRow(option) {
        const htmlRow = createElement('tbody', { innerHTML: `<td></td><td colspan="3">${option.name}</td>` });
        const userValue = this.getItem(option.name);
        if (userValue && typeof userValue === 'object') {
            for (const key in userValue) {
                const htmlSubRow = createElement('tr', { parent: htmlRow });
                const value = userValue[key];
                const htmlRemoveButtonCell = createElement('td');
                const htmlSubNameCell = createElement('td', { innerHTML: key });
                const htmlSubValueCell = createElement('td');
                htmlSubRow.append(htmlRemoveButtonCell, htmlSubNameCell, htmlSubValueCell);
                createElement('input', { value: value, parent: htmlSubValueCell });
            }
        }
        return htmlRow;
    }
    static #addOptionRow(option) {
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
    static #refreshPanel() {
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
        for (const row of this.#optionsManagerRows) {
            row.remove();
        }
        this.#optionsManagerRows.clear();
        for (const [categoryName, category] of this.#categories) {
            for (const option of category) {
                const htmlRow = this.#addOptionRow(option);
                if (htmlRow) {
                    this.#optionsManagerRows.add(htmlRow);
                    this.#htmlOptionsTable?.append(htmlRow);
                }
            }
        }
        I18n.i18n();
        this.#applyFilter();
    }
    static #fillCell(cell, type, value) {
        switch (type) {
            case 'string':
                if (value) {
                    cell.innerText = value;
                }
                break;
            case 'shortcut':
                if (value) {
                    const arr = value.split('+');
                    for (const key of arr) {
                        createElement('kbd', {
                            innerText: key,
                            parent: cell,
                        });
                    }
                    //cell.innerHTML = value;
                }
                break;
            default:
                if (value) {
                    cell.innerText = value;
                }
        }
    }
    static #getUniqueId() {
        return 'options-manager-' + (this.#uniqueId++);
    }
    static #createInput(optionName, option, value, resetButton) {
        if (!option) {
            return;
        }
        const showHideResetButton = () => {
            let defaultValue = this.#defaultValues.get(optionName)?.defaultValue;
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
                            const value = event.target.value.trim();
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
                for (const o of ['', 0, 1]) {
                    createElement('option', { innerHTML: String(o), parent: htmlElement });
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
                    for (const o of option.datalist) {
                        if (typeof o == 'string') {
                            createElement('option', { innerText: o, parent: htmlElement });
                        }
                        else {
                            // array
                            createElement('option', { innerText: o[0], parent: htmlElement, value: o[1] });
                        }
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
    static showOptionsManager() {
        if (!this.#shadowRoot) {
            this.#initPanel();
        }
        this.#refreshPanel();
        show(this.#shadowRoot?.host);
    }
    static async getOptionsPerType(type) {
        await this.#initPromise;
        const ret = new Map();
        for (const option of this.#defaultValues.values()) {
            if (option.type == type) {
                const optionName = option.name;
                ret.set(optionName, this.#currentValues.get(optionName));
            }
        }
        return ret;
    }
    static async getOption(name) {
        await this.#initPromise;
        return this.#defaultValues.get(name);
    }
    static async getOptionType(name) {
        await this.#initPromise;
        return this.#defaultValues.get(name)?.type;
    }
    static async getList(name) {
        await this.#initPromise;
        const option = this.#defaultValues.get(name);
        if (option && option.type == 'list') {
            return option.datalist;
        }
    }
}
function readVec2Value(value) {
    const v = value.split(',');
    if (v.length == 2) {
        return vec2.fromValues(Number(v[0]), Number(v[1]));
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
        for (const key of keys) {
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
class ShortcutHandler {
    static #shortcuts = new Map();
    static #eventTarget = new EventTarget();
    static {
        this.addContext('window', document);
    }
    static #handleKeyDown(contextName, event) {
        const contexts = contextName.split(',');
        for (const [name, shortcuts] of this.#shortcuts) {
            for (const shortcut of shortcuts) {
                for (const context of contexts) {
                    if (shortcut.match(context, event)) {
                        this.#eventTarget.dispatchEvent(new CustomEvent(name, { detail: event }));
                        event.preventDefault();
                        event.stopPropagation();
                    }
                }
            }
        }
    }
    static addContext(name, element) {
        element.addEventListener('keydown', (event) => this.#handleKeyDown(name, event));
    }
    static setShortcuts(contextName, shortcutMap) {
        if (!shortcutMap) {
            return;
        }
        this.#shortcuts.clear();
        for (const [name, shortcut] of shortcutMap) {
            this.addShortcut(contextName, name, shortcut);
        }
    }
    static setShortcut(contextName, name, shortcut) {
        this.#shortcuts.delete(name);
        this.addShortcut(contextName, name, shortcut);
    }
    static addShortcut(contextName, name, shortcut) {
        if (!shortcut) {
            return;
        }
        const shortcuts = shortcut.split(';');
        let shortcutSet = this.#shortcuts.get(name);
        if (!shortcutSet) {
            shortcutSet = new Set();
            this.#shortcuts.set(name, shortcutSet);
        }
        for (const shortcut of shortcuts) {
            shortcutSet.add(new Shortcut(contextName, shortcut));
        }
    }
    static addEventListener(type, callback, options) {
        this.#eventTarget.addEventListener(type, callback, options);
    }
}

var storageCSS = ":host{\n\tdisplay: block;\n\twidth: 100%;\n\theight: 100%;\n\tbackground-color: black;\n}\n";

const SEPARATOR = '/';
var EntryType;
(function (EntryType) {
    EntryType["File"] = "file";
    EntryType["Directory"] = "directory";
})(EntryType || (EntryType = {}));
// TODO: use FileSystemObserver?
class PersistentStorage {
    static #shadowRoot;
    static #htmlFilter;
    static #htmlTree;
    static #dirty = true;
    static #filter = { name: '' };
    static async estimate() {
        return navigator.storage.estimate();
    }
    static #initPanel() {
        if (this.#shadowRoot) {
            return;
        }
        defineHarmonyTree();
        this.#shadowRoot = createShadowRoot('persistent-storage', {
            parent: document.body,
            adoptStyle: storageCSS,
            childs: [
                this.#htmlFilter = createElement('input', {
                    $input: (event) => this.#setFilter(event.target.value),
                }),
                this.#htmlTree = createElement('harmony-tree', {
                    $contextmenu: (event) => {
                        console.info(event, event.detail.item);
                        event.detail.buildContextMenu({
                            path: { i18n: '#path', f: () => console.info(event.detail.item?.getPath(SEPARATOR)) },
                            delete: {
                                i18n: '#delete', f: () => {
                                    if (event.detail.item) ;
                                }
                            },
                        });
                    }
                }),
            ],
        });
    }
    static async createFile(path) {
        return this.#getHandle(path, 'file', true);
    }
    static async createDirectory(path) {
        return this.#getHandle(path, 'directory', true);
    }
    static async deleteFile(path) {
        return await this.#removeEntry(path, 'file', false);
    }
    static async deleteDirectory(path, recursive) {
        return await this.#removeEntry(path, 'directory', recursive);
    }
    static async clear() {
        try {
            // TODO: use remove() if it is ever standardized
            const root = await navigator.storage.getDirectory();
            for await (const key of root.keys()) {
                await root.removeEntry(key, { recursive: true });
            }
        }
        catch (e) {
            return false;
        }
        return true;
    }
    static async *listEntries(path, options = {}) {
        const entry = await this.#getHandle(path, 'directory', true);
        if (!entry || entry.kind == 'file') {
            return null;
        }
        const stack = [entry];
        let current;
        do {
            current = stack.pop();
            if (current) {
                /*
                if ((filter === undefined) || current.#matchFilter(filter)) {
                    childs.add(current);
                }
                    */
                if (options.recursive && current.kind == 'directory') {
                    for await (const handle of current.values()) {
                        stack.push(handle);
                        yield handle;
                    }
                }
            }
        } while (current);
        //return await this.#removeEntry(path, 'directory', recursive);
        return null;
    }
    static async #removeEntry(path, kind, recursive) {
        path = cleanPath(path);
        path.split(SEPARATOR);
        //console.info(splittedPath);
        let current = await navigator.storage.getDirectory();
        const pathElements = path.split(SEPARATOR);
        for (let i = 0; i < pathElements.length - 1; i++) {
            const subPath = pathElements[i];
            if (subPath == '') {
                continue;
            }
            current = await current.getDirectoryHandle(subPath, { create: false });
        }
        if (current.kind == kind) {
            try {
                await current.removeEntry(pathElements[pathElements.length - 1], { recursive: recursive });
                return true;
            }
            catch (e) {
                console.info(e);
            }
        }
        return false;
    }
    static async #getHandle(path, kind, create) {
        path = cleanPath(path);
        path.split(SEPARATOR);
        //console.info(splittedPath);
        let current = await navigator.storage.getDirectory();
        const pathElements = path.split(SEPARATOR);
        for (let i = 0; i < pathElements.length - 1; i++) {
            const subPath = pathElements[i];
            if (subPath == '') {
                continue;
            }
            current = await current.getDirectoryHandle(subPath, { create: create });
        }
        const name = pathElements[pathElements.length - 1];
        if (name == '') {
            return current;
        }
        if (kind == 'file') {
            return await current.getFileHandle(name, { create: create });
        }
        else {
            return await current.getDirectoryHandle(name, { create: create });
        }
    }
    static async #readFile(path) {
        try {
            const fileHandle = await this.#getHandle(path, 'file', false);
            if (fileHandle) {
                return await fileHandle.getFile();
            }
        }
        catch (e) { }
        return null;
    }
    static async readFile(path) {
        return this.#readFile(path);
    }
    static async readFileAsString(path) {
        const file = await this.#readFile(path);
        if (!file) {
            return null;
        }
        return file.text();
    }
    static async writeFile(path, file, options) {
        try {
            const fileHandle = await this.#getHandle(path, 'file', false);
            if (fileHandle) {
                const writable = await fileHandle.createWritable(options);
                await writable.write(file);
                await writable.close();
                return true;
            }
        }
        catch (e) { }
        return false;
    }
    static async showPanel() {
        this.#initPanel();
        this.#refresh();
    }
    static async #refresh() {
        if (this.#dirty) {
            this.#htmlTree?.setRoot(await this.#getRoot(await navigator.storage.getDirectory()));
            this.#dirty = false;
        }
    }
    static async #getRoot(entry) {
        const root = await this.#getElement(entry);
        root.isRoot = true;
        return root;
    }
    static async #getElement(entry, parent) {
        const childs = [];
        const tree = new TreeItem(entry.name, { childs: childs, parent: parent, userData: entry });
        if (entry.kind == 'directory') {
            for await (const [key, value] of entry.entries()) {
                if (this.#matchFilter(value)) {
                    childs.push(await this.#getElement(value, tree));
                }
            }
        }
        return tree;
    }
    static #setFilter(name) {
        this.#filter.name = name;
        this.#dirty = true;
        this.#refresh();
    }
    static #matchFilter(entry) {
        return entry.name.includes(this.#filter.name);
    }
}
function cleanPath(path) {
    if (!path.startsWith(SEPARATOR)) {
        path = SEPARATOR + path;
    }
    path.replace(/\\/g, '/');
    path.replace(/\/(\/)+/g, '/');
    return path;
}

function identity(e) {
    return e;
}
function toKeyValue(params, param) {
    const keyValue = param.split('=');
    const key = keyValue[0], value = keyValue[1];
    params[key] = params[key] ? [value].concat(params[key]) : value;
    return params;
}
function getQueryParams() {
    return decodeURIComponent(document.location.search).
        replace(/^\?/, '').split('&').
        filter(identity).
        reduce(toKeyValue, {});
}

function loadScript(script) {
    return new Promise((resolve) => {
        createElement('script', {
            src: script,
            parent: document.body,
            events: {
                load: () => resolve(true),
            }
        });
    });
}
async function loadScripts(scripts) {
    const promises = [];
    for (const script of scripts) {
        promises.push(loadScript(script));
    }
    await Promise.all(promises);
    return true;
}

function supportsPopover() {
    return Object.prototype.hasOwnProperty.call(HTMLElement, 'popover');
}

export { EntryType, Notification, NotificationEvents, NotificationType, NotificationsPlacement, OptionsManager, OptionsManagerEvents, PersistentStorage, SEPARATOR, ShortcutHandler, addNotification, addNotificationEventListener, closeNotification, getQueryParams, loadScript, loadScripts, saveFile, setNotificationsPlacement, supportsPopover };
