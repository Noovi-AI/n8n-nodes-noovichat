import { INodeProperties } from 'n8n-workflow';

export const PipelineResource: INodeProperties[] = [
	{
		displayName: 'Resource',
		name: 'resource',
		type: 'options',
		noDataExpression: true,
		options: [
			{ name: 'Pipeline', value: 'pipeline' },
		],
		default: 'pipeline',
	},
];

export const PipelineOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['pipeline'],
			},
		},
		options: [
			{ name: 'Create', value: 'create', action: 'Create a pipeline' },
			{ name: 'Get', value: 'get', action: 'Get a pipeline' },
			{ name: 'Get Many', value: 'getAll', action: 'Get many pipelines' },
			{ name: 'Update', value: 'update', action: 'Update a pipeline' },
			{ name: 'Delete', value: 'delete', action: 'Delete a pipeline' },
			{ name: 'Get Stages', value: 'getStages', action: 'Get pipeline stages' },
			{ name: 'Create Stage', value: 'createStage', action: 'Create a stage' },
			{ name: 'Update Stage', value: 'updateStage', action: 'Update a stage' },
			{ name: 'Delete Stage', value: 'deleteStage', action: 'Delete a stage' },
			{ name: 'Reorder Stages', value: 'reorderStages', action: 'Reorder stages' },
			{ name: 'Get Analytics Dashboard', value: 'getAnalyticsDashboard', action: 'Get analytics dashboard' },
			{ name: 'Get Win Rate', value: 'getWinRate', action: 'Get win rate' },
			{ name: 'Get Conversion Metrics', value: 'getConversionMetrics', action: 'Get conversion metrics' },
			{ name: 'Get Sales Velocity', value: 'getSalesVelocity', action: 'Get sales velocity' },
			{ name: 'Get Team Performance', value: 'getTeamPerformance', action: 'Get team performance' },
			{ name: 'Get Lost Reasons', value: 'getLostReasons', action: 'Get lost reasons' },
		],
		default: 'getAll',
	},
];

export const PipelineFields: INodeProperties[] = [
	{
		displayName: 'Pipeline ID',
		name: 'pipelineId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['pipeline'],
				operation: ['get', 'update', 'delete', 'getStages', 'createStage', 'reorderStages'],
			},
		},
		default: '',
		description: 'ID do pipeline',
	},

	// Create pipeline fields
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['pipeline'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'Nome do pipeline',
	},
	{
		displayName: 'Description',
		name: 'description',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['pipeline'],
				operation: ['create', 'update'],
			},
		},
		default: '',
		description: 'Descrição do pipeline',
	},

	// Stage fields
	{
		displayName: 'Stage ID',
		name: 'stageId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['pipeline'],
				operation: ['updateStage', 'deleteStage'],
			},
		},
		default: '',
		description: 'ID do estágio',
	},
	{
		displayName: 'Stage Name',
		name: 'stageName',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['pipeline'],
				operation: ['createStage'],
			},
		},
		default: '',
		description: 'Nome do estágio',
	},
	{
		displayName: 'Stage Color',
		name: 'stageColor',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['pipeline'],
				operation: ['createStage', 'updateStage'],
			},
		},
		default: '#0066FF',
		description: 'Cor do estágio em hexadecimal',
	},

	// Reorder stages
	{
		displayName: 'Stage IDs (Order)',
		name: 'stageOrder',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['pipeline'],
				operation: ['reorderStages'],
			},
		},
		default: '',
		description: 'IDs dos estágios em ordem, separados por vírgula',
	},

	// Analytics fields
	{
		displayName: 'Start Date',
		name: 'startDate',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['pipeline'],
				operation: ['getAnalyticsDashboard', 'getWinRate', 'getConversionMetrics', 'getSalesVelocity', 'getTeamPerformance'],
			},
		},
		default: '',
		description: 'Data inicial (YYYY-MM-DD)',
	},
	{
		displayName: 'End Date',
		name: 'endDate',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['pipeline'],
				operation: ['getAnalyticsDashboard', 'getWinRate', 'getConversionMetrics', 'getSalesVelocity', 'getTeamPerformance'],
			},
		},
		default: '',
		description: 'Data final (YYYY-MM-DD)',
	},
	{
		displayName: 'Agent IDs',
		name: 'agentIds',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['pipeline'],
				operation: ['getTeamPerformance'],
			},
		},
		default: '',
		description: 'IDs dos agentes para filtrar, separados por vírgula',
	},

	// Get Many options
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['pipeline'],
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
				resource: ['pipeline'],
				operation: ['getAll'],
				returnAll: [false],
			},
		},
		default: 50,
		description: 'Número máximo de resultados',
	},
];