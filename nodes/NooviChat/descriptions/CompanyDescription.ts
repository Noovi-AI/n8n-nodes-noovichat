import { INodeProperties } from 'n8n-workflow';

// B2B companies. Rails wraps writes as { company: { ... } }.
// Routes: /api/v1/accounts/:account_id/companies
//         GET /companies/search?q=
export const CompanyOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['company'],
			},
		},
		options: [
			{ name: 'Get Many', value: 'getAll', action: 'Get many companies' },
			{ name: 'Search', value: 'search', action: 'Search companies' },
			{ name: 'Get', value: 'get', action: 'Get a company' },
			{ name: 'Create', value: 'create', action: 'Create a company' },
			{ name: 'Update', value: 'update', action: 'Update a company' },
			{ name: 'Delete', value: 'delete', action: 'Delete a company' },
		],
		default: 'getAll',
	},
];

export const CompanyFields: INodeProperties[] = [
	{
		displayName: 'Company ID',
		name: 'companyId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['company'],
				operation: ['get', 'update', 'delete'],
			},
		},
		default: '',
		description: 'ID of the company',
	},
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['company'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'Company legal or display name',
	},
	{
		displayName: 'Query',
		name: 'q',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['company'],
				operation: ['search'],
			},
		},
		default: '',
		description: 'Search query matched against name/domain',
	},
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['company'],
				operation: ['getAll'],
			},
		},
		default: false,
		description: 'Whether to return all results or only up to a given limit',
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		typeOptions: { minValue: 1 },
		displayOptions: {
			show: {
				resource: ['company'],
				operation: ['getAll'],
				returnAll: [false],
			},
		},
		default: 25,
		description: 'Max number of results to return',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		displayOptions: {
			show: {
				resource: ['company'],
				operation: ['create'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Domain',
				name: 'domain',
				type: 'string',
				default: '',
				description: 'Primary web/email domain',
			},
			{
				displayName: 'Industry',
				name: 'industry',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Website',
				name: 'website',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Phone',
				name: 'phone',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
			},
		],
	},
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		displayOptions: {
			show: {
				resource: ['company'],
				operation: ['update'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Domain',
				name: 'domain',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Industry',
				name: 'industry',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Website',
				name: 'website',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Phone',
				name: 'phone',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
			},
		],
	},
];
