import { INodeProperties } from 'n8n-workflow';

export const PartnerOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['partner'],
			},
		},
		options: [
			{ name: 'Create', value: 'create', action: 'Create a partner' },
			{ name: 'Get', value: 'get', action: 'Get a partner' },
			{ name: 'Get Many', value: 'list', action: 'Get many partners' },
			{ name: 'Update', value: 'update', action: 'Update a partner' },
			{ name: 'Delete', value: 'delete', action: 'Delete (soft) a partner' },
		],
		default: 'list',
	},
];

export const PartnerFields: INodeProperties[] = [
	// --- Shared: Partner ID ---
	{
		displayName: 'Partner ID',
		name: 'partnerId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['partner'],
				operation: ['get', 'update', 'delete'],
			},
		},
		default: '',
		placeholder: 'e.g., 8',
		description: 'ID of the partner (convenio / insurance plan)',
	},

	// --- Create ---
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['partner'],
				operation: ['create'],
			},
		},
		default: '',
		placeholder: 'e.g., Unimed',
		description: 'Name of the partner (insurance provider, convenio, etc.)',
	},
	{
		displayName: 'Kind',
		name: 'kind',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['partner'],
				operation: ['create'],
			},
		},
		options: [
			{ name: 'Convênio', value: 'convenio', description: 'Health convenio (Brazilian HMO)' },
			{ name: 'Seguro', value: 'seguro', description: 'Health insurance' },
			{ name: 'Plano', value: 'plano', description: 'Health plan' },
			{ name: 'Outros', value: 'outros', description: 'Other type of partner' },
		],
		default: 'convenio',
		description: 'Type of partner',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		displayOptions: {
			show: {
				resource: ['partner'],
				operation: ['create'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Settings (JSON)',
				name: 'settings',
				type: 'json',
				default: '{}',
				description: 'Additional settings for this partner as a JSON object. Example: {"code":"123","coverage":"dental"}',
			},
		],
	},

	// --- Update ---
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		displayOptions: {
			show: {
				resource: ['partner'],
				operation: ['update'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				description: 'Name of the partner',
			},
			{
				displayName: 'Kind',
				name: 'kind',
				type: 'options',
				options: [
					{ name: 'Convênio', value: 'convenio' },
					{ name: 'Seguro', value: 'seguro' },
					{ name: 'Plano', value: 'plano' },
					{ name: 'Outros', value: 'outros' },
				],
				default: 'convenio',
				description: 'Type of partner',
			},
			{
				displayName: 'Settings (JSON)',
				name: 'settings',
				type: 'json',
				default: '{}',
				description: 'Additional settings for this partner as a JSON object',
			},
			{
				displayName: 'Active',
				name: 'active',
				type: 'boolean',
				default: true,
				description: 'Whether this partner is active',
			},
		],
	},
];
