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
		description: 'ID da regra',
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
		description: 'Nome da regra',
	},
	{
		displayName: 'Score',
		name: 'score',
		type: 'number',
		required: true,
		displayOptions: {
			show: {
				resource: ['leadScoring'],
				operation: ['createRule', 'updateRule'],
			},
		},
		default: 0,
		description: 'Pontuação da regra',
	},
	{
		displayName: 'Condition Type',
		name: 'conditionType',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['leadScoring'],
				operation: ['createRule', 'updateRule'],
			},
		},
		options: [
			{ name: 'Contact Attribute', value: 'contact_attribute' },
			{ name: 'Conversation Event', value: 'conversation_event' },
			{ name: 'Deal Stage', value: 'deal_stage' },
		],
		default: 'contact_attribute',
		description: 'Tipo de condição',
	},
	{
		displayName: 'Condition Value',
		name: 'conditionValue',
		type: 'json',
		displayOptions: {
			show: {
				resource: ['leadScoring'],
				operation: ['createRule', 'updateRule'],
			},
		},
		default: '{}',
		description: 'Valores da condição em JSON',
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
		description: 'Retornar todos os resultados ou limite',
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
		description: 'Número máximo de resultados',
	},
];