import { INodeProperties } from 'n8n-workflow';

export const WebhookResource: INodeProperties[] = [
	{
		displayName: 'Resource',
		name: 'resource',
		type: 'options',
		noDataExpression: true,
		options: [
			{ name: 'Webhook', value: 'webhook' },
		],
		default: 'webhook',
	},
];

export const WebhookOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['webhook'],
			},
		},
		options: [
			{ name: 'Create', value: 'create', action: 'Create a webhook' },
			{ name: 'Get Many', value: 'getAll', action: 'Get many webhooks' },
			{ name: 'Update', value: 'update', action: 'Update a webhook' },
			{ name: 'Delete', value: 'delete', action: 'Delete a webhook' },
		],
		default: 'getAll',
	},
];

export const WebhookFields: INodeProperties[] = [
	{
		displayName: 'Webhook ID',
		name: 'webhookId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['webhook'],
				operation: ['update', 'delete'],
			},
		},
		default: '',
		description: 'ID do webhook',
	},

	// Create webhook fields
	{
		displayName: 'Webhook URL',
		name: 'webhookUrl',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['webhook'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'URL para receber os webhooks',
	},
	{
		displayName: 'Events',
		name: 'events',
		type: 'multiOptions',
		required: true,
		displayOptions: {
			show: {
				resource: ['webhook'],
				operation: ['create', 'update'],
			},
		},
		options: [
			// Conversation events
			{ name: 'Conversation Created', value: 'conversation_created' },
			{ name: 'Conversation Status Changed', value: 'conversation_status_changed' },
			{ name: 'Conversation Typing Off', value: 'conversation_typing_off' },
			{ name: 'Conversation Typing On', value: 'conversation_typing_on' },
			{ name: 'Conversation Updated', value: 'conversation_updated' },
			// Message events
			{ name: 'Message Created', value: 'message_created' },
			{ name: 'Message Updated', value: 'message_updated' },
			// Contact events
			{ name: 'Contact Created', value: 'contact_created' },
			{ name: 'Contact Updated', value: 'contact_updated' },
			// Widget events
			{ name: 'Webwidget Triggered', value: 'webwidget_triggered' },
			// NooviChat exclusive — Pipeline/Deal events
			{ name: 'Deal Created', value: 'pipeline_card_created' },
			{ name: 'Deal Lost', value: 'pipeline_card_lost' },
			{ name: 'Deal Stage Changed', value: 'pipeline_card_stage_changed' },
			{ name: 'Deal Updated', value: 'pipeline_card_updated' },
			{ name: 'Deal Won', value: 'pipeline_card_won' },
			// NooviChat exclusive — Follow-up events
			{ name: 'Follow-up Due', value: 'follow_up_due' },
			{ name: 'Follow-up Overdue', value: 'follow_up_overdue' },
			// NooviChat exclusive — Activity events
			{ name: 'Activity Due', value: 'activity_due' },
			// NooviChat exclusive — SLA events
			{ name: 'SLA Breach', value: 'sla_breach' },
			// NooviChat exclusive — WAHA events
			{ name: 'WAHA Status Changed', value: 'waha_status_changed' },
			// NooviChat exclusive — Campaign events
			{ name: 'Campaign Completed', value: 'campaign_completed' },
		],
		default: [],
		description: 'Eventos para disparar o webhook',
	},

	// Get Many options
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['webhook'],
				operation: ['getAll'],
			},
		},
		default: false,
		description: 'Retornar todos os resultados ou limite',
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['webhook'],
				operation: ['getAll'],
				returnAll: [false],
			},
		},
		default: 50,
		description: 'Número máximo de resultados',
	},
];