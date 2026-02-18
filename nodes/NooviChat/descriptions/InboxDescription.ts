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
		displayName: 'Channel',
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
			{ name: 'Website', value: 'Channel::WebWidget', description: 'Web chat widget embedded in your website' },
			{ name: 'WhatsApp', value: 'Channel::Whatsapp', description: 'WhatsApp channel via WAHA or other providers' },
			{ name: 'Facebook', value: 'Channel::FacebookPage', description: 'Facebook Page Messenger' },
			{ name: 'Twitter', value: 'Channel::TwitterProfile', description: 'Twitter / X DMs' },
			{ name: 'Email', value: 'Channel::Email', description: 'Email inbox' },
			{ name: 'SMS', value: 'Channel::Sms', description: 'SMS channel' },
			{ name: 'API', value: 'Channel::Api', description: 'Generic API channel for custom integrations' },
			{ name: 'Telegram', value: 'Channel::Telegram', description: 'Telegram bot channel' },
			{ name: 'LINE', value: 'Channel::Line', description: 'LINE messaging channel' },
		],
		default: 'Channel::WebWidget',
		description: 'Channel type for the inbox',
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