import { INodeProperties } from 'n8n-workflow';

export const AgentResource: INodeProperties[] = [
	{
		displayName: 'Resource',
		name: 'resource',
		type: 'options',
		noDataExpression: true,
		options: [
			{ name: 'Agent', value: 'agent' },
		],
		default: 'agent',
	},
];

export const AgentOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['agent'],
			},
		},
		options: [
			{ name: 'Create', value: 'create', action: 'Create an agent' },
			{ name: 'Get Many', value: 'getAll', action: 'Get many agents' },
			{ name: 'Update', value: 'update', action: 'Update an agent' },
			{ name: 'Delete', value: 'delete', action: 'Delete an agent' },
		],
		default: 'getAll',
	},
];

export const AgentFields: INodeProperties[] = [
	{
		displayName: 'Agent ID',
		name: 'agentId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['agent'],
				operation: ['update', 'delete'],
			},
		},
		default: '',
		description: 'ID do agente',
	},

	// Create agent fields
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['agent'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'Nome do agente',
	},
	{
		displayName: 'Email',
		name: 'email',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['agent'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'Email do agente',
	},
	{
		displayName: 'Role',
		name: 'role',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['agent'],
				operation: ['create', 'update'],
			},
		},
		options: [
			{ name: 'Agent', value: 'agent' },
			{ name: 'Administrator', value: 'administrator' },
		],
		default: 'agent',
		description: 'Nível de permissão do agente',
	},
	{
		displayName: 'Availability',
		name: 'availability',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['agent'],
				operation: ['create', 'update'],
			},
		},
		options: [
			{ name: 'Online', value: 'online' },
			{ name: 'Busy', value: 'busy' },
			{ name: 'Offline', value: 'offline' },
		],
		default: 'online',
		description: 'Status de disponibilidade',
	},

	// Get Many options
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['agent'],
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
				resource: ['agent'],
				operation: ['getAll'],
				returnAll: [false],
			},
		},
		default: 50,
		description: 'Número máximo de resultados',
	},
];