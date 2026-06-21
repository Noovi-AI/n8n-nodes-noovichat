import { INodeProperties } from 'n8n-workflow';

export const WhatsAppHubOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['whatsAppHub'],
			},
		},
		options: [
			{
				name: 'List Sessions',
				value: 'getSessions',
				action: 'List all NooviConnect sessions for the account',
			},
			{
				name: 'List Groups',
				value: 'getGroups',
				action: 'List WhatsApp groups for a NooviConnect inbox',
			},
			{
				name: 'List Channels',
				value: 'getChannels',
				action: 'List WhatsApp newsletters/channels for a NooviConnect inbox',
			},
			{
				name: 'Hub Report',
				value: 'getReport',
				action: 'Get aggregated hub report for a NooviConnect inbox',
			},
			{
				name: 'Create Group',
				value: 'createGroup',
				action: 'Create a WhatsApp group via a NooviConnect inbox',
			},
			{
				name: 'Group Participants',
				value: 'getParticipants',
				action: 'Get participants of a WhatsApp group',
			},
			{
				name: 'Add Participants',
				value: 'addParticipants',
				action: 'Add participants to a WhatsApp group',
			},
		],
		default: 'getSessions',
	},
];

export const WhatsAppHubFields: INodeProperties[] = [
	// ------------------------------------------------------------------
	// Inbox ID — required for all operations except getSessions
	// ------------------------------------------------------------------
	{
		displayName: 'Inbox ID',
		name: 'inboxId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['whatsAppHub'],
				operation: ['getGroups', 'getChannels', 'getReport', 'createGroup', 'getParticipants', 'addParticipants'],
			},
		},
		default: '',
		description: 'ID of the NooviConnect-enabled inbox (API channel with NooviConnect configured)',
	},

	// ------------------------------------------------------------------
	// createGroup fields
	// ------------------------------------------------------------------
	{
		displayName: 'Group Title',
		name: 'title',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['whatsAppHub'],
				operation: ['createGroup'],
			},
		},
		default: '',
		description: 'Name/title for the new WhatsApp group',
	},
	{
		displayName: 'Participants',
		name: 'participants',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['whatsAppHub'],
				operation: ['createGroup'],
			},
		},
		default: '',
		description: 'Comma-separated list of phone numbers to add as initial group participants (e.g. 5511999998888,5521999997777)',
	},

	// ------------------------------------------------------------------
	// group_jid — required for getParticipants and addParticipants
	// ------------------------------------------------------------------
	{
		displayName: 'Group JID',
		name: 'groupJid',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['whatsAppHub'],
				operation: ['getParticipants', 'addParticipants'],
			},
		},
		default: '',
		description: 'WhatsApp JID of the group (e.g. 120363XXXXXXXXX@g.us)',
	},

	// ------------------------------------------------------------------
	// phones — required for addParticipants
	// ------------------------------------------------------------------
	{
		displayName: 'Phone Numbers',
		name: 'phones',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['whatsAppHub'],
				operation: ['addParticipants'],
			},
		},
		default: '',
		description: 'Comma-separated list of phone numbers to add to the group (e.g. 5511999998888,5521999997777)',
	},
];
