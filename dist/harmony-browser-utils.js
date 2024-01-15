function SaveFile(file) {
	var link = document.createElement('a');
	link.setAttribute('href', URL.createObjectURL(file));
	link.setAttribute('download', file.name);

	link.click();
}

function supportsPopover() {
	return HTMLElement.prototype.hasOwnProperty('popover');
}

export { SaveFile, supportsPopover };
