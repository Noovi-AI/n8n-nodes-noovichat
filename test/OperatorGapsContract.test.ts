import { NooviChat } from '../nodes/NooviChat/NooviChat.node';

function buildContext(
	resource: string,
	operation: string,
	params: Record<string, any> = {},
	mockReturnValue: any = { ok: true },
) {
	const mockRequest = jest.fn().mockResolvedValue(mockReturnValue);
	const parameterMap: Record<string, any> = {
		accountId: 1,
		resource,
		operation,
		...params,
	};

	return {
		getInputData: () => [{ json: {} }],
		getNodeParameter: (name: string, _index: number, fallback?: any) =>
			parameterMap[name] !== undefined ? parameterMap[name] : fallback,
		getCredentials: jest.fn().mockResolvedValue({
			baseUrl: 'https://chat.example.com',
			apiAccessToken: 'token',
		}),
		helpers: { request: mockRequest },
		getNode: () => ({ name: 'NooviChat', typeVersion: 1 }),
		continueOnFail: () => false,
		_mockRequest: mockRequest,
	} as any;
}

describe('Operator gaps vs MCP — Captain, UAZAPI, Company', () => {
	it('registers captain, uazapi and company resources', () => {
		const node = new NooviChat();
		const resourceProperty = node.description.properties.find((p) => p.name === 'resource');
		const values = (resourceProperty!.options as Array<{ value: string }>).map((o) => o.value);
		expect(values).toEqual(expect.arrayContaining(['captain', 'uazapi', 'company']));
	});

	it('Captain rewrite posts to /captain/tasks/rewrite with content + operation', async () => {
		const ctx = buildContext('captain', 'rewrite', {
			content: 'oi',
			rewriteOperation: 'fix_grammar',
			rewriteConversationDisplayId: 88,
		});
		await new NooviChat().execute.call(ctx);
		expect(ctx._mockRequest).toHaveBeenCalledWith(
			expect.objectContaining({
				method: 'POST',
				uri: 'https://chat.example.com/api/v1/accounts/1/captain/tasks/rewrite',
				body: {
					content: 'oi',
					operation: 'fix_grammar',
					conversation_display_id: 88,
				},
			}),
		);
	});

	it('Captain summarize uses conversation display id', async () => {
		const ctx = buildContext('captain', 'summarize', { conversationDisplayId: 88 });
		await new NooviChat().execute.call(ctx);
		expect(ctx._mockRequest).toHaveBeenCalledWith(
			expect.objectContaining({
				method: 'POST',
				uri: 'https://chat.example.com/api/v1/accounts/1/captain/tasks/summarize',
				body: { conversation_display_id: 88 },
			}),
		);
	});

	it('Captain getPreferences hits GET /captain/preferences', async () => {
		const ctx = buildContext('captain', 'getPreferences');
		await new NooviChat().execute.call(ctx);
		expect(ctx._mockRequest).toHaveBeenCalledWith(
			expect.objectContaining({
				method: 'GET',
				uri: 'https://chat.example.com/api/v1/accounts/1/captain/preferences',
			}),
		);
	});

	it('UAZAPI getStatus uses inbox_id in the path', async () => {
		const ctx = buildContext('uazapi', 'getStatus', { inboxId: '12' });
		await new NooviChat().execute.call(ctx);
		expect(ctx._mockRequest).toHaveBeenCalledWith(
			expect.objectContaining({
				method: 'GET',
				uri: 'https://chat.example.com/api/v1/accounts/1/uazapi/12/status',
			}),
		);
	});

	it('UAZAPI pairing posts phone_number', async () => {
		const ctx = buildContext('uazapi', 'requestPairingCode', {
			inboxId: '12',
			phoneNumber: '5511999999999',
		});
		await new NooviChat().execute.call(ctx);
		expect(ctx._mockRequest).toHaveBeenCalledWith(
			expect.objectContaining({
				method: 'POST',
				uri: 'https://chat.example.com/api/v1/accounts/1/uazapi/12/request_pairing_code',
				body: { phone_number: '5511999999999' },
			}),
		);
	});

	it('Company create wraps the Rails company payload', async () => {
		const ctx = buildContext('company', 'create', {
			name: 'Acme',
			additionalFields: { domain: 'acme.com', phone: '1130000000' },
		});
		await new NooviChat().execute.call(ctx);
		expect(ctx._mockRequest).toHaveBeenCalledWith(
			expect.objectContaining({
				method: 'POST',
				uri: 'https://chat.example.com/api/v1/accounts/1/companies',
				body: { company: { name: 'Acme', domain: 'acme.com', phone: '1130000000' } },
			}),
		);
	});

	it('Company search hits /companies/search', async () => {
		const ctx = buildContext('company', 'search', { q: 'Acme' });
		await new NooviChat().execute.call(ctx);
		expect(ctx._mockRequest).toHaveBeenCalledWith(
			expect.objectContaining({
				method: 'GET',
				uri: 'https://chat.example.com/api/v1/accounts/1/companies/search',
				qs: expect.objectContaining({ q: 'Acme' }),
			}),
		);
	});
});
