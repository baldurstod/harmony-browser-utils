class Shortcut {
	constructor(shortcut) {
		this.alt = false;
		this.ctrl = false;
		this.meta = false;
		this.shift = false;
		let keys = shortcut.toUpperCase().split('+');
		for (let key of keys)  {
			switch (key) {
				case 'ALT':
					this.alt = true;
					break;
				case 'CTRL':
					this.ctrl = true;
					break;
				case 'META':
					this.meta = true;
					break;
				case 'SHIFT':
					this.shift = true;
					break;
				case 'PLUS':
					this.key = '+';
					break;
				default:
					this.key = key;
			}
		}
	}

	match(keyBoardEvent) {
		return	(keyBoardEvent.altKey == this.alt) &&
				(keyBoardEvent.ctrlKey == this.ctrl) &&
				(keyBoardEvent.metaKey == this.meta) &&
				(keyBoardEvent.shiftKey == this.shift) &&
				(keyBoardEvent.key.toUpperCase() == this.key);
	}
}

class ShortcutHandlerClass extends EventTarget {
	static #instance;
	constructor() {
		if (ShortcutHandlerClass.#instance) {
			return ShortcutHandlerClass.#instance;
		}
		super();
		ShortcutHandlerClass.#instance = this;
		this.shortcuts = new Map();
		window.addEventListener('keydown', (event) => this.handleKeyDown(event));
	}

	handleKeyDown(event) {
		if (event.target instanceof HTMLInputElement ||
			event.target instanceof HTMLTextAreaElement
			) {
			return;
		}
		for (let [name, shortcuts] of this.shortcuts) {
			for (let shortcut of shortcuts) {
				if (shortcut.match(event)) {
					this.dispatchEvent(new CustomEvent(name, {detail:event}));
					event.preventDefault();
					event.stopPropagation();
				}
			}
		}
	}

	setShortcuts(shortcutMap) {
		if (!shortcutMap) {
			return;
		}
		this.shortcuts.clear();
		for (let [name, shortcut] of shortcutMap) {
			this.addShortcut(name, shortcut);
		}
	}

	setShortcut(name, shortcut) {
		this.shortcuts.delete(name);
		this.addShortcut(name, shortcut);
	}

	addShortcut(name, shortcut) {
		if (!shortcut) {
			return;
		}
		let shortcuts = shortcut.split(';');
		let shortcutSet = this.shortcuts.get(name);
		if (!shortcutSet) {
			shortcutSet = new Set();
			this.shortcuts.set(name, shortcutSet);
		}
		for (let shortcut of shortcuts)  {
			shortcutSet.add(new Shortcut(shortcut));
		}
	}
}

export const ShortcutHandler = new ShortcutHandlerClass();
