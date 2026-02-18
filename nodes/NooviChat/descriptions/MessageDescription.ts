import { INodeProperties } from 'n8n-workflow';

export const MessageResource: INodeProperties[] = [
	{
		displayName: 'Resource',
		name: 'resource',
		type: 'options',
		noDataExpression: true,
		options: [
			{ name: 'Message', value: 'message' },
		],
		default: 'message',
	},
];

export const MessageOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['message'],
			},
		},
		options: [
			{ name: 'Send', value: 'send', action: 'Send a message' },
			{ name: 'Get Many', value: 'getAll', action: 'Get many messages' },
			{ name: 'Delete', value: 'delete', action: 'Delete a message' },
		],
		default: 'send',
	},
];

export const MessageFields: INodeProperties[] = [
	{
		displayName: 'Conversation ID',
		name: 'conversationId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['message'],
			},
		},
		default: '',
		placeholder: 'e.g., 12345',
		description: 'Unique identifier of the conversation',
	},

	// Send message fields
	{
		displayName: 'Content',
		name: 'content',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['message'],
				operation: ['send'],
			},
		},
		default: '',
		placeholder: 'e.g., Thank you for contacting us!',
		description: 'Text content of the message to send',
	},
	{
		displayName: 'Message Type',
		name: 'messageType',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['message'],
				operation: ['send'],
			},
		},
		options: [
			{ name: 'Outgoing', value: 'outgoing', description: 'Message sent from agent to the contact' },
			{ name: 'Incoming', value: 'incoming', description: 'Message received from the contact' },
			{ name: 'Activity', value: 'activity', description: 'Internal activity log message' },
			{ name: 'Template', value: 'template', description: 'WhatsApp template message' },
		],
		default: 'outgoing',
		description: 'Type of message to send',
	},
	{
		displayName: 'Private',
		name: 'private',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['message'],
				operation: ['send'],
			},
		},
		default: false,
		description: 'Whether the message is private and visible only to agents',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		displayOptions: {
			show: {
				resource: ['message'],
				operation: ['send'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Template Name',
				name: 'templateName',
				type: 'string',
				default: '',
				placeholder: 'e.g., welcome_message',
				description: 'Name of the WhatsApp template to use',
			},
			{
				displayName: 'Template Variables',
				name: 'templateVariables',
				type: 'string',
				default: '',
				placeholder: 'e.g., John,Order #123',
				description: 'Comma-separated list of variables to inject into the template',
			},
			{
				displayName: 'Attachment',
				name: 'attachment',
				type: 'string',
				default: '',
				placeholder: 'e.g., https://example.com/file.pdf',
				description: 'URL of the attachment to include with the message',
			},
			{
				displayName: 'Content Type',
				name: 'contentType',
				type: 'options',
				options: [
					{ name: 'Text', value: 'text', description: 'Plain text message' },
					{ name: 'Image', value: 'image', description: 'Image attachment' },
					{ name: 'Audio', value: 'audio', description: 'Audio attachment' },
					{ name: 'Video', value: 'video', description: 'Video attachment' },
					{ name: 'File', value: 'file', description: 'Generic file attachment' },
				],
				default: 'text',
				description: 'Type of content being sent',
			},
		],
	},

	// Delete message
	{
		displayName: 'Message ID',
		name: 'messageId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['message'],
				operation: ['delete'],
			},
		},
		default: '',
		placeholder: 'e.g., 98765',
		description: 'ID of the message to delete',
	},

	// Get Many options
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['message'],
				operation: ['getAll'],
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
				resource: ['message'],
				operation: ['getAll'],
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
		displayName: 'Before',
		name: 'before',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['message'],
				operation: ['getAll'],
			},
		},
		default: '',
		placeholder: 'e.g., 12345',
		description: 'ID of the message to use as a cursor — returns messages before this ID',
	},
];
