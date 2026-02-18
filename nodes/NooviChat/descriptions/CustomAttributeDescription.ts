import { INodeProperties } from 'n8n-workflow';

export const CustomAttributeResource: INodeProperties[] = [
	{
		displayName: 'Resource',
		name: 'resource',
		type: 'options',
		noDataExpression: true,
		options: [
			{ name: 'Custom Attribute', value: 'customAttribute' },
		],
		default: 'customAttribute',
	},
];

export const CustomAttributeOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['customAttribute'],
			},
		},
		options: [
			{ name: 'Create', value: 'create', action: 'Create a custom attribute' },
			{ name: 'Get Many', value: 'getAll', action: 'Get many custom attributes' },
			{ name: 'Update', value: 'update', action: 'Update a custom attribute' },
			{ name: 'Delete', value: 'delete', action: 'Delete a custom attribute' },
		],
		default: 'getAll',
	},
];

export const CustomAttributeFields: INodeProperties[] = [
	{
		displayName: 'Attribute ID',
		name: 'attributeId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['customAttribute'],
				operation: ['update', 'delete'],
			},
		},
		default: '',
		description: 'ID do atributo personalizado',
	},

	// Create fields
	{
		displayName: 'Attribute Name',
		name: 'attributeName',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['customAttribute'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'Nome do atributo',
	},
	{
		displayName: 'Display Name',
		name: 'displayName',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['customAttribute'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'Display name of the attribute',
	},
	{
		displayName: 'Attribute Type',
		name: 'attributeType',
		type: 'options',
		required: true,
		displayOptions: {
			show: {
				resource: ['customAttribute'],
				operation: ['create'],
			},
		},
		options: [
			{ name: 'Text', value: 'text' },
			{ name: 'Number', value: 'number' },
			{ name: 'Currency', value: 'currency' },
			{ name: 'Percent', value: 'percent' },
			{ name: 'Link', value: 'link' },
			{ name: 'Date', value: 'date' },
			{ name: 'List', value: 'list' },
			{ name: 'Checkbox', value: 'checkbox' },
		],
		default: 'text',
		description: 'Tipo do atributo',
	},
	{
		displayName: 'Model',
		name: 'model',
		type: 'options',
		required: true,
		displayOptions: {
			show: {
				resource: ['customAttribute'],
				operation: ['create'],
			},
		},
		options: [
			{ name: 'Contact', value: 'contact_attribute' },
			{ name: 'Conversation', value: 'conversation_attribute' },
		],
		default: 'contact_attribute',
		description: 'Where this attribute will be used',
	},

	// Get Many options
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['customAttribute'],
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
				resource: ['customAttribute'],
				operation: ['getAll'],
				returnAll: [false],
			},
		},
		default: 50,
		description: 'Maximum number of results to return',
	},
];