import { INodeProperties } from 'n8n-workflow';

export const TeamResource: INodeProperties[] = [
	{
		displayName: 'Resource',
		name: 'resource',
		type: 'options',
		noDataExpression: true,
		options: [
			{ name: 'Team', value: 'team' },
		],
		default: 'team',
	},
];

export const TeamOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['team'],
			},
		},
		options: [
			{ name: 'Create', value: 'create', action: 'Create a team' },
			{ name: 'Get Many', value: 'getAll', action: 'Get many teams' },
			{ name: 'Update', value: 'update', action: 'Update a team' },
			{ name: 'Delete', value: 'delete', action: 'Delete a team' },
			{ name: 'Get Members', value: 'getMembers', action: 'Get team members' },
			{ name: 'Add Members', value: 'addMembers', action: 'Add team members' },
		],
		default: 'getAll',
	},
];

export const TeamFields: INodeProperties[] = [
	{
		displayName: 'Team ID',
		name: 'teamId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['team'],
				operation: ['update', 'delete', 'getMembers', 'addMembers'],
			},
		},
		default: '',
		description: 'ID da equipe',
	},

	// Create team fields
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['team'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'Nome da equipe',
	},
	{
		displayName: 'Description',
		name: 'description',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['team'],
				operation: ['create', 'update'],
			},
		},
		default: '',
		description: 'Descrição da equipe',
	},

	// Add Members
	{
		displayName: 'Member IDs',
		name: 'memberIds',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['team'],
				operation: ['addMembers'],
			},
		},
		default: '',
		description: 'IDs dos membros separados por vírgula',
	},

	// Get Many options
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['team'],
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
				resource: ['team'],
				operation: ['getAll'],
				returnAll: [false],
			},
		},
		default: 50,
		description: 'Número máximo de resultados',
	},
];