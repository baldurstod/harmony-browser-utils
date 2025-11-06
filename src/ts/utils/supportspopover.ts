export function supportsPopover(): boolean {
	return Object.prototype.hasOwnProperty.call(HTMLElement, 'popover');
}
