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
		placeholder: 'e.g., 12345',
		description: 'Unique identifier of the agent',
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
		placeholder: 'e.g., Jane Smith',
		description: 'Full name of the agent',
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
		placeholder: 'e.g., jane.smith@example.com',
		description: 'Email address of the agent used for login',
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
			{ name: 'Agent', value: 'agent', description: 'Standard agent with limited permissions' },
			{ name: 'Administrator', value: 'administrator', description: 'Administrator with full account access' },
		],
		default: 'agent',
		description: 'Permission level of the agent',
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
			{ name: 'Online', value: 'online', description: 'Agent is available to receive conversations' },
			{ name: 'Busy', value: 'busy', description: 'Agent is busy and may not respond immediately' },
			{ name: 'Offline', value: 'offline', description: 'Agent is offline and unavailable' },
		],
		default: 'online',
		description: 'Availability status of the agent',
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
		description: 'Whether to return all results instead of applying a limit',
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
		description: 'Maximum number of results to return',
		typeOptions: {
			minValue: 1,
			maxValue: 100,
		},
	},
];
