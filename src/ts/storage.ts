import { createElement, createShadowRoot, defineHarmonyTree, hide, HTMLHarmonyTreeElement, TreeContextMenuEventData, TreeElement } from 'harmony-ui';
import storageCSS from '../css/storage.css';

export const SEPARATOR = '/';

export enum EntryType {
	File = 'file',
	Directory = 'directory',
}


export type StorageFilter = {

}

// TODO: use FileSystemObserver?
export class PersistentStorage {
	static #shadowRoot?: ShadowRoot;
	static #htmlTree?: HTMLHarmonyTreeElement;
	static #dirty: boolean = true;

	static async estimate(): Promise<StorageEstimate> {
		return navigator.storage.estimate();
	}

	static #initPanel() {
		if (this.#shadowRoot) {
			return;
		}
		defineHarmonyTree();
		this.#shadowRoot = createShadowRoot('persistent-storage', {
			parent: document.body,
			adoptStyle: storageCSS,
			child: this.#htmlTree = createElement('harmony-tree', {
				$contextmenu: (event: CustomEvent<TreeContextMenuEventData>) => {
					console.info(event, event.detail.item);
					event.detail.buildContextMenu(
						{
							path: { i18n: '#path', f: () => console.info(event.detail.item?.getPath(SEPARATOR)) },
							delete: {
								i18n: '#delete', f: () => {
									if (event.detail.item) {
										//this.#deleteItem(event.detail.item);
									}
								}
							},
						}
					)
				}
			}) as HTMLHarmonyTreeElement,
		});
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
			return false;
		}
		return true;
	}

	static async *listEntries(path: string, options: { recursive?: boolean, absolutePath?: boolean, directories: boolean, files: boolean } = { directories: true, files: true })/*: AsyncGenerator<never, number, unknown>*/ {
		const entry = await this.#getHandle(path, 'directory', true);
		if (!entry || entry.kind == 'file') {
			return null;
		}

		//let curent =
		const stack: Array<FileSystemHandle> = [entry];
		let current: FileSystemHandle | undefined;
		do {
			current = stack.pop();
			if (current) {
				/*
				if ((filter === undefined) || current.#matchFilter(filter)) {
					childs.add(current);
				}
					*/
				/*
			for (const [_, child] of current.#childs) {
				}
				*/

				if (options.recursive && current.kind == 'directory') {
					for await (const handle of (current as FileSystemDirectoryHandle).values()) {
						stack.push(handle);
						yield handle;
					}
				}
			}
		} while (current);

		//return await this.#removeEntry(path, 'directory', recursive);
		return null;
	}

	static async #removeEntry(path: string, kind: FileSystemHandleKind, recursive: boolean): Promise<boolean> {
		path = cleanPath(path);

		const splittedPath = path.split(SEPARATOR);
		//console.info(splittedPath);

		let current = await navigator.storage.getDirectory();
		const pathElements = path.split(SEPARATOR);
		for (let i = 0; i < pathElements.length - 1; i++) {
			const subPath = pathElements[i];
			if (subPath == '') {
				continue;
			}

			current = await current.getDirectoryHandle(subPath, { create: false });
		}

		if (current.kind == kind) {
			try {

				await current.removeEntry(pathElements[pathElements.length - 1], { recursive: recursive });
				return true;
			} catch (e) {
				console.info(e)
			}
		}
		return false;
	}

	static async #getHandle(path: string, kind: FileSystemHandleKind, create: boolean): Promise<FileSystemHandle | null> {
		path = cleanPath(path);

		const splittedPath = path.split(SEPARATOR);
		//console.info(splittedPath);

		let current = await navigator.storage.getDirectory();
		const pathElements = path.split(SEPARATOR);
		for (let i = 0; i < pathElements.length - 1; i++) {
			const subPath = pathElements[i];
			if (subPath == '') {
				continue;
			}

			current = await current.getDirectoryHandle(subPath, { create: create });
		}

		const name = pathElements[pathElements.length - 1];
		if (name == '') {
			return current;
		}
		if (kind == 'file') {
			return await current.getFileHandle(name, { create: create });
		} else {
			return await current.getDirectoryHandle(name, { create: create });
		}
	}

	static async readFile(path: string): Promise<File | null> {
		try {
			const fileHandle = await this.#getHandle(path, 'file', false) as FileSystemFileHandle;
			if (fileHandle) {
				return await fileHandle.getFile();
			}
		} catch (e) { }
		return null;
	}

	static async showPanel() {
		this.#initPanel();

		if (this.#dirty) {
			this.#htmlTree?.setRoot(await this.#getRoot(await navigator.storage.getDirectory()));
			this.#dirty = true;
		}
	}

	static async #getRoot(entry: FileSystemDirectoryHandle): Promise<TreeElement> {
		const root = await this.#getElement(entry);
		root.isRoot = true;
		return root;
	}

	static async #getElement(entry: FileSystemHandle, parent?: TreeElement): Promise<TreeElement> {
		const childs: Array<TreeElement> | undefined = [];
		const tree = new TreeElement(entry.name, { childs: childs, parent: parent, userData: entry });
		if (entry.kind == 'directory') {
			for await (const [key, value] of (entry as FileSystemDirectoryHandle).entries()) {
				//console.info(key, value);
				childs.push(await this.#getElement(value, tree));
			}
		}
		return tree;
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
