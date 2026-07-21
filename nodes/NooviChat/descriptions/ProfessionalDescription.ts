import { INodeProperties } from 'n8n-workflow';

const MAX_INT32 = 2_147_483_647;

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
				displayName: 'Agent ID',
				name: 'agentId',
				type: 'number',
				default: 0,
				typeOptions: { minValue: 0 },
				description:
					'ID of the agent to link. Use 0 to create without an agent. NooviChat returns HTTP 422 if the agent does not belong to the authenticated account.',
			},
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
				typeOptions: { minValue: 0, maxValue: MAX_INT32 },
				description: 'Minimum gap in minutes between consecutive appointments',
			},
			{
				displayName: 'Service IDs (JSON)',
				name: 'serviceIds',
				type: 'json',
				default: '[]',
				description:
					'Complete replacement array of service IDs, for example [3, 7]. NooviChat returns HTTP 422 if any ID does not belong to the authenticated account. An empty array creates the professional without services.',
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
				displayName: 'Agent ID',
				name: 'agentId',
				type: 'number',
				default: 0,
				typeOptions: { minValue: 0 },
				description:
					'ID of the agent to link. Use 0 to clear the current link. NooviChat returns HTTP 422 if the agent does not belong to the authenticated account.',
			},
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
				typeOptions: { minValue: 0, maxValue: MAX_INT32 },
				description: 'Minimum gap in minutes between consecutive appointments',
			},
			{
				displayName: 'Service IDs (JSON)',
				name: 'serviceIds',
				type: 'json',
				default: '[]',
				description:
					'Complete replacement array of service IDs, for example [3, 7]. NooviChat returns HTTP 422 if any ID does not belong to the authenticated account. An empty array clears all service links.',
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
		type: 'string',
		displayOptions: {
			show: {
				resource: ['professional'],
				operation: ['availability'],
			},
		},
		default: '',
		placeholder: 'e.g., 2026-06-15',
		description:
			'Strict calendar date in YYYY-MM-DD format. When omitted, NooviChat uses the current date in the account scheduling timezone (reporting timezone, then onboarding timezone, then the NooviChat default).',
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
		typeOptions: { minValue: 1 },
		description:
			'Optional service used to determine slot duration. It must belong to the authenticated account; otherwise NooviChat returns HTTP 404.',
	},
	{
		displayName: 'Duration (Minutes)',
		name: 'durationMinutes',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['professional'],
				operation: ['availability'],
			},
		},
		default: 0,
		typeOptions: { minValue: 1, maxValue: MAX_INT32 },
		description:
			'Optional slot duration from 1 to 2147483647 minutes. When omitted, NooviChat uses 60 minutes. A selected service duration takes precedence.',
	},
];
