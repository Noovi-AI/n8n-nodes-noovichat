import { INodeProperties } from 'n8n-workflow';

export const LabelResource: INodeProperties[] = [
	{
		displayName: 'Resource',
		name: 'resource',
		type: 'options',
		noDataExpression: true,
		options: [
			{ name: 'Label', value: 'label' },
		],
		default: 'label',
	},
];

export const LabelOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['label'],
			},
		},
		options: [
			{ name: 'Create', value: 'create', action: 'Create a label' },
			{ name: 'Get Many', value: 'getAll', action: 'Get many labels' },
			{ name: 'Update', value: 'update', action: 'Update a label' },
			{ name: 'Delete', value: 'delete', action: 'Delete a label' },
		],
		default: 'getAll',
	},
];

export const LabelFields: INodeProperties[] = [
	{
		displayName: 'Label ID',
		name: 'labelId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['label'],
				operation: ['update', 'delete'],
			},
		},
		default: '',
		description: 'ID da etiqueta',
	},

	// Create label fields
	{
		displayName: 'Title',
		name: 'title',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['label'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'Title of the label',
	},
	{
		displayName: 'Color',
		name: 'color',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['label'],
				operation: ['create', 'update'],
			},
		},
		default: '#0066FF',
		description: 'Cor da etiqueta em formato hexadecimal',
	},
	{
		displayName: 'Description',
		name: 'description',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['label'],
				operation: ['create', 'update'],
			},
		},
		default: '',
		description: 'Description of the label',
	},

	// Get Many options
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['label'],
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
				resource: ['label'],
				operation: ['getAll'],
				returnAll: [false],
			},
		},
		default: 50,
		description: 'Maximum number of results to return',
	},
];