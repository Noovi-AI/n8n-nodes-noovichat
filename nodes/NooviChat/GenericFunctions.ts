import {
	IExecuteFunctions,
	IHookFunctions,
	IWebhookFunctions,
	IHttpRequestMethods,
	IRequestOptions,
	INodeExecutionData,
	IDataObject,
} from 'n8n-workflow';

type NooviChatContext = IExecuteFunctions | IHookFunctions | IWebhookFunctions;

// Number of items per page sent to the API. Stop pagination when the
// response contains fewer items than this value.
const PAGE_SIZE = 25;

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
	const baseUrl = (credentials.baseUrl as string).replace(/\/$/, '');
	const accountId = (this as any).getNodeParameter('accountId', 0) as number;

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
		const response = await nooviChatApiRequest.call(this, method, endpoint, body, currentQs);
		const items = response.data?.payload || response.data || response.payload || response;

		if (!Array.isArray(items) || items.length === 0) {
			break;
		}

		returnData.push(...items);

		if (items.length < PAGE_SIZE) {
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