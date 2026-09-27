import { INodeProperties } from 'n8n-workflow';

// Pipeline Pro — the sales ledger of a card (Pipeline::OpportunitiesController)
// and the account-wide revenue report (Pipeline::OpportunitiesReportsController).
// Routes: GET/POST /pipeline/cards/:card_id/opportunities
//         POST /pipeline/opportunities/:id/void
//         GET  /pipeline/opportunities/report
// The normal way to record a sale is Card → Mark Won. Create records a stand-alone
// sale without moving the card and requires the `pipeline_opportunities` account
// feature (Get Many and Void do not). Records are immutable: Void marks a sale as
// reversed, keeping it in the history.
export const PipelineOpportunityOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['pipelineOpportunity'],
			},
		},
		options: [
			{ name: 'Get Many', value: 'getAll', action: 'Get the sales of a card' },
			{
				name: 'Create',
				value: 'create',
				action: 'Record a stand alone sale on a card',
				description: 'Record a sale without moving the card. Use Card → Mark Won to close a deal.',
			},
			{
				name: 'Void',
				value: 'void',
				action: 'Void a sale',
				description: 'Reverse a sale. It stays in the history with author, date and reason. A sale already voided answers 409.',
			},
			{ name: 'Get Report', value: 'getReport', action: 'Get the revenue report' },
		],
		default: 'getAll',
	},
];

export const PipelineOpportunityFields: INodeProperties[] = [
	{
		displayName: 'Card ID',
		name: 'opportunityCardId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['pipelineOpportunity'],
				operation: ['getAll', 'create'],
			},
		},
		default: '',
		description: 'ID of the pipeline card',
	},
	{
		displayName: 'Opportunity ID',
		name: 'opportunityId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['pipelineOpportunity'],
				operation: ['void'],
			},
		},
		default: '',
	},
	{
		displayName: 'Reason',
		name: 'voidReason',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['pipelineOpportunity'],
				operation: ['void'],
			},
		},
		default: '',
		description: 'Why the sale is being reversed',
	},
	{
		displayName: 'Limit',
		name: 'opportunityLimit',
		type: 'number',
		typeOptions: { minValue: 1, maxValue: 100 },
		displayOptions: {
			show: {
				resource: ['pipelineOpportunity'],
				operation: ['getAll'],
			},
		},
		default: 50,
		description: 'Max number of results to return',
	},
	{
		displayName: 'Offset',
		name: 'opportunityOffset',
		type: 'number',
		typeOptions: { minValue: 0 },
		displayOptions: {
			show: {
				resource: ['pipelineOpportunity'],
				operation: ['getAll'],
			},
		},
		default: 0,
		description: 'Number of sales to skip. The response also carries the card summary and meta.total_count.',
	},
	{
		displayName: 'Items (JSON)',
		name: 'saleItems',
		type: 'json',
		displayOptions: {
			show: {
				resource: ['pipelineOpportunity'],
				operation: ['create'],
			},
		},
		default: '',
		description:
			'Optional itemized sale: array (max 50) of objects with pipeline_product_id, quantity, unit_value, total_value, title, note and custom_attributes. When set, the sale total is the sum of the items and Total Value, Unit Value, Quantity and Product ID are ignored.',
	},
	{
		displayName: 'Sale Fields',
		name: 'saleFields',
		type: 'collection',
		placeholder: 'Add Field',
		displayOptions: {
			show: {
				resource: ['pipelineOpportunity'],
				operation: ['create'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Note',
				name: 'note',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Product ID',
				name: 'pipelineProductId',
				type: 'string',
				default: '',
				description: 'Product of this account; an unknown ID answers 404',
			},
			{
				displayName: 'Quantity',
				name: 'quantity',
				type: 'string',
				default: '',
				placeholder: 'e.g., 2',
			},
			{
				displayName: 'Title',
				name: 'title',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Total Value',
				name: 'totalValue',
				type: 'string',
				default: '',
				placeholder: 'e.g., 1500.00',
				description: 'Non-negative decimal with a dot separator',
			},
			{
				displayName: 'Unit Value',
				name: 'unitValue',
				type: 'string',
				default: '',
				placeholder: 'e.g., 750.00',
			},
		],
	},
	{
		displayName: 'Filters',
		name: 'reportFilters',
		type: 'collection',
		placeholder: 'Add Filter',
		displayOptions: {
			show: {
				resource: ['pipelineOpportunity'],
				operation: ['getReport'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'End Date',
				name: 'endDate',
				type: 'string',
				default: '',
				placeholder: 'YYYY-MM-DD',
			},
			{
				displayName: 'Pipeline ID',
				name: 'pipelineId',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Start Date',
				name: 'startDate',
				type: 'string',
				default: '',
				placeholder: 'YYYY-MM-DD',
			},
		],
	},
];
