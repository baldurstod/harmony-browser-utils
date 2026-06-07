import { JSONObject } from 'harmony-types';
import { createElement, createShadowRoot, defineHarmonyPanel, defineHarmonyTree, HTMLHarmonyPanelElement, HTMLHarmonyTreeElement, TreeContextMenuEventData, TreeItem } from 'harmony-ui';
import storageCSS from '../css/storage.css';

export const SEPARATOR = '/';

export enum EntryType {
	File = 'file',
	Directory = 'directory',
}

export type StorageFilter = {
	directories?: boolean,
	files?: boolean,
	name?: string,
}

// TODO: use FileSystemObserver?
export class PersistentStorage {
	static #shadowRoot?: ShadowRoot;
	static #htmlFilter?: HTMLInputElement;
	static #htmlTree?: HTMLHarmonyTreeElement;
	static #dirty = true;
	static #filter: { name: string } = { name: '' };
	static #panel?: HTMLHarmonyPanelElement;

	static async estimate(): Promise<StorageEstimate> {
		return navigator.storage.estimate();
	}

	static #initPanel(): void {
		if (this.#shadowRoot) {
			return;
		}
		defineHarmonyTree();
		defineHarmonyPanel();
		this.#shadowRoot = createShadowRoot('persistent-storage', {
			//parent: document.body,
			adoptStyle: storageCSS,
		});

		this.#panel = createElement('harmony-panel', {
			i18n: '#storage_manager',
			childs: [
				this.#htmlFilter = createElement('input', {
					class: 'filter',
					hidden: true,
					$input: (event: Event) => this.#setFilter((event.target as HTMLInputElement).value),
				}) as HTMLInputElement,
				this.#htmlTree = createElement('harmony-tree', {
					$contextmenu: (event: CustomEvent<TreeContextMenuEventData>) => {
						console.info(event, event.detail.item);
						event.detail.buildContextMenu(
							{
								path: { i18n: '#path', f: () => console.info(event.detail.item?.getPath(SEPARATOR)) },
								delete: {
									i18n: '#delete', f: () => {
										if (event.detail.item) {
											this.deleteFile((event.detail.item.getPath(SEPARATOR)));

											this.#dirty = true;
											void this.#refresh();
										}
									}
								},
							}
						)
					}
				}) as HTMLHarmonyTreeElement,
			],

		}) as HTMLHarmonyPanelElement;
	}

	static async createFile(path: string): Promise<FileSystemFileHandle | null> {
		return this.#getHandle(path, 'file', true) as Promise<FileSystemFileHandle | null>;
	}

	static async createDirectory(path: string): Promise<FileSystemDirectoryHandle | null> {
		return this.#getHandle(path, 'directory', true) as Promise<FileSystemDirectoryHandle | null>;
	}

	static async deleteFile(path: string): Promise<boolean> {
		return await this.#removeEntry(path, 'file', false);
	}

	static async deleteDirectory(path: string, recursive: boolean): Promise<boolean> {
		return await this.#removeEntry(path, 'directory', recursive);
	}

	static async clear(): Promise<boolean> {
		try {
			// TODO: use remove() if it is ever standardized
			const root = await navigator.storage.getDirectory();
			for await (const key of root.keys()) {
				await root.removeEntry(key, { recursive: true });
			}
		} catch (e) {
			console.error('Error while clearing the storage: ' + String(e));
			return false;
		}
		return true;
	}

	static async *listEntries(path: string, options: { recursive?: boolean, absolutePath?: boolean, filter?: StorageFilter } = {}): AsyncGenerator<FileSystemHandle, null, unknown> {
		const entry = await this.#getHandle(path, 'directory', true);
		if (!entry || entry.kind == 'file') {
			return null;
		}

		const stack: FileSystemHandle[] = [entry];
		let current: FileSystemHandle | undefined;
		do {
			current = stack.pop();
			if (current) {
				for await (const handle of (current as FileSystemDirectoryHandle).values()) {
					if (options.recursive && current.kind == 'directory') {
						stack.push(handle);
					}
					yield handle;
				}
			}
		} while (current);

		return null;
	}

	static async #removeEntry(path: string, kind: FileSystemHandleKind, recursive: boolean): Promise<boolean> {
		path = cleanPath(path);

		let current = await navigator.storage.getDirectory();
		const pathElements = path.split(SEPARATOR);
		for (let i = 0; i < pathElements.length - 1; i++) {
			const subPath = pathElements[i]!;
			if (subPath == '') {
				continue;
			}

			current = await current.getDirectoryHandle(subPath, { create: false });
		}

		try {

			await current.removeEntry(pathElements[pathElements.length - 1]!, { recursive: recursive });
			return true;
		} catch (e) {
			console.info(e)
		}
		return false;
	}

	static async #getHandle(path: string, kind: FileSystemHandleKind, create: boolean): Promise<FileSystemHandle | null> {
		path = cleanPath(path);

		let current = await navigator.storage.getDirectory();
		const pathElements = path.split(SEPARATOR);
		for (let i = 0; i < pathElements.length - 1; i++) {
			const subPath = pathElements[i]!;
			if (subPath == '') {
				continue;
			}

			current = await current.getDirectoryHandle(subPath, { create: create });
		}

		const name = pathElements[pathElements.length - 1]!;
		if (name == '') {
			return current;
		}
		if (kind == 'file') {
			return await current.getFileHandle(name, { create: create });
		} else {
			return await current.getDirectoryHandle(name, { create: create });
		}
	}

	static async #readFile(path: string): Promise<File | null> {
		try {
			const fileHandle = await this.#getHandle(path, 'file', false) as FileSystemFileHandle;
			if (fileHandle) {
				return await fileHandle.getFile();
			}
		} catch (e) {
			console.error('Error while reading the file:' + String(e));
		}
		return null;
	}

	static async readFile(path: string): Promise<File | null> {
		return this.#readFile(path);
	}

	static async readFileAsString(path: string): Promise<string | null> {
		const file = await this.#readFile(path);
		if (!file) {
			return null;
		}

		return file.text();
	}

	static async readFileAsJSON(path: string): Promise<JSONObject | null> {
		const file = await this.#readFile(path);
		if (!file) {
			return null;
		}

		const content = await file.text();
		try {
			return JSON.parse(content);
		} catch (e) {
			return null;
		}
	}

	static async writeFile(path: string, content: ArrayBuffer | Blob | string, options?: FileSystemCreateWritableOptions): Promise<boolean> {
		try {
			const fileHandle = await this.#getHandle(path, 'file', true) as FileSystemFileHandle;
			if (fileHandle) {
				const writable = await fileHandle.createWritable(options);
				await writable.write(content);
				await writable.close();
				this.#dirty = true;
				return true;
			}
		} catch (e) {
			console.error('Error while writing the file:' + String(e));
		}
		return false;
	}

	static getPanel(): HTMLHarmonyPanelElement {
		this.#initPanel();
		//parent.append(this.#panel!);
		void this.#refresh();
		return this.#panel!;
	}

	static async #refresh(): Promise<void> {
		if (this.#dirty) {
			this.#htmlTree?.setRoot(await this.#getRoot(await navigator.storage.getDirectory()));
			this.#dirty = false;
		}
	}

	static async #getRoot(entry: FileSystemDirectoryHandle): Promise<TreeItem> {
		const root = await this.#getElement(entry);
		root.isRoot = true;
		return root;
	}

	static async #getElement(entry: FileSystemHandle, parent?: TreeItem): Promise<TreeItem> {
		const childs: TreeItem[] | undefined = [];
		const tree = new TreeItem(entry.name, { childs: childs, parent: parent, userData: entry });
		if (entry.kind == 'directory') {
			for await (const [, value] of (entry as FileSystemDirectoryHandle).entries()) {
				if (this.#matchFilter(value)) {
					childs.push(await this.#getElement(value, tree));
				}
			}
		}
		return tree;
	}

	static #setFilter(name: string): void {
		this.#filter.name = name;
		this.#dirty = true;
		void this.#refresh();
	}

	static #matchFilter(entry: FileSystemHandle): boolean {
		return entry.name.includes(this.#filter.name);
	}
}

function cleanPath(path: string): string {
	if (!path.startsWith(SEPARATOR)) {
		path = SEPARATOR + path;
	}

	path.replace(/\\/g, '/');
	path.replace(/\/(\/)+/g, '/');

	return path;
}
