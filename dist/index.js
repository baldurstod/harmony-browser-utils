import { createShadowRoot, I18n, createElement, hide, show } from 'harmony-ui';
import { contentCopySVG, closeSVG } from 'harmony-svg';
import { vec2 } from 'gl-matrix';

function SaveFile(file) {
    var link = document.createElement('a');
    link.setAttribute('href', URL.createObjectURL(file));
    link.setAttribute('download', file.name);
    link.click();
}

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
            this.timeout = setTimeout(() => new NotificationManager().closeNofication(this), ttl * 1000);
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
                            click: () => new NotificationManager().closeNofication(this),
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
    static #instance;
    #htmlParent = document.body;
    #shadowRoot = createShadowRoot('div', {
        class: 'notification-manager',
        parent: this.#htmlParent,
        adoptStyle: notificationManagerCSS,
    });
    #nofifications = new Set();
    constructor() {
        if (NotificationManager.#instance) {
            return NotificationManager.#instance;
        }
        NotificationManager.#instance = this;
        I18n.observeElement(this.#shadowRoot);
    }
    setParent(htmlParent) {
        this.#htmlParent = htmlParent;
        this.#htmlParent.append(this.#shadowRoot.host);
    }
    #getNotification(content, type, ttl) {
        for (let notification of this.#nofifications) {
            if ((notification.content == content) && (notification.type == type)) {
                notification.setTtl(ttl);
                return notification;
            }
        }
        return new Notification(content, type, ttl);
    }
    addNotification(content, type, ttl) {
        let notification = this.#getNotification(content, type, ttl);
        this.#nofifications.add(notification);
        this.#shadowRoot.append(notification.view);
    }
    closeNofication(notification) {
        this.#nofifications.delete(notification);
        notification.view.remove();
    }
}

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
        let context = option.context;
        let dv = this.#defaultValues.get(name) || { name: '', editable: true, type: '' };
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
        if (context !== undefined) {
            dv.context = context;
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
        const option = this.#defaultValues.get(name);
        if (!option) {
            return;
        }
        const context = option.context;
        this.dispatchEvent(new CustomEvent(name, { detail: { name: name, value: value, context: context } }));
        let lastIndex = name.lastIndexOf('.');
        while (lastIndex != -1) {
            let wildCardName = name.slice(0, lastIndex);
            this.dispatchEvent(new CustomEvent(wildCardName + '.*', { detail: { name: name, value: value, context: context } }));
            lastIndex = name.lastIndexOf('.', lastIndex - 1);
        }
        this.dispatchEvent(new CustomEvent('*', { detail: { name: name, value: value, context: context } }));
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
            this.#currentValues.delete(name);
            this.setItem(name, defaultValue);
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
                if (value) {
                    cell.innerHTML = value;
                }
                break;
            case 'shortcut':
                if (value) {
                    let arr = value.split('+');
                    for (let key of arr) {
                        createElement('kbd', {
                            innerHTML: key,
                            parent: cell,
                        });
                    }
                    //cell.innerHTML = value;
                }
                break;
            default:
                if (value) {
                    cell.innerHTML = value;
                }
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
        let ret = new Map();
        for (let option of this.#defaultValues.values()) {
            if (option.type == type) {
                let optionName = option.name;
                ret.set(optionName, this.#currentValues.get(optionName));
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
class ShortcutHandler extends EventTarget {
    static #instance;
    #shortcuts = new Map();
    #contexts = new Map();
    constructor() {
        if (ShortcutHandler.#instance) {
            return ShortcutHandler.#instance;
        }
        super();
        ShortcutHandler.#instance = this;
        this.addContext('window', document);
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
        element.addEventListener('keydown', (event) => this.#handleKeyDown(name, event));
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

function supportsPopover() {
    return HTMLElement.prototype.hasOwnProperty('popover');
}

export { NotificationManager, OptionsManager, SaveFile, ShortcutHandler, supportsPopover };
