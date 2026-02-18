import { INodeProperties } from 'n8n-workflow';

export const ConversationResource: INodeProperties[] = [
	{
		displayName: 'Resource',
		name: 'resource',
		type: 'options',
		noDataExpression: true,
		options: [
			{ name: 'Conversation', value: 'conversation' },
		],
		default: 'conversation',
	},
];

export const ConversationOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['conversation'],
			},
		},
		options: [
			{ name: 'Create', value: 'create', action: 'Create a conversation' },
			{ name: 'Get', value: 'get', action: 'Get a conversation' },
			{ name: 'Get Many', value: 'getAll', action: 'Get many conversations' },
			{ name: 'Update', value: 'update', action: 'Update a conversation' },
			{ name: 'Delete', value: 'delete', action: 'Delete a conversation' },
			{ name: 'Assign', value: 'assign', action: 'Assign conversation to agent/team' },
			{ name: 'Toggle Status', value: 'toggleStatus', action: 'Toggle conversation status' },
			{ name: 'Add Label', value: 'addLabel', action: 'Add labels to conversation' },
			{ name: 'Filter', value: 'filter', action: 'Filter conversations' },
		],
		default: 'getAll',
	},
];

export const ConversationFields: INodeProperties[] = [
	// Conversation ID for single operations
	{
		displayName: 'Conversation ID',
		name: 'conversationId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['conversation'],
				operation: ['get', 'update', 'delete', 'assign', 'toggleStatus', 'addLabel'],
			},
		},
		default: '',
		placeholder: 'e.g., 12345',
		description: 'Unique identifier of the conversation',
	},

	// Create conversation fields
	{
		displayName: 'Source ID',
		name: 'sourceId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['conversation'],
				operation: ['create'],
			},
		},
		default: '',
		placeholder: 'e.g., 98765',
		description: 'ID of the contact to create the conversation for',
	},
	{
		displayName: 'Inbox ID',
		name: 'inboxId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['conversation'],
				operation: ['create'],
			},
		},
		default: '',
		placeholder: 'e.g., 1',
		description: 'ID of the inbox where the conversation will be created',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		displayOptions: {
			show: {
				resource: ['conversation'],
				operation: ['create'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				options: [
					{ name: 'Open', value: 'open', description: 'Active conversation awaiting response' },
					{ name: 'Resolved', value: 'resolved', description: 'Conversation marked as resolved' },
					{ name: 'Pending', value: 'pending', description: 'Conversation pending contact response' },
				],
				default: 'open',
			},
			{
				displayName: 'Assignee ID',
				name: 'assigneeId',
				type: 'number',
				default: 0,
				description: 'ID of the agent to assign the conversation to',
			},
			{
				displayName: 'Team ID',
				name: 'teamId',
				type: 'number',
				default: 0,
				description: 'ID of the team to assign the conversation to',
			},
		],
	},

	// Update conversation fields
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		displayOptions: {
			show: {
				resource: ['conversation'],
				operation: ['update'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				options: [
					{ name: 'Open', value: 'open', description: 'Active conversation awaiting response' },
					{ name: 'Resolved', value: 'resolved', description: 'Conversation marked as resolved' },
					{ name: 'Pending', value: 'pending', description: 'Conversation pending contact response' },
				],
				default: 'open',
			},
			{
				displayName: 'Assignee ID',
				name: 'assigneeId',
				type: 'number',
				default: 0,
				description: 'ID of the agent to assign the conversation to',
			},
			{
				displayName: 'Team ID',
				name: 'teamId',
				type: 'number',
				default: 0,
				description: 'ID of the team to assign the conversation to',
			},
			{
				displayName: 'Priority',
				name: 'priority',
				type: 'options',
				options: [
					{ name: 'Urgent', value: 'urgent', description: 'Highest priority level requiring immediate attention' },
					{ name: 'High', value: 'high', description: 'High priority conversation' },
					{ name: 'Medium', value: 'medium', description: 'Medium priority conversation' },
					{ name: 'Low', value: 'low', description: 'Low priority conversation' },
				],
				default: 'medium',
			},
		],
	},

	// Assign conversation
	{
		displayName: 'Assignee ID',
		name: 'assigneeId',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['conversation'],
				operation: ['assign'],
			},
		},
		default: 0,
		description: 'ID of the agent to assign the conversation to',
	},
	{
		displayName: 'Team ID',
		name: 'teamId',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['conversation'],
				operation: ['assign'],
			},
		},
		default: 0,
		description: 'ID of the team to assign the conversation to',
	},

	// Toggle Status
	{
		displayName: 'Status',
		name: 'status',
		type: 'options',
		required: true,
		displayOptions: {
			show: {
				resource: ['conversation'],
				operation: ['toggleStatus'],
			},
		},
		options: [
			{ name: 'Open', value: 'open', description: 'Active conversation awaiting response' },
			{ name: 'Resolved', value: 'resolved', description: 'Conversation marked as resolved' },
			{ name: 'Pending', value: 'pending', description: 'Conversation pending contact response' },
			{ name: 'Snoozed', value: 'snoozed', description: 'Conversation temporarily snoozed' },
		],
		default: 'open',
		description: 'New status to set for the conversation',
	},

	// Add Label
	{
		displayName: 'Labels',
		name: 'labels',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['conversation'],
				operation: ['addLabel'],
			},
		},
		default: '',
		placeholder: 'e.g., urgent,billing,support',
		description: 'Comma-separated list of label names to add to the conversation',
	},

	// Get Many / Filter options
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['conversation'],
				operation: ['getAll', 'filter'],
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
				resource: ['conversation'],
				operation: ['getAll', 'filter'],
				returnAll: [false],
			},
		},
		default: 50,
		description: 'Maximum number of results to return',
		typeOptions: {
			minValue: 1,
			maxValue: 100,
		},
	},
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		displayOptions: {
			show: {
				resource: ['conversation'],
				operation: ['getAll'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				options: [
					{ name: 'Open', value: 'open', description: 'Active conversation awaiting response' },
					{ name: 'Resolved', value: 'resolved', description: 'Conversation marked as resolved' },
					{ name: 'Pending', value: 'pending', description: 'Conversation pending contact response' },
				],
				default: 'open',
			},
			{
				displayName: 'Assignee ID',
				name: 'assigneeId',
				type: 'number',
				default: 0,
				description: 'Filter by agent ID. Leave empty to include all',
			},
			{
				displayName: 'Inbox ID',
				name: 'inboxId',
				type: 'number',
				default: 0,
				description: 'Filter by inbox ID. Leave empty to include all',
			},
			{
				displayName: 'Team ID',
				name: 'teamId',
				type: 'number',
				default: 0,
				description: 'Filter by team ID. Leave empty to include all',
			},
			{
				displayName: 'Labels',
				name: 'labels',
				type: 'string',
				default: '',
				placeholder: 'e.g., urgent,billing',
				description: 'Filter by comma-separated label names',
			},
		],
	},

	// Filter payload
	{
		displayName: 'Filter Payload',
		name: 'filterPayload',
		type: 'json',
		required: true,
		displayOptions: {
			show: {
				resource: ['conversation'],
				operation: ['filter'],
			},
		},
		default: '{}',
		description: 'JSON payload with filter criteria to search conversations',
		hint: 'Example: {"status": "open", "assignee_id": 1}',
	},
];
