import { INodeProperties } from 'n8n-workflow';

export const ProfessionalOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['professional'],
			},
		},
		options: [
			{ name: 'Create', value: 'create', action: 'Create a professional' },
			{ name: 'Get', value: 'get', action: 'Get a professional' },
			{ name: 'Get Many', value: 'list', action: 'Get many professionals' },
			{ name: 'Update', value: 'update', action: 'Update a professional' },
			{ name: 'Delete', value: 'delete', action: 'Delete (soft) a professional' },
			{ name: 'Get Availability', value: 'availability', action: 'Get professional availability for a date' },
		],
		default: 'list',
	},
];

export const ProfessionalFields: INodeProperties[] = [
	// --- Shared: Professional ID ---
	{
		displayName: 'Professional ID',
		name: 'professionalId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['professional'],
				operation: ['get', 'update', 'delete'],
			},
		},
		default: '',
		placeholder: 'e.g., 5',
		description: 'ID of the professional',
	},

	// --- Create ---
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['professional'],
				operation: ['create'],
			},
		},
		default: '',
		placeholder: 'e.g., Dr. Maria Silva',
		description: 'Full name of the professional',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		displayOptions: {
			show: {
				resource: ['professional'],
				operation: ['create'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Specialty',
				name: 'specialty',
				type: 'string',
				default: '',
				placeholder: 'e.g., Cirurgiã Dentista',
				description: 'Professional specialty or title',
			},
			{
				displayName: 'Registry',
				name: 'registry',
				type: 'string',
				default: '',
				placeholder: 'e.g., CRM 12345 / CRO 5678',
				description: 'Professional registry number (CRM, CRO, OAB, CREA, etc.)',
			},
			{
				displayName: 'Email',
				name: 'email',
				type: 'string',
				default: '',
				placeholder: 'e.g., dr.maria@clinic.com',
				description: 'Email address of the professional',
			},
			{
				displayName: 'Phone',
				name: 'phone',
				type: 'string',
				default: '',
				placeholder: 'e.g., +55 11 99999-0000',
				description: 'Phone number of the professional',
			},
			{
				displayName: 'Color',
				name: 'color',
				type: 'color',
				default: '#6366f1',
				description: 'Color used to identify this professional in the calendar',
			},
			{
				displayName: 'Buffer Between Appointments (Minutes)',
				name: 'bufferMinutes',
				type: 'number',
				default: 0,
				typeOptions: { minValue: 0 },
				description: 'Minimum gap in minutes between consecutive appointments',
			},
			{
				displayName: 'Working Hours (JSON)',
				name: 'workingHours',
				type: 'json',
				default: '{}',
				description: 'Working hours per day as JSON. Example: {"monday":{"start":"08:00","end":"18:00"},"tuesday":{"start":"08:00","end":"18:00"}}',
				hint: 'Use day names in lowercase as keys. Each value must have "start" and "end" in HH:MM format.',
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
				resource: ['professional'],
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
				description: 'Full name of the professional',
			},
			{
				displayName: 'Specialty',
				name: 'specialty',
				type: 'string',
				default: '',
				description: 'Professional specialty or title',
			},
			{
				displayName: 'Registry',
				name: 'registry',
				type: 'string',
				default: '',
				description: 'Professional registry number',
			},
			{
				displayName: 'Email',
				name: 'email',
				type: 'string',
				default: '',
				description: 'Email address of the professional',
			},
			{
				displayName: 'Phone',
				name: 'phone',
				type: 'string',
				default: '',
				description: 'Phone number of the professional',
			},
			{
				displayName: 'Color',
				name: 'color',
				type: 'color',
				default: '#6366f1',
				description: 'Color used to identify this professional in the calendar',
			},
			{
				displayName: 'Buffer Between Appointments (Minutes)',
				name: 'bufferMinutes',
				type: 'number',
				default: 0,
				typeOptions: { minValue: 0 },
				description: 'Minimum gap in minutes between consecutive appointments',
			},
			{
				displayName: 'Working Hours (JSON)',
				name: 'workingHours',
				type: 'json',
				default: '{}',
				description: 'Working hours per day as JSON. Example: {"monday":{"start":"08:00","end":"18:00"}}',
			},
		],
	},

	// --- Availability ---
	{
		displayName: 'Professional ID',
		name: 'professionalId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['professional'],
				operation: ['availability'],
			},
		},
		default: '',
		placeholder: 'e.g., 5',
		description: 'ID of the professional to check availability for',
	},
	{
		displayName: 'Date',
		name: 'date',
		type: 'dateTime',
		required: true,
		displayOptions: {
			show: {
				resource: ['professional'],
				operation: ['availability'],
			},
		},
		default: '',
		description: 'Date to check available slots (YYYY-MM-DD)',
	},
	{
		displayName: 'Service ID',
		name: 'serviceId',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['professional'],
				operation: ['availability'],
			},
		},
		default: 0,
		description: 'Optional: ID of the service (used to determine slot duration)',
	},
];
