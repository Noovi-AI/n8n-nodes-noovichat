import { INodeProperties } from 'n8n-workflow';

export const DealResource: INodeProperties[] = [
	{
		displayName: 'Resource',
		name: 'resource',
		type: 'options',
		noDataExpression: true,
		options: [
			{ name: 'Deal', value: 'deal' },
		],
		default: 'deal',
	},
];

export const DealOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['deal'],
			},
		},
		options: [
			{ name: 'Create', value: 'create', action: 'Create a deal' },
			{ name: 'Get', value: 'get', action: 'Get a deal' },
			{ name: 'Get Many', value: 'getAll', action: 'Get many deals' },
			{ name: 'Update', value: 'update', action: 'Update a deal' },
			{ name: 'Delete', value: 'delete', action: 'Delete a deal' },
			{ name: 'Move to Stage', value: 'moveToStage', action: 'Move deal to stage' },
			{ name: 'Mark Won', value: 'markWon', action: 'Mark deal as won' },
			{ name: 'Mark Lost', value: 'markLost', action: 'Mark deal as lost' },
			{ name: 'Reopen', value: 'reopen', action: 'Reopen deal' },
			{ name: 'Get Timeline', value: 'getTimeline', action: 'Get deal timeline' },
			{ name: 'Bulk Update', value: 'bulkUpdate', action: 'Bulk update deals' },
			{ name: 'Bulk Move', value: 'bulkMove', action: 'Bulk move deals to stage' },
			{ name: 'Bulk Delete', value: 'bulkDelete', action: 'Bulk delete deals' },
			{ name: 'Get Lead Score', value: 'getLeadScore', action: 'Get deal lead score' },
			{ name: 'Recalculate Lead Score', value: 'recalculateLeadScore', action: 'Recalculate lead score' },
		],
		default: 'getAll',
	},
];

export const DealFields: INodeProperties[] = [
	{
		displayName: 'Deal ID',
		name: 'dealId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['deal'],
				operation: ['get', 'update', 'delete', 'moveToStage', 'markWon', 'markLost', 'reopen', 'getTimeline', 'getLeadScore', 'recalculateLeadScore'],
			},
		},
		default: '',
		description: 'ID do deal',
	},

	// Create deal fields
	{
		displayName: 'Title',
		name: 'title',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['deal'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'Título do deal',
	},
	{
		displayName: 'Pipeline ID',
		name: 'pipelineId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['deal'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'ID do pipeline',
	},
	{
		displayName: 'Stage ID',
		name: 'stageId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['deal'],
				operation: ['create', 'moveToStage'],
			},
		},
		default: '',
		description: 'ID do estágio',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		displayOptions: {
			show: {
				resource: ['deal'],
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
				displayName: 'Contact ID',
				name: 'contactId',
				type: 'string',
				default: '',
				description: 'ID do contato associado ao deal',
			},
			{
				displayName: 'Expected Close Date',
				name: 'expectedCloseDate',
				type: 'dateTime',
				default: '',
				description: 'Data esperada de fechamento',
			},
			{
				displayName: 'Value',
				name: 'value',
				type: 'number',
				default: 0,
				description: 'Valor monetário do deal',
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
				resource: ['deal'],
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
				displayName: 'Expected Close Date',
				name: 'expectedCloseDate',
				type: 'dateTime',
				default: '',
				description: 'Data esperada de fechamento',
			},
			{
				displayName: 'Title',
				name: 'title',
				type: 'string',
				default: '',
				description: 'Novo título do deal',
			},
			{
				displayName: 'Value',
				name: 'value',
				type: 'number',
				default: 0,
				description: 'Valor monetário do deal',
			},
		],
	},

	// Mark Lost fields
	{
		displayName: 'Lost Reason',
		name: 'lostReason',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['deal'],
				operation: ['markLost'],
			},
		},
		default: '',
		description: 'Motivo da perda',
	},

	// Bulk operations
	{
		displayName: 'Deal IDs',
		name: 'dealIds',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
			minValue: 1,
		},
		required: true,
		displayOptions: {
			show: {
				resource: ['deal'],
				operation: ['bulkUpdate', 'bulkMove', 'bulkDelete'],
			},
		},
		default: { values: [{ id: '' }] },
		description: 'Deals a processar',
		options: [
			{
				name: 'values',
				displayName: 'Deal',
				values: [
					{
						displayName: 'Deal ID',
						name: 'id',
						type: 'string',
						required: true,
						default: '',
						description: 'ID do deal',
					},
				],
			},
		],
	},
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'json',
		required: true,
		displayOptions: {
			show: {
				resource: ['deal'],
				operation: ['bulkUpdate'],
			},
		},
		default: '{}',
		description: 'Campos para atualizar em JSON',
	},

	// Get Many options
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['deal'],
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
				resource: ['deal'],
				operation: ['getAll'],
				returnAll: [false],
			},
		},
		default: 50,
		description: 'Número máximo de resultados',
	},
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		displayOptions: {
			show: {
				resource: ['deal'],
				operation: ['getAll'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Pipeline ID',
				name: 'pipelineId',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Stage ID',
				name: 'stageId',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Assignee ID',
				name: 'assigneeId',
				type: 'number',
				default: 0,
			},
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				options: [
					{ name: 'Open', value: 'open' },
					{ name: 'Won', value: 'won' },
					{ name: 'Lost', value: 'lost' },
				],
				default: 'open',
			},
		],
	},
];