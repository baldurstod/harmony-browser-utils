const NOTIFICATION_CLASSNAME = 'notification-manager-notification';
const CLOSE_SVG = '<svg viewBox="0 0 357 357"><polygon points="357,35.7 321.3,0 178.5,142.8 35.7,0 0,35.7 142.8,178.5 0,321.3 35.7,357 178.5,214.2 321.3,357 357,321.3 214.2,178.5"/></svg>';

import './css/notificationmanager.css';

class Notification {
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
		if (!this.htmlElement) {
			this.htmlElement = document.createElement('div');
			let htmlElementContent = document.createElement('div');
			htmlElementContent.className = NOTIFICATION_CLASSNAME + '-content';
			let htmlElementClose = document.createElement('div');
			htmlElementClose.className = NOTIFICATION_CLASSNAME + '-close';

			this.htmlElement.append(htmlElementContent, htmlElementClose);
			this.htmlElement.className = NOTIFICATION_CLASSNAME;
			if (this.type) {
				this.htmlElement.classList.add(NOTIFICATION_CLASSNAME + '-' + this.type)

			}
			if (this.content instanceof HTMLElement) {
			htmlElementContent.append(this.content);
			} else {
				htmlElementContent.innerHTML = this.content;
			}
			htmlElementClose.innerHTML = CLOSE_SVG;
			htmlElementClose.addEventListener('click', () => NotificationManager.closeNofication(this));
		}
		return this.htmlElement;
	}
}

export const NotificationManager = new (function () {
	class NotificationManager extends EventTarget {//TODOv3 are we going to send events ?
		constructor() {
			super();
			this.htmlParent = document.body;
			this.nofifications = new Set();
			this.createHtml();
		}

		set parent(htmlParent) {
			this.htmlParent = htmlParent;
			this.htmlParent.append(this.htmlElement);
		}

		createHtml() {
			this.htmlElement = document.createElement('div');
			this.htmlElement.className = 'notification-manager';
			this.htmlParent.append(this.htmlElement);
		}

		_getNotification(content, type, ttl) {
			for (let notification of this.nofifications) {
				if ((notification.content ==content) && (notification.type == type)) {
					notification.ttl = ttl;
					return notification;
				}
			}
			return new Notification(content, type, ttl);
		}

		addNotification(content, type, ttl) {
			let notification = this._getNotification(content, type, ttl);
			this.nofifications.add(notification);
			this.htmlElement.append(notification.view);
		}

		closeNofication(notification) {
			this.nofifications.delete(notification);
			notification.view.remove();
		}
	}
	return NotificationManager;
}());
