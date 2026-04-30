import { INodeProperties } from 'n8n-workflow';

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
			{ name: 'Export', value: 'export', action: 'Export appointments as CSV' },
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
		description: 'ID of the appointment',
	},

	// --- Create ---
	{
		displayName: 'Contact ID',
		name: 'contactId',
		type: 'number',
		required: true,
		displayOptions: {
			show: {
				resource: ['appointment'],
				operation: ['create'],
			},
		},
		default: 0,
		description: 'ID of the contact (patient / client)',
	},
	{
		displayName: 'Professional ID',
		name: 'professionalId',
		type: 'number',
		required: true,
		displayOptions: {
			show: {
				resource: ['appointment'],
				operation: ['create'],
			},
		},
		default: 0,
		description: 'ID of the professional who will perform the appointment',
	},
	{
		displayName: 'Service ID',
		name: 'serviceId',
		type: 'number',
		required: true,
		displayOptions: {
			show: {
				resource: ['appointment'],
				operation: ['create'],
			},
		},
		default: 0,
		description: 'ID of the service to be performed',
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
				description: 'End time of the appointment. If not provided, calculated from service duration.',
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
				type: 'number',
				default: 0,
				description: 'ID of the partner (convenio / insurance plan) for this appointment',
			},
			{
				displayName: 'Conversation Display ID',
				name: 'conversationDisplayId',
				type: 'number',
				default: 0,
				description: 'Display ID of the conversation linked to this appointment',
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
			{
				displayName: 'Ends At',
				name: 'endsAt',
				type: 'dateTime',
				default: '',
				description: 'New end time for the appointment',
			},
			{
				displayName: 'Professional ID',
				name: 'professionalId',
				type: 'number',
				default: 0,
				description: 'Change the professional assigned to this appointment',
			},
			{
				displayName: 'Service ID',
				name: 'serviceId',
				type: 'number',
				default: 0,
				description: 'Change the service for this appointment',
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
				type: 'number',
				default: 0,
				description: 'ID of the partner (convenio / insurance plan)',
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
				type: 'number',
				default: 0,
				description: 'Filter by professional ID',
			},
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				options: [
					{ name: 'Scheduled', value: 'scheduled' },
					{ name: 'Confirmed', value: 'confirmed' },
					{ name: 'Completed', value: 'completed' },
					{ name: 'Cancelled', value: 'cancelled' },
					{ name: 'No Show', value: 'no_show' },
				],
				default: 'scheduled',
				description: 'Filter by appointment status',
			},
			{
				displayName: 'Page',
				name: 'page',
				type: 'number',
				default: 1,
				description: 'Page number for pagination',
			},
		],
	},

	// --- Availability ---
	{
		displayName: 'Professional ID',
		name: 'professionalId',
		type: 'number',
		required: true,
		displayOptions: {
			show: {
				resource: ['appointment'],
				operation: ['availability'],
			},
		},
		default: 0,
		description: 'ID of the professional to check availability for',
	},
	{
		displayName: 'Service ID',
		name: 'serviceId',
		type: 'number',
		required: true,
		displayOptions: {
			show: {
				resource: ['appointment'],
				operation: ['availability'],
			},
		},
		default: 0,
		description: 'ID of the service (used to determine slot duration)',
	},
	{
		displayName: 'Date',
		name: 'date',
		type: 'dateTime',
		required: true,
		displayOptions: {
			show: {
				resource: ['appointment'],
				operation: ['availability'],
			},
		},
		default: '',
		description: 'Date to check available slots (YYYY-MM-DD)',
	},

	// --- Export ---
	{
		displayName: 'Export Filters',
		name: 'exportFilters',
		type: 'collection',
		placeholder: 'Add Filter',
		displayOptions: {
			show: {
				resource: ['appointment'],
				operation: ['export'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'From',
				name: 'from',
				type: 'dateTime',
				default: '',
				description: 'Export appointments scheduled on or after this date',
			},
			{
				displayName: 'To',
				name: 'to',
				type: 'dateTime',
				default: '',
				description: 'Export appointments scheduled on or before this date',
			},
			{
				displayName: 'Professional ID',
				name: 'professionalId',
				type: 'number',
				default: 0,
				description: 'Filter by professional ID',
			},
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				options: [
					{ name: 'Scheduled', value: 'scheduled' },
					{ name: 'Confirmed', value: 'confirmed' },
					{ name: 'Completed', value: 'completed' },
					{ name: 'Cancelled', value: 'cancelled' },
					{ name: 'No Show', value: 'no_show' },
				],
				default: 'scheduled',
				description: 'Filter by appointment status',
			},
		],
	},
];
