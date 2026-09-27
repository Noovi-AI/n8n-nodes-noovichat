import { INodeProperties } from 'n8n-workflow';

// Pipeline Pro — reusable activity templates
// (Pipeline::ActivityTemplatesController, body wrapper `pipeline_activity_template`).
// Routes: /api/v1/accounts/:account_id/pipeline/activity_templates[/:id[/duplicate]]
// Use them with Activity → Create From Template.
export const ActivityTemplateOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['activityTemplate'],
			},
		},
		options: [
			{ name: 'Create', value: 'create', action: 'Create an activity template' },
			{ name: 'Get', value: 'get', action: 'Get an activity template' },
			{ name: 'Get Many', value: 'getAll', action: 'Get many activity templates' },
			{ name: 'Update', value: 'update', action: 'Update an activity template' },
			{ name: 'Delete', value: 'delete', action: 'Delete an activity template' },
			{ name: 'Duplicate', value: 'duplicate', action: 'Duplicate an activity template' },
		],
		default: 'getAll',
	},
];

const ACTIVITY_TYPE_OPTIONS = [
	{ name: 'Call', value: 'call' },
	{ name: 'Demo', value: 'demo' },
	{ name: 'Email', value: 'email' },
	{ name: 'Follow-Up', value: 'follow_up' },
	{ name: 'Meeting', value: 'meeting' },
	{ name: 'Note', value: 'note' },
	{ name: 'Task', value: 'task' },
];

const CATEGORY_OPTIONS = [
	{ name: 'Customer Success', value: 'customer_success' },
	{ name: 'Follow-Up', value: 'follow_up' },
	{ name: 'Onboarding', value: 'onboarding' },
	{ name: 'Sales', value: 'sales' },
	{ name: 'Support', value: 'support' },
];

export const ActivityTemplateFields: INodeProperties[] = [
	{
		displayName: 'Template ID',
		name: 'activityTemplateId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['activityTemplate'],
				operation: ['get', 'update', 'delete', 'duplicate'],
			},
		},
		default: '',
	},
	{
		displayName: 'Name',
		name: 'activityTemplateName',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['activityTemplate'],
				operation: ['create'],
			},
		},
		default: '',
	},
	{
		displayName: 'Activity Type',
		name: 'templateActivityType',
		type: 'options',
		required: true,
		displayOptions: {
			show: {
				resource: ['activityTemplate'],
				operation: ['create'],
			},
		},
		options: ACTIVITY_TYPE_OPTIONS,
		default: 'task',
	},
	{
		displayName: 'Additional Fields',
		name: 'activityTemplateFields',
		type: 'collection',
		placeholder: 'Add Field',
		displayOptions: {
			show: {
				resource: ['activityTemplate'],
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
				description: 'Whether the template can be used',
			},
			{
				displayName: 'Activity Type',
				name: 'activityType',
				type: 'options',
				options: ACTIVITY_TYPE_OPTIONS,
				default: 'task',
				description: 'New activity type (update only; on create use the field above)',
			},
			{
				displayName: 'Category',
				name: 'category',
				type: 'options',
				options: CATEGORY_OPTIONS,
				default: 'sales',
			},
			{
				displayName: 'Default Content',
				name: 'defaultContent',
				type: 'string',
				default: '',
				typeOptions: { rows: 3 },
			},
			{
				displayName: 'Default Duration (Minutes)',
				name: 'defaultDuration',
				type: 'number',
				typeOptions: { minValue: 0 },
				default: 30,
			},
			{
				displayName: 'Default Metadata (JSON)',
				name: 'defaultMetadata',
				type: 'json',
				default: '{}',
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
		],
	},
	{
		displayName: 'New Name',
		name: 'duplicateName',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['activityTemplate'],
				operation: ['duplicate'],
			},
		},
		default: '',
		description: 'Name of the copy. Leave empty to use "Copy of" followed by the original name.',
	},
	{
		displayName: 'Filters',
		name: 'activityTemplateFilters',
		type: 'collection',
		placeholder: 'Add Filter',
		displayOptions: {
			show: {
				resource: ['activityTemplate'],
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
				displayName: 'Activity Type',
				name: 'activityType',
				type: 'options',
				options: ACTIVITY_TYPE_OPTIONS,
				default: 'task',
			},
			{
				displayName: 'Category',
				name: 'category',
				type: 'options',
				options: CATEGORY_OPTIONS,
				default: 'sales',
			},
			{
				displayName: 'Most Used First',
				name: 'mostUsed',
				type: 'boolean',
				default: false,
				description: 'Whether to sort by usage count instead of the default order',
			},
		],
	},
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['activityTemplate'],
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
				resource: ['activityTemplate'],
				operation: ['getAll'],
				returnAll: [false],
			},
		},
		default: 50,
		description: 'Max number of results to return',
	},
];
