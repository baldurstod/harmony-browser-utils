import { hide, show } from 'harmony-ui';
import { Page } from './page';

export const BadPagePathError = new Error('Bad page path, path must only contain a-z0-9');
export const ExistingPathError = new Error('This path already exist');
export const UnknownPageError = new Error('Unknown page');

export abstract class SinglePageApplication {
	#pages = new Map<string, Page>();
	#activePage?: Page;
	abstract htmlElement: HTMLElement;

	constructor() {
		addEventListener('popstate', () => { void this.#handleLocation() });
	}

	async init(pages?: Page[]): Promise<void> {
		if (pages) {
			this.addPages(pages);
		}
		await this.initApplication();
		await this.#handleLocation();
	}

	/**
	 * Add several pages
	 * @param pages The pages to add
	 */
	addPages(pages: Page[]): void {
		pages.forEach(page => this.addPage(page));
	}

	/**
	 * Add a single page
	 * @param page The page to add. Overwrite an existing page of the same path
	 * @throws BadPagePathError, ExistingPathError
	 */
	addPage(page: Page): void {
		if (!/^[a-z0-9]*$/.test(page.path)) {
			throw BadPagePathError;
		}

		if (this.#pages.has(page.path)) {
			throw ExistingPathError;
		}

		this.#pages.set(page.path, page);
		this.htmlElement.append(page.htmlElement);
		hide(page.htmlElement);
	}

	/**
	 * Remove a single page
	 * @param path The path of the page to remove. Does nothing if the path doesn't exist
	 */
	removePage(path: string): void {
		this.#pages.delete(path);
	}

	abstract initApplication(): Promise<void>;
	abstract pageActivated(): void;

	async navigateTo(path: string, replaceSate = false): Promise<void> {
		if (this.#pages.get(path)) {
			throw UnknownPageError;
		}

		const url = '/' + path;
		history[replaceSate ? 'replaceState' : 'pushState']({}, '', url);
		await this.#handleLocation();
	}

	async #handleLocation(): Promise<void> {
		const pathname = document.location.pathname.toLowerCase().replace(/^\/*/, '');

		for (const [path, page] of this.#pages) {
			if (path === pathname) {
				this.#activatePage(page);
				return;
			}
		}
	}

	#activatePage(page: Page): void {
		if (this.#activePage) {
			hide(this.#activePage.htmlElement);
			this.#activePage.deactivated();
		}

		this.#activePage = page;
		page.activated();
		show(page.htmlElement);
	}
}
