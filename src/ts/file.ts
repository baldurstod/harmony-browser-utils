export function saveFile(file: File): void {
	const link = document.createElement('a');
	link.setAttribute('href', URL.createObjectURL(file));
	link.setAttribute('download', file.name);

	link.click();
}
