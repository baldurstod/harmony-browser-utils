export function SaveFile(file: File) {
	var link = document.createElement('a');
	link.setAttribute('href', URL.createObjectURL(file));
	link.setAttribute('download', file.name);

	link.click();
}
