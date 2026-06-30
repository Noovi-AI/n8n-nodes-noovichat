import { INodeProperties } from 'n8n-workflow';

// Disparador em Massa (NooviChat custom — feature `disparador`). Cliente HTTP de
// /api/v1/accounts/:id/broadcasts e /broadcast_blacklist_entries.
// Listagens usam limit/offset (não page) — o controller ignora `page`.

export const BroadcastOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['broadcast'],
			},
		},
		options: [
			{ name: 'Create', value: 'create', action: 'Create a broadcast' },
			{ name: 'Get', value: 'get', action: 'Get a broadcast' },
			{ name: 'Get Many', value: 'list', action: 'Get many broadcasts' },
			{ name: 'Update', value: 'update', action: 'Update a broadcast' },
			{ name: 'Delete', value: 'delete', action: 'Delete a broadcast' },
			{ name: 'Pause', value: 'pause', action: 'Pause a broadcast' },
			{ name: 'Resume', value: 'resume', action: 'Resume a broadcast' },
			{ name: 'Cancel', value: 'cancel', action: 'Cancel a broadcast' },
			{ name: 'Retry Failed', value: 'retryFailed', action: 'Retry failed contacts of a broadcast' },
			{ name: 'Duplicate', value: 'duplicate', action: 'Duplicate a broadcast' },
			{ name: 'Get Contacts', value: 'getContacts', action: 'Get the contacts of a broadcast' },
		],
		default: 'list',
	},
];

export const BroadcastFields: INodeProperties[] = [
	// --- Shared: Broadcast ID ---
	{
		displayName: 'Broadcast ID',
		name: 'broadcastId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['broadcast'],
				operation: ['get', 'update', 'delete', 'pause', 'resume', 'cancel', 'retryFailed', 'duplicate', 'getContacts'],
			},
		},
		default: '',
		placeholder: 'e.g., 42',
		description: 'ID of the broadcast',
	},

	// --- Create ---
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		required: true,
		displayOptions: { show: { resource: ['broadcast'], operation: ['create'] } },
		default: '',
		description: 'Name of the broadcast',
	},
	{
		displayName: 'Source Type',
		name: 'sourceType',
		type: 'options',
		required: true,
		displayOptions: { show: { resource: ['broadcast'], operation: ['create'] } },
		options: [
			{ name: 'CSV', value: 'csv' },
			{ name: 'Tags (Contact Labels)', value: 'tags' },
			{ name: 'Kanban (Pipeline Stage)', value: 'kanban' },
			{ name: 'WhatsApp Group', value: 'whatsapp_group' },
		],
		default: 'csv',
		description: 'Where the recipients come from. whatsapp_group sends to entire WhatsApp groups (via broadcast targets) instead of individual contacts',
	},
	{
		displayName: 'Source Config (JSON)',
		name: 'sourceConfig',
		type: 'json',
		required: true,
		displayOptions: { show: { resource: ['broadcast'], operation: ['create'], sourceType: ['csv', 'tags', 'kanban'] } },
		default: '{}',
		description: 'Audience config. csv: { "csv_rows": [{ "telefone": "...", "nome": "..." }] }; tags: { "tag_ids": [1,2] }; kanban: { "funnel_id": 1, "stage_ids": [5] }',
	},
	{
		displayName: 'Group Targets (JSON)',
		name: 'broadcastTargets',
		type: 'json',
		required: true,
		displayOptions: { show: { resource: ['broadcast'], operation: ['create'], sourceType: ['whatsapp_group'] } },
		default: '[\n  { "target_kind": "group", "provider_jid": "120363000000000000@g.us", "metadata": { "name": "My Group" } }\n]',
		description: 'Array of WhatsApp group targets when source type is WhatsApp Group. Each item: { "target_kind": "group", "provider_jid": "<id>@g.us", "metadata": { "name": "..." } }. provider_jid must be a valid group JID; metadata.name is used as the recipient label',
	},
	{
		displayName: 'Message Type',
		name: 'messageType',
		type: 'options',
		required: true,
		displayOptions: { show: { resource: ['broadcast'], operation: ['create'] } },
		options: [
			{ name: 'Custom', value: 'custom' },
			{ name: 'Template (WhatsApp Cloud)', value: 'template' },
		],
		default: 'custom',
	},
	{
		displayName: 'Message Payload (JSON)',
		name: 'messagePayload',
		type: 'json',
		required: true,
		displayOptions: { show: { resource: ['broadcast'], operation: ['create'] } },
		default: '{\n  "messages": [{ "type": "text", "content": "Olá {{nome}}" }]\n}',
		description: 'custom: { "messages": [{ "type": "text", "content": "..." }] }; template: { "template_name": "...", "language": "...", "components": [...] }',
	},
	{
		displayName: 'Inbox IDs',
		name: 'inboxIds',
		type: 'string',
		displayOptions: { show: { resource: ['broadcast'], operation: ['create'] } },
		default: '',
		placeholder: '2,3470',
		description: 'Comma-separated inbox IDs used to send (WhatsApp/API/SMS compatible). For the WhatsApp Group source type, every inbox must be a provider that supports groups',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		displayOptions: { show: { resource: ['broadcast'], operation: ['create'] } },
		default: {},
		options: [
			{ displayName: 'Description', name: 'description', type: 'string', default: '' },
			{
				displayName: 'Rotation Mode', name: 'rotationMode', type: 'options',
				options: [
					{ name: 'Round Robin', value: 'round_robin' },
					{ name: 'Random', value: 'random' },
					{ name: 'Weighted', value: 'weighted' },
				],
				default: 'round_robin',
			},
			{ displayName: 'Inbox Weights (JSON)', name: 'inboxWeights', type: 'json', default: '{}', description: 'Used when rotation mode is weighted: { "<inbox_id>": <weight> }' },
			{ displayName: 'Delay Min (Seconds)', name: 'delayMinSeconds', type: 'number', default: 5 },
			{ displayName: 'Delay Max (Seconds)', name: 'delayMaxSeconds', type: 'number', default: 20 },
			{ displayName: 'Pause Every N', name: 'pauseEveryN', type: 'number', default: 0 },
			{ displayName: 'Pause Duration (Seconds)', name: 'pauseDurationSeconds', type: 'number', default: 0 },
			{ displayName: 'Window Start Time', name: 'windowStartTime', type: 'string', default: '', placeholder: '09:00' },
			{ displayName: 'Window End Time', name: 'windowEndTime', type: 'string', default: '', placeholder: '18:00' },
			{ displayName: 'Allowed Weekdays', name: 'allowedWeekdays', type: 'string', default: '', placeholder: '1,2,3,4,5', description: 'Comma-separated weekdays (0=Sunday .. 6=Saturday)' },
			{
				displayName: 'Start Mode', name: 'startMode', type: 'options',
				options: [
					{ name: 'Immediate', value: 'immediate' },
					{ name: 'Scheduled', value: 'scheduled' },
				],
				default: 'immediate',
			},
			{ displayName: 'Scheduled At', name: 'scheduledAt', type: 'dateTime', default: '', description: 'Required when start mode is scheduled' },
			{ displayName: 'Enable Spintax', name: 'enableSpintax', type: 'boolean', default: false },
			{ displayName: 'Enable Follow-Up', name: 'enableFollowUp', type: 'boolean', default: false },
			{ displayName: 'Follow-Up After Hours', name: 'followUpAfterHours', type: 'number', default: 24 },
			{ displayName: 'Follow-Up Message', name: 'followUpMessage', type: 'string', default: '' },
		],
	},

	// --- Update ---
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		displayOptions: { show: { resource: ['broadcast'], operation: ['update'] } },
		default: {},
		description: 'Após o disparo iniciar, o backend só permite atualizar name/description',
		options: [
			{ displayName: 'Name', name: 'name', type: 'string', default: '' },
			{ displayName: 'Description', name: 'description', type: 'string', default: '' },
		],
	},

	// --- List / Get Contacts filters ---
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		displayOptions: { show: { resource: ['broadcast'], operation: ['list'] } },
		default: {},
		options: [
			{
				displayName: 'Status', name: 'status', type: 'options',
				options: [
					{ name: 'Pending', value: 'pending' },
					{ name: 'Running', value: 'running' },
					{ name: 'Paused', value: 'paused' },
					{ name: 'Completed', value: 'completed' },
					{ name: 'Cancelled', value: 'cancelled' },
					{ name: 'Failed', value: 'failed' },
				],
				default: 'running',
			},
			{ displayName: 'Search (Name)', name: 'q', type: 'string', default: '' },
			{ displayName: 'Limit', name: 'limit', type: 'number', typeOptions: { minValue: 1, maxValue: 100 }, default: 50 },
			{ displayName: 'Offset', name: 'offset', type: 'number', default: 0 },
		],
	},
	{
		displayName: 'Filters',
		name: 'contactFilters',
		type: 'collection',
		placeholder: 'Add Filter',
		displayOptions: { show: { resource: ['broadcast'], operation: ['getContacts'] } },
		default: {},
		options: [
			{
				displayName: 'Status', name: 'status', type: 'options',
				options: [
					{ name: 'Pending', value: 'pending' },
					{ name: 'Sending', value: 'sending' },
					{ name: 'Sent', value: 'sent' },
					{ name: 'Failed', value: 'failed' },
					{ name: 'Replied', value: 'replied' },
					{ name: 'Blacklisted', value: 'blacklisted' },
					{ name: 'Skipped', value: 'skipped' },
				],
				default: 'sent',
			},
			{ displayName: 'Search (Phone or Name)', name: 'q', type: 'string', default: '' },
			{ displayName: 'Limit', name: 'limit', type: 'number', typeOptions: { minValue: 1, maxValue: 200 }, default: 50 },
			{ displayName: 'Offset', name: 'offset', type: 'number', default: 0 },
		],
	},
];

// --- Broadcast Blacklist (resource separado) ---

export const BroadcastBlacklistOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['broadcastBlacklist'] } },
		options: [
			{ name: 'Get Many', value: 'list', action: 'Get many blacklist entries' },
			{ name: 'Add', value: 'add', action: 'Add a number to the blacklist' },
			{ name: 'Remove', value: 'remove', action: 'Remove an entry from the blacklist' },
		],
		default: 'list',
	},
];

export const BroadcastBlacklistFields: INodeProperties[] = [
	{
		displayName: 'Phone Number',
		name: 'phoneNumber',
		type: 'string',
		required: true,
		displayOptions: { show: { resource: ['broadcastBlacklist'], operation: ['add'] } },
		default: '',
		placeholder: '+5511999998888',
		description: 'Number to block from any broadcast in this account',
	},
	{
		displayName: 'Reason',
		name: 'reason',
		type: 'string',
		displayOptions: { show: { resource: ['broadcastBlacklist'], operation: ['add'] } },
		default: '',
		description: 'Optional reason for blocking',
	},
	{
		displayName: 'Entry ID',
		name: 'entryId',
		type: 'string',
		required: true,
		displayOptions: { show: { resource: ['broadcastBlacklist'], operation: ['remove'] } },
		default: '',
		description: 'ID of the blacklist entry to remove',
	},
	{
		displayName: 'Filters',
		name: 'blacklistFilters',
		type: 'collection',
		placeholder: 'Add Filter',
		displayOptions: { show: { resource: ['broadcastBlacklist'], operation: ['list'] } },
		default: {},
		options: [
			{ displayName: 'Search (Phone)', name: 'q', type: 'string', default: '' },
			{ displayName: 'Limit', name: 'limit', type: 'number', typeOptions: { minValue: 1, maxValue: 200 }, default: 50 },
			{ displayName: 'Offset', name: 'offset', type: 'number', default: 0 },
		],
	},
];
