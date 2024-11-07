import { createElement, shadowRootStyle, I18n, createShadowRoot } from 'harmony-ui';
import { closeSVG, contentCopySVG } from 'harmony-svg';
import notificationManagerCSS from '../css/notificationmanager.css';

const NOTIFICATION_CLASSNAME = 'notification-manager-notification';

export type NotificationContent = HTMLElement | string;

class Notification {
	#htmlElement?: HTMLElement;
	timeout: number = 0;
	content: NotificationContent;
	type: string;
	constructor(content: NotificationContent, type: string, ttl?: number) {
		this.content = content;
		this.type = type;
		this.setTtl(ttl);
	}

	setTtl(ttl?: number) {
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
							click: async (event: Event) => {
								try {
									if (this.#htmlElement) {
										await navigator.clipboard.writeText(this.#htmlElement.innerText);
										(event.target as HTMLElement).parentElement?.classList.toggle(NOTIFICATION_CLASSNAME + '-copy-success');
									}
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
	//static #htmlElement: HTMLElement;
	static #htmlParent = document.body;
	static #shadowRoot: ShadowRoot;
	static #nofifications = new Set<Notification>();
	static {
		this.#createHtml();
	}

	static setParent(htmlParent: HTMLElement) {
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

	static #getNotification(content: NotificationContent, type: string, ttl: number) {
		for (let notification of this.#nofifications) {
			if ((notification.content == content) && (notification.type == type)) {
				notification.setTtl(ttl);
				return notification;
			}
		}
		return new Notification(content, type, ttl);
	}

	static addNotification(content: NotificationContent, type: string, ttl: number) {
		let notification = this.#getNotification(content, type, ttl);
		this.#nofifications.add(notification);
		this.#shadowRoot.append(notification.view);
	}

	static closeNofication(notification: Notification) {
		this.#nofifications.delete(notification);
		notification.view.remove();
	}
}