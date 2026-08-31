import { INodeProperties } from 'n8n-workflow';

// Captain AI hook — NooviChat-owned preferences + five synchronous tasks.
// Routes: /api/v1/accounts/:account_id/captain/preferences
//         /api/v1/accounts/:account_id/captain/tasks/{rewrite,summarize,reply_suggestion,label_suggestion,follow_up}
// conversation_display_id is the public URL integer, not the internal PK.
export const CaptainOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['captain'],
			},
		},
		options: [
			{ name: 'Get Preferences', value: 'getPreferences', action: 'Get Captain AI preferences' },
			{ name: 'Update Preferences', value: 'updatePreferences', action: 'Update Captain AI preferences' },
			{ name: 'Rewrite', value: 'rewrite', action: 'Rewrite agent content' },
			{ name: 'Summarize', value: 'summarize', action: 'Summarize a conversation' },
			{ name: 'Reply Suggestion', value: 'replySuggestion', action: 'Suggest a reply' },
			{ name: 'Label Suggestion', value: 'labelSuggestion', action: 'Suggest labels' },
			{ name: 'Follow Up', value: 'followUp', action: 'Generate a follow-up draft' },
		],
		default: 'getPreferences',
	},
];

export const CaptainFields: INodeProperties[] = [
	{
		displayName: 'Conversation Display ID',
		name: 'conversationDisplayId',
		type: 'number',
		required: true,
		displayOptions: {
			show: {
				resource: ['captain'],
				operation: ['summarize', 'replySuggestion', 'labelSuggestion', 'followUp'],
			},
		},
		default: 0,
		description: 'Public conversation number from the URL /conversations/12345, not the internal primary key',
	},
	{
		displayName: 'Content',
		name: 'content',
		type: 'string',
		required: true,
		typeOptions: { rows: 4 },
		displayOptions: {
			show: {
				resource: ['captain'],
				operation: ['rewrite'],
			},
		},
		default: '',
		description: 'Source text to rewrite',
	},
	{
		displayName: 'Rewrite Operation',
		name: 'rewriteOperation',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['captain'],
				operation: ['rewrite'],
			},
		},
		default: 'fix_grammar',
		placeholder: 'fix_grammar | make_friendly | translate',
		description: 'Rewrite operation key (for example fix_grammar, make_friendly, translate)',
	},
	{
		displayName: 'Conversation Display ID',
		name: 'rewriteConversationDisplayId',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['captain'],
				operation: ['rewrite'],
			},
		},
		default: 0,
		description: 'Optional conversation context (display ID). Omit or 0 to rewrite standalone text.',
	},
	{
		displayName: 'Captain Models',
		name: 'captainModels',
		type: 'json',
		displayOptions: {
			show: {
				resource: ['captain'],
				operation: ['updatePreferences'],
			},
		},
		default: '{}',
		description: 'Partial per-feature model map (editor, assistant, copilot, label_suggestion, audio_transcription, help_center_search). Merged server-side.',
	},
	{
		displayName: 'Captain Features',
		name: 'captainFeatures',
		type: 'json',
		displayOptions: {
			show: {
				resource: ['captain'],
				operation: ['updatePreferences'],
			},
		},
		default: '{}',
		description: 'Partial per-feature on/off flags. Same keys as Captain Models. Merged server-side.',
	},
	{
		displayName: 'Message',
		name: 'message',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['captain'],
				operation: ['followUp'],
			},
		},
		default: '',
		description: 'Optional instruction shaping the follow-up (for example shorter, in Spanish). Does not schedule a send.',
	},
	{
		displayName: 'Follow Up Context',
		name: 'followUpContext',
		type: 'json',
		displayOptions: {
			show: {
				resource: ['captain'],
				operation: ['followUp'],
			},
		},
		default: '{}',
		description: 'Context token returned by a previous Follow Up call, for multi-turn drafting',
	},
];
