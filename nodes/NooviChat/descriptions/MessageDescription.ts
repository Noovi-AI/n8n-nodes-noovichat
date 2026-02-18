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
		description: 'ID da conversa',
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
		description: 'Conteúdo da mensagem',
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
			{ name: 'Outgoing', value: 'outgoing' },
			{ name: 'Incoming', value: 'incoming' },
			{ name: 'Activity', value: 'activity' },
			{ name: 'Template', value: 'template' },
		],
		default: 'outgoing',
		description: 'Tipo da mensagem',
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
		description: 'Se a mensagem é privada (visível apenas para agentes)',
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
				description: 'Nome do template WhatsApp',
			},
			{
				displayName: 'Template Variables',
				name: 'templateVariables',
				type: 'string',
				default: '',
				description: 'Variáveis do template separadas por vírgula',
			},
			{
				displayName: 'Attachment',
				name: 'attachment',
				type: 'string',
				default: '',
				description: 'URL do anexo',
			},
			{
				displayName: 'Content Type',
				name: 'contentType',
				type: 'options',
				options: [
					{ name: 'Text', value: 'text' },
					{ name: 'Image', value: 'image' },
					{ name: 'Audio', value: 'audio' },
					{ name: 'Video', value: 'video' },
					{ name: 'File', value: 'file' },
				],
				default: 'text',
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
		description: 'ID da mensagem a ser removida',
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
		description: 'Retornar todos os resultados ou limite',
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
		description: 'Número máximo de resultados',
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
		description: 'ID da mensagem para buscar mensagens anteriores',
	},
];