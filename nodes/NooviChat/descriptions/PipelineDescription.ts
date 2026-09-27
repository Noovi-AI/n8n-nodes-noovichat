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
			{
				name: 'Get Lost Reasons Analytics',
				value: 'getLostReasonsAnalytics',
				action: 'Get lost reasons analytics',
				description: 'How many deals were lost per reason in the period, for the pipelines you can see',
			},
			{
				name: 'Get Forecast',
				value: 'getForecast',
				action: 'Get the revenue forecast',
				description: 'Open deals with an expected close date, grouped by month',
			},
			{
				name: 'Get Pipeline Analysis',
				value: 'getPipelineAnalysis',
				action: 'Get the stage analysis of a pipeline',
			},
			{
				name: 'Get Pipeline Dashboard',
				value: 'getPipelineDashboard',
				action: 'Get the dashboard of a pipeline',
			},
			{
				name: 'Export Report (CSV)',
				value: 'exportReport',
				action: 'Export the pipeline report as CSV',
				description: 'Export the report numbers (KPIs and per-stage breakdown) of one pipeline as CSV text',
			},
			{
				name: 'Get Agent Pipeline',
				value: 'getAgentPipeline',
				action: 'Get the pipeline metrics of an agent',
			},
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
				operation: ['get', 'update', 'delete', 'getStages', 'createStage', 'updateStage', 'deleteStage', 'reorderStages'],
			},
		},
		default: '',
		description: 'ID of the pipeline',
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
		description: 'Name of the pipeline',
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
		description: 'Description of the pipeline',
	},
	// Initial stages for pipeline creation (required by the API)
	{
		displayName: 'Initial Stages',
		name: 'initialStages',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
			minValue: 1,
		},
		required: true,
		displayOptions: {
			show: {
				resource: ['pipeline'],
				operation: ['create'],
			},
		},
		default: { values: [{ stageName: 'Lead', stageColor: '#3B82F6', stagePosition: 1 }] },
		description: 'At least one stage is required to create a pipeline. Stages define the steps in your sales process.',
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
						description: 'Stage name (e.g. Lead, Qualified, Proposal, Closed Won)',
					},
					{
						displayName: 'Color',
						name: 'stageColor',
						type: 'color',
						default: '#3B82F6',
						description: 'Stage color',
					},
					{
						displayName: 'Position',
						name: 'stagePosition',
						type: 'number',
						default: 1,
						description: 'Display order (1 = first)',
					},
				],
			},
		],
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
		description: 'Stage ID',
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
		description: 'Stages to create. Add as many as needed.',
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
						description: 'Stage name',
					},
					{
						displayName: 'Color',
						name: 'stageColor',
						type: 'color',
						default: '#0066FF',
						description: 'Stage color',
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
		description: 'New name for the stage',
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
		description: 'New color for the stage',
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
		description: 'Stages in the new order, from top to bottom',
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
						description: 'Stage ID',
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
				operation: ['getAnalyticsDashboard', 'getWinRate', 'getConversionMetrics', 'getSalesVelocity', 'getTeamPerformance', 'getLostReasonsAnalytics', 'getPipelineAnalysis', 'exportReport'],
			},
		},
		default: '',
		description: 'Start date of the analysis period',
	},
	{
		displayName: 'End Date',
		name: 'endDate',
		type: 'dateTime',
		displayOptions: {
			show: {
				resource: ['pipeline'],
				operation: ['getAnalyticsDashboard', 'getWinRate', 'getConversionMetrics', 'getSalesVelocity', 'getTeamPerformance', 'getLostReasonsAnalytics', 'getPipelineAnalysis', 'exportReport'],
			},
		},
		default: '',
		description: 'End date of the analysis period',
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
		description: 'Agents to filter by. Leave empty to receive events from all agents.',
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
						description: 'ID of the agent',
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
		description: 'Whether to return all results instead of applying a limit',
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
		description: 'Maximum number of results to return',
	},

	// ── Per-pipeline analytics (Pipeline::AnalyticsController / OwnersController) ──
	{
		displayName: 'Pipeline ID',
		name: 'analyticsPipelineId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['pipeline'],
				operation: ['getPipelineAnalysis', 'getPipelineDashboard', 'exportReport'],
			},
		},
		default: '',
		placeholder: 'e.g., 3',
		description: 'ID of the pipeline to analyse',
	},
	{
		displayName: 'Pipeline ID',
		name: 'analyticsPipelineId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['pipeline'],
				operation: ['getForecast'],
			},
		},
		default: '',
		placeholder: 'e.g., 3',
		description: 'Limit the forecast to one pipeline. Leave empty to aggregate every pipeline you can see.',
	},
	{
		displayName: 'Months Ahead',
		name: 'monthsAhead',
		type: 'number',
		typeOptions: { minValue: 1, maxValue: 24 },
		displayOptions: {
			show: {
				resource: ['pipeline'],
				operation: ['getForecast'],
			},
		},
		default: 6,
		description: 'How many months ahead the forecast covers (the server clamps it to 1–24)',
	},
	{
		displayName: 'Date Start',
		name: 'dashboardDateStart',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['pipeline'],
				operation: ['getPipelineDashboard'],
			},
		},
		default: '',
		placeholder: 'YYYY-MM-DD',
		description: 'Start of the period (strict YYYY-MM-DD, account timezone). Must be sent together with Date End.',
	},
	{
		displayName: 'Date End',
		name: 'dashboardDateEnd',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['pipeline'],
				operation: ['getPipelineDashboard'],
			},
		},
		default: '',
		placeholder: 'YYYY-MM-DD',
		description: 'End of the period (strict YYYY-MM-DD, account timezone). Must be sent together with Date Start.',
	},
	{
		displayName: 'Activity Page',
		name: 'activityPage',
		type: 'number',
		typeOptions: { minValue: 1 },
		displayOptions: {
			show: {
				resource: ['pipeline'],
				operation: ['getPipelineDashboard'],
			},
		},
		default: 1,
		description: 'Page of the recent-activity list included in the dashboard',
	},
	{
		displayName: 'Activity Per Page',
		name: 'activityPerPage',
		type: 'number',
		typeOptions: { minValue: 1, maxValue: 50 },
		displayOptions: {
			show: {
				resource: ['pipeline'],
				operation: ['getPipelineDashboard'],
			},
		},
		default: 10,
		description: 'Size of the recent-activity page (1–50)',
	},
	{
		displayName: 'Agent ID',
		name: 'agentUserId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['pipeline'],
				operation: ['getAgentPipeline'],
			},
		},
		default: '',
		placeholder: 'e.g., 7',
		description: 'ID of the agent (user) whose pipeline metrics are returned',
	},
];