import { INodeProperties } from 'n8n-workflow';

export const ContactResource: INodeProperties[] = [
	{
		displayName: 'Resource',
		name: 'resource',
		type: 'options',
		noDataExpression: true,
		options: [
			{ name: 'Contact', value: 'contact' },
		],
		default: 'contact',
	},
];

export const ContactOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['contact'],
			},
		},
		options: [
			{ name: 'Create', value: 'create', action: 'Create a contact' },
			{ name: 'Get', value: 'get', action: 'Get a contact' },
			{ name: 'Get Many', value: 'getAll', action: 'Get many contacts' },
			{ name: 'Update', value: 'update', action: 'Update a contact' },
			{ name: 'Delete', value: 'delete', action: 'Delete a contact' },
			{ name: 'Search', value: 'search', action: 'Search contacts' },
			{ name: 'Filter', value: 'filter', action: 'Filter contacts' },
			{ name: 'Merge', value: 'merge', action: 'Merge contacts' },
			{ name: 'Get Conversations', value: 'getConversations', action: 'Get contact conversations' },
		],
		default: 'getAll',
	},
];

export const ContactFields: INodeProperties[] = [
	{
		displayName: 'Contact ID',
		name: 'contactId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['contact'],
				operation: ['get', 'update', 'delete', 'getConversations'],
			},
		},
		default: '',
		placeholder: 'e.g., 98765',
		description: 'Unique identifier of the contact',
	},

	// Create contact fields
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['contact'],
				operation: ['create'],
			},
		},
		default: '',
		placeholder: 'e.g., John Doe',
		description: 'Full name of the contact',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		displayOptions: {
			show: {
				resource: ['contact'],
				operation: ['create'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Email',
				name: 'email',
				type: 'string',
				default: '',
				placeholder: 'e.g., john.doe@example.com',
				description: 'Email address of the contact',
			},
			{
				displayName: 'Phone Number',
				name: 'phoneNumber',
				type: 'string',
				default: '',
				placeholder: 'e.g., +15551234567',
				description: 'Phone number of the contact in E.164 format',
			},
			{
				displayName: 'Inbox ID',
				name: 'inboxId',
				type: 'number',
				default: 0,
				description: 'ID of the inbox to associate the contact with',
			},
			{
				displayName: 'Identifier',
				name: 'identifier',
				type: 'string',
				default: '',
				placeholder: 'e.g., user_abc123',
				description: 'External identifier for the contact in your system',
			},
			{
				displayName: 'Custom Attributes',
				name: 'customAttributes',
				type: 'json',
				default: '{}',
				description: 'Custom attribute key-value pairs to assign to the contact',
				hint: 'Example: {"plan": "premium", "region": "us-east"}',
			},
		],
	},

	// Update contact fields
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		displayOptions: {
			show: {
				resource: ['contact'],
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
				placeholder: 'e.g., John Doe',
				description: 'Updated full name of the contact',
			},
			{
				displayName: 'Email',
				name: 'email',
				type: 'string',
				default: '',
				placeholder: 'e.g., john.doe@example.com',
				description: 'Updated email address of the contact',
			},
			{
				displayName: 'Phone Number',
				name: 'phoneNumber',
				type: 'string',
				default: '',
				placeholder: 'e.g., +15551234567',
				description: 'Updated phone number of the contact in E.164 format',
			},
			{
				displayName: 'Priority',
				name: 'priority',
				type: 'options',
				options: [
					{ name: 'Urgent', value: 'urgent', description: 'Highest priority contact' },
					{ name: 'High', value: 'high', description: 'High priority contact' },
					{ name: 'Medium', value: 'medium', description: 'Medium priority contact' },
					{ name: 'Low', value: 'low', description: 'Low priority contact' },
				],
				default: 'medium',
				description: 'Priority level of the contact',
			},
			{
				displayName: 'Custom Attributes',
				name: 'customAttributes',
				type: 'json',
				default: '{}',
				description: 'Custom attribute key-value pairs to update on the contact',
				hint: 'Example: {"plan": "enterprise", "region": "eu-west"}',
			},
		],
	},

	// Search fields
	{
		displayName: 'Query',
		name: 'query',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['contact'],
				operation: ['search'],
			},
		},
		default: '',
		placeholder: 'e.g., John Doe',
		description: 'Search term to find contacts by name, email, or phone number',
	},

	// Filter fields
	{
		displayName: 'Filter Payload',
		name: 'filterPayload',
		type: 'json',
		required: true,
		displayOptions: {
			show: {
				resource: ['contact'],
				operation: ['filter'],
			},
		},
		default: '{}',
		description: 'JSON payload with filter criteria to search contacts',
		hint: 'Example: {"email": "john@example.com", "phone_number": "+15551234567"}',
	},

	// Merge fields
	{
		displayName: 'Base Contact ID',
		name: 'baseContactId',
		type: 'number',
		required: true,
		displayOptions: {
			show: {
				resource: ['contact'],
				operation: ['merge'],
			},
		},
		default: 0,
		description: 'ID of the base contact that will be kept after the merge',
	},
	{
		displayName: 'Mergee Contact ID',
		name: 'mergeeContactId',
		type: 'number',
		required: true,
		displayOptions: {
			show: {
				resource: ['contact'],
				operation: ['merge'],
			},
		},
		default: 0,
		description: 'ID of the contact that will be merged into the base contact and deleted',
	},

	// Get Many options
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['contact'],
				operation: ['getAll', 'search', 'filter'],
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
				resource: ['contact'],
				operation: ['getAll', 'search', 'filter'],
				returnAll: [false],
			},
		},
		default: 50,
		description: 'Maximum number of results to return',
		typeOptions: {
			minValue: 1,
			maxValue: 100,
		},
	},
	{
		displayName: 'Sort',
		name: 'sort',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['contact'],
				operation: ['getAll'],
			},
		},
		options: [
			{ name: 'Name', value: 'name', description: 'Sort contacts alphabetically by name' },
			{ name: 'Created At', value: 'created_at', description: 'Sort by creation date' },
			{ name: 'Updated At', value: 'updated_at', description: 'Sort by last update date' },
			{ name: 'Last Activity', value: 'last_activity_at', description: 'Sort by most recent activity' },
		],
		default: 'name',
		description: 'Field to sort the results by',
	},
];
