
export abstract class Page {
	readonly path: string;
	abstract htmlElement: HTMLElement | ShadowRoot;

	constructor(path: string) {
		this.path = path;
	}

	abstract activated(): void;
	abstract deactivated(): void;
}
