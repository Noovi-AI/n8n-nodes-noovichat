import { NooviChat } from '../nodes/NooviChat/NooviChat.node';

// Contract tests for the Pipeline API-coverage normalization: every new
// operation must hit the real Chatwoot route with the controller's real
// strong-params wrapper and pagination style.

const BASE = 'https://chat.example.com/api/v1/accounts/1';

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
		returnAll: false,
		limit: 50,
		...params,
	};

	return {
		getInputData: () => [{ json: {} }],
		getNodeParameter: (name: string, _index: number, fallback?: any) => {
			if (parameterMap[name] !== undefined) return parameterMap[name];
			if (name.includes('.')) {
				const segments = name.split('.');
				let cursor: any = parameterMap[segments[0]];
				for (let i = 1; i < segments.length && cursor != null; i++) cursor = cursor[segments[i]];
				if (cursor !== undefined) return cursor;
			}
			return fallback;
		},
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

async function run(resource: string, operation: string, params: Record<string, any> = {}, mockReturnValue?: any) {
	const ctx = buildContext(resource, operation, params, mockReturnValue);
	await new NooviChat().execute.call(ctx);
	return ctx._mockRequest.mock.calls.map((c: any[]) => c[0]);
}

describe('Pipeline coverage — every declared operation has a handler', () => {
	const node = new NooviChat();
	const operationProps = node.description.properties.filter((p) => p.name === 'operation');

	const newResources = [
		'pipelineAutomation',
		'pipelineWebhook',
		'pipelineFollowUpRule',
		'sequenceDefinition',
		'activityTemplate',
		'pipelineProduct',
		'pipelineOpportunity',
		'followUpAutomation',
	];

	it('registers the new resources in the resource selector', () => {
		const resourceProperty = node.description.properties.find((p) => p.name === 'resource');
		const values = (resourceProperty!.options as Array<{ value: string }>).map((o) => o.value);
		expect(values).toEqual(expect.arrayContaining(newResources));
	});

	for (const prop of operationProps) {
		const resource = prop.displayOptions!.show!.resource![0] as string;
		if (!['card', 'pipeline', 'activity', 'leadScoring', 'followUp', ...newResources].includes(resource)) continue;
		for (const option of prop.options as Array<{ value: string }>) {
			it(`${resource}.${option.value} is routed (no "Unknown operation")`, async () => {
				const ctx = buildContext(resource, option.value, {
					// Generic values that satisfy every required parameter.
					cardId: '10',
					cardIds: { values: [{ id: '1' }] },
					ownerId: 7,
					bulkPriority: 'high',
					qualificationChecklist: '{"a":{"checked":true,"points":5}}',
					overrideScore: 40,
					attachmentId: '3',
					analyticsPipelineId: '2',
					agentUserId: '7',
					pipelineCardId: '10',
					activityId: '5',
					rescheduleAt: '2026-10-01T10:00:00Z',
					bulkCardIds: '1,2',
					activityTemplateId: '4',
					templateId: '9',
					templateAttachmentId: '11',
					templateItemId: '12',
					templateItemOrder: '12,13',
					logId: '6',
					automationId: '8',
					automationTemplateId: '3',
					automationName: 'A',
					importData: '{"automation":{"name":"x"}}',
					pipelineWebhookId: '5',
					webhookName: 'W',
					webhookUrl: 'https://hooks.example.com/x',
					webhookEvents: ['pipeline_card_won'],
					rulePipelineId: '2',
					followUpRuleId: '3',
					ruleToStage: '2_won',
					sequenceDefinitionId: '4',
					sequenceName: 'S',
					sequenceTriggerType: 'manual',
					sequenceSteps: '[{"step_number":1,"activity_type":"call","title":"c"}]',
					activityTemplateName: 'T',
					templateActivityType: 'call',
					productId: '6',
					productName: 'P',
					opportunityCardId: '10',
					opportunityId: '20',
					followUpAutomationId: '7',
					followUpAutomationName: 'F',
					followUpTriggerType: 'label_added',
					title: 't',
					activityType: 'call',
					conversationId: '1',
					followUpId: '1',
					content: 'c',
					scheduledAt: '2026-10-01T10:00:00Z',
					inboxId: '1',
					itemType: 'text',
					templateName: 'n',
					templateContent: 'c',
					ruleId: '1',
					ruleName: 'r',
					points: 1,
					eventType: 'message_received',
					pipelineId: '2',
					stageId: '2_lead',
					name: 'n',
					initialStages: { values: [{ stageName: 'Lead', stageColor: '#fff', stagePosition: 1 }] },
					stages: { values: [{ stageName: 'X', stageColor: '#fff' }] },
					stageOrder: { values: [{ id: 'x' }] },
					updateFields: '{}',
					linkId: '1',
					contactRole: 'x',
					contactId: '1',
					conversationDisplayId: 1,
				}, { stages: { '2_lead': { name: 'Lead' } }, stage_version: 1 });
				await expect(new NooviChat().execute.call(ctx)).resolves.toBeDefined();
			});
		}
	}
});

describe('Card — trash, owners, bulk actions, checklist, attachments', () => {
	it('getDiscarded pages /pipeline/cards/discarded with pipeline_id and a capped per_page', async () => {
		const [req] = await run('card', 'getDiscarded', { discardedPipelineId: '3', limit: 500 });
		expect(req.method).toBe('GET');
		expect(req.uri).toBe(`${BASE}/pipeline/cards/discarded`);
		expect(req.qs).toEqual({ pipeline_id: '3', per_page: 100 });
	});

	it('restore and deletePermanently use the pipeline/cards member routes', async () => {
		const [restore] = await run('card', 'restore', { cardId: '10' });
		expect(restore).toEqual(expect.objectContaining({ method: 'POST', uri: `${BASE}/pipeline/cards/10/restore` }));
		const [purge] = await run('card', 'deletePermanently', { cardId: '10' });
		expect(purge).toEqual(expect.objectContaining({ method: 'DELETE', uri: `${BASE}/pipeline/cards/10/permanently_delete` }));
	});

	it('assignOwner sends owner_id and turns 0 into an explicit null (unassign)', async () => {
		const [assign] = await run('card', 'assignOwner', { cardId: '10', ownerId: 7, notifyOwner: true });
		expect(assign).toEqual(expect.objectContaining({
			method: 'PATCH',
			uri: `${BASE}/pipeline/cards/10/assign`,
			body: { owner_id: 7, notify: true },
		}));
		const [unassign] = await run('card', 'assignOwner', { cardId: '10', ownerId: 0 });
		expect(unassign.body).toEqual({ owner_id: null });
	});

	it('bulkAssign sends owner_id for a single owner and only distribution otherwise', async () => {
		const [direct] = await run('card', 'bulkAssign', {
			cardIds: { values: [{ id: '1' }, { id: '2' }] },
			ownerDistribution: 'direct',
			ownerId: 7,
		});
		expect(direct).toEqual(expect.objectContaining({
			method: 'POST',
			uri: `${BASE}/pipeline/cards/bulk_assign`,
			body: { item_ids: ['1', '2'], owner_id: 7 },
		}));
		const [rr] = await run('card', 'bulkAssign', {
			cardIds: { values: [{ id: '1' }] },
			ownerDistribution: 'round_robin',
			ownerId: 7,
		});
		expect(rr.body).toEqual({ item_ids: ['1'], distribution: 'round_robin' });
	});

	it('bulkSetPriority and bulkDiscard post card_ids to /pipeline/bulk_actions', async () => {
		const [prio] = await run('card', 'bulkSetPriority', {
			cardIds: { values: [{ id: '1' }] },
			bulkPriority: 'urgent',
			bulkStageFilter: '2_lead',
		});
		expect(prio).toEqual(expect.objectContaining({
			method: 'POST',
			uri: `${BASE}/pipeline/bulk_actions/set_priority`,
			body: { card_ids: ['1'], priority: 'urgent', pipeline_stage: '2_lead' },
		}));
		const [discard] = await run('card', 'bulkDiscard', {
			cardIds: { values: [{ id: '1' }] },
			discardReason: 'duplicado',
		});
		expect(discard).toEqual(expect.objectContaining({
			method: 'POST',
			uri: `${BASE}/pipeline/bulk_actions/delete`,
			body: { card_ids: ['1'], reason: 'duplicado' },
		}));
	});

	it('updateQualificationChecklist wraps the checklist and rejects a non-object', async () => {
		const [req] = await run('card', 'updateQualificationChecklist', {
			cardId: '10',
			qualificationChecklist: '{"budget":{"checked":true,"points":20}}',
		});
		expect(req).toEqual(expect.objectContaining({
			method: 'PATCH',
			uri: `${BASE}/pipeline_cards/10/update_qualification_checklist`,
			body: { qualification_checklist: { budget: { checked: true, points: 20 } } },
		}));
		const ctx = buildContext('card', 'updateQualificationChecklist', { cardId: '10', qualificationChecklist: '[1]' });
		await expect(new NooviChat().execute.call(ctx)).rejects.toThrow('JSON object');
		expect(ctx._mockRequest).not.toHaveBeenCalled();
	});

	it('overrideLeadScore posts score to the nested lead_scores route', async () => {
		const [req] = await run('card', 'overrideLeadScore', { cardId: '10', overrideScore: 80 });
		expect(req).toEqual(expect.objectContaining({
			method: 'POST',
			uri: `${BASE}/pipeline/cards/10/lead_scores/override`,
			body: { score: 80 },
		}));
	});

	it('getAttachments / deleteAttachment use the nested attachments routes', async () => {
		const [list] = await run('card', 'getAttachments', { cardId: '10' });
		expect(list).toEqual(expect.objectContaining({ method: 'GET', uri: `${BASE}/pipeline/cards/10/attachments` }));
		const [del] = await run('card', 'deleteAttachment', { cardId: '10', attachmentId: '3' });
		expect(del).toEqual(expect.objectContaining({ method: 'DELETE', uri: `${BASE}/pipeline/cards/10/attachments/3` }));
	});
});

describe('Pipeline — per-pipeline analytics', () => {
	it('getForecast sends months_ahead and the optional pipeline_id', async () => {
		const [req] = await run('pipeline', 'getForecast', { analyticsPipelineId: '2', monthsAhead: 3 });
		expect(req.uri).toBe(`${BASE}/pipeline/analytics/forecast`);
		expect(req.qs).toEqual({ months_ahead: 3, pipeline_id: '2' });
	});

	it('getPipelineDashboard sends date_start/date_end together and refuses only one of them', async () => {
		const [req] = await run('pipeline', 'getPipelineDashboard', {
			analyticsPipelineId: '2',
			dashboardDateStart: '2026-09-01',
			dashboardDateEnd: '2026-09-30',
			activityPage: 2,
			activityPerPage: 20,
		});
		expect(req.uri).toBe(`${BASE}/pipeline/analytics/pipeline_dashboard`);
		expect(req.qs).toEqual({
			pipeline_id: '2',
			activity_page: 2,
			activity_per_page: 20,
			date_start: '2026-09-01',
			date_end: '2026-09-30',
		});
		const ctx = buildContext('pipeline', 'getPipelineDashboard', { analyticsPipelineId: '2', dashboardDateStart: '2026-09-01' });
		await expect(new NooviChat().execute.call(ctx)).rejects.toThrow('together');
	});

	it('exportReport reads CSV text from /pipeline/analytics/export', async () => {
		const ctx = buildContext('pipeline', 'exportReport', { analyticsPipelineId: '2' }, 'Metric,Value\n');
		const out = await new NooviChat().execute.call(ctx);
		const [req] = ctx._mockRequest.mock.calls.map((c: any[]) => c[0]);
		expect(req.uri).toBe(`${BASE}/pipeline/analytics/export`);
		expect(req.json).toBe(false);
		expect(out[0][0].json).toEqual({ csv: 'Metric,Value\n' });
	});

	it('getAgentPipeline and getLostReasonsAnalytics hit their analytics routes', async () => {
		const [agent] = await run('pipeline', 'getAgentPipeline', { agentUserId: '7' });
		expect(agent.uri).toBe(`${BASE}/pipeline/analytics/pipeline/7`);
		const [lost] = await run('pipeline', 'getLostReasonsAnalytics', { startDate: '2026-09-01', endDate: '2026-09-30' });
		expect(lost.uri).toBe(`${BASE}/pipeline/deal_status/lost_reasons`);
		expect(lost.qs).toEqual({ start_date: '2026-09-01', end_date: '2026-09-30' });
	});
});

describe('Activity — search, reschedule, bulk and template', () => {
	it('search maps filters to the controller param names', async () => {
		const [req] = await run('activity', 'search', {
			searchQuery: 'demo',
			searchFilters: { type: 'call', status: 'pending', assignedToId: '3', dateFrom: '2026-09-01' },
		});
		expect(req.uri).toBe(`${BASE}/pipeline/activities/search`);
		expect(req.qs).toEqual({ q: 'demo', type: 'call', status: 'pending', assigned_to_id: '3', date_from: '2026-09-01', per_page: 50 });
	});

	it('reschedule posts scheduled_at with the card as query param', async () => {
		const [req] = await run('activity', 'reschedule', { pipelineCardId: '10', activityId: '5', rescheduleAt: '2026-10-01T10:00:00Z' });
		expect(req).toEqual(expect.objectContaining({
			method: 'POST',
			uri: `${BASE}/pipeline/activities/5/reschedule`,
			body: { scheduled_at: '2026-10-01T10:00:00Z' },
			qs: { pipeline_card_id: '10' },
		}));
	});

	it('bulkCreate sends pipeline_card_ids plus the activity wrapper', async () => {
		const [req] = await run('activity', 'bulkCreate', {
			bulkCardIds: ' 1, 2 ,,3',
			title: 'Ligar',
			activityType: 'call',
			additionalFields: { duration: 15 },
		});
		expect(req.uri).toBe(`${BASE}/pipeline/activities/bulk_create`);
		expect(req.body).toEqual({ pipeline_card_ids: ['1', '2', '3'], activity: { activity_type: 'call', title: 'Ligar', duration: 15 } });
	});

	it('createFromTemplate only sends the activity wrapper when there are overrides', async () => {
		const [bare] = await run('activity', 'createFromTemplate', { pipelineCardId: '10', activityTemplateId: '4' });
		expect(bare).toEqual(expect.objectContaining({
			uri: `${BASE}/pipeline/activities/create_from_template`,
			body: { template_id: '4' },
			qs: { pipeline_card_id: '10' },
		}));
		const [withOverride] = await run('activity', 'createFromTemplate', {
			pipelineCardId: '10',
			activityTemplateId: '4',
			templateOverrides: { title: 'Novo' },
		});
		expect(withOverride.body).toEqual({ template_id: '4', activity: { title: 'Novo' } });
	});
});

describe('Lead Scoring — reports and logs', () => {
	it('report operations send the report dates and limit', async () => {
		const [req] = await run('leadScoring', 'getTopLeads', { reportStartDate: '2026-09-01', reportLimit: 5 });
		expect(req.uri).toBe(`${BASE}/lead_score/reports/top_leads`);
		expect(req.qs).toEqual({ start_date: '2026-09-01', limit: 5 });
		const [trends] = await run('leadScoring', 'getTrends');
		expect(trends.uri).toBe(`${BASE}/lead_score/reports/trends`);
	});

	it('bulkRecalculate and getCardScoreDistribution hit their routes', async () => {
		const [bulk] = await run('leadScoring', 'bulkRecalculate');
		expect(bulk).toEqual(expect.objectContaining({ method: 'POST', uri: `${BASE}/lead_score/reports/bulk_recalculate` }));
		const [dist] = await run('leadScoring', 'getCardScoreDistribution');
		expect(dist.uri).toBe(`${BASE}/pipeline/lead_scores/distribution`);
	});

	it('getLogs maps the filters and pages with per_page', async () => {
		const [req] = await run('leadScoring', 'getLogs', {
			logFilters: { pipelineCardId: '10', categoryChangesOnly: true, eventType: 'stage_changed' },
		});
		expect(req.uri).toBe(`${BASE}/lead_score/logs`);
		expect(req.qs).toEqual({ pipeline_card_id: '10', event_type: 'stage_changed', category_changes_only: true, per_page: 50 });
	});
});

describe('Follow-up — template items', () => {
	it('updateTemplateItem wraps follow_up_template_item and keeps falsy values', async () => {
		const [req] = await run('followUp', 'updateTemplateItem', {
			templateId: '9',
			templateItemId: '12',
			templateItemUpdateFields: { delaySeconds: 0, content: 'oi' },
		});
		expect(req).toEqual(expect.objectContaining({
			method: 'PATCH',
			uri: `${BASE}/follow-up-templates/9/items/12`,
			body: { follow_up_template_item: { content: 'oi', delay_seconds: 0 } },
		}));
	});

	it('reorderTemplateItems sends ids only, so each item keeps its delay', async () => {
		const [req] = await run('followUp', 'reorderTemplateItems', { templateId: '9', templateItemOrder: '13, 12' });
		expect(req.uri).toBe(`${BASE}/follow-up-templates/9/items/reorder`);
		expect(req.body).toEqual({ items: [{ id: '13' }, { id: '12' }] });
	});

	it('getTemplateVariables and deleteTemplateAttachment hit their routes', async () => {
		const [vars] = await run('followUp', 'getTemplateVariables');
		expect(vars.uri).toBe(`${BASE}/follow-up-templates/variables`);
		const [att] = await run('followUp', 'deleteTemplateAttachment', { templateId: '9', templateAttachmentId: '11' });
		expect(att).toEqual(expect.objectContaining({ method: 'DELETE', uri: `${BASE}/follow-up-templates/9/attachments/11` }));
	});
});

describe('New resources — wrappers and pagination', () => {
	it('Pipeline Automation create wraps pipeline_automation and parses JSON fields', async () => {
		const [req] = await run('pipelineAutomation', 'create', {
			automationName: 'Auto',
			automationFields: { active: false, flow: '{"nodes":[{"id":"1"}]}', triggerType: 'event' },
		});
		expect(req.uri).toBe(`${BASE}/pipeline/automations`);
		expect(req.body).toEqual({
			pipeline_automation: { name: 'Auto', active: false, flow: { nodes: [{ id: '1' }] }, trigger_type: 'event' },
		});
	});

	it('Pipeline Automation execute sends the context and executions page by limit/offset', async () => {
		const [exec] = await run('pipelineAutomation', 'execute', { automationId: '8', executionContext: { conversationId: '55' } });
		expect(exec).toEqual(expect.objectContaining({ method: 'POST', uri: `${BASE}/pipeline/automations/8/execute`, body: { conversation_id: '55' } }));
		const [list] = await run('pipelineAutomation', 'getAllExecutions', { automationLimit: 20, automationOffset: 40, executionStatus: 'failed' });
		expect(list.uri).toBe(`${BASE}/pipeline/automations/all_executions`);
		expect(list.qs).toEqual({ limit: 20, offset: 40, status: 'failed' });
	});

	it('Pipeline Automation all audit logs uses audit_action, never action', async () => {
		const [req] = await run('pipelineAutomation', 'getAllAuditLogs', { auditLogFilters: { auditAction: 'update' } });
		expect(req.qs).toEqual({ limit: 50, offset: 0, audit_action: 'update' });
	});

	it('Pipeline Automation import wraps the object under automation', async () => {
		const [req] = await run('pipelineAutomation', 'import', { importData: '{"automation":{"name":"x"}}' });
		expect(req).toEqual(expect.objectContaining({
			uri: `${BASE}/pipeline/automations/import`,
			body: { automation: { automation: { name: 'x' } } },
		}));
	});

	it('Pipeline Automation createFromTemplate posts to /automation_templates/:id/use', async () => {
		const [req] = await run('pipelineAutomation', 'createFromTemplate', { automationTemplateId: '3', templateAutomationName: 'Meu' });
		expect(req).toEqual(expect.objectContaining({ method: 'POST', uri: `${BASE}/pipeline/automation_templates/3/use`, body: { name: 'Meu' } }));
	});

	it('Pipeline Webhook create wraps pipeline_webhook', async () => {
		const [req] = await run('pipelineWebhook', 'create', {
			webhookName: 'W',
			webhookUrl: 'https://hooks.example.com/x',
			webhookEvents: ['pipeline_card_won'],
			webhookAdditionalFields: { pipelineId: '2', active: false },
		});
		expect(req.body).toEqual({
			pipeline_webhook: { name: 'W', url: 'https://hooks.example.com/x', events: ['pipeline_card_won'], active: false, pipeline_id: '2' },
		});
	});

	it('Pipeline Follow-up Rule is nested under the pipeline and wraps pipeline_follow_up_rule', async () => {
		const [req] = await run('pipelineFollowUpRule', 'create', {
			rulePipelineId: '2',
			ruleToStage: '2_won',
			ruleFields: { delayMinutes: 0, sendWindow: '{"enabled":true,"days":[1],"start":"08:00","end":"18:00"}' },
		});
		expect(req.uri).toBe(`${BASE}/pipelines/2/follow-up-rules`);
		expect(req.body).toEqual({
			pipeline_follow_up_rule: {
				delay_minutes: 0,
				send_window: { enabled: true, days: [1], start: '08:00', end: '18:00' },
				to_stage: '2_won',
			},
		});
	});

	it('Sequence Definition create wraps pipeline_activity_sequence with parsed steps', async () => {
		const [req] = await run('sequenceDefinition', 'create', {
			sequenceName: 'S',
			sequenceTriggerType: 'manual',
			sequenceSteps: '[{"step_number":1,"activity_type":"call","title":"c"}]',
		});
		expect(req.uri).toBe(`${BASE}/pipeline/activity_sequences`);
		expect(req.body).toEqual({
			pipeline_activity_sequence: {
				name: 'S',
				trigger_type: 'manual',
				steps: [{ step_number: 1, activity_type: 'call', title: 'c' }],
			},
		});
		const [analytics] = await run('sequenceDefinition', 'getAnalytics', { daysBack: 30 });
		expect(analytics.uri).toBe(`${BASE}/pipeline/sequence_analytics`);
		expect(analytics.qs).toEqual({ days_back: 30 });
	});

	it('Activity Template create wraps pipeline_activity_template', async () => {
		const [req] = await run('activityTemplate', 'create', {
			activityTemplateName: 'T',
			templateActivityType: 'call',
			activityTemplateFields: { defaultDuration: 0, category: 'sales' },
		});
		expect(req.body).toEqual({
			pipeline_activity_template: { name: 'T', activity_type: 'call', category: 'sales', default_duration: 0 },
		});
	});

	it('Product lists by per_page/offset and sends pipeline_ids as an array', async () => {
		const [list] = await run('pipelineProduct', 'getAll', { productLimit: 20, productOffset: 40, productFilters: { activeOnly: true } });
		expect(list.uri).toBe(`${BASE}/pipeline/products`);
		expect(list.qs).toEqual({ per_page: 20, offset: 40, active_only: true });
		const [create] = await run('pipelineProduct', 'create', { productName: 'P', productFields: { pipelineIds: '3, 5', sku: 'X1' } });
		expect(create.body).toEqual({ pipeline_product: { sku: 'X1', pipeline_ids: ['3', '5'], name: 'P' } });
		const [perf] = await run('pipelineProduct', 'getPerformance', { performanceFilters: { wonStart: '2026-09-01', wonEnd: '2026-09-30' } });
		expect(perf.qs).toEqual({ won_start: '2026-09-01', won_end: '2026-09-30' });
	});

	it('Opportunity create sends flat sale fields or items, and void posts the reason', async () => {
		const [flat] = await run('pipelineOpportunity', 'create', { opportunityCardId: '10', saleFields: { totalValue: '150.00', title: 'Venda' } });
		expect(flat).toEqual(expect.objectContaining({
			uri: `${BASE}/pipeline/cards/10/opportunities`,
			body: { total_value: '150.00', title: 'Venda' },
		}));
		const [itemized] = await run('pipelineOpportunity', 'create', {
			opportunityCardId: '10',
			saleItems: '[{"pipeline_product_id":3,"quantity":"2"}]',
		});
		expect(itemized.body).toEqual({ items: [{ pipeline_product_id: 3, quantity: '2' }] });
		const [voided] = await run('pipelineOpportunity', 'void', { opportunityId: '20', voidReason: 'erro' });
		expect(voided).toEqual(expect.objectContaining({ uri: `${BASE}/pipeline/opportunities/20/void`, body: { reason: 'erro' } }));
		const [report] = await run('pipelineOpportunity', 'getReport', { reportFilters: { pipelineId: '2' } });
		expect(report.uri).toBe(`${BASE}/pipeline/opportunities/report`);
	});

	it('Follow-up Automation create wraps follow_up_automation', async () => {
		const [req] = await run('followUpAutomation', 'create', {
			followUpAutomationName: 'F',
			followUpTriggerType: 'label_added',
			followUpAutomationFields: { enabled: false, triggerConfig: '{"label_id":3}' },
		});
		expect(req.uri).toBe(`${BASE}/follow-up-automations`);
		expect(req.body).toEqual({
			follow_up_automation: { enabled: false, trigger_config: { label_id: 3 }, name: 'F', trigger_type: 'label_added' },
		});
	});
});
