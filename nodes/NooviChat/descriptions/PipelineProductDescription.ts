import { INodeProperties } from 'n8n-workflow';

// Pipeline Pro — product catalog used to register sales on a card
// (Pipeline::ProductsController, body wrapper `pipeline_product`).
// Routes: /api/v1/accounts/:account_id/pipeline/products[/:id|/performance]
// Requires the `pipeline_opportunities` account feature. Delete never removes
// the row: it deactivates the product (`active: false`) because the sales
// ledger points to it. Lists paginate by limit/offset, not by page.
export const PipelineProductOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['pipelineProduct'],
			},
		},
		options: [
			{ name: 'Create', value: 'create', action: 'Create a product' },
			{ name: 'Get', value: 'get', action: 'Get a product' },
			{ name: 'Get Many', value: 'getAll', action: 'Get many products' },
			{ name: 'Update', value: 'update', action: 'Update a product' },
			{
				name: 'Deactivate',
				value: 'delete',
				action: 'Deactivate a product',
				description: 'DELETE on the product: it is deactivated, never removed, so its sales history is kept',
			},
			{
				name: 'Get Performance',
				value: 'getPerformance',
				action: 'Get the sales performance of each product',
			},
		],
		default: 'getAll',
	},
];

export const PipelineProductFields: INodeProperties[] = [
	{
		displayName: 'Product ID',
		name: 'productId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['pipelineProduct'],
				operation: ['get', 'update', 'delete'],
			},
		},
		default: '',
	},
	{
		displayName: 'Name',
		name: 'productName',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['pipelineProduct'],
				operation: ['create'],
			},
		},
		default: '',
	},
	{
		displayName: 'Additional Fields',
		name: 'productFields',
		type: 'collection',
		placeholder: 'Add Field',
		displayOptions: {
			show: {
				resource: ['pipelineProduct'],
				operation: ['create', 'update'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Active',
				name: 'active',
				type: 'boolean',
				default: true,
				description: 'Whether the product can be selected in new sales',
			},
			{
				displayName: 'Category',
				name: 'category',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Currency',
				name: 'currency',
				type: 'string',
				default: '',
				placeholder: 'BRL',
				description: 'Three-letter code. On create, an omitted currency inherits the account currency.',
			},
			{
				displayName: 'Default Value',
				name: 'defaultValue',
				type: 'string',
				default: '',
				placeholder: 'e.g., 199.90',
				description: 'Default unit price',
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				description: 'New name (update only; on create use the Name field above)',
			},
			{
				displayName: 'Pipeline IDs',
				name: 'pipelineIds',
				type: 'string',
				default: '',
				placeholder: 'e.g., 3, 5',
				description: 'Comma-separated pipelines where the product is offered. An empty list makes it available in every pipeline.',
			},
			{
				displayName: 'Position',
				name: 'position',
				type: 'number',
				default: 0,
			},
			{
				displayName: 'SKU',
				name: 'sku',
				type: 'string',
				default: '',
				description: 'Unique in the account; a duplicate is refused with 422',
			},
		],
	},
	{
		displayName: 'Filters',
		name: 'productFilters',
		type: 'collection',
		placeholder: 'Add Filter',
		displayOptions: {
			show: {
				resource: ['pipelineProduct'],
				operation: ['getAll'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Active Only',
				name: 'activeOnly',
				type: 'boolean',
				default: true,
				description: 'Whether to return only active products',
			},
			{
				displayName: 'Pipeline ID',
				name: 'pipelineId',
				type: 'string',
				default: '',
				description: 'Only products offered in this pipeline',
			},
		],
	},
	{
		displayName: 'Limit',
		name: 'productLimit',
		type: 'number',
		typeOptions: { minValue: 1, maxValue: 200 },
		displayOptions: {
			show: {
				resource: ['pipelineProduct'],
				operation: ['getAll'],
			},
		},
		default: 50,
		description: 'Max number of results to return',
	},
	{
		displayName: 'Offset',
		name: 'productOffset',
		type: 'number',
		typeOptions: { minValue: 0 },
		displayOptions: {
			show: {
				resource: ['pipelineProduct'],
				operation: ['getAll'],
			},
		},
		default: 0,
		description: 'Number of products to skip. The response meta carries total_count, limit and offset.',
	},
	{
		displayName: 'Filters',
		name: 'performanceFilters',
		type: 'collection',
		placeholder: 'Add Filter',
		displayOptions: {
			show: {
				resource: ['pipelineProduct'],
				operation: ['getPerformance'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Pipeline ID',
				name: 'pipelineId',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Won End',
				name: 'wonEnd',
				type: 'string',
				default: '',
				placeholder: 'YYYY-MM-DD',
				description: 'Last day of the period, by the date the sale was won',
			},
			{
				displayName: 'Won Start',
				name: 'wonStart',
				type: 'string',
				default: '',
				placeholder: 'YYYY-MM-DD',
				description: 'First day of the period, by the date the sale was won',
			},
		],
	},
];
