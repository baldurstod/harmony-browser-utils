import { createElement } from 'harmony-ui';

export function loadScript(script: string): Promise<boolean> {
	return new Promise((resolve) => {
		createElement('script', {
			src: script,
			parent: document.body,
			events: {
				load: () => resolve(true),
			}
		});
	});
}


export async function loadScripts(scripts: Array<string>): Promise<boolean> {
	const promises: Array<Promise<boolean>> = [];

	for (const script of scripts) {
		promises.push(loadScript(script));
	}

	await Promise.all(promises);
	return true;
}
