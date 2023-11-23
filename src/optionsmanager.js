import { createElement, hide, show } from 'harmony-ui';

import { I18n } from './i18n.js';

import './css/optionsmanager.css';

export const OptionsManager = new (function () {
	class OptionsManager extends EventTarget {
		#defaultValues = new Map();
		#currentValues = new Map();
		#categories = new Map();
		#dirtyCategories = true;
		#initPromiseResolve;
		#initPromise = new Promise((resolve) => this.#initPromiseResolve = resolve);
		#currentFilter = '';
		#optionsManagerRows = new Set();
		#htmlOptionsManagerContainer;
		#htmlOptionsTable;
		#htmlOptionsManagerContentThead;
		static #uniqueId = 0;

		constructor() {
			super();

			this.#defaultValues[Symbol.iterator] = function* () {
				yield* [...this.entries()].sort(
					(a, b) => {return a[0] < b[0] ? -1 : 1;}
				);
			}
		}

		async init(parameters) {
			if (parameters.url) {
				await this.#initFromURL(parameters.url);
			} else if (parameters.json) {
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
					json.options.forEach((option) => this.addOption(option));
				}
				this.#initPromiseResolve();
			}
		}

		#addCategory(name) {
			this.#categories.set(name.toLowerCase(), []);
			this.#dirtyCategories = true;
		}

		#refreshCategories(name) {
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

		addOption(option) {
			if (!option) {return;}
			let name = option.name.toLowerCase();

			let type = option.type;
			let defaultValue = option.default;
			let datalist = option.datalist;
			let editable = option.editable;
			let dv = this.#defaultValues.get(name) || {};
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
					} else {
						this.setItem(name, value);
					}
				}
			} catch (exception) {
				if (OptionsManager.logException) {
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
			} catch (exception) {
				if (OptionsManager.logException) {
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
			} catch (exception) {
				if (OptionsManager.logException) {
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
			} catch (exception) {
				if (OptionsManager.logException) {
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
			} catch (exception) {
				if (OptionsManager.logException) {
					console.error(exception);
				}
			}
		}

		#valueChanged(name, value) {
			this.dispatchEvent(new CustomEvent(name, {detail:{name:name, value:value}}));
			let lastIndex = name.lastIndexOf('.');
			while (lastIndex != -1) {
				let wildCardName = name.slice(0, lastIndex);
				this.dispatchEvent(new CustomEvent(wildCardName + '.*', {detail:{name:name, value:value}}));
				lastIndex = name.lastIndexOf('.', lastIndex - 1);
			}

			this.dispatchEvent(new CustomEvent('*', {detail:{name:name, value:value}}));
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
			} catch (exception) {
				if (OptionsManager.logException) {
					console.error(exception);
				}
			}
			if (this.#defaultValues.get(name)) {
				return this.#defaultValues.get(name).dv;
			}
		}

		removeItem(name) {
			this.#defaultValues.delete(name);
			try {
				if (typeof localStorage != 'undefined') {
					localStorage.removeItem(name);
				}
				this.#currentValues.delete(name);
			} catch (exception) {
				if (OptionsManager.logException) {
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
			for (name of names) {
				this.resetItem(name);
			}
		}

		resetAllItems(name) {
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
			} catch (exception) {
				if (OptionsManager.logException) {
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
				let optionName = row.getAttribute('user-data-option-name').toLowerCase();

				if (!this.#currentFilter || optionName.indexOf(this.#currentFilter) != -1) {
					row.style.display = '';
				} else {
					row.style.display = 'none';
				}
			}
		}

		#initPanel() {
			this.#htmlOptionsManagerContainer = createElement('div', {
				id: 'options-manager-outer',
				parent: document.body,
				events: {
					click: event => hide(this.#htmlOptionsManagerContainer)
				}
			});

			let options_manager_inner = createElement('div', {
				id: 'options-manager-inner',
				draggable: true,
				'data-left': 0,
				'data-top': 0,
				parent: this.#htmlOptionsManagerContainer,
				events: {
					click: event => event.stopPropagation(),
					dragstart: event => handleDragStart(event),
					dragend: event => handleDragEnd(event),
				}
			});

			let handleDragStart = function(event) {
				let target = event.target;

				target.setAttribute('data-drag-start-layerx', event.layerX);
				target.setAttribute('data-drag-start-layery', event.layerY);
			};

			let handleDragEnd = function(event) {
				let target = event.target;

				let startEventX = target.getAttribute('data-drag-start-layerx');
				let startEventY = target.getAttribute('data-drag-start-layery');

				target.style.left = (event.layerX - startEventX) + 'px';
				target.style.top = (event.layerY - startEventY) + 'px';

				let dataTop = target.getAttribute('data-top') * 1 + (event.layerY - startEventY);
				let dataLeft = target.getAttribute('data-left') * 1 + (event.layerX - startEventX);

				target.style.left = dataLeft + 'px';
				target.style.top = dataTop + 'px';

				options_manager_inner.setAttribute('data-left', dataLeft);
				options_manager_inner.setAttribute('data-top', dataTop);
			};

			createElement('h1', {id: 'options-manager-title', i18n: '#manage_options', parent: options_manager_inner});

			let options_manager_filter = createElement('input', {
				id: 'options-manager-inner-filter',
				'i18n-placeholder': '#filter',
				parent: options_manager_inner,
				events: {
					input: event => this.#filter(event.target.value)
				}
			});

			this.#htmlOptionsTable = createElement('table', {parent: options_manager_inner});
			this.#htmlOptionsManagerContentThead = createElement('thead', {parent: this.#htmlOptionsTable});
		}

		#populateOptionRow(option) {
			let htmlRow = createElement('tr');
			let htmlResetButtonCell = createElement('td');
			let htmlOptionNameCell = createElement('td', {innerHTML: option.name});
			let htmlDefaultValueCell = createElement('td');
			let htmlUserValueCell = createElement('td');

			let myValue = this.getItem(option.name);

			this.#fillCell(htmlDefaultValueCell, option.type, option.dv);

			let resetButton = createElement('button', {
				class: 'options-manager-button',
				i18n: '#reset',
				parent: htmlResetButtonCell,
				events: {
					click: (event) => {this.resetItem(option.name);this.#refreshPanel();}
				}
			});

			let valueEdit = this.#createInput(option.name, this.#defaultValues.get(option.name), myValue, htmlResetButtonCell);
			htmlUserValueCell.appendChild(valueEdit);
			htmlRow.append(htmlResetButtonCell, htmlOptionNameCell, htmlDefaultValueCell, htmlUserValueCell);
			return htmlRow;
		}

		#populateMapOptionRow(option) {
			let htmlRow = createElement('tbody', {innerHTML: `<td></td><td colspan="3">${option.name}</td>`});

			let userValue = this.getItem(option.name);
			if (userValue && typeof userValue === 'object') {
				for (let key in userValue) {
					let htmlSubRow = createElement('tr', {parent: htmlRow});
					let value = userValue[key];

					let htmlRemoveButtonCell = createElement('td');
					let htmlSubNameCell = createElement('td', {innerHTML: key});
					let htmlSubValueCell = createElement('td');
					htmlSubRow.append(htmlRemoveButtonCell, htmlSubNameCell, htmlSubValueCell);

					let htmlEdit = createElement('input', {value: value, parent: htmlSubValueCell});
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
			} else {
				htmlRow = this.#populateOptionRow(option);
			}

			htmlRow.setAttribute('user-data-option-name', option.name);

			return htmlRow;
		}

		#refreshPanel() {
			this.#refreshCategories();
			this.#htmlOptionsManagerContentThead.innerHTML = '';

			this.#htmlOptionsManagerContentThead.append(
				createElement('th', {child: createElement('button', {
					class: 'options-manager-button',
					i18n: '#reset_all',
					events: {
						click: (event) => {this.resetAllItems();this.#refreshPanel();}
					}
				})}),
				createElement('th', {i18n: '#option_name'}),
				createElement('th', {i18n: '#option_default_value'}),
				createElement('th', {i18n: '#option_user_value'}),
			);

			for (let row of this.#optionsManagerRows) {
				row.remove();
			}
			this.#optionsManagerRows.clear();

			for (let [categoryName, category] of this.#categories) {
				for (let option of category) {
					let htmlRow = this.#addOptionRow(option);
					if (htmlRow) {
						this.#optionsManagerRows.add(htmlRow);
						this.#htmlOptionsTable.append(htmlRow);
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

		static #getUniqueId() {
			return 'options-manager-' + (this.#uniqueId++);
		}

		#createInput(optionName, option, value, resetButton) {
			let showHideResetButton = () => {
				let defaultValue = this.#defaultValues.get(optionName).dv;
				defaultValue = defaultValue === null ? null : JSON.stringify(defaultValue);
				let optionValue = this.getItem(optionName);
				optionValue = optionValue === null ? null : JSON.stringify(optionValue);
				if ((optionValue) != defaultValue) {
					resetButton.style.opacity = '';
				} else {
					resetButton.style.opacity = '0';
				}
			}

			let htmlElement;
			switch (option.type) {
				case 'number':
				case 'integer':
					htmlElement = createElement('input', {
						value: value,
						events: {
							change: event => {
								let value = event.target.value.trim();
								this.setItem(optionName, value === '' ? null : Number(value));
								showHideResetButton();
							}
						}
					});
					break;
				case 'object':
					htmlElement = createElement('input',  {
						value: JSON.stringify(value),
						events: {
							change: event => {this.setItem(optionName, JSON.parse(event.target.value));showHideResetButton();}
						}
					});
					break;
				case 'boolean':
					htmlElement = createElement('input', {
						type: 'checkbox',
						checked: value,
						events: {
							change: event => {this.setItem(optionName, event.target.checked);showHideResetButton();}
						}
					});
					break;
				case 'ternary':
					htmlElement = createElement('select', {
						events: {
							change: event => {
								let value;
								switch (event.target.value) {
									case "0":
										value = false;
										break;
									case "1":
										value = true;
										break;
								}
								this.setItem(optionName, value);
								showHideResetButton();
							}
						}
					});
					for(let o of ['', 0, 1]) {
						createElement('option', {innerHTML: o, parent: htmlElement});
					}
					let v;
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
					let dataListId = OptionsManager.#getUniqueId();
					htmlElement = createElement('select', {
						value: value,
						events: {
							change: event => {this.setItem(optionName, event.target.value);showHideResetButton();}
						}
					});
					if (option.datalist) {
						for(let o of option.datalist) {
							createElement('option', {innerHTML: o, parent: htmlElement});
						}
					}
					htmlElement.value = value;
					break;
				case 'vec2':
					htmlElement = createElement('input', {
						value: value,
						events: {
							change: event => {this.setItem(optionName, (readVec2Value(event.target.value)));showHideResetButton();}
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
							change: event => {this.setItem(optionName, (event.target.value));showHideResetButton();}
						}
					});
					break;
			}
			showHideResetButton();
			return htmlElement;
		}

		showOptionsManager() {
			if (!this.#htmlOptionsManagerContainer) {
				this.#initPanel();
			}
			this.#refreshPanel();
			show(this.#htmlOptionsManagerContainer);
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
	return OptionsManager;
}());


function readVec2Value(value) {
	let v = value.split(',');
	if (v.length == 2) {
		return [v[0] * 1, v[1] * 1];
	}
	return null;
}
