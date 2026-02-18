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

	// --- Conversation ---
	it('should call POST /conversations on conversation.create', async () => {
		const ctx = buildContext('conversation', 'create', {
			sourceId: 'src-1',
			inboxId: '5',
			additionalFields: {},
		});
		await node.execute.call(ctx);
		expect(ctx._mockRequest).toHaveBeenCalledWith(
			expect.objectContaining({ method: 'POST', uri: expect.stringContaining('/conversations') }),
		);
	});

	it('should call GET /conversations/:id on conversation.get', async () => {
		const ctx = buildContext('conversation', 'get', { conversationId: '42' });
		await node.execute.call(ctx);
		expect(ctx._mockRequest).toHaveBeenCalledWith(
			expect.objectContaining({ uri: expect.stringContaining('/conversations/42') }),
		);
	});

	it('should call DELETE /conversations/:id on conversation.delete', async () => {
		const ctx = buildContext('conversation', 'delete', { conversationId: '42' });
		await node.execute.call(ctx);
		expect(ctx._mockRequest).toHaveBeenCalledWith(
			expect.objectContaining({ method: 'DELETE', uri: expect.stringContaining('/conversations/42') }),
		);
	});

	// --- Contact ---
	it('should call POST /contacts on contact.create', async () => {
		const ctx = buildContext('contact', 'create', { name: 'John Doe', additionalFields: {} });
		await node.execute.call(ctx);
		expect(ctx._mockRequest).toHaveBeenCalledWith(
			expect.objectContaining({ method: 'POST', uri: expect.stringContaining('/contacts') }),
		);
	});

	it('should call PUT /contacts/:id on contact.update', async () => {
		const ctx = buildContext('contact', 'update', { contactId: '7', updateFields: { name: 'Jane' } });
		await node.execute.call(ctx);
		expect(ctx._mockRequest).toHaveBeenCalledWith(
			expect.objectContaining({ method: 'PUT', uri: expect.stringContaining('/contacts/7') }),
		);
	});

	it('should call DELETE /contacts/:id on contact.delete', async () => {
		const ctx = buildContext('contact', 'delete', { contactId: '7' });
		await node.execute.call(ctx);
		expect(ctx._mockRequest).toHaveBeenCalledWith(
			expect.objectContaining({ method: 'DELETE', uri: expect.stringContaining('/contacts/7') }),
		);
	});

	// --- Message ---
	it('should call POST /messages on message.send', async () => {
		const ctx = buildContext('message', 'send', {
			conversationId: '10',
			content: 'Hello',
			messageType: 'outgoing',
			private: false,
			additionalFields: {},
		});
		await node.execute.call(ctx);
		expect(ctx._mockRequest).toHaveBeenCalledWith(
			expect.objectContaining({ method: 'POST', uri: expect.stringContaining('/messages') }),
		);
	});

	it('should call DELETE /messages/:id on message.delete', async () => {
		const ctx = buildContext('message', 'delete', { conversationId: '10', messageId: '99' });
		await node.execute.call(ctx);
		expect(ctx._mockRequest).toHaveBeenCalledWith(
			expect.objectContaining({ method: 'DELETE', uri: expect.stringContaining('/messages/99') }),
		);
	});

	// --- Deal ---
	it('should call POST /pipeline_cards on deal.create', async () => {
		const ctx = buildContext('deal', 'create', {
			title: 'New deal',
			pipelineId: 'p1',
			stageId: 's1',
			additionalFields: {},
		});
		await node.execute.call(ctx);
		expect(ctx._mockRequest).toHaveBeenCalledWith(
			expect.objectContaining({ method: 'POST', uri: expect.stringContaining('/pipeline_cards') }),
		);
	});

	it('should call PATCH /pipeline_cards/:id on deal.update', async () => {
		const ctx = buildContext('deal', 'update', { dealId: 'abc', additionalFields: { title: 'Updated' } });
		await node.execute.call(ctx);
		expect(ctx._mockRequest).toHaveBeenCalledWith(
			expect.objectContaining({ method: 'PATCH', uri: expect.stringContaining('/pipeline_cards/abc') }),
		);
	});

	it('should call DELETE /pipeline_cards/:id on deal.delete', async () => {
		const ctx = buildContext('deal', 'delete', { dealId: 'abc' });
		await node.execute.call(ctx);
		expect(ctx._mockRequest).toHaveBeenCalledWith(
			expect.objectContaining({ method: 'DELETE', uri: expect.stringContaining('/pipeline_cards/abc') }),
		);
	});

	it('should send stage_id as integer on deal.bulkMove', async () => {
		const ctx = buildContext('deal', 'bulkMove', {
			'dealIds.values': [{ id: '1' }, { id: '2' }],
			stageId: '99',
		});
		await node.execute.call(ctx);
		expect(ctx._mockRequest).toHaveBeenCalledWith(
			expect.objectContaining({
				body: expect.objectContaining({ stage_id: 99, card_ids: [1, 2] }),
			}),
		);
	});

	// --- Activity ---
	it('should call POST /pipeline/activities on activity.create', async () => {
		const ctx = buildContext('activity', 'create', {
			title: 'Call client',
			activityType: 'call',
			additionalFields: {},
		});
		await node.execute.call(ctx);
		expect(ctx._mockRequest).toHaveBeenCalledWith(
			expect.objectContaining({ method: 'POST', uri: expect.stringContaining('/pipeline/activities') }),
		);
	});

	// --- Campaign ---
	it('should call POST /campaigns on campaign.create', async () => {
		const ctx = buildContext('campaign', 'create', {
			title: 'Black Friday',
			campaignType: 'one_off',
			inboxId: 3,
			message: 'Special offer!',
			additionalFields: {},
		});
		await node.execute.call(ctx);
		expect(ctx._mockRequest).toHaveBeenCalledWith(
			expect.objectContaining({ method: 'POST', uri: expect.stringContaining('/campaigns') }),
		);
	});

	it('should call DELETE /campaigns/:id on campaign.delete', async () => {
		const ctx = buildContext('campaign', 'delete', { campaignId: 'c1' });
		await node.execute.call(ctx);
		expect(ctx._mockRequest).toHaveBeenCalledWith(
			expect.objectContaining({ method: 'DELETE', uri: expect.stringContaining('/campaigns/c1') }),
		);
	});

	// --- WAHA ---
	it('should call GET /waha/:id/status on waha.getStatus', async () => {
		const ctx = buildContext('waha', 'getStatus', { inboxId: '12' });
		await node.execute.call(ctx);
		expect(ctx._mockRequest).toHaveBeenCalledWith(
			expect.objectContaining({ uri: expect.stringContaining('/waha/12/status') }),
		);
	});

	it('should call POST /waha/:id/reconnect on waha.reconnect', async () => {
		const ctx = buildContext('waha', 'reconnect', { inboxId: '12' });
		await node.execute.call(ctx);
		expect(ctx._mockRequest).toHaveBeenCalledWith(
			expect.objectContaining({ method: 'POST', uri: expect.stringContaining('/waha/12/reconnect') }),
		);
	});
});
