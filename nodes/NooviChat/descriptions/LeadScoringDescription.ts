import { INodeProperties } from 'n8n-workflow';

export const LeadScoringResource: INodeProperties[] = [
	{
		displayName: 'Resource',
		name: 'resource',
		type: 'options',
		noDataExpression: true,
		options: [
			{ name: 'Lead Scoring', value: 'leadScoring' },
		],
		default: 'leadScoring',
	},
];

export const LeadScoringOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['leadScoring'],
			},
		},
		options: [
			{ name: 'Create Rule', value: 'createRule', action: 'Create a lead scoring rule' },
			{ name: 'Get Rule', value: 'getRule', action: 'Get a lead scoring rule' },
			{ name: 'Get Many Rules', value: 'getAllRules', action: 'Get many lead scoring rules' },
			{ name: 'Update Rule', value: 'updateRule', action: 'Update a lead scoring rule' },
			{ name: 'Delete Rule', value: 'deleteRule', action: 'Delete a lead scoring rule' },
			{ name: 'Create Default Rules', value: 'createDefaultRules', action: 'Create default rules' },
			{ name: 'Get Dashboard', value: 'getDashboard', action: 'Get lead scoring dashboard' },
			{ name: 'Get Distribution Report', value: 'getDistributionReport', action: 'Get the lead score distribution report' },
			{ name: 'Get Trends', value: 'getTrends', action: 'Get lead score trends' },
			{ name: 'Get Top Leads', value: 'getTopLeads', action: 'Get the top scored leads' },
			{ name: 'Get Category Changes', value: 'getCategoryChanges', action: 'Get recent lead category changes' },
			{
				name: 'Get Card Score Distribution',
				value: 'getCardScoreDistribution',
				action: 'Get the hot warm cold count of cards',
				description: 'Current hot / warm / cold count and average score of the cards in the pipelines you can see',
			},
			{
				name: 'Bulk Recalculate',
				value: 'bulkRecalculate',
				action: 'Recalculate every lead score in the background',
				description: 'Queue a background recalculation of every lead score of the account. Answers 202 immediately.',
			},
			{ name: 'Get Many Logs', value: 'getLogs', action: 'Get many lead score logs' },
			{ name: 'Get Log', value: 'getLog', action: 'Get a lead score log' },
		],
		default: 'getAllRules',
	},
];

export const LeadScoringFields: INodeProperties[] = [
	{
		displayName: 'Rule ID',
		name: 'ruleId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['leadScoring'],
				operation: ['getRule', 'updateRule', 'deleteRule'],
			},
		},
		default: '',
		description: 'ID of the rule',
	},

	// Create rule fields
	{
		displayName: 'Rule Name',
		name: 'ruleName',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['leadScoring'],
				operation: ['createRule'],
			},
		},
		default: '',
		description: 'Name of the rule',
	},
	{
		displayName: 'Points',
		name: 'points',
		type: 'number',
		required: true,
		displayOptions: {
			show: {
				resource: ['leadScoring'],
				operation: ['createRule', 'updateRule'],
			},
		},
		default: 10,
		typeOptions: { minValue: -100, maxValue: 100 },
		description: 'Points awarded (positive) or deducted (negative) when this rule matches',
	},
	{
		displayName: 'Event Type',
		name: 'eventType',
		type: 'options',
		required: true,
		displayOptions: {
			show: {
				resource: ['leadScoring'],
				operation: ['createRule', 'updateRule'],
			},
		},
		options: [
			{ name: 'Message Received', value: 'message_received' },
			{ name: 'Message Sent', value: 'message_sent' },
			{ name: 'First Response', value: 'first_response' },
			{ name: 'Stage Changed', value: 'stage_changed' },
			{ name: 'Card Created', value: 'card_created' },
			{ name: 'Card Assigned', value: 'card_assigned' },
			{ name: 'Label Added', value: 'label_added' },
			{ name: 'Label Removed', value: 'label_removed' },
			{ name: 'Conversation Opened', value: 'conversation_opened' },
			{ name: 'Conversation Resolved', value: 'conversation_resolved' },
			{ name: 'Conversation Reopened', value: 'conversation_reopened' },
			{ name: 'Contact Profile Updated', value: 'contact_profile_updated' },
			{ name: 'Contact Email Added', value: 'contact_email_added' },
			{ name: 'Contact Phone Added', value: 'contact_phone_added' },
			{ name: 'Agent Assigned', value: 'agent_assigned' },
			{ name: 'Agent Replied', value: 'agent_replied' },
			{ name: 'Custom Event', value: 'custom_event' },
		],
		default: 'message_received',
		description: 'Event that triggers this scoring rule',
	},
	{
		displayName: 'Conditions',
		name: 'conditions',
		type: 'json',
		displayOptions: {
			show: {
				resource: ['leadScoring'],
				operation: ['createRule', 'updateRule'],
			},
		},
		default: '{}',
		description: 'Optional conditions to filter when the rule applies. Example: {"stage_id": 5, "pipeline_id": {"operator": "eq", "value": 10}}',
	},

	// Get Many options
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['leadScoring'],
				operation: ['getAllRules', 'getLogs'],
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
				resource: ['leadScoring'],
				operation: ['getAllRules', 'getLogs'],
				returnAll: [false],
			},
		},
		default: 50,
		description: 'Maximum number of results to return',
	},

	// ── Reports (LeadScore::ReportsController) ───────────────────────────
	// Dates are strict YYYY-MM-DD in the account timezone; omitted = last 30 days.
	{
		displayName: 'Start Date',
		name: 'reportStartDate',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['leadScoring'],
				operation: ['getDashboard', 'getDistributionReport', 'getTrends', 'getTopLeads', 'getCategoryChanges'],
			},
		},
		default: '',
		placeholder: 'YYYY-MM-DD',
		description: 'Start of the period (account timezone). Defaults to 30 days ago.',
	},
	{
		displayName: 'End Date',
		name: 'reportEndDate',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['leadScoring'],
				operation: ['getDashboard', 'getDistributionReport', 'getTrends', 'getTopLeads', 'getCategoryChanges'],
			},
		},
		default: '',
		placeholder: 'YYYY-MM-DD',
		description: 'End of the period (account timezone). Defaults to today.',
	},
	{
		displayName: 'Limit',
		name: 'reportLimit',
		type: 'number',
		typeOptions: { minValue: 1, maxValue: 100 },
		displayOptions: {
			show: {
				resource: ['leadScoring'],
				operation: ['getTopLeads', 'getCategoryChanges'],
			},
		},
		default: 10,
		description: 'Maximum number of rows (the server clamps it to 1–100)',
	},

	// ── Logs (LeadScore::LogsController) ─────────────────────────────────
	{
		displayName: 'Log ID',
		name: 'logId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['leadScoring'],
				operation: ['getLog'],
			},
		},
		default: '',
	},
	{
		displayName: 'Filters',
		name: 'logFilters',
		type: 'collection',
		placeholder: 'Add Filter',
		displayOptions: {
			show: {
				resource: ['leadScoring'],
				operation: ['getLogs'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Category Changes Only',
				name: 'categoryChangesOnly',
				type: 'boolean',
				default: false,
				description: 'Whether to return only the logs where the lead category changed',
			},
			{
				displayName: 'End Date',
				name: 'endDate',
				type: 'string',
				default: '',
				placeholder: 'YYYY-MM-DD',
			},
			{
				displayName: 'Event Type',
				name: 'eventType',
				type: 'string',
				default: '',
				placeholder: 'e.g., message_received',
			},
			{
				displayName: 'Pipeline Card ID',
				name: 'pipelineCardId',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Start Date',
				name: 'startDate',
				type: 'string',
				default: '',
				placeholder: 'YYYY-MM-DD',
			},
		],
	},
];