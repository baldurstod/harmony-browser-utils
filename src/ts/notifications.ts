import { createElement, I18n, createShadowRoot } from 'harmony-ui';
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
			this.timeout = setTimeout(() => closeNofication(this), ttl * 1000);
		}
	}

	get view() {
		if (!this.#htmlElement) {
			let htmlElementContent;
			this.#htmlElement = createElement('div', {
				class: NOTIFICATION_CLASSNAME,
				childs: [
					htmlElementContent = createElement('div', {
						class: NOTIFICATION_CLASSNAME + '-content',
					}),
					createElement('div', {
						class: NOTIFICATION_CLASSNAME + '-copy',
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
						class: NOTIFICATION_CLASSNAME + '-close',
						innerHTML: closeSVG,
						events: {
							click: () => closeNofication(this),
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

let htmlParent = document.body;
const shadowRoot = createShadowRoot('div', {
	class: 'notification-manager',
	parent: htmlParent,
	adoptStyle: notificationManagerCSS,
});
I18n.observeElement(shadowRoot);
const nofifications = new Set<Notification>();


export function setNotificationsContainer(htmlParent: HTMLElement) {
	htmlParent = htmlParent;
	htmlParent.append(shadowRoot.host);
}

function getNotification(content: NotificationContent, type: string, ttl?: number) {
	for (const notification of nofifications) {
		if ((notification.content == content) && (notification.type == type)) {
			notification.setTtl(ttl);
			return notification;
		}
	}
	return new Notification(content, type, ttl);
}

export function addNotification(content: NotificationContent, type: string, ttl?: number) {
	const notification = getNotification(content, type, ttl);
	nofifications.add(notification);
	shadowRoot.append(notification.view);
}

export function closeNofication(notification: Notification) {
	nofifications.delete(notification);
	notification.view.remove();
}
