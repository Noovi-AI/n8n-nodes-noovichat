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
	// Create Stage — multiple stages at once
	{
		displayName: 'Stages',
		name: 'stages',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
			minValue: 1,
		},
		required: true,
		displayOptions: {
			show: {
				resource: ['pipeline'],
				operation: ['createStage'],
			},
		},
		default: { values: [{ stageName: '', stageColor: '#0066FF' }] },
		description: 'Estágios a criar. Adicione quantos quiser.',
		options: [
			{
				name: 'values',
				displayName: 'Stage',
				values: [
					{
						displayName: 'Name',
						name: 'stageName',
						type: 'string',
						required: true,
						default: '',
						description: 'Nome do estágio',
					},
					{
						displayName: 'Color',
						name: 'stageColor',
						type: 'color',
						default: '#0066FF',
						description: 'Cor do estágio',
					},
				],
			},
		],
	},

	// Update Stage fields
	{
		displayName: 'Stage Name',
		name: 'stageName',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['pipeline'],
				operation: ['updateStage'],
			},
		},
		default: '',
		description: 'Novo nome do estágio',
	},
	{
		displayName: 'Stage Color',
		name: 'stageColor',
		type: 'color',
		displayOptions: {
			show: {
				resource: ['pipeline'],
				operation: ['updateStage'],
			},
		},
		default: '#0066FF',
		description: 'Nova cor do estágio',
	},

	// Reorder stages
	{
		displayName: 'Stage Order',
		name: 'stageOrder',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
			minValue: 2,
		},
		required: true,
		displayOptions: {
			show: {
				resource: ['pipeline'],
				operation: ['reorderStages'],
			},
		},
		default: { values: [{ id: '' }, { id: '' }] },
		description: 'Estágios na nova ordem, de cima para baixo',
		options: [
			{
				name: 'values',
				displayName: 'Stage',
				values: [
					{
						displayName: 'Stage ID',
						name: 'id',
						type: 'string',
						required: true,
						default: '',
						description: 'ID do estágio',
					},
				],
			},
		],
	},

	// Analytics fields
	{
		displayName: 'Start Date',
		name: 'startDate',
		type: 'dateTime',
		displayOptions: {
			show: {
				resource: ['pipeline'],
				operation: ['getAnalyticsDashboard', 'getWinRate', 'getConversionMetrics', 'getSalesVelocity', 'getTeamPerformance'],
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
				resource: ['pipeline'],
				operation: ['getAnalyticsDashboard', 'getWinRate', 'getConversionMetrics', 'getSalesVelocity', 'getTeamPerformance'],
			},
		},
		default: '',
		description: 'Data final do período de análise',
	},
	{
		displayName: 'Agent IDs',
		name: 'agentIds',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
		},
		displayOptions: {
			show: {
				resource: ['pipeline'],
				operation: ['getTeamPerformance'],
			},
		},
		default: {},
		description: 'Agentes para filtrar. Deixe vazio para retornar todos.',
		options: [
			{
				name: 'values',
				displayName: 'Agent',
				values: [
					{
						displayName: 'Agent ID',
						name: 'id',
						type: 'string',
						required: true,
						default: '',
						description: 'ID do agente',
					},
				],
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