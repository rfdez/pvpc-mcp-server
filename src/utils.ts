export function extractHeaderValue(
	value: string | string[] | undefined,
): string | undefined {
	if (!value) {
		return undefined;
	}

	return typeof value === "string" ? value : value[0];
}

export function extractBearerToken(
	authHeader: string | string[] | undefined,
): string | undefined {
	const header = extractHeaderValue(authHeader);
	if (!header) {
		return undefined;
	}

	// If it starts with 'Bearer ', remove that prefix
	if (header.startsWith("Bearer ")) {
		return header.substring(7).trim();
	}

	// Otherwise return the raw value
	return header;
}
