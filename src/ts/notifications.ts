import { createElement, I18n, createShadowRoot } from 'harmony-ui';
import { closeSVG, contentCopySVG } from 'harmony-svg';
import notificationsCSS from '../css/notifications.css';

const NOTIFICATION_CLASSNAME = 'notification';

export type NotificationContent = HTMLElement | string;

export enum NotificationsPlacement {
	Top = 'top',
	Bottom = 'bottom',
	Left = 'left',
	Right = 'right',
	TopLeft = 'top-left',
	TopRight = 'top-right',
	BottomLeft = 'bottom-left',
	BottomRight = 'bottom-right',
	Center = 'center',
	DockedTop = 'docked-top',
	DockedBottom = 'docked-bottom',
}

export enum NotificationType {
	Success = 'success',
	Warning = 'warning',
	Error = 'error',
	Info = 'info',
}

export enum NotificationEvents {
	Added = 'notificationadded',
	Removed = 'notificationremoved',
}

export type NotificationRemovedEventData = { notification: Notification };

export type NotificationParams = {
	parent?: HTMLElement | ShadowRoot;
}

export class Notification {
	#htmlElement?: HTMLElement;
	timeout: number = 0;
	content: NotificationContent;
	type: NotificationType;
	#id: number;
	#parent?: HTMLElement | ShadowRoot;

	constructor(content: NotificationContent, type: NotificationType, ttl: number, params?: NotificationParams) {
		this.content = content;
		this.type = type;
		this.setTtl(ttl);
		this.#id = ++notificationId;
		this.#parent = params?.parent;
	}

	setTtl(ttl: number) {
		if (ttl != 0) {
			clearTimeout(this.timeout);
			this.timeout = setTimeout(() => closeNotification(this), ttl * 1000);
		}
	}

	get htmlElement() {
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
									if (this.#htmlElement && navigator.clipboard) {
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
							click: () => closeNotification(this),
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

	get id(): number {
		return this.#id;
	}
}

let htmlInner: HTMLElement;
const shadowRoot = createShadowRoot('div', {
	parent: document.body,
	adoptStyle: notificationsCSS,
	child: htmlInner = createElement('div'),
});
I18n.observeElement(htmlInner);
setNotificationsPlacement(NotificationsPlacement.TopRight);

let notificationId = 0;
const notifications = new Map<number, Notification>();

export function setNotificationsPlacement(placement: NotificationsPlacement) {
	htmlInner.className = `inner ${placement}`;
}

export function addNotification(content: NotificationContent, type: NotificationType, ttl: number, params?: NotificationParams): Notification {
	const notification = new Notification(content, type, ttl, params);
	notifications.set(notification.id, notification);
	htmlInner.append(notification.htmlElement);
	return notification;
}

export function closeNotification(notification: Notification | number) {
	if (typeof notification == 'number') {
		notification = notifications.get(notification)!;
	}

	if (notification) {
		notifications.delete(notification.id);
		notification.htmlElement.remove();

		Controller.dispatchEvent(new CustomEvent<NotificationRemovedEventData>(NotificationEvents.Removed, { detail: { notification: notification } }));
	}
}

const Controller = new EventTarget();

export function addNotificationEventListener(type: string, callback: EventListenerOrEventListenerObject | null, options?: AddEventListenerOptions | boolean): void {
	Controller.addEventListener(type, callback, options);
}
