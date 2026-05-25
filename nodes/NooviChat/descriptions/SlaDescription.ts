import { INodeProperties } from 'n8n-workflow';

export const SlaResource: INodeProperties[] = [
	{
		displayName: 'Resource',
		name: 'resource',
		type: 'options',
		noDataExpression: true,
		options: [
			{ name: 'SLA', value: 'sla' },
		],
		default: 'sla',
	},
];

export const SlaOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['sla'],
			},
		},
		options: [
			{ name: 'Create Policy', value: 'createPolicy', action: 'Create an SLA policy' },
			{ name: 'Get Policy', value: 'getPolicy', action: 'Get an SLA policy' },
			{ name: 'Get Many Policies', value: 'getAllPolicies', action: 'Get many SLA policies' },
			{ name: 'Update Policy', value: 'updatePolicy', action: 'Update an SLA policy' },
			{ name: 'Delete Policy', value: 'deletePolicy', action: 'Delete an SLA policy' },
			{ name: 'Get Applied SLAs', value: 'getApplied', action: 'Get applied SLAs' },
			{ name: 'Get Metrics', value: 'getMetrics', action: 'Get SLA metrics' },
			{ name: 'Export CSV', value: 'exportCsv', action: 'Export SLA report' },
		],
		default: 'getAllPolicies',
	},
];

export const SlaFields: INodeProperties[] = [
	{
		displayName: 'Policy ID',
		name: 'policyId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['sla'],
				operation: ['getPolicy', 'updatePolicy', 'deletePolicy'],
			},
		},
		default: '',
		description: 'SLA policy ID',
	},

	// Create policy fields
	{
		displayName: 'Policy Name',
		name: 'policyName',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['sla'],
				operation: ['createPolicy'],
			},
		},
		default: '',
		description: 'Name of the SLA policy',
	},
	{
		displayName: 'First Response Time Threshold (seconds)',
		name: 'firstResponseTimeThreshold',
		type: 'number',
		required: true,
		displayOptions: {
			show: {
				resource: ['sla'],
				operation: ['createPolicy', 'updatePolicy'],
			},
		},
		default: 3600,
		description: 'Maximum seconds allowed for first response (e.g. 3600 = 1 hour)',
	},
	{
		displayName: 'Next Response Time Threshold (seconds)',
		name: 'nextResponseTimeThreshold',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['sla'],
				operation: ['createPolicy', 'updatePolicy'],
			},
		},
		default: 0,
		description:
			'Maximum seconds allowed for each subsequent response after the first (0 = disabled)',
	},
	{
		displayName: 'Resolution Time Threshold (seconds)',
		name: 'resolutionTimeThreshold',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['sla'],
				operation: ['createPolicy', 'updatePolicy'],
			},
		},
		default: 86400,
		description: 'Maximum seconds allowed to resolve the conversation (e.g. 86400 = 24 hours)',
	},
	{
		displayName: 'Only During Business Hours',
		name: 'onlyDuringBusinessHours',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['sla'],
				operation: ['createPolicy', 'updatePolicy'],
			},
		},
		default: false,
		description: 'Whether the SLA timer pauses outside the inbox business hours',
	},
	{
		displayName: 'Description',
		name: 'policyDescription',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['sla'],
				operation: ['createPolicy', 'updatePolicy'],
			},
		},
		default: '',
		description: 'Optional description of the SLA policy',
	},

	// Metrics/Export
	{
		displayName: 'Start Date',
		name: 'startDate',
		type: 'dateTime',
		displayOptions: {
			show: {
				resource: ['sla'],
				operation: ['getMetrics', 'exportCsv'],
			},
		},
		default: '',
		description: 'Start date of the period',
	},
	{
		displayName: 'End Date',
		name: 'endDate',
		type: 'dateTime',
		displayOptions: {
			show: {
				resource: ['sla'],
				operation: ['getMetrics', 'exportCsv'],
			},
		},
		default: '',
		description: 'End date of the period',
	},

	// Get Many options
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['sla'],
				operation: ['getAllPolicies', 'getApplied'],
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
				resource: ['sla'],
				operation: ['getAllPolicies', 'getApplied'],
				returnAll: [false],
			},
		},
		default: 50,
		description: 'Maximum number of results to return',
	},
];