import { NooviChat } from '../nodes/NooviChat/NooviChat.node';
import { ProfessionalFields } from '../nodes/NooviChat/descriptions/ProfessionalDescription';

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
	it.each(['create', 'update'] as const)(
		'exposes tenant-validated agent and service IDs for %s',
		(operation) => {
			const options = collectionOptions(operation);
			const agentId = options.find((field) => field.name === 'agentId');
			const serviceIds = options.find((field) => field.name === 'serviceIds');

			expect(agentId).toEqual(
				expect.objectContaining({
					type: 'number',
					typeOptions: { minValue: 0 },
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
		expect(serviceId?.typeOptions).toEqual({ minValue: 1 });
		expect(serviceId?.description).toContain('authenticated account');
		expect(serviceId?.description).toContain('HTTP 404');
		expect(durationMinutes?.typeOptions).toEqual({ minValue: 1, maxValue: MAX_INT32 });
		expect(durationMinutes?.description).toContain('service duration takes precedence');
	});
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

	it('omits the availability query when no optional input is provided', async () => {
		const ctx = buildContext('availability', { professionalId: '7' });

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
