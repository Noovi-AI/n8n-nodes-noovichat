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

	// --- v0.8.3: Card.getAll drops unsupported assigneeId/status filters; per_page → limit ---

	it('should drop unsupported filters and use limit (not per_page) on card.getAll', async () => {
		const ctx = buildContext('card', 'getAll', {
			returnAll: false,
			limit: 50,
			filters: {
				pipelineId: '3',
				stageId: 'qualified',
				contactId: 17,
				conversationDisplayId: 42,
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
			limit: 50,
		});
		expect(call.qs).not.toHaveProperty('per_page');
		expect(call.qs).not.toHaveProperty('assignee_id');
		expect(call.qs).not.toHaveProperty('status');
	});

	// --- v0.8.3: Service reminders nested in service body (no standalone routes) ---

	it('should send reminder_templates nested in service.create body', async () => {
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

	// --- v0.8.4: Appointment.update does not send professional_id/service_id ---

	it('should not send professional_id/service_id on appointment.update (backend rejects silently)', async () => {
		const ctx = buildContext('appointment', 'update', {
			appointmentId: '15',
			updateFields: {
				scheduledAt: '2026-06-10T14:00:00Z',
				notes: 'New note',
				// professionalId/serviceId no longer in UI; if anyone tries via expression,
				// the handler ignores them.
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
		expect(call.body.appointment).not.toHaveProperty('professional_id');
		expect(call.body.appointment).not.toHaveProperty('service_id');
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
