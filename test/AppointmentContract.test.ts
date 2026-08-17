import { NooviChat } from '../nodes/NooviChat/NooviChat.node';
import {
	AppointmentFields,
	AppointmentOperations,
} from '../nodes/NooviChat/descriptions/AppointmentDescription';

const MAX_INT32 = 2_147_483_647;

function collectionOptions(name: 'additionalFields' | 'filters' | 'updateFields') {
	const collection = AppointmentFields.find(
		(field) =>
			field.name === name &&
			((field.displayOptions?.show?.resource as string[] | undefined) || []).includes(
				'appointment',
			),
	);

	return (collection?.options || []) as Array<Record<string, any>>;
}

function operationField(name: string, operation: string) {
	return AppointmentFields.find(
		(field) =>
			field.name === name &&
			((field.displayOptions?.show?.operation as string[] | undefined) || []).includes(operation),
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
		resource: 'appointment',
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

describe('Appointment contract — description', () => {
	it('warns about the JavaScript precision limit of int64 response IDs', () => {
		expect(AppointmentOperations[0].description).toContain('9007199254740991');
		expect(AppointmentOperations[0].description).toContain('responses use JSON int64 IDs');
	});

	it('uses text inputs for 64-bit IDs and exposes every current create field', () => {
		for (const name of ['contactId', 'professionalId', 'serviceId']) {
			expect(operationField(name, 'create')).toEqual(
				expect.objectContaining({ type: 'string', default: '' }),
			);
		}

		const createNames = collectionOptions('additionalFields').map((field) => field.name);
		expect(createNames).toEqual([
			'endsAt',
			'notes',
			'partnerId',
			'conversationDisplayId',
			'pipelineCardId',
			'customAttributes',
		]);
		const conversationId = collectionOptions('additionalFields').find(
			(field) => field.name === 'conversationDisplayId',
		);
		expect(conversationId?.typeOptions?.maxValue).toBe(MAX_INT32);
	});

	it('exposes the exact list filters and comma-separated status vocabulary', () => {
		const filters = collectionOptions('filters');
		const names = filters.map((field) => field.name);
		const status = filters.find((field) => field.name === 'status');

		expect(names).toEqual([
			'from',
			'to',
			'professionalId',
			'serviceId',
			'partnerId',
			'status',
			'page',
			'pipeline_card_id',
			'contactId',
			'conversationDisplayId',
		]);
		expect(status).toEqual(expect.objectContaining({ type: 'multiOptions', default: [] }));
		expect((status?.options || []).map((option: any) => option.value)).toEqual([
			'scheduled',
			'confirmed',
			'completed',
			'cancelled',
			'no_show',
		]);
	});

	it('uses a strict calendar-date field and optional service/duration for availability', () => {
		const date = operationField('date', 'availability');
		const serviceId = operationField('serviceId', 'availability');
		const duration = operationField('durationMinutes', 'availability');

		expect(date).toEqual(expect.objectContaining({ type: 'string', required: true }));
		expect(date?.description).toContain('YYYY-MM-DD');
		expect(serviceId).toEqual(expect.objectContaining({ type: 'string', default: '' }));
		expect(serviceId).not.toHaveProperty('required');
		expect(duration?.typeOptions).toEqual({ minValue: 0, maxValue: MAX_INT32 });
	});

	it('documents the fixed pagination contract for contact history', () => {
		const page = operationField('page', 'getContactHistory');

		expect(page?.description).toContain('50 history records per page');
	});
});

describe('Appointment contract — requests and responses', () => {
	let node: NooviChat;

	beforeEach(() => {
		node = new NooviChat();
	});

	it('wraps every supported create field and preserves nullable values', async () => {
		const ctx = buildContext('create', {
			contactId: '101',
			professionalId: '3',
			serviceId: '7',
			scheduledAt: '2026-08-03T10:00:00-03:00',
			additionalFields: {
				endsAt: '',
				notes: null,
				partnerId: '',
				conversationDisplayId: 0,
				pipelineCardId: '18',
				customAttributes: '{"source":"n8n"}',
			},
		});

		await node.execute.call(ctx);

		expect(ctx._mockRequest.mock.calls[0][0]).toEqual(
			expect.objectContaining({
				method: 'POST',
				uri: expect.stringContaining('/appointments'),
				body: {
					appointment: {
						contact_id: '101',
						professional_id: '3',
						service_id: '7',
						scheduled_at: '2026-08-03T10:00:00-03:00',
						ends_at: null,
						notes: null,
						partner_id: null,
						conversation_display_id: null,
						pipeline_card_id: '18',
						custom_attributes: { source: 'n8n' },
					},
				},
			}),
		);
	});

	it('sends only mutable update fields and can clear notes and partner', async () => {
		const ctx = buildContext('update', {
			appointmentId: '42',
			updateFields: {
				scheduledAt: '2026-08-04T10:00:00-03:00',
				notes: null,
				partnerId: 0,
				customAttributes: {},
				endsAt: '2026-08-04T20:00:00-03:00',
				serviceId: '99',
			},
		});

		await node.execute.call(ctx);

		expect(ctx._mockRequest.mock.calls[0][0].body).toEqual({
			appointment: {
				scheduled_at: '2026-08-04T10:00:00-03:00',
				notes: null,
				partner_id: null,
				custom_attributes: {},
			},
		});
	});

	it.each([
		['get', 'GET', '/appointments/42'],
		['cancel', 'DELETE', '/appointments/42'],
		['confirm', 'POST', '/appointments/42/confirm'],
		['complete', 'POST', '/appointments/42/complete'],
		['noShow', 'POST', '/appointments/42/no_show'],
	] as const)('uses the exact %s route contract', async (operation, method, path) => {
		const ctx = buildContext(operation, { appointmentId: '42' });

		await node.execute.call(ctx);

		expect(ctx._mockRequest.mock.calls[0][0]).toEqual(
			expect.objectContaining({
				method,
				uri: `https://chat.example.com/api/v1/accounts/1${path}`,
			}),
		);
	});

	it('maps every supported list filter and joins selected statuses', async () => {
		const ctx = buildContext('list', {
			filters: {
				from: '2026-08-01T00:00:00Z',
				to: '2026-08-31T23:59:59Z',
				professionalId: '3',
				serviceId: '7',
				partnerId: '2',
				status: ['scheduled', 'confirmed'],
				page: 2,
				pipeline_card_id: '18',
				contactId: '101',
				conversationDisplayId: 55,
			},
		});

		await node.execute.call(ctx);

		expect(ctx._mockRequest.mock.calls[0][0].qs).toEqual({
			from: '2026-08-01T00:00:00Z',
			to: '2026-08-31T23:59:59Z',
			professional_id: '3',
			service_id: '7',
			partner_id: '2',
			status: 'scheduled,confirmed',
			page: 2,
			pipeline_card_id: '18',
			contact_id: '101',
			conversation_display_id: 55,
		});
	});

	it('forwards an explicitly invalid zero page so the API returns its documented 422', async () => {
		const ctx = buildContext('list', { filters: { page: 0 } });
		ctx._mockRequest.mockRejectedValueOnce(
			Object.assign(new Error('page must be between 1 and the maximum'), { statusCode: 422 }),
		);

		await expect(node.execute.call(ctx)).rejects.toThrow(
			'NooviChat API Error (HTTP 422) [GET /appointments]',
		);

		expect(ctx._mockRequest.mock.calls[0][0].qs).toEqual({ page: 0 });
	});

	it('omits numeric and string zero IDs saved by legacy list workflows', async () => {
		const ctx = buildContext('list', {
			filters: {
				professionalId: 0,
				serviceId: '0',
				partnerId: 0,
				pipeline_card_id: '0',
				contactId: 0,
				conversationDisplayId: '0',
			},
		});

		await node.execute.call(ctx);

		expect(ctx._mockRequest.mock.calls[0][0]).not.toHaveProperty('qs');
	});

	it('omits optional availability inputs and preserves the strict date string', async () => {
		const ctx = buildContext('availability', {
			professionalId: '3',
			serviceId: 0,
			durationMinutes: 0,
			date: '2026-08-03',
		});

		await node.execute.call(ctx);

		expect(ctx._mockRequest.mock.calls[0][0].qs).toEqual({
			professional_id: '3',
			date: '2026-08-03',
		});
	});

	it('sends the range endpoint its own from/to and omits the single date', async () => {
		const ctx = buildContext('availabilityRange', {
			professionalId: '3',
			serviceId: '7',
			from: '2026-08-03',
			to: '2026-08-09',
			durationMinutes: 0,
		});

		await node.execute.call(ctx);

		expect(ctx._mockRequest.mock.calls[0][0].uri).toContain(
			'/appointments/availability_range',
		);
		expect(ctx._mockRequest.mock.calls[0][0].qs).toEqual({
			professional_id: '3',
			from: '2026-08-03',
			to: '2026-08-09',
			service_id: '7',
		});
	});

	it('offers from/to only on the range operation', () => {
		const from = operationField('from', 'availabilityRange');
		const to = operationField('to', 'availabilityRange');

		expect(from?.required).toBe(true);
		expect(to?.required).toBe(true);
		// O dia único não pode oferecer o intervalo, nem o contrário: são
		// endpoints distintos e misturar os campos manda parâmetro inválido.
		expect(operationField('from', 'availability')).toBeUndefined();
		expect(operationField('date', 'availabilityRange')).toBeUndefined();
	});

	it('sends service and int32 duration together so the backend can validate both', async () => {
		const ctx = buildContext('availability', {
			professionalId: '3',
			serviceId: '7',
			date: '2026-08-03',
			durationMinutes: MAX_INT32,
		});

		await node.execute.call(ctx);

		expect(ctx._mockRequest.mock.calls[0][0].qs).toEqual({
			professional_id: '3',
			date: '2026-08-03',
			service_id: '7',
			duration_minutes: MAX_INT32,
		});
	});

	it('forwards contact-history page and preserves its pagination envelope', async () => {
		const historyProjection = {
			data: [{ id: 42, service: null }],
			meta: { total: 51, current_page: 2, total_pages: 2, per_page: 50 },
		};
		const ctx = buildContext(
			'getContactHistory',
			{ contact_id: '101', page: 2 },
			historyProjection,
		);

		const [result] = await node.execute.call(ctx);

		expect(ctx._mockRequest.mock.calls[0][0]).toEqual(
			expect.objectContaining({
				method: 'GET',
				uri: 'https://chat.example.com/api/v1/accounts/1/contacts/101/appointment_history',
				qs: { page: 2 },
			}),
		);
		expect(result[0].json).toEqual(historyProjection);
		expect((result[0].json.data as any[])[0].service).toBeNull();
	});

	it('passes the detail projection envelope through unchanged', async () => {
		const detailProjection = {
			data: {
				id: 42,
				contact_id: 101,
				professional_id: 3,
				service_id: 7,
				partner_id: null,
				conversation_display_id: null,
				pipeline_card_id: null,
				scheduled_at: '2026-08-03T13:00:00.000Z',
				ends_at: '2026-08-03T14:00:00.000Z',
				status: 'scheduled',
				price_cents: 15000,
				currency: 'BRL',
				cancellation_reason: null,
				public_id: 'APT-42',
				notes: null,
				custom_attributes: {},
				cancelled_at: null,
				created_at: '2026-08-01T12:00:00.000Z',
				updated_at: '2026-08-01T12:00:00.000Z',
				contact: { id: 101, name: 'Maria', email: null, phone_number: null, avatar_url: null },
				professional: { id: 3, name: 'Dra. Silva', specialty: null, color: null },
				service: {
					id: 7,
					name: 'Consulta',
					duration_minutes: 60,
					default_price_cents: 15000,
					currency: 'BRL',
					color: null,
				},
				partner: null,
			},
		};
		const ctx = buildContext('get', { appointmentId: '42' }, detailProjection);

		const [result] = await node.execute.call(ctx);

		expect(result[0].json).toEqual(detailProjection);
		expect(result[0].json.data).not.toHaveProperty('account_id');
		expect(result[0].json.data).not.toHaveProperty('google_event_id');
	});

	it('passes the summary list projection without inventing detail or privileged contact fields', async () => {
		const summaryProjection = {
			data: [
				{
					id: 42,
					contact_id: 101,
					professional_id: 3,
					service_id: 7,
					partner_id: null,
					conversation_display_id: null,
					pipeline_card_id: null,
					scheduled_at: '2026-08-03T13:00:00.000Z',
					ends_at: '2026-08-03T14:00:00.000Z',
					status: 'scheduled',
					price_cents: 15000,
					currency: 'BRL',
					cancellation_reason: null,
					contact: { id: 101, name: 'Maria', avatar_url: null },
					professional: { id: 3, name: 'Dra. Silva', specialty: null, color: null },
					service: {
						id: 7,
						name: 'Consulta',
						duration_minutes: 60,
						default_price_cents: 15000,
						currency: 'BRL',
						color: null,
					},
					partner: null,
				},
			],
			meta: { total_count: 1, current_page: 1, total_pages: 1, per_page: 50 },
		};
		const ctx = buildContext('list', { filters: {} }, summaryProjection);

		const [result] = await node.execute.call(ctx);
		const firstAppointment = (result[0].json.data as any[])[0];

		expect(result[0].json).toEqual(summaryProjection);
		expect(firstAppointment).not.toHaveProperty('notes');
		expect(firstAppointment).not.toHaveProperty('custom_attributes');
		expect(firstAppointment.contact).not.toHaveProperty('email');
		expect(firstAppointment.contact).not.toHaveProperty('phone_number');
	});
});
