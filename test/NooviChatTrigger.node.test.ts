import { NooviChatTrigger } from '../nodes/NooviChat/NooviChatTrigger.node';

describe('NooviChatTrigger — description', () => {
	let trigger!: NooviChatTrigger;

	beforeEach(() => {
		trigger = new NooviChatTrigger();
	});

	it('should have correct displayName', () => {
		expect(trigger.description.displayName).toBe('NooviChat Trigger');
	});

	it('should be in trigger group', () => {
		expect(trigger.description.group).toContain('trigger');
	});

	it('should have no inputs', () => {
		expect(trigger.description.inputs).toEqual([]);
	});

	it('should have one main output', () => {
		expect(trigger.description.outputs).toContain('main');
	});

	it('should require nooviChatApi credential', () => {
		expect(trigger.description.credentials).toEqual(
			expect.arrayContaining([
				expect.objectContaining({ name: 'nooviChatApi', required: true }),
			]),
		);
	});

	it('should have optional nooviChatWebhookApi credential', () => {
		expect(trigger.description.credentials).toEqual(
			expect.arrayContaining([
				expect.objectContaining({ name: 'nooviChatWebhookApi', required: false }),
			]),
		);
	});

	it('should define a default webhook', () => {
		expect(trigger.description.webhooks).toEqual(
			expect.arrayContaining([
				expect.objectContaining({ name: 'default', httpMethod: 'POST' }),
			]),
		);
	});

	it('should list all 21 events', () => {
		const eventProperty = trigger.description.properties.find((p) => p.name === 'event');
		expect(eventProperty).toBeDefined();

		const eventValues = (eventProperty!.options as any[]).map((o) => o.value);
		const expectedEvents = [
			'conversation_created', 'conversation_status_changed', 'conversation_updated',
			'conversation_typing_on', 'conversation_typing_off',
			'message_created', 'message_updated',
			'contact_created', 'contact_updated',
			'webwidget_triggered',
			'pipeline_card_created', 'pipeline_card_updated', 'pipeline_card_stage_changed',
			'pipeline_card_won', 'pipeline_card_lost',
			'follow_up_due', 'follow_up_overdue',
			'activity_due', 'sla_breach', 'waha_status_changed', 'campaign_completed',
		];

		for (const event of expectedEvents) {
			expect(eventValues).toContain(event);
		}
	});

	it('should expose webhookMethods with default.create, delete, checkExists', () => {
		expect(trigger.webhookMethods).toBeDefined();
		expect(trigger.webhookMethods!.default.create).toBeDefined();
		expect(trigger.webhookMethods!.default.delete).toBeDefined();
		expect(trigger.webhookMethods!.default.checkExists).toBeDefined();
	});
});

describe('NooviChatTrigger — webhookMethods', () => {
	let trigger!: NooviChatTrigger;

	const mockApiRequest = jest.fn();

	const mockStaticData: Record<string, any> = {};

	const buildHookContext = (params: Record<string, any> = {}) => ({
		getWorkflowStaticData: (_scope: string) => mockStaticData,
		getNodeWebhookUrl: (_name: string) => 'https://n8n.example.com/webhook/test-uuid',
		getNodeParameter: (name: string) => params[name] ?? 'message_created',
		getCredentials: jest.fn().mockResolvedValue({
			baseUrl: 'https://chat.example.com',
			apiAccessToken: 'token',
			accountId: 1,
		}),
		helpers: { request: mockApiRequest },
		getNode: () => ({ name: 'NooviChat Trigger', typeVersion: 1 }),
	} as any);

	beforeEach(() => {
		trigger = new NooviChatTrigger();
		jest.clearAllMocks();
		Object.keys(mockStaticData).forEach((k) => delete mockStaticData[k]);
	});

	describe('checkExists', () => {
		it('should return false when no webhookId stored', async () => {
			const ctx = buildHookContext();
			const result = await trigger.webhookMethods!.default.checkExists.call(ctx);
			expect(result).toBe(false);
		});

		it('should return true when webhook exists in API', async () => {
			mockStaticData.webhookId = 42;
			mockApiRequest.mockResolvedValue([
				{ id: 42, url: 'https://n8n.example.com/webhook/test-uuid' },
			]);

			const ctx = buildHookContext();
			const result = await trigger.webhookMethods!.default.checkExists.call(ctx);
			expect(result).toBe(true);
		});

		it('should return false and clear webhookId when webhook not found', async () => {
			mockStaticData.webhookId = 99;
			mockApiRequest.mockResolvedValue([
				{ id: 1, url: 'https://other.url' },
			]);

			const ctx = buildHookContext();
			const result = await trigger.webhookMethods!.default.checkExists.call(ctx);
			expect(result).toBe(false);
			expect(mockStaticData.webhookId).toBeUndefined();
		});

		it('should return false on API error', async () => {
			mockStaticData.webhookId = 42;
			mockApiRequest.mockRejectedValue(new Error('Network error'));

			const ctx = buildHookContext();
			const result = await trigger.webhookMethods!.default.checkExists.call(ctx);
			expect(result).toBe(false);
		});
	});

	describe('create', () => {
		it('should call POST /webhooks and store webhookId', async () => {
			mockApiRequest.mockResolvedValue({ id: 55 });

			const ctx = buildHookContext({ event: 'message_created' });
			const result = await trigger.webhookMethods!.default.create.call(ctx);

			expect(result).toBe(true);
			expect(mockStaticData.webhookId).toBe(55);
			expect(mockApiRequest).toHaveBeenCalledWith(
				expect.objectContaining({
					method: 'POST',
					uri: expect.stringContaining('/webhooks'),
					body: expect.objectContaining({
						url: 'https://n8n.example.com/webhook/test-uuid',
						subscriptions: ['message_created'],
					}),
				}),
			);
		});

		it('should throw when API returns no id', async () => {
			mockApiRequest.mockResolvedValue({});

			const ctx = buildHookContext();
			await expect(
				trigger.webhookMethods!.default.create.call(ctx),
			).rejects.toThrow();
		});
	});

	describe('delete', () => {
		it('should call DELETE /webhooks/{id} and clear webhookId', async () => {
			mockStaticData.webhookId = 42;
			mockApiRequest.mockResolvedValue({});

			const ctx = buildHookContext();
			const result = await trigger.webhookMethods!.default.delete.call(ctx);

			expect(result).toBe(true);
			expect(mockStaticData.webhookId).toBeUndefined();
			expect(mockApiRequest).toHaveBeenCalledWith(
				expect.objectContaining({
					method: 'DELETE',
					uri: expect.stringContaining('/webhooks/42'),
				}),
			);
		});

		it('should return true when no webhookId stored', async () => {
			const ctx = buildHookContext();
			const result = await trigger.webhookMethods!.default.delete.call(ctx);
			expect(result).toBe(true);
			expect(mockApiRequest).not.toHaveBeenCalled();
		});

		it('should return false on API error during delete', async () => {
			mockStaticData.webhookId = 42;
			mockApiRequest.mockRejectedValue(new Error('Not found'));

			const ctx = buildHookContext();
			const result = await trigger.webhookMethods!.default.delete.call(ctx);
			expect(result).toBe(false);
		});
	});
});

describe('NooviChatTrigger — webhook()', () => {
	let trigger: NooviChatTrigger;

	const buildWebhookContext = (
		body: Record<string, any>,
		event = 'message_created',
		filters: Record<string, any> = {},
		headers: Record<string, any> = {},
		webhookCredentials?: Record<string, any>,
	) => ({
		getBodyData: () => body,
		getHeaderData: () => headers,
		getNodeParameter: (name: string, _fallback?: any) => {
			if (name === 'event') return event;
			if (name === 'filters') return filters;
			return undefined;
		},
		getCredentials: jest.fn().mockImplementation((credName: string) => {
			if (credName === 'nooviChatWebhookApi' && webhookCredentials) {
				return Promise.resolve(webhookCredentials);
			}
			return Promise.reject(new Error('No credentials'));
		}),
		getNode: () => ({ name: 'NooviChat Trigger', typeVersion: 1 }),
	} as any);

	beforeEach(() => {
		trigger = new NooviChatTrigger();
	});

	it('should return workflow data for matching event', async () => {
		const ctx = buildWebhookContext({ event: 'message_created', data: { id: 1 } }, 'message_created');
		const result = await trigger.webhook.call(ctx);

		expect(result.workflowData![0]).toHaveLength(1);
		expect(result.workflowData![0][0].json.event).toBe('message_created');
	});

	it('should return empty workflowData for non-matching event', async () => {
		const ctx = buildWebhookContext({ event: 'contact_created' }, 'message_created');
		const result = await trigger.webhook.call(ctx);

		expect(result.workflowData![0]).toHaveLength(0);
	});

	it('should filter by inboxId when provided', async () => {
		const ctx = buildWebhookContext(
			{ event: 'message_created', data: { inbox_id: 5 } },
			'message_created',
			{ inboxId: '10' },
		);
		const result = await trigger.webhook.call(ctx);

		expect(result.workflowData![0]).toHaveLength(0);
	});

	it('should pass through when inboxId matches', async () => {
		const ctx = buildWebhookContext(
			{ event: 'message_created', data: { inbox_id: 10 } },
			'message_created',
			{ inboxId: '10' },
		);
		const result = await trigger.webhook.call(ctx);

		expect(result.workflowData![0]).toHaveLength(1);
	});

	it('should filter by teamId when provided', async () => {
		const ctx = buildWebhookContext(
			{ event: 'conversation_created', data: { team_id: 3 } },
			'conversation_created',
			{ teamId: '99' },
		);
		const result = await trigger.webhook.call(ctx);

		expect(result.workflowData![0]).toHaveLength(0);
	});

	it('should filter by pipelineId for deal events', async () => {
		const ctx = buildWebhookContext(
			{ event: 'pipeline_card_created', data: { pipeline_id: 2 } },
			'pipeline_card_created',
			{ pipelineId: '5' },
		);
		const result = await trigger.webhook.call(ctx);

		expect(result.workflowData![0]).toHaveLength(0);
	});

	it('should include timestamp in output', async () => {
		const ctx = buildWebhookContext({ event: 'message_created', data: { id: 1 } }, 'message_created');
		const result = await trigger.webhook.call(ctx);

		const outputItem = result.workflowData![0][0];
		expect(outputItem.json.timestamp).toBeDefined();
		expect(new Date(outputItem.json.timestamp as string).getTime()).toBeGreaterThan(0);
	});

	it('should reject request when signature is invalid', async () => {
		const ctx = buildWebhookContext(
			{ event: 'message_created', data: { id: 1 } },
			'message_created',
			{},
			{ 'x-hub-signature': 'sha256=invalidsignature' },
			{ webhookSecret: 'my-secret' },
		);
		const result = await trigger.webhook.call(ctx);

		expect(result.workflowData![0]).toHaveLength(0);
	});

	it('should reject request when secret configured but no signature header', async () => {
		const ctx = buildWebhookContext(
			{ event: 'message_created', data: { id: 1 } },
			'message_created',
			{},
			{},
			{ webhookSecret: 'my-secret' },
		);
		const result = await trigger.webhook.call(ctx);

		expect(result.workflowData![0]).toHaveLength(0);
	});

	it('should proceed without signature validation when no secret configured', async () => {
		const ctx = buildWebhookContext(
			{ event: 'message_created', data: { id: 1 } },
			'message_created',
			{},
			{},
		);
		const result = await trigger.webhook.call(ctx);

		expect(result.workflowData![0]).toHaveLength(1);
	});
});
