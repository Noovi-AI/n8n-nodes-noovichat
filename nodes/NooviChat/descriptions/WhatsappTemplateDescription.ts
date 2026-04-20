import { INodeProperties } from 'n8n-workflow';

// NooviChat custom — CRUD de WhatsApp Cloud templates (Meta Graph API).
// Feature exclusiva NooviChat (Chatwoot upstream tem apenas sync read-only).
// Endpoint: /api/v1/accounts/:account_id/whatsapp_templates(+/sync)
//
// Pré-requisitos no backend:
//   - Inbox com Channel::Whatsapp + provider: whatsapp_cloud
//   - provider_config.api_key + business_account_id válidos
//   - Token agente com role administrator (para operações de escrita)

export const WhatsappTemplateOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['whatsappTemplate'],
			},
		},
		options: [
			{
				name: 'List',
				value: 'list',
				action: 'List whatsapp templates',
				description: 'List templates of a WhatsApp Cloud inbox',
			},
			{
				name: 'Get',
				value: 'get',
				action: 'Get a whatsapp template',
				description: 'Retrieve a specific template by Meta ID',
			},
			{
				name: 'Create',
				value: 'create',
				action: 'Create a whatsapp template',
				description: 'Submit a new template to Meta for approval (admin only)',
			},
			{
				name: 'Update',
				value: 'update',
				action: 'Update a whatsapp template',
				description: 'Edit category or components of an existing template (admin only)',
			},
			{
				name: 'Delete',
				value: 'delete',
				action: 'Delete a whatsapp template',
				description: 'Remove a template by name (admin only)',
			},
			{
				name: 'Sync',
				value: 'sync',
				action: 'Sync whatsapp templates',
				description: 'Trigger resync of local cache with Meta (admin only)',
			},
		],
		default: 'list',
	},
];

export const WhatsappTemplateFields: INodeProperties[] = [
	// inbox_id — sempre obrigatório em TODAS as operações
	{
		displayName: 'Inbox ID',
		name: 'inboxId',
		type: 'number',
		required: true,
		default: 0,
		typeOptions: { minValue: 1 },
		displayOptions: {
			show: {
				resource: ['whatsappTemplate'],
			},
		},
		description: 'ID of the WhatsApp Cloud inbox (must have provider=whatsapp_cloud)',
	},

	// Template ID (Meta) — para get/update
	{
		displayName: 'Template ID',
		name: 'templateId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['whatsappTemplate'],
				operation: ['get', 'update'],
			},
		},
		description: 'Meta template ID returned by the create operation',
	},

	// Template Name — para delete (Meta exige nome, não ID)
	{
		displayName: 'Template Name',
		name: 'templateName',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'e.g., welcome_marketing',
		displayOptions: {
			show: {
				resource: ['whatsappTemplate'],
				operation: ['delete'],
			},
		},
		description: 'Name of the template to delete (lowercase alphanumeric + underscores)',
	},

	// Filters — para list
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: {
			show: {
				resource: ['whatsappTemplate'],
				operation: ['list'],
			},
		},
		options: [
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				options: [
					{ name: 'Approved', value: 'APPROVED' },
					{ name: 'Pending', value: 'PENDING' },
					{ name: 'Rejected', value: 'REJECTED' },
					{ name: 'In Appeal', value: 'IN_APPEAL' },
				],
				default: 'APPROVED',
			},
			{
				displayName: 'Category',
				name: 'category',
				type: 'options',
				options: [
					{ name: 'Marketing', value: 'MARKETING' },
					{ name: 'Utility', value: 'UTILITY' },
					{ name: 'Authentication', value: 'AUTHENTICATION' },
				],
				default: 'MARKETING',
			},
			{
				displayName: 'Search',
				name: 'search',
				type: 'string',
				default: '',
				description: 'Fulltext search in template name/content',
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				typeOptions: { minValue: 1, maxValue: 100 },
				default: 100,
			},
		],
	},

	// Template data — para create
	{
		displayName: 'Name',
		name: 'templateDataName',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'e.g., welcome_marketing',
		displayOptions: {
			show: {
				resource: ['whatsappTemplate'],
				operation: ['create'],
			},
		},
		description: 'Unique name (lowercase alphanumeric + underscores, max 512 chars)',
	},
	{
		displayName: 'Language',
		name: 'templateDataLanguage',
		type: 'string',
		required: true,
		default: 'pt_BR',
		placeholder: 'e.g., pt_BR, en_US, es_ES',
		displayOptions: {
			show: {
				resource: ['whatsappTemplate'],
				operation: ['create'],
			},
		},
		description: 'BCP-47 language code (2 lowercase letters, optional _2 uppercase letters)',
	},
	{
		displayName: 'Category',
		name: 'templateDataCategory',
		type: 'options',
		required: true,
		options: [
			{ name: 'Marketing', value: 'MARKETING' },
			{ name: 'Utility', value: 'UTILITY' },
			{ name: 'Authentication', value: 'AUTHENTICATION' },
		],
		default: 'UTILITY',
		displayOptions: {
			show: {
				resource: ['whatsappTemplate'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Components (JSON)',
		name: 'templateDataComponents',
		type: 'json',
		required: true,
		default: '[\n  {\n    "type": "BODY",\n    "text": "Olá {{1}}, seja bem-vindo!"\n  }\n]',
		displayOptions: {
			show: {
				resource: ['whatsappTemplate'],
				operation: ['create'],
			},
		},
		description:
			'Array of Meta-compatible components (HEADER, BODY, FOOTER, BUTTONS). See Meta docs.',
	},

	// Template update fields — category and/or components
	{
		displayName: 'Update Fields',
		name: 'templateUpdateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['whatsappTemplate'],
				operation: ['update'],
			},
		},
		options: [
			{
				displayName: 'Category',
				name: 'category',
				type: 'options',
				options: [
					{ name: 'Marketing', value: 'MARKETING' },
					{ name: 'Utility', value: 'UTILITY' },
					{ name: 'Authentication', value: 'AUTHENTICATION' },
				],
				default: 'UTILITY',
			},
			{
				displayName: 'Components (JSON)',
				name: 'components',
				type: 'json',
				default: '[]',
				description: 'Replacement components array',
			},
		],
	},
];
