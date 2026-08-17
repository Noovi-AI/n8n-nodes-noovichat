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
	// --- Get Many: include deactivated partners ---
	{
		displayName: 'Include Inactive',
		name: 'includeInactive',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['partner'],
				operation: ['list'],
			},
		},
		default: false,
		description:
			'Whether to include partners whose active flag is false. Off by default, matching the API; without it a deactivated partner cannot be listed at all, not even to reactivate it.',
	},
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
		type: 'string',
		displayOptions: {
			show: {
				resource: ['partner'],
				operation: ['create'],
			},
		},
		default: 'convenio',
		description:
			'Type of partner, up to 40 characters. Not a closed set: an account names its own types. The canonical values the NooviChat dashboard translates are convenio (Brazilian HMO), seguro (insurance), plano (health plan) and outros (legacy catch-all); anything else is stored and displayed as written.',
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
				type: 'string',
				default: 'convenio',
				description:
					'Type of partner, up to 40 characters. Not a closed set: an account names its own types. convenio, seguro, plano and outros are the canonical values the dashboard translates.',
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
