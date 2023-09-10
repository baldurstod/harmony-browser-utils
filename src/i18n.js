const I18N_DELAY_BEFORE_REFRESH = 100;

export const I18n = new (function () {
	class I18n extends EventTarget {
		#path = './json/i18n/';
		#lang = 'english';
		#translations = new Map();
		#executing = false;
		#refreshTimeout;

		constructor() {
			super();
		}

		start() {
			this.#initObserver();
			this.i18n();//Scan everything to get html elements created before I18n
		}

		setOptions(options) {
			if (options.path) {
				this.#path = options.path;
			}

			if (options.translations) {
				for (let file of options.translations) {
					this.#loaded(file);
				}
			}
		}

		#initObserver() {
			//const config = {attributes: true, childList: true, subtree: true, attributeFilter:['class', 'data-i18n', 'data-i18n-title', 'data-i18n-placeholder']};
			const config = {childList: true, subtree: true, attributeFilter: ['i18n']};
			const callback = async (mutationsList, observer) => {
				for(let mutation of mutationsList) {
					if (mutation.type === 'childList') {
						for (let node of mutation.addedNodes) {
							if (node instanceof HTMLElement) {
								this.updateElement(node);
							}
						}
					} else if (mutation.type === 'attributes') {
						this.updateElement(mutation.target);
					}
				}
			};
			new MutationObserver(callback).observe(document.body, config);
		}

		#processList(parentNode, className, attribute, subElement) {
			const elements = parentNode.querySelectorAll('.' + className);

			if (parentNode.classList?.contains(className)) {
				this.#processElement(parentNode, attribute, subElement);
			}

			for (let element of elements) {
				this.#processElement(element, attribute, subElement);
			}
		}

		#processElement(htmlElement, attribute, subElement) {
			let dataLabel = htmlElement.getAttribute(attribute);
			if (dataLabel) {
				htmlElement[subElement] = this.getString(dataLabel);
			}
		}

		i18n() {
			if (!this.#refreshTimeout) {
				this.#refreshTimeout = setTimeout((event) => this.#i18n(), I18N_DELAY_BEFORE_REFRESH);
			}
		}

		#i18n() {
			this.#refreshTimeout = null;
			if (this.#lang == '') {return;}
			if (this.#executing) {return;}
			this.#executing = true;
			this.#processList(document, 'i18n', 'data-i18n', 'innerHTML');
			this.#processList(document, 'i18n-title', 'data-i18n-title', 'title');
			this.#processList(document, 'i18n-placeholder', 'data-i18n-placeholder', 'placeholder');
			this.#processList(document, 'i18n-label', 'data-i18n-label', 'label');
			this.#executing = false;
			return;
		}

		updateElement(htmlElement) {
			if (this.#lang == '') {return;}

			this.#processList(htmlElement, 'i18n', 'data-i18n', 'innerHTML');
			this.#processList(htmlElement, 'i18n-title', 'data-i18n-title', 'title');
			this.#processList(htmlElement, 'i18n-placeholder', 'data-i18n-placeholder', 'placeholder');
			this.#processList(htmlElement, 'i18n-label', 'data-i18n-label', 'label');
		}

		set lang(lang) {
			if (this.#lang != lang) {
				this.dispatchEvent(new CustomEvent('langchanged', {detail: {oldLang: this.#lang, newLang: lang}}));
				this.#lang = lang;
				this.checkLang();
				this.i18n();
			}
		}

		getString(s) {
			if (this.checkLang()) {
				if (this.#translations.get(this.#lang).strings) {
					let s2 = this.#translations.get(this.#lang).strings[s]
					if (typeof s2 == 'string') {
						return s2;
					} else {
						console.warn('Missing translation for key ' + s);
						return s;
					}
				}
			}
			return s;
		}

		formatString(s, values) {
			let str = this.getString(s);

			for (let key in values) {
				str = str.replace(new RegExp("\\\${" + key + "\\}", "gi"), values[key]);
			}
			return str;
		}

		get authors() {
			if (this.checkLang()) {
				if (this.#translations.get(this.#lang).authors) {
					return this.#translations.get(this.#lang).authors;
				}
			}
			return [];
		}

		checkLang() {
			if (this.#translations.has(this.#lang)) {
				return true;
			} else {
				let url = this.#path + this.#lang + '.json';
				fetch(new Request(url)).then((response) => {
					response.json().then((json) => {
						this.#loaded(json);
					})
				});
				this.#translations.set(this.#lang, {});
				return false;
			}
		}

		#loaded(file) {
			if (file) {
				let lang = file.lang;
				this.#translations.set(lang, file);
				this.i18n();
				this.dispatchEvent(new CustomEvent('translationsloaded'));
			}
		}
	}
	return I18n;
}());
