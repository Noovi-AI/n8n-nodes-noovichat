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
		description:
			'NooviChat responses use JSON int64 IDs. JavaScript/n8n cannot preserve integer precision above 9007199254740991; use a trusted decimal string source when a later request needs a larger ID.',
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
		description:
			'Positive professional ID up to 9223372036854775807. It is entered as text to preserve 64-bit precision.',
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
				type: 'string',
				default: '',
				placeholder: 'e.g., 17',
				description:
					'Positive 64-bit agent ID to link. Leave empty or use 0 to create without an agent. NooviChat returns HTTP 422 if it is outside the authenticated account.',
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
				default: '#3B82F6',
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
					'Complete array of positive 64-bit service IDs, for example ["3", "7"]. The node rejects malformed IDs; NooviChat returns HTTP 422 when a valid ID is outside the authenticated account. An empty array creates the professional without services; null is converted to omission.',
			},
			{
				displayName: 'Working Hours (JSON)',
				name: 'workingHours',
				type: 'json',
				default: '{}',
				description:
					'Working-hour arrays keyed by mon, tue, wed, thu, fri, sat, or sun. Example: {"mon":[{"start":"08:00","end":"12:00"},{"start":"14:00","end":"18:00"}]}. An empty object is accepted for backward compatibility.',
				hint:
					'Every day value must be an array. Each window needs zero-padded HH:MM start/end values, with start earlier than end.',
			},
			{
				displayName: 'Active',
				name: 'active',
				type: 'boolean',
				default: true,
				description: 'Whether the professional is active and returned by the scheduling list',
			},
			{
				displayName: 'Custom Attributes (JSON)',
				name: 'customAttributes',
				type: 'json',
				default: '{}',
				description: 'Custom professional attributes as a JSON object',
			},
			{
				displayName: 'Avatar Signed Blob ID',
				name: 'avatar',
				type: 'string',
				default: '',
				description:
					'Optional Active Storage signed blob ID for an image up to 5 MB. Leave empty to create without an avatar.',
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
				type: 'string',
				default: '',
				placeholder: 'e.g., 17',
				description:
					'Positive 64-bit agent ID to link. Leave empty or use 0 to clear the current link. NooviChat returns HTTP 422 if it is outside the authenticated account.',
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
				default: '#3B82F6',
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
					'Complete replacement array of positive 64-bit service IDs, for example ["3", "7"]. An empty array clears all links; null is converted to omission and preserves existing links. The node rejects malformed IDs; NooviChat returns HTTP 422 for services outside the authenticated account.',
			},
			{
				displayName: 'Working Hours (JSON)',
				name: 'workingHours',
				type: 'json',
				default: '{}',
				description:
					'Working-hour arrays keyed by mon, tue, wed, thu, fri, sat, or sun. Example: {"mon":[{"start":"08:00","end":"18:00"}]}. An empty object remains accepted for backward compatibility.',
			},
			{
				displayName: 'Active',
				name: 'active',
				type: 'boolean',
				default: true,
				description: 'Whether the professional is active and returned by the scheduling list',
			},
			{
				displayName: 'Custom Attributes (JSON)',
				name: 'customAttributes',
				type: 'json',
				default: '{}',
				description: 'Replacement custom professional attributes as a JSON object',
			},
			{
				displayName: 'Avatar Signed Blob ID',
				name: 'avatar',
				type: 'string',
				default: '',
				description:
					'Active Storage signed blob ID for an image up to 5 MB. Leave empty to remove the current avatar.',
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
		description:
			'Positive professional ID up to 9223372036854775807, entered as text to preserve 64-bit precision.',
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
		type: 'string',
		displayOptions: {
			show: {
				resource: ['professional'],
				operation: ['availability'],
			},
		},
		default: '',
		description:
			'Optional positive 64-bit service ID used to determine slot duration. It must be offered by this professional in the authenticated account; otherwise NooviChat returns HTTP 404.',
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
		typeOptions: { minValue: 0, maxValue: MAX_INT32 },
		description:
			'Optional slot duration from 1 to 2147483647 minutes. Use 0 to omit it and use 60 minutes. A selected service effective duration takes precedence.',
	},
];
