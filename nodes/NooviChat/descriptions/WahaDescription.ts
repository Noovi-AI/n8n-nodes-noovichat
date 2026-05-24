import { INodeProperties } from 'n8n-workflow';

export const WahaResource: INodeProperties[] = [
	{
		displayName: 'Resource',
		name: 'resource',
		type: 'options',
		noDataExpression: true,
		options: [
			{ name: 'WAHA', value: 'waha' },
		],
		default: 'waha',
	},
];

export const WahaOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['waha'],
			},
		},
		options: [
			{ name: 'Get Status', value: 'getStatus', action: 'Get WAHA session status' },
			{ name: 'Refresh QR', value: 'refreshQr', action: 'Refresh QR code' },
			{ name: 'Start', value: 'start', action: 'Start WAHA session' },
			{ name: 'Stop', value: 'stop', action: 'Stop WAHA session' },
			{ name: 'Reconnect', value: 'reconnect', action: 'Reconnect WAHA session' },
			{ name: 'Disconnect', value: 'disconnect', action: 'Disconnect WAHA session' },
			{ name: 'Get Settings', value: 'getSettings', action: 'Get WAHA settings' },
			{ name: 'Update Chatwoot App Settings', value: 'updateChatwootAppSettings', action: 'Update Chatwoot app settings (conversation mode, language, etc)' },
			{ name: 'Update Session Settings', value: 'updateSessionSettings', action: 'Update session settings (proxy, presence, ignore filters)' },
			{ name: 'Update Webhook Settings', value: 'updateWebhookSettings', action: 'Update webhook settings (events, retry policy, custom headers)' },
		],
		default: 'getStatus',
	},
];

export const WahaFields: INodeProperties[] = [
	{
		displayName: 'Inbox ID',
		name: 'inboxId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['waha'],
			},
		},
		default: '',
		description: 'ID of the WhatsApp inbox',
	},

	// --- Update Chatwoot App Settings ---
	{
		displayName: 'Chatwoot App Settings',
		name: 'chatwootAppSettings',
		type: 'json',
		required: true,
		displayOptions: {
			show: {
				resource: ['waha'],
				operation: ['updateChatwootAppSettings'],
			},
		},
		default: '{}',
		hint: 'Allowed keys: conversation_mode, mark_messages_read, language, language_overrides, link_preview, add_agent_name, skip_chats: {groups, status, channels}, commands: {server, queue}',
		description: 'Chatwoot App configuration. Example: {"conversation_mode":"single","mark_messages_read":true,"language":"pt-BR"}',
	},

	// --- Update Session Settings ---
	{
		displayName: 'Session Settings',
		name: 'sessionSettings',
		type: 'json',
		required: true,
		displayOptions: {
			show: {
				resource: ['waha'],
				operation: ['updateSessionSettings'],
			},
		},
		default: '{}',
		hint: 'Allowed keys: presence_auto_online, proxy: {enabled, server, username, password}, noweb_store: {enabled, full_sync}, ignore: {groups, status, channels, broadcast}',
		description: 'WAHA session configuration. Example: {"presence_auto_online":true,"ignore":{"groups":true,"status":true}}',
	},

	// --- Update Webhook Settings ---
	{
		displayName: 'Webhook Settings',
		name: 'webhookSettings',
		type: 'json',
		required: true,
		displayOptions: {
			show: {
				resource: ['waha'],
				operation: ['updateWebhookSettings'],
			},
		},
		default: '{}',
		hint: 'Allowed keys: events (array of event names), retry_policy: {enabled, delay_seconds, max_attempts}, custom_headers: {key: value}',
		description: 'WAHA webhook configuration. Example: {"events":["message.any","session.status"],"retry_policy":{"enabled":true,"delay_seconds":5,"max_attempts":3}}',
	},
];