class Shortcut {
	#contexts;
	#key;
	#alt = false;
	#ctrl = false;
	#meta = false;
	#shift = false;
	constructor(context, shortcut) {
		this.#contexts = context.split(',');
		const keys = shortcut.toUpperCase().split('+');
		for (let key of keys)  {
			switch (key) {
				case 'ALT':
					this.#alt = true;
					break;
				case 'CTRL':
					this.#ctrl = true;
					break;
				case 'META':
					this.#meta = true;
					break;
				case 'SHIFT':
					this.#shift = true;
					break;
				case 'PLUS':
					this.#key = '+';
					break;
				default:
					this.#key = key;
			}
		}
	}

	match(context, keyBoardEvent) {
		return	(this.#contexts.indexOf(context) > -1) &&
				(keyBoardEvent.altKey == this.#alt) &&
				(keyBoardEvent.ctrlKey == this.#ctrl) &&
				(keyBoardEvent.metaKey == this.#meta) &&
				(keyBoardEvent.shiftKey == this.#shift) &&
				(keyBoardEvent.key.toUpperCase() == this.#key);
	}
}

class ShortcutHandlerClass extends EventTarget {
	static #instance;
	#shortcuts = new Map()
	#contexts = new Map()
	constructor() {
		if (ShortcutHandlerClass.#instance) {
			return ShortcutHandlerClass.#instance;
		}
		super();
		ShortcutHandlerClass.#instance = this;
		this.addContext('window', window);
	}

	#handleKeyDown(contextName, event) {
		const contexts = contextName.split(',');
		for (let [name, shortcuts] of this.#shortcuts) {
			for (let shortcut of shortcuts) {
				for (let context of contexts) {
					if (shortcut.match(context, event)) {
						this.dispatchEvent(new CustomEvent(name, {detail:event}));
						event.preventDefault();
						event.stopPropagation();
					}
				}
			}
		}
	}

	addContext(name, element) {
		element.addEventListener('keydown', event => this.#handleKeyDown(name, event));
	}

	setShortcuts(contextName, shortcutMap) {
		if (!shortcutMap) {
			return;
		}
		this.#shortcuts.clear();
		for (let [name, shortcut] of shortcutMap) {
			this.addShortcut(contextName, name, shortcut);
		}
	}

	setShortcut(contextName, name, shortcut) {
		this.#shortcuts.delete(name);
		this.addShortcut(contextName, name, shortcut);
	}

	addShortcut(contextName, name, shortcut) {
		if (!shortcut) {
			return;
		}
		let shortcuts = shortcut.split(';');
		let shortcutSet = this.#shortcuts.get(name);
		if (!shortcutSet) {
			shortcutSet = new Set();
			this.#shortcuts.set(name, shortcutSet);
		}
		for (let shortcut of shortcuts)  {
			shortcutSet.add(new Shortcut(contextName, shortcut));
		}
	}
}

export const ShortcutHandler = new ShortcutHandlerClass();
