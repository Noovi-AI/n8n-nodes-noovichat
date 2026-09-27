import { INodeProperties } from 'n8n-workflow';

// Pipeline Pro — activity sequence DEFINITIONS (the reusable cadence), as opposed
// to the `Sequence` resource, which runs a definition on a card.
// Pipeline::ActivitySequencesController, body wrapper `pipeline_activity_sequence`.
// Routes: /api/v1/accounts/:account_id/pipeline/activity_sequences[/:id[/activate|deactivate|duplicate]]
//         /api/v1/accounts/:account_id/pipeline/sequence_analytics
// Requires the `pipeline_sequences` account feature. Not exposed:
// webhook_credentials / rotate_webhook_credentials (secrets must not travel
// through a workflow).
export const SequenceDefinitionOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['sequenceDefinition'],
			},
		},
		options: [
			{ name: 'Create', value: 'create', action: 'Create a sequence definition' },
			{ name: 'Get', value: 'get', action: 'Get a sequence definition' },
			{ name: 'Get Many', value: 'getAll', action: 'Get many sequence definitions' },
			{ name: 'Update', value: 'update', action: 'Update a sequence definition' },
			{
				name: 'Delete',
				value: 'delete',
				action: 'Delete a sequence definition',
				description: 'Delete a definition. Refused while it has active executions.',
			},
			{ name: 'Activate', value: 'activate', action: 'Activate a sequence definition' },
			{ name: 'Deactivate', value: 'deactivate', action: 'Deactivate a sequence definition' },
			{ name: 'Duplicate', value: 'duplicate', action: 'Duplicate a sequence definition' },
			{ name: 'Get Analytics', value: 'getAnalytics', action: 'Get sequence analytics' },
		],
		default: 'getAll',
	},
];

export const SequenceDefinitionFields: INodeProperties[] = [
	{
		displayName: 'Definition ID',
		name: 'sequenceDefinitionId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['sequenceDefinition'],
				operation: ['get', 'update', 'delete', 'activate', 'deactivate', 'duplicate'],
			},
		},
		default: '',
		description: 'ID of the sequence definition',
	},
	{
		displayName: 'Name',
		name: 'sequenceName',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['sequenceDefinition'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'Name of the definition (unique in the account)',
	},
	{
		displayName: 'Trigger Type',
		name: 'sequenceTriggerType',
		type: 'options',
		required: true,
		displayOptions: {
			show: {
				resource: ['sequenceDefinition'],
				operation: ['create'],
			},
		},
		options: [
			{ name: 'Condition Based', value: 'condition_based' },
			{ name: 'Manual', value: 'manual' },
			{ name: 'Stage Change', value: 'stage_change' },
			{ name: 'Time Based', value: 'time_based' },
		],
		default: 'manual',
	},
	{
		displayName: 'Steps (JSON)',
		name: 'sequenceSteps',
		type: 'json',
		required: true,
		displayOptions: {
			show: {
				resource: ['sequenceDefinition'],
				operation: ['create'],
			},
		},
		default: '[\n  { "step_number": 1, "activity_type": "call", "title": "First call", "delay_days": 0 }\n]',
		description:
			'Array of step objects. Accepted keys: step_number, activity_type, title, description, delay_days, delay_hours, duration, condition, assign_to, priority, schedule_hours, due_days, webhook_url, webhook_method, webhook_payload_template, webhook_headers, on_failure, message_template, inbox_id, attachment_type, attachment_url, caption. Other keys are dropped by the server.',
	},
	{
		displayName: 'Additional Fields',
		name: 'sequenceFields',
		type: 'collection',
		placeholder: 'Add Field',
		displayOptions: {
			show: {
				resource: ['sequenceDefinition'],
				operation: ['create', 'update'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Active',
				name: 'active',
				type: 'boolean',
				default: true,
				description: 'Whether the definition is active',
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				description: 'New name (update only; on create use the Name field above)',
			},
			{
				displayName: 'Steps (JSON)',
				name: 'steps',
				type: 'json',
				default: '[]',
				description: 'Replaces the steps (update only; on create use the Steps field above)',
			},
			{
				displayName: 'Trigger Conditions (JSON)',
				name: 'triggerConditions',
				type: 'json',
				default: '{}',
				description: 'Object with the conditions of the trigger',
			},
			{
				displayName: 'Trigger Type',
				name: 'triggerType',
				type: 'options',
				options: [
					{ name: 'Condition Based', value: 'condition_based' },
					{ name: 'Manual', value: 'manual' },
					{ name: 'Stage Change', value: 'stage_change' },
					{ name: 'Time Based', value: 'time_based' },
				],
				default: 'manual',
				description: 'New trigger type (update only)',
			},
		],
	},
	{
		displayName: 'New Name',
		name: 'duplicateName',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['sequenceDefinition'],
				operation: ['duplicate'],
			},
		},
		default: '',
		description: 'Name of the copy. Leave empty to use "Copy of" followed by the original name.',
	},
	{
		displayName: 'Filters',
		name: 'sequenceFilters',
		type: 'collection',
		placeholder: 'Add Filter',
		displayOptions: {
			show: {
				resource: ['sequenceDefinition'],
				operation: ['getAll'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Active',
				name: 'active',
				type: 'options',
				options: [
					{ name: 'Active Only', value: 'true' },
					{ name: 'Inactive Only', value: 'false' },
				],
				default: 'true',
			},
			{
				displayName: 'Search',
				name: 'q',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Trigger Type',
				name: 'triggerType',
				type: 'options',
				options: [
					{ name: 'Condition Based', value: 'condition_based' },
					{ name: 'Manual', value: 'manual' },
					{ name: 'Stage Change', value: 'stage_change' },
					{ name: 'Time Based', value: 'time_based' },
				],
				default: 'manual',
			},
		],
	},
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['sequenceDefinition'],
				operation: ['getAll'],
			},
		},
		default: false,
		description: 'Whether to return all results or only up to a given limit',
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		typeOptions: { minValue: 1, maxValue: 100 },
		displayOptions: {
			show: {
				resource: ['sequenceDefinition'],
				operation: ['getAll'],
				returnAll: [false],
			},
		},
		default: 50,
		description: 'Max number of results to return',
	},
	{
		displayName: 'Days Back',
		name: 'daysBack',
		type: 'number',
		typeOptions: { minValue: 1, maxValue: 90 },
		displayOptions: {
			show: {
				resource: ['sequenceDefinition'],
				operation: ['getAnalytics'],
			},
		},
		default: 7,
		description: 'Size of the summary window in days (1–90)',
	},
];
