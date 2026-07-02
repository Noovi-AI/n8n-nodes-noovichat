/**
 * Integration tests — NooviChat Node
 *
 * These tests mock the HTTP layer (helpers.request) and verify that each
 * operation builds the correct API request payload / URL, including the
 * field-mapping fixes shipped in v0.5.5.
 *
 * Coverage targets (per NOO-11):
 *   - Card CRUD (create, get, update, delete) — field mapping assertions
 *   - Message send — additional fields (template, attachment)
 *   - Webhook auto-registration / removal (Trigger node)
 *   - Pipeline analytics endpoints
 *   - Activity create/update — pipeline_card_id as qs, body wrapped in "activity"
 *   - Follow-up create/update — body wrapped in "follow_up"
 */

import { NooviChat } from '../nodes/NooviChat/NooviChat.node';
import { NooviChatTrigger } from '../nodes/NooviChat/NooviChatTrigger.node';

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

const BASE_CREDENTIALS = {
	baseUrl: 'https://chat.example.com',
	apiAccessToken: 'test-token',
	accountId: 1,
};

function buildContext(
	resource: string,
	operation: string,
	params: Record<string, any> = {},
	mockReturnValue: any = { id: 1 },
) {
	const mockRequest = jest.fn().mockResolvedValue(mockReturnValue);

	const ctx = {
		getInputData: () => [{ json: {} }],
		getNodeParameter: (name: string, _index: number, fallback?: any) => {
			const map: Record<string, any> = {
				resource,
				operation,
				returnAll: false,
				limit: 50,
				accountId: 1,
				...params,
			};
			return map[name] !== undefined ? map[name] : fallback;
		},
		getCredentials: jest.fn().mockResolvedValue(BASE_CREDENTIALS),
		helpers: { request: mockRequest },
		getNode: () => ({ name: 'NooviChat', typeVersion: 1 }),
		continueOnFail: () => false,
		_mockRequest: mockRequest,
	} as any;

	return ctx;
}

// ---------------------------------------------------------------------------
// Card CRUD — field mapping (v0.5.5 fixes)
// ---------------------------------------------------------------------------

describe('Card CRUD — field mapping', () => {
	let node: NooviChat;

	beforeEach(() => {
		node = new NooviChat();
	});

	it('card.create — sends pipeline_id, pipeline_stage and title; maps value → expected_revenue', async () => {
		const ctx = buildContext('card', 'create', {
			title: 'Big Deal',
			pipelineId: '3',
			stageId: '3_lead',
			additionalFields: {
				contactId: '42',
				value: 9500,
				expectedCloseDate: '2026-06-30',
				assigneeId: '7',
			},
		});
		await node.execute.call(ctx);

		expect(ctx._mockRequest).toHaveBeenCalledWith(
			expect.objectContaining({
				method: 'POST',
				uri: expect.stringContaining('/pipeline_cards'),
				body: expect.objectContaining({
					pipeline_id: '3',
					pipeline_stage: '3_lead',
					title: 'Big Deal',
					contact_id: '42',
					expected_revenue: 9500,
					deadline: '2026-06-30',
					owner_id: '7',
				}),
			}),
		);
	});

	it('card.get — calls GET /pipeline_cards/:id', async () => {
		const ctx = buildContext('card', 'get', { cardId: 'card-99' });
		await node.execute.call(ctx);

		expect(ctx._mockRequest).toHaveBeenCalledWith(
			expect.objectContaining({
				method: 'GET',
				uri: expect.stringContaining('/pipeline_cards/card-99'),
			}),
		);
	});

	it('card.update — maps value → expected_revenue and assigneeId → owner_id', async () => {
		const ctx = buildContext('card', 'update', {
			cardId: 'card-77',
			additionalFields: {
				title: 'Updated Deal',
				value: 15000,
				assigneeId: '9',
			},
		});
		await node.execute.call(ctx);

		expect(ctx._mockRequest).toHaveBeenCalledWith(
			expect.objectContaining({
				method: 'PATCH',
				uri: expect.stringContaining('/pipeline_cards/card-77'),
				body: expect.objectContaining({
					title: 'Updated Deal',
					expected_revenue: 15000,
					owner_id: '9',
				}),
			}),
		);
	});

	it('card.update — does NOT send "value" key to API (must be expected_revenue)', async () => {
		const ctx = buildContext('card', 'update', {
			cardId: 'card-55',
			additionalFields: { value: 5000 },
		});
		await node.execute.call(ctx);

		const callBody = ctx._mockRequest.mock.calls[0][0].body;
		expect(callBody).not.toHaveProperty('value');
		expect(callBody).toHaveProperty('expected_revenue', 5000);
	});

	it('card.delete — calls DELETE /pipeline_cards/:id', async () => {
		const ctx = buildContext('card', 'delete', { cardId: 'card-33' });
		await node.execute.call(ctx);

		expect(ctx._mockRequest).toHaveBeenCalledWith(
			expect.objectContaining({
				method: 'DELETE',
				uri: expect.stringContaining('/pipeline_cards/card-33'),
			}),
		);
	});

	it('card.moveToStage — sends pipeline_stage in body', async () => {
		const ctx = buildContext('card', 'moveToStage', {
			cardId: 'card-10',
			stageId: '3_negotiation',
		});
		await node.execute.call(ctx);

		expect(ctx._mockRequest).toHaveBeenCalledWith(
			expect.objectContaining({
				method: 'POST',
				uri: expect.stringContaining('/pipeline_cards/card-10/move_to_stage'),
				body: expect.objectContaining({ pipeline_stage: '3_negotiation' }),
			}),
		);
	});

	it('card.markWon — calls POST /pipeline/cards/:id/deal_status/mark_won', async () => {
		const ctx = buildContext('card', 'markWon', { cardId: 'card-5' });
		await node.execute.call(ctx);

		expect(ctx._mockRequest).toHaveBeenCalledWith(
			expect.objectContaining({
				method: 'POST',
				uri: expect.stringContaining('/deal_status/mark_won'),
			}),
		);
	});

	it('card.markLost — sends reason in body', async () => {
		const ctx = buildContext('card', 'markLost', {
			cardId: 'card-5',
			lostReason: 'Budget cut',
		});
		await node.execute.call(ctx);

		expect(ctx._mockRequest).toHaveBeenCalledWith(
			expect.objectContaining({
				body: expect.objectContaining({ reason: 'Budget cut' }),
			}),
		);
	});

	it('card.bulkUpdate — calls PATCH for each card individually', async () => {
		const ctx = buildContext('card', 'bulkUpdate', {
			'cardIds.values': [{ id: 'c1' }, { id: 'c2' }, { id: 'c3' }],
			updateFields: { title: 'Bulk title' },
		});
		await node.execute.call(ctx);

		expect(ctx._mockRequest).toHaveBeenCalledTimes(3);
		expect(ctx._mockRequest).toHaveBeenCalledWith(
			expect.objectContaining({
				method: 'PATCH',
				uri: expect.stringContaining('/pipeline_cards/c1'),
			}),
		);
	});

	it('card.bulkDelete — calls DELETE for each card individually', async () => {
		const ctx = buildContext('card', 'bulkDelete', {
			'cardIds.values': [{ id: 'd1' }, { id: 'd2' }],
		});
		await node.execute.call(ctx);

		expect(ctx._mockRequest).toHaveBeenCalledTimes(2);
		expect(ctx._mockRequest).toHaveBeenCalledWith(
			expect.objectContaining({
				method: 'DELETE',
				uri: expect.stringContaining('/pipeline_cards/d1'),
			}),
		);
	});
});

// ---------------------------------------------------------------------------
// Message send — additional fields
// ---------------------------------------------------------------------------

describe('Message send — additional fields', () => {
	let node: NooviChat;

	beforeEach(() => {
		node = new NooviChat();
	});

	it('message.send — sends content, message_type and private flag', async () => {
		const ctx = buildContext('message', 'send', {
			conversationId: '20',
			content: 'Hello customer!',
			messageType: 'outgoing',
			private: false,
			additionalFields: {},
		});
		await node.execute.call(ctx);

		expect(ctx._mockRequest).toHaveBeenCalledWith(
			expect.objectContaining({
				method: 'POST',
				uri: expect.stringContaining('/conversations/20/messages'),
				body: expect.objectContaining({
					content: 'Hello customer!',
					message_type: 'outgoing',
					private: false,
				}),
			}),
		);
	});

	it('message.send — includes template when templateName provided', async () => {
		const ctx = buildContext('message', 'send', {
			conversationId: '20',
			content: 'Hi',
			messageType: 'outgoing',
			private: false,
			additionalFields: {
				templateName: 'welcome_template',
				templateVariables: 'John,Manager',
			},
		});
		await node.execute.call(ctx);

		expect(ctx._mockRequest).toHaveBeenCalledWith(
			expect.objectContaining({
				body: expect.objectContaining({
					template: expect.objectContaining({
						name: 'welcome_template',
						variables: ['John', 'Manager'],
					}),
				}),
			}),
		);
	});

	it('message.send — includes attachment url when provided', async () => {
		const ctx = buildContext('message', 'send', {
			conversationId: '20',
			content: 'See attached',
			messageType: 'outgoing',
			private: false,
			additionalFields: {
				attachment: 'https://files.example.com/doc.pdf',
			},
		});
		await node.execute.call(ctx);

		expect(ctx._mockRequest).toHaveBeenCalledWith(
			expect.objectContaining({
				body: expect.objectContaining({
					attachments: [{ url: 'https://files.example.com/doc.pdf' }],
				}),
			}),
		);
	});

	it('message.send — includes content_type when provided', async () => {
		const ctx = buildContext('message', 'send', {
			conversationId: '20',
			content: 'Check options below',
			messageType: 'outgoing',
			private: false,
			additionalFields: { contentType: 'input_select' },
		});
		await node.execute.call(ctx);

		expect(ctx._mockRequest).toHaveBeenCalledWith(
			expect.objectContaining({
				body: expect.objectContaining({ content_type: 'input_select' }),
			}),
		);
	});

	it('message.send — private note (private: true)', async () => {
		const ctx = buildContext('message', 'send', {
			conversationId: '20',
			content: 'Internal note',
			messageType: 'outgoing',
			private: true,
			additionalFields: {},
		});
		await node.execute.call(ctx);

		expect(ctx._mockRequest).toHaveBeenCalledWith(
			expect.objectContaining({
				body: expect.objectContaining({ private: true }),
			}),
		);
	});
});

// ---------------------------------------------------------------------------
// Pipeline analytics endpoints
// ---------------------------------------------------------------------------

describe('Pipeline analytics endpoints', () => {
	let node: NooviChat;

	beforeEach(() => {
		node = new NooviChat();
	});

	it('pipeline.getAnalyticsDashboard — calls GET /pipeline/analytics/dashboard', async () => {
		const ctx = buildContext('pipeline', 'getAnalyticsDashboard', {
			pipelineId: '',
			stageId: '',
			startDate: '2026-01-01',
			endDate: '2026-03-20',
		});
		await node.execute.call(ctx);

		expect(ctx._mockRequest).toHaveBeenCalledWith(
			expect.objectContaining({
				method: 'GET',
				uri: expect.stringContaining('/pipeline/analytics/dashboard'),
				qs: expect.objectContaining({ start_date: '2026-01-01', end_date: '2026-03-20' }),
			}),
		);
	});

	it('pipeline.getWinRate — calls GET /pipeline/analytics/win_rate', async () => {
		const ctx = buildContext('pipeline', 'getWinRate', {
			pipelineId: '',
			stageId: '',
			startDate: '',
			endDate: '',
		});
		await node.execute.call(ctx);

		expect(ctx._mockRequest).toHaveBeenCalledWith(
			expect.objectContaining({
				uri: expect.stringContaining('/pipeline/analytics/win_rate'),
			}),
		);
	});

	it('pipeline.getConversionMetrics — calls GET /pipeline/analytics/conversion_metrics', async () => {
		const ctx = buildContext('pipeline', 'getConversionMetrics', {
			pipelineId: '',
			stageId: '',
			startDate: '',
			endDate: '',
		});
		await node.execute.call(ctx);

		expect(ctx._mockRequest).toHaveBeenCalledWith(
			expect.objectContaining({
				uri: expect.stringContaining('/pipeline/analytics/conversion_metrics'),
			}),
		);
	});

	it('pipeline.getSalesVelocity — calls GET /pipeline/analytics/sales_velocity', async () => {
		const ctx = buildContext('pipeline', 'getSalesVelocity', {
			pipelineId: '',
			stageId: '',
			startDate: '',
			endDate: '',
		});
		await node.execute.call(ctx);

		expect(ctx._mockRequest).toHaveBeenCalledWith(
			expect.objectContaining({
				uri: expect.stringContaining('/pipeline/analytics/sales_velocity'),
			}),
		);
	});

	it('pipeline.getTeamPerformance — calls GET /pipeline/analytics/team_pipeline', async () => {
		const ctx = buildContext('pipeline', 'getTeamPerformance', {
			pipelineId: '',
			stageId: '',
			startDate: '',
			endDate: '',
			'agentIds.values': [{ id: '1' }, { id: '2' }],
		});
		await node.execute.call(ctx);

		expect(ctx._mockRequest).toHaveBeenCalledWith(
			expect.objectContaining({
				uri: expect.stringContaining('/pipeline/analytics/team_pipeline'),
				qs: expect.objectContaining({ agent_ids: '1,2' }),
			}),
		);
	});

	it('pipeline.getLostReasons — calls GET /pipeline/deal_status/common_reasons', async () => {
		const ctx = buildContext('pipeline', 'getLostReasons', {
			pipelineId: '',
			stageId: '',
			startDate: '',
			endDate: '',
		});
		await node.execute.call(ctx);

		expect(ctx._mockRequest).toHaveBeenCalledWith(
			expect.objectContaining({
				uri: expect.stringContaining('/pipeline/deal_status/common_reasons'),
			}),
		);
	});
});

// ---------------------------------------------------------------------------
// Activity — pipeline_card_id as qs + body wrapped in "activity" (v0.5.5)
// ---------------------------------------------------------------------------

describe('Activity — field mapping (v0.5.5 fixes)', () => {
	let node: NooviChat;

	beforeEach(() => {
		node = new NooviChat();
	});

	it('activity.create — wraps body in "activity" key and sends pipeline_card_id as qs', async () => {
		const ctx = buildContext('activity', 'create', {
			pipelineCardId: 'card-42',
			title: 'Discovery call',
			activityType: 'call',
			additionalFields: {
				description: 'Discuss needs',
				scheduledAt: '2026-04-01T10:00:00Z',
				assigneeId: '5',
			},
		});
		await node.execute.call(ctx);

		expect(ctx._mockRequest).toHaveBeenCalledWith(
			expect.objectContaining({
				method: 'POST',
				uri: expect.stringContaining('/pipeline/activities'),
				qs: expect.objectContaining({ pipeline_card_id: 'card-42' }),
				body: expect.objectContaining({
					activity: expect.objectContaining({
						activity_type: 'call',
						title: 'Discovery call',
						description: 'Discuss needs',
						assigned_to_id: '5',
					}),
				}),
			}),
		);
	});

	it('activity.create — does NOT send pipeline_card_id in body', async () => {
		const ctx = buildContext('activity', 'create', {
			pipelineCardId: 'card-42',
			title: 'Call',
			activityType: 'call',
			additionalFields: {},
		});
		await node.execute.call(ctx);

		const callBody = ctx._mockRequest.mock.calls[0][0].body;
		expect(callBody).not.toHaveProperty('pipeline_card_id');
		expect(callBody).toHaveProperty('activity');
	});

	it('activity.update — wraps body in "activity" and sends pipeline_card_id as qs', async () => {
		const ctx = buildContext('activity', 'update', {
			activityId: 'act-10',
			pipelineCardId: 'card-42',
			additionalFields: {
				title: 'Updated call',
				assigneeId: '8',
			},
		});
		await node.execute.call(ctx);

		expect(ctx._mockRequest).toHaveBeenCalledWith(
			expect.objectContaining({
				method: 'PATCH',
				uri: expect.stringContaining('/pipeline/activities/act-10'),
				qs: expect.objectContaining({ pipeline_card_id: 'card-42' }),
				body: expect.objectContaining({
					activity: expect.objectContaining({
						title: 'Updated call',
						assigned_to_id: '8',
					}),
				}),
			}),
		);
	});

	it('activity.delete — passes pipeline_card_id as qs', async () => {
		const ctx = buildContext('activity', 'delete', {
			activityId: 'act-5',
			pipelineCardId: 'card-42',
		});
		await node.execute.call(ctx);

		expect(ctx._mockRequest).toHaveBeenCalledWith(
			expect.objectContaining({
				method: 'DELETE',
				uri: expect.stringContaining('/pipeline/activities/act-5'),
				qs: expect.objectContaining({ pipeline_card_id: 'card-42' }),
			}),
		);
	});
});

// ---------------------------------------------------------------------------
// Follow-up — body wrapped in "follow_up" key (v0.5.5 fixes)
// ---------------------------------------------------------------------------

describe('Follow-up — field mapping (v0.5.5 fixes)', () => {
	let node: NooviChat;

	beforeEach(() => {
		node = new NooviChat();
	});

	it('followUp.create — wraps fields in "follow_up" key', async () => {
		const ctx = buildContext('followUp', 'create', {
			conversationId: '10',
			title: 'Check in',
			content: 'How is the project going?',
			scheduledAt: '2026-04-15T09:00:00Z',
			inboxId: '3',
		});
		await node.execute.call(ctx);

		expect(ctx._mockRequest).toHaveBeenCalledWith(
			expect.objectContaining({
				method: 'POST',
				uri: expect.stringContaining('/conversations/10/follow-ups'),
				body: expect.objectContaining({
					follow_up: expect.objectContaining({
						content: 'How is the project going?',
						scheduled_at: '2026-04-15T09:00:00Z',
						inbox_id: '3',
					}),
				}),
			}),
		);
	});

	it('followUp.create — does NOT send fields flat at top-level', async () => {
		const ctx = buildContext('followUp', 'create', {
			conversationId: '10',
			title: 'Check in',
			content: 'Test',
			scheduledAt: '2026-04-15T09:00:00Z',
			inboxId: '3',
		});
		await node.execute.call(ctx);

		const callBody = ctx._mockRequest.mock.calls[0][0].body;
		// Fields should be nested under follow_up, not at root
		expect(callBody).not.toHaveProperty('content');
		expect(callBody).not.toHaveProperty('scheduled_at');
		expect(callBody).toHaveProperty('follow_up');
	});

	it('followUp.update — wraps fields in "follow_up" key', async () => {
		const ctx = buildContext('followUp', 'update', {
			conversationId: '10',
			followUpId: 'fu-20',
			title: 'Updated',
			content: 'New content',
			scheduledAt: '2026-05-01T09:00:00Z',
		});
		await node.execute.call(ctx);

		expect(ctx._mockRequest).toHaveBeenCalledWith(
			expect.objectContaining({
				method: 'PATCH',
				uri: expect.stringContaining('/conversations/10/follow-ups/fu-20'),
				body: expect.objectContaining({
					follow_up: expect.objectContaining({
						content: 'New content',
						scheduled_at: '2026-05-01T09:00:00Z',
					}),
				}),
			}),
		);
	});

	it('followUp.get — calls GET /conversations/:id/follow-ups/:id', async () => {
		const ctx = buildContext('followUp', 'get', {
			conversationId: '10',
			followUpId: 'fu-20',
			templateId: '',
		});
		await node.execute.call(ctx);

		expect(ctx._mockRequest).toHaveBeenCalledWith(
			expect.objectContaining({
				uri: expect.stringContaining('/conversations/10/follow-ups/fu-20'),
			}),
		);
	});

	it('followUp.cancel — calls POST /conversations/:id/follow-ups/:id/cancel', async () => {
		const ctx = buildContext('followUp', 'cancel', {
			conversationId: '10',
			followUpId: 'fu-20',
			templateId: '',
		});
		await node.execute.call(ctx);

		expect(ctx._mockRequest).toHaveBeenCalledWith(
			expect.objectContaining({
				method: 'POST',
				uri: expect.stringContaining('/follow-ups/fu-20/cancel'),
			}),
		);
	});
});

// ---------------------------------------------------------------------------
// Webhook auto-registration / removal — already in NooviChatTrigger tests
// but adding explicit integration-style check here for completeness
// ---------------------------------------------------------------------------

describe('Webhook auto-registration / removal (Trigger)', () => {
	let trigger: NooviChatTrigger;
	const mockApiRequest = jest.fn();
	const mockStaticData: Record<string, any> = {};

	const buildHookCtx = (event = 'message_created') => ({
		getWorkflowStaticData: (_scope: string) => mockStaticData,
		getNodeWebhookUrl: (_name: string) => 'https://n8n.example.com/webhook/integration-test',
		// accountId é validado por nooviChatApiRequest (GenericFunctions) e lido
		// via getNodeParameter — precisa ser positive integer.
		getNodeParameter: (name: string) => {
			if (name === 'event') return event;
			if (name === 'accountId') return 1;
			return undefined;
		},
		getCredentials: jest.fn().mockResolvedValue(BASE_CREDENTIALS),
		helpers: { request: mockApiRequest },
		getNode: () => ({ name: 'NooviChat Trigger', typeVersion: 1 }),
	} as any);

	beforeEach(() => {
		trigger = new NooviChatTrigger();
		jest.clearAllMocks();
		Object.keys(mockStaticData).forEach((k) => delete mockStaticData[k]);
	});

	it('create — registers webhook and stores id in staticData', async () => {
		mockApiRequest.mockResolvedValue({ id: 200 });

		const result = await trigger.webhookMethods!.default.create.call(buildHookCtx('contact_created'));

		expect(result).toBe(true);
		expect(mockStaticData.webhookId).toBe(200);
		expect(mockApiRequest).toHaveBeenCalledWith(
			expect.objectContaining({
				method: 'POST',
				body: expect.objectContaining({
					subscriptions: ['contact_created'],
				}),
			}),
		);
	});

	it('delete — removes webhook via API and clears staticData', async () => {
		mockStaticData.webhookId = 200;
		mockApiRequest.mockResolvedValue({});

		const result = await trigger.webhookMethods!.default.delete.call(buildHookCtx());

		expect(result).toBe(true);
		expect(mockStaticData.webhookId).toBeUndefined();
		expect(mockApiRequest).toHaveBeenCalledWith(
			expect.objectContaining({
				method: 'DELETE',
				uri: expect.stringContaining('/webhooks/200'),
			}),
		);
	});

	it('full lifecycle — create then delete cleans up properly', async () => {
		// Step 1: create
		mockApiRequest.mockResolvedValue({ id: 300 });
		await trigger.webhookMethods!.default.create.call(buildHookCtx());
		expect(mockStaticData.webhookId).toBe(300);

		// Step 2: delete
		mockApiRequest.mockResolvedValue({});
		await trigger.webhookMethods!.default.delete.call(buildHookCtx());
		expect(mockStaticData.webhookId).toBeUndefined();
		expect(mockApiRequest).toHaveBeenCalledTimes(2);
	});

	it('checkExists — returns true when webhook id matches API list', async () => {
		mockStaticData.webhookId = 300;
		mockApiRequest.mockResolvedValue([
			{ id: 300, url: 'https://n8n.example.com/webhook/integration-test' },
		]);

		const result = await trigger.webhookMethods!.default.checkExists.call(buildHookCtx());

		expect(result).toBe(true);
	});

	it('checkExists — clears stale id when not found in API list', async () => {
		mockStaticData.webhookId = 999;
		mockApiRequest.mockResolvedValue([
			{ id: 1, url: 'https://other.url' },
		]);

		const result = await trigger.webhookMethods!.default.checkExists.call(buildHookCtx());

		expect(result).toBe(false);
		expect(mockStaticData.webhookId).toBeUndefined();
	});
});

// ---------------------------------------------------------------------------
// Broadcast → WhatsApp Group source (NC-32)
// ---------------------------------------------------------------------------

describe('Broadcast — WhatsApp Group source (NC-32)', () => {
	let node: NooviChat;

	beforeEach(() => {
		node = new NooviChat();
	});

	it('broadcast.create (whatsapp_group) — sends source_type and broadcast_targets', async () => {
		const targets = [
			{ target_kind: 'group', provider_jid: '120363000000000000@g.us', metadata: { name: 'Leads' } },
		];
		const ctx = buildContext('broadcast', 'create', {
			name: 'Group blast',
			sourceType: 'whatsapp_group',
			messageType: 'custom',
			sourceConfig: '{}',
			messagePayload: '{ "messages": [{ "type": "text", "content": "Oi" }] }',
			broadcastTargets: targets,
			inboxIds: '2',
			additionalFields: {},
		});
		await node.execute.call(ctx);

		expect(ctx._mockRequest).toHaveBeenCalledWith(
			expect.objectContaining({
				method: 'POST',
				uri: expect.stringContaining('/broadcasts'),
				body: expect.objectContaining({
					broadcast: expect.objectContaining({
						source_type: 'whatsapp_group',
						broadcast_targets: targets,
						inbox_ids: [2],
					}),
				}),
			}),
		);
	});

	it('broadcast.create (csv) — does NOT add broadcast_targets', async () => {
		const ctx = buildContext('broadcast', 'create', {
			name: 'CSV blast',
			sourceType: 'csv',
			messageType: 'custom',
			sourceConfig: '{ "csv_rows": [] }',
			messagePayload: '{ "messages": [] }',
			inboxIds: '',
			additionalFields: {},
		});
		await node.execute.call(ctx);

		const body = ctx._mockRequest.mock.calls[0][0].body;
		expect(body.broadcast).not.toHaveProperty('broadcast_targets');
		expect(body.broadcast.source_type).toBe('csv');
	});
});

// ---------------------------------------------------------------------------
// WhatsApp Hub — group management & rich messages (NC-50)
// ---------------------------------------------------------------------------

describe('WhatsApp Hub — group ops (NC-50)', () => {
	let node: NooviChat;

	beforeEach(() => {
		node = new NooviChat();
	});

	it('removeParticipants — POST remove_participants with group_jid + phones array', async () => {
		const ctx = buildContext('whatsAppHub', 'removeParticipants', {
			inboxId: '5',
			groupJid: '120363@g.us',
			phones: '5511999998888, 5521999997777',
		});
		await node.execute.call(ctx);

		expect(ctx._mockRequest).toHaveBeenCalledWith(
			expect.objectContaining({
				method: 'POST',
				uri: expect.stringContaining('/noovi_connect/5/remove_participants'),
				body: { group_jid: '120363@g.us', phones: ['5511999998888', '5521999997777'] },
			}),
		);
	});

	it('promoteParticipants — maps op to snake_case action', async () => {
		const ctx = buildContext('whatsAppHub', 'promoteParticipants', {
			inboxId: '5',
			groupJid: '120363@g.us',
			phones: '5511999998888',
		});
		await node.execute.call(ctx);

		expect(ctx._mockRequest).toHaveBeenCalledWith(
			expect.objectContaining({
				uri: expect.stringContaining('/noovi_connect/5/promote_participants'),
			}),
		);
	});

	it('demoteParticipants — maps op to snake_case action', async () => {
		const ctx = buildContext('whatsAppHub', 'demoteParticipants', {
			inboxId: '5',
			groupJid: '120363@g.us',
			phones: '5511999998888',
		});
		await node.execute.call(ctx);

		expect(ctx._mockRequest).toHaveBeenCalledWith(
			expect.objectContaining({
				uri: expect.stringContaining('/noovi_connect/5/demote_participants'),
			}),
		);
	});

	it('getInviteLink — GET group_invite_link with group_jid as qs', async () => {
		const ctx = buildContext('whatsAppHub', 'getInviteLink', {
			inboxId: '5',
			groupJid: '120363@g.us',
		});
		await node.execute.call(ctx);

		expect(ctx._mockRequest).toHaveBeenCalledWith(
			expect.objectContaining({
				method: 'GET',
				uri: expect.stringContaining('/noovi_connect/5/group_invite_link'),
				qs: { group_jid: '120363@g.us' },
			}),
		);
	});

	it('setGroupName — POST set_group_name with name', async () => {
		const ctx = buildContext('whatsAppHub', 'setGroupName', {
			inboxId: '5',
			groupJid: '120363@g.us',
			groupName: 'New name',
		});
		await node.execute.call(ctx);

		expect(ctx._mockRequest).toHaveBeenCalledWith(
			expect.objectContaining({
				method: 'POST',
				uri: expect.stringContaining('/noovi_connect/5/set_group_name'),
				body: { group_jid: '120363@g.us', name: 'New name' },
			}),
		);
	});

	it('setGroupTopic — POST set_group_topic with topic', async () => {
		const ctx = buildContext('whatsAppHub', 'setGroupTopic', {
			inboxId: '5',
			groupJid: '120363@g.us',
			groupTopic: 'New topic',
		});
		await node.execute.call(ctx);

		expect(ctx._mockRequest).toHaveBeenCalledWith(
			expect.objectContaining({
				uri: expect.stringContaining('/noovi_connect/5/set_group_topic'),
				body: { group_jid: '120363@g.us', topic: 'New topic' },
			}),
		);
	});

	it('setGroupPhoto — POST set_group_photo with parsed photo object', async () => {
		const ctx = buildContext('whatsAppHub', 'setGroupPhoto', {
			inboxId: '5',
			groupJid: '120363@g.us',
			groupPhoto: '{ "url": "https://x.com/a.jpg" }',
		});
		await node.execute.call(ctx);

		expect(ctx._mockRequest).toHaveBeenCalledWith(
			expect.objectContaining({
				uri: expect.stringContaining('/noovi_connect/5/set_group_photo'),
				body: { group_jid: '120363@g.us', photo: { url: 'https://x.com/a.jpg' } },
			}),
		);
	});

	it('setGroupLocked — POST set_group_locked with boolean', async () => {
		const ctx = buildContext('whatsAppHub', 'setGroupLocked', {
			inboxId: '5',
			groupJid: '120363@g.us',
			groupLocked: true,
		});
		await node.execute.call(ctx);

		expect(ctx._mockRequest).toHaveBeenCalledWith(
			expect.objectContaining({
				uri: expect.stringContaining('/noovi_connect/5/set_group_locked'),
				body: { group_jid: '120363@g.us', locked: true },
			}),
		);
	});

	it('setGroupAnnounce — POST set_group_announce with boolean', async () => {
		const ctx = buildContext('whatsAppHub', 'setGroupAnnounce', {
			inboxId: '5',
			groupJid: '120363@g.us',
			groupAnnounce: true,
		});
		await node.execute.call(ctx);

		expect(ctx._mockRequest).toHaveBeenCalledWith(
			expect.objectContaining({
				uri: expect.stringContaining('/noovi_connect/5/set_group_announce'),
				body: { group_jid: '120363@g.us', announce: true },
			}),
		);
	});

	it('leaveGroup — POST leave_group with group_jid', async () => {
		const ctx = buildContext('whatsAppHub', 'leaveGroup', {
			inboxId: '5',
			groupJid: '120363@g.us',
		});
		await node.execute.call(ctx);

		expect(ctx._mockRequest).toHaveBeenCalledWith(
			expect.objectContaining({
				method: 'POST',
				uri: expect.stringContaining('/noovi_connect/5/leave_group'),
				body: { group_jid: '120363@g.us' },
			}),
		);
	});

	it('sendPoll — POST send_poll with options array and max_answer', async () => {
		const ctx = buildContext('whatsAppHub', 'sendPoll', {
			inboxId: '5',
			phone: '5511999998888',
			question: 'Pick one',
			pollOptions: 'A, B, C',
			maxAnswer: 2,
		});
		await node.execute.call(ctx);

		expect(ctx._mockRequest).toHaveBeenCalledWith(
			expect.objectContaining({
				method: 'POST',
				uri: expect.stringContaining('/noovi_connect/5/send_poll'),
				body: { phone: '5511999998888', question: 'Pick one', options: ['A', 'B', 'C'], max_answer: 2 },
			}),
		);
	});

	it('sendLocation — POST send_location, omits title when empty', async () => {
		const ctx = buildContext('whatsAppHub', 'sendLocation', {
			inboxId: '5',
			phone: '5511999998888',
			latitude: '-23.55',
			longitude: '-46.63',
			locationTitle: '',
		});
		await node.execute.call(ctx);

		const body = ctx._mockRequest.mock.calls[0][0].body;
		expect(body).toEqual({ phone: '5511999998888', latitude: '-23.55', longitude: '-46.63' });
		expect(body).not.toHaveProperty('title');
	});

	it('sendLocation — includes title when provided', async () => {
		const ctx = buildContext('whatsAppHub', 'sendLocation', {
			inboxId: '5',
			phone: '5511999998888',
			latitude: '-23.55',
			longitude: '-46.63',
			locationTitle: 'HQ',
		});
		await node.execute.call(ctx);

		expect(ctx._mockRequest).toHaveBeenCalledWith(
			expect.objectContaining({
				body: expect.objectContaining({ title: 'HQ' }),
			}),
		);
	});

	it('unfollowNewsletter — POST unfollow_newsletter with newsletter_id', async () => {
		const ctx = buildContext('whatsAppHub', 'unfollowNewsletter', {
			inboxId: '5',
			newsletterId: '12036@newsletter',
		});
		await node.execute.call(ctx);

		expect(ctx._mockRequest).toHaveBeenCalledWith(
			expect.objectContaining({
				method: 'POST',
				uri: expect.stringContaining('/noovi_connect/5/unfollow_newsletter'),
				body: { newsletter_id: '12036@newsletter' },
			}),
		);
	});

	it('getProfile — GET profile', async () => {
		const ctx = buildContext('whatsAppHub', 'getProfile', { inboxId: '5' });
		await node.execute.call(ctx);
		expect(ctx._mockRequest).toHaveBeenCalledWith(
			expect.objectContaining({ method: 'GET', uri: expect.stringContaining('/noovi_connect/5/profile') }),
		);
	});

	it('setProfileStatus — POST set_profile_status with status', async () => {
		const ctx = buildContext('whatsAppHub', 'setProfileStatus', { inboxId: '5', profileStatus: 'Disponível' });
		await node.execute.call(ctx);
		expect(ctx._mockRequest).toHaveBeenCalledWith(
			expect.objectContaining({
				method: 'POST',
				uri: expect.stringContaining('/noovi_connect/5/set_profile_status'),
				body: { status: 'Disponível' },
			}),
		);
	});

	it('checkNumber — GET check_number with phone query', async () => {
		const ctx = buildContext('whatsAppHub', 'checkNumber', { inboxId: '5', phone: '5511999999999' });
		await node.execute.call(ctx);
		expect(ctx._mockRequest).toHaveBeenCalledWith(
			expect.objectContaining({
				method: 'GET',
				uri: expect.stringContaining('/noovi_connect/5/check_number'),
				qs: { phone: '5511999999999' },
			}),
		);
	});

	it('getLabels — GET labels', async () => {
		const ctx = buildContext('whatsAppHub', 'getLabels', { inboxId: '5' });
		await node.execute.call(ctx);
		expect(ctx._mockRequest).toHaveBeenCalledWith(
			expect.objectContaining({ method: 'GET', uri: expect.stringContaining('/noovi_connect/5/labels') }),
		);
	});

	it('getLabelChats — GET label_chats with label_id query', async () => {
		const ctx = buildContext('whatsAppHub', 'getLabelChats', { inboxId: '5', labelId: '3' });
		await node.execute.call(ctx);
		expect(ctx._mockRequest).toHaveBeenCalledWith(
			expect.objectContaining({
				method: 'GET',
				uri: expect.stringContaining('/noovi_connect/5/label_chats'),
				qs: { label_id: '3' },
			}),
		);
	});

	it('getGroupPicture — GET group_picture with group_jid query', async () => {
		const ctx = buildContext('whatsAppHub', 'getGroupPicture', { inboxId: '5', groupJid: '120363@g.us' });
		await node.execute.call(ctx);
		expect(ctx._mockRequest).toHaveBeenCalledWith(
			expect.objectContaining({
				method: 'GET',
				uri: expect.stringContaining('/noovi_connect/5/group_picture'),
				qs: { group_jid: '120363@g.us' },
			}),
		);
	});

	it('getGroupInfoFromLink — GET group_info_from_link with link query', async () => {
		const ctx = buildContext('whatsAppHub', 'getGroupInfoFromLink', {
			inboxId: '5',
			groupLink: 'https://chat.whatsapp.com/abc',
		});
		await node.execute.call(ctx);
		expect(ctx._mockRequest).toHaveBeenCalledWith(
			expect.objectContaining({
				method: 'GET',
				uri: expect.stringContaining('/noovi_connect/5/group_info_from_link'),
				qs: { link: 'https://chat.whatsapp.com/abc' },
			}),
		);
	});

	it('joinGroupWithLink — POST join_group_with_link with link', async () => {
		const ctx = buildContext('whatsAppHub', 'joinGroupWithLink', {
			inboxId: '5',
			groupLink: 'https://chat.whatsapp.com/abc',
		});
		await node.execute.call(ctx);
		expect(ctx._mockRequest).toHaveBeenCalledWith(
			expect.objectContaining({
				method: 'POST',
				uri: expect.stringContaining('/noovi_connect/5/join_group_with_link'),
				body: { link: 'https://chat.whatsapp.com/abc' },
			}),
		);
	});
});
