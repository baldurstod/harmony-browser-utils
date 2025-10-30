import { themeCSS } from 'harmony-css';
import { checkCircleSVG, closeSVG, contentCopySVG, errorSVG, infoSVG, warningSVG } from 'harmony-svg';
import { Second } from 'harmony-types';
import { createElement, createShadowRoot, defineHarmonyCircularProgress, display, documentStyle, HTMLHarmonyCircularProgressElement, I18n } from 'harmony-ui';
import notificationsContainerCSS from '../css/notificationcontainer.css';
import notificationsCSS from '../css/notifications.css';

export type NotificationContent = HTMLElement | string;

export type NotificationId = number;

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
	#id: NotificationId;
	#ttl: Second = 0;
	#htmlType?: HTMLElement;
	#htmlContent?: HTMLElement;
	#htmlProgress?: HTMLHarmonyCircularProgressElement;
	#parent?: HTMLElement | ShadowRoot;
	#start: DOMHighResTimeStamp = 0;

	constructor(content: NotificationContent, type: NotificationType, ttl: Second, params?: NotificationParams) {
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

		this.#shadowRoot = createShadowRoot('div', {
			adoptStyle: notificationsCSS,
			childs: [
				this.#htmlType = createElement('div', {
					class: 'type',
					childs: [
						this.#htmlProgress = createElement('h-cp', {
							class: 'progress',
							hidden: true,
						}) as HTMLHarmonyCircularProgressElement,
						createElement('div', {
							class: 'svg',
							innerHTML: svg,
						}),
					],
				}),
				this.#htmlContent = createElement('div', {
					class: 'notification-content',
					$click: (event: Event) => this.#copyContent(event as MouseEvent),
				}),
				createElement('div', {
					class: 'notification-copy',
					innerHTML: contentCopySVG,
					events: {
						click: async (event: Event) => {
							if (await this.#copyContent(event as MouseEvent)) {
								(event.target as HTMLElement).parentElement?.classList.toggle('notification-copy-success');
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
			],
			$click: () => this.#ttl = 0,
		});

		this.#htmlType.classList.add(this.#type);


		if (this.#content instanceof HTMLElement) {
			this.#htmlContent.append(this.#content);
		} else {
			this.#htmlContent.innerHTML = this.#content;
		}

		if (this.#ttl != 0) {
			this.#start = performance.now();
			window.requestAnimationFrame(() => this.#run());
		}
		return this.#shadowRoot.host as HTMLElement;
	}

	async #copyContent(event: MouseEvent): Promise<boolean> {
		try {
			if (navigator.clipboard) {
				await navigator.clipboard.writeText(this.#htmlContent!.innerText);
				copied(event.clientX, event.clientY);
				return true;
			}
		} catch (e) {
			console.error(e);
		}
		return false;
	}

	close() {
		closeNotification(this);
	}

	#run() {
		display(this.#htmlProgress, this.#ttl > 0);
		if (this.#ttl <= 0) {
			return;
		}
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

	get id(): NotificationId {
		return this.#id;
	}
}

let htmlInner: HTMLElement;
let htmlCopy: HTMLElement;
let defaultPlacement: NotificationsPlacement = NotificationsPlacement.TopRight;

let notificationId = 0;
const notifications = new Map<NotificationId, Notification>();

export function setNotificationsPlacement(placement: NotificationsPlacement) {
	defaultPlacement = placement;
	if (htmlInner) {
		htmlInner.className = `inner ${placement}`;
	}
}

let initialized = false;
export function addNotification(content: NotificationContent, type: NotificationType, ttl: Second, params?: NotificationParams): Notification {
	if (!initialized) {
		initialize();
	}
	const notification = new Notification(content, type, ttl, params);
	notifications.set(notification.id, notification);
	htmlInner.append(notification.htmlElement);
	return notification;
}

export function closeNotification(notification: Notification | NotificationId) {
	if (typeof notification == 'number') {
		notification = notifications.get(notification)!;
	}

	if (notification && notifications.has(notification.id)) {
		notifications.delete(notification.id);
		notification.htmlElement.remove();

		NotificationController.dispatchEvent(new CustomEvent<NotificationRemovedEventData>(NotificationEvents.Removed, { detail: { notification: notification } }));
	}
}

function initialize() {
	initialized = true;
	const shadowRoot = createShadowRoot('div', {
		parent: document.body,
		adoptStyle: notificationsContainerCSS,
		childs: [
			htmlInner = createElement('div', {
				class: `inner ${defaultPlacement}`,
			}),
			htmlCopy = createElement('div', {
				class: 'copy',
				hidden: true,
				innerHTML: contentCopySVG,
			}),
		],
	});
	I18n.observeElement(htmlInner);
}

const NotificationController = new EventTarget();

export function addNotificationEventListener(type: string, callback: EventListenerOrEventListenerObject | null, options?: AddEventListenerOptions | boolean): void {
	NotificationController.addEventListener(type, callback, options);
}

let startCopy: DOMHighResTimeStamp;
let startY: number;
function copied(x: number, y: number) {
	startCopy = performance.now();
	window.requestAnimationFrame(() => runCopy());
	startY = y
	htmlCopy.style.left = `${String(x)}px`;
}

const displacement = 30;
const delay = 1000;
function runCopy() {
	const now = performance.now();
	const elapsed = (now - startCopy);
	const progress = elapsed / delay;

	display(htmlCopy, progress < 1);

	htmlCopy.style.top = `${String(startY - displacement * progress)}px`;

	if (progress < 1) {
		window.requestAnimationFrame(() => runCopy());
	}
}
