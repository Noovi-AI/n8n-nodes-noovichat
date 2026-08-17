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

	it('should list all 19 resources (18 legacy + whatsappTemplate)', () => {
		const resourceProperty = node.description.properties.find((p) => p.name === 'resource');
		expect(resourceProperty).toBeDefined();

		const resourceValues = (resourceProperty!.options as any[]).map((o) => o.value);
		const expectedResources = [
			'conversation', 'message', 'contact', 'inbox', 'agent',
			'team', 'label', 'cannedResponse', 'customAttribute', 'webhook',
			'pipeline', 'card', 'followUp', 'activity', 'leadScoring',
			'campaign', 'sla', 'waha',
			'whatsappTemplate', // Fase 1.6 M4 — NooviChat custom Meta CRUD
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

	it('should expose the optional message idempotency key only for message.send', () => {
		const messageAdditionalFields = node.description.properties.find(
			(p) =>
				p.name === 'additionalFields' &&
				((p.displayOptions?.show?.resource as string[] | undefined) || []).includes('message') &&
				((p.displayOptions?.show?.operation as string[] | undefined) || []).includes('send'),
		);
		const idempotencyKey = (
			(messageAdditionalFields?.options as Array<{ name: string; type: string; description?: string }> | undefined) || []
		).find((option) => option.name === 'idempotencyKey');

		expect(idempotencyKey?.type).toBe('string');
		expect(idempotencyKey?.description).toContain('1-128 visible ASCII characters');
		expect(idempotencyKey?.description).toContain('same account and conversation');
		expect(idempotencyKey?.description).toContain('local Message record only');
		expect(idempotencyKey?.description).toContain('does not guarantee exactly-once');
		expect(idempotencyKey?.description).toContain('channel provider or webhooks');
		expect(idempotencyKey?.description).toContain('after the Message is committed and queued');
		expect(idempotencyKey?.description).toContain('reuse the same key');
		expect(idempotencyKey?.description).toContain('HTTP 422');
		expect(idempotencyKey?.description).toContain('HTTP 503');
	});

	it('should expose the current card financial fields, filters, and limit contract', () => {
		const cardLimit = node.description.properties.find(
			(p) =>
				p.name === 'limit' &&
				((p.displayOptions?.show?.resource as string[] | undefined) || []).includes('card'),
		);
		expect(cardLimit?.typeOptions?.maxValue).toBe(500);

		const cardCollections = node.description.properties.filter(
			(p) =>
				['additionalFields', 'filters'].includes(p.name) &&
				((p.displayOptions?.show?.resource as string[] | undefined) || []).includes('card'),
		);
		const optionNames = cardCollections.flatMap((property) =>
			((property.options as Array<{ name: string }> | undefined) || []).map((option) => option.name),
		);
		expect(optionNames).toContain('currency');
		expect(optionNames).toEqual(
			expect.arrayContaining([
				'agentId',
				'dateEnd',
				'dateStart',
				'excludeId',
				'priority',
				'search',
				'slaExceeded',
				'stages',
				'status',
				'valueMax',
				'valueMin',
			]),
		);
	});

	it('should expose only the mutable appointment fields and WhatsApp reminders', () => {
		const appointmentUpdateFields = node.description.properties.find(
			(p) =>
				p.name === 'updateFields' &&
				((p.displayOptions?.show?.resource as string[] | undefined) || []).includes('appointment'),
		);
		const appointmentFieldNames = (
			(appointmentUpdateFields?.options as Array<{ name: string }> | undefined) || []
		).map((option) => option.name);

		expect(appointmentFieldNames).toEqual([
			'scheduledAt',
			'notes',
			'customAttributes',
			'partnerId',
		]);

		const reminderTemplates = node.description.properties.find(
			(p) =>
				p.name === 'reminderTemplates' &&
				((p.displayOptions?.show?.resource as string[] | undefined) || []).includes('service'),
		);
		const templatesOption = (
			(reminderTemplates?.options as Array<{ name: string; values?: Array<any> }> | undefined) || []
		).find((option) => option.name === 'templates');
		const sendVia = templatesOption?.values?.find((value) => value.name === 'sendVia');
		const label = templatesOption?.values?.find((value) => value.name === 'label');
		const daysBefore = templatesOption?.values?.find((value) => value.name === 'daysBefore');
		const hoursBefore = templatesOption?.values?.find((value) => value.name === 'hoursBefore');
		const minutesBefore = templatesOption?.values?.find((value) => value.name === 'minutesBefore');
		const bodyTemplate = templatesOption?.values?.find((value) => value.name === 'bodyTemplate');

		expect(sendVia?.options).toEqual([{ name: 'WhatsApp', value: 'whatsapp' }]);
		expect(label?.description).toContain('may return null');
		expect(daysBefore?.typeOptions).toMatchObject({ minValue: 0, maxValue: 1491308 });
		expect(hoursBefore?.typeOptions).toMatchObject({ minValue: 0, maxValue: 35791394 });
		expect(minutesBefore?.typeOptions).toMatchObject({ minValue: 0, maxValue: 2147483647 });
		expect(reminderTemplates?.description).toContain('signed 32-bit maximum of 2147483647 minutes');
		expect(bodyTemplate?.typeOptions).toMatchObject({ rows: 4, maxLength: 4096 });
		expect(bodyTemplate?.description).toContain('1-4096 characters');
		expect(bodyTemplate?.description).toContain('{{cliente}}');
		expect(bodyTemplate?.description).toContain('{{valor}}');
		expect(bodyTemplate?.description).not.toContain('Liquid');
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
				// accountId é lido via getNodeParameter em GenericFunctions (commit
				// 19fdb1b validate accountId as positive integer). Todos os testes
				// precisam passar um valor válido ou o request é rejeitado com
				// "Invalid Account ID".
				const paramMap: Record<string, any> = {
					accountId: 1,
					resource,
					operation,
					returnAll: false,
					limit: 50,
					...params,
				};
				// 1st: try exact literal key (legacy tests register flat keys like 'cardIds.values')
				if (paramMap[name] !== undefined) return paramMap[name];
				// 2nd: support dotted-path access (n8n's real getNodeParameter resolves nested
				// keys like 'reminderTemplates.templates' from { reminderTemplates: { templates: [] } })
				if (name.includes('.')) {
					const segments = name.split('.');
					let cursor: any = paramMap[segments[0]];
					for (let i = 1; i < segments.length && cursor != null; i++) {
						cursor = cursor[segments[i]];
					}
					if (cursor !== undefined) return cursor;
				}
				return fallback;
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
		const ctx = buildContext('card', 'getAll', { filters: {} });
		await node.execute.call(ctx);

		expect(ctx._mockRequest).toHaveBeenCalledWith(
			expect.objectContaining({
				uri: expect.stringContaining('/pipeline_cards'),
			}),
		);
	});

	it('should follow card cursors for Return All without repeating records', async () => {
		const ctx = buildContext('card', 'getAll', {
			returnAll: true,
			filters: { search: 'Acme renewal' },
		});
		ctx._mockRequest
			.mockResolvedValueOnce({
				data: [{ id: 1 }, { id: 2 }],
				meta: { has_more: true, next_cursor: 'next-page' },
			})
			.mockResolvedValueOnce({
				data: [{ id: 2 }, { id: 3 }],
				meta: { has_more: false, next_cursor: null },
			});

		const [result] = await node.execute.call(ctx);

		expect(result.map((item: any) => item.json.id)).toEqual([1, 2, 3]);
		expect(ctx._mockRequest.mock.calls[0][0].qs).toEqual({
			search: 'Acme renewal',
			limit: 500,
		});
		expect(ctx._mockRequest.mock.calls[1][0].qs).toEqual({
			search: 'Acme renewal',
			limit: 500,
			cursor: 'next-page',
		});
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
		expect(ctx._mockRequest.mock.calls[0][0].headers).not.toHaveProperty('Idempotency-Key');
	});

	it('should omit the idempotency header when message.send receives an explicit empty key', async () => {
		const ctx = buildContext('message', 'send', {
			conversationId: '10',
			content: 'Hello without a key',
			messageType: 'outgoing',
			private: false,
			additionalFields: { idempotencyKey: '' },
		});

		await node.execute.call(ctx);

		expect(ctx._mockRequest.mock.calls[0][0].headers).not.toHaveProperty('Idempotency-Key');
	});

	it('should send the exact Idempotency-Key header on message.send', async () => {
		const ctx = buildContext('message', 'send', {
			conversationId: '10',
			content: 'Hello once',
			messageType: 'outgoing',
			private: false,
			additionalFields: { idempotencyKey: 'workflow-42:message-7' },
		});

		await node.execute.call(ctx);

		expect(ctx._mockRequest).toHaveBeenCalledWith(
			expect.objectContaining({
				method: 'POST',
				uri: expect.stringContaining('/conversations/10/messages'),
				headers: expect.objectContaining({
					'Idempotency-Key': 'workflow-42:message-7',
				}),
			}),
		);
		const requestBody = ctx._mockRequest.mock.calls[0][0].body;
		expect(requestBody).not.toHaveProperty('idempotency_key');
		expect(requestBody).not.toHaveProperty('client_idempotency_key_digest');
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
		const ctx = buildContext('card', 'create', {
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
		const ctx = buildContext('card', 'update', { cardId: 'abc', additionalFields: { title: 'Updated' } });
		await node.execute.call(ctx);
		expect(ctx._mockRequest).toHaveBeenCalledWith(
			expect.objectContaining({ method: 'PATCH', uri: expect.stringContaining('/pipeline_cards/abc') }),
		);
	});

	it('should call DELETE /pipeline_cards/:id on deal.delete', async () => {
		const ctx = buildContext('card', 'delete', { cardId: 'abc' });
		await node.execute.call(ctx);
		expect(ctx._mockRequest).toHaveBeenCalledWith(
			expect.objectContaining({ method: 'DELETE', uri: expect.stringContaining('/pipeline_cards/abc') }),
		);
	});

	it('should call POST /pipeline/cards/:id/contacts on card.addContact', async () => {
		const ctx = buildContext('card', 'addContact', {
			cardId: '7',
			additionalContactId: 55,
			contactRole: 'decisor',
		});
		await node.execute.call(ctx);
		expect(ctx._mockRequest).toHaveBeenCalledWith(
			expect.objectContaining({
				method: 'POST',
				uri: expect.stringContaining('/pipeline/cards/7/contacts'),
				body: expect.objectContaining({ contact_id: 55, role: 'decisor' }),
			}),
		);
	});

	it('should call DELETE /pipeline/cards/:id/contacts/:linkId on card.removeContact', async () => {
		const ctx = buildContext('card', 'removeContact', { cardId: '7', linkId: '42' });
		await node.execute.call(ctx);
		expect(ctx._mockRequest).toHaveBeenCalledWith(
			expect.objectContaining({
				method: 'DELETE',
				uri: expect.stringContaining('/pipeline/cards/7/contacts/42'),
			}),
		);
	});

	it('should call POST /pipeline/cards/:id/conversations on card.addConversation', async () => {
		const ctx = buildContext('card', 'addConversation', {
			cardId: '7',
			additionalConversationDisplayId: 108,
		});
		await node.execute.call(ctx);
		expect(ctx._mockRequest).toHaveBeenCalledWith(
			expect.objectContaining({
				method: 'POST',
				uri: expect.stringContaining('/pipeline/cards/7/conversations'),
				body: expect.objectContaining({ conversation_display_id: 108 }),
			}),
		);
	});

	it('should call DELETE /pipeline/cards/:id/conversations/:linkId on card.removeConversation', async () => {
		const ctx = buildContext('card', 'removeConversation', { cardId: '7', linkId: '99' });
		await node.execute.call(ctx);
		expect(ctx._mockRequest).toHaveBeenCalledWith(
			expect.objectContaining({
				method: 'DELETE',
				uri: expect.stringContaining('/pipeline/cards/7/conversations/99'),
			}),
		);
	});

	it('should send attribute_model pipeline_card_attribute on customAttribute.create', async () => {
		const ctx = buildContext('customAttribute', 'create', {
			attributeName: 'deal_source',
			displayName: 'Deal Source',
			attributeType: 'text',
			model: 'pipeline_card_attribute',
		});
		await node.execute.call(ctx);
		expect(ctx._mockRequest).toHaveBeenCalledWith(
			expect.objectContaining({
				method: 'POST',
				uri: expect.stringContaining('/custom_attribute_definitions'),
				body: expect.objectContaining({ attribute_model: 'pipeline_card_attribute' }),
			}),
		);
	});

	it('should call move_to_stage individually for each card on bulkMove', async () => {
		const ctx = buildContext('card', 'bulkMove', {
			'cardIds.values': [{ id: '1' }, { id: '2' }],
			stageId: '99',
		});
		await node.execute.call(ctx);
		expect(ctx._mockRequest).toHaveBeenCalledWith(
			expect.objectContaining({
				method: 'POST',
				uri: expect.stringContaining('/pipeline_cards/1/move_to_stage'),
				body: expect.objectContaining({ pipeline_stage: '99' }),
			}),
		);
		expect(ctx._mockRequest).toHaveBeenCalledWith(
			expect.objectContaining({
				method: 'POST',
				uri: expect.stringContaining('/pipeline_cards/2/move_to_stage'),
				body: expect.objectContaining({ pipeline_stage: '99' }),
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

	// --- v0.8.1: WAHA settings refactor (replaced broken updateConfig/updateMetaTracking) ---

	it('should call PATCH /waha/:id/settings/chatwoot_app on updateChatwootAppSettings', async () => {
		const ctx = buildContext('waha', 'updateChatwootAppSettings', {
			inboxId: '12',
			chatwootAppSettings: { conversation_mode: 'single', mark_messages_read: true },
		});
		await node.execute.call(ctx);
		expect(ctx._mockRequest).toHaveBeenCalledWith(
			expect.objectContaining({
				method: 'PATCH',
				uri: expect.stringContaining('/waha/12/settings/chatwoot_app'),
				body: { conversation_mode: 'single', mark_messages_read: true },
			}),
		);
	});

	it('should call PATCH /waha/:id/settings/session on updateSessionSettings', async () => {
		const ctx = buildContext('waha', 'updateSessionSettings', {
			inboxId: '12',
			sessionSettings: { presence_auto_online: true },
		});
		await node.execute.call(ctx);
		expect(ctx._mockRequest).toHaveBeenCalledWith(
			expect.objectContaining({
				method: 'PATCH',
				uri: expect.stringContaining('/waha/12/settings/session'),
			}),
		);
	});

	it('should call PATCH /waha/:id/settings/webhook on updateWebhookSettings', async () => {
		const ctx = buildContext('waha', 'updateWebhookSettings', {
			inboxId: '12',
			webhookSettings: { events: ['message.any'] },
		});
		await node.execute.call(ctx);
		expect(ctx._mockRequest).toHaveBeenCalledWith(
			expect.objectContaining({
				method: 'PATCH',
				uri: expect.stringContaining('/waha/12/settings/webhook'),
			}),
		);
	});

	it('should parse string-encoded WAHA settings JSON', async () => {
		const ctx = buildContext('waha', 'updateChatwootAppSettings', {
			inboxId: '12',
			chatwootAppSettings: '{"language":"pt-BR"}',
		});
		await node.execute.call(ctx);
		expect(ctx._mockRequest).toHaveBeenCalledWith(
			expect.objectContaining({ body: { language: 'pt-BR' } }),
		);
	});

	// --- v0.8.1: WhatsApp Templates DELETE uses collection route (no /:id) ---

	it('should call DELETE /whatsapp_templates (collection) on whatsappTemplate.delete', async () => {
		const ctx = buildContext('whatsappTemplate', 'delete', {
			inboxId: 5,
			templateName: 'welcome_msg',
		});
		await node.execute.call(ctx);
		const call = ctx._mockRequest.mock.calls[0][0];
		expect(call.method).toBe('DELETE');
		// Must end with /whatsapp_templates (no trailing /0, no template id in path)
		expect(call.uri).toMatch(/\/whatsapp_templates$/);
		expect(call.qs).toEqual({ inbox_id: 5, template_name: 'welcome_msg' });
	});

	// --- v0.8.3: SLA field names fixed (backend strong params) ---

	it('should map SLA fields to canonical *_threshold names on createPolicy', async () => {
		const ctx = buildContext('sla', 'createPolicy', {
			policyName: 'Gold SLA',
			firstResponseTimeThreshold: 1800,
			nextResponseTimeThreshold: 3600,
			resolutionTimeThreshold: 14400,
			onlyDuringBusinessHours: true,
			policyDescription: 'Premium customers',
		});
		await node.execute.call(ctx);
		const call = ctx._mockRequest.mock.calls[0][0];
		expect(call.method).toBe('POST');
		expect(call.uri).toContain('/sla_policies');
		expect(call.body).toEqual({
			name: 'Gold SLA',
			first_response_time_threshold: 1800,
			next_response_time_threshold: 3600,
			resolution_time_threshold: 14400,
			only_during_business_hours: true,
			description: 'Premium customers',
		});
	});

	it('should omit optional SLA fields when not provided on updatePolicy', async () => {
		const ctx = buildContext('sla', 'updatePolicy', {
			policyId: '42',
			policyName: 'Renamed',
			firstResponseTimeThreshold: 7200,
		});
		await node.execute.call(ctx);
		const call = ctx._mockRequest.mock.calls[0][0];
		expect(call.method).toBe('PATCH');
		expect(call.body).toEqual({ name: 'Renamed', first_response_time_threshold: 7200 });
		expect(call.body).not.toHaveProperty('inbox_ids'); // removed in 0.8.3
		expect(call.body).not.toHaveProperty('resolution_time'); // old name removed
	});

	// --- v0.8.3: SLA metrics/export use since/until in unix epoch seconds ---

	it('should convert ISO start/end dates to unix-epoch since/until on sla.getMetrics', async () => {
		const ctx = buildContext('sla', 'getMetrics', {
			startDate: '2026-05-01T00:00:00Z',
			endDate: '2026-05-31T23:59:59Z',
		});
		await node.execute.call(ctx);
		const call = ctx._mockRequest.mock.calls[0][0];
		expect(call.uri).toContain('/applied_slas/metrics');
		expect(call.qs).toEqual({
			since: 1777593600, // 2026-05-01T00:00:00Z
			until: 1780271999, // 2026-05-31T23:59:59Z
		});
	});

	it('should pass-through numeric epoch values for sla.exportCsv', async () => {
		const ctx = buildContext('sla', 'exportCsv', {
			startDate: '1700000000',
			endDate: '1700604800',
		});
		await node.execute.call(ctx);
		const call = ctx._mockRequest.mock.calls[0][0];
		expect(call.uri).toContain('/applied_slas/download');
		expect(call.qs).toEqual({ since: 1700000000, until: 1700604800 });
	});

	// --- v0.8.3: Activity analytics date params renamed ---

	it('should use date_from/date_to on activity.getAnalytics (not start_date/end_date)', async () => {
		const ctx = buildContext('activity', 'getAnalytics', {
			startDate: '2026-05-01',
			endDate: '2026-05-31',
		});
		await node.execute.call(ctx);
		const call = ctx._mockRequest.mock.calls[0][0];
		expect(call.uri).toContain('/pipeline/activities/analytics');
		expect(call.qs).toEqual({ date_from: '2026-05-01', date_to: '2026-05-31' });
	});

	// --- Card.getAll: current server-side filter contract; per_page → limit ---

	it('should map every supported server-side filter and use limit on card.getAll', async () => {
		const ctx = buildContext('card', 'getAll', {
			returnAll: false,
			limit: 50,
			filters: {
				pipelineId: '3',
				stageId: 'qualified',
				contactId: 17,
				conversationDisplayId: 42,
				excludeId: 91,
				search: 'Acme renewal',
				labels: 'vip, urgent',
				priority: ['high', 'urgent'],
				valueMin: 0,
				valueMax: 25000,
				agentId: 'unassigned',
				dateStart: '2026-07-01',
				dateEnd: '2026-07-31',
				status: 'closed',
				slaExceeded: true,
				stages: 'qualified, proposal',
			},
		});
		await node.execute.call(ctx);
		const call = ctx._mockRequest.mock.calls[0][0];
		expect(call.uri).toContain('/pipeline_cards');
		expect(call.qs).toEqual({
			pipeline_id: '3',
			pipeline_stage: 'qualified',
			contact_id: 17,
			conversation_display_id: 42,
			exclude_id: 91,
			search: 'Acme renewal',
			'labels[]': ['vip', 'urgent'],
			'priority[]': ['high', 'urgent'],
			value_min: 0,
			value_max: 25000,
			agent_id: 'unassigned',
			date_start: '2026-07-01',
			date_end: '2026-07-31',
			status: 'closed',
			sla_exceeded: true,
			'stages[]': ['qualified', 'proposal'],
			limit: 50,
		});
		expect(call.qs).not.toHaveProperty('per_page');
		expect(call.qs).not.toHaveProperty('assignee_id');
		expect(call.qsStringifyOptions).toEqual({ arrayFormat: 'repeat' });
	});

	it('should clamp card.getAll limit expressions to the backend maximum', async () => {
		const ctx = buildContext('card', 'getAll', {
			returnAll: false,
			limit: 999,
			filters: {},
		});

		await node.execute.call(ctx);

		expect(ctx._mockRequest.mock.calls[0][0].qs).toEqual({ limit: 500 });
	});

	it('should send the shared server-side filters on card.export', async () => {
		const ctx = buildContext('card', 'export', {
			filters: {
				pipelineId: '3',
				search: 'Acme renewal',
				priority: ['urgent'],
				valueMin: 0,
				stages: 'qualified,proposal',
			},
		});

		await node.execute.call(ctx);

		const call = ctx._mockRequest.mock.calls[0][0];
		expect(call.uri).toContain('/pipeline/cards/export');
		expect(call.qs).toEqual({
			pipeline_id: '3',
			search: 'Acme renewal',
			'priority[]': ['urgent'],
			value_min: 0,
			'stages[]': ['qualified', 'proposal'],
		});
		expect(call.qsStringifyOptions).toEqual({ arrayFormat: 'repeat' });
		expect(call.json).toBe(false);
	});

	// --- v0.8.3: Service reminders nested in service body (no standalone routes) ---

	it('should send reminder_templates through WhatsApp', async () => {
		const ctx = buildContext('service', 'create', {
			name: 'Consulta Inicial',
			durationMinutes: 60,
			additionalFields: { defaultPriceCents: 25000, currency: 'BRL' },
			reminderTemplates: {
				templates: [
					{ daysBefore: 1, hoursBefore: 0, minutesBefore: 0, bodyTemplate: 'Lembrete D-1', sendVia: 'whatsapp', label: '1 dia antes' },
					{ daysBefore: 0, hoursBefore: 2, minutesBefore: 0, bodyTemplate: 'Lembrete 2h', sendVia: 'whatsapp', label: '2 horas antes', active: true },
				],
			},
		});
		await node.execute.call(ctx);
		const call = ctx._mockRequest.mock.calls[0][0];
		expect(call.method).toBe('POST');
		expect(call.uri).toContain('/services');
		expect(call.body.service.name).toBe('Consulta Inicial');
		expect(call.body.reminder_templates).toHaveLength(2);
		expect(call.body.reminder_templates[0]).toMatchObject({
			days_before: 1,
			body_template: 'Lembrete D-1',
			send_via: 'whatsapp',
			label: '1 dia antes',
		});
		expect(call.body.reminder_templates[1].send_via).toBe('whatsapp');
	});

	it('should reject legacy reminder channels before sending an API request', async () => {
		const ctx = buildContext('service', 'create', {
			name: 'Consulta Inicial',
			durationMinutes: 60,
			additionalFields: {},
			reminderTemplates: {
				templates: [
					{ daysBefore: 1, bodyTemplate: 'Lembrete D-1', sendVia: 'email' },
				],
			},
		});

		await expect(node.execute.call(ctx)).rejects.toThrow(
			'Service reminders support only WhatsApp',
		);
		expect(ctx._mockRequest).not.toHaveBeenCalled();
	});

	it('should omit reminder_templates when service.update has none', async () => {
		const ctx = buildContext('service', 'update', {
			serviceId: '5',
			updateFields: { name: 'Renamed' },
		});
		await node.execute.call(ctx);
		const call = ctx._mockRequest.mock.calls[0][0];
		expect(call.method).toBe('PATCH');
		expect(call.body).toEqual({ service: { name: 'Renamed' } });
		expect(call.body).not.toHaveProperty('reminder_templates');
	});

	it('should send an explicit empty reminder list to clear service reminders', async () => {
		const ctx = buildContext('service', 'update', {
			serviceId: '5',
			updateFields: { name: 'Renamed' },
			reminderTemplates: { templates: [] },
		});

		await node.execute.call(ctx);

		const call = ctx._mockRequest.mock.calls[0][0];
		expect(call.body).toEqual({
			service: { name: 'Renamed' },
			reminder_templates: [],
		});
	});

	// --- Appointment update/cancel contract ---

	it('should send only the four mutable fields on appointment.update', async () => {
		const ctx = buildContext('appointment', 'update', {
			appointmentId: '15',
			updateFields: {
				scheduledAt: '2026-06-10T14:00:00Z',
				endsAt: '2026-06-10T20:00:00Z',
				notes: 'New note',
				professionalId: 99,
				serviceId: 88,
			},
		});
		await node.execute.call(ctx);
		const call = ctx._mockRequest.mock.calls[0][0];
		expect(call.method).toBe('PATCH');
		expect(call.uri).toContain('/appointments/15');
		expect(call.body.appointment).toEqual({
			scheduled_at: '2026-06-10T14:00:00Z',
			notes: 'New note',
		});
		expect(call.body.appointment).not.toHaveProperty('ends_at');
		expect(call.body.appointment).not.toHaveProperty('professional_id');
		expect(call.body.appointment).not.toHaveProperty('service_id');
	});

	it('should send cancellation reason in query and normalize a 204 response', async () => {
		const ctx = buildContext('appointment', 'cancel', {
			appointmentId: '15',
			cancellationReason: 'Patient requested via WhatsApp',
		});
		ctx._mockRequest.mockResolvedValueOnce(undefined);

		const [result] = await node.execute.call(ctx);
		const call = ctx._mockRequest.mock.calls[0][0];

		expect(call.method).toBe('DELETE');
		expect(call.uri).toContain('/appointments/15');
		expect(call.body).toBeUndefined();
		expect(call.qs).toEqual({ reason: 'Patient requested via WhatsApp' });
		expect(result[0].json).toEqual({ success: true });
	});

	it('should accept custom_attributes JSON on appointment.update', async () => {
		const ctx = buildContext('appointment', 'update', {
			appointmentId: '20',
			updateFields: {
				customAttributes: { source: 'whatsapp', tag: 'vip' },
			},
		});
		await node.execute.call(ctx);
		const call = ctx._mockRequest.mock.calls[0][0];
		expect(call.body.appointment.custom_attributes).toEqual({ source: 'whatsapp', tag: 'vip' });
	});

	it('should POST a whatsapp_template item on followUp.createTemplateItem', async () => {
		const ctx = buildContext('followUp', 'createTemplateItem', {
			templateId: '3',
			itemType: 'whatsapp_template',
			itemContent: 'Olá {{contact_name}}, lembrete.',
			itemDelaySeconds: 0,
			whatsappTemplateName: 'lembrete_consulta',
			whatsappTemplateLanguage: 'pt_BR',
			whatsappTemplateNamespace: '',
			whatsappTemplateMapping: { body: [{ type: 'variable', value: 'contact_name' }] },
		});
		await node.execute.call(ctx);
		const call = ctx._mockRequest.mock.calls[0][0];
		expect(call.method).toBe('POST');
		expect(call.uri).toContain('/follow-up-templates/3/items');
		const item = call.body.follow_up_template_item;
		expect(item.item_type).toBe('whatsapp_template');
		expect(item.whatsapp_template_name).toBe('lembrete_consulta');
		expect(item.whatsapp_template_mapping).toEqual({
			body: [{ type: 'variable', value: 'contact_name' }],
		});
		expect(item).not.toHaveProperty('whatsapp_template_namespace');
	});
});
