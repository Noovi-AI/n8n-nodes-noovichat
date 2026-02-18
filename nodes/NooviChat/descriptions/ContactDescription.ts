import { INodeProperties } from 'n8n-workflow';

export const ContactResource: INodeProperties[] = [
	{
		displayName: 'Resource',
		name: 'resource',
		type: 'options',
		noDataExpression: true,
		options: [
			{ name: 'Contact', value: 'contact' },
		],
		default: 'contact',
	},
];

export const ContactOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['contact'],
			},
		},
		options: [
			{ name: 'Create', value: 'create', action: 'Create a contact' },
			{ name: 'Get', value: 'get', action: 'Get a contact' },
			{ name: 'Get Many', value: 'getAll', action: 'Get many contacts' },
			{ name: 'Update', value: 'update', action: 'Update a contact' },
			{ name: 'Delete', value: 'delete', action: 'Delete a contact' },
			{ name: 'Search', value: 'search', action: 'Search contacts' },
			{ name: 'Filter', value: 'filter', action: 'Filter contacts' },
			{ name: 'Merge', value: 'merge', action: 'Merge contacts' },
			{ name: 'Get Conversations', value: 'getConversations', action: 'Get contact conversations' },
		],
		default: 'getAll',
	},
];

export const ContactFields: INodeProperties[] = [
	{
		displayName: 'Contact ID',
		name: 'contactId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['contact'],
				operation: ['get', 'update', 'delete', 'getConversations'],
			},
		},
		default: '',
		description: 'ID do contato',
	},

	// Create contact fields
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['contact'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'Nome do contato',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		displayOptions: {
			show: {
				resource: ['contact'],
				operation: ['create'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Email',
				name: 'email',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Phone Number',
				name: 'phoneNumber',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Inbox ID',
				name: 'inboxId',
				type: 'number',
				default: 0,
			},
			{
				displayName: 'Identifier',
				name: 'identifier',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Custom Attributes',
				name: 'customAttributes',
				type: 'json',
				default: '{}',
			},
		],
	},

	// Update contact fields
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		displayOptions: {
			show: {
				resource: ['contact'],
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
			},
			{
				displayName: 'Email',
				name: 'email',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Phone Number',
				name: 'phoneNumber',
				type: 'string',
				default: '',
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
			{
				displayName: 'Custom Attributes',
				name: 'customAttributes',
				type: 'json',
				default: '{}',
			},
		],
	},

	// Search fields
	{
		displayName: 'Query',
		name: 'query',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['contact'],
				operation: ['search'],
			},
		},
		default: '',
		description: 'Termo de busca',
	},

	// Filter fields
	{
		displayName: 'Filter Payload',
		name: 'filterPayload',
		type: 'json',
		required: true,
		displayOptions: {
			show: {
				resource: ['contact'],
				operation: ['filter'],
			},
		},
		default: '{}',
		description: 'JSON com filtros para buscar contatos',
	},

	// Merge fields
	{
		displayName: 'Base Contact ID',
		name: 'baseContactId',
		type: 'number',
		required: true,
		displayOptions: {
			show: {
				resource: ['contact'],
				operation: ['merge'],
			},
		},
		default: 0,
		description: 'ID do contato base (que será mantido após o merge)',
	},
	{
		displayName: 'Mergee Contact ID',
		name: 'mergeeContactId',
		type: 'number',
		required: true,
		displayOptions: {
			show: {
				resource: ['contact'],
				operation: ['merge'],
			},
		},
		default: 0,
		description: 'ID do contato que será mesclado e removido',
	},

	// Get Many options
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['contact'],
				operation: ['getAll', 'search', 'filter'],
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
				resource: ['contact'],
				operation: ['getAll', 'search', 'filter'],
				returnAll: [false],
			},
		},
		default: 50,
		description: 'Número máximo de resultados',
	},
	{
		displayName: 'Sort',
		name: 'sort',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['contact'],
				operation: ['getAll'],
			},
		},
		options: [
			{ name: 'Name', value: 'name' },
			{ name: 'Created At', value: 'created_at' },
			{ name: 'Updated At', value: 'updated_at' },
			{ name: 'Last Activity', value: 'last_activity_at' },
		],
		default: 'name',
		description: 'Ordenação dos resultados',
	},
];