import { NooviChat } from '../nodes/NooviChat/NooviChat.node';
import {
	ProfessionalFields,
	ProfessionalOperations,
} from '../nodes/NooviChat/descriptions/ProfessionalDescription';

const MAX_INT32 = 2_147_483_647;

function collectionOptions(operation: 'create' | 'update') {
	const collectionName = operation === 'create' ? 'additionalFields' : 'updateFields';
	const collection = ProfessionalFields.find(
		(field) =>
			field.name === collectionName &&
			((field.displayOptions?.show?.operation as string[] | undefined) || []).includes(operation),
	);

	return (collection?.options || []) as Array<Record<string, any>>;
}

function availabilityField(name: string) {
	return ProfessionalFields.find(
		(field) =>
			field.name === name &&
			((field.displayOptions?.show?.operation as string[] | undefined) || []).includes('availability'),
	);
}

function buildContext(
	operation: string,
	params: Record<string, any> = {},
	mockReturnValue: any = { data: { id: 1 } },
) {
	const mockRequest = jest.fn().mockResolvedValue(mockReturnValue);
	const parameterMap: Record<string, any> = {
		accountId: 1,
		resource: 'professional',
		operation,
		...params,
	};

	return {
		getInputData: () => [{ json: {} }],
		getNodeParameter: (name: string, _index: number, fallback?: any) =>
			parameterMap[name] !== undefined ? parameterMap[name] : fallback,
		getCredentials: jest.fn().mockResolvedValue({
			baseUrl: 'https://chat.example.com',
			apiAccessToken: 'token',
		}),
		helpers: { request: mockRequest },
		getNode: () => ({ name: 'NooviChat', typeVersion: 1 }),
		continueOnFail: () => false,
		_mockRequest: mockRequest,
	} as any;
}

describe('Professional contract — description', () => {
	it('warns about the JavaScript precision limit of int64 response IDs', () => {
		expect(ProfessionalOperations[0].description).toContain('9007199254740991');
		expect(ProfessionalOperations[0].description).toContain('responses use JSON int64 IDs');
	});

	it.each(['create', 'update'] as const)(
		'exposes tenant-validated agent and service IDs for %s',
		(operation) => {
			const options = collectionOptions(operation);
			const agentId = options.find((field) => field.name === 'agentId');
			const serviceIds = options.find((field) => field.name === 'serviceIds');

			expect(agentId).toEqual(
				expect.objectContaining({
					type: 'string',
					default: '',
				}),
			);
			expect(agentId?.description).toContain('HTTP 422');
			expect(agentId?.description).toContain('authenticated account');
			expect(serviceIds).toEqual(
				expect.objectContaining({
					type: 'json',
					default: '[]',
				}),
			);
			expect(serviceIds?.description).toContain('HTTP 422');
			expect(serviceIds?.description).toContain('authenticated account');
			expect(serviceIds?.description).toContain('null is converted to omission');
		},
	);

	it('describes the optional strict date and tenant-scoped availability inputs', () => {
		const date = availabilityField('date');
		const serviceId = availabilityField('serviceId');
		const durationMinutes = availabilityField('durationMinutes');

		expect(date).toEqual(
			expect.objectContaining({
				type: 'string',
				default: '',
			}),
		);
		expect(date).not.toHaveProperty('required');
		expect(date?.description).toContain('YYYY-MM-DD');
		expect(date?.description).toContain('account scheduling timezone');
		expect(serviceId).toEqual(expect.objectContaining({ type: 'string', default: '' }));
		expect(serviceId?.description).toContain('authenticated account');
		expect(serviceId?.description).toContain('HTTP 404');
		expect(durationMinutes?.typeOptions).toEqual({ minValue: 0, maxValue: MAX_INT32 });
		expect(durationMinutes?.description).toContain('service effective duration takes precedence');
	});

	it.each(['create', 'update'] as const)(
		'exposes the real working-hours shape and all mutable professional fields for %s',
		(operation) => {
			const options = collectionOptions(operation);
			const names = options.map((field) => field.name);
			const workingHours = options.find((field) => field.name === 'workingHours');

			expect(names).toEqual(
				operation === 'create'
					? [
							'agentId',
							'specialty',
							'registry',
							'email',
							'phone',
							'color',
							'bufferMinutes',
							'serviceIds',
							'workingHours',
							'active',
							'customAttributes',
							'avatar',
						]
					: [
							'agentId',
							'name',
							'specialty',
							'registry',
							'email',
							'phone',
							'color',
							'bufferMinutes',
							'serviceIds',
							'workingHours',
							'active',
							'customAttributes',
							'avatar',
						],
			);
			expect(workingHours?.description).toContain('{"mon":[{"start":"08:00"');
			expect(workingHours?.description).toContain('empty object');
			expect(workingHours?.description).not.toContain('monday');
		},
	);
});

describe('Professional contract — requests', () => {
	let node: NooviChat;

	beforeEach(() => {
		node = new NooviChat();
	});

	it('forwards create agent_id and every service_id in the professional envelope', async () => {
		const ctx = buildContext('create', {
			name: 'Dr. Silva',
			additionalFields: {
				agentId: 17,
				serviceIds: '[3, 999]',
			},
		});

		await node.execute.call(ctx);

		expect(ctx._mockRequest).toHaveBeenCalledWith(
			expect.objectContaining({
				method: 'POST',
				uri: expect.stringContaining('/api/v1/accounts/1/professionals'),
				body: {
					professional: {
						name: 'Dr. Silva',
						agent_id: 17,
						service_ids: [3, 999],
					},
				},
			}),
		);
	});

	it('forwards update IDs unchanged and surfaces the backend HTTP 422', async () => {
		const ctx = buildContext('update', {
			professionalId: '9',
			updateFields: {
				agentId: 999,
				serviceIds: '[888]',
			},
		});
		ctx._mockRequest.mockRejectedValueOnce(
			Object.assign(new Error('IDs must belong to the authenticated account'), { statusCode: 422 }),
		);

		await expect(node.execute.call(ctx)).rejects.toThrow(
			'NooviChat API Error (HTTP 422) [PATCH /professionals/9]',
		);
		expect(ctx._mockRequest.mock.calls[0][0].body).toEqual({
			professional: {
				agent_id: 999,
				service_ids: [888],
			},
		});
	});

	it('sends explicit clearing values on update', async () => {
		const ctx = buildContext('update', {
			professionalId: '9',
			updateFields: {
				agentId: 0,
				serviceIds: '[]',
				bufferMinutes: 0,
			},
		});

		await node.execute.call(ctx);

		expect(ctx._mockRequest.mock.calls[0][0].body).toEqual({
			professional: {
				agent_id: null,
				service_ids: [],
				buffer_minutes: 0,
			},
		});
	});

	it('preserves nullable and empty text distinctly, false, empty objects, and avatar removal', async () => {
		const ctx = buildContext('update', {
			professionalId: '9',
			updateFields: {
				agentId: '',
				specialty: '',
				registry: null,
				email: '',
				phone: null,
				color: '',
				active: false,
				workingHours: '{}',
				customAttributes: { source: 'n8n' },
				avatar: '',
				serviceIds: null,
			},
		});

		await node.execute.call(ctx);

		expect(ctx._mockRequest.mock.calls[0][0].body).toEqual({
			professional: {
				agent_id: null,
				specialty: '',
				registry: null,
				email: '',
				phone: null,
				color: '',
				active: false,
				working_hours: {},
				custom_attributes: { source: 'n8n' },
				avatar: null,
			},
		});
	});

	it('converts null service IDs to omission so update preserves existing links', async () => {
		const ctx = buildContext('update', {
			professionalId: '9',
			updateFields: { serviceIds: null },
		});

		await node.execute.call(ctx);

		expect(ctx._mockRequest.mock.calls[0][0].body).toEqual({ professional: {} });
		expect(ctx._mockRequest.mock.calls[0][0].body.professional).not.toHaveProperty(
			'service_ids',
		);
	});

	it.each([
		'[null]',
		'[""]',
		'[0]',
		'["9223372036854775808"]',
		'[9007199254740992]',
		'{"id":"3"}',
	])('rejects malformed or precision-unsafe service IDs before HTTP: %s', async (serviceIds) => {
		const ctx = buildContext('update', {
			professionalId: '9',
			updateFields: { serviceIds },
		});

		await expect(node.execute.call(ctx)).rejects.toThrow(
			'Service IDs must be an array of positive decimal IDs up to 9223372036854775807',
		);
		expect(ctx._mockRequest).not.toHaveBeenCalled();
	});

	it('passes the role-aware scheduling projection through without inventing manager fields', async () => {
		const schedulingProjection = {
			data: {
				id: 9,
				account_id: 1,
				name: 'Dra. Silva',
				specialty: null,
				color: null,
				buffer_minutes: 0,
				working_hours: {},
				active: true,
				service_ids: [],
				avatar_url: null,
			},
		};
		const ctx = buildContext('get', { professionalId: '9' }, schedulingProjection);

		const [result] = await node.execute.call(ctx);

		expect(result[0].json).toEqual(schedulingProjection);
		expect(result[0].json.data).not.toHaveProperty('agent_id');
		expect(result[0].json.data).not.toHaveProperty('email');
	});

	it.each([
		['get', 'GET', '/professionals/9'],
		['list', 'GET', '/professionals'],
		['delete', 'DELETE', '/professionals/9'],
	] as const)('uses the exact %s route contract', async (operation, method, path) => {
		const ctx = buildContext(operation, { professionalId: '9' });

		await node.execute.call(ctx);

		expect(ctx._mockRequest.mock.calls[0][0]).toEqual(
			expect.objectContaining({
				method,
				uri: `https://chat.example.com/api/v1/accounts/1${path}`,
			}),
		);
	});

	it('omits the availability query for legacy numeric zero defaults', async () => {
		const ctx = buildContext('availability', {
			professionalId: '7',
			serviceId: 0,
			durationMinutes: 0,
		});

		await node.execute.call(ctx);

		const request = ctx._mockRequest.mock.calls[0][0];
		expect(request).toEqual(
			expect.objectContaining({
				method: 'GET',
				uri: expect.stringContaining('/professionals/7/availability'),
			}),
		);
		expect(request).not.toHaveProperty('qs');
	});

	it('sends the exact date, tenant-scoped service ID, and int32 duration query', async () => {
		const ctx = buildContext('availability', {
			professionalId: '7',
			date: '2026-07-21',
			serviceId: 13,
			durationMinutes: MAX_INT32,
		});

		await node.execute.call(ctx);

		expect(ctx._mockRequest.mock.calls[0][0].qs).toEqual({
			date: '2026-07-21',
			service_id: 13,
			duration_minutes: MAX_INT32,
		});
	});

	it('does not convert a timestamp into a date and surfaces the backend HTTP 422', async () => {
		const timestamp = '2026-07-21T00:00:00.000Z';
		const ctx = buildContext('availability', {
			professionalId: '7',
			date: timestamp,
		});
		ctx._mockRequest.mockRejectedValueOnce(
			Object.assign(new Error('Date must use YYYY-MM-DD'), { statusCode: 422 }),
		);

		await expect(node.execute.call(ctx)).rejects.toThrow(
			'NooviChat API Error (HTTP 422) [GET /professionals/7/availability]',
		);
		expect(ctx._mockRequest.mock.calls[0][0].qs).toEqual({ date: timestamp });
	});
});
