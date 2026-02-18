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
		placeholder: 'e.g., abc-123',
		description: 'ID of the activity',
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
		placeholder: 'e.g., Q1 Sales Campaign',
		description: 'Title of the activity',
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
			{ name: 'Call', value: 'call', description: 'Phone or video call activity' },
			{ name: 'Meeting', value: 'meeting', description: 'In-person or virtual meeting' },
			{ name: 'Email', value: 'email', description: 'Email communication activity' },
			{ name: 'Task', value: 'task', description: 'General task or to-do item' },
			{ name: 'Note', value: 'note', description: 'Notes or observation' },
		],
		default: 'task',
		description: 'Type of the activity',
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
				description: 'ID of the agent responsible',
			},
			{
				displayName: 'Deal ID',
				name: 'dealId',
				type: 'string',
				default: '',
				placeholder: 'e.g., abc-123',
				description: 'ID of the deal this activity belongs to',
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				description: 'Detailed description of the activity',
				typeOptions: { rows: 3 },
			},
			{
				displayName: 'Due At',
				name: 'dueAt',
				type: 'dateTime',
				default: '',
				description: 'Due date and time',
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
				description: 'ID of the agent responsible',
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				description: 'Detailed description of the activity',
				typeOptions: { rows: 3 },
			},
			{
				displayName: 'Due At',
				name: 'dueAt',
				type: 'dateTime',
				default: '',
				description: 'Due date and time',
			},
			{
				displayName: 'Title',
				name: 'title',
				type: 'string',
				default: '',
				placeholder: 'e.g., Q1 Sales Campaign',
				description: 'New title for the activity',
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
		description: 'Start date of the analysis period',
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
		description: 'End date of the analysis period',
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
		description: 'Whether to return all results instead of applying a limit',
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		typeOptions: { minValue: 1, maxValue: 100 },
		displayOptions: {
			show: {
				resource: ['activity'],
				operation: ['getAll'],
				returnAll: [false],
			},
		},
		default: 50,
		description: 'Maximum number of results to return',
	},
];
