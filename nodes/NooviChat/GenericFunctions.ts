import {
	IExecuteFunctions,
	IHookFunctions,
	IWebhookFunctions,
	IHttpRequestMethods,
	IRequestOptions,
	INodeExecutionData,
	IDataObject,
	NodeOperationError,
} from 'n8n-workflow';

type NooviChatContext = IExecuteFunctions | IHookFunctions | IWebhookFunctions;

// Number of items per page sent to the API. Stop pagination when the
// response contains fewer items than this value.
const PAGE_SIZE = 25;

// Safety cap to prevent infinite loops against misbehaving APIs.
// 400 pages × 25 = 10,000 records maximum before bailing out.
const MAX_PAGES = 400;

// Maximum number of automatic retries on HTTP 429 responses.
const MAX_RETRIES = 3;
// Exponential backoff delays (ms) for retries when no Retry-After header is present.
const RETRY_BACKOFF_MS = [1_000, 2_000, 4_000];

/** Parse a value that may arrive as a JSON string or already as an object. */
export function parseJsonValue(value: unknown): any {
	if (typeof value === 'string' && value.trim() !== '') {
		try {
			return JSON.parse(value);
		} catch {
			return value;
		}
	}
	return value;
}

export async function nooviChatApiRequest(
	this: NooviChatContext,
	method: IHttpRequestMethods,
	endpoint: string,
	body: IDataObject = {},
	qs: IDataObject = {},
): Promise<any> {
	const credentials = await this.getCredentials('nooviChatApi');
	const rawBaseUrl = (credentials.baseUrl as string).replace(/\/$/, '');

	// SSRF protection: baseUrl must use HTTPS and point to a valid hostname
	if (!rawBaseUrl.startsWith('https://')) {
		throw new Error('NooviChat baseUrl must use HTTPS.');
	}
	try {
		const parsed = new URL(rawBaseUrl);
		const host = parsed.hostname;
		// Block private IP ranges and localhost to prevent SSRF
		if (
			host === 'localhost' ||
			/^127\./.test(host) ||
			/^10\./.test(host) ||
			/^172\.(1[6-9]|2\d|3[01])\./.test(host) ||
			/^192\.168\./.test(host) ||
			host === '0.0.0.0' ||
			host === '::1' ||
			host === '169.254.169.254' // AWS metadata
		) {
			throw new Error('NooviChat baseUrl cannot point to a private or local address.');
		}
	} catch (e: any) {
		if (e.message.startsWith('NooviChat')) throw e;
		throw new Error(`NooviChat baseUrl is not a valid URL: ${rawBaseUrl}`);
	}

	const baseUrl = rawBaseUrl;
	const accountId = (this as any).getNodeParameter('accountId', 0) as number;
	if (!Number.isInteger(accountId) || accountId <= 0) {
		throw new NodeOperationError(
			(this as any).getNode(),
			`Invalid Account ID: "${accountId}". Must be a positive integer.`,
		);
	}

	const options: IRequestOptions = {
		method,
		uri: `${baseUrl}/api/v1/accounts/${accountId}${endpoint}`,
		headers: {
			api_access_token: credentials.apiAccessToken as string,
			'Content-Type': 'application/json',
		},
		body,
		qs,
		json: true,
	};

	if (Object.keys(body).length === 0) {
		delete options.body;
	}
	if (Object.keys(qs).length === 0) {
		delete options.qs;
	}

	try {
		return await this.helpers.request(options);
	} catch (error: any) {
		const statusCode: number | undefined = error?.statusCode ?? error?.response?.statusCode;
		const context = `${method} ${endpoint}`;
		const detail = statusCode ? ` (HTTP ${statusCode})` : '';
		throw new Error(
			`NooviChat API Error${detail} [${context}]: ${error.message || 'Unknown error'}`,
		);
	}
}

/**
 * Wraps a single API call with automatic retry logic for HTTP 429 responses.
 * Respects the Retry-After header when present; otherwise uses exponential backoff.
 */
async function withRateLimitRetry<T>(fn: () => Promise<T>): Promise<T> {
	for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
		try {
			return await fn();
		} catch (error: any) {
			const statusCode: number | undefined = error?.statusCode ?? error?.response?.statusCode;
			if (statusCode === 429 && attempt < MAX_RETRIES) {
				const retryAfterHeader: string | undefined =
					error?.response?.headers?.['retry-after'] ?? error?.error?.['retry-after'];
				const waitMs = retryAfterHeader
					? Math.min(parseInt(retryAfterHeader, 10) * 1_000, 60_000)
					: RETRY_BACKOFF_MS[attempt];
				await new Promise<void>((resolve) => setTimeout(resolve, waitMs));
				continue;
			}
			throw error;
		}
	}
	// Unreachable — TypeScript needs an explicit throw/return after the loop
	throw new Error('Exhausted retries');
}

export async function nooviChatApiRequestAllItems(
	this: NooviChatContext,
	method: IHttpRequestMethods,
	endpoint: string,
	body: IDataObject = {},
	qs: IDataObject = {},
): Promise<any[]> {
	const returnData: any[] = [];
	let page = 1;

	for (;;) {
		const currentQs = { ...qs, page, per_page: PAGE_SIZE };
		// Use retry wrapper so 429s on any page don't abort the full pagination
		const response = await withRateLimitRetry(() =>
			nooviChatApiRequest.call(this, method, endpoint, body, currentQs),
		);
		const items = response.data?.payload || response.data || response.payload || response;

		if (!Array.isArray(items) || items.length === 0) {
			break;
		}

		returnData.push(...items);

		if (items.length < PAGE_SIZE) {
			break;
		}

		if (page >= MAX_PAGES) {
			break;
		}

		page++;
	}

	return returnData;
}

export function formatExecutionData(data: any, inputIndex = 0): INodeExecutionData[] {
	if (Array.isArray(data)) {
		return data.map((item) => ({ json: item, pairedItem: { item: inputIndex } }));
	}
	return [{ json: data, pairedItem: { item: inputIndex } }];
}