import { INodeProperties } from 'n8n-workflow';

export const InboxResource: INodeProperties[] = [
	{
		displayName: 'Resource',
		name: 'resource',
		type: 'options',
		noDataExpression: true,
		options: [
			{ name: 'Inbox', value: 'inbox' },
		],
		default: 'inbox',
	},
];

export const InboxOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['inbox'],
			},
		},
		options: [
			{ name: 'Create', value: 'create', action: 'Create an inbox' },
			{ name: 'Get', value: 'get', action: 'Get an inbox' },
			{ name: 'Get Many', value: 'getAll', action: 'Get many inboxes' },
			{ name: 'Update', value: 'update', action: 'Update an inbox' },
			{ name: 'Delete', value: 'delete', action: 'Delete an inbox' },
			{ name: 'Get Agents', value: 'getAgents', action: 'Get inbox agents' },
			{ name: 'Update Agents', value: 'updateAgents', action: 'Update inbox agents' },
		],
		default: 'getAll',
	},
];

export const InboxFields: INodeProperties[] = [
	{
		displayName: 'Inbox ID',
		name: 'inboxId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['inbox'],
				operation: ['get', 'update', 'delete', 'getAgents', 'updateAgents'],
			},
		},
		default: '',
		description: 'ID of the inbox',
	},

	// Create inbox fields
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['inbox'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'Name of the inbox',
	},
	{
		displayName: 'Channel Type',
		name: 'channel',
		type: 'options',
		required: true,
		displayOptions: {
			show: {
				resource: ['inbox'],
				operation: ['create'],
			},
		},
		options: [
			{ name: 'Website (Web Widget)', value: 'web_widget', description: 'Web chat widget embedded in your website' },
			{ name: 'WhatsApp (WAHA)', value: 'waha_whatsapp', description: 'WhatsApp channel via WAHA integration' },
			{ name: 'WhatsApp (Other)', value: 'whatsapp', description: 'WhatsApp channel via other providers' },
			{ name: 'Email', value: 'email', description: 'Email inbox' },
			{ name: 'API', value: 'api', description: 'Generic API channel for custom integrations' },
			{ name: 'SMS', value: 'sms', description: 'SMS channel' },
			{ name: 'Telegram', value: 'telegram', description: 'Telegram bot channel' },
			{ name: 'LINE', value: 'line', description: 'LINE messaging channel' },
		],
		default: 'web_widget',
		description: 'Channel type for the inbox',
	},

	// Update inbox fields
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['inbox'],
				operation: ['update'],
			},
		},
		default: '',
		description: 'New name for the inbox',
	},

	// Update Agents
	{
		displayName: 'Agent IDs',
		name: 'agentIds',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['inbox'],
				operation: ['updateAgents'],
			},
		},
		default: '',
		description: 'Comma-separated list of agent IDs to assign to this inbox',
	},

	// Get Many options
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['inbox'],
				operation: ['getAll'],
			},
		},
		default: false,
		description: 'Whether to return all results instead of applying a limit',
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['inbox'],
				operation: ['getAll'],
				returnAll: [false],
			},
		},
		default: 50,
		description: 'Maximum number of results to return',
	},
];