import { INodeProperties } from 'n8n-workflow';

// Operations that target a specific group via group_jid.
const GROUP_JID_OPERATIONS = [
	'getParticipants',
	'addParticipants',
	'removeParticipants',
	'promoteParticipants',
	'demoteParticipants',
	'getInviteLink',
	'setGroupName',
	'setGroupTopic',
	'setGroupPhoto',
	'setGroupLocked',
	'setGroupAnnounce',
	'leaveGroup',
];

// Operations that take a comma-separated list of participant phone numbers.
const PHONES_OPERATIONS = ['addParticipants', 'removeParticipants', 'promoteParticipants', 'demoteParticipants'];

// Every operation except getSessions is scoped to a single NooviConnect inbox.
const INBOX_OPERATIONS = [
	'getGroups',
	'getChannels',
	'getReport',
	'createGroup',
	'getParticipants',
	'addParticipants',
	'removeParticipants',
	'promoteParticipants',
	'demoteParticipants',
	'getInviteLink',
	'setGroupName',
	'setGroupTopic',
	'setGroupPhoto',
	'setGroupLocked',
	'setGroupAnnounce',
	'leaveGroup',
	'sendPoll',
	'sendLocation',
	'unfollowNewsletter',
];

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
			{
				name: 'Remove Participants',
				value: 'removeParticipants',
				action: 'Remove participants from a WhatsApp group',
			},
			{
				name: 'Promote Participants',
				value: 'promoteParticipants',
				action: 'Promote participants to group admin',
			},
			{
				name: 'Demote Participants',
				value: 'demoteParticipants',
				action: 'Demote participants from group admin',
			},
			{
				name: 'Get Group Invite Link',
				value: 'getInviteLink',
				action: 'Get the invite link of a WhatsApp group',
			},
			{
				name: 'Set Group Name',
				value: 'setGroupName',
				action: 'Update the subject/name of a WhatsApp group',
			},
			{
				name: 'Set Group Topic',
				value: 'setGroupTopic',
				action: 'Update the description/topic of a WhatsApp group',
			},
			{
				name: 'Set Group Photo',
				value: 'setGroupPhoto',
				action: 'Update the picture of a WhatsApp group',
			},
			{
				name: 'Set Group Locked',
				value: 'setGroupLocked',
				action: 'Toggle whether only admins can edit a WhatsApp group info',
			},
			{
				name: 'Set Group Announce',
				value: 'setGroupAnnounce',
				action: 'Toggle whether only admins can send messages to a WhatsApp group',
			},
			{
				name: 'Leave Group',
				value: 'leaveGroup',
				action: 'Leave a WhatsApp group',
			},
			{
				name: 'Send Poll',
				value: 'sendPoll',
				action: 'Send a poll to a WhatsApp chat',
			},
			{
				name: 'Send Location',
				value: 'sendLocation',
				action: 'Send a location to a WhatsApp chat',
			},
			{
				name: 'Unfollow Newsletter',
				value: 'unfollowNewsletter',
				action: 'Unfollow a WhatsApp newsletter/channel',
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
				operation: INBOX_OPERATIONS,
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
	// group_jid — required for every group-scoped operation
	// ------------------------------------------------------------------
	{
		displayName: 'Group JID',
		name: 'groupJid',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['whatsAppHub'],
				operation: GROUP_JID_OPERATIONS,
			},
		},
		default: '',
		description: 'WhatsApp JID of the group (e.g. 120363XXXXXXXXX@g.us)',
	},

	// ------------------------------------------------------------------
	// phones — required for participant management operations
	// ------------------------------------------------------------------
	{
		displayName: 'Phone Numbers',
		name: 'phones',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['whatsAppHub'],
				operation: PHONES_OPERATIONS,
			},
		},
		default: '',
		description: 'Comma-separated list of phone numbers to act on (e.g. 5511999998888,5521999997777)',
	},

	// ------------------------------------------------------------------
	// setGroupName / setGroupTopic
	// ------------------------------------------------------------------
	{
		displayName: 'Group Name',
		name: 'groupName',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['whatsAppHub'],
				operation: ['setGroupName'],
			},
		},
		default: '',
		description: 'New subject/name for the WhatsApp group',
	},
	{
		displayName: 'Group Topic',
		name: 'groupTopic',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['whatsAppHub'],
				operation: ['setGroupTopic'],
			},
		},
		default: '',
		description: 'New description/topic for the WhatsApp group (empty clears it)',
	},

	// ------------------------------------------------------------------
	// setGroupPhoto
	// ------------------------------------------------------------------
	{
		displayName: 'Group Photo (JSON)',
		name: 'groupPhoto',
		type: 'json',
		required: true,
		displayOptions: {
			show: {
				resource: ['whatsAppHub'],
				operation: ['setGroupPhoto'],
			},
		},
		default: '{\n  "url": "https://example.com/photo.jpg"\n}',
		description: 'WAHA file object for the new group picture: { "url": "..." } or { "mimetype": "image/jpeg", "data": "<base64>" }',
	},

	// ------------------------------------------------------------------
	// setGroupLocked / setGroupAnnounce
	// ------------------------------------------------------------------
	{
		displayName: 'Locked',
		name: 'groupLocked',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['whatsAppHub'],
				operation: ['setGroupLocked'],
			},
		},
		default: false,
		description: 'Whether only admins can edit the group info (subject, photo, description)',
	},
	{
		displayName: 'Announce',
		name: 'groupAnnounce',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['whatsAppHub'],
				operation: ['setGroupAnnounce'],
			},
		},
		default: false,
		description: 'Whether only admins can send messages to the group',
	},

	// ------------------------------------------------------------------
	// sendPoll / sendLocation — chat phone number
	// ------------------------------------------------------------------
	{
		displayName: 'Phone',
		name: 'phone',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['whatsAppHub'],
				operation: ['sendPoll', 'sendLocation'],
			},
		},
		default: '',
		description: 'Destination phone number (e.g. 5511999998888) or full chat ID (e.g. 5511999998888@c.us)',
	},

	// ------------------------------------------------------------------
	// sendPoll fields
	// ------------------------------------------------------------------
	{
		displayName: 'Question',
		name: 'question',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['whatsAppHub'],
				operation: ['sendPoll'],
			},
		},
		default: '',
		description: 'The poll question',
	},
	{
		displayName: 'Options',
		name: 'pollOptions',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['whatsAppHub'],
				operation: ['sendPoll'],
			},
		},
		default: '',
		description: 'Comma-separated poll options (at least 2, e.g. Yes,No,Maybe)',
	},
	{
		displayName: 'Max Answers',
		name: 'maxAnswer',
		type: 'number',
		typeOptions: { minValue: 1 },
		displayOptions: {
			show: {
				resource: ['whatsAppHub'],
				operation: ['sendPoll'],
			},
		},
		default: 1,
		description: 'Maximum answers a participant can pick. Set greater than 1 to allow multiple answers',
	},

	// ------------------------------------------------------------------
	// sendLocation fields
	// ------------------------------------------------------------------
	{
		displayName: 'Latitude',
		name: 'latitude',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['whatsAppHub'],
				operation: ['sendLocation'],
			},
		},
		default: '',
		description: 'Latitude of the location (e.g. -23.5505)',
	},
	{
		displayName: 'Longitude',
		name: 'longitude',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['whatsAppHub'],
				operation: ['sendLocation'],
			},
		},
		default: '',
		description: 'Longitude of the location (e.g. -46.6333)',
	},
	{
		displayName: 'Location Title',
		name: 'locationTitle',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['whatsAppHub'],
				operation: ['sendLocation'],
			},
		},
		default: '',
		description: 'Optional title/label for the location',
	},

	// ------------------------------------------------------------------
	// unfollowNewsletter
	// ------------------------------------------------------------------
	{
		displayName: 'Newsletter ID',
		name: 'newsletterId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['whatsAppHub'],
				operation: ['unfollowNewsletter'],
			},
		},
		default: '',
		description: 'JID of the WhatsApp newsletter/channel to unfollow (e.g. 1203630XXXXXXXXX@newsletter)',
	},
];
