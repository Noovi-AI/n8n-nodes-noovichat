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
		description: 'ID da inbox',
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
		description: 'Nome da inbox',
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
			{ name: 'Website', value: 'Channel::WebWidget' },
			{ name: 'WhatsApp', value: 'Channel::Whatsapp' },
			{ name: 'Facebook', value: 'Channel::FacebookPage' },
			{ name: 'Twitter', value: 'Channel::TwitterProfile' },
			{ name: 'Email', value: 'Channel::Email' },
			{ name: 'SMS', value: 'Channel::Sms' },
			{ name: 'API', value: 'Channel::Api' },
			{ name: 'Telegram', value: 'Channel::Telegram' },
			{ name: 'LINE', value: 'Channel::Line' },
		],
		default: 'Channel::WebWidget',
		description: 'Tipo do canal',
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
		description: 'IDs dos agentes separados por vírgula',
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
		description: 'Retornar todos os resultados ou limite',
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
		description: 'Número máximo de resultados',
	},
];