import { createElement, I18n, createShadowRoot, documentStyle, defineHarmonyCircularProgress, HTMLHarmonyCircularProgressElement } from 'harmony-ui';
import { checkCircleSVG, closeSVG, contentCopySVG, errorSVG, infoSVG, warningSVG } from 'harmony-svg';
import { themeCSS } from 'harmony-css';
import notificationsContainerCSS from '../css/notificationcontainer.css';
import notificationsCSS from '../css/notifications.css';

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
	#shadowRoot?: ShadowRoot;
	//#htmlElement?: HTMLElement;
	#content: NotificationContent;
	#type: NotificationType;
	#id: number;
	#ttl: number = 0;
	#htmlType?: HTMLElement;
	#htmlProgress?: HTMLHarmonyCircularProgressElement;
	#parent?: HTMLElement | ShadowRoot;
	#start: number = 0;

	constructor(content: NotificationContent, type: NotificationType, ttl: number, params?: NotificationParams) {
		this.#content = content;
		this.#type = type;
		//this.#setTtl(ttl);
		this.#ttl = ttl;
		this.#id = ++notificationId;
		this.#parent = params?.parent;

		documentStyle(themeCSS);
	}

	get htmlElement(): HTMLElement {
		if (this.#shadowRoot) {
			return this.#shadowRoot.host as HTMLElement;
		}

		defineHarmonyCircularProgress();
		let svg: string = '';
		switch (this.#type) {
			case NotificationType.Error:
				svg = errorSVG;
				break;
			case NotificationType.Info:
				svg = infoSVG;
				break;
			case NotificationType.Warning:
				svg = warningSVG;
				break;
			case NotificationType.Success:
				svg = checkCircleSVG;
				break;
		}

		let htmlElementContent: HTMLElement;
		this.#shadowRoot = createShadowRoot('div', {
			adoptStyle: notificationsCSS,
			childs: [
				this.#htmlType = createElement('div', {
					class: 'type',
					childs: [
						this.#htmlProgress = createElement('h-cp', {
							class: 'progress',
						}) as HTMLHarmonyCircularProgressElement,
						createElement('div', {
							class: 'svg',
							innerHTML: svg,
						}),
					],
				}),
				htmlElementContent = createElement('div', {
					class: 'notification-content',
				}),
				createElement('div', {
					class: 'notification-copy',
					innerHTML: contentCopySVG,
					events: {
						click: async (event: Event) => {
							try {
								if (navigator.clipboard) {
									await navigator.clipboard.writeText(htmlElementContent.innerText);
									(event.target as HTMLElement).parentElement?.classList.toggle('notification-copy-success');
								}
							} catch (e) {
								console.error(e);
							}
						},
					}
				}),
				createElement('div', {
					class: 'notification-close',
					innerHTML: closeSVG,
					events: {
						click: () => closeNotification(this),
					}
				}),
				/*
				createElement('div', {
					class: 'notification-line1',
					child:
						this.#htmlProgressBar = createElement('div', {
							class: 'notification-progress',
						}),
				}),
				createElement('div', {
					class: 'notification-line2',
					childs: [
					]
				}),
				*/
			]
		});

		this.#htmlType.classList.add(this.#type);


		if (this.#content instanceof HTMLElement) {
			htmlElementContent.append(this.#content);
		} else {
			htmlElementContent.innerHTML = this.#content;
		}

		if (this.#ttl != 0) {
			this.#start = performance.now();
			window.requestAnimationFrame(() => this.#run());
		}
		return this.#shadowRoot.host as HTMLElement;
	}

	#run() {
		const now = performance.now();
		const elapsed = (now - this.#start);
		const progress = elapsed / this.#ttl / 1000;

		if (progress < 1) {
			this.#htmlProgress?.setProgress(1 - progress);
			window.requestAnimationFrame(() => this.#run());
		} else {
			closeNotification(this);
		}
	}

	get id(): number {
		return this.#id;
	}
}

let htmlInner: HTMLElement;
const shadowRoot = createShadowRoot('div', {
	parent: document.body,
	adoptStyle: notificationsContainerCSS,
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

	if (notification && notifications.has(notification.id)) {
		notifications.delete(notification.id);
		notification.htmlElement.remove();

		Controller.dispatchEvent(new CustomEvent<NotificationRemovedEventData>(NotificationEvents.Removed, { detail: { notification: notification } }));
	}
}

const Controller = new EventTarget();

export function addNotificationEventListener(type: string, callback: EventListenerOrEventListenerObject | null, options?: AddEventListenerOptions | boolean): void {
	Controller.addEventListener(type, callback, options);
}
