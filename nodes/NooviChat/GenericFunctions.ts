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

export async function nooviChatApiRequest(
	this: NooviChatContext,
	method: IHttpRequestMethods,
	endpoint: string,
	body: IDataObject = {},
	qs: IDataObject = {},
): Promise<any> {
	const credentials = await this.getCredentials('nooviChatApi');
	const baseUrl = (credentials.baseUrl as string).replace(/\/$/, '');
	const accountId = credentials.accountId as number;

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
		throw new Error(
			`NooviChat API Error: ${error.message || 'Unknown error'}`,
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

	do {
		const currentQs = { ...qs, page };
		const response = await nooviChatApiRequest.call(this, method, endpoint, body, currentQs);
		const items = response.data?.payload || response.data || response.payload || response;

		if (!Array.isArray(items) || items.length === 0) {
			break;
		}

		returnData.push(...items);
		page++;

		// NooviChat pagina com 15-25 items por página
		if (items.length < 15) {
			break;
		}
	} while (true);

	return returnData;
}

export function formatExecutionData(data: any): INodeExecutionData[] {
	if (Array.isArray(data)) {
		return data.map((item) => ({ json: item }));
	}
	return [{ json: data }];
}