import { INodeProperties } from 'n8n-workflow';

export const ActivityResource: INodeProperties[] = [
	{
		displayName: 'Resource',
		name: 'resource',
		type: 'options',
		noDataExpression: true,
		options: [
			{ name: 'Activity', value: 'activity' },
		],
		default: 'activity',
	},
];

export const ActivityOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['activity'],
			},
		},
		options: [
			{ name: 'Create', value: 'create', action: 'Create an activity' },
			{ name: 'Get', value: 'get', action: 'Get an activity' },
			{ name: 'Get Many', value: 'getAll', action: 'Get many activities' },
			{ name: 'Update', value: 'update', action: 'Update an activity' },
			{ name: 'Delete', value: 'delete', action: 'Delete an activity' },
			{ name: 'Start', value: 'start', action: 'Start an activity' },
			{ name: 'Complete', value: 'complete', action: 'Complete an activity' },
			{ name: 'Cancel', value: 'cancel', action: 'Cancel an activity' },
			{ name: 'Get Analytics', value: 'getAnalytics', action: 'Get activity analytics' },
		],
		default: 'getAll',
	},
];

export const ActivityFields: INodeProperties[] = [
	{
		displayName: 'Activity ID',
		name: 'activityId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['activity'],
				operation: ['get', 'update', 'delete', 'start', 'complete', 'cancel'],
			},
		},
		default: '',
		description: 'ID da atividade',
	},

	// Create activity fields
	{
		displayName: 'Title',
		name: 'title',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['activity'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'Título da atividade',
	},
	{
		displayName: 'Activity Type',
		name: 'activityType',
		type: 'options',
		required: true,
		displayOptions: {
			show: {
				resource: ['activity'],
				operation: ['create'],
			},
		},
		options: [
			{ name: 'Call', value: 'call' },
			{ name: 'Meeting', value: 'meeting' },
			{ name: 'Email', value: 'email' },
			{ name: 'Task', value: 'task' },
			{ name: 'Note', value: 'note' },
		],
		default: 'task',
		description: 'Tipo da atividade',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		displayOptions: {
			show: {
				resource: ['activity'],
				operation: ['create'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Assignee ID',
				name: 'assigneeId',
				type: 'number',
				default: 0,
				description: 'ID do agente responsável',
			},
			{
				displayName: 'Deal ID',
				name: 'dealId',
				type: 'string',
				default: '',
				description: 'ID do deal ao qual a atividade pertence',
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				description: 'Descrição detalhada da atividade',
				typeOptions: { rows: 3 },
			},
			{
				displayName: 'Due At',
				name: 'dueAt',
				type: 'dateTime',
				default: '',
				description: 'Data e hora de vencimento',
			},
		],
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		displayOptions: {
			show: {
				resource: ['activity'],
				operation: ['update'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Assignee ID',
				name: 'assigneeId',
				type: 'number',
				default: 0,
				description: 'ID do agente responsável',
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				description: 'Descrição detalhada da atividade',
				typeOptions: { rows: 3 },
			},
			{
				displayName: 'Due At',
				name: 'dueAt',
				type: 'dateTime',
				default: '',
				description: 'Data e hora de vencimento',
			},
			{
				displayName: 'Title',
				name: 'title',
				type: 'string',
				default: '',
				description: 'Novo título da atividade',
			},
		],
	},

	// Analytics
	{
		displayName: 'Start Date',
		name: 'startDate',
		type: 'dateTime',
		displayOptions: {
			show: {
				resource: ['activity'],
				operation: ['getAnalytics'],
			},
		},
		default: '',
		description: 'Data inicial do período de análise',
	},
	{
		displayName: 'End Date',
		name: 'endDate',
		type: 'dateTime',
		displayOptions: {
			show: {
				resource: ['activity'],
				operation: ['getAnalytics'],
			},
		},
		default: '',
		description: 'Data final do período de análise',
	},

	// Get Many options
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['activity'],
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
				resource: ['activity'],
				operation: ['getAll'],
				returnAll: [false],
			},
		},
		default: 50,
		description: 'Número máximo de resultados',
	},
];