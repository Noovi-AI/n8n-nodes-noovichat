import { INodeProperties } from 'n8n-workflow';

export const FollowUpResource: INodeProperties[] = [
	{
		displayName: 'Resource',
		name: 'resource',
		type: 'options',
		noDataExpression: true,
		options: [
			{ name: 'Follow-up', value: 'followUp' },
		],
		default: 'followUp',
	},
];

export const FollowUpOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['followUp'],
			},
		},
		options: [
			{ name: 'Create', value: 'create', action: 'Create a follow-up' },
			{ name: 'Get', value: 'get', action: 'Get a follow-up' },
			{ name: 'Get Many', value: 'getAll', action: 'Get many follow-ups' },
			{ name: 'Update', value: 'update', action: 'Update a follow-up' },
			{ name: 'Delete', value: 'delete', action: 'Delete a follow-up' },
			{ name: 'Cancel', value: 'cancel', action: 'Cancel a follow-up' },
			{ name: 'Create Template', value: 'createTemplate', action: 'Create a follow-up template' },
			{ name: 'Get Templates', value: 'getTemplates', action: 'Get follow-up templates' },
			{ name: 'Update Template', value: 'updateTemplate', action: 'Update a follow-up template' },
			{ name: 'Delete Template', value: 'deleteTemplate', action: 'Delete a follow-up template' },
			{ name: 'Preview Template', value: 'previewTemplate', action: 'Preview a follow-up template' },
		],
		default: 'getAll',
	},
];

export const FollowUpFields: INodeProperties[] = [
	{
		displayName: 'Follow-up ID',
		name: 'followUpId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['followUp'],
				operation: ['get', 'update', 'delete', 'cancel'],
			},
		},
		default: '',
		description: 'ID do follow-up',
	},

	// Create follow-up
	{
		displayName: 'Conversation ID',
		name: 'conversationId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['followUp'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'ID da conversa',
	},
	{
		displayName: 'Title',
		name: 'title',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['followUp'],
				operation: ['create', 'update'],
			},
		},
		default: '',
		description: 'Title of the follow-up',
	},
	{
		displayName: 'Description',
		name: 'description',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['followUp'],
				operation: ['create', 'update'],
			},
		},
		default: '',
		description: 'Description of the follow-up',
		typeOptions: {
			rows: 3,
		},
	},
	{
		displayName: 'Due At',
		name: 'dueAt',
		type: 'dateTime',
		required: true,
		displayOptions: {
			show: {
				resource: ['followUp'],
				operation: ['create', 'update'],
			},
		},
		default: '',
		description: 'Data e hora de vencimento',
	},

	// Template fields
	{
		displayName: 'Template ID',
		name: 'templateId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['followUp'],
				operation: ['updateTemplate', 'deleteTemplate', 'previewTemplate'],
			},
		},
		default: '',
		description: 'ID do template',
	},
	{
		displayName: 'Template Name',
		name: 'templateName',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['followUp'],
				operation: ['createTemplate'],
			},
		},
		default: '',
		description: 'Nome do template',
	},
	{
		displayName: 'Template Content',
		name: 'templateContent',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['followUp'],
				operation: ['createTemplate', 'updateTemplate'],
			},
		},
		default: '',
		description: 'Template message content',
		typeOptions: {
			rows: 4,
		},
	},

	// Get Many options
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['followUp'],
				operation: ['getAll', 'getTemplates'],
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
				resource: ['followUp'],
				operation: ['getAll', 'getTemplates'],
				returnAll: [false],
			},
		},
		default: 50,
		description: 'Maximum number of results to return',
	},
];