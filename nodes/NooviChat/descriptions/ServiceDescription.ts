import { INodeProperties } from 'n8n-workflow';

export const ServiceOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['service'],
			},
		},
		options: [
			{ name: 'Create', value: 'create', action: 'Create a service' },
			{ name: 'Get', value: 'get', action: 'Get a service' },
			{ name: 'Get Many', value: 'list', action: 'Get many services' },
			{ name: 'Update', value: 'update', action: 'Update a service' },
			{ name: 'Delete', value: 'delete', action: 'Delete (soft) a service' },
			{ name: 'List Reminder Templates', value: 'listReminders', action: 'List reminder templates for a service' },
			{ name: 'Create Reminder Template', value: 'createReminder', action: 'Create a reminder template for a service' },
			{ name: 'Update Reminder Template', value: 'updateReminder', action: 'Update a reminder template' },
			{ name: 'Delete Reminder Template', value: 'deleteReminder', action: 'Delete a reminder template' },
		],
		default: 'list',
	},
];

export const ServiceFields: INodeProperties[] = [
	// --- Shared: Service ID ---
	{
		displayName: 'Service ID',
		name: 'serviceId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['service'],
				operation: ['get', 'update', 'delete', 'listReminders', 'createReminder', 'updateReminder', 'deleteReminder'],
			},
		},
		default: '',
		placeholder: 'e.g., 3',
		description: 'ID of the service',
	},

	// --- Reminder Template ID ---
	{
		displayName: 'Reminder Template ID',
		name: 'reminderTemplateId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['service'],
				operation: ['updateReminder', 'deleteReminder'],
			},
		},
		default: '',
		placeholder: 'e.g., 7',
		description: 'ID of the reminder template',
	},

	// --- Create ---
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['service'],
				operation: ['create'],
			},
		},
		default: '',
		placeholder: 'e.g., Clareamento Dental',
		description: 'Name of the service',
	},
	{
		displayName: 'Duration (Minutes)',
		name: 'durationMinutes',
		type: 'number',
		required: true,
		displayOptions: {
			show: {
				resource: ['service'],
				operation: ['create'],
			},
		},
		default: 60,
		typeOptions: { minValue: 5 },
		description: 'Duration of the service in minutes',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		displayOptions: {
			show: {
				resource: ['service'],
				operation: ['create'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				description: 'Description of the service visible to clients',
				typeOptions: { rows: 3 },
			},
			{
				displayName: 'Default Price (in cents)',
				name: 'defaultPriceCents',
				type: 'number',
				default: 0,
				typeOptions: { minValue: 0 },
				description: 'Default price in the smallest currency unit (e.g., 25000 = R$ 250,00)',
			},
			{
				displayName: 'Currency',
				name: 'currency',
				type: 'string',
				default: 'BRL',
				placeholder: 'e.g., BRL',
				description: 'ISO 4217 currency code (e.g., BRL, USD)',
			},
			{
				displayName: 'Color',
				name: 'color',
				type: 'color',
				default: '#6366f1',
				description: 'Color used to identify this service in the calendar',
			},
			{
				displayName: 'Available Online',
				name: 'onlineAvailable',
				type: 'boolean',
				default: false,
				description: 'Whether clients can book this service online via the public booking widget',
			},
		],
	},

	// --- Update ---
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		displayOptions: {
			show: {
				resource: ['service'],
				operation: ['update'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				description: 'Name of the service',
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				description: 'Description of the service',
				typeOptions: { rows: 3 },
			},
			{
				displayName: 'Duration (Minutes)',
				name: 'durationMinutes',
				type: 'number',
				default: 60,
				typeOptions: { minValue: 5 },
				description: 'Duration of the service in minutes',
			},
			{
				displayName: 'Default Price (in cents)',
				name: 'defaultPriceCents',
				type: 'number',
				default: 0,
				typeOptions: { minValue: 0 },
				description: 'Default price in the smallest currency unit',
			},
			{
				displayName: 'Currency',
				name: 'currency',
				type: 'string',
				default: 'BRL',
				description: 'ISO 4217 currency code',
			},
			{
				displayName: 'Color',
				name: 'color',
				type: 'color',
				default: '#6366f1',
				description: 'Color used to identify this service in the calendar',
			},
			{
				displayName: 'Available Online',
				name: 'onlineAvailable',
				type: 'boolean',
				default: false,
				description: 'Whether clients can book this service online',
			},
		],
	},

	// --- Create Reminder Template ---
	{
		displayName: 'Label',
		name: 'reminderLabel',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['service'],
				operation: ['createReminder'],
			},
		},
		default: '',
		placeholder: 'e.g., 1 dia antes',
		description: 'Human-readable label for this reminder template',
	},
	{
		displayName: 'Days Before',
		name: 'daysBefore',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['service'],
				operation: ['createReminder'],
			},
		},
		default: 0,
		typeOptions: { minValue: 0 },
		description: 'Number of days before the appointment to send the reminder',
	},
	{
		displayName: 'Hours Before',
		name: 'hoursBefore',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['service'],
				operation: ['createReminder'],
			},
		},
		default: 0,
		typeOptions: { minValue: 0 },
		description: 'Number of hours before the appointment to send the reminder',
	},
	{
		displayName: 'Minutes Before',
		name: 'minutesBefore',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['service'],
				operation: ['createReminder'],
			},
		},
		default: 0,
		typeOptions: { minValue: 0 },
		description: 'Number of minutes before the appointment to send the reminder',
	},
	{
		displayName: 'Message Template',
		name: 'bodyTemplate',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['service'],
				operation: ['createReminder'],
			},
		},
		default: '',
		placeholder: 'e.g., Olá {{paciente}}, lembrete: sua consulta com {{profissional}} é amanhã às {{hora}}.',
		description: 'Message body with Liquid template variables. Available: {{paciente}}, {{profissional}}, {{servico}}, {{data}}, {{hora}}, {{duracao}}, {{valor}}, {{empresa}}',
		typeOptions: { rows: 4 },
	},
	{
		displayName: 'Send Via',
		name: 'sendVia',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['service'],
				operation: ['createReminder'],
			},
		},
		options: [
			{ name: 'WhatsApp', value: 'whatsapp' },
			{ name: 'Email', value: 'email' },
			{ name: 'SMS', value: 'sms' },
		],
		default: 'whatsapp',
		description: 'Channel through which the reminder will be sent',
	},

	// --- Update Reminder Template ---
	{
		displayName: 'Update Fields',
		name: 'reminderUpdateFields',
		type: 'collection',
		placeholder: 'Add Field',
		displayOptions: {
			show: {
				resource: ['service'],
				operation: ['updateReminder'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Label',
				name: 'label',
				type: 'string',
				default: '',
				description: 'Human-readable label for this reminder template',
			},
			{
				displayName: 'Days Before',
				name: 'daysBefore',
				type: 'number',
				default: 0,
				typeOptions: { minValue: 0 },
				description: 'Number of days before the appointment to send the reminder',
			},
			{
				displayName: 'Hours Before',
				name: 'hoursBefore',
				type: 'number',
				default: 0,
				typeOptions: { minValue: 0 },
				description: 'Number of hours before the appointment to send the reminder',
			},
			{
				displayName: 'Minutes Before',
				name: 'minutesBefore',
				type: 'number',
				default: 0,
				typeOptions: { minValue: 0 },
				description: 'Number of minutes before the appointment to send the reminder',
			},
			{
				displayName: 'Message Template',
				name: 'bodyTemplate',
				type: 'string',
				default: '',
				description: 'Message body with Liquid template variables',
				typeOptions: { rows: 4 },
			},
			{
				displayName: 'Send Via',
				name: 'sendVia',
				type: 'options',
				options: [
					{ name: 'WhatsApp', value: 'whatsapp' },
					{ name: 'Email', value: 'email' },
					{ name: 'SMS', value: 'sms' },
				],
				default: 'whatsapp',
				description: 'Channel through which the reminder will be sent',
			},
			{
				displayName: 'Active',
				name: 'active',
				type: 'boolean',
				default: true,
				description: 'Whether this reminder template is active',
			},
		],
	},
];
