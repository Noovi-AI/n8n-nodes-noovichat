import { INodeProperties } from 'n8n-workflow';

export const CannedResponseResource: INodeProperties[] = [
	{
		displayName: 'Resource',
		name: 'resource',
		type: 'options',
		noDataExpression: true,
		options: [
			{ name: 'Canned Response', value: 'cannedResponse' },
		],
		default: 'cannedResponse',
	},
];

export const CannedResponseOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['cannedResponse'],
			},
		},
		options: [
			{ name: 'Create', value: 'create', action: 'Create a canned response' },
			{ name: 'Get Many', value: 'getAll', action: 'Get many canned responses' },
			{ name: 'Update', value: 'update', action: 'Update a canned response' },
			{ name: 'Delete', value: 'delete', action: 'Delete a canned response' },
		],
		default: 'getAll',
	},
];

export const CannedResponseFields: INodeProperties[] = [
	{
		displayName: 'Canned Response ID',
		name: 'cannedResponseId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['cannedResponse'],
				operation: ['update', 'delete'],
			},
		},
		default: '',
		description: 'Canned response ID',
	},

	// Create fields
	{
		displayName: 'Short Code',
		name: 'shortCode',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['cannedResponse'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'Short code to trigger this response (e.g., /greeting)',
	},
	{
		displayName: 'Content',
		name: 'content',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['cannedResponse'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'Content of the canned response',
		typeOptions: {
			rows: 4,
		},
	},

	// Update fields
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		displayOptions: {
			show: {
				resource: ['cannedResponse'],
				operation: ['update'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Short Code',
				name: 'shortCode',
				type: 'string',
				default: '',
				description: 'New short code to trigger this response',
			},
			{
				displayName: 'Content',
				name: 'content',
				type: 'string',
				default: '',
				description: 'New content for the canned response',
				typeOptions: { rows: 4 },
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
				resource: ['cannedResponse'],
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
				resource: ['cannedResponse'],
				operation: ['getAll'],
				returnAll: [false],
			},
		},
		default: 50,
		description: 'Maximum number of results to return',
	},
];