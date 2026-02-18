import { INodeProperties } from 'n8n-workflow';

export const CardResource: INodeProperties[] = [
	{
		displayName: 'Resource',
		name: 'resource',
		type: 'options',
		noDataExpression: true,
		options: [
			{ name: 'Card', value: 'card' },
		],
		default: 'card',
	},
];

export const CardOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['card'],
			},
		},
		options: [
			{ name: 'Create', value: 'create', action: 'Create a card' },
			{ name: 'Get', value: 'get', action: 'Get a card' },
			{ name: 'Get Many', value: 'getAll', action: 'Get many cards' },
			{ name: 'Update', value: 'update', action: 'Update a card' },
			{ name: 'Delete', value: 'delete', action: 'Delete a card' },
			{ name: 'Move to Stage', value: 'moveToStage', action: 'Move card to stage' },
			{ name: 'Mark Won', value: 'markWon', action: 'Mark card as won' },
			{ name: 'Mark Lost', value: 'markLost', action: 'Mark card as lost' },
			{ name: 'Reopen', value: 'reopen', action: 'Reopen card' },
			{ name: 'Get Timeline', value: 'getTimeline', action: 'Get card timeline' },
			{ name: 'Bulk Update', value: 'bulkUpdate', action: 'Bulk update cards' },
			{ name: 'Bulk Move', value: 'bulkMove', action: 'Bulk move cards to stage' },
			{ name: 'Bulk Delete', value: 'bulkDelete', action: 'Bulk delete cards' },
			{ name: 'Get Lead Score', value: 'getLeadScore', action: 'Get card lead score' },
			{ name: 'Recalculate Lead Score', value: 'recalculateLeadScore', action: 'Recalculate lead score' },
		],
		default: 'getAll',
	},
];

export const CardFields: INodeProperties[] = [
	{
		displayName: 'Card ID',
		name: 'cardId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['card'],
				operation: ['get', 'update', 'delete', 'moveToStage', 'markWon', 'markLost', 'reopen', 'getTimeline', 'getLeadScore', 'recalculateLeadScore'],
			},
		},
		default: '',
		placeholder: 'e.g., abc-123',
		description: 'ID of the card',
	},

	// Create card fields
	{
		displayName: 'Title',
		name: 'title',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['card'],
				operation: ['create'],
			},
		},
		default: '',
		placeholder: 'e.g., Q1 Sales Campaign',
		description: 'Title of the card',
	},
	{
		displayName: 'Pipeline ID',
		name: 'pipelineId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['card'],
				operation: ['create'],
			},
		},
		default: '',
		placeholder: 'e.g., 1',
		description: 'ID of the pipeline',
	},
	{
		displayName: 'Stage ID',
		name: 'stageId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['card'],
				operation: ['create', 'moveToStage'],
			},
		},
		default: '',
		placeholder: 'e.g., 5',
		description: 'ID of the stage',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		displayOptions: {
			show: {
				resource: ['card'],
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
				description: 'ID of the contact associated with this card',
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
				description: 'Monetary value of the card',
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
				resource: ['card'],
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
				description: 'New title for the card',
			},
			{
				displayName: 'Value (Currency)',
				name: 'value',
				type: 'number',
				default: 0,
				typeOptions: { minValue: 0, numberPrecision: 2 },
				description: 'Monetary value of the card',
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
				resource: ['card'],
				operation: ['markLost'],
			},
		},
		default: '',
		description: 'Reason for losing the card',
	},

	// Bulk operations
	{
		displayName: 'Card IDs',
		name: 'cardIds',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
			minValue: 1,
		},
		required: true,
		displayOptions: {
			show: {
				resource: ['card'],
				operation: ['bulkUpdate', 'bulkMove', 'bulkDelete'],
			},
		},
		default: { values: [{ id: '' }] },
		description: 'Cards to process',
		options: [
			{
				name: 'values',
				displayName: 'Card',
				values: [
					{
						displayName: 'Card ID',
						name: 'id',
						type: 'string',
						required: true,
						default: '',
						placeholder: 'e.g., abc-123',
						description: 'ID of the card',
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
				resource: ['card'],
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
				resource: ['card'],
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
				resource: ['card'],
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
				resource: ['card'],
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
					{ name: 'Open', value: 'open', description: 'Active cards in progress' },
					{ name: 'Won', value: 'won', description: 'Cards successfully closed' },
					{ name: 'Lost', value: 'lost', description: 'Cards that were not won' },
				],
				default: 'open',
			},
		],
	},
];
