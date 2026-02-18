import { NooviChat } from '../nodes/NooviChat/NooviChat.node';

describe('NooviChat Node — description', () => {
	let node!: NooviChat;

	beforeEach(() => {
		node = new NooviChat();
	});

	it('should have correct displayName', () => {
		expect(node.description.displayName).toBe('NooviChat');
	});

	it('should have correct name', () => {
		expect(node.description.name).toBe('nooviChat');
	});

	it('should require nooviChatApi credential', () => {
		expect(node.description.credentials).toEqual(
			expect.arrayContaining([
				expect.objectContaining({ name: 'nooviChatApi', required: true }),
			]),
		);
	});

	it('should have one main input', () => {
		expect(node.description.inputs).toContain('main');
	});

	it('should have one main output', () => {
		expect(node.description.outputs).toContain('main');
	});

	it('should list all 18 resources', () => {
		const resourceProperty = node.description.properties.find((p) => p.name === 'resource');
		expect(resourceProperty).toBeDefined();

		const resourceValues = (resourceProperty!.options as any[]).map((o) => o.value);
		const expectedResources = [
			'conversation', 'message', 'contact', 'inbox', 'agent',
			'team', 'label', 'cannedResponse', 'customAttribute', 'webhook',
			'pipeline', 'deal', 'followUp', 'activity', 'leadScoring',
			'campaign', 'sla', 'waha',
		];

		for (const resource of expectedResources) {
			expect(resourceValues).toContain(resource);
		}
	});

	it('should have properties for all resources and operations', () => {
		// Verify key operations are present
		const allPropertyNames = node.description.properties.map((p) => p.name);
		expect(allPropertyNames).toContain('resource');
		expect(allPropertyNames).toContain('operation');
	});
});

describe('NooviChat Node — execute', () => {
	let node!: NooviChat;

	beforeEach(() => {
		node = new NooviChat();
	});

	const buildContext = (resource: string, operation: string, params: Record<string, any> = {}) => {
		const mockRequest = jest.fn().mockResolvedValue({ id: 1 });

		return {
			getInputData: () => [{ json: {} }],
			getNodeParameter: (name: string, _index: number, fallback?: any) => {
				const paramMap: Record<string, any> = {
					resource,
					operation,
					returnAll: false,
					limit: 50,
					...params,
				};
				return paramMap[name] !== undefined ? paramMap[name] : fallback;
			},
			getCredentials: jest.fn().mockResolvedValue({
				baseUrl: 'https://chat.example.com',
				apiAccessToken: 'token',
				accountId: 1,
			}),
			helpers: { request: mockRequest },
			getNode: () => ({ name: 'NooviChat', typeVersion: 1 }),
			continueOnFail: () => false,
			_mockRequest: mockRequest,
		} as any;
	};

	it('should throw on unknown resource', async () => {
		const ctx = buildContext('unknownResource', 'get');
		await expect(node.execute.call(ctx)).rejects.toThrow();
	});

	it('should call GET /conversations on conversation.getAll', async () => {
		const ctx = buildContext('conversation', 'getAll', { filters: {} });
		await node.execute.call(ctx);

		expect(ctx._mockRequest).toHaveBeenCalledWith(
			expect.objectContaining({
				method: 'GET',
				uri: expect.stringContaining('/conversations'),
			}),
		);
	});

	it('should call GET /contacts on contact.getAll', async () => {
		const ctx = buildContext('contact', 'getAll', { sort: 'name' });
		await node.execute.call(ctx);

		expect(ctx._mockRequest).toHaveBeenCalledWith(
			expect.objectContaining({
				uri: expect.stringContaining('/contacts'),
			}),
		);
	});

	it('should call GET /pipelines on pipeline.getAll', async () => {
		const ctx = buildContext('pipeline', 'getAll');
		await node.execute.call(ctx);

		expect(ctx._mockRequest).toHaveBeenCalledWith(
			expect.objectContaining({
				uri: expect.stringContaining('/pipelines'),
			}),
		);
	});

	it('should call GET /pipeline_cards on deal.getAll', async () => {
		const ctx = buildContext('deal', 'getAll', { filters: {} });
		await node.execute.call(ctx);

		expect(ctx._mockRequest).toHaveBeenCalledWith(
			expect.objectContaining({
				uri: expect.stringContaining('/pipeline_cards'),
			}),
		);
	});

	it('should call GET /follow-ups on followUp.getAll (account-wide)', async () => {
		const ctx = buildContext('followUp', 'getAll', { conversationId: '' });
		await node.execute.call(ctx);

		expect(ctx._mockRequest).toHaveBeenCalledWith(
			expect.objectContaining({
				uri: expect.stringContaining('/follow-ups'),
			}),
		);
	});

	it('should call GET /sla_policies on sla.getAllPolicies', async () => {
		const ctx = buildContext('sla', 'getAllPolicies');
		await node.execute.call(ctx);

		expect(ctx._mockRequest).toHaveBeenCalledWith(
			expect.objectContaining({
				uri: expect.stringContaining('/sla_policies'),
			}),
		);
	});

	it('should return error data when continueOnFail is true', async () => {
		const ctx = buildContext('conversation', 'getAll', { filters: {} });
		ctx.continueOnFail = () => true;
		ctx._mockRequest.mockRejectedValue(new Error('Network error'));

		const result = await node.execute.call(ctx);
		expect(result[0][0].json).toHaveProperty('error');
	});
});
