import { INodeProperties } from 'n8n-workflow';

// Account-level follow-up automations (FollowUpAutomationsController, body wrapper
// `follow_up_automation`) and pipeline stage follow-up rules
// (PipelineFollowUpRulesController, body wrapper `pipeline_follow_up_rule`).
// Routes: /api/v1/accounts/:account_id/follow-up-automations[/:id]
//         /api/v1/accounts/:account_id/pipelines/:pipeline_id/follow-up-rules[/:id]
// Neither list is paginated: both answer { payload: [...] } with every record.

const SEND_WINDOW_DESCRIPTION =
	'Optional send window, e.g. {"enabled": true, "days": [1,2,3,4,5], "start": "08:00", "end": "18:00"} (days: 0 = Sunday … 6 = Saturday, account timezone). Follow-ups due outside it wait for the next opening. {} = no restriction.';

export const FollowUpAutomationOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['followUpAutomation'],
			},
		},
		options: [
			{ name: 'Create', value: 'create', action: 'Create a follow up automation' },
			{ name: 'Get', value: 'get', action: 'Get a follow up automation' },
			{ name: 'Get Many', value: 'getAll', action: 'Get many follow up automations' },
			{ name: 'Update', value: 'update', action: 'Update a follow up automation' },
			{ name: 'Delete', value: 'delete', action: 'Delete a follow up automation' },
		],
		default: 'getAll',
	},
];

export const FollowUpAutomationFields: INodeProperties[] = [
	{
		displayName: 'Automation ID',
		name: 'followUpAutomationId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['followUpAutomation'],
				operation: ['get', 'update', 'delete'],
			},
		},
		default: '',
	},
	{
		displayName: 'Name',
		name: 'followUpAutomationName',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['followUpAutomation'],
				operation: ['create'],
			},
		},
		default: '',
	},
	{
		displayName: 'Trigger Type',
		name: 'followUpTriggerType',
		type: 'options',
		required: true,
		displayOptions: {
			show: {
				resource: ['followUpAutomation'],
				operation: ['create'],
			},
		},
		options: [
			{ name: 'Contact Created', value: 'contact_created' },
			{ name: 'Conversation Created', value: 'conversation_created' },
			{ name: 'Conversation Inactivity', value: 'conversation_inactivity' },
			{ name: 'Conversation Resolved', value: 'conversation_resolved' },
			{ name: 'Label Added', value: 'label_added' },
			{ name: 'Label Removed', value: 'label_removed' },
		],
		default: 'conversation_resolved',
	},
	{
		displayName: 'Additional Fields',
		name: 'followUpAutomationFields',
		type: 'collection',
		placeholder: 'Add Field',
		displayOptions: {
			show: {
				resource: ['followUpAutomation'],
				operation: ['create', 'update'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'AI Instruction',
				name: 'aiInstruction',
				type: 'string',
				default: '',
				typeOptions: { rows: 3 },
				description: 'Instruction used to write the message. Required when Content Mode is AI.',
			},
			{
				displayName: 'Conditions (JSON)',
				name: 'conditions',
				type: 'json',
				default: '{}',
			},
			{
				displayName: 'Content Mode',
				name: 'contentMode',
				type: 'options',
				options: [
					{ name: 'Template', value: 'template' },
					{ name: 'AI', value: 'ai' },
				],
				default: 'template',
				description: 'Render a follow-up template, or have Noovi AI write the message at send time',
			},
			{
				displayName: 'Delay (Minutes)',
				name: 'delayMinutes',
				type: 'number',
				default: 60,
			},
			{
				displayName: 'Enabled',
				name: 'enabled',
				type: 'boolean',
				default: true,
				description: 'Whether the automation is enabled',
			},
			{
				displayName: 'Follow-up Template ID',
				name: 'followUpTemplateId',
				type: 'string',
				default: '',
				description: 'Required on create when Content Mode is Template',
			},
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				description: 'New name (update only; on create use the Name field above)',
			},
			{
				displayName: 'Send Window (JSON)',
				name: 'sendWindow',
				type: 'json',
				default: '{}',
				description: SEND_WINDOW_DESCRIPTION,
			},
			{
				displayName: 'Trigger Config (JSON)',
				name: 'triggerConfig',
				type: 'json',
				default: '{}',
				description: 'Trigger options, e.g. the label of a label trigger',
			},
			{
				displayName: 'Trigger Type',
				name: 'triggerType',
				type: 'options',
				options: [
					{ name: 'Contact Created', value: 'contact_created' },
					{ name: 'Conversation Created', value: 'conversation_created' },
					{ name: 'Conversation Inactivity', value: 'conversation_inactivity' },
					{ name: 'Conversation Resolved', value: 'conversation_resolved' },
					{ name: 'Label Added', value: 'label_added' },
					{ name: 'Label Removed', value: 'label_removed' },
				],
				default: 'conversation_resolved',
				description: 'New trigger type (update only)',
			},
		],
	},
];

export const PipelineFollowUpRuleOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['pipelineFollowUpRule'],
			},
		},
		options: [
			{ name: 'Create', value: 'create', action: 'Create a pipeline follow up rule' },
			{ name: 'Get', value: 'get', action: 'Get a pipeline follow up rule' },
			{ name: 'Get Many', value: 'getAll', action: 'Get many pipeline follow up rules' },
			{ name: 'Update', value: 'update', action: 'Update a pipeline follow up rule' },
			{ name: 'Delete', value: 'delete', action: 'Delete a pipeline follow up rule' },
		],
		default: 'getAll',
	},
];

export const PipelineFollowUpRuleFields: INodeProperties[] = [
	{
		displayName: 'Pipeline ID',
		name: 'rulePipelineId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['pipelineFollowUpRule'],
			},
		},
		default: '',
		description: 'ID of the pipeline the rule belongs to',
	},
	{
		displayName: 'Rule ID',
		name: 'followUpRuleId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['pipelineFollowUpRule'],
				operation: ['get', 'update', 'delete'],
			},
		},
		default: '',
	},
	{
		displayName: 'To Stage',
		name: 'ruleToStage',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['pipelineFollowUpRule'],
				operation: ['create'],
			},
		},
		default: '',
		placeholder: 'e.g., 3_proposal',
		description: 'Stage key that fires the rule when a card enters it',
	},
	{
		displayName: 'Additional Fields',
		name: 'ruleFields',
		type: 'collection',
		placeholder: 'Add Field',
		displayOptions: {
			show: {
				resource: ['pipelineFollowUpRule'],
				operation: ['create', 'update'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'AI Instruction',
				name: 'aiInstruction',
				type: 'string',
				default: '',
				typeOptions: { rows: 3 },
				description: 'Instruction used to write the message. Required when Content Mode is AI.',
			},
			{
				displayName: 'Conditions (JSON)',
				name: 'conditions',
				type: 'json',
				default: '{}',
			},
			{
				displayName: 'Content Mode',
				name: 'contentMode',
				type: 'options',
				options: [
					{ name: 'Template', value: 'template' },
					{ name: 'AI', value: 'ai' },
				],
				default: 'template',
			},
			{
				displayName: 'Delay (Minutes)',
				name: 'delayMinutes',
				type: 'number',
				default: 60,
			},
			{
				displayName: 'Enabled',
				name: 'enabled',
				type: 'boolean',
				default: true,
				description: 'Whether the rule is enabled',
			},
			{
				displayName: 'Follow-up Template ID',
				name: 'followUpTemplateId',
				type: 'string',
				default: '',
				description: 'Required on create when Content Mode is Template',
			},
			{
				displayName: 'From Stage',
				name: 'fromStage',
				type: 'string',
				default: '',
				description: 'Only fire when the card comes from this stage key',
			},
			{
				displayName: 'Send Window (JSON)',
				name: 'sendWindow',
				type: 'json',
				default: '{}',
				description: SEND_WINDOW_DESCRIPTION,
			},
			{
				displayName: 'Sender Agent Bot ID',
				name: 'senderAgentBotId',
				type: 'string',
				default: '',
				description: 'Agent bot shown as the sender of the follow-up',
			},
			{
				displayName: 'Sender ID',
				name: 'senderId',
				type: 'string',
				default: '',
				description: 'Agent shown as the sender of the follow-up',
			},
			{
				displayName: 'To Stage',
				name: 'toStage',
				type: 'string',
				default: '',
				description: 'New target stage key (update only)',
			},
		],
	},
];
