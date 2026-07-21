import { INodeProperties } from 'n8n-workflow';

const MAX_INT32 = 2_147_483_647;
const MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER;

export const AppointmentOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['appointment'],
			},
		},
		description:
			'NooviChat responses use JSON int64 IDs. JavaScript/n8n cannot preserve integer precision above 9007199254740991; use a trusted decimal string source when a later request needs a larger ID.',
		options: [
			{ name: 'Create', value: 'create', action: 'Create an appointment' },
			{ name: 'Get', value: 'get', action: 'Get an appointment' },
			{ name: 'Get Many', value: 'list', action: 'Get many appointments' },
			{ name: 'Update', value: 'update', action: 'Update an appointment' },
			{ name: 'Cancel', value: 'cancel', action: 'Cancel an appointment' },
			{ name: 'Confirm', value: 'confirm', action: 'Confirm an appointment' },
			{ name: 'Complete', value: 'complete', action: 'Mark appointment as completed' },
			{ name: 'No Show', value: 'noShow', action: 'Mark appointment as no-show' },
			{ name: 'Get Availability', value: 'availability', action: 'Get available slots for a professional' },
			{ name: 'Get Contact History', value: 'getContactHistory', action: 'Get appointment history for a contact' },
		],
		default: 'list',
	},
];

export const AppointmentFields: INodeProperties[] = [
	// --- Shared: Appointment ID ---
	{
		displayName: 'Appointment ID',
		name: 'appointmentId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['appointment'],
				operation: ['get', 'update', 'cancel', 'confirm', 'complete', 'noShow'],
			},
		},
		default: '',
		placeholder: 'e.g., 42',
		description:
			'Positive appointment ID up to 9223372036854775807. It is entered as text to preserve 64-bit precision.',
	},

	// --- Create ---
	{
		displayName: 'Contact ID',
		name: 'contactId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['appointment'],
				operation: ['create'],
			},
		},
		default: '',
		placeholder: 'e.g., 42',
		description:
			'Positive contact ID up to 9223372036854775807, entered as text to preserve 64-bit precision.',
	},
	{
		displayName: 'Professional ID',
		name: 'professionalId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['appointment'],
				operation: ['create'],
			},
		},
		default: '',
		placeholder: 'e.g., 3',
		description:
			'Positive professional ID up to 9223372036854775807, entered as text to preserve 64-bit precision.',
	},
	{
		displayName: 'Service ID',
		name: 'serviceId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['appointment'],
				operation: ['create'],
			},
		},
		default: '',
		placeholder: 'e.g., 7',
		description:
			'Positive service ID up to 9223372036854775807, entered as text to preserve 64-bit precision.',
	},
	{
		displayName: 'Scheduled At',
		name: 'scheduledAt',
		type: 'dateTime',
		required: true,
		displayOptions: {
			show: {
				resource: ['appointment'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'Date and time when the appointment is scheduled to start',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		displayOptions: {
			show: {
				resource: ['appointment'],
				operation: ['create'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Ends At',
				name: 'endsAt',
				type: 'dateTime',
				default: '',
				description:
					'Optional end time. Leave empty or omit it to calculate the end from the service duration.',
			},
			{
				displayName: 'Notes',
				name: 'notes',
				type: 'string',
				default: '',
				description: 'Internal notes about the appointment',
				typeOptions: { rows: 3 },
			},
			{
				displayName: 'Partner ID',
				name: 'partnerId',
				type: 'string',
				default: '',
				placeholder: 'e.g., 2',
				description:
					'Optional partner ID from this account. Leave empty to send null. Supports positive 64-bit IDs.',
			},
			{
				displayName: 'Conversation Display ID',
				name: 'conversationDisplayId',
				type: 'number',
				default: 0,
				typeOptions: { minValue: 0, maxValue: MAX_INT32 },
				description:
					'Optional per-account conversation display ID. Use 0 to send null; valid IDs range from 1 to 2147483647.',
			},
			{
				displayName: 'Pipeline Card ID',
				name: 'pipelineCardId',
				type: 'string',
				default: '',
				placeholder: 'e.g., 18',
				description:
					'Optional Pipeline Pro card ID from the authenticated account. Leave empty to send null.',
			},
			{
				displayName: 'Custom Attributes (JSON)',
				name: 'customAttributes',
				type: 'json',
				default: '{}',
				description: 'Custom appointment attributes as a JSON object',
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
				resource: ['appointment'],
				operation: ['update'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Scheduled At',
				name: 'scheduledAt',
				type: 'dateTime',
				default: '',
				description: 'New date and time for the appointment',
			},
			// `endsAt`, `professionalId`, and `serviceId` are intentionally not exposed.
			// The API only updates scheduled_at, notes, partner_id, and custom_attributes;
			// it recalculates ends_at from the service duration when rescheduling.
			{
				displayName: 'Notes',
				name: 'notes',
				type: 'string',
				default: '',
				description:
					'Internal notes. An empty string or null expression clears the current notes.',
				typeOptions: { rows: 3 },
			},
			{
				displayName: 'Custom Attributes (JSON)',
				name: 'customAttributes',
				type: 'json',
				default: '{}',
				description: 'Replacement custom appointment attributes as a JSON object',
			},
			{
				displayName: 'Partner ID',
				name: 'partnerId',
				type: 'string',
				default: '',
				placeholder: 'e.g., 2',
				description:
					'Partner ID from this account. Leave empty or use 0 to clear the current partner.',
			},
		],
	},

	// --- Cancel ---
	{
		displayName: 'Cancellation Reason',
		name: 'cancellationReason',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['appointment'],
				operation: ['cancel'],
			},
		},
		default: '',
		description: 'Reason for cancelling the appointment',
	},

	// --- List (Get Many) ---
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		displayOptions: {
			show: {
				resource: ['appointment'],
				operation: ['list'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'From',
				name: 'from',
				type: 'dateTime',
				default: '',
				description: 'Filter appointments scheduled on or after this date',
			},
			{
				displayName: 'To',
				name: 'to',
				type: 'dateTime',
				default: '',
				description: 'Filter appointments scheduled on or before this date',
			},
			{
				displayName: 'Professional ID',
				name: 'professionalId',
				type: 'string',
				default: '',
				description: 'Filter by a positive 64-bit professional ID',
			},
			{
				displayName: 'Service ID',
				name: 'serviceId',
				type: 'string',
				default: '',
				description: 'Filter by a positive 64-bit service ID',
			},
			{
				displayName: 'Partner ID',
				name: 'partnerId',
				type: 'string',
				default: '',
				description: 'Filter by a positive 64-bit partner ID',
			},
			{
				displayName: 'Status',
				name: 'status',
				type: 'multiOptions',
				options: [
					{ name: 'Scheduled', value: 'scheduled' },
					{ name: 'Confirmed', value: 'confirmed' },
					{ name: 'Completed', value: 'completed' },
					{ name: 'Cancelled', value: 'cancelled' },
					{ name: 'No Show', value: 'no_show' },
				],
				default: [],
				description: 'Filter by one or more exact appointment statuses',
			},
			{
				displayName: 'Page',
				name: 'page',
				type: 'number',
				default: 1,
				typeOptions: { minValue: 1, maxValue: MAX_SAFE_INTEGER },
				description: 'Positive page number. The API returns a fixed 50 records per page.',
			},
			{
				displayName: 'Pipeline Card ID',
				name: 'pipeline_card_id',
				type: 'string',
				default: '',
				description: 'Filter appointments linked to a positive 64-bit Pipeline Pro card ID',
			},
			{
				displayName: 'Contact ID',
				name: 'contactId',
				type: 'string',
				default: '',
				description: 'Filter by a positive 64-bit contact ID',
			},
			{
				displayName: 'Conversation Display ID',
				name: 'conversationDisplayId',
				type: 'number',
				default: 0,
				typeOptions: { minValue: 0, maxValue: MAX_INT32 },
				description:
					'Filter by a per-account conversation display ID from 1 to 2147483647. Zero omits the filter.',
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
				resource: ['appointment'],
				operation: ['availability'],
			},
		},
		default: '',
		description:
			'Positive professional ID up to 9223372036854775807, entered as text to preserve 64-bit precision.',
	},
	{
		displayName: 'Service ID',
		name: 'serviceId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['appointment'],
				operation: ['availability'],
			},
		},
		default: '',
		description:
			'Optional service offered by this professional. Its effective duration takes precedence over Duration Minutes.',
	},
	{
		displayName: 'Date',
		name: 'date',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['appointment'],
				operation: ['availability'],
			},
		},
		default: '',
		placeholder: 'e.g., 2026-08-03',
		description: 'Strict calendar date in YYYY-MM-DD format',
	},
	{
		displayName: 'Duration (Minutes)',
		name: 'durationMinutes',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['appointment'],
				operation: ['availability'],
			},
		},
		default: 0,
		typeOptions: { minValue: 0, maxValue: MAX_INT32 },
		description:
			'Optional duration from 1 to 2147483647 minutes when Service ID is omitted. Use 0 to omit it and use the API default of 60 minutes.',
	},

	// --- Get Contact History ---
	{
		displayName: 'Contact ID',
		name: 'contact_id',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['appointment'],
				operation: ['getContactHistory'],
			},
		},
		default: '',
		description:
			'Positive NooviChat contact ID up to 9223372036854775807, entered as text to preserve 64-bit precision.',
	},
	{
		displayName: 'Page',
		name: 'page',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['appointment'],
				operation: ['getContactHistory'],
			},
		},
		default: 1,
		typeOptions: { minValue: 1, maxValue: MAX_SAFE_INTEGER },
		description: 'Positive page number. The API returns a fixed 50 history records per page.',
	},
];
