function SaveFile(file) {
	var link = document.createElement('a');
	link.setAttribute('href', URL.createObjectURL(file));
	link.setAttribute('download', file.name);

	link.click();
}

function createElement(tagName, options) {
	let element = document.createElement(tagName);
	createElementOptions(element, options);
	return element;
}

function createElementOptions(element, options) {
	if (options) {
		for (let optionName in options) {
			let optionValue = options[optionName];
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
				case 'parent':
					optionValue.append(element);
					break;
				case 'child':
					if (optionValue) {
						element.append(optionValue);
					}
					break;
				case 'childs':
					optionValue.forEach(entry => {
						if (entry !== null && entry !== undefined) {
							element.append(entry);
						}
					});
					break;
				case 'events':
					for (let eventType in optionValue) {
						let eventParams = optionValue[eventType];
						if (typeof eventParams === 'function') {
							element.addEventListener(eventType, eventParams);
						} else {
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
				default:
					if (optionName.startsWith('data-')) {
						element.setAttribute(optionName, optionValue);
					} else {
						element[optionName] = optionValue;
					}
					break;
			}
		}
	}
	return element;
}

function display(htmlElement, visible) {
	if (htmlElement == undefined) return;

	if (visible) {
		htmlElement.style.display = '';
	} else {
		htmlElement.style.display = 'none';
	}
}

function hide(htmlElement) {
	display(htmlElement, false);
}

var img$1 = "data:image/svg+xml,%3csvg viewBox='0 0 357 357'%3e%3cpolygon points='357%2c35.7 321.3%2c0 178.5%2c142.8 35.7%2c0 0%2c35.7 142.8%2c178.5 0%2c321.3 35.7%2c357 178.5%2c214.2 321.3%2c357 357%2c321.3 214.2%2c178.5'/%3e%3c/svg%3e";

var img = "data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' height='24' viewBox='0 -960 960 960' width='24'%3e%3cpath d='M360-240q-33 0-56.5-23.5T280-320v-480q0-33 23.5-56.5T360-880h360q33 0 56.5 23.5T800-800v480q0 33-23.5 56.5T720-240H360Zm0-80h360v-480H360v480ZM200-80q-33 0-56.5-23.5T120-160v-560h80v560h440v80H200Zm160-240v-480 480Z'/%3e%3c/svg%3e";

function styleInject(css, ref) {
  if ( ref === void 0 ) ref = {};
  var insertAt = ref.insertAt;

  if (!css || typeof document === 'undefined') { return; }

  var head = document.head || document.getElementsByTagName('head')[0];
  var style = document.createElement('style');
  style.type = 'text/css';

  if (insertAt === 'top') {
    if (head.firstChild) {
      head.insertBefore(style, head.firstChild);
    } else {
      head.appendChild(style);
    }
  } else {
    head.appendChild(style);
  }

  if (style.styleSheet) {
    style.styleSheet.cssText = css;
  } else {
    style.appendChild(document.createTextNode(css));
  }
}

var css_248z = ".notification-manager{\r\n\tposition: absolute;\r\n\tz-index: 100;\r\n\tbottom: 0px;\r\n\twidth: 100%;\r\n\tdisplay: flex;\r\n\tflex-direction: column-reverse;\r\n\tmax-height: 50%;\r\n\toverflow-y: auto;\r\n}\r\n.notification-manager-notification{\r\n\tbackground-color: var(--theme-popup-bg-color);\r\n\tcolor: var(--theme-text-color);\r\n\tfont-size: 1.5em;\r\n\tpadding: 4px;\r\n\tdisplay: flex;\r\n\talign-items: center;\r\n}\r\n.notification-manager-notification-content{\r\n\toverflow: auto;\r\n\tflex: 1;\r\n\tmax-width: calc(100% - 20px);\r\n}\r\n.notification-manager-notification-close, .notification-manager-notification-copy{\r\n\tfill: currentColor;\r\n\tcursor: pointer;\r\n}\r\n.notification-manager-notification-close > svg{\r\n\twidth: 20px;\r\n\tmargin: 5px;\r\n}\r\n.notification-manager-notification-success{\r\n\tbackground-color: #5aa822ff;\r\n}\r\n.notification-manager-notification-warning{\r\n\tbackground-color: #c78a17ff;\r\n}\r\n.notification-manager-notification-error{\r\n\tbackground-color: #c71717ff;\r\n}\r\n.notification-manager-notification-info{\r\n\tbackground-color: #2e88e8ff;\r\n}\r\n";
styleInject(css_248z);

const NOTIFICATION_CLASSNAME = 'notification-manager-notification';
const closeText = await (await fetch(img$1)).text();
const contentCopyText = await (await fetch(img)).text();

class Notification {
	#htmlElement;
	constructor(content, type, ttl) {
		this.content = content;
		this.type = type;
		this.ttl = ttl;
	}

	set ttl(ttl) {
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
						innerHTML: contentCopyText,
						events: {
							click: async () => {
								await navigator.clipboard.writeText(this.#htmlElement.innerText);

							},
						}
					}),
					createElement('div', {
						className: NOTIFICATION_CLASSNAME + '-close',
						innerHTML: closeText,
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
			} else {
				htmlElementContent.innerHTML = this.content;
			}
		}
		return this.#htmlElement;
	}
}

const NotificationManager = new (function () {
	class NotificationManager extends EventTarget {//TODOv3 are we going to send events ?
		#htmlElement;
		constructor() {
			super();
			this.htmlParent = document.body;
			this.nofifications = new Set();
			this.createHtml();
		}

		set parent(htmlParent) {
			this.htmlParent = htmlParent;
			this.htmlParent.append(this.#htmlElement);
		}

		createHtml() {
			this.#htmlElement = document.createElement('div');
			this.#htmlElement.className = 'notification-manager';
			this.htmlParent.append(this.#htmlElement);
		}

		#getNotification(content, type, ttl) {
			for (let notification of this.nofifications) {
				if ((notification.content ==content) && (notification.type == type)) {
					notification.ttl = ttl;
					return notification;
				}
			}
			return new Notification(content, type, ttl);
		}

		addNotification(content, type, ttl) {
			let notification = this.#getNotification(content, type, ttl);
			this.nofifications.add(notification);
			this.#htmlElement.append(notification.view);
		}

		closeNofication(notification) {
			this.nofifications.delete(notification);
			notification.view.remove();
		}
	}
	return NotificationManager;
}());

export { NotificationManager, SaveFile };
