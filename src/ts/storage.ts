import { createElement, createShadowRoot, defineHarmonyTree, hide, HTMLHarmonyTreeElement, TreeContextMenuEventData, TreeElement } from 'harmony-ui';
import storageCSS from '../css/storage.css';

export const SEPARATOR = '/';

export enum EntryType {
	File = 'file',
	Directory = 'directory',
}


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

	static async createDirectory(path: string): Promise<FileSystemDirectoryHandle> {
		path = cleanPath(path);

		const splittedPath = path.split(SEPARATOR);
		console.info(splittedPath);

		let current = await navigator.storage.getDirectory();
		for (const subPath of path.split(SEPARATOR)) {
			if (subPath == '') {
				continue;
			}

			current = await current.getDirectoryHandle(subPath, { create: true });
		}

		return current;
	}

	static async #removeEntry(path: string, kind: FileSystemHandleKind, recursive: boolean): Promise<boolean> {
		path = cleanPath(path);

		const splittedPath = path.split(SEPARATOR);
		console.info(splittedPath);

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

	static async deleteFile(path: string): Promise<boolean> {
		return await this.#removeEntry(path, 'file', false);
	}

	static async deleteDirectory(path: string, recursive: boolean): Promise<boolean> {
		return await this.#removeEntry(path, 'directory', recursive);
	}

	static async #getFileHandle(path: string, create: boolean): Promise<FileSystemFileHandle> {
		path = cleanPath(path);

		const splittedPath = path.split(SEPARATOR);
		console.info(splittedPath);

		let current = await navigator.storage.getDirectory();
		const pathElements = path.split(SEPARATOR);
		for (let i = 0; i < pathElements.length - 1; i++) {
			const subPath = pathElements[i];
			if (subPath == '') {
				continue;
			}

			current = await current.getDirectoryHandle(subPath, { create: create });
		}

		return await current.getFileHandle(pathElements[pathElements.length - 1], { create: create });
	}

	static async createFile(path: string): Promise<FileSystemFileHandle> {
		return this.#getFileHandle(path, true);
	}

	static async readFile(path: string): Promise<File | null> {
		try {
			const fileHandle = await this.#getFileHandle(path, false);
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
