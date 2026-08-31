import { INodeProperties } from 'n8n-workflow';

// UAZAPI WhatsApp gateway (alternative to WAHA).
// Member :id is the inbox_id of a UazAPI-enabled API channel.
// Routes: /api/v1/accounts/:account_id/uazapi/:id/{status,settings,connect,reconnect,disconnect,request_pairing_code,reconfigure_chatwoot}
export const UazapiOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['uazapi'],
			},
		},
		options: [
			{ name: 'Get Status', value: 'getStatus', action: 'Get UAZAPI session status' },
			{ name: 'Get Settings', value: 'getSettings', action: 'Get UAZAPI settings' },
			{ name: 'Update Settings', value: 'updateSettings', action: 'Update UAZAPI settings' },
			{ name: 'Connect', value: 'connect', action: 'Connect UAZAPI session' },
			{ name: 'Reconnect', value: 'reconnect', action: 'Reconnect UAZAPI session' },
			{ name: 'Disconnect', value: 'disconnect', action: 'Disconnect UAZAPI session' },
			{ name: 'Request Pairing Code', value: 'requestPairingCode', action: 'Request UAZAPI pairing code' },
			{ name: 'Reconfigure Integration', value: 'reconfigureChatwoot', action: 'Reconfigure UAZAPI Chatwoot integration' },
		],
		default: 'getStatus',
	},
];

export const UazapiFields: INodeProperties[] = [
	{
		displayName: 'Inbox ID',
		name: 'inboxId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['uazapi'],
			},
		},
		default: '',
		description: 'ID of the UAZAPI-enabled WhatsApp inbox (not a separate instance id)',
	},
	{
		displayName: 'Settings',
		name: 'settings',
		type: 'json',
		required: true,
		displayOptions: {
			show: {
				resource: ['uazapi'],
				operation: ['updateSettings'],
			},
		},
		default: '{}',
		description: 'Settings object. Allowed keys: ignore_groups, sign_messages, create_new_conversation.',
	},
	{
		displayName: 'Phone Number',
		name: 'phoneNumber',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['uazapi'],
				operation: ['requestPairingCode'],
			},
		},
		default: '',
		placeholder: '5511999999999',
		description: 'Digits only. Number that receives the pairing code.',
	},
];
