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
			{ name: 'Update Config', value: 'updateConfig', action: 'Update WAHA config' },
			{ name: 'Get Settings', value: 'getSettings', action: 'Get WAHA settings' },
			{ name: 'Update Meta Tracking', value: 'updateMetaTracking', action: 'Update Meta tracking' },
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
		description: 'ID da inbox WhatsApp',
	},

	// Update Config
	{
		displayName: 'Config',
		name: 'config',
		type: 'json',
		required: true,
		displayOptions: {
			show: {
				resource: ['waha'],
				operation: ['updateConfig'],
			},
		},
		default: '{}',
		description: 'Configuração WAHA em JSON',
	},

	// Update Meta Tracking
	{
		displayName: 'Meta Pixel ID',
		name: 'metaPixelId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['waha'],
				operation: ['updateMetaTracking'],
			},
		},
		default: '',
		description: 'ID do Meta Pixel',
	},
	{
		displayName: 'Access Token',
		name: 'metaAccessToken',
		type: 'string',
		typeOptions: {
			password: true,
		},
		displayOptions: {
			show: {
				resource: ['waha'],
				operation: ['updateMetaTracking'],
			},
		},
		default: '',
		description: 'Token de acesso do Meta',
	},
];