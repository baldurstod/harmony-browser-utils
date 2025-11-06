function identity(e: string): string {
	return e;
}

function toKeyValue(params: Record<string, string | string[]>, param: string): Record<string, string | string[]> {
	const keyValue = param.split('=');
	const key = keyValue[0], value = keyValue[1];

	params[key] = params[key] ? [value].concat(params[key]) : value;
	return params;
}

export function getQueryParams(): Record<string, string | string[]> {
	return decodeURIComponent(document.location.search).
		replace(/^\?/, '').split('&').
		filter(identity).
		reduce(toKeyValue, {});
}
