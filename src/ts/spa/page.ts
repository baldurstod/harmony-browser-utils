import { createElement } from 'harmony-ui';

export abstract class Page {
	readonly htmlElement = createElement('div');
	readonly path: string;

	constructor(path: string) {
		this.path = path;
	}

	abstract activated(): void;
	abstract deactivated(): void;
}
