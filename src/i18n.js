const I18N_DELAY_BEFORE_REFRESH = 100;

export const I18n = new (function () {
	class I18n extends EventTarget {
		#path = './json/i18n/';
		#lang = 'english';
		#translations = new Map();
		#executing = false;
		#refreshTimeout;
		#observerConfig = {childList: true, subtree: true, attributeFilter: ['i18n', 'data-i18n-json', 'data-i18n-values']};
		#observer;

		constructor() {
			super();
			this.#initObserver();
		}

		start() {
			this.observeElement(document.body);
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
			this.#observer = new MutationObserver(callback);
		}

		observeElement(element) {
			this.#observer.observe(element, this.#observerConfig);
			this.updateElement(element);
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

		#processJSON(parentNode) {
			const className = 'i18n';
			const elements = parentNode.querySelectorAll('.' + className);

			if (parentNode.classList?.contains(className)) {
				this.#processElementJSON(parentNode);
			}

			for (let element of elements) {
				this.#processElementJSON(element);
			}
		}

		#processElement(htmlElement, attribute, subElement) {
			let dataLabel = htmlElement.getAttribute(attribute);
			if (dataLabel) {
				htmlElement[subElement] = this.getString(dataLabel);
			}
		}

		#processElementJSON(htmlElement) {
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
			} else {
				valuesJSON = dataJSON.values;
			}

			const innerHTML = dataJSON.innerHTML;
			if (innerHTML) {
				htmlElement.innerHTML = this.formatString(innerHTML, valuesJSON);
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
			this.#processJSON(document);
			this.#executing = false;
			return;
		}

		updateElement(htmlElement) {
			if (this.#lang == '') {return;}

			this.#processList(htmlElement, 'i18n', 'data-i18n', 'innerHTML');
			this.#processList(htmlElement, 'i18n-title', 'data-i18n-title', 'title');
			this.#processList(htmlElement, 'i18n-placeholder', 'data-i18n-placeholder', 'placeholder');
			this.#processList(htmlElement, 'i18n-label', 'data-i18n-label', 'label');
			this.#processJSON(htmlElement);
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
