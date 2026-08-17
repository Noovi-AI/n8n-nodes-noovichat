import { INodeProperties } from 'n8n-workflow';

export const CardResource: INodeProperties[] = [
	{
		displayName: 'Resource',
		name: 'resource',
		type: 'options',
		noDataExpression: true,
		options: [{ name: 'Card', value: 'card' }],
		default: 'card',
	},
];

export const CardOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['card'],
			},
		},
		options: [
			{ name: 'Create', value: 'create', action: 'Create a card' },
			{ name: 'Get', value: 'get', action: 'Get a card' },
			{ name: 'Get Many', value: 'getAll', action: 'Get many cards' },
			{ name: 'Update', value: 'update', action: 'Update a card' },
			{ name: 'Delete', value: 'delete', action: 'Delete a card' },
			{
				name: 'Move to Stage',
				value: 'moveToStage',
				action: 'Move card to stage',
			},
			{ name: 'Mark Won', value: 'markWon', action: 'Mark card as won' },
			{ name: 'Mark Lost', value: 'markLost', action: 'Mark card as lost' },
			{ name: 'Reopen', value: 'reopen', action: 'Reopen card' },
			{
				name: 'Get Timeline',
				value: 'getTimeline',
				action: 'Get card timeline',
			},
			{ name: 'Bulk Update', value: 'bulkUpdate', action: 'Bulk update cards' },
			{
				name: 'Bulk Move',
				value: 'bulkMove',
				action: 'Bulk move cards to stage',
			},
			{ name: 'Bulk Delete', value: 'bulkDelete', action: 'Bulk delete cards' },
			{
				name: 'Get Lead Score',
				value: 'getLeadScore',
				action: 'Get card lead score',
			},
			{
				name: 'Recalculate Lead Score',
				value: 'recalculateLeadScore',
				action: 'Recalculate lead score',
			},
			{
				name: 'Add Contact',
				value: 'addContact',
				action: 'Link an additional contact to a card',
			},
			{
				name: 'Remove Contact',
				value: 'removeContact',
				action: 'Unlink an additional contact from a card',
			},
			{
				name: 'Add Conversation',
				value: 'addConversation',
				action: 'Link an additional conversation to a card',
			},
			{
				name: 'Remove Conversation',
				value: 'removeConversation',
				action: 'Unlink an additional conversation from a card',
			},
			{ name: 'Export (CSV)', value: 'export', action: 'Export cards to CSV' },
			{
				name: 'Get Import Template (CSV)',
				value: 'getImportTemplate',
				action: 'Get the CSV import template',
			},
		],
		default: 'getAll',
	},
];

export const CardFields: INodeProperties[] = [
	{
		displayName: 'Card ID',
		name: 'cardId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['card'],
				operation: ['get', 'update', 'delete', 'moveToStage', 'markWon', 'markLost', 'reopen', 'getTimeline', 'getLeadScore', 'recalculateLeadScore', 'addContact', 'removeContact', 'addConversation', 'removeConversation'],
			},
		},
		default: '',
		placeholder: 'e.g., abc-123',
		description: 'ID of the card',
	},

	// Additional contacts / conversations (non-primary links).
	// Backend: POST/DELETE /pipeline/cards/:card_id/contacts and .../conversations.
	// The primary contact_id / conversation_display_id stay untouched; these are
	// additive join records surfaced on the card as additional_contacts /
	// additional_conversations (each carrying its own join-record `id`).
	{
		displayName: 'Contact ID',
		name: 'additionalContactId',
		type: 'number',
		required: true,
		displayOptions: {
			show: {
				resource: ['card'],
				operation: ['addContact'],
			},
		},
		default: 0,
		description: 'ID of the contact to link as an additional (non-primary) contact',
	},
	{
		displayName: 'Role',
		name: 'contactRole',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['card'],
				operation: ['addContact'],
			},
		},
		default: '',
		placeholder: 'e.g., decisor, influenciador',
		description: 'Optional free-form role label for the linked contact',
	},
	{
		displayName: 'Conversation Display ID',
		name: 'additionalConversationDisplayId',
		type: 'number',
		required: true,
		displayOptions: {
			show: {
				resource: ['card'],
				operation: ['addConversation'],
			},
		},
		default: 0,
		description: 'Display ID of the conversation to link (the short public number visible in the URL)',
	},
	{
		displayName: 'Link ID',
		name: 'linkId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['card'],
				operation: ['removeContact', 'removeConversation'],
			},
		},
		default: '',
		placeholder: 'e.g., 42',
		description: "ID of the join record to remove. This is the `id` field inside the card's additional_contacts / additional_conversations array — NOT the contact or conversation ID itself.",
	},

	// Create card fields
	{
		displayName: 'Title',
		name: 'title',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['card'],
				operation: ['create'],
			},
		},
		default: '',
		placeholder: 'e.g., Q1 Sales Campaign',
		description: 'Title of the card',
	},
	{
		displayName: 'Pipeline ID',
		name: 'pipelineId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['card'],
				operation: ['create'],
			},
		},
		default: '',
		placeholder: 'e.g., 1',
		description: 'ID of the pipeline',
	},
	{
		displayName: 'Pipeline Stage',
		name: 'stageId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['card'],
				operation: ['create', 'moveToStage'],
			},
		},
		default: '',
		placeholder: 'e.g., 1_lead',
		description: 'Stage identifier in the format {pipeline_id}_{stage_slug} (e.g. "1_lead", "2_qualificado"). Use the "Get Stages" operation on the Pipeline resource to list available stage IDs. Won/lost stages are special: Move to Stage handles them (it closes the deal for you), but Create refuses to open a card straight into one and returns HTTP 422 — create it in a regular stage, then use Mark Won or Mark Lost.',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		displayOptions: {
			show: {
				resource: ['card'],
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
				typeOptions: { minValue: 0 },
				description: 'ID of the responsible agent. Use 0 to create the card without an assignee.',
			},
			{
				displayName: 'Contact ID',
				name: 'contactId',
				type: 'string',
				default: '',
				placeholder: 'e.g., abc-123',
				description: 'ID of the contact associated with this card',
			},
			{
				displayName: 'Expected Close Date',
				name: 'expectedCloseDate',
				type: 'dateTime',
				default: '',
				description: 'Expected close date',
			},
			{
				displayName: 'Value (Currency)',
				name: 'value',
				type: 'number',
				default: 0,
				typeOptions: { minValue: 0, maxValue: 9999999999.99, numberPrecision: 2 },
				description: 'Expected revenue of the card. Zero is sent as a valid value.',
			},
			{
				displayName: 'Currency',
				name: 'currency',
				type: 'string',
				default: 'BRL',
				placeholder: 'e.g., BRL',
				description: 'Three-letter uppercase currency code for the card value',
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
				resource: ['card'],
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
				typeOptions: { minValue: 0 },
				description: 'ID of the responsible agent. Use 0 to clear the current assignee.',
			},
			{
				displayName: 'Expected Close Date',
				name: 'expectedCloseDate',
				type: 'dateTime',
				default: '',
				description: 'Expected close date',
			},
			{
				displayName: 'Title',
				name: 'title',
				type: 'string',
				default: '',
				placeholder: 'e.g., Q1 Sales Campaign',
				description: 'New title for the card',
			},
			{
				displayName: 'Value (Currency)',
				name: 'value',
				type: 'number',
				default: 0,
				typeOptions: { minValue: 0, maxValue: 9999999999.99, numberPrecision: 2 },
				description: 'Expected revenue of the card. Zero is sent as a valid value.',
			},
			{
				displayName: 'Currency',
				name: 'currency',
				type: 'string',
				default: 'BRL',
				placeholder: 'e.g., BRL',
				description: 'Three-letter uppercase currency code for the card value',
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
				resource: ['card'],
				operation: ['markLost'],
			},
		},
		default: '',
		description: 'Reason for losing the card',
	},

	// Bulk operations
	{
		displayName: 'Card IDs',
		name: 'cardIds',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
			minValue: 1,
		},
		required: true,
		displayOptions: {
			show: {
				resource: ['card'],
				operation: ['bulkUpdate', 'bulkMove', 'bulkDelete'],
			},
		},
		default: { values: [{ id: '' }] },
		description: 'Cards to process',
		options: [
			{
				name: 'values',
				displayName: 'Card',
				values: [
					{
						displayName: 'Card ID',
						name: 'id',
						type: 'string',
						required: true,
						default: '',
						placeholder: 'e.g., abc-123',
						description: 'ID of the card',
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
				resource: ['card'],
				operation: ['bulkUpdate'],
			},
		},
		default: '{}',
		description: 'Fields to update as a JSON object',
		hint: 'Deal transitions are not supported here. This node rejects "status", and NooviChat answers HTTP 422 to a "pipeline_stage" that enters OR leaves a won/lost stage. Use Mark Won, Mark Lost, Reopen — or Bulk Move, which goes through the dedicated move endpoint.',
	},

	// Get Many options
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['card'],
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
		typeOptions: { minValue: 1, maxValue: 500 },
		displayOptions: {
			show: {
				resource: ['card'],
				operation: ['getAll'],
				returnAll: [false],
			},
		},
		default: 50,
		description: 'Maximum number of results to return',
	},
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		displayOptions: {
			show: {
				resource: ['card'],
				operation: ['getAll', 'export'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Pipeline ID',
				name: 'pipelineId',
				type: 'string',
				default: '',
				placeholder: 'e.g., 1',
			},
			{
				displayName: 'Stage ID',
				name: 'stageId',
				type: 'string',
				default: '',
				placeholder: 'e.g., qualified',
				description: 'Filter by one exact pipeline stage identifier',
			},
			{
				displayName: 'Contact ID',
				name: 'contactId',
				type: 'number',
				default: 0,
				description: 'Filter by contact ID',
			},
			{
				displayName: 'Conversation Display ID',
				name: 'conversationDisplayId',
				type: 'number',
				default: 0,
				description: 'Filter by conversation display ID (the short public number visible in the URL)',
			},
			{
				displayName: 'Exclude Card ID',
				name: 'excludeId',
				type: 'number',
				default: 0,
				description: 'Exclude one card ID from the results',
			},
			{
				displayName: 'Search',
				name: 'search',
				type: 'string',
				default: '',
				placeholder: 'e.g., Acme renewal',
				description: 'Search card title or description, contact, owner, inbox, identifiers, or stage name (maximum 200 characters)',
			},
			{
				displayName: 'Labels',
				name: 'labels',
				type: 'string',
				default: '',
				placeholder: 'e.g., vip, urgente',
				description: 'Filter by conversation label titles. Separate multiple labels with commas — a card matches if it has any of them.',
			},
			{
				displayName: 'Priority',
				name: 'priority',
				type: 'multiOptions',
				default: [],
				options: [
					{ name: 'None', value: 'none' },
					{ name: 'Low', value: 'low' },
					{ name: 'Medium', value: 'medium' },
					{ name: 'High', value: 'high' },
					{ name: 'Urgent', value: 'urgent' },
				],
				description: 'Filter by one or more card priorities',
			},
			{
				displayName: 'Minimum Value',
				name: 'valueMin',
				type: 'number',
				default: 0,
				typeOptions: { minValue: 0, numberPrecision: 2 },
				description: 'Minimum expected revenue. Zero is sent when this filter is added.',
			},
			{
				displayName: 'Maximum Value',
				name: 'valueMax',
				type: 'number',
				default: 0,
				typeOptions: { minValue: 0, numberPrecision: 2 },
				description: 'Maximum expected revenue. Zero is sent when this filter is added.',
			},
			{
				displayName: 'Agent ID',
				name: 'agentId',
				type: 'string',
				default: '',
				placeholder: 'e.g., 42 or unassigned',
				description: 'Filter by owner ID. Use -1 or unassigned for cards without an owner.',
			},
			{
				displayName: 'Created From',
				name: 'dateStart',
				type: 'dateTime',
				default: '',
				description: 'Earliest creation date or timestamp, interpreted in the account reporting timezone',
			},
			{
				displayName: 'Created Until',
				name: 'dateEnd',
				type: 'dateTime',
				default: '',
				description: 'Latest creation date or timestamp, interpreted in the account reporting timezone',
			},
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				default: 'open',
				options: [
					{ name: 'Open', value: 'open' },
					{ name: 'Won', value: 'won' },
					{ name: 'Lost', value: 'lost' },
					{ name: 'Closed (Won or Lost)', value: 'closed' },
				],
				description: 'Filter by deal status',
			},
			{
				displayName: 'SLA Exceeded',
				name: 'slaExceeded',
				type: 'boolean',
				default: false,
				description: 'Whether to return only open cards whose SLA deadline is overdue',
			},
			{
				displayName: 'Stages',
				name: 'stages',
				type: 'string',
				default: '',
				placeholder: 'e.g., lead,qualified',
				description: 'Filter by multiple stage identifiers, separated with commas',
			},
		],
	},
];
