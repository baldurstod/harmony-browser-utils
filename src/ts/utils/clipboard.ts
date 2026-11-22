/**
 * Write a blob to the clipboard.
 * @param blob The blob to write to the clipboard.
 * @param options The options passed to the ClipboardItem constructor.
 * @returns An error if the function fail, or null.
 */
export async function writeBlobToClipboard(blob: Blob, options?: ClipboardItemOptions): Promise<Error | null> {
	try {
		const status = await navigator.permissions.query({ name: 'clipboard-write' as PermissionName });
		if (status.state === 'denied') {
			return new Error('Unable to write to clipboard: permission denied');
		}

		if (!ClipboardItem.supports(blob.type)) {
			return new Error(`Unsupported mime type: ${blob.type}`);
		}

		await navigator.clipboard.write([
			new ClipboardItem(
				{
					[blob.type]: blob
				},
				options,
			),
		]);
		return null;
	} catch (err: any) {
		return new Error(`Unable to write to clipboard: ${err}`);
	}
}
