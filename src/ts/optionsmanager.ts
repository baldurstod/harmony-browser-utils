import { vec2 } from 'gl-matrix';
import { createElement, hide, show, I18n, createShadowRoot } from 'harmony-ui';
import optionsManagerCSS from '../css/optionsmanager.css';

export type Option = { name: string, editable: boolean, type: string, defaultValue?: string, datalist?: Array<any>, context?: string, protected?: boolean };
export type OptionValue = string | number | boolean | bigint | OptionMap | null | undefined;
export type OptionMap = { [key: string]: OptionValue };
export type SubOption = { [key: string]: Option };

export const OptionsManagerEvents = new EventTarget();

export type OptionsManagerEvent = {
	name: string;
	value: OptionValue;
	context?: string;
}

export class OptionsManager {
	static #defaultValues = new Map<string, Option>();
	static #currentValues = new Map<string, OptionValue>();
	static #categories = new Map<string, Array<any/*TODO:better type*/>>();
	static #dirtyCategories = true;
	static #initPromiseResolve?: (value?: unknown) => void;
	static #initPromise = new Promise((resolve) => this.#initPromiseResolve = resolve);
	static #currentFilter = '';
	static #optionsManagerRows = new Set<HTMLElement>();
	static #htmlOptionsTable?: HTMLTableElement;
	static #htmlOptionsManagerContentThead?: HTMLElement;
	static #uniqueId = 0;
	static #shadowRoot?: ShadowRoot;
	static logException = false;

	static {

		this.#defaultValues[Symbol.iterator] = function* (): MapIterator<[string, Option]> {
			yield* [...this.entries()].sort(
				(a, b) => { return a[0] < b[0] ? -1 : 1; }
			);
		}
	}

	static async init(parameters: { [key: string]: any }) {
		if (parameters.url) {
			await this.#initFromURL(parameters.url);
		} else if (parameters.json) {
			this.#initFromJSON(parameters.json);
		}
	}

	static async #initFromURL(url: string) {
		const response = await fetch(url);
		this.#initFromJSON(await response.json());
	}

	static #initFromJSON(json: { [key: string]: any }) {
		if (json) {
			if (json.categories) {
				json.categories.forEach((category: string) => this.#addCategory(category));
			}
			this.#addCategory('');
			if (json.options) {
				json.options.forEach((option: any/*TODO:better type*/) => this.addOption(option));
			}
			if (this.#initPromiseResolve) {
				this.#initPromiseResolve();
			}
		}
	}

	static #addCategory(name: string) {
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

	static addOption(option: any/*TODO:better type*/) {
		if (!option) { return; }
		const name = option.name.toLowerCase();

		const type = option.type;
		const defaultValue = option.default;
		const datalist = option.datalist;
		const editable = option.editable;
		const context = option.context;
		const protec = option.protected;
		const dv: Option = this.#defaultValues.get(name) || { name: '', editable: true, type: '' };
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
				} else {
					this.setItem(name, value);
				}
			}
		} catch (exception) {
			if (this.logException) {
				console.error(exception);
			}
		}
	}

	static setItem(name: string, value: any) {
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
		} catch (exception) {
			if (this.logException) {
				console.error(exception);
			}
		}
	}

	static async getSubItem(name: string, subName: string) {
		try {
			const option = await this.getOption(name);
			if (option && option.type == 'map') {
				const map = this.#currentValues.get(name) ?? {};
				if (map && (typeof map == 'object')) {
					return (map as OptionMap)[subName];
				}
			}
		} catch (exception) {
			if (this.logException) {
				console.error(exception);
			}
		}
	}

	static async setSubItem(name: string, subName: string, value: any) {
		try {
			const option = await this.getOption(name);
			if (option && option.type == 'map') {
				const map = this.#currentValues.get(name) ?? {};

				if ((map as OptionMap)[subName] == value) {
					return;
				}
				(map as OptionMap)[subName] = value;
				this.#valueChanged(name, map);

				localStorage.setItem(name, JSON.stringify(map));
			}
		} catch (exception) {
			if (this.logException) {
				console.error(exception);
			}
		}
	}

	static removeSubItem(name: string, subName: string) {
		try {
			const map = this.#currentValues.get(name) ?? {};
			if (map && (typeof map == 'object')) {
				delete (map as OptionMap)[subName];
				this.#valueChanged(name, map);
				localStorage.setItem(name, JSON.stringify(map));
			}
		} catch (exception) {
			if (this.logException) {
				console.error(exception);
			}
		}
	}

	static #valueChanged(name: string, value: any) {
		const option = this.#defaultValues.get(name);
		if (!option) {
			return;
		}
		const context = option.context;
		OptionsManagerEvents.dispatchEvent(new CustomEvent<OptionsManagerEvent>(name, { detail: { name: name, value: value, context: context } }));
		let lastIndex = name.lastIndexOf('.');
		while (lastIndex != -1) {
			const wildCardName = name.slice(0, lastIndex);
			OptionsManagerEvents.dispatchEvent(new CustomEvent<OptionsManagerEvent>(wildCardName + '.*', { detail: { name: name, value: value, context: context } }));
			lastIndex = name.lastIndexOf('.', lastIndex - 1);
		}

		OptionsManagerEvents.dispatchEvent(new CustomEvent<OptionsManagerEvent>('*', { detail: { name: name, value: value, context: context } }));
	}

	static getItem(name: string) {
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
		} catch (exception) {
			if (this.logException) {
				console.error(exception);
			}
		}
		if (this.#defaultValues.get(name)) {
			return this.#defaultValues.get(name)?.defaultValue;
		}
	}

	static removeItem(name: string) {
		this.#defaultValues.delete(name);
		try {
			if (typeof localStorage != 'undefined') {
				localStorage.removeItem(name);
			}
			this.#currentValues.delete(name);
		} catch (exception) {
			if (this.logException) {
				console.error(exception);
			}
		}
	}

	static resetItem(name: string) {
		const item = this.#defaultValues.get(name);
		if (item) {
			const defaultValue = item.defaultValue;
			this.#currentValues.delete(name);
			this.setItem(name, defaultValue);
		}
	}

	static resetItems(names: Array<string>) {
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
		} catch (exception) {
			if (this.logException) {
				console.error(exception);
			}
		}
	}

	static #filter(filter: string) {
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
			} else {
				row.style.display = 'none';
			}
		}
	}

	static #initPanel() {
		this.#shadowRoot = createShadowRoot('options-manager', {
			parent: document.body,
			adoptStyle: optionsManagerCSS,
			events: {
				click: () => hide(this.#shadowRoot?.host as HTMLElement)
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
				click: (event: MouseEvent) => event.stopPropagation(),
				dragstart: (event: MouseEvent) => handleDragStart(event),
				dragend: (event: MouseEvent) => handleDragEnd(event),
			}
		}) as HTMLElement;

		const handleDragStart = function (event: MouseEvent) {
			const target = event.target as HTMLElement;

			target?.setAttribute('data-drag-start-layerx', String(event.layerX));
			target?.setAttribute('data-drag-start-layery', String(event.layerY));
		};

		const handleDragEnd = function (event: MouseEvent) {
			const target = event.target as HTMLElement;

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

		const options_manager_filter = createElement('input', {
			id: 'options-manager-inner-filter',
			i18n: { placeholder: '#filter', },
			parent: optionsManagerInner,
			events: {
				input: (event: Event) => this.#filter((event.target as HTMLInputElement).value)
			}
		});

		this.#htmlOptionsTable = createElement('table', { parent: optionsManagerInner }) as HTMLTableElement;
		this.#htmlOptionsManagerContentThead = createElement('thead', { parent: this.#htmlOptionsTable });
	}

	static #populateOptionRow(option: Option) {
		const htmlRow = createElement('tr');
		const htmlResetButtonCell = createElement('td');
		const htmlOptionNameCell = createElement('td', { innerHTML: option.name });
		const htmlDefaultValueCell = createElement('td');
		const htmlUserValueCell = createElement('td');

		const myValue = this.getItem(option.name);

		this.#fillCell(htmlDefaultValueCell, option.type, option.defaultValue);

		const resetButton = createElement('button', {
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

	static #populateMapOptionRow(option: Option) {
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

				const htmlEdit = createElement('input', { value: value, parent: htmlSubValueCell });
			}
		}
		return htmlRow;
	}

	static #addOptionRow(option: Option) {
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

	static #refreshPanel() {
		this.#refreshCategories();
		if (this.#htmlOptionsManagerContentThead) {
			this.#htmlOptionsManagerContentThead.innerText = '';
			this.#htmlOptionsManagerContentThead.append(
				createElement('th', {
					child: createElement('button', {
						class: 'options-manager-button',
						i18n: '#reset_all',
						events: {
							click: () => { this.resetAllItems(); this.#refreshPanel(); }
						}
					})
				}),
				createElement('th', { i18n: '#option_name' }),
				createElement('th', { i18n: '#option_default_value' }),
				createElement('th', { i18n: '#option_user_value' }),
			);
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

	static #fillCell(cell: HTMLElement, type: string, value?: string) {
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

	static #createInput(optionName: string, option: Option | undefined, value: any, resetButton: HTMLElement) {
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
			} else {
				resetButton.style.opacity = '0';
			}
		}

		let htmlElement: HTMLElement;
		switch (option.type) {
			case 'number':
			case 'integer':
				htmlElement = createElement('input', {
					value: value,
					events: {
						change: (event: Event) => {
							const value = (event.target as HTMLInputElement).value.trim();
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
						change: (event: Event) => { this.setItem(optionName, JSON.parse((event.target as HTMLInputElement).value)); showHideResetButton(); }
					}
				});
				break;
			case 'boolean':
				htmlElement = createElement('input', {
					type: 'checkbox',
					checked: value,
					events: {
						change: (event: Event) => { this.setItem(optionName, (event.target as HTMLInputElement).checked); showHideResetButton(); }
					}
				});
				break;
			case 'ternary':
				htmlElement = createElement('select', {
					events: {
						change: (event: Event) => {
							let value;
							switch ((event.target as HTMLSelectElement).value) {
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

				(htmlElement as HTMLSelectElement).value = v;
				break;
			case 'list':
				this.#getUniqueId();
				htmlElement = createElement('select', {
					value: value,
					events: {
						change: (event: Event) => { this.setItem(optionName, (event.target as HTMLSelectElement).value); showHideResetButton(); }
					}
				});
				if (option.datalist) {
					for (const o of option.datalist) {
						createElement('option', { innerHTML: o, parent: htmlElement });
					}
				}
				(htmlElement as HTMLSelectElement).value = value;
				break;
			case 'vec2':
				htmlElement = createElement('input', {
					value: value,
					events: {
						change: (event: Event) => { this.setItem(optionName, (readVec2Value((event.target as HTMLSelectElement).value))); showHideResetButton(); }
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
						change: (event: Event) => { this.setItem(optionName, ((event.target as HTMLInputElement).value)); showHideResetButton(); }
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
		show(this.#shadowRoot?.host as (HTMLElement | undefined));
	}

	static async getOptionsPerType(type: string) {
		await this.#initPromise;
		const ret = new Map<string, any>();

		for (const option of this.#defaultValues.values()) {
			if (option.type == type) {
				const optionName = option.name;
				ret.set(optionName, this.#currentValues.get(optionName));
			}
		}
		return ret;
	}

	static async getOption(name: string) {
		await this.#initPromise;
		return this.#defaultValues.get(name);
	}

	static async getOptionType(name: string) {
		await this.#initPromise;
		return this.#defaultValues.get(name)?.type;
	}

	static async getList(name: string) {
		await this.#initPromise;
		const option = this.#defaultValues.get(name);
		if (option && option.type == 'list') {
			return option.datalist;
		}
	}
}

function readVec2Value(value: string): vec2 | null {
	const v = value.split(',');
	if (v.length == 2) {
		return vec2.fromValues(Number(v[0]), Number(v[1]));
	}
	return null;
}
