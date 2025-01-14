export function supportsPopover() {
	return Object.prototype.hasOwnProperty.call(HTMLElement, 'popover');
}
