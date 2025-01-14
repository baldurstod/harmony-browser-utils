class Shortcut {
	#contexts;
	#key;
	#alt = false;
	#ctrl = false;
	#meta = false;
	#shift = false;
	constructor(context: string, shortcut: string) {
		this.#contexts = context.split(',');
		const keys = shortcut.toUpperCase().split('+');
		for (const key of keys) {
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

	match(context: string, keyBoardEvent: KeyboardEvent) {
		return (this.#contexts.indexOf(context) > -1) &&
			(keyBoardEvent.altKey == this.#alt) &&
			(keyBoardEvent.ctrlKey == this.#ctrl) &&
			(keyBoardEvent.metaKey == this.#meta) &&
			(keyBoardEvent.shiftKey == this.#shift) &&
			(keyBoardEvent.key.toUpperCase() == this.#key);
	}
}

export class ShortcutHandler extends EventTarget {
	static #instance: ShortcutHandler;
	#shortcuts = new Map()
	#contexts = new Map()
	constructor() {
		if (ShortcutHandler.#instance) {
			return ShortcutHandler.#instance;
		}
		super();
		ShortcutHandler.#instance = this;
		this.addContext('window', document);
	}

	#handleKeyDown(contextName: string, event: Event) {
		const contexts = contextName.split(',');
		for (const [name, shortcuts] of this.#shortcuts) {
			for (const shortcut of shortcuts) {
				for (const context of contexts) {
					if (shortcut.match(context, event)) {
						this.dispatchEvent(new CustomEvent(name, { detail: event }));
						event.preventDefault();
						event.stopPropagation();
					}
				}
			}
		}
	}

	addContext(name: string, element: HTMLElement | Document) {
		element.addEventListener('keydown', (event: Event) => this.#handleKeyDown(name, event));
	}

	setShortcuts(contextName: string, shortcutMap: Map<string, string>) {
		if (!shortcutMap) {
			return;
		}
		this.#shortcuts.clear();
		for (const [name, shortcut] of shortcutMap) {
			this.addShortcut(contextName, name, shortcut);
		}
	}

	setShortcut(contextName: string, name: string, shortcut: string) {
		this.#shortcuts.delete(name);
		this.addShortcut(contextName, name, shortcut);
	}

	addShortcut(contextName: string, name: string, shortcut: string) {
		if (!shortcut) {
			return;
		}
		const shortcuts = shortcut.split(';');
		let shortcutSet = this.#shortcuts.get(name);
		if (!shortcutSet) {
			shortcutSet = new Set();
			this.#shortcuts.set(name, shortcutSet);
		}
		for (const shortcut of shortcuts) {
			shortcutSet.add(new Shortcut(contextName, shortcut));
		}
	}
}
