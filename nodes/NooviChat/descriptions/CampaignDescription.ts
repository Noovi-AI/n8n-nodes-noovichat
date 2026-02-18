import { INodeProperties } from 'n8n-workflow';

export const CampaignResource: INodeProperties[] = [
	{
		displayName: 'Resource',
		name: 'resource',
		type: 'options',
		noDataExpression: true,
		options: [
			{ name: 'Campaign', value: 'campaign' },
		],
		default: 'campaign',
	},
];

export const CampaignOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['campaign'],
			},
		},
		options: [
			{ name: 'Create', value: 'create', action: 'Create a campaign' },
			{ name: 'Get', value: 'get', action: 'Get a campaign' },
			{ name: 'Get Many', value: 'getAll', action: 'Get many campaigns' },
			{ name: 'Update', value: 'update', action: 'Update a campaign' },
			{ name: 'Delete', value: 'delete', action: 'Delete a campaign' },
		],
		default: 'getAll',
	},
];

export const CampaignFields: INodeProperties[] = [
	{
		displayName: 'Campaign ID',
		name: 'campaignId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['campaign'],
				operation: ['get', 'update', 'delete'],
			},
		},
		default: '',
		description: 'ID da campanha',
	},

	// Create campaign fields
	{
		displayName: 'Title',
		name: 'title',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['campaign'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'Título da campanha',
	},
	{
		displayName: 'Description',
		name: 'description',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['campaign'],
				operation: ['create', 'update'],
			},
		},
		default: '',
		description: 'Descrição da campanha',
	},
	{
		displayName: 'Campaign Type',
		name: 'campaignType',
		type: 'options',
		required: true,
		displayOptions: {
			show: {
				resource: ['campaign'],
				operation: ['create'],
			},
		},
		options: [
			{ name: 'One-off', value: 'one_off' },
			{ name: 'Ongoing', value: 'ongoing' },
		],
		default: 'one_off',
		description: 'Tipo da campanha',
	},
	{
		displayName: 'Inbox ID',
		name: 'inboxId',
		type: 'number',
		required: true,
		displayOptions: {
			show: {
				resource: ['campaign'],
				operation: ['create'],
			},
		},
		default: 0,
		description: 'ID da inbox para enviar a campanha',
	},
	{
		displayName: 'Message',
		name: 'message',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['campaign'],
				operation: ['create', 'update'],
			},
		},
		default: '',
		description: 'Mensagem da campanha',
		typeOptions: {
			rows: 4,
		},
	},
	{
		displayName: 'Scheduled At',
		name: 'scheduledAt',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['campaign'],
				operation: ['create', 'update'],
			},
		},
		default: '',
		description: 'Data e hora agendada (ISO 8601)',
	},
	{
		displayName: 'Audience',
		name: 'audience',
		type: 'json',
		displayOptions: {
			show: {
				resource: ['campaign'],
				operation: ['create', 'update'],
			},
		},
		default: '[]',
		description: 'Lista de IDs de contatos ou filtros de audiência',
	},

	// Get Many options
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['campaign'],
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
				resource: ['campaign'],
				operation: ['getAll'],
				returnAll: [false],
			},
		},
		default: 50,
		description: 'Número máximo de resultados',
	},
];