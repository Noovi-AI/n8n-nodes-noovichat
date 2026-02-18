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
		description: 'ID da conversa',
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
		description: 'ID do contato para criar a conversa',
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
		description: 'ID da inbox onde a conversa será criada',
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
					{ name: 'Open', value: 'open' },
					{ name: 'Resolved', value: 'resolved' },
					{ name: 'Pending', value: 'pending' },
				],
				default: 'open',
			},
			{
				displayName: 'Assignee ID',
				name: 'assigneeId',
				type: 'number',
				default: 0,
			},
			{
				displayName: 'Team ID',
				name: 'teamId',
				type: 'number',
				default: 0,
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
					{ name: 'Open', value: 'open' },
					{ name: 'Resolved', value: 'resolved' },
					{ name: 'Pending', value: 'pending' },
				],
				default: 'open',
			},
			{
				displayName: 'Assignee ID',
				name: 'assigneeId',
				type: 'number',
				default: 0,
			},
			{
				displayName: 'Team ID',
				name: 'teamId',
				type: 'number',
				default: 0,
			},
			{
				displayName: 'Priority',
				name: 'priority',
				type: 'options',
				options: [
					{ name: 'Urgent', value: 'urgent' },
					{ name: 'High', value: 'high' },
					{ name: 'Medium', value: 'medium' },
					{ name: 'Low', value: 'low' },
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
		description: 'ID do agente para atribuir',
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
		description: 'ID da equipe para atribuir',
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
			{ name: 'Open', value: 'open' },
			{ name: 'Resolved', value: 'resolved' },
			{ name: 'Pending', value: 'pending' },
		],
		default: 'open',
		description: 'Novo status da conversa',
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
		description: 'Etiquetas separadas por vírgula',
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
		description: 'Retornar todos os resultados ou limite',
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
		description: 'Número máximo de resultados',
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
					{ name: 'Open', value: 'open' },
					{ name: 'Resolved', value: 'resolved' },
					{ name: 'Pending', value: 'pending' },
				],
				default: 'open',
			},
			{
				displayName: 'Assignee ID',
				name: 'assigneeId',
				type: 'number',
				default: 0,
			},
			{
				displayName: 'Inbox ID',
				name: 'inboxId',
				type: 'number',
				default: 0,
			},
			{
				displayName: 'Team ID',
				name: 'teamId',
				type: 'number',
				default: 0,
			},
			{
				displayName: 'Labels',
				name: 'labels',
				type: 'string',
				default: '',
				description: 'Etiquetas separadas por vírgula',
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
		description: 'JSON com filtros para buscar conversas',
	},
];