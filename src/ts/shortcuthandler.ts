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

	match(context: string, keyBoardEvent: KeyboardEvent): boolean {
		return (this.#contexts.indexOf(context) > -1) &&
			(keyBoardEvent.altKey == this.#alt) &&
			(keyBoardEvent.ctrlKey == this.#ctrl) &&
			(keyBoardEvent.metaKey == this.#meta) &&
			(keyBoardEvent.shiftKey == this.#shift) &&
			(keyBoardEvent.key.toUpperCase() == this.#key);
	}
}

const WINDOW_CONTEXT = 'window';

export class ShortcutHandler {
	static #shortcuts = new Map<string, Set<Shortcut>>();
	static #eventTarget = new EventTarget();
	// List of activated key codes. See https://developer.mozilla.org/en-US/docs/Web/API/UI_Events/Keyboard_event_code_values
	static #keyboardCodeState = new Map<string, boolean>();
	// List of activated keys. See https://developer.mozilla.org/en-US/docs/Web/API/UI_Events/Keyboard_event_key_values
	static #keyboardKeyState = new Map<string, boolean>();

	static {
		this.addContext(WINDOW_CONTEXT, document);
	}

	static #handleKeyDown(contextName: string, event: KeyboardEvent): void {
		this.#handleKey(contextName, event, true);
		const contexts = contextName.split(',');
		for (const [name, shortcuts] of this.#shortcuts) {
			for (const shortcut of shortcuts) {
				for (const context of contexts) {
					if (shortcut.match(context, event)) {
						this.#eventTarget.dispatchEvent(new CustomEvent(name, { detail: event }));
						event.preventDefault();
						event.stopPropagation();
					}
				}
			}
		}
	}

	static #handleKeyUp(contextName: string, event: KeyboardEvent): void {
		this.#handleKey(contextName, event, false);
	}

	static #handleKey(contextName: string, event: KeyboardEvent, state: boolean): void {
		if (contextName === WINDOW_CONTEXT) {
			this.#keyboardCodeState.set(event.code, state);
			this.#keyboardKeyState.set(event.key, state);
		}
	}

	static getCodeState(code: string): boolean {
		return this.#keyboardCodeState.get(code) ?? false;
	}

	static getKeyState(key: string): boolean {
		return this.#keyboardKeyState.get(key) ?? false;
	}

	static getControlState(): boolean {
		return this.#keyboardKeyState.get('Control') ?? false;
	}

	static getAltState(): boolean {
		return this.#keyboardKeyState.get('Alt') ?? false;
	}

	static getShiftState(): boolean {
		return this.#keyboardKeyState.get('Shift') ?? false;
	}

	static addContext(name: string, element: HTMLElement | Document): void {
		element.addEventListener('keydown', (event: Event) => this.#handleKeyDown(name, event as KeyboardEvent));
		element.addEventListener('keyup', (event: Event) => this.#handleKeyUp(name, event as KeyboardEvent));
	}

	static setShortcuts(contextName: string, shortcutMap: Map<string, string>): void {
		if (!shortcutMap) {
			return;
		}
		this.#shortcuts.clear();
		for (const [name, shortcut] of shortcutMap) {
			this.addShortcut(contextName, name, shortcut);
		}
	}

	static setShortcut(contextName: string, name: string, shortcut: string): void {
		this.#shortcuts.delete(name);
		this.addShortcut(contextName, name, shortcut);
	}

	static addShortcut(contextName: string, name: string, shortcut: string): void {
		if (!shortcut) {
			return;
		}
		const shortcuts = shortcut.split(';');
		let shortcutSet = this.#shortcuts.get(name);
		if (!shortcutSet) {
			shortcutSet = new Set<Shortcut>();
			this.#shortcuts.set(name, shortcutSet);
		}
		for (const shortcut of shortcuts) {
			shortcutSet.add(new Shortcut(contextName, shortcut));
		}
	}

	static addEventListener(type: string, callback: (evt: CustomEvent<KeyboardEvent>) => void, options?: AddEventListenerOptions | boolean): void {
		this.#eventTarget.addEventListener(type, callback as EventListener, options);
	}
}
