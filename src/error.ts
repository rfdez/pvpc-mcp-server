export interface PvpcErrorResponse {
	status: number;
	message: string;
}

export class PvpcError extends Error {
	constructor(
		message: string,
		name: string,
		public readonly status = 500,
	) {
		super();

		this.message = message;
		this.name = name;
	}

	static fromResponse(response: PvpcErrorResponse): PvpcError {
		const { status, message } = response;

		return new PvpcError(message, "ApplicationError", status);
	}
}
