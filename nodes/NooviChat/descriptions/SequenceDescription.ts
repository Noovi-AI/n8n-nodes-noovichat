import { INodeProperties } from 'n8n-workflow';

// Pipeline Pro — activity sequences attached to a card (time-triggered cadence
// of steps, defined in pipeline/activity_sequences). Mirrors the MCP
// pipeline-sequences tools. Requires the `pipeline_sequences` operational account authorization
// (else HTTP 403). A card can only have ONE active/paused sequence of the same
// definition at a time (422 on duplicate). Routes:
//   /api/v1/accounts/:account_id/pipeline/cards/:card_id/sequences
//     index / create / destroy + member: PATCH pause | resume | complete_step
//     collection: POST external_start (used by external automations)
export const SequenceOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['sequence'],
			},
		},
		options: [
			{ name: 'Get Many', value: 'list', action: 'Get many sequences on a card' },
			{ name: 'Start', value: 'start', action: 'Start a sequence on a card' },
			{ name: 'Start (External)', value: 'startExternal', action: 'Start a sequence with external context' },
			{ name: 'Pause', value: 'pause', action: 'Pause a running sequence' },
			{ name: 'Resume', value: 'resume', action: 'Resume a paused sequence' },
			{ name: 'Complete Step', value: 'completeStep', action: 'Advance a sequence to the next step' },
			{ name: 'Cancel', value: 'cancel', action: 'Cancel a sequence on a card' },
		],
		default: 'list',
	},
];

export const SequenceFields: INodeProperties[] = [
	// --- Shared: Card ID (all operations) ---
	{
		displayName: 'Card ID',
		name: 'cardId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['sequence'],
			},
		},
		default: '',
		placeholder: 'e.g., 42',
		description: 'ID of the pipeline card the sequence is attached to',
	},

	// --- Sequence ID (member operations) ---
	{
		displayName: 'Sequence ID',
		name: 'sequenceId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['sequence'],
				operation: ['pause', 'resume', 'completeStep', 'cancel'],
			},
		},
		default: '',
		placeholder: 'e.g., 14',
		description: 'ID of the sequence execution running on the card',
	},

	// --- Definition ID (start / startExternal) ---
	{
		displayName: 'Sequence Definition ID',
		name: 'definitionId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['sequence'],
				operation: ['start', 'startExternal'],
			},
		},
		default: '',
		placeholder: 'e.g., 3',
		description: 'ID of an ACTIVE activity-sequence definition to start on the card',
	},

	// --- Context (startExternal) ---
	{
		displayName: 'Context (JSON)',
		name: 'context',
		type: 'json',
		displayOptions: {
			show: {
				resource: ['sequence'],
				operation: ['startExternal'],
			},
		},
		default: '{}',
		description:
			'Object with data from the external source. Must be an object (a non-object value returns 400). Only these keys are persisted (others are silently dropped): trigger_source, metadata, external_id, source_url, notes. Put arbitrary data under metadata.',
	},
];
