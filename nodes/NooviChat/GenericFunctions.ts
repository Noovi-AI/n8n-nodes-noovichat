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

// Default number of items per page sent to the API. Stop pagination when the
// response contains fewer items than the effective page size.
const PAGE_SIZE = 25;

// Some controllers ignore `per_page` and use their own hardcoded limit.
// When that happens, the `length < PAGE_SIZE` heuristic ends pagination
// prematurely. This table maps endpoint prefixes to the backend's real
// page size so the heuristic stays correct.
// Sources:
//   - contacts_controller.rb:12  → RESULTS_PER_PAGE = 15
//   - notifications_controller.rb → 15
//   - audit_logs_controller.rb → 15
// (messages uses cursor-based `before` pagination, handled separately by the handler.)
const ENDPOINT_PAGE_SIZE_OVERRIDES: Array<[RegExp, number]> = [
	[/^\/contacts(?:\/search|\/filter)?(?:\?|$)/, 15],
	[/^\/notifications(?:\?|$)/, 15],
	[/^\/audit_logs(?:\?|$)/, 15],
];

function effectivePageSize(endpoint: string): number {
	for (const [re, size] of ENDPOINT_PAGE_SIZE_OVERRIDES) {
		if (re.test(endpoint)) return size;
	}
	return PAGE_SIZE;
}

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

/**
 * Resolve credentials, validate the baseUrl against SSRF, and build the fully
 * scoped request URI (`/api/v1/accounts/:account_id<endpoint>`). Shared by the
 * JSON request helper and the raw (text/CSV) helper so the security checks live
 * in one place.
 */
async function resolveRequestTarget(
	this: NooviChatContext,
	endpoint: string,
	itemIndex: number,
): Promise<{ uri: string; apiAccessToken: string }> {
	const credentials = await this.getCredentials('nooviChatApi');
	const rawBaseUrl = (credentials.baseUrl as string).replace(/\/$/, '');

	// SSRF protection: baseUrl must use HTTPS and point to a valid hostname
	if (!rawBaseUrl.startsWith('https://')) {
		throw new Error('NooviChat baseUrl must use HTTPS.');
	}
	try {
		const parsed = new URL(rawBaseUrl);
		const host = parsed.hostname;
		// Block private IP ranges, localhost, and encoded variants to prevent SSRF.
		// Covers IPv4, IPv6 private/loopback, IPv4-mapped IPv6, and alternative encodings.
		const blockedHostPatterns = [
			/^localhost$/i,
			/^127\./,
			/^10\./,
			/^172\.(1[6-9]|2\d|3[01])\./,
			/^192\.168\./,
			/^169\.254\./, // link-local / AWS metadata
			/^0\.0\.0\.0$/,
			// IPv6 loopback and private ranges
			/^::1$/,
			/^fc[0-9a-f]{2}:/i, // fc00::/7 unique local
			/^fd[0-9a-f]{2}:/i,
			/^fe80:/i, // link-local
			// IPv4-mapped IPv6 (::ffff:10.0.0.1 etc.)
			/^::ffff:10\./i,
			/^::ffff:172\.(1[6-9]|2\d|3[01])\./i,
			/^::ffff:192\.168\./i,
			/^::ffff:127\./i,
			// Hex/octal/decimal encoded IPs (e.g. 0x7f000001, 2130706433)
			/^0x[0-9a-f]+$/i,
			/^[0-9]+$/, // pure integer — likely decimal IP
		];
		if (blockedHostPatterns.some((re) => re.test(host))) {
			throw new Error('NooviChat baseUrl cannot point to a private or local address.');
		}
	} catch (e: any) {
		if (e.message.startsWith('NooviChat')) throw e;
		throw new Error(`NooviChat baseUrl is not a valid URL: ${rawBaseUrl}`);
	}

	const accountId = (this as any).getNodeParameter('accountId', itemIndex) as number;
	if (!Number.isInteger(accountId) || accountId <= 0) {
		throw new NodeOperationError(
			(this as any).getNode(),
			`Invalid Account ID: "${accountId}". Must be a positive integer.`,
		);
	}

	return {
		uri: `${rawBaseUrl}/api/v1/accounts/${accountId}${endpoint}`,
		apiAccessToken: credentials.apiAccessToken as string,
	};
}

export async function nooviChatApiRequest(
	this: NooviChatContext,
	method: IHttpRequestMethods,
	endpoint: string,
	body: IDataObject = {},
	qs: IDataObject = {},
	itemIndex = 0,
): Promise<any> {
	const { uri, apiAccessToken } = await resolveRequestTarget.call(this, endpoint, itemIndex);

	const options: IRequestOptions = {
		method,
		uri,
		headers: {
			api_access_token: apiAccessToken,
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
 * Like {@link nooviChatApiRequest} but returns the raw response body as a string
 * instead of parsing JSON. Used for endpoints that emit `text/csv` (pipeline
 * card export and import template) where forcing `json: true` would corrupt the
 * payload. Reuses the same SSRF validation and account scoping.
 */
export async function nooviChatApiRequestRaw(
	this: NooviChatContext,
	method: IHttpRequestMethods,
	endpoint: string,
	qs: IDataObject = {},
	itemIndex = 0,
): Promise<string> {
	const { uri, apiAccessToken } = await resolveRequestTarget.call(this, endpoint, itemIndex);

	const options: IRequestOptions = {
		method,
		uri,
		headers: {
			api_access_token: apiAccessToken,
			Accept: 'text/csv',
		},
		qs,
		json: false, // keep the CSV body as a plain string
	};

	if (Object.keys(qs).length === 0) {
		delete options.qs;
	}

	try {
		const response = await this.helpers.request(options);
		return typeof response === 'string' ? response : String(response);
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

/**
 * Extract the items array from a paginated response, walking through every
 * shape Chatwoot/NooviChat controllers emit. Returns null when no array is found.
 *
 * Known shapes (from inspecting `app/views/api/v1/.../*.jbuilder`):
 *   { data: { payload: [...] } }          — most paginated index actions
 *   { data: [...] }                       — JSON-API style
 *   { payload: [...] }                    — contacts/index, conversations/index
 *   { payload: { <resource>: [...] } }    — webhooks/index, some nested resources
 *   { <resource>: [...], meta: {...} }    — pipeline/activities, custom controllers
 *   [...]                                 — bare array (campaigns, agents, labels)
 */
function extractItems(response: any): any[] | null {
	if (response == null) return null;
	if (Array.isArray(response)) return response;

	// Tier 1: explicit array properties at known positions
	if (Array.isArray(response.data?.payload)) return response.data.payload;
	if (Array.isArray(response.data)) return response.data;
	if (Array.isArray(response.payload)) return response.payload;
	if (Array.isArray(response.activities)) return response.activities;

	// Tier 2: { payload: { <resource>: [...] } } — webhooks-style nesting.
	// We accept this only when payload has exactly one array child to avoid
	// false matches on payloads that mix arrays and scalars.
	if (response.payload && typeof response.payload === 'object') {
		const arrayChildren = Object.values(response.payload).filter((v) => Array.isArray(v));
		if (arrayChildren.length === 1) return arrayChildren[0] as any[];
	}

	// Tier 3: top-level single-array-child object (e.g. { webhooks: [...] } at root)
	if (typeof response === 'object') {
		const arrayChildren = Object.entries(response)
			.filter(([k]) => k !== 'meta' && k !== 'links')
			.filter(([, v]) => Array.isArray(v));
		if (arrayChildren.length === 1) return arrayChildren[0][1] as any[];
	}

	return null;
}

export async function nooviChatApiRequestAllItems(
	this: NooviChatContext,
	method: IHttpRequestMethods,
	endpoint: string,
	body: IDataObject = {},
	qs: IDataObject = {},
): Promise<any[]> {
	const returnData: any[] = [];
	const pageSize = effectivePageSize(endpoint);
	let page = 1;

	for (;;) {
		const currentQs = { ...qs, page, per_page: pageSize };
		// Use retry wrapper so 429s on any page don't abort the full pagination
		const response = await withRateLimitRetry(() =>
			nooviChatApiRequest.call(this, method, endpoint, body, currentQs),
		);
		const items = extractItems(response);

		if (!Array.isArray(items) || items.length === 0) {
			break;
		}

		returnData.push(...items);

		if (items.length < pageSize) {
			break;
		}

		if (page >= MAX_PAGES) {
			// Surface truncation explicitly so downstream workflow can detect it.
			// We append a sentinel item rather than throwing — throwing would
			// discard the (up to) 10000 records already collected.
			returnData.push({
				_truncated: true,
				_truncated_reason: `Pagination capped at MAX_PAGES=${MAX_PAGES} (${returnData.length} records collected). Use server-side filters to narrow scope.`,
				_truncated_endpoint: endpoint,
			} as any);
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