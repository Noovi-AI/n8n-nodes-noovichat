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
		description: 'ID of the campaign',
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
		description: 'Title of the campaign',
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
		description: 'ID of the inbox to send the campaign from',
	},
	{
		displayName: 'Message',
		name: 'message',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['campaign'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'Campaign message content',
		typeOptions: {
			rows: 4,
		},
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		displayOptions: {
			show: {
				resource: ['campaign'],
				operation: ['create'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Audience',
				name: 'audience',
				type: 'json',
				default: '[]',
				description: 'Audience contact list as JSON (e.g. [{"type":"contact","id":1}])',
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				description: 'Internal description of the campaign',
			},
			{
				displayName: 'Scheduled At',
				name: 'scheduledAt',
				type: 'dateTime',
				default: '',
				description: 'Scheduled send date and time. Leave empty to send immediately.',
			},
		],
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		displayOptions: {
			show: {
				resource: ['campaign'],
				operation: ['update'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Audience',
				name: 'audience',
				type: 'json',
				default: '[]',
				description: 'Audience contact list as JSON (e.g. [{"type":"contact","id":1}])',
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				description: 'Internal description of the campaign',
			},
			{
				displayName: 'Message',
				name: 'message',
				type: 'string',
				default: '',
				description: 'New message content',
				typeOptions: { rows: 4 },
			},
			{
				displayName: 'Scheduled At',
				name: 'scheduledAt',
				type: 'dateTime',
				default: '',
				description: 'New scheduled send date and time',
			},
			{
				displayName: 'Title',
				name: 'title',
				type: 'string',
				default: '',
				description: 'New title for the campaign',
			},
		],
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
		description: 'Whether to return all results instead of applying a limit',
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
		description: 'Maximum number of results to return',
	},
];