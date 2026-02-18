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
				operation: ['getAllRules'],
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
				operation: ['getAllRules'],
				returnAll: [false],
			},
		},
		default: 50,
		description: 'Maximum number of results to return',
	},
];