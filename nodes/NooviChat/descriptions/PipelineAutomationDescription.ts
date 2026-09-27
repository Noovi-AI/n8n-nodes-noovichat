import { INodeProperties } from 'n8n-workflow';

// Pipeline Pro — flow automations (Pipeline::AutomationsController) and the
// read-only template catalog (Pipeline::AutomationTemplatesController).
// Routes: /api/v1/accounts/:account_id/pipeline/automations[/...]
//         /api/v1/accounts/:account_id/pipeline/automation_templates[/...]
// Deliberately NOT exposed: rate_limit(s) (dashboard gauges), validate_flow
// (flow-editor helper), webhook_credentials / rotate_webhook_token (secrets must
// not travel through a workflow).
export const PipelineAutomationOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['pipelineAutomation'],
			},
		},
		options: [
			{ name: 'Create', value: 'create', action: 'Create a pipeline automation' },
			{ name: 'Get', value: 'get', action: 'Get a pipeline automation' },
			{ name: 'Get Many', value: 'getAll', action: 'Get many pipeline automations' },
			{ name: 'Update', value: 'update', action: 'Update a pipeline automation' },
			{ name: 'Delete', value: 'delete', action: 'Delete a pipeline automation' },
			{
				name: 'Execute',
				value: 'execute',
				action: 'Execute a pipeline automation',
				description: 'Run the automation now (manual trigger), optionally with a conversation or contact as context',
			},
			{
				name: 'Dry Run',
				value: 'dryRun',
				action: 'Simulate a pipeline automation',
				description: 'Simulate the execution without applying any action',
			},
			{ name: 'Validate', value: 'validate', action: 'Validate the flow of a pipeline automation' },
			{ name: 'Duplicate', value: 'duplicate', action: 'Duplicate a pipeline automation' },
			{ name: 'Get Stats', value: 'getStats', action: 'Get the stats of a pipeline automation' },
			{ name: 'Get Executions', value: 'getExecutions', action: 'Get the executions of a pipeline automation' },
			{ name: 'Get All Executions', value: 'getAllExecutions', action: 'Get the executions of every pipeline automation' },
			{ name: 'Get Audit Logs', value: 'getAuditLogs', action: 'Get the audit logs of a pipeline automation' },
			{ name: 'Get All Audit Logs', value: 'getAllAuditLogs', action: 'Get the audit logs of every pipeline automation' },
			{ name: 'Get Dashboard', value: 'getDashboard', action: 'Get the pipeline automation dashboard' },
			{ name: 'Export', value: 'export', action: 'Export a pipeline automation as JSON' },
			{
				name: 'Import',
				value: 'import',
				action: 'Import a pipeline automation from JSON',
				description: 'Create an automation from the JSON produced by Export. It is always created inactive.',
			},
			{ name: 'Get Templates', value: 'getTemplates', action: 'Get the automation templates' },
			{ name: 'Get Template', value: 'getTemplate', action: 'Get an automation template' },
			{ name: 'Get Template Categories', value: 'getTemplateCategories', action: 'Get the automation template categories' },
			{
				name: 'Create From Template',
				value: 'createFromTemplate',
				action: 'Create a pipeline automation from a template',
			},
		],
		default: 'getAll',
	},
];

export const PipelineAutomationFields: INodeProperties[] = [
	{
		displayName: 'Automation ID',
		name: 'automationId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['pipelineAutomation'],
				operation: [
					'get',
					'update',
					'delete',
					'execute',
					'dryRun',
					'validate',
					'duplicate',
					'getStats',
					'getExecutions',
					'getAuditLogs',
					'export',
				],
			},
		},
		default: '',
		description: 'ID of the pipeline automation',
	},
	{
		displayName: 'Template ID',
		name: 'automationTemplateId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['pipelineAutomation'],
				operation: ['getTemplate', 'createFromTemplate'],
			},
		},
		default: '',
		description: 'ID of the automation template',
	},

	// ── Create ───────────────────────────────────────────────────────────
	{
		displayName: 'Name',
		name: 'automationName',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['pipelineAutomation'],
				operation: ['create'],
			},
		},
		default: '',
	},
	{
		displayName: 'Fields',
		name: 'automationFields',
		type: 'collection',
		placeholder: 'Add Field',
		displayOptions: {
			show: {
				resource: ['pipelineAutomation'],
				operation: ['create', 'update'],
			},
		},
		default: {},
		description:
			'Body of pipeline_automation. Creating requires a Flow with at least one node: an automation without one is refused with 422, because the engine only runs flows.',
		options: [
			{
				displayName: 'Actions (JSON)',
				name: 'actions',
				type: 'json',
				default: '[]',
				description: 'Array of legacy actions',
			},
			{
				displayName: 'Active',
				name: 'active',
				type: 'boolean',
				default: false,
				description: 'Whether the automation is active. Turning on an automation that has no flow nodes is refused with 422.',
			},
			{
				displayName: 'Conditions (JSON)',
				name: 'conditions',
				type: 'json',
				default: '[]',
				description: 'Array of legacy conditions',
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Flow (JSON)',
				name: 'flow',
				type: 'json',
				default: '{}',
				description: 'Flow graph: { "nodes": [...], "connections": [...], "viewport": {...} }. Validated by the server before saving.',
			},
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				description: 'New name (update only; on create use the Name field above)',
			},
			{
				displayName: 'Pipeline ID',
				name: 'pipelineId',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Schedule Config (JSON)',
				name: 'scheduleConfig',
				type: 'json',
				default: '{}',
				description: 'Cadence of a scheduled automation',
			},
			{
				displayName: 'Trigger (JSON)',
				name: 'trigger',
				type: 'json',
				default: '{}',
				description: 'Legacy trigger object',
			},
			{
				displayName: 'Trigger Type',
				name: 'triggerType',
				type: 'options',
				options: [
					{ name: 'Event', value: 'event' },
					{ name: 'Manual', value: 'manual' },
					{ name: 'Scheduled', value: 'scheduled' },
					{ name: 'Webhook', value: 'webhook' },
				],
				default: 'event',
			},
		],
	},

	// ── Execute / Dry Run context ────────────────────────────────────────
	{
		displayName: 'Context',
		name: 'executionContext',
		type: 'collection',
		placeholder: 'Add Context',
		displayOptions: {
			show: {
				resource: ['pipelineAutomation'],
				operation: ['execute', 'dryRun'],
			},
		},
		default: {},
		description: 'Optional record the run acts on. A conversation takes precedence over a contact.',
		options: [
			{
				displayName: 'Contact ID',
				name: 'contactId',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Conversation ID',
				name: 'conversationId',
				type: 'string',
				default: '',
			},
		],
	},

	// ── Executions / audit logs (limit + offset pagination, max 200) ─────
	{
		displayName: 'Limit',
		name: 'automationLimit',
		type: 'number',
		typeOptions: { minValue: 1, maxValue: 200 },
		displayOptions: {
			show: {
				resource: ['pipelineAutomation'],
				operation: ['getExecutions', 'getAllExecutions', 'getAuditLogs', 'getAllAuditLogs'],
			},
		},
		default: 50,
		description: 'Max number of results to return',
	},
	{
		displayName: 'Offset',
		name: 'automationOffset',
		type: 'number',
		typeOptions: { minValue: 0 },
		displayOptions: {
			show: {
				resource: ['pipelineAutomation'],
				operation: ['getExecutions', 'getAllExecutions', 'getAuditLogs', 'getAllAuditLogs'],
			},
		},
		default: 0,
		description: 'Number of records to skip. The response meta carries total, limit and offset.',
	},
	{
		displayName: 'Status',
		name: 'executionStatus',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['pipelineAutomation'],
				operation: ['getExecutions', 'getAllExecutions'],
			},
		},
		options: [
			{ name: 'All', value: '' },
			{ name: 'Cancelled', value: 'cancelled' },
			{ name: 'Completed', value: 'completed' },
			{ name: 'Failed', value: 'failed' },
			{ name: 'Pending', value: 'pending' },
			{ name: 'Running', value: 'running' },
		],
		default: '',
	},
	{
		displayName: 'Filters',
		name: 'auditLogFilters',
		type: 'collection',
		placeholder: 'Add Filter',
		displayOptions: {
			show: {
				resource: ['pipelineAutomation'],
				operation: ['getAllAuditLogs'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Action',
				name: 'auditAction',
				type: 'options',
				options: [
					{ name: 'Activate', value: 'activate' },
					{ name: 'Create', value: 'create' },
					{ name: 'Deactivate', value: 'deactivate' },
					{ name: 'Delete', value: 'delete' },
					{ name: 'Duplicate', value: 'duplicate' },
					{ name: 'Execute', value: 'execute' },
					{ name: 'Export', value: 'export' },
					{ name: 'Import', value: 'import' },
					{ name: 'Rotate Webhook Token', value: 'rotate_webhook_token' },
					{ name: 'Update', value: 'update' },
				],
				default: 'update',
			},
			{
				displayName: 'Since',
				name: 'since',
				type: 'string',
				default: '',
				placeholder: 'YYYY-MM-DD',
			},
			{
				displayName: 'Until',
				name: 'until',
				type: 'string',
				default: '',
				placeholder: 'YYYY-MM-DD',
			},
			{
				displayName: 'User ID',
				name: 'userId',
				type: 'string',
				default: '',
			},
		],
	},

	// ── Import ───────────────────────────────────────────────────────────
	{
		displayName: 'Automation JSON',
		name: 'importData',
		type: 'json',
		required: true,
		displayOptions: {
			show: {
				resource: ['pipelineAutomation'],
				operation: ['import'],
			},
		},
		default: '{}',
		description: 'The object returned by Export (with its "automation" key) or the automation object itself. Max 1 MB.',
	},

	// ── Templates ────────────────────────────────────────────────────────
	{
		displayName: 'Filters',
		name: 'templateFilters',
		type: 'collection',
		placeholder: 'Add Filter',
		displayOptions: {
			show: {
				resource: ['pipelineAutomation'],
				operation: ['getTemplates'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Category',
				name: 'category',
				type: 'string',
				default: '',
				description: 'Category key, as returned by Get Template Categories',
			},
			{
				displayName: 'Featured Only',
				name: 'featured',
				type: 'boolean',
				default: false,
				description: 'Whether to return only featured templates',
			},
			{
				displayName: 'Locale',
				name: 'locale',
				type: 'string',
				default: '',
				placeholder: 'pt-BR',
				description: 'Template locale. The server defaults to pt-BR.',
			},
			{
				displayName: 'Order',
				name: 'order',
				type: 'options',
				options: [
					{ name: 'Featured First', value: 'featured' },
					{ name: 'Most Popular', value: 'popular' },
				],
				default: 'featured',
			},
		],
	},
	{
		displayName: 'Name',
		name: 'templateAutomationName',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['pipelineAutomation'],
				operation: ['createFromTemplate'],
			},
		},
		default: '',
		description: 'Name of the new automation. Leave empty to keep the template name.',
	},
];
