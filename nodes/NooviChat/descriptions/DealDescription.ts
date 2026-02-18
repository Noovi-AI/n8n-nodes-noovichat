import { INodeProperties } from 'n8n-workflow';

export const DealResource: INodeProperties[] = [
	{
		displayName: 'Resource',
		name: 'resource',
		type: 'options',
		noDataExpression: true,
		options: [
			{ name: 'Deal', value: 'deal' },
		],
		default: 'deal',
	},
];

export const DealOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['deal'],
			},
		},
		options: [
			{ name: 'Create', value: 'create', action: 'Create a deal' },
			{ name: 'Get', value: 'get', action: 'Get a deal' },
			{ name: 'Get Many', value: 'getAll', action: 'Get many deals' },
			{ name: 'Update', value: 'update', action: 'Update a deal' },
			{ name: 'Delete', value: 'delete', action: 'Delete a deal' },
			{ name: 'Move to Stage', value: 'moveToStage', action: 'Move deal to stage' },
			{ name: 'Mark Won', value: 'markWon', action: 'Mark deal as won' },
			{ name: 'Mark Lost', value: 'markLost', action: 'Mark deal as lost' },
			{ name: 'Reopen', value: 'reopen', action: 'Reopen deal' },
			{ name: 'Get Timeline', value: 'getTimeline', action: 'Get deal timeline' },
			{ name: 'Bulk Update', value: 'bulkUpdate', action: 'Bulk update deals' },
			{ name: 'Bulk Move', value: 'bulkMove', action: 'Bulk move deals to stage' },
			{ name: 'Bulk Delete', value: 'bulkDelete', action: 'Bulk delete deals' },
			{ name: 'Get Lead Score', value: 'getLeadScore', action: 'Get deal lead score' },
			{ name: 'Recalculate Lead Score', value: 'recalculateLeadScore', action: 'Recalculate lead score' },
		],
		default: 'getAll',
	},
];

export const DealFields: INodeProperties[] = [
	{
		displayName: 'Deal ID',
		name: 'dealId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['deal'],
				operation: ['get', 'update', 'delete', 'moveToStage', 'markWon', 'markLost', 'reopen', 'getTimeline', 'getLeadScore', 'recalculateLeadScore'],
			},
		},
		default: '',
		placeholder: 'e.g., abc-123',
		description: 'Deal ID',
	},

	// Create deal fields
	{
		displayName: 'Title',
		name: 'title',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['deal'],
				operation: ['create'],
			},
		},
		default: '',
		placeholder: 'e.g., Q1 Sales Campaign',
		description: 'Title of the deal',
	},
	{
		displayName: 'Pipeline ID',
		name: 'pipelineId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['deal'],
				operation: ['create'],
			},
		},
		default: '',
		placeholder: 'e.g., 1',
		description: 'Pipeline ID',
	},
	{
		displayName: 'Stage ID',
		name: 'stageId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['deal'],
				operation: ['create', 'moveToStage'],
			},
		},
		default: '',
		placeholder: 'e.g., 5',
		description: 'Stage ID',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		displayOptions: {
			show: {
				resource: ['deal'],
				operation: ['create'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Assignee ID',
				name: 'assigneeId',
				type: 'number',
				default: 0,
				description: 'ID of the agent responsible',
			},
			{
				displayName: 'Contact ID',
				name: 'contactId',
				type: 'string',
				default: '',
				placeholder: 'e.g., abc-123',
				description: 'ID of the contact associated with this deal',
			},
			{
				displayName: 'Expected Close Date',
				name: 'expectedCloseDate',
				type: 'dateTime',
				default: '',
				description: 'Expected close date',
			},
			{
				displayName: 'Value (Currency)',
				name: 'value',
				type: 'number',
				default: 0,
				typeOptions: { minValue: 0, numberPrecision: 2 },
				description: 'Monetary value of the deal',
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
				resource: ['deal'],
				operation: ['update'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Assignee ID',
				name: 'assigneeId',
				type: 'number',
				default: 0,
				description: 'ID of the agent responsible',
			},
			{
				displayName: 'Expected Close Date',
				name: 'expectedCloseDate',
				type: 'dateTime',
				default: '',
				description: 'Expected close date',
			},
			{
				displayName: 'Title',
				name: 'title',
				type: 'string',
				default: '',
				placeholder: 'e.g., Q1 Sales Campaign',
				description: 'New title for the deal',
			},
			{
				displayName: 'Value (Currency)',
				name: 'value',
				type: 'number',
				default: 0,
				typeOptions: { minValue: 0, numberPrecision: 2 },
				description: 'Monetary value of the deal',
			},
		],
	},

	// Mark Lost fields
	{
		displayName: 'Lost Reason',
		name: 'lostReason',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['deal'],
				operation: ['markLost'],
			},
		},
		default: '',
		description: 'Reason for losing the deal',
	},

	// Bulk operations
	{
		displayName: 'Deal IDs',
		name: 'dealIds',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
			minValue: 1,
		},
		required: true,
		displayOptions: {
			show: {
				resource: ['deal'],
				operation: ['bulkUpdate', 'bulkMove', 'bulkDelete'],
			},
		},
		default: { values: [{ id: '' }] },
		description: 'Deals to process',
		options: [
			{
				name: 'values',
				displayName: 'Deal',
				values: [
					{
						displayName: 'Deal ID',
						name: 'id',
						type: 'string',
						required: true,
						default: '',
						placeholder: 'e.g., abc-123',
						description: 'Deal ID',
					},
				],
			},
		],
	},
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'json',
		required: true,
		displayOptions: {
			show: {
				resource: ['deal'],
				operation: ['bulkUpdate'],
			},
		},
		default: '{}',
		description: 'Fields to update as a JSON object',
		hint: 'Example: {"status": "open", "assignee_id": 5}',
	},

	// Get Many options
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['deal'],
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
		typeOptions: { minValue: 1, maxValue: 100 },
		displayOptions: {
			show: {
				resource: ['deal'],
				operation: ['getAll'],
				returnAll: [false],
			},
		},
		default: 50,
		description: 'Maximum number of results to return',
	},
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		displayOptions: {
			show: {
				resource: ['deal'],
				operation: ['getAll'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Pipeline ID',
				name: 'pipelineId',
				type: 'string',
				default: '',
				placeholder: 'e.g., 1',
			},
			{
				displayName: 'Stage ID',
				name: 'stageId',
				type: 'string',
				default: '',
				placeholder: 'e.g., 5',
			},
			{
				displayName: 'Assignee ID',
				name: 'assigneeId',
				type: 'number',
				default: 0,
			},
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				options: [
					{ name: 'Open', value: 'open', description: 'Active deals in progress' },
					{ name: 'Won', value: 'won', description: 'Deals successfully closed' },
					{ name: 'Lost', value: 'lost', description: 'Deals that were not won' },
				],
				default: 'open',
			},
		],
	},
];
