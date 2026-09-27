import { INodeProperties } from 'n8n-workflow';

// Pipeline Pro — outgoing webhooks for pipeline card events
// (Pipeline::WebhooksController, body wrapper `pipeline_webhook`).
// Routes: /api/v1/accounts/:account_id/pipeline/webhooks[/:id[/test]]
// Not exposed: PATCH /:id/regenerate_secret — rotating the signing secret returns
// it in the response, and secrets must not travel through a workflow.
// The signing `secret` is returned only once, in the response of Create.
export const PipelineWebhookOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['pipelineWebhook'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				action: 'Create a pipeline webhook',
				description: 'Create a webhook. The signing secret is returned only in this response.',
			},
			{ name: 'Get', value: 'get', action: 'Get a pipeline webhook' },
			{ name: 'Get Many', value: 'getAll', action: 'Get many pipeline webhooks' },
			{ name: 'Update', value: 'update', action: 'Update a pipeline webhook' },
			{ name: 'Delete', value: 'delete', action: 'Delete a pipeline webhook' },
			{
				name: 'Test',
				value: 'test',
				action: 'Send a test event to a pipeline webhook',
				description: 'Deliver a sample payload for the first configured event. The webhook must be active.',
			},
		],
		default: 'getAll',
	},
];

const EVENT_OPTIONS = [
	{ name: 'Card Created', value: 'pipeline_card_created' },
	{ name: 'Card Deleted', value: 'pipeline_card_deleted' },
	{ name: 'Card Lost', value: 'pipeline_card_lost' },
	{ name: 'Card Owner Changed', value: 'pipeline_card_owner_changed' },
	{ name: 'Card SLA Exceeded', value: 'pipeline_card_sla_exceeded' },
	{ name: 'Card Stage Changed', value: 'pipeline_card_stage_changed' },
	{ name: 'Card Updated', value: 'pipeline_card_updated' },
	{ name: 'Card Won', value: 'pipeline_card_won' },
];

export const PipelineWebhookFields: INodeProperties[] = [
	{
		displayName: 'Webhook ID',
		name: 'pipelineWebhookId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['pipelineWebhook'],
				operation: ['get', 'update', 'delete', 'test'],
			},
		},
		default: '',
	},
	{
		displayName: 'Name',
		name: 'webhookName',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['pipelineWebhook'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'Name of the webhook (max 100 characters)',
	},
	{
		displayName: 'URL',
		name: 'webhookUrl',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['pipelineWebhook'],
				operation: ['create'],
			},
		},
		default: '',
		placeholder: 'https://example.com/hooks/pipeline',
		description: 'HTTP(S) URL that receives the events. Private and local addresses are refused with 422.',
	},
	{
		displayName: 'Events',
		name: 'webhookEvents',
		type: 'multiOptions',
		required: true,
		displayOptions: {
			show: {
				resource: ['pipelineWebhook'],
				operation: ['create'],
			},
		},
		options: EVENT_OPTIONS,
		default: [],
		description: 'Card events delivered to the URL',
	},
	{
		displayName: 'Additional Fields',
		name: 'webhookAdditionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		displayOptions: {
			show: {
				resource: ['pipelineWebhook'],
				operation: ['create'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Active',
				name: 'active',
				type: 'boolean',
				default: true,
				description: 'Whether the webhook delivers events',
			},
			{
				displayName: 'Pipeline ID',
				name: 'pipelineId',
				type: 'string',
				default: '',
				description: 'Only deliver events of this pipeline. Leave empty for every pipeline.',
			},
		],
	},
	{
		displayName: 'Update Fields',
		name: 'webhookUpdateFields',
		type: 'collection',
		placeholder: 'Add Field',
		displayOptions: {
			show: {
				resource: ['pipelineWebhook'],
				operation: ['update'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Active',
				name: 'active',
				type: 'boolean',
				default: true,
				description: 'Whether the webhook delivers events',
			},
			{
				displayName: 'Events',
				name: 'events',
				type: 'multiOptions',
				options: EVENT_OPTIONS,
				default: [],
				description: 'Replaces the subscribed events',
			},
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Pipeline ID',
				name: 'pipelineId',
				type: 'string',
				default: '',
			},
			{
				displayName: 'URL',
				name: 'url',
				type: 'string',
				default: '',
			},
		],
	},
];
