import { createElement, shadowRootStyle } from 'harmony-ui';
import { closeSVG, contentCopySVG } from 'harmony-svg';

const NOTIFICATION_CLASSNAME = 'notification-manager-notification';

import notificationManagerCSS from './css/notificationmanager.css';

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
						innerHTML: contentCopySVG,
						events: {
							click: async (event) => {
								try {
									await navigator.clipboard.writeText(this.#htmlElement.innerText);
									event.target.parentElement.classList.toggle(NOTIFICATION_CLASSNAME + '-copy-success');
								} catch (e) {
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
				this.#htmlElement.classList.add(NOTIFICATION_CLASSNAME + '-' + this.type)
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

export class NotificationManager {
	static #htmlElement;
	static #htmlParent = document.body;
	static #shadowRoot;
	static #nofifications = new Set();
	static {
		this.#createHtml();
	}

	static set parent(htmlParent) {
		this.#htmlParent = htmlParent;
		this.#htmlParent.append(this.#htmlElement);
	}

	static #createHtml() {
		this.#htmlElement = createElement('div', {
			class: 'notification-manager',
			parent: this.#htmlParent,
		});
		this.#shadowRoot = this.#htmlElement.attachShadow({ mode: "closed" });
		shadowRootStyle(this.#shadowRoot, notificationManagerCSS);
	}

	static #getNotification(content, type, ttl) {
		for (let notification of this.#nofifications) {
			if ((notification.content ==content) && (notification.type == type)) {
				notification.ttl = ttl;
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
