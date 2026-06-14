import { INodeProperties } from 'n8n-workflow';

// Commercial Analysis (Análise Comercial) — AI-generated commercial reports
// scoped by inbox + date period. Async generation: Generate returns 202 with
// { id, status }, poll Get Status until "completed", then read the full report
// with Get. Requires the `commercial_analysis` operational account authorization (else HTTP 403).
// Routes: /api/v1/accounts/:account_id/commercial-analyses (index/create/show/
// destroy + member GET status). The PDF export is intentionally not exposed
// here (binary payload).
export const CommercialAnalysisOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['commercialAnalysis'],
			},
		},
		options: [
			{ name: 'Generate', value: 'generate', action: 'Generate a commercial analysis report' },
			{ name: 'Get Many', value: 'list', action: 'Get many commercial analysis reports' },
			{ name: 'Get Status', value: 'getStatus', action: 'Get the status of a report' },
			{ name: 'Get', value: 'get', action: 'Get a full commercial analysis report' },
			{ name: 'Delete', value: 'delete', action: 'Delete a commercial analysis report' },
		],
		default: 'list',
	},
];

export const CommercialAnalysisFields: INodeProperties[] = [
	// --- Shared: Report ID ---
	{
		displayName: 'Report ID',
		name: 'reportId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['commercialAnalysis'],
				operation: ['get', 'getStatus', 'delete'],
			},
		},
		default: '',
		placeholder: 'e.g., 120',
		description: 'ID of the commercial analysis report',
	},

	// --- Generate ---
	{
		displayName: 'Inbox ID',
		name: 'inboxId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['commercialAnalysis'],
				operation: ['generate'],
			},
		},
		default: '',
		placeholder: 'e.g., 7',
		description: 'Inbox to analyse (must belong to the account)',
	},
	{
		displayName: 'Period From',
		name: 'periodFrom',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['commercialAnalysis'],
				operation: ['generate'],
			},
		},
		default: '',
		placeholder: 'YYYY-MM-DD',
		description: 'Start date of the analysis period (YYYY-MM-DD)',
	},
	{
		displayName: 'Period To',
		name: 'periodTo',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['commercialAnalysis'],
				operation: ['generate'],
			},
		},
		default: '',
		placeholder: 'YYYY-MM-DD',
		description: 'End date of the analysis period (YYYY-MM-DD). Must be >= Period From.',
	},
	{
		displayName: 'Force New Generation',
		name: 'force',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['commercialAnalysis'],
				operation: ['generate'],
			},
		},
		default: false,
		description: 'Whether to bypass the 24h cache and force a fresh report',
	},

	// --- List ---
	{
		displayName: 'Inbox ID',
		name: 'inboxIdFilter',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['commercialAnalysis'],
				operation: ['list'],
			},
		},
		default: '',
		placeholder: 'e.g., 7',
		description: 'Filter the reports to a specific inbox',
	},
	{
		displayName: 'Page',
		name: 'page',
		type: 'number',
		typeOptions: { minValue: 1 },
		displayOptions: {
			show: {
				resource: ['commercialAnalysis'],
				operation: ['list'],
			},
		},
		default: 1,
		description: 'Page of results (20 reports per page)',
	},
];
